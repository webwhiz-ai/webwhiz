import React from 'react'
import { Flex, Box, VStack, Heading } from '@chakra-ui/react'
import { ChatList } from '../../components/ChatSessions/ChatList'
import { ChatWindow } from '../../components/ChatSessions/ChatWindow'
import { ChatSessionPagination, ChatSession, ChatSessionDetail } from '../../types/knowledgebase.type'
import { getChatSessionDetails } from '../../services/knowledgebaseService'
import { NoDataChatSessions } from '../../components/Icons/noData/NoDataChatSessions'

type ChatSessionsProps = {
    isChatListLoading: boolean;
    chatSessionsPage: ChatSessionPagination;
    onPageChange: (page: number) => void;
}

export const ChatSessionsNew = ({ isChatListLoading, chatSessionsPage, onPageChange }: ChatSessionsProps) => {
    const [selectedChat, setSelectedChat] = React.useState<ChatSession>(chatSessionsPage.results.find((chatSession) => chatSession.firstMessage) || chatSessionsPage.results[0]);
    const [chatData, setChatData] = React.useState<ChatSessionDetail>();
    const [isChatLoading, setIsChatLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        const firstMessageChat = chatSessionsPage.results.find((chatSession) => chatSession.firstMessage);
        setSelectedChat(firstMessageChat || chatSessionsPage.results[0]);
    }, [chatSessionsPage])

    React.useEffect(() => {
        let ignore = false;
        async function fetchData() {
            if (!selectedChat) return;
            setIsChatLoading(true);
            try {
                const response = await getChatSessionDetails(selectedChat._id);
                if (!ignore) setChatData(response.data);
            } catch (error) {
                console.log("Unable to fetch deals", error);
            } finally {
                setIsChatLoading(false);
            }
        }
        fetchData();
        return () => { ignore = true };
    }, [chatSessionsPage.results.length, selectedChat]);

    const handleSelectChat = React.useCallback((chatSession: ChatSession) => {
        setSelectedChat(chatSession);
    }, []);

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
                onSelectChat={handleSelectChat}
                onPageChange={onPageChange}
            />
            <ChatWindow chatData={chatData} userData={chatData?.userData} messages={chatData?.messages} isMessagesLoading={isChatLoading} />
        </Flex>
    )
}