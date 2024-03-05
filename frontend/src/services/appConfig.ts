import { SubscriptionType } from "../types/subscription.type";

export interface User {
    email: string;
    _id: string;
    activeSubscription: string;
    customKeys: {
        useOwnKey: boolean
    },
    subscriptionData: {
        maxChatbots :number
        maxChunksPerPage :number
        maxPages :number
        maxTokens :number
        name : SubscriptionType
        type: "MONTHLY" | "YEARLY" | "LIFETIME"
    }
}

export const CurrentUser: any = {
    currentUser: {},
    set(user: User) {
        this.currentUser = user;
    },
    get() {
        return this.currentUser;
    },
};




//Permissions
export interface PermissionsType {
    isOwner?: boolean;
    isAdmin?: boolean;
    isReader?: boolean;
    isEditor?: boolean;
  }
  export interface Permissions {
    permission: PermissionsType;
    set: (value: PermissionsType) => void;
    get: () => PermissionsType;
  }
  export const permissions: Permissions = {
    permission: {} as PermissionsType,
    set(permissions: PermissionsType) {
      this.permission = permissions;
    },
    get(): PermissionsType {
      return {
        isOwner: this.permission.isOwner,
        isAdmin: this.permission.isAdmin,
        isReader: this.permission.isReader,
        isEditor: this.permission.isEditor,
      };
    },
  };
  