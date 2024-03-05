import React, { useRef, useEffect } from 'react';
import { Box, Spinner, Flex, VStack, HStack, Text, Heading } from '@chakra-ui/react';
import { MessageList, ChatSessionDetail } from '../../types/knowledgebase.type';
import { ChatBubble } from './ChatBubble';
import { getBrowserName } from '../../utils/commonUtils';
import { format } from 'date-fns';
import styles from "./ChatWindow.module.scss";
import TextareaAutosize from 'react-textarea-autosize'
import { NoDataChatSessions } from '../Icons/noData/NoDataChatSessions';
import { permissions } from '../../services/appConfig';
type ChatWindowProps = {
    messages?: MessageList[];
    isMessagesLoading?: boolean;
    userData: any;
    chatData?: ChatSessionDetail;
    onChatReply: (sessionId: string, msg: string) => void
};

export const ChatWindow = ({
    chatData,
    messages,
    isMessagesLoading,
    userData,
    onChatReply
}: ChatWindowProps) => {
    const chatListRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const [question, setQuestion] = React.useState<string>('');

    const handleChatChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(e.target.value)
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            if (target.value) {
                handleSubmit();
            }
        }
    }

    const handleSubmit = () => {
        chatData && onChatReply(chatData?._id, question)
        setQuestion('')
    }
    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!chatData?._id) return
        inputRef.current?.focus()
    }, [chatData?._id])

    const getChatHeader = React.useCallback(() => {
        if (!userData || !chatData) return null;
        return (
            <Box >
                <VStack alignItems={"start"} className={styles.meta} spacing="3" pb="4" mb="4" borderBottom="1px solid" borderColor="gray.100">
                    <HStack className={styles.metaItemGroup} fontSize="sm" color="gray.500">
                        <Flex className={styles.metaItem}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M21 10H3M16 2V6M8 2V6M10.5 14L12 13V18M10.75 18H13.25M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                                    stroke="currentcolor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <Text>
                                {format(new Date(chatData.updatedAt), 'yyy-MM-dd, iiii')}
                            </Text>
                        </Flex>
                        <Flex className={styles.metaItem}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                    stroke="currentcolor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            <Text>{format(new Date(chatData.updatedAt), 'hh:mm aaa	')}</Text>
                        </Flex>
                    </HStack>
                    <HStack className={styles.metaItemGroup} fontSize="sm" color="gray.500">
                        <Flex className={styles.metaItem}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M22 9H2M2 7.8L2 16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27977 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3L6.8 3C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8Z"
                                    stroke="currentcolor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>{' '}
                            <Text>{getBrowserName(userData.userAgent)}</Text>
                        </Flex>
                        {userData.email ? <Flex className={styles.metaItem}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2 7L10.1649 12.7154C10.8261 13.1783 11.1567 13.4097 11.5163 13.4993C11.8339 13.5785 12.1661 13.5785 12.4837 13.4993C12.8433 13.4097 13.1739 13.1783 13.8351 12.7154L22 7M6.8 20H17.2C18.8802 20 19.7202 20 20.362 19.673C20.9265 19.3854 21.3854 18.9265 21.673 18.362C22 17.7202 22 16.8802 22 15.2V8.8C22 7.11984 22 6.27976 21.673 5.63803C21.3854 5.07354 20.9265 4.6146 20.362 4.32698C19.7202 4 18.8802 4 17.2 4H6.8C5.11984 4 4.27976 4 3.63803 4.32698C3.07354 4.6146 2.6146 5.07354 2.32698 5.63803C2 6.27976 2 7.11984 2 8.8V15.2C2 16.8802 2 17.7202 2.32698 18.362C2.6146 18.9265 3.07354 19.3854 3.63803 19.673C4.27976 20 5.11984 20 6.8 20Z"
                                    stroke="currentcolor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <Text>{userData.email}</Text>
                        </Flex> : null}

                    </HStack>
                </VStack>
            </Box>
        );
    }, [chatData, userData]);

    if (!isMessagesLoading && !chatData?._id) {
        return (
            <VStack
                alignItems="center"
                direction="column"
                justifyContent="center"
                w="calc(100% - 450px)"
                h="100%"
                pt={32}
                pb={32}
                spacing={9}
            >
                <NoDataChatSessions height={400} width={400} />
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
        <Box w="calc(100% - 450px)" h="100%" position="relative">
            {isMessagesLoading && (
                <Flex
                    pos="absolute"
                    align="center"
                    justify="center"
                    top={0}
                    bottom={0}
                    right={0}
                    left={0}
                    bg="whiteAlpha.700"
                    zIndex={1}
                >
                    <Spinner />
                </Flex>
            )}
            <Box ref={chatListRef} h="100%" overflowX="hidden" overflowY="auto" p={4} position={'relative'} pb={'100px'}>
                {getChatHeader()}
                {messages &&
                    messages.map((message) => {
                        return (
                            <Box key={message.ts.toString()}>
                                {message.type === 'MANUAL' ? <ChatBubble message={message.msg} type={message.sender === 'admin' ? 'bot' : 'user'} /> :
                                    <>
                                        <ChatBubble message={message.q || message.msg} type={'user'} />
                                        <ChatBubble message={message.a || message.msg} type={'bot'} />
                                    </>
                                }

                            </Box>
                        );
                    })}
            </Box>
            {chatData && (permissions.get().isAdmin || permissions.get().isEditor) ? <Box className="chat-input-wrap" style={{ position: 'absolute' }} w={'100%'} bottom={0} bgColor={'white'} overflow={'hidden'} >
                <TextareaAutosize ref={inputRef} autoFocus value={question} onChange={handleChatChange} onKeyDown={handleKeyDown} rows={1} className="chat-input textarea js-auto-size" id="chat-input" placeholder="Type your message" />
                <button onClick={handleSubmit} className="chat-submit-btn" type="submit"><svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.394 14.7L13.75 9.3c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 00-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 002.25 1.299z" style={{ fill: '#000' }}></path>
                </svg></button>
            </Box> : null}
        </Box>
    );
};
