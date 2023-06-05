import React from 'react'
import { Box, Flex, Spinner } from '@chakra-ui/react'
import { ChatListItem } from './ChatListItem'
import { Paginator } from '../../widgets/Paginator/Paginator'
import { ChatSessionPagination, ChatSession } from '../../types/knowledgebase.type'

type ChatListProps = {
    isChatListLoading: boolean;
    chatSessionsPage: ChatSessionPagination;
    selectedChat: ChatSession;
    onPageChange: (page: number) => void;
    onSelectChat: (chatSession: ChatSession) => void;
}

export const ChatList = ({ isChatListLoading, chatSessionsPage, selectedChat, onPageChange, onSelectChat }: ChatListProps) => {

    return (
        <Box w="450px"
            pos="relative"
        >
            {
                isChatListLoading && <Flex
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

            <Box
                overflowY="auto"
                overflowX="hidden"
                h="calc(100% - 47px)"
                borderRight="1px"
                borderColor="gray.200"
            >
                <Flex direction="column">
                    {
                        chatSessionsPage.results
                            .filter((chatSession: ChatSession) => chatSession.firstMessage)
                            .map((chatSession: ChatSession) => (
                                <ChatListItem
                                    {...console.log('selected', selectedChat)}
                                    key={chatSession._id}
                                    isSelected={selectedChat._id === chatSession._id}
                                    chatSessionData={chatSession}
                                    onSelectChat={() => onSelectChat(chatSession)}
                                />
                            ))
                    }
                </Flex>
            </Box>
            <Box
                bg="white"
                borderTop="1px"
                borderRight="1px"
                borderColor="gray.200"
                justifyContent="center"
            >
                <Paginator onPageChange={onPageChange} pageRangeDisplayed={5} pageCount={chatSessionsPage.pages} />
            </Box>
        </Box >
    )
}