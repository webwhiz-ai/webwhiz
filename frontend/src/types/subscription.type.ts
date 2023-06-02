export type SubscriptionType =
    | 'Base'
    | 'Standard'
    | 'Premium'
    | 'Enterprise';

export type SubscriptionTier = 'MONTHLY' | 'YEARLY';

export type PageCount = 100 | 1000 | 2500 | 10000;

export type TokenSize = "4M" | "10M" | "25M" | "unlimited";

export type ProjectCount = 5 | 10 | 100 | "unlimited";

export interface SubscriptionData {
    type: SubscriptionType;
    pageCount: PageCount;
    tokenSize: TokenSize;
    projectCount: ProjectCount;
}

export interface DiscoutData {
    couponCode: string;
    discountPercentage: number;
    countryFlag: string;
    country: string;
}