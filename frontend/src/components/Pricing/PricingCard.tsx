import {
    Box,
    Button,
    Flex,
    Heading,
    Link, List,
    ListIcon,
    ListItem,
    Text
} from '@chakra-ui/react';
import React from 'react';
import { DiscoutData, SubscriptionData, SubscriptionDataLTD, SubscriptionTier, SubscriptionType, SubscriptionTypeLTD } from '../../types/subscription.type';
import { CheckCircleBlueIconMd } from '../Icons/CheckCircleBlueIconMd';

type PricingCardProps = {
    tier: SubscriptionTier;
    discountData?: DiscoutData;
    subscriptionData: SubscriptionData | SubscriptionDataLTD;
    isCurrentSubscription: boolean;
    userEmail: string;
    isPopular?: boolean;
    showPricingBtn?: boolean;
}

const BASE_MONTHLY_PRICING = 19;
const BASE_YEARLY_PRICING = 16;
const STANDARD_MONTHLY_PRICING = 49;
const STANDARD_YEARLY_PRICING = 41;
const PREMIUM_MONTHLY_PRICING = 99;
const PREMIUM_YEARLY_PRICING = 82;
const ENTERPRISE_MONTHLY_PRICING = 349;
const ENTERPRISE_YEARLY_PRICING = 291;

const LIFETIME_PLAN1_PRICING = 59;
const LIFETIME_PLAN2_PRICING = 118;
const LIFETIME_PLAN3_PRICING = 177;

export const PricingCard = ({
    tier,
    discountData,
    subscriptionData,
    isCurrentSubscription,
    userEmail,
    isPopular,
    showPricingBtn = true
}: PricingCardProps) => {

    const getPricingMarkup = React.useCallback((type: SubscriptionType | SubscriptionTypeLTD) => {

        let ltdPrice = 0;
        switch (type) {
            case 'AppSumo tier 1':
                ltdPrice = LIFETIME_PLAN1_PRICING;
                break;
            case 'AppSumo tier 2':
                ltdPrice = LIFETIME_PLAN2_PRICING;
                break;
            case 'AppSumo tier 3':
                ltdPrice = LIFETIME_PLAN3_PRICING;
                break;
        }
        if(type === 'AppSumo tier 1' || type === 'AppSumo tier 2'  || type === 'AppSumo tier 3' ) {
            return <Flex align="baseline">
                <Text fontSize="5xl" fontWeight="600">
                    {ltdPrice}
                </Text>
                <Text ml={2}>/lifetime</Text>
            </Flex>
        }

        let basePrice = 0;
        if (tier === 'YEARLY') {
            switch (type) {
                case 'Base':
                    basePrice = BASE_YEARLY_PRICING;
                    break;
                case 'Standard':
                    basePrice = STANDARD_YEARLY_PRICING;
                    break;
                case 'Premium':
                    basePrice = PREMIUM_YEARLY_PRICING;
                    break;
                case 'Enterprise':
                    basePrice = ENTERPRISE_YEARLY_PRICING;
                    break;
            }
        } else {
            switch (type) {
                case 'Base':
                    basePrice = BASE_MONTHLY_PRICING;
                    break;
                case 'Standard':
                    basePrice = STANDARD_MONTHLY_PRICING;
                    break;
                case 'Premium':
                    basePrice = PREMIUM_MONTHLY_PRICING;
                    break;
                case 'Enterprise':
                    basePrice = ENTERPRISE_MONTHLY_PRICING;
                    break;
            }
        }
        let price = (tier === 'YEARLY') ?
            getDiscountedPrice(basePrice, discountData?.discountPercentage || 0) :
            getDiscountedPrice(basePrice, 0);
        let priceRounded = Math.ceil(price);
        return <Flex align="baseline">
            <Text fontSize="5xl" fontWeight="600">
                {`$${priceRounded}`}
            </Text>
            <Text ml={2}>/mo</Text>
        </Flex>
    }, [discountData, tier]);

    const getPaymentLink = React.useCallback(() => {
        const subscriptionLinks = {
            Standard: {
                YEARLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/07f55c4e-19ff-47e5-b2d0-6fad6a0172fa?checkout[email]=${userEmail}${discountData?.couponCode ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`,
                MONTHLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/40a6cfdf-60b5-402f-a071-5ff008834838?checkout[email]=${userEmail}${discountData?.couponCode && false ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`
            },
            Premium: {
                YEARLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/521d2310-353e-4b93-b15e-5bda78c0fa74?checkout[email]=${userEmail}${discountData?.couponCode ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`,
                MONTHLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/2c16a858-6699-4aae-b6e7-55da6797f975?checkout[email]=${userEmail}${discountData?.couponCode && false ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`
            },
            Base: {
                YEARLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/70ec6666-18ba-4ebf-9c10-c851ab7531e5?checkout[email]=${userEmail}${discountData?.couponCode ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`,
                MONTHLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/11c44a3d-7223-45b0-97d3-75d921150f67?checkout[email]=${userEmail}${discountData?.couponCode && false ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`
            },
            Enterprise: {
                YEARLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/71a30d03-079d-43b7-9b59-76c3c5e378e1?checkout[email]=${userEmail}${discountData?.couponCode ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`,
                MONTHLY: `https://webwhiz.lemonsqueezy.com/checkout/buy/817141ba-5ce0-4c70-bfd1-223dc8a8b30b?checkout[email]=${userEmail}${discountData?.couponCode && false ? `&checkout[discount_code]=${discountData?.couponCode}` : ''}`
            }
        };

        return subscriptionLinks[subscriptionData.type][tier];
    }, [discountData?.couponCode, subscriptionData.type, tier, userEmail]);

    const getPricingBtn = React.useCallback(() => {
        if(!showPricingBtn) return null;
        return <Box mt={6}>
            <Link
                href={(getPaymentLink())}
                isExternal
            >
                <Button
                    variant="solid"
                    colorScheme={isPopular ? "white" : "blue"}
                    background={isPopular ? "white" : "blue.500"}
                    color={isPopular ? "blue.500" : "white"}
                    w="100%"
                >
                    {isCurrentSubscription ? 'Current Plan' : 'Subscribe Now'}
                </Button>
            </Link>
        </Box>
    }, [getPaymentLink, isCurrentSubscription, isPopular, showPricingBtn])

    const getDiscountedPrice = (basePrice: number, discount: number = 0) => {
        return basePrice - (basePrice * discount) / 100;
    };

    return (
        <Box
            flex={1}
            h="100%"
            borderRadius='2xl'
            borderColor="blue" 
            py={10}
            bg={isPopular ? "blue.500" : "white"}
            borderWidth={!isPopular ? "2px" : "0px"}
            color={isPopular ? "white" : "black"}
            px={7}
        >
            <Text fontSize="lg" mb={5} fontWeight="400">
                {subscriptionData.type}
            </Text>
            <Flex mb={4}>
                {getPricingMarkup(subscriptionData.type)}
            </Flex>

            <List spacing={3}>
                <ListItem>
                    <ListIcon boxSize={22} as={CheckCircleBlueIconMd} color={isPopular ? "white" : "blue.500"} />
                    {subscriptionData.pageCount} pages
				</ListItem>
                <ListItem whiteSpace="nowrap">
                    <ListIcon boxSize={22} as={CheckCircleBlueIconMd} color={isPopular ? "white" : "blue.500"} />
                    {subscriptionData.messageCount} messages/mo
				</ListItem>
                <ListItem>
                    <ListIcon boxSize={22} as={CheckCircleBlueIconMd} color={isPopular ? "white" : "blue.500"} />
                    {subscriptionData.projectCount} projects
				</ListItem>
            </List>
            {getPricingBtn()}
        </Box>
    )
}