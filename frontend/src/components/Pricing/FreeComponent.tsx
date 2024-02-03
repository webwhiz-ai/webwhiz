import React from 'react'
import {
    Badge,
    Box,
    Flex,
    Heading,
    HStack,
    Button,
    Tab,
    TabIndicator,
    TabList,
    Tabs,
    Text
} from '@chakra-ui/react'
import { User } from '../../services/appConfig'
import { DiscoutData, SubscriptionTier, SubscriptionType, activeSubscriptionId } from '../../types/subscription.type'
import { PricingCard } from './PricingCard'

type FreeComponentProps = {
    currentSubscription: User["subscriptionData"];
    discountData?: DiscoutData
    userEmail: string;
    activeSubscriptionId: activeSubscriptionId;
}

export const FreeComponent = ({ currentSubscription, discountData, userEmail,  activeSubscriptionId}: FreeComponentProps) => {
    const [subscriptionTier, setSubscriptionTier] = React.useState<SubscriptionTier>('MONTHLY');

    const isCurrentPlan = React.useCallback((type: SubscriptionType) => {
        return currentSubscription?.name === type;
    }, [currentSubscription]);
    

    const onChangeTier = React.useCallback(
        (tier: number) => {
            if (tier === 0) {
                setSubscriptionTier('MONTHLY');
            } else {
                setSubscriptionTier('YEARLY');
            }
        }, []
    );

    const getLTDPricingCrrd = React.useCallback((type: activeSubscriptionId) => {
        if(type === 'APPSUMO_TIER1') {
            return  <PricingCard
                showPricingBtn={false}
                tier={'LIFETIME'}
                subscriptionData={{
                    type: 'AppSumo tier 1',
                    pageCount: 2000,
                    tokenSize: '1M',
                    projectCount: 20
                }}
                discountData={discountData}
                isCurrentSubscription={isCurrentPlan('Base')}
                userEmail={userEmail}
            />
        } else if(type === 'APPSUMO_TIER2') {
            return  <PricingCard
                showPricingBtn={false}
                tier={'LIFETIME'}
                subscriptionData={{
                    type: 'AppSumo tier 2',
                    pageCount: 5000,
                    tokenSize: '2.5M',
                    projectCount: 50
                }}
                discountData={discountData}
                isCurrentSubscription={isCurrentPlan('Base')}
                userEmail={userEmail}
            />
        } else if(type === 'APPSUMO_TIER3') {
            return  <PricingCard
                showPricingBtn={false}
                tier={'LIFETIME'}
                subscriptionData={{
                    type: 'AppSumo tier 3',
                    pageCount: 10000,
                    tokenSize: '5M',
                    projectCount: 'Unlimited'
                }}
                discountData={discountData}
                isCurrentSubscription={isCurrentPlan('Base')}
                userEmail={userEmail}
            />
        }
    }, [discountData, isCurrentPlan, userEmail]);

    const getPricingBlockLTD = React.useCallback(() => {
        if(currentSubscription?.type === 'LIFETIME') {
            return <Box minW="1088px" p={8} pt={12} backgroundColor="white" boxShadow="sm" borderRadius="md" mb="6" pb={12}>
                <Flex direction="column" alignItems="center">
                        <Heading mb={5}>
                            Current plan
                        </Heading>
                        <Text textAlign="center" color="gray.600" fontSize="xl" mb={6}>
                            You are on a lifetime plan purchased from AppSumo.
                        </Text>
                    <Flex direction="column" maxW="300px" minW={"300px"}>
                        
                        {getLTDPricingCrrd(activeSubscriptionId)}
                    </Flex>
                </Flex>
            </Box>
        }
        return null
        
    }, [activeSubscriptionId, currentSubscription?.type, getLTDPricingCrrd]);

    const manageSubscription = React.useCallback(() => {
        if(currentSubscription?.type !== 'LIFETIME' && currentSubscription?.name !== 'FREE' && currentSubscription?.name !== 'Self Hosted') {
            return <Flex justifyContent="center" w="100%" p={8} pt={12} backgroundColor="white" boxShadow="sm" borderRadius="md" mb="6" pb={12}>
                <Flex direction="column" alignItems="center" maxW="xl">
                        <Heading mb={5}>
                            Manage Subscription
                        </Heading>
                        <Text textAlign="center" color="gray.600" fontSize="xl" mb={6}>
                            You can manage your subscriptions and payment methods, view payment history and download invoices by visiting the billing portal.
                        </Text>
                        <a href="https://webwhiz.lemonsqueezy.com/billing" target="_blank" rel="noreferrer">
                            <Button
                                variant="solid"
                                colorScheme={"blue"}
                                background={"blue.500"}
                                color={"white"}
                                w="100%"
                            >
                                Visit Billing Portal
                            </Button>
                        </a>
                </Flex>
            </Flex>
        }
        return null
    }, [currentSubscription?.name, currentSubscription?.type]);

    return (
        <>
            {
                manageSubscription()
            }
            {
                getPricingBlockLTD()
            }
            <Box minW="1088px" p={8} pt={12} pb={1} backgroundColor="white" boxShadow="sm" borderRadius="md">
                <Flex justify="center" mb={12}>
                    <Flex
                        direction="column"
                        align="center"
                        maxW="xl"
                    >
                        <Heading mb={5}>
                            Pricing
                        </Heading>
                        <Text textAlign="center" color="gray.600" fontSize="xl" mb={6}>
                            WebWhiz is free and open source, but you can choose the cloud-based solution where we handle everything from hosting to support.
                        </Text>
                        <Flex pos="relative">
                            <Tabs
                                variant="unstyled"
                                onChange={(index) => onChangeTier(index)}
                            >
                                <TabList
                                    bg="blue.50"
                                    h="38px"
                                    borderRadius="96px"
                                    alignItems="center"
                                    justifyContent="center"
                                    width="252px"
                                >
                                    <Tab
                                        fontSize="sm"
                                        px={3}
                                        lineHeight={1}
                                        _selected={{ zIndex: 2 }}
                                        _focus={{ outline: "none" }}
                                    >
                                        Monthly
                                    </Tab>
                                    <Tab
                                        px={3}
                                        _selected={{ zIndex: 2 }}
                                        lineHeight={1}
                                        _focus={{ outline: "none" }}
                                    >
                                        <Flex align="baseline">
                                            <Text fontSize="sm" mr={1}>
                                                Annually
                                            </Text>
                                            <Text fontSize="xs" color="blue.500" fontWeight="400">
                                                2 months free
                                            </Text>
                                        </Flex>
                                    </Tab>
                                </TabList>
                                <TabIndicator
                                    height="28px"
                                    bg="white"
                                    shadow="sm"
                                    transform="translateY(-50%)"
                                    top="50%"
                                    borderRadius="96px"
                                />
                            </Tabs>
                        </Flex>
                    </Flex>
                </Flex>
                <Flex>
                    <HStack w="100%" spacing={4}>
                        <PricingCard
                            tier={subscriptionTier}
                            subscriptionData={{
                                type: 'Base',
                                pageCount: 100,
                                tokenSize: '400K',
                                projectCount: 5
                            }}
                            discountData={discountData}
                            isCurrentSubscription={isCurrentPlan('Base')}
                            userEmail={userEmail}
                        />
                        <PricingCard
                            tier={subscriptionTier}
                            subscriptionData={{
                                type: 'Standard',
                                pageCount: 1000,
                                tokenSize: '1M',
                                projectCount: 10
                            }}
                            discountData={discountData}
                            isCurrentSubscription={isCurrentPlan('Standard')}
                            userEmail={userEmail}
                        />
                        <PricingCard
                            tier={subscriptionTier}
                            subscriptionData={{
                                type: 'Premium',
                                pageCount: 2500,
                                tokenSize: '2.5M',
                                projectCount: 100
                            }}
                            discountData={discountData}
                            isCurrentSubscription={isCurrentPlan('Premium')}
                            userEmail={userEmail}
                            isPopular
                        />
                        <PricingCard
                            tier={subscriptionTier}
                            subscriptionData={{
                                type: 'Enterprise',
                                pageCount: 10000,
                                tokenSize: 'Unlimited',
                                projectCount: 'Unlimited'
                            }}
                            discountData={discountData}
                            isCurrentSubscription={isCurrentPlan('Enterprise')}
                            userEmail={userEmail}
                        />
                    </HStack>
                </Flex>
                <Flex
                    mt={8}
                    mb={12}
                    w="100%"
                    justifyContent="center"
                >
                    <Flex>
                        {
                            discountData?.couponCode ?
                                <Box
                                    border="2px"
                                    borderColor="blue.500"
                                    borderRadius="xl"
                                    px={6}
                                    py={5}
                                    color="blue.500"
                                >
                                    {discountData?.countryFlag} Special Pricing for {discountData?.country
                                    } - {discountData?.discountPercentage}% off on all annual plans
                                </Box> : null
                        }
                    </Flex>
                </Flex>
            </Box>
        </>
    )
}