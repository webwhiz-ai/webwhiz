import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { OfflineMessage } from '../../types/knowledgebase.type'
import { UserIcon } from '../Icons/UserIcon'
import { MailIcon } from '../Icons/MailIcon'

type OfflineMessageWindowProps = {
    offlineChatData: OfflineMessage;
}

export const OfflineMessageWindow = ({ offlineChatData }: OfflineMessageWindowProps) => {
    return (
        <Box
            w="calc(100% - 450px)"
            h="100%"
            overflowX="hidden"
            overflowY="auto"
            position="relative"
            p={8}
        >
            <Box>
                <Flex color="gray.700" align="center" fontSize="sm" mb={3}>
                    <Flex color="gray.400" mr={2}>
                        <UserIcon />
                    </Flex>
                    {offlineChatData.name}
                </Flex>
            </Box>
            <Box>
                <Flex color="gray.700" align="center" fontSize="sm" mb={3}>
                    <Flex color="gray.400" mr={2}>
                        <MailIcon />
                    </Flex>
                    {offlineChatData.email}
                </Flex>
            </Box>
            <Box mt={5}>
                {offlineChatData.message}
            </Box>
        </Box>
    )
}