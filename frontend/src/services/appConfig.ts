import { SubscriptionType } from "../types/subscription.type";

export interface User {
    email: string;
    id: number;
    activeSubscription: string;
    subscriptionData: {
        maxChatbots :number
        maxChunksPerPage :number
        maxPages :number
        maxTokens :number
        name : SubscriptionType
        type: "MONTHLY"
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