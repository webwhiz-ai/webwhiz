import { Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import { formatDistance } from 'date-fns'
import React from 'react'
import { ChatSession } from '../../types/knowledgebase.type'
import { ThreeDotIcon } from '../Icons/ThreeDotIcon'
import { CircleIcon } from '../Icons/Icon'


type ChatListItemProps = {
    isSelected?: boolean;
    chatSessionData: ChatSession;
    onSelectChat: (chatSession: ChatSession) => void;
    updateChatSessionReadStatus: (chatId: string, isUnread: boolean) =>void

}

export const ChatListItem = ({ chatSessionData, isSelected, onSelectChat, updateChatSessionReadStatus }: ChatListItemProps) => {

    const getFormattedTime = React.useCallback((date: string) => {
        return formatDistance(new Date(date), new Date(), { addSuffix: true });
    }, []);

    return (
        <Flex
            direction="column"
            position="relative"
            cursor="pointer"
            px={3} py={2}
            borderBottom="1px"
            borderBottomColor="gray.100"
            bg={isSelected ? 'gray.100' : 'white'}
            borderRight={isSelected ? "2px" : "0"}
            borderRightColor="blue.500"
            onClick={() =>  !isSelected &&  onSelectChat(chatSessionData)}
        >
            <Menu>
                <MenuButton
                    as={IconButton}
                    aria-label='Options'
                    icon={<ThreeDotIcon />}
                    variant='outline'
                    boxSize={'28px'}
                    minWidth={0}
                    position="absolute"
                    right="10px"
                    top="10px"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
                <MenuList p={1}>
                    {
                        chatSessionData.isUnread ?
                            <MenuItem
                            fontSize={14}
                                borderRadius={6}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateChatSessionReadStatus(chatSessionData._id, false)
                                }}>
                                Mark as read
                        </MenuItem>
                            :
                            <MenuItem
                            fontSize={14}
                                borderRadius={6}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateChatSessionReadStatus(chatSessionData._id, true)
                                }}>
                                Mark as unread
                    </MenuItem>
                    }
                </MenuList>
            </Menu>
            <Text fontSize="xs" color="gray.500" mb={2}>
                {getFormattedTime(chatSessionData.updatedAt)}
            </Text>
            <Text fontSize="sm" noOfLines={2}>
                {chatSessionData.firstMessage.q}
            </Text>

            {chatSessionData.isUnread && <CircleIcon boxSize={3} color='blue.500' position="absolute"
                right="4px"
                bottom="2px" />}
        </Flex >
    )
}