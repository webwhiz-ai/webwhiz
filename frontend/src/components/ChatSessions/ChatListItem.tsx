import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { formatDistance } from 'date-fns';
import React from 'react';
import { ChatSession } from '../../types/knowledgebase.type';
import { ThreeDotIcon } from '../Icons/ThreeDotIcon';
import { DeleteIcon } from '../Icons/DeleteIcon';
import { ReadIcon } from '../Icons/ReadIcon';
import { UnreadIcon } from '../Icons/UnreadIcon';
import { permissions } from '../../services/appConfig';

type ChatListItemProps = {
  isSelected?: boolean;
  chatSessionData: ChatSession;
  onSelectChat: (chatSession: ChatSession) => void;
  updateChatSessionReadStatus: (chatId: string, isUnread: boolean) => void;
  onDeleteChat: (chatId: string) => void;
};

export const ChatListItem = ({
  chatSessionData,
  isSelected,
  onSelectChat,
  updateChatSessionReadStatus,
  onDeleteChat,
}: ChatListItemProps) => {
  const getFormattedTime = React.useCallback((date: string) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  }, []);

  return (
    <Flex
      direction="column"
      position="relative"
      cursor="pointer"
      px={3}
      py={2}
      borderBottom="1px"
      borderBottomColor="gray.100"
      bg={
        isSelected ? '#eee8ff' : chatSessionData.isUnread ? '#faf9ff' : 'white'
      }
      borderRight={'2px'}
      borderRightColor={isSelected ? 'blue.500' : 'transparent'}
      onClick={() => !isSelected && onSelectChat(chatSessionData)}
    >
      {permissions.get().isAdmin || permissions.get().isEditor ? (
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<ThreeDotIcon />}
            variant="outline"
            boxSize={'28px'}
            minWidth={0}
            position="absolute"
            right="10px"
            top="10px"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
          <MenuList p={1} minW="140px" color="gray.600">
            {chatSessionData.isUnread ? (
              <MenuItem
                fontSize={14}
                borderRadius={6}
                icon={<UnreadIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  updateChatSessionReadStatus(chatSessionData._id, false);
                }}
              >
                Mark as read
              </MenuItem>
            ) : (
              <MenuItem
                fontSize={14}
                borderRadius={6}
                icon={<ReadIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  updateChatSessionReadStatus(chatSessionData._id, true);
                }}
              >
                Mark as unread
              </MenuItem>
            )}
            <MenuItem
              fontSize={14}
              borderRadius={6}
              icon={<DeleteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chatSessionData._id);
              }}
            >
              Delete chat
            </MenuItem>
          </MenuList>
        </Menu>
      ) : null}
      <Text fontSize="xs" color="gray.500" mb={2}>
        {getFormattedTime(chatSessionData.updatedAt)}
      </Text>
      <Text
        fontSize="sm"
        noOfLines={2}
        fontWeight={chatSessionData.isUnread ? '500' : '400'}
      >
        {chatSessionData.firstMessage.q || chatSessionData.firstMessage.msg}
      </Text>
    </Flex>
  );
};
