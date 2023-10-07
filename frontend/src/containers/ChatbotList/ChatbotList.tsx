import * as React from "react";
import {
	Box,
	Button,
	Flex,
	Heading,
	SimpleGrid,
	Spinner,
	Tooltip,
	HStack,
	Link as ChakraLink,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";

import { useEffect } from "react";
import {
	MediaListItem,
} from "../../components/MediaListItem/MediaListItem";
import { User } from '../../services/appConfig';
import { CurrentUser } from "../../services/appConfig";
import { NoDataSubscribeIcon } from "../../components/Icons/noData/NoDataSubscribeIcon";
import { NoDataProjectIcon } from "../../components/Icons/noData/NoDataProjectIcon";
import { deleteKnowledgebase, fetchKnowledgebases, generateEmbeddings } from "../../services/knowledgebaseService";
import { SELF_HOST } from "../../config";

let PAID_ONLY = false;

if(SELF_HOST === 'true') { 
	PAID_ONLY = false;
}

export const ChatbotList = () => {
	const toast = useToast();
	const [chatbotsList, setChatBotList] = React.useState<any>();
	const [chatbotsLoaded, setChatbotsLoaded] = React.useState<boolean>(false);

	const [user, setUser] = React.useState<User>(CurrentUser.get());
	React.useEffect(() => {
		async function fetchData() {
			try {
				const userData = CurrentUser.get();
				setUser(userData);
			} catch (error) {
				console.log("Unable to fetch user ID", error);
			} finally {
			}
		}
		fetchData();
	}, [])

	const history = useHistory();

	
	const [createChatBotLoading, setCreateChatBotLoading] = React.useState({})

	const onMenuItemClick = React.useCallback(
		async (type, chatbot) => {
			if (type === "edit") {
				history.push(`/app/edit-chatbot/${chatbot._id}/`);
			} else if (type === "getCode") {
				history.push(`/app/edit-chatbot/${chatbot._id}/?step=add-to-site`);
			} else if (type === "customize") {
				history.push(`/app/edit-chatbot/${chatbot._id}/?step=customize`);
			} else if (type === "delete") {
				await deleteKnowledgebase(chatbot._id as string);
				setChatBotList(chatbotsList?.filter((_chatbot) => _chatbot._id !== chatbot._id));
				toast({
					title: `Chat bot has been deleted successfully `,
					status: "success",
					isClosable: true,
				});
			}
		},
		[history, chatbotsList, toast]
	);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetchKnowledgebases();
				setChatbotsLoaded(true);
				setChatBotList(response.data);
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
		}
		fetchData();
	}, []);

	const getNoDataIcon = React.useCallback(() => {
		if(user && PAID_ONLY &&  user?.subscriptionData?.name === 'FREE') {
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
				<NoDataSubscribeIcon width="auto" height="250px" />
				<Box textAlign="center">
					<Heading
						maxW="480px"
						fontSize="xl"
						fontWeight="500"
						as="h3"
						mb="4"
						color="gray.500"
						lineHeight="medium"
						textAlign="center"
					>
						Upgrade to a paid plan or purchase credits to create chatbots.
					</Heading>
					<HStack justify="center">
						<Link to="/app/settings/subscription">
							<Button colorScheme='blue' size='md'>Subscribe Now</Button>
						</Link>
						<ChakraLink href={'https://webwhiz.lemonsqueezy.com/checkout/buy/60da93fa-87b8-4fcd-9176-48da47405541?checkout[email]='+user.email}
                    isExternal >
								<Button variant='outline' colorScheme='blue' size='md'>Buy 50K tokens for $5</Button>
						</ChakraLink>
					</HStack>
				</Box>
			</VStack>
		}
		return (
			<VStack
				alignItems="center"
				direction="column"
				justifyContent="center"
				w="100%"
				h="100%"
				pt={32}
				pb={32}
				spacing="9"
			>
				<NoDataProjectIcon width="auto" height="250px" />
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
						Train Chat GPT on your website's data and create a chatbot within minutes
					</Heading>
					<Link to="/app/create-chatbot">
						<Button variant='outline' colorScheme='blue' size='md'>Create new chatbot</Button>
					</Link>
				</Box>
			</VStack>
		);
	}, [user]);

	
	const createChatBot = React.useCallback(async (id) => {
		try {
			setCreateChatBotLoading({
				[id] : true
			});
			await generateEmbeddings(id);
			setCreateChatBotLoading({
				[id] : false
			})
		} catch (error) {}
	}, []);

	const getChatbotsList = React.useCallback(() => {
		if (!chatbotsLoaded) {
			return (
				<Flex w="100%" minH="300px" justifyContent="center" alignItems="center">
					<Spinner
						thickness="2px"
						speed="0.65s"
						emptyColor="gray.200"
						color="gray.700"
						size="xl"
					/>
				</Flex>
			);
		}
		if (!chatbotsList?.length) {
			return getNoDataIcon();
		}
		const chatbotListItems = chatbotsList?.map((chatbot) => {
			return (
				<MediaListItem
					showCustomizeMenu
					name={chatbot.name}
					imageAlt={chatbot.name}
					showGetCodeMenu
					imageUrl={chatbot.imageUrl}
					description={chatbot.description}
					key={chatbot._id}
					showPrimaryActionButton={chatbot.status !== 'READY'}
					actionButtonLeftIcon={null}
					isPrimaryButtonLoading={createChatBotLoading[chatbot._id] || chatbot.status === 'CRAWLING'}
					onPrimaryActionButtonClick={() => {
						createChatBot(chatbot._id)
					}}
					onMenuItemClick={(type) => {
						onMenuItemClick(type, chatbot);
					}}
				></MediaListItem>
			);
		});
		return (
			<SimpleGrid columns={[1, 1, 1, 2]} spacing="6">
				{chatbotListItems}
			</SimpleGrid>
		);
	}, [createChatBot, createChatBotLoading, chatbotsList, chatbotsLoaded, getNoDataIcon, onMenuItemClick]);


	return (
		<Box
			w="100%"
			maxW="1200px"
			p="6"
			shadow="sm"
			h="100%"
			position="relative"
			overflow="auto"
		>
			<VStack w="100%" spacing="10">
				<Flex shrink={0} w="100%" justifyContent="space-between">
					<Heading fontSize="30">Projects</Heading>
					{user && PAID_ONLY && user?.subscriptionData?.name === 'FREE' ? <Tooltip label={"Upgrade to a paid plan to create chatbots"}>
						<Button colorScheme='blue' size='md'>Create new chatbot</Button>
					</Tooltip> : <Link to="/app/create-chatbot">
						<Button colorScheme='blue' size='md'>Create new chatbot</Button>
					</Link>}
					
				</Flex>
				<Box width="100%">{getChatbotsList()}</Box>
			</VStack>
		</Box>
	);
};
