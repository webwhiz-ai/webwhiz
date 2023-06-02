import * as React from "react";

import {
	Box,
	Flex,
	Text,
	Heading,
	VStack,
	Spinner
	,
} from "@chakra-ui/react";

import { formatDistance } from "date-fns";
import { NoDataOfflineMessages } from "../../components/Icons/noData/NoDataOfflineMessages";
import styles from './OfflineMessages.module.scss';

import classNames from 'classnames';
import { Paginator } from "../../widgets/Paginator/Paginator";
import { OfflineMessagePagination, OfflineMessage } from "../../types/knowledgebase.type";

interface OfflineMessagesProps {
	chatData: OfflineMessagePagination,
	handlePageClick: (data: any) => void,
	isChatLoading: boolean,
}

export const OfflineMessages = ({
	chatData,
	handlePageClick,
	isChatLoading,
}: OfflineMessagesProps) => {

	const [selectedChatData, setSelectedChatData] = React.useState<OfflineMessage>(chatData.results[0]);

	React.useEffect(() => {
		setSelectedChatData(chatData.results[0] || {})
	}, [chatData])


	const getTimeAgo = React.useCallback((date) => {
		return formatDistance(new Date(date), new Date(), {
			addSuffix: true,
		});
	}, []);



	if (!chatData.results.length) {
		return <VStack
			alignItems="center"
			direction="column"
			justifyContent="center"
			w="100%"
			h="100%"
			pt={32}
			pb={32}
			spacing="9"
		>
			<NoDataOfflineMessages width="auto" height="250px" />
			<Box textAlign="center">
				<Heading
					maxW="580px"
					fontSize="xl"
					fontWeight="500"
					as="h3"
					mb="4"
					color="gray.500"
					lineHeight="medium"
					textAlign="center"
				>
					Offline messages by your customers will appear here.
				</Heading>
			</Box>
		</VStack>
	}
	return (
		<Flex w="100%">


			<Box className={styles.listCont} pos="relative">
				<Box className={styles.listContInner} pos="relative">
					{isChatLoading && <Box className={styles.loadingCont}><Spinner /></Box>}
					{chatData.results.map((data) => (
						<Box className={classNames(styles.listTab, {
							[styles.activeList]: selectedChatData && selectedChatData._id === data._id
						})} shadow={'xs'} key={data._id} p="3">
							<Box onClick={() => {
								setSelectedChatData(data)
							}}>
								<Box className={styles.messageTime}>
									{getTimeAgo(data.createdAt)}
								</Box>
								<Text className={styles.messageStart} noOfLines={2}>
									{data.message}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
				<Box mt="4" className={styles.pagination}>
					<Paginator onPageChange={handlePageClick} pageRangeDisplayed={5}
						pageCount={chatData.pages} />
				</Box>
			</Box>
			<Box w="50%" className={styles.chatDetailsCont}>

				<Box className={classNames(styles.detailsQuestion)}>
					<Box className={styles.detailsItemInner}>
						<Box className={styles.detailsItem}>
							<Flex className={styles.detailsItemValue}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								{selectedChatData.name}
							</Flex>
						</Box>
						<Box className={styles.detailsItem}>
							<Flex className={styles.detailsItemValue}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2 7L10.1649 12.7154C10.8261 13.1783 11.1567 13.4097 11.5163 13.4993C11.8339 13.5785 12.1661 13.5785 12.4837 13.4993C12.8433 13.4097 13.1739 13.1783 13.8351 12.7154L22 7M6.8 20H17.2C18.8802 20 19.7202 20 20.362 19.673C20.9265 19.3854 21.3854 18.9265 21.673 18.362C22 17.7202 22 16.8802 22 15.2V8.8C22 7.11984 22 6.27976 21.673 5.63803C21.3854 5.07354 20.9265 4.6146 20.362 4.32698C19.7202 4 18.8802 4 17.2 4H6.8C5.11984 4 4.27976 4 3.63803 4.32698C3.07354 4.6146 2.6146 5.07354 2.32698 5.63803C2 6.27976 2 7.11984 2 8.8V15.2C2 16.8802 2 17.7202 2.32698 18.362C2.6146 18.9265 3.07354 19.3854 3.63803 19.673C4.27976 20 5.11984 20 6.8 20Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								{selectedChatData.email}
							</Flex>
						</Box>
						<Box className={classNames(styles.detailsItem, styles.detailsItemMessage)}>
							<Box className={styles.detailsItemValue}>
								{selectedChatData.message}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Flex>
	);
};
