import { Box, Flex, Heading, VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { ChatList } from '../../components/ChatSessions/ChatList'
import { ChatWindow } from '../../components/ChatSessions/ChatWindow'
import { NoDataChatSessions } from '../../components/Icons/noData/NoDataChatSessions'
import { useConfirmation } from '../../providers/providers'
import { deleteChatSession, getChatSessionDetails, getChatSessions, readChatSession, unReadChatSession } from '../../services/knowledgebaseService'
import socketService from '../../services/SocketService'
import { ChatSession, ChatSessionDetail, ChatSessionPagination } from '../../types/knowledgebase.type'

export type ChatSessionsProps = {
    chatbotId: string
    userId: string
}

interface IChatEmitData { msg: string; sessionId: string; sender: 'admin' | 'user' }

export const ChatSessionsNew = ({ chatbotId, userId }: ChatSessionsProps) => {
    const history = useHistory()
    const { search } = useLocation();
    const { showConfirmation } = useConfirmation()
    
    const [chatSessions, setChatSessions] = React.useState<ChatSessionPagination>();
    const [chatData, setChatData] = React.useState<ChatSessionDetail>();
    const [isChatLoading, setIsChatLoading] = React.useState<boolean>(false);
   
    const sessionId = new URLSearchParams(search).get("session") || ''

    const handleSelectChat = useCallback((chatSession: ChatSession) => {
        history.replace(`/app/edit-chatbot/${chatbotId}/chat-sessions?session=${chatSession?._id}`)
    }, [chatbotId, history]);

    const addManualMessage = useCallback((chatData: ChatSessionDetail, data: IChatEmitData) => {
        const newMessage = { type: 'MANUAL', ...data, ts: new Date() } as any;
        const updatedChatData = {
            ...chatData,
            messages: chatData.messages ? [...chatData.messages, newMessage] : [newMessage],
        };
        return updatedChatData;
    }, []);

    const sendReplyToUser = useCallback((sessionId: string, msg: string) => {
        if (chatData) {
            const updatedChatData = addManualMessage(chatData, { msg: msg, sessionId, sender: 'admin' });
            setChatData(updatedChatData);
        }
        const socket = socketService.getSocket(chatbotId, userId);
        socket.emit('admin_chat', { sender: 'admin', sessionId, msg });
        console.log(msg, 'sent from sendReplyToUser');
    }, [addManualMessage, chatData, chatbotId, userId]);

    const handlePageClick = useCallback(async (selectedPage: number) => {
        try {
            setIsChatLoading(true);
            const response = await getChatSessions(chatbotId, (selectedPage + 1).toString());
            setChatSessions(response.data);
            handleSelectChat(response.data.results.find((chatSession) => chatSession.firstMessage) || response.data.results[0])
        } catch (error) {
            console.log("Unable to fetch chatSessions", error);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatbotId, handleSelectChat]);

    const updateChatSessionReadStatus = useCallback(async (chatId: string, isUnread: boolean) => {
        try {
            // Toggle read/unread based on isUnread flag
            await (isUnread ? unReadChatSession : readChatSession)(chatId);
            setChatSessions((prev) => {
                if (!prev) return undefined;
                const updatedResults = prev.results.map(item =>
                    item._id === chatId ? { ...item, isUnread } : item
                );
                return { ...prev, results: updatedResults };
            });
        } catch (error) {
            console.log("Unable to update chatSessions", error);
        }
    }, []);

    useEffect(() => {
        if (!sessionId) return;
        const selectedChat = chatSessions?.results.find((item) => item._id === sessionId) || chatSessions?.results[0];
        if (selectedChat && selectedChat.isUnread && selectedChat._id === sessionId) {
            updateChatSessionReadStatus(sessionId, false);
        }
    }, [chatSessions?.results, sessionId, updateChatSessionReadStatus]);

    const fetchChatSessionDetails = useCallback(async () => {
        if (!sessionId) return;
        try {
            setIsChatLoading(true);
            const res = await getChatSessionDetails(sessionId);
            setChatData(res.data);
        } catch (error) {
            console.log("Unable to fetch deals", error);
        } finally {
            setIsChatLoading(false);
        }
    }, [sessionId])

    useEffect(() => {
        fetchChatSessionDetails();
    }, [fetchChatSessionDetails]);


    const fetchChatSessionData = useCallback(async () => {
        if (!chatbotId || !!chatSessions) return;
        try {
            const response = await getChatSessions(chatbotId, '1');
            setChatSessions(response.data);
            const session = response.data.results.find((chatSession) => chatSession._id === sessionId) || response.data.results[0]
            handleSelectChat(session)
        } catch (error) {
            console.log("Unable to fetch chatSessions", error);
        } finally {
        }

    }, [chatSessions, chatbotId, handleSelectChat, sessionId])


    useEffect(() => {
        fetchChatSessionData();
    }, [fetchChatSessionData]);

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
    }, [chatSessions, handlePageClick])

    const onChatEvent = useCallback((data: IChatEmitData) => {
        console.log(data.msg, 'onChatEvent:received');
        if (chatData) {
            const updatedChatData = addManualMessage(chatData, { msg: data.msg, sessionId: data.sessionId, sender: 'user' });
            setChatData(updatedChatData);
        }
    }, [addManualMessage, chatData]);
    
    const onNewSessionEvent = useCallback((data: { msg: string; sessionId: string; sender: 'admin' }) => {
        console.log(data, 'onNewSessionEvent:received');
    }, []);

    const onNewBotReply = useCallback((data: { msg: string; sessionId: string; sender: 'admin' }) => {
        console.log(data, 'onNewBotReply:received');
    }, []);

    useEffect(() => {
        const socket = socketService.getSocket(chatbotId, userId);
        console.log('useEffect: socket', socket)
        socket.on('admin_chat', onChatEvent);
        socket.on('new_session', onNewSessionEvent);
        socket.on('chat_broadcast', onNewBotReply);
        return () => {
            socketService.disconnectSocket(chatbotId);
        };
    }, [chatbotId, onChatEvent, onNewBotReply, onNewSessionEvent, userId]);


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

    const selectedChat = chatSessions?.results.find((item) => item._id === sessionId) || chatSessions?.results[0]
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
            <ChatWindow onChatReply={sendReplyToUser} chatData={chatData} userData={chatData?.userData} messages={chatData?.messages} isMessagesLoading={isChatLoading} />
        </Flex>
    )
}