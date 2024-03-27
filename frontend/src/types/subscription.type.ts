export type SubscriptionType =
    | 'Base'
    | 'Standard'
    | 'Premium'
    | 'Enterprise';

    export type SubscriptionTypeLTD =
    | 'AppSumo tier 1'
    | 'AppSumo tier 2'
    | 'AppSumo tier 3'

export type activeSubscriptionId =
     'BASE_MONTHLY' 
    | 'BASE_YEARLY'
    | 'STANDARD_YEARLY'
    | 'STANDARD_YEARLY'
    | 'PREMIUM_YEARLY'
    | 'PREMIUM_YEARLY'
    | 'ENTERPRISE_YEARLY'
    | 'ENTERPRISE_YEARLY'
    | 'APPSUMO_TIER1'
    | 'APPSUMO_TIER2'
    | 'APPSUMO_TIER3'

export type SubscriptionTier = 'MONTHLY' | 'YEARLY' | 'LIFETIME';

export type PageCount = 100 | 1000 | 2500 | 10000;

export type TokenSize = "400K" | "1M" | "2.5M" | "Unlimited";

export type messageCount = "4K" | "10k" | "25K" | "1M";

export type ProjectCount = 5 | 10 | 100 | "Unlimited";

export type PageCountLTD = 2000 | 5000 | 10000;

export type TokenSizeLTD = "1M" | "2.5M" | "5M";

export type ProjectCountLTD = 20 | 50 | "Unlimited";

export type messageCountLTD = "1k" | "2.5k" | "5K";

export interface SubscriptionData {
    type: SubscriptionType;
    pageCount: PageCount;
    tokenSize: TokenSize;
    projectCount: ProjectCount;
    messagecount: messageCount;

}

export interface SubscriptionDataLTD {
    type: SubscriptionTypeLTD;
    pageCount: PageCountLTD;
    tokenSize: TokenSizeLTD;
    projectCount: ProjectCountLTD;
    messagecount: messageCountLTD;
}

export interface DiscoutData {
    couponCode: string;
    discountPercentage: number;
    countryFlag: string;
    country: string;
}