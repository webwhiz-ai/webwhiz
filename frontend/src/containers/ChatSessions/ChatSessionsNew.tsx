import { Box, Flex, Heading, VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { ChatList } from '../../components/ChatSessions/ChatList'
import { ChatWindow } from '../../components/ChatSessions/ChatWindow'
import { NoDataChatSessions } from '../../components/Icons/noData/NoDataChatSessions'
import { useConfirmation } from '../../providers/providers'
import { deleteChatSession, getChatSessionDetails, getChatSessions, readChatSession, unReadChatSession } from '../../services/knowledgebaseService'
import socketService from '../../services/SocketService'
import { ChatSession, ChatSessionDetail, ChatSessionPagination, MessageList } from '../../types/knowledgebase.type'

export type ChatSessionsProps = {
    chatbotId: string
    userId: string
}

export const ChatSessionsNew = ({ chatbotId, userId }: ChatSessionsProps) => {
    const history = useHistory()
    const { search } = useLocation();
    const { showConfirmation } = useConfirmation()

    const sessionId = new URLSearchParams(search).get("session") || ''

    const [chatSessions, setChatSessions] = React.useState<ChatSessionPagination>();
    const [chatData, setChatData] = React.useState<ChatSessionDetail>();
    const [isChatSessionsLoading, setIsChatSessionsLoading] = useState<boolean>(true);
    const [isChatDataLoading, setIsChatDataLoading] = useState(true)

    const addManualMessage = useCallback((chatData: ChatSessionDetail, data: Partial<MessageList>) => {
        const newMessage = { ...data, ts: new Date() } as any;
        const updatedChatData = {
            ...chatData,
            messages: chatData.messages ? [...chatData.messages, newMessage] : [newMessage],
        };
        return updatedChatData;
    }, []);

    const onChatReplyEvent = useCallback((sessionId: string, msg: string) => {
        const data = { sender: 'admin', sessionId, msg }
        if (chatData) {
            const updatedChatData = addManualMessage(chatData, { ...data, type: 'MANUAL' });
            setChatData(updatedChatData);
        }
        const socket = socketService.getSocket(chatbotId, userId);
        socket.emit('admin_chat', data);
        console.log(data, 'onChatReplyEvent:send');
    }, [addManualMessage, chatData, chatbotId, userId]);

    const updateChatSessionReadStatus = useCallback(async (chatId: string, isUnread: boolean, needStateUpdate: boolean = true) => {
        try {
            // Toggle read/unread based on isUnread flag
            await (isUnread ? unReadChatSession : readChatSession)(chatId);
            if (needStateUpdate) {
                setChatSessions((prev) => {
                    if (!prev) return undefined;
                    const updatedResults = prev.results.map(item =>
                        item._id === chatId ? { ...item, isUnread } : item
                    );
                    return { ...prev, results: updatedResults };
                });
            }
        } catch (error) {
            console.log("Unable to update chatSessions", error);
        }
    }, []);


    const handleSelectChat = useCallback((chatSession?: ChatSession) => {
        history.replace({
            pathname: `/app/edit-chatbot/${chatbotId}/chat-sessions`,
            search: chatSession?._id ? `?session=${chatSession?._id}` : undefined

        })
        if (chatSession?._id && chatSession.isUnread) {
            updateChatSessionReadStatus(chatSession?._id, false)
        }
    }, [chatbotId, history, updateChatSessionReadStatus]);


    const handlePageClick = useCallback(async (selectedPage: number) => {
        try {
            setIsChatSessionsLoading(true);
            const response = await getChatSessions(chatbotId, (selectedPage + 1).toString());
            setChatSessions(response.data);
        } catch (error) {
            console.log("Unable to fetch chatSessions", error);
        } finally {
            setIsChatSessionsLoading(false);
        }
    }, [chatbotId]);

    const fetchChatSessionDetails = useCallback(async () => {
        if (!sessionId) { setIsChatDataLoading(false); return; }
        try {
            setIsChatDataLoading(true);
            const res = await getChatSessionDetails(sessionId);
            setChatData(res.data);
        } catch (error) {
            console.log("Unable to fetch deals", error);
        } finally {
            setIsChatDataLoading(false);
        }
    }, [sessionId])

    useEffect(() => {
        fetchChatSessionDetails();
    }, [fetchChatSessionDetails]);


    const fetchChatSessionData = useCallback(async () => {
        if (!chatbotId || !!chatSessions) { setIsChatSessionsLoading(false); return; }
        try {
            setIsChatSessionsLoading(true);
            const response = await getChatSessions(chatbotId, '1');
            setChatSessions(response.data);
        } catch (error) {
            console.log("Unable to fetch chatSessions", error);
        } finally {
            setIsChatSessionsLoading(false);
        }

    }, [chatSessions, chatbotId])


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
                    setChatSessions((prev) => ({ ...prev, results: updatedResults }));
                }
                if (chatData?._id === chatId) {
                    handleSelectChat(undefined)
                    setChatData(undefined)
                }
            }
        } catch (error) {
            console.log("Unable to delete chatSessions", error);
        }
    }, [chatData?._id, chatSessions, handlePageClick, handleSelectChat])

    const onChatEvent = useCallback((data: MessageList) => {
        console.log(data, 'onChatEvent:received');
        setChatSessions((prev) => {
            let chatSession = prev?.results.find(item => item._id === data.sessionId)
            if (chatSession) {
                data?.sessionId !== chatData?._id && !chatSession.isUnread && updateChatSessionReadStatus(chatSession?._id, true, false)
                chatSession.isUnread = true
                chatSession.updatedAt = new Date().toString()
                chatSession.latestMessage = data;
            } else return prev
            return {
                ...prev, results: [chatSession, ...prev?.results.filter(item => item._id !== data.sessionId) || []]
            }
        });
        if (chatData?._id === data.sessionId) {
            const updatedChatData = addManualMessage(chatData, { msg: data.msg, type: data?.type || 'MANUAL', sessionId: data.sessionId, sender: 'user', });
            setChatData(updatedChatData);
        }
    }, [addManualMessage, chatData, updateChatSessionReadStatus]);

    const onNewSessionEvent = useCallback(async (data: MessageList) => {
        console.log(data, 'onNewSessionEvent:received');
        const newSession: ChatSession = {
            _id: data.sessionId,
            startedAt: data.ts,
            updatedAt: data.ts,
            isUnread: true
        } as ChatSession
        setChatSessions((prev) => {
            const prevResults = prev?.results.find(item => item._id === data.sessionId);
            if (prevResults) {
                return prev
            }
            return {
                ...prev, results: [newSession, ...prev?.results || []]
            }
        });
    }, []);

    const onNewBotReply = useCallback((data: MessageList) => {
        console.log(data, 'onNewBotReply:received');
        if (chatData?._id === data.sessionId) {
            const updatedChatData = addManualMessage(chatData, { ...data, type: data?.type || 'MANUAL' });
            setChatData(updatedChatData);
        }
        setChatSessions((prev) => {
            let chatSession = prev?.results.find(item => item._id === data.sessionId)
            if (chatSession) {
                chatSession.isUnread = true
                chatSession.updatedAt = new Date().toString()
                chatSession.latestMessage = data;
            }
            return {
                ...prev, results: [...prev?.results || []]
            }
        });
    }, [addManualMessage, chatData]);

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


    if (!isChatSessionsLoading && !chatSessions?.results.length) {
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

    const selectedChat = chatSessions?.results.find((item) => item._id === sessionId)

    return (
        <Flex w="100%">
            <ChatList
                isChatListLoading={isChatSessionsLoading}
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
            <ChatWindow onChatReply={onChatReplyEvent} chatData={chatData} userData={chatData?.userData} messages={chatData?.messages} isMessagesLoading={isChatDataLoading} />
        </Flex>
    )
}