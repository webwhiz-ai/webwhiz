import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { ChatSession } from '../../types/knowledgebase.type'
import { formatDistance } from 'date-fns'

type ChatListItemProps = {
    isSelected?: boolean;
    chatSessionData: ChatSession;
    onSelectChat: (chatSession: ChatSession) => void;
}

export const ChatListItem = ({ chatSessionData, isSelected, onSelectChat }: ChatListItemProps) => {

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
                {getFormattedTime(chatSessionData.updatedAt)}
            </Text>
            <Text fontSize="sm" noOfLines={2}>
                {chatSessionData.firstMessage.q}
            </Text>
        </Flex >
    )
}