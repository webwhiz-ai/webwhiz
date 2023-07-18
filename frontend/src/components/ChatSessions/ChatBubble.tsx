import React from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import { markdownTheme } from '../../theme/markdownTheme'

type ChatBubbleProps = {
    message: string;
    type: 'user' | 'bot';
}

export const ChatBubble = ({ message, type }: ChatBubbleProps) => {
    return (
        <Box
            borderRadius="lg"
            p={3}
            minH="42px"
            mb={3}
            fontSize="sm"
            bg={type === 'user' ? 'gray.200' : 'blue.100'}
        >
            {
                type === 'user' ? message :
                    <ReactMarkdown
                        components={ChakraUIRenderer(markdownTheme)}
                        children={message}
                        skipHtml
                    />
            }
        </Box>
    )
}