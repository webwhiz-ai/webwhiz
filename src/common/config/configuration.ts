import { Subscription } from '../../user/user.schema';

interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  host: string;
  port: number;
  secretKey: string;
  encryptionKey: string;
  mongoUri: string;
  mongoDbName: string;
  redisHost?: string;
  redisPort?: number;
  redisUrl?: string;
  openaiKey: string;
  openaiKey2: string;
  googleClientId: string;
  lemonSqueezyApiKey: string;
  lemonSqueezySignSecret: string;
  sendGridApiKey: string;
  docStorageLocation: string;
  textractServiceUrl: string;
  defaultSubscription: Subscription;
  senderEmail: string;
  senderName: string;
  clientUrl: string;
  // Postgres config
  postgresHost: string;
  postgresPort: number;
  postgresUser: string;
  postgresPassword: string;
  postgresDbName: string;
}

const config = (): AppConfig => ({
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  host: process.env.HOST || '127.0.0.1',
  port: parseInt(process.env.PORT as string, 10) || 8000,
  secretKey: process.env.SECRET_KEY || 'secret',
  encryptionKey:
    process.env.ENC_KEY ||
    '4b23f673b133b01777259525a4a1c2097fe309048db6593462312d5c35679ced',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGO_DBNAME || 'sitemine',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
  redisUrl: process.env.REDIS_URL,
  openaiKey: process.env.OPENAI_KEY || '',
  openaiKey2: process.env.OPENAI_KEY_2 || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  lemonSqueezyApiKey: process.env.LEMON_SQUEEZY_API_KEY || '',
  lemonSqueezySignSecret: process.env.LEMON_SQUEEZY_SIGN_SECRET || '',
  sendGridApiKey: process.env.SENDGRID_API_KEY || '',
  docStorageLocation: process.env.DOC_STORAGE_LOCATION || '../storage',
  textractServiceUrl:
    process.env.TEXTRACT_URL || 'http://localhost:8080/textract',
  defaultSubscription:
    Subscription[process.env.DEFAULT_SUBSCRIPTION] || Subscription.FREE,
  senderEmail: process.env.EMAIL_SENDER_EMAIL || 'hi@webwhiz.ai',
  senderName: process.env.EMAIL_SENDER_NAME || 'WebWhiz.ai',
  clientUrl: process.env.CLIENT_URL || 'https://app.webwhiz.ai',
  postgresHost: process.env.POSTGRES_HOST || '127.0.0.1',
  postgresPort: parseInt(process.env.POSTGRES_PORT as string, 10) || 5432,
  postgresUser: process.env.POSTGRES_USER || 'postgres',
  postgresPassword: process.env.POSTGRES_PASSWORD || 'password',
  postgresDbName: process.env.POSTGRES_DBNAME || 'sitemine',
});

export { AppConfig };
export default config;
