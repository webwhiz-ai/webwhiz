import * as React from "react";

import {
	Box,
	Flex,
	Heading,
	VStack,
	Spinner
	,
} from "@chakra-ui/react";
import { getChatSessionDetails } from "../../services/knowledgebaseService";

import { formatDistance } from "date-fns";
import { NoDataChatSessions } from "../../components/Icons/noData/NoDataChatSessions";
import styles from './ChatSessions.module.scss';

import classNames from 'classnames';
import { Paginator } from "../../widgets/Paginator/Paginator";


export const ChatSessions = ({
	chatData,
	handlePageClick,
	isChatLoading,
}) => {

	const [selectedChatData, setSelectedChatData] = React.useState<ChatData>(
		chatData.results[0] as ChatData
	);
	const [chatDetails, setChatDetails] = React.useState<ChatData>(
		{} as ChatData
	);

	React.useEffect(() => {
		setSelectedChatData(chatData.results[0] as ChatData)
	}, [chatData])


	const getTimeAgo = React.useCallback((date) => {
		return formatDistance(new Date(date), new Date(), {
			addSuffix: true,
		});
	}, []);

	const [isLoading, setIsLoading] = React.useState<boolean>(false);


	React.useEffect(() => {
		let ignore = false;
		async function fetchData() {
			if (!selectedChatData) return;
			setIsLoading(true);
			try {
				const response = await getChatSessionDetails(selectedChatData._id);
				if (!ignore) setChatDetails(response.data);
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
		return () => { ignore = true };
	}, [chatData.results.length, selectedChatData]);
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
				<NoDataChatSessions width="auto" height="250px" />
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
						Chat history with your customers will appear here.
					</Heading>
				</Box>
			</VStack>
	}
	return (
		<Flex w="100%">


			<Box className={styles.listCont} pos="relative">
				<Box className={styles.listContInner} pos="relative">
					{isChatLoading && <Box className={styles.loadingCont}><Spinner /></Box>}
					{chatData.results.filter(data=>data.firstMessage).map((data) => (
						<Box className={classNames(styles.listTab, {
							[styles.activeList]: selectedChatData && selectedChatData._id === data._id
						})} shadow={'xs'} key={data._id} p="3">
							<Box onClick={() => {
								setSelectedChatData(data)
							}}>
								<Box className={styles.messageTime}>
									{getTimeAgo(data.updatedAt)}
								</Box>
								<Box className={styles.messageStart}>
									{data.firstMessage.q}
								</Box>
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

				{isLoading && <Box className={styles.loadingCont}><Spinner /></Box>}

				{chatDetails && chatDetails.messages && chatDetails.messages.map((data) => {
					return <Box key={data.ts}>

						<Box className={classNames(styles.detailsQuestion, styles.detailsItem)}>
							<div className={styles.detailsItemInner}>
								{data.q}
							</div>
						</Box>
						<Box className={classNames(styles.detailsAnswer, styles.detailsItem)}>
							<div className={styles.detailsItemInner}>
								{data.a}
							</div>
						</Box>
					</Box>
				}

				)}
			</Box>
		</Flex>
	);
};
