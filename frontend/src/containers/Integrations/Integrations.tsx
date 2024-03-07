import { Box, Heading, HStack, SimpleGrid, Text, Button } from '@chakra-ui/react';
import React from 'react';
import { SlackIntegrationIcon } from '../../components/Icons/Integrations/SlackIntegrationIcon';
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
            borderRadius="md"
            boxShadow="md"
          >
            <SlackIntegrationIcon />
          </Box>
          <Box width="100%">
            <Heading fontSize="lg" mb={2}>Slack</Heading>
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
    </SimpleGrid>
  )
}

export default Integrations