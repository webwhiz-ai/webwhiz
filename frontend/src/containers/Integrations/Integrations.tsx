import { Box, Heading, HStack, SimpleGrid, Text, Button, Badge } from '@chakra-ui/react';
import React from 'react';
import { SlackIntegrationIcon } from '../../components/Icons/Integrations/SlackIntegrationIcon';
import ZapierIcon  from '../../components/Icons/Integrations/ZapierIcon';
import { baseURL } from '../../config';

interface IntegrationsProps {
    chatbotId: string
}

const Integrations = ({ chatbotId }: IntegrationsProps) => {
    return (
        <SimpleGrid columns={[1, 1, 1, 2]} spacing={6}>
            <Box
                bg="gray.50"
                p={4}
                borderRadius="lg"
                boxShadow="md"
            >
                <HStack
                    spacing={4}
                    alignItems="start"
                >
                    <Box
                        p={3}
                    >
                        <SlackIntegrationIcon />
                    </Box>
                    <Box width="100%">
                        <Heading fontSize="lg" mb={2}>Slack <Badge ml="8px" fontSize="12px" textTransform="capitalize" fontWeight="500" padding="2px 6px" variant='outline' colorScheme='yellow'>
											Beta
										</Badge></Heading>
                        <Text fontSize="sm" color="gray.600">
                            Connect your WebWhiz chatbot to your Slack workspace,
                            enabling direct access right from within
                            Slack.
                        </Text>
                        <Button
                            variant="solid"
                            size="sm"
                            colorScheme="blue"
                            mt={4}
                            onClick={() => {
                                window.open(`${baseURL}/slack/install?webwhizKbId=${chatbotId}`, '_blank');
                            }}
                        >
                            Add to Slack
                        </Button>
                    </Box>
                </HStack>
            </Box>
            <Box
                bg="gray.50"
                p={4}
                borderRadius="lg"
                boxShadow="md"
            >
                <HStack
                    spacing={4}
                    alignItems="start"
                >
                    <Box
                        p={3}
                    >
                        <ZapierIcon />
                    </Box>
                    <Box width="100%">
                        <Heading fontSize="lg" mb={2}>Zapier <Badge ml="8px" fontSize="12px" textTransform="capitalize" fontWeight="500" padding="2px 6px" variant='outline' colorScheme='yellow'>
											Beta
										</Badge></Heading>
                        <Text fontSize="sm" color="gray.600">
                            Unlock the potential of AI chatbots in your workflow with the WebWhiz and Zapier integration.
                        </Text>
                        <HStack>
                            <a href="https://zapier.com/developer/public-invite/191149/ff8d8edc00c542b4c8c34aabac594b1e/">
                                <Button
                                    variant="solid"
                                    size="sm"
                                    colorScheme="blue"
                                    mt={4}
                                >
                                    Connect with Zapier
                                </Button>
                            </a>
                            
                            <a href="https://www.webwhiz.ai/docs/integrations/zapier-integration/">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    colorScheme="gray"
                                    mt={4}
                                >
                                    View docs
                                </Button>
                            </a>

                        </HStack>
                    </Box>
                </HStack>
            </Box>
        </SimpleGrid>
    )
}

export default Integrations