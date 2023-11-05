import { Box, Flex, Heading, VStack } from '@chakra-ui/react'
import React from 'react'
import { ChatList } from '../../components/ChatSessions/ChatList'
import { ChatWindow } from '../../components/ChatSessions/ChatWindow'
import { NoDataChatSessions } from '../../components/Icons/noData/NoDataChatSessions'
import { ChatSession, ChatSessionDetail, ChatSessionPagination } from '../../types/knowledgebase.type'

type ChatSessionsProps = {
    isChatListLoading: boolean;
    chatSessionsPage: ChatSessionPagination;
    onPageChange: (page: number) => void;
    selectedChat: ChatSession;
    setSelectedChat: (selectedChat: ChatSession) => void
    chatDetail: ChatSessionDetail;
    updateChatSessionReadStatus: (chatId: string, isUnread: boolean) =>void
    isChatLoading?: boolean
    onDeleteChat: (chatId: string) => void


}

export const ChatSessionsNew = ({
    isChatListLoading,
    chatSessionsPage,
    onPageChange,
    onDeleteChat,
    selectedChat,
    setSelectedChat,
    chatDetail,
    updateChatSessionReadStatus,
    isChatLoading
}: ChatSessionsProps) => {
    if (!chatSessionsPage.results.length) {
        return (
            <VStack
                alignItems="center"
                direction="column"
                justifyContent="center"
                w="100%"
                h="100%"
                pt={32}
                pb={32}
                spacing={9}
            >
                <NoDataChatSessions />
                <Box textAlign="center">
                    <Heading
                        maxW="580px"
                        fontSize="xl"
                        fontWeight="500"
                        as="h3"
                        mb={4}
                        color="gray.500"
                        lineHeight="medium"
                        textAlign="center"
                    >
                        Chat history with your customers will appear here.
                     </Heading>
                </Box>
            </VStack>
        )
    }

    return (
        <Flex w="100%">
            <ChatList
                isChatListLoading={isChatListLoading}
                chatSessionsPage={chatSessionsPage}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                onPageChange={onPageChange}
                updateChatSessionReadStatus={updateChatSessionReadStatus}
                onDeleteChat={onDeleteChat}
            />
            <ChatWindow chatData={chatDetail} userData={chatDetail?.userData} messages={chatDetail?.messages} isMessagesLoading={isChatLoading} />
        </Flex>
    )
}