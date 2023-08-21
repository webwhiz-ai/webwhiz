import { SubscriptionType } from "../types/subscription.type";

export interface User {
    email: string;
    id: number;
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