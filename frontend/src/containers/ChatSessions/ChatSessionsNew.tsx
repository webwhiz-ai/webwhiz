import { Box, Flex, Heading, VStack } from '@chakra-ui/react'
import React, { useEffect, useCallback } from 'react'
import { ChatList } from '../../components/ChatSessions/ChatList'
import { ChatWindow } from '../../components/ChatSessions/ChatWindow'
import { NoDataChatSessions } from '../../components/Icons/noData/NoDataChatSessions'
import { useConfirmation } from '../../providers/providers'
import { deleteChatSession, getChatSessionDetails, getChatSessions, readChatSession, unReadChatSession } from '../../services/knowledgebaseService'
import { ChatSession, ChatSessionDetail, ChatSessionPagination } from '../../types/knowledgebase.type'


export type ChatSessionsProps = {
    chatbotId: string
}

export const ChatSessionsNew = ({ chatbotId }: ChatSessionsProps) => {
    const [chatSessions, setChatSessions] = React.useState<ChatSessionPagination>();
    const [isChatLoading, setIsChatLoading] = React.useState<boolean>(false);
    const { showConfirmation } = useConfirmation()
    const [selectedChat, setSelectedChat] = React.useState<ChatSession>();
    const [chatData, setChatData] = React.useState<ChatSessionDetail>();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getChatSessions(chatbotId, '1');
                setChatSessions(response.data);
                setSelectedChat(response.data.results.find((chatSession) => chatSession.firstMessage) || response.data.results[0])
            } catch (error) {
                console.log("Unable to fetch chatSessions", error);
            } finally {
            }

        }
        fetchData();
    }, [chatbotId]);


    const handlePageClick = React.useCallback(async (selectedPage: number) => {
        try {
            setIsChatLoading(true);
            const response = await getChatSessions(chatbotId, (selectedPage + 1).toString());
            setChatSessions(response.data);
            setSelectedChat(response.data.results.find((chatSession) => chatSession.firstMessage) || response.data.results[0])
        } catch (error) {
            console.log("Unable to fetch chatSessions", error);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatbotId]);

    const updateChatSessionReadStatus = useCallback(async (chatId: string, isUnread: boolean) => {
        try {
            // Toggle read/unread based on isUnread flag
            await (isUnread ? unReadChatSession : readChatSession)(chatId);
            if (chatSessions) {
                const updatedResults = chatSessions.results.map(item =>
                    item._id === chatId ? { ...item, isUnread } : item
                );
                setChatSessions((prev) => {
                    if (!prev) return undefined;
                    return { ...prev, results: updatedResults };
                });
            }
        } catch (error) {
            console.log("Unable to update chatSessions", error);
        }
    }, [chatSessions, setChatSessions]);


    React.useEffect(() => {
        let ignore = false;
        async function fetchData() {
            if (!selectedChat) return;
            setIsChatLoading(true);
            try {
                const response = await getChatSessionDetails(selectedChat._id);
                if (selectedChat.isUnread) {
                    updateChatSessionReadStatus(selectedChat._id, false)
                }
                if (!ignore) setChatData(response.data);
            } catch (error) {
                console.log("Unable to fetch deals", error);
            } finally {
                setIsChatLoading(false);
            }
        }
        fetchData();
        return () => { ignore = true };
    }, [selectedChat]);

    const onDeleteChat = useCallback(async (chatId: string) => {
        try {
            await deleteChatSession(chatId);
            if (chatSessions) {
                const updatedResults = chatSessions.results.filter(item => item._id !== chatId);
                if (updatedResults.length === 0) {
                    handlePageClick(0)
                } else {
                    setChatSessions({ ...chatSessions, results: updatedResults });
                }
            }
        } catch (error) {
            console.log("Unable to delete chatSessions", error);
        }
    }, [chatSessions, setChatSessions])


    const handleSelectChat = React.useCallback((chatSession: ChatSession) => {
        setSelectedChat(chatSession);
    }, []);


    if (!chatSessions?.results.length) {
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

    if (!chatSessions || !selectedChat) {
        return null
    }
    return (
        <Flex w="100%">
            <ChatList
                isChatListLoading={isChatLoading}
                chatSessionsPage={chatSessions}
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                onPageChange={handlePageClick}
                updateChatSessionReadStatus={updateChatSessionReadStatus}
                onDeleteChat={(chatId) => {
                    showConfirmation(true, {
                        title: 'Delete Chat',
                        content: 'Are you sure you want to delete this chat?',
                        confirmButtonText: 'Delete',
                        onClose: () => showConfirmation(false),
                        onConfirm: () => {
                            onDeleteChat(chatId);
                            showConfirmation(false)
                        },
                    })
                }}

            />
            <ChatWindow chatData={chatData} userData={chatData?.userData} messages={chatData?.messages} isMessagesLoading={isChatLoading} />
        </Flex>
    )
}