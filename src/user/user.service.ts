import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { Collection, Db, ObjectId } from 'mongodb';
import { GoogleUserProfile } from '../auth/google-auth';
import { AppConfigService } from '../common/config/appConfig.service';
import { MONGODB } from '../common/mongo/mongo.module';
import { SubscriptionPlanInfoService } from '../subscription/subscription-plan.service';
import { CreateUserDTO } from './user.dto';
import {
  Subscription,
  SubscriptionData,
  User,
  UserProfile,
  UserSparse,
  USER_COLLECTION,
} from './user.schema';

/**
 * Sanitise user objcect from sensitive info
 * @param user
 * @returns
 */
function sanitizeUser<T>(user: T): Exclude<T, 'password'> {
  if ((user as any)?.password) (user as any).password = undefined;
  return user as any;
}

@Injectable()
export class UserService {
  private readonly userCollection: Collection<User>;

  constructor(
    private appConfig: AppConfigService,
    @Inject(MONGODB) private db: Db,
    private subsPlanService: SubscriptionPlanInfoService,
  ) {
    this.userCollection = this.db.collection<User>(USER_COLLECTION);
  }

  /**
   * Get user by emailId
   * @param email
   * @returns
   */
  async getUserByEmail(email: string) {
    const user = await this.userCollection.findOne({ email });
    return sanitizeUser(user);
  }

  /**
   * Find user by id
   * @param id
   * @returns
   */
  async findUserByIdSparse(id: string): Promise<UserSparse> {
    const user: UserSparse = await this.userCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 1, email: 1, activeSubscription: 1 } },
    );
    return sanitizeUser(user);
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userCollection.findOne({
      _id: new ObjectId(id),
    });
    return sanitizeUser(user);
  }

  /**
   * Find user by email, password
   * @param email
   * @param password
   * @returns
   */
  async findByEmailPassword(
    email: string,
    password: string,
  ): Promise<UserSparse> {
    const user: Pick<
      User,
      '_id' | 'email' | 'password' | 'activeSubscription'
    > = await this.userCollection.findOne(
      { email },
      { projection: { _id: 1, email: 1, password: 1 } },
    );
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordMatches = await compare(password, user.password);
    if (!isPasswordMatches) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return sanitizeUser(user);
  }

  async updateLastLoginTs(user: UserSparse) {
    await this.userCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );
  }

  async createGoogleOAuthUser(userData: GoogleUserProfile) {
    const { email, name, picture, locale } = userData;
    const ts = new Date();
    const user: User = {
      email,
      name,
      avatarUrl: picture,
      locale,
      activeSubscription: this.appConfig.get('defaultSubscription'),
      createdAt: ts,
      updatedAt: ts,
    };

    const res = await this.userCollection.insertOne(user);

    return sanitizeUser({
      _id: res.insertedId,
      ...user,
    });
  }

  /**
   * Create a new user
   * @param data
   * @returns
   */
  async createUser(data: CreateUserDTO) {
    // Validate password (if present)
    if (
      data.password === undefined ||
      // data.password.length < 8 ||
      data.password !== data.confirmPassword
    ) {
      throw new HttpException('Invalid Password', HttpStatus.BAD_REQUEST);
    } else {
      data.password = await hash(data.password, 10);
    }

    // Check if email already exists
    const user = await this.getUserByEmail(data.email);
    if (user) {
      throw new HttpException(
        'User with email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ts = new Date();

    const userData: User = {
      email: data.email,
      password: data.password,
      name: data.name,
      avatarUrl: data.avatarUrl,
      activeSubscription: this.appConfig.get('defaultSubscription'),
      createdAt: ts,
      updatedAt: ts,
    };

    const res = await this.userCollection.insertOne(userData);

    return sanitizeUser({
      _id: res.insertedId,
      ...userData,
    });
  }

  /**
   * Get user profile
   * @param user
   * @returns
   */
  async getUserProfile(user: UserSparse) {
    const userData: UserProfile = await this.userCollection.findOne(
      { _id: user._id },
      {
        projection: {
          email: 1,
          name: 1,
          avatarUrl: 1,
          monthUsage: 1,
          activeSubscription: 1,
        },
      },
    );

    // Modify the month usage to reflect the current month even if in the db
    // its of a previous month (basically no usage in the current month)
    const currentMonth = `${
      new Date().getMonth() + 1
    }/${new Date().getFullYear()}`;
    if (
      userData?.monthUsage?.month === undefined ||
      userData?.monthUsage?.month !== currentMonth
    ) {
      if (userData.monthUsage === undefined) {
        userData.monthUsage = { month: '', count: 0 };
      }
      userData.monthUsage.month = currentMonth;
      userData.monthUsage.count = 0;
    }

    const subscriptionData = this.subsPlanService.getSubscriptionPlanInfo(
      user.activeSubscription,
    );

    return { ...userData, subscriptionData };
  }

  /** **************************************************
   * SUBSCRIPTION RELATED
   *************************************************** */

  async setUserSubscription(
    email: string,
    subscription: Subscription,
    payload?: SubscriptionData,
  ) {
    const update = {
      activeSubscription: subscription,
      updatedAt: new Date(),
    };
    if (payload) {
      update['subscriptionData'] = payload;
    }

    // TODO: If the user is not present then we need to create
    // TODO: We will need to send email to user with password since this user won't have a password
    await this.userCollection.updateOne(
      { email },
      {
        $set: update,
      },
    );
  }

  async setUserWhitelabelSettings(
    email: string,
    whitelabelSettings: User['whitelabelling'],
  ) {
    const update: Partial<User> = {
      whitelabelling: whitelabelSettings,
      updatedAt: new Date(),
    };

    await this.userCollection.updateOne({ email }, { $set: update });
  }

  async getUserWhitelabelSettings(
    userId: ObjectId,
  ): Promise<Pick<User, 'whitelabelling'>> {
    const res = await this.userCollection.findOne(
      { _id: userId },
      { projection: { whitelabelling: 1 } },
    );
    return res;
  }

  async setUserCustomKeys(id: ObjectId, keys: string[]) {
    const update: Partial<User> = {
      customKeys: keys,
      updatedAt: new Date(),
    };

    await this.userCollection.updateOne({ _id: id }, { $set: update });
  }

  /** **************************************************
   * CHATBOT MONTHLY USAGE RELATED
   *************************************************** */

  async getUserMonthlyUsageData(
    userId: ObjectId,
  ): Promise<Pick<User, 'monthUsage' | 'tokenCredits' | 'activeSubscription'>> {
    const usageData = await this.userCollection.findOne(
      { _id: userId },
      { projection: { monthUsage: 1, tokenCredits: 1, activeSubscription: 1 } },
    );

    return usageData;
  }

  async updateMonthlyUsageByN(userId: ObjectId, n: number) {
    await this.userCollection.updateOne({ _id: userId }, [
      {
        $set: {
          monthUsage: {
            $cond: {
              if: {
                $eq: [
                  '$monthUsage.month',
                  {
                    $concat: [
                      {
                        $toString: new Date().getMonth() + 1,
                      },
                      '/',
                      {
                        $toString: new Date().getFullYear(),
                      },
                    ],
                  },
                ],
              },
              then: {
                month: '$monthUsage.month',
                count: { $add: ['$monthUsage.count', n] },
              },
              else: {
                month: {
                  $concat: [
                    {
                      $toString: new Date().getMonth() + 1,
                    },
                    '/',
                    {
                      $toString: new Date().getFullYear(),
                    },
                  ],
                },
                count: n,
              },
            },
          },
        },
      },
    ]);
  }
}
