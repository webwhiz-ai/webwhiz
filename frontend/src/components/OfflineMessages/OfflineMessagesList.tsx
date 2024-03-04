import React from 'react';
import {
  OfflineMessagePagination,
  OfflineMessage,
} from '../../types/knowledgebase.type';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { Paginator } from '../../widgets/Paginator/Paginator';
import { OfflineChatListItem } from './OfflineChatListItem';

type OfflineMessagesListProps = {
  isChatListLoading: boolean;
  chatSessionsPage: OfflineMessagePagination;
  selectedChat: OfflineMessage;
  onPageChange: (page: number) => void;
  onSelectChat: (chatSession: OfflineMessage) => void;
};

export const OfflineMessagesList = ({
  isChatListLoading,
  chatSessionsPage,
  selectedChat,
  onPageChange,
  onSelectChat,
}: OfflineMessagesListProps) => {
  return (
    <Box w="450px" pos="relative">
      {isChatListLoading && (
        <Flex
          pos="absolute"
          align="center"
          justify="center"
          top={0}
          bottom={0}
          right={0}
          left={0}
          bg="whiteAlpha.700"
        >
          <Spinner />
        </Flex>
      )}

      <Box
        overflowY="auto"
        overflowX="hidden"
        h="calc(100% - 47px)"
        borderRight="1px"
        borderColor="gray.200"
      >
        <Flex direction="column">
          {chatSessionsPage.results.map((chatSession: OfflineMessage) => (
            <OfflineChatListItem
              key={chatSession._id}
              chatSessionData={chatSession}
              isSelected={selectedChat._id === chatSession._id}
              onSelectChat={() => onSelectChat(chatSession)}
            />
          ))}
        </Flex>
      </Box>
      <Box
        bg="white"
        borderTop="1px"
        borderRight="1px"
        borderColor="gray.200"
        justifyContent="center"
      >
        <Paginator
          onPageChange={onPageChange}
          pageRangeDisplayed={5}
          pageCount={chatSessionsPage.pages}
        />
      </Box>
    </Box>
  );
};
