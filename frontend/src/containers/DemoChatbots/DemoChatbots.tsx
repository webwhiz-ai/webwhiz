import * as React from "react";
import {
	Box,
	Flex,
	Heading,
	SimpleGrid,
	Spinner,
	VStack,
} from "@chakra-ui/react";

import { ChatBot } from "../../components/ChatBot/ChatBot";
import { useEffect } from "react";


const demoChatBotsData = [
	{
		_id: '64182b70cdccd3b6af29dbaf',
		name: 'Stripe docs',
		description: 'Trained on stripe docs. - https://stripe.com/docs',
		imageUrl: 'https://www.paritydeals.com/images/integrations/stripe-logo.svg',
		customizationValues:  {
			backgroundColor: "#7a73ff",
			heading: 'I am your Stripe AI assistant',
			description: 'I am trained on <a style="text-decoration:underline; font-weight:bold" href="https://stripe.com/docs" target="_blank">Stripe docs</a>. Ask me anything you want to know about Stripe',
			fontColor: "#FFF",
			borderRadius: "12px",
			placement: "right",
			welcomeMessage: 'Hello! How can I assist you today?'
		}
	},
	{
		_id: '6417473db9443edf08aa0a52',
		name: 'Stripe docs',
		description: 'Trained on ProductHunt launch docs. - https://www.producthunt.com/launch',
		imageUrl: 'https://www.paritydeals.com/images/integrations/stripe-logo.svg',
		customizationValues:  {
			backgroundColor: "#da5225",
			heading: 'I am your ProductHunt launch assistant',
			description: 'I am trained on <a style="text-decoration:underline; font-weight:bold" href="https://www.producthunt.com/launch" target="_blank">ProductHunt launch docs</a>. Ask me anything you want to know about launching on ProductHunt.',
			fontColor: "#FFF",
			borderRadius: "12px",
			placement: "right",
			welcomeMessage: 'Hello! How can I assist you today?'
		}
	},
	{
		_id: '6431479cf8fd59b7201d69a3',
		name: 'Stripe docs',
		description: 'Trained on ProductHunt launch docs. - https://www.producthunt.com/launch',
		imageUrl: 'https://www.paritydeals.com/images/integrations/stripe-logo.svg',
		customizationValues:  {
			backgroundColor: "#000",
			heading: 'I am your ParityDeals AI assistant',
			description: 'I am trained on <a style="text-decoration:underline; font-weight:bold" href="https://www.paritydeals.com/" target="_blank">ParityDeals.com</a>. Ask me anything',
			fontColor: "#FFF",
			borderRadius: "12px",
			placement: "right",
			welcomeMessage: 'Hello! How can I assist you today?'
		}
	}
]

export const DemoChatbots = () => {
	const [chatBotList, setChatBot] = React.useState<any[]>();
	const [chatbotsLoaded, setChatbotsLoaded] = React.useState<boolean>(false);



	useEffect(() => {
		async function fetchData() {
			try {
				setChatbotsLoaded(true);
				setChatBot(demoChatBotsData);
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
		}
		fetchData();
	}, []);

	const getNoDataIcon = React.useCallback(() => {
		return (
			<VStack
				spacing="9"
				alignItems="center"
				direction="column"
				justifyContent="center"
				w="100%"
				h="100%"
			>
				<Heading
					maxW="580px"
					mt={32}
					fontSize="2xl"
					fontWeight="semibold"
					as="h3"
					lineHeight="medium"
					textAlign="center"
				>
					Train Chat GPT on your website's data and create a chatbot within minutes
				</Heading>
			</VStack>
		);
	}, []);
	

	const getChatBotLists = React.useCallback(() => {
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
		if (!chatBotList?.length) {
			return getNoDataIcon();
		}
		const chatbotListItems = chatBotList?.map((chatbot) => {
			return	<Flex>
				<ChatBot height={'560px'} knowledgeBaseId={chatbot._id} showCloseButton={false} showLauncher={false} customStyle={chatbot.customizationValues} />
				</Flex>
		});
		return (
			<SimpleGrid columns={[1, 1, 1, 3]} spacing="6">
				{chatbotListItems}
			</SimpleGrid>
		);
	}, [chatBotList, chatbotsLoaded, getNoDataIcon]);


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
					<Heading fontSize="30">Demo Chatbots</Heading>
				</Flex>
				<Box zIndex='1' pointerEvents='all' width="100%">{getChatBotLists()}</Box>
			</VStack>
		</Box>
	);
};
