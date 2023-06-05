import React from 'react'
import { OfflineMessagePagination, OfflineMessage } from '../../types/knowledgebase.type'
import { Flex, VStack, Box, Heading } from '@chakra-ui/react';
import { OfflineMessagesList } from '../../components/OfflineMessages/OfflineMessagesList';
import { NoDataOfflineMessages } from '../../components/Icons/noData/NoDataOfflineMessages';
import { OfflineMessageWindow } from '../../components/OfflineMessages/OfflineMessageWindow';

type OfflineMessagesProps = {
    isChatListLoading: boolean;
    chatSessionsPage: OfflineMessagePagination;
    onPageChange: (page: number) => void;
}

export const OfflineMessagesNew = ({ isChatListLoading, chatSessionsPage, onPageChange }: OfflineMessagesProps) => {
    const [selectedChat, setSelectedChat] = React.useState<OfflineMessage>(chatSessionsPage.results[0]);

    React.useEffect(() => {
        setSelectedChat(chatSessionsPage.results[0]);
    }, [chatSessionsPage])

    const handleSelectChat = React.useCallback((chatSession: OfflineMessage) => {
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
                <NoDataOfflineMessages />
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
                        Offline messages by your customers will appear here.
                    </Heading>
                </Box>
            </VStack>
        )
    }

    return (
        <Flex w="100%">
            <OfflineMessagesList
                isChatListLoading={isChatListLoading}
                chatSessionsPage={chatSessionsPage}
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                onPageChange={onPageChange}
            />
            <OfflineMessageWindow offlineChatData={selectedChat} />
        </Flex>
    )
}