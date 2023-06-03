import React from 'react'
import { OfflineMessage } from '../../types/knowledgebase.type';
import { formatDistance } from 'date-fns';
import { Flex, Text } from '@chakra-ui/react';

type OfflineChatListItemProps = {
    isSelected?: boolean;
    chatSessionData: OfflineMessage;
    onSelectChat: (chatSession: OfflineMessage) => void;
}

export const OfflineChatListItem = ({ isSelected, chatSessionData, onSelectChat }: OfflineChatListItemProps) => {
    const getFormattedTime = React.useCallback((date: string) => {
        return formatDistance(new Date(date), new Date(), { addSuffix: true });
    }, []);

    return (
        <Flex
            direction="column"
            cursor="pointer"
            px={3} py={2}
            borderBottom="1px"
            borderBottomColor="gray.100"
            bg={isSelected ? 'gray.100' : 'white'}
            borderRight={isSelected ? "2px" : "0"}
            borderRightColor="blue.500"
            onClick={() => onSelectChat(chatSessionData)}
        >
            <Text fontSize="xs" color="gray.500" mb={2}>
                {getFormattedTime(chatSessionData.createdAt)}
            </Text>
            <Text fontSize="sm" noOfLines={2}>
                {chatSessionData.message}
            </Text>
        </Flex >
    )
}