import React from 'react'
import { Box, Spinner, Flex } from '@chakra-ui/react'
import { MessageList } from '../../types/knowledgebase.type'
import { ChatBubble } from './ChatBubble'

type ChatWindowProps = {
    messages?: MessageList[];
    isMessagesLoading?: boolean;
}

export const ChatWindow = ({ messages, isMessagesLoading }: ChatWindowProps) => {
    return (
        <Box
            w="calc(100% - 450px)"
            h="100%"
            overflowX="hidden"
            maxW="620px"
            overflowY="auto"
            position="relative"
            p={4}
        >
            {
                isMessagesLoading && <Flex
                    pos="absolute"
                    align="center"
                    justify="center"
                    top={0}
                    bottom={0}
                    right={0}
                    left={0}
                    bg="whiteAlpha.700"
                >
                    <Spinner />
                </Flex>
            }
            {
                messages && messages.map((message) => {
                    return <Box key={message.ts.toString()}>
                        <ChatBubble message={message.q} type={'user'} />
                        <ChatBubble message={message.a} type={'bot'} />
                    </Box>
                })
            }
        </Box>
    )
}