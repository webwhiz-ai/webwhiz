import * as React from "react";

import {
	Box,
	Flex,
	Heading,
	Text,
	HStack,
	List,
	ListItem,
	VStack,
	Spinner,
	IconButton,
	useToast,
	Alert,
	AlertIcon,
	Button,
	useDisclosure,
	AlertDescription,
	AlertTitle,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from "@chakra-ui/react";


import { useEffect } from "react";
import {
	Link,
	RouteComponentProps,
	useHistory,
	withRouter,
} from "react-router-dom";

import { NoDataFineTuneIcon } from "../../components/Icons/noData/NoDataFineTuneIcon";

import { RiDeleteBin5Line } from "react-icons/ri"

import classNames from "classnames";

import {
	ChatBotProductSetup,
} from "../ChatBotProductSetup/ChatBotProductSetup";
import { ChatBotsCustomize } from "../ChatBotsCustomize/ChatBotsCustomize";
import { useLocation } from "react-router-dom";

import styles from "./EditChatbot.module.scss";
import { fetchKnowledgebaseCrawlData, customizeWidget, deleteTrainingData, fetcKnowledgebase, fetchKnowledgebaseDetails, generateEmbeddings, getTrainingData, getTrainingDataDetails, updateWebsiteData, getChatSessions, getOfflineMessages, updatePrompt, updateDefaultAnswer, fetchKnowledgebaseCrawlDataForDocs, addTrainingDoc, updateAdminEmail, getChatSessionDetails, unReadChatSession, readChatSession, deleteChatSession, updateModelName } from "../../services/knowledgebaseService";
import { ChatBot } from "../../components/ChatBot/ChatBot";
import { chatWidgetDefaultValues } from "../../utils/commonUtils";
import { AddTrainingData } from "../AddTrainingData/AddTrainingData";
import { AddTrainingDataForm } from "../AddTrainingDataForm/AddTrainingDataForm";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { CurrentUser, User } from "../../services/appConfig";
import { ChatBotCustomizeData, TrainingData, OfflineMessagePagination, ChatSessionPagination, CustomDataPagination, ProductSetupData, DocsKnowledgeData, ChatSession, ChatSessionDetail } from "../../types/knowledgebase.type";
import { OfflineMessagesNew } from "../OfflineMessages/OfflineMessagesNew";
import { ChatSessionsNew } from "../ChatSessions/ChatSessionsNew";
import { Paginator } from "../../widgets/Paginator/Paginator";
import { CustomDomain } from "../CustomDomain/CustomDomain";
import { useConfirmation } from "../../providers/providers";
import { socket } from "../../socket";
export function validateEmailAddress(email: string) {
	return email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}

type Steps =
	| "product-setup"
	| "customize"
	| "add-to-site"
	| "train-custom-data"
	| "chat-sessions"
	| "offline-messages"
	| "chatbot"
	| "custom-domain";

interface MatchParams {
	chatbotId: string;
}


export type EditChatbotProps = RouteComponentProps<MatchParams>;

const EditChatbot = (props: EditChatbotProps) => {
	const toast = useToast();
	let history = useHistory();

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

	const defaultStep = history.location.pathname.split('/').pop() as Steps

	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
	const [isUploadingDocs, setIsUploadingDocs] = React.useState<boolean>(false);
	const [questionsToDelete, setQuestionsToDelete] = React.useState<string>('0');
	const [chatBot, setChatbot] = React.useState({} as any);
	const [defaultCrauledData, setDefaultCrauledData] = React.useState<any>();


	const [currentStep, setCurrentStep] = React.useState<Steps>(
		 defaultStep || "product-setup"
	);
	
	const [primaryButtonLabel, setPrimaryButtonLabel] = React.useState<string>("Update Website Data");
	const [productSetupTab, setProductSetupTab] = React.useState<number>(0);

	const handleTabChange = React.useCallback((tabIndex: number) => {
		if(tabIndex === 0) {
			setPrimaryButtonLabel("Update Website Data");
			setProductSetupTab(0);
		} else {
			setPrimaryButtonLabel("Upload Files");
			setProductSetupTab(1);
		}
	}, []);


	const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();

	const cancelRef = React.useRef()


	const [isChatLoading, setIsChatLoading] = React.useState<boolean>(false);

	const [crawlDataLoading, setIrawlDataLoading] = React.useState<boolean>(false);

	const [docsDataLoading, setDocsDataLoading] = React.useState<boolean>(false);
	const [docsData, setDocsData] = React.useState<DocsKnowledgeData>();

	const getCrawlDataPagination = React.useCallback(async (pageNo: number) => {
		try {
			setIrawlDataLoading(true);
			const _crawlDataResponse = await fetchKnowledgebaseCrawlData(defaultCrauledData.knowledgebaseId, pageNo);
			const _data = {
				stats: defaultCrauledData?.stats,
				urls: _crawlDataResponse.data.results,
				pages: _crawlDataResponse.data.pages,
				knowledgebaseId: defaultCrauledData.knowledgebaseId
			}

			setDefaultCrauledData(_data)
		} catch (error) {
			console.log(error);
		} finally {
			setIrawlDataLoading(false);
		}
	}, [defaultCrauledData]);

	const getDocsDataPagination = React.useCallback(async (pageNo: number) => {
		try {
			setDocsDataLoading(true);
			const _docsDataResponse = await fetchKnowledgebaseCrawlDataForDocs(defaultCrauledData.knowledgebaseId, pageNo);
			console.log("_docsDataResponse", _docsDataResponse);
			const _data: DocsKnowledgeData = {
				docs: _docsDataResponse.data.results,
				pages: _docsDataResponse.data.pages,
				knowledgebaseId: defaultCrauledData.knowledgebaseId
			}
			setDocsData(_data)
		} catch (error) {
			console.log(error);
		} finally {
			setDocsDataLoading(false);
		}
	}, [defaultCrauledData]);

	const [productSetupLoadingText, setProductSetupLoadingText] = React.useState("Setting up your product");

	const startEmbeding = React.useCallback((chatBotId) => {
		let interval = setInterval(async () => {
			const details = await fetchKnowledgebaseDetails(chatBotId);
			if (details.data.status === 'CRAWLED' || (details.data.websiteData === null && details.data.status === 'CREATED')) {
				await generateEmbeddings(chatBotId);
			} else if (details.data.status === 'CRAWL_ERROR' || details.data.status === 'EMBEDDING_ERROR') {
				clearInterval(interval);
				setIsSubmitting(false);
				toast({
					title: `Oops! Something went wrong`,
					status: "error",
					isClosable: true,
				});
			} else if (details.data.status === 'GENERATING_EMBEDDINGS') {
				setProductSetupLoadingText('Training ChatGPT with your website data... This may take some time based on the amount of the data...');
			} else if (details.data.status === 'READY') {
				clearInterval(interval);

				const _crawlDataResponse = await fetchKnowledgebaseCrawlData(chatBotId, 1);

				const _data = {
					stats: details.data.crawlData?.stats,
					urls: _crawlDataResponse.data.results,
					pages: _crawlDataResponse.data.pages,
					knowledgebaseId: details.data._id
				}

				setDefaultCrauledData(_data)

				setIsSubmitting(false);
				toast({
					title: `Successfully updated your chatbot`,
					status: "success",
					isClosable: true,
				});

				setPrimaryButtonLabel("Update Website Data");

			}
		}, 2000);
	}, [toast]);

	const [isEmbedError, setIsEmbedError] = React.useState<boolean>(false);

	const handleChatbotUpdate = React.useCallback(async (formValues)=>{
		setIsSubmitting(true);
		setIsEmbedError(false)
		if (productSetupTab === 1) {
			setProductSetupLoadingText('Uploading files...');
			if (formValues.files?.length && formValues.files.length > 0) {
				setIsUploadingDocs(true);
				for (const file of formValues.files) {
					try {
						await addTrainingDoc(chatBot._id, file);
					} catch (error) {
						console.log('error', error)
					}
				}
				setIsUploadingDocs(false);
				const _docsDataResponse = await fetchKnowledgebaseCrawlDataForDocs(chatBot._id, 1);
				const _docsData: DocsKnowledgeData = {
					docs: _docsDataResponse.data.results,
					pages: _docsDataResponse.data.pages,
					knowledgebaseId: chatBot._id
				}
				setDocsData(_docsData);
			}
			setIsSubmitting(false);
			return;
		}

		setProductSetupLoadingText('Crawling your website data.. This may take some time based on the amount of the data...');

		try {

			if (formValues.websiteData.websiteUrl) {
				await updateWebsiteData(chatBot._id, {
					urls: [],
					websiteUrl: formValues.websiteData.websiteUrl,
					include: formValues.websiteData.include,
					exclude: formValues.websiteData.exclude,
				})
			}

			startEmbeding(chatBot._id)


		} catch (error) {
			setIsSubmitting(false);
			const errorData = error?.response?.data?.message
			toast({
				title: (errorData && errorData[0]) || 'Oops! Something went wrong',
				status: "error",
				isClosable: true,
			});
		}
	}, [chatBot._id, productSetupTab, startEmbeding, toast])

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetcKnowledgebase(props.match.params.chatbotId);
				//generateEmbeddings(response.data._id);
				const chatBotData = response.data;
				chatBotData.chatWidgeData = chatBotData.chatWidgeData || {
					backgroundColor: chatWidgetDefaultValues.backgroundColor,
					fontColor: chatWidgetDefaultValues.fontColor,
					borderRadius: chatWidgetDefaultValues.borderRadius,
					placement: chatWidgetDefaultValues.placement,
					heading: chatWidgetDefaultValues.heading,
					description: chatWidgetDefaultValues.description,
					welcomeMessages: chatWidgetDefaultValues.welcomeMessages,
					customCSS: chatWidgetDefaultValues.customCSS
				}
				if(chatBotData.status === 'EMBEDDING_ERROR' || chatBotData.status === 'CRAWL_ERROR') {
					setIsEmbedError(true)
					setPrimaryButtonLabel("Create chatbot")
				} else if(chatBotData.status !== 'READY') {
					setIsSubmitting(true);
					startEmbeding(props.match.params.chatbotId)
				}

				const _crawlDataResponse = await fetchKnowledgebaseCrawlData(chatBotData._id, 1);

				const _data = {
					stats: chatBotData.crawlData?.stats,
					urls: _crawlDataResponse.data.results,
					pages: _crawlDataResponse.data.pages,
					knowledgebaseId: chatBotData._id
				}

				const _docsDataResponse = await fetchKnowledgebaseCrawlDataForDocs(chatBotData._id, 1);

				const _docsData: DocsKnowledgeData = {
					docs: _docsDataResponse.data.results,
					pages: _docsDataResponse.data.pages,
					knowledgebaseId: chatBotData._id
				}

				setDocsData(_docsData);
				setDefaultCrauledData(_data)
				setChatbot(response.data);
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
		}
		fetchData();
	}, [props.match.params.chatbotId, startEmbeding]);

	const [offlineMessages, setOfflineMessages] = React.useState<OfflineMessagePagination>();


	useEffect(() => {
		async function fetchData() {
			try {
				const response = await getOfflineMessages(props.match.params.chatbotId, '1');
				setOfflineMessages(response.data);
			} catch (error) {
				console.log("Unable to fetch OfflineMessages", error);
			} finally {
			}
		}
		fetchData();
	}, [props.match.params.chatbotId]);

	const handleOfflinePageClick = React.useCallback(async (selectedPage: number) => {
		try {
			setIsChatLoading(true);
			const response = await getOfflineMessages(props.match.params.chatbotId, (selectedPage + 1).toString());
			setOfflineMessages(response.data);
		} catch (error) {
			console.log("Unable to fetch offlineMeesages", error);
		} finally {
			setIsChatLoading(false);
		}
	}, [props.match.params.chatbotId]);

	const [deleteCustomDataLoading, setDeleteCustomDataLoading] = React.useState(false);

	const [customTrainingDataPage, setCustomTrainingDataPage] = React.useState<CustomDataPagination>({
		pages: 0,
		results: [],
	});

	const [isCustomDataLoading, setIsCustomDataLoading] = React.useState<boolean>(false);

	const [selectedTrainingData, setSelectedTrainingData] = React.useState<TrainingData>(
		{} as TrainingData
	);

	const [isCustomDataDetailsLoading, setIsCustomDataDetailsLoading] = React.useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await getTrainingData(props.match.params.chatbotId, '1');

				console.log('response.data.results', response.data.results)
				setCustomTrainingDataPage(response.data);
				if (response.data.results.length > 0) {
					setIsCustomDataDetailsLoading(true)
					const _trainingData = await getTrainingDataDetails(props.match.params.chatbotId, response.data.results[0]?._id)
					console.log('response.data.results details', _trainingData)
					setSelectedTrainingData(_trainingData.data);
					setIsCustomDataDetailsLoading(false)
				}

			} catch (error) {
				console.log("Unable to fetch custom training data", error);
			} finally {
			}
		}
		fetchData();
	}, [props.match.params.chatbotId]);

	const handleCustomDataPageChange = React.useCallback(async (selectedPage: number) => {
		try {
			setIsCustomDataLoading(true);
			const response = await getTrainingData(props.match.params.chatbotId, (selectedPage + 1).toString());
			setCustomTrainingDataPage(response.data);

			if (response.data.results.length > 0) {
				setIsCustomDataDetailsLoading(true)
				const _trainingData = await getTrainingDataDetails(props.match.params.chatbotId, response.data.results[0]?._id)
				setSelectedTrainingData(_trainingData.data);
				setIsCustomDataDetailsLoading(false)
			}
		} catch (error) {
			console.log("Unable to fetch custom training data", error);
		} finally {
			setIsCustomDataLoading(false);
		}
	}, [props.match.params.chatbotId]);

	const handleQuestionDelete = React.useCallback(async () => {
		const id = questionsToDelete;
		setDeleteCustomDataLoading(true);
		try {
			await deleteTrainingData(props.match.params.chatbotId, id as string);
			const updatedResults = customTrainingDataPage?.results.filter((data) => data._id !== id);
			setCustomTrainingDataPage(prevPage => ({
				...prevPage, 
				results: updatedResults, 
			}));

			toast({
				title: `Custom data has been deleted successfully `,
				status: "success",
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: `Oops! unable to delte custom data`,
				status: "error",
				isClosable: true,
			});
		} finally {
			setDeleteCustomDataLoading(false);
			setQuestionsToDelete('0');
			onDeleteDialogClose();
		}


	}, [onDeleteDialogClose, props.match.params.chatbotId, questionsToDelete, toast, customTrainingDataPage]);


	const goToStep = React.useCallback((step: Steps) => {
		setCurrentStep(step);
		history.push(`/app/edit-chatbot/${props.match.params.chatbotId}/${step}`)
	}, []);

	const handleTrainingDataSave = React.useCallback((values) => {
		console.log("values", values);

		setCustomTrainingDataPage(prevPage => ({
			...prevPage,
			results: [values, ...prevPage.results]
		}));

	}, []);

	const handleTrainingDataUpdate = React.useCallback((values) => {

		const trainingDataToUpdate = customTrainingDataPage.results.find((data) => data._id === values._id);
		console.log("trainingDataToUpdate", trainingDataToUpdate);
		console.log("values", values);
		if (trainingDataToUpdate) {
			trainingDataToUpdate.title = values.q;
			trainingDataToUpdate.content = values.a;

			setCustomTrainingDataPage({...customTrainingDataPage});
		}

	}, [customTrainingDataPage]);

	


	const getAddToWebsiteContent = React.useCallback(() => {
		// if (user && user?.subscriptionData?.name === 'FREE') {
		// 	return <VStack
		// 		alignItems="center"
		// 		direction="column"
		// 		justifyContent="center"
		// 		pt={32}
		// 		pb={32}
		// 		spacing="9"
		// 	>
		// 		<NoDataSubscribeIcon width="auto" height="180px" />
		// 		<Box textAlign="center">
		// 			<Heading
		// 				maxW="580px"
		// 				fontSize="xl"
		// 				fontWeight="500"
		// 				as="h3"
		// 				mb="4"
		// 				color="gray.500"
		// 				lineHeight="medium"
		// 				textAlign="center"
		// 			>
		// 				Upgrade to a paid plan to add chatbot to your website
		// 			</Heading>
		// 			<Link to="/app/settings/subscription">
		// 				<Button variant='outline' colorScheme='blue' size='md'>Subscribe Now</Button>
		// 			</Link>
		// 		</Box>
		// 	</VStack>
		// }



		return <VStack spacing={12} alignItems="start">
			<VStack alignItems="start">
				<Heading fontSize="md">Chatbot with Launcher Icon</Heading>
				<Text color="gray.500" fontSize="sm">A launcher icon will be displayed at the corner of your website. Once clicked, the full chat interface will appear.</Text>
				<Box className={styles.codeBlock}>
					<span style={{ color: '#808080' }}>&lt;<span style={{ color: '#ed6a43' }}>script</span>
						<span style={{ color: '#0086b3' }}> id</span>=<span style={{ color: '#183691' }}>"__webwhizSdk__"</span><span style={{ color: '#0086b3', paddingLeft: '4px' }}> data-chatbot-id</span>=<span style={{ color: '#183691' }}>"{chatBot._id}"</span>
						<br></br>
						<span style={{ color: '#0086b3', paddingLeft: '20px' }}> src</span>=<span style={{ color: '#183691' }}>"https://widget.webwhiz.ai/webwhiz-sdk.js"</span>
						&gt;</span>
					<br></br>
					<span style={{ color: '#808080' }}>&lt;/<span style={{ color: '#ed6a43' }}>script</span>&gt;</span>
				</Box>
				<HStack mt="6">
					<Button
						colorScheme="blue"
						variant="solid"
						size="sm"
						isLoading={isSubmitting}
						isDisabled={isSubmitting}
						onClick={() => {
							navigator.clipboard.writeText(
								`<script id="__webwhizSdk__" src="https://widget.webwhiz.ai/webwhiz-sdk.js" data-chatbot-id="${chatBot._id}"></script>`
							);
							toast({
								title: `Copied to Clipboard`,
								status: "info",
								isClosable: true,
							});
						}}
					>
						Copy code
					</Button>
				</HStack>
			</VStack>
			<VStack alignItems="start">
				<Heading fontSize="md">Embedded Chat Interface (No Launcher)</Heading>
				<Text color="gray.500" fontSize="sm">Chat interface is permanently displayed on your web page without a launcher icon.</Text>
				<Box className={styles.codeBlock}>
					<span style={{ color: '#808080' }}>&lt;<span style={{ color: '#ed6a43' }}>iframe</span>
						<span style={{ color: '#0086b3', paddingLeft: '4px' }}> width</span>=<span style={{ color: '#183691' }}>"500px"</span>
						<span style={{ color: '#0086b3', paddingLeft: '4px' }}> height</span>=<span style={{ color: '#183691' }}>"700px"</span>
						<span style={{ color: '#0086b3', paddingLeft: '4px' }}> frameborder</span>=<span style={{ color: '#183691' }}>"0"</span>
						<br></br>
						<span style={{ color: '#0086b3', paddingLeft: '20px' }}> src</span>=<span style={{ color: '#183691' }}>"https://widget.webwhiz.ai/?kbId={chatBot._id}&embed=true&hide-chat-actions=true"</span>
						&gt;</span>
					<br></br>
					<span style={{ color: '#808080' }}>&lt;/<span style={{ color: '#ed6a43' }}>iframe</span>&gt;</span>
				</Box>
				<HStack mt="6">
					<Button
						colorScheme="blue"
						variant="solid"
						size="sm"
						isLoading={isSubmitting}
						isDisabled={isSubmitting}
						onClick={() => {
							navigator.clipboard.writeText(
								`<iframe width="500px" height="700px" frameborder="0"
								src="https://widget.webwhiz.ai/?kbId=${chatBot._id}&embed=true&hide-chat-actions=true">
								</iframe>`
							);
							toast({
								title: `Copied to Clipboard`,
								status: "info",
								isClosable: true,
							});
						}}
					>
						Copy code
					</Button>
				</HStack>
			</VStack>
			<VStack alignItems="start">
				<Heading fontSize="md">Public Link to Chat Interface</Heading>
				<Text color="gray.500" fontSize="sm">
					Share the chat interface with anyone with the below unique link.
				</Text>
				<Box className={styles.codeBlock}>
					<span style={{color: '#0086b3'}}>https://widget.webwhiz.ai/?kbId={chatBot._id}&embed=true&hide-chat-actions=true</span>
				</Box>
				<HStack mt="6">
					<Button
						colorScheme="blue"
						variant="solid"
						size="sm"
						isLoading={isSubmitting}
						isDisabled={isSubmitting}
						onClick={() => {
							navigator.clipboard.writeText(
								`https://widget.webwhiz.ai/?kbId=${chatBot._id}&embed=true&hide-chat-actions=true`
							);
							toast({
								title: `Copied to Clipboard`,
								status: "info",
								isClosable: true,
							});
						}}
					>
						Copy link
					</Button>
				</HStack>
			</VStack>
		</VStack>

	}, [chatBot._id, isSubmitting, toast]);

	const getCustomDataComponent = React.useCallback(() => {

		if (!customTrainingDataPage?.results.length) {

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
				<NoDataFineTuneIcon width="auto" height="250px" />
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
						The more data you add, the better your chatbot response will be.
					</Heading>
				</Box>
			</VStack>
		}

		return <>
			<Box w="450px" className={styles.questionCont} pos="relative">
				{
					isCustomDataLoading && <Flex
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
				}

				<Flex
					direction="column"
					h="calc(100% - 47px)"
					overflowY="auto"
					overflowX="hidden"
				>
					{customTrainingDataPage?.results.map((data) => (
						<Box
							borderBottom="1px"
							borderBottomColor="gray.100"
							bg={selectedTrainingData._id === data._id ? 'gray.100' : 'white'}
							borderRight={selectedTrainingData._id === data._id ? "2px" : "0"}
							borderRightColor="blue.500"
							pr="40px !important"
							className={classNames(styles.questionTab, {
								[styles.activeQuestion]: selectedTrainingData && selectedTrainingData._id === data._id
							})} key={data._id} p="3">
							<Box 
							onClick={async () => {

								try {
									setIsCustomDataDetailsLoading(true)
									const _trainingData = await getTrainingDataDetails(props.match.params.chatbotId, data._id)
									setSelectedTrainingData(_trainingData.data);
									setIsCustomDataDetailsLoading(false)
								} catch (error) {
									console.log('error', error)
								} finally {
									setIsCustomDataDetailsLoading(false)
								}

								console.log('data', data)
							}}>
								<Text fontSize="sm" noOfLines={2} fontWeight="medium">
									{data.title}
								</Text>
							</Box>
							<IconButton
								className={styles.questionDeleteBtn}
								variant='outline'
								colorScheme='gray'
								aria-label='Call Sage'
								fontSize='14px'
								size="xs"
								isLoading={deleteCustomDataLoading && questionsToDelete === data._id}
								onClick={() => {
									setQuestionsToDelete(data._id)
									onDeleteDialogOpen()
								}}
								icon={<RiDeleteBin5Line />}
							/>
						</Box>
					))}
				</Flex>
				
				<Box
					bg="white"
					borderTop="1px"
					borderRight="1px"
					borderColor="gray.200"
					justifyContent="center"
				>
					<Paginator onPageChange={handleCustomDataPageChange} pageRangeDisplayed={5} pageCount={customTrainingDataPage.pages} />
				</Box>
			</Box>
			<Box w="calc(100% - 450px)" overflowY="auto"  className={styles.answerCont}>
				{isCustomDataDetailsLoading && <Box className={styles.customDataloadingCont}>	<Spinner /></Box>}
				{selectedTrainingData && <AddTrainingDataForm knowledgeBaseId={props.match.params.chatbotId} onSubmit={handleTrainingDataUpdate} selectedTrainingData={selectedTrainingData} />}
			</Box>
		</>
	}, [customTrainingDataPage?.results, customTrainingDataPage.pages, isCustomDataLoading, handleCustomDataPageChange, isCustomDataDetailsLoading, selectedTrainingData, props.match.params.chatbotId, handleTrainingDataUpdate, deleteCustomDataLoading, questionsToDelete, onDeleteDialogOpen]);



	const getExcludedPaths = React.useCallback(() => {
		if (!chatBot._id || !chatBot.websiteData) return;
		const excludedPaths = chatBot.websiteData.exclude.join(',')
		return excludedPaths;
	}, [chatBot]);
	const getIncludedPaths = React.useCallback(() => {
		if (!chatBot._id || !chatBot.websiteData) return;
		const includedPaths = chatBot.websiteData.include.join(',')
		return includedPaths;
	}, [chatBot]);
	const getDefaultCustomizationValues = React.useCallback(() => {
		if (!chatBot._id) return;
		return {
			backgroundColor: chatBot.chatWidgeData?.backgroundColor,
			fontColor: chatBot.chatWidgeData?.fontColor,
			placement: chatBot.chatWidgeData?.placement,
			borderRadius: chatBot.chatWidgeData?.borderRadius,
			heading: chatBot.chatWidgeData?.heading,
			description: chatBot.chatWidgeData?.description,
			offlineMessage: chatBot.chatWidgeData?.offlineMessage,
			showReadMore: chatBot.chatWidgeData?.showReadMore === undefined ? chatWidgetDefaultValues.showReadMore : chatBot.chatWidgeData?.showReadMore,
			showAsPopup: chatBot.chatWidgeData?.showAsPopup === undefined ? chatWidgetDefaultValues.showAsPopup : chatBot.chatWidgeData?.showAsPopup,
			popupDelay: chatBot.chatWidgeData?.popupDelay || chatWidgetDefaultValues.popupDelay,
			collectEmailText: chatBot.chatWidgeData?.collectEmailText || chatWidgetDefaultValues.collectEmailText,
			collectEmail: chatBot.chatWidgeData?.collectEmail,
			adminEmail: chatBot.chatWidgeData?.adminEmail,
			customCSS: chatBot.chatWidgeData?.customCSS || chatWidgetDefaultValues.customCSS,
			questionExamples: chatBot.chatWidgeData?.questionExamples || chatWidgetDefaultValues.questionExamples,
			welcomeMessages: chatBot.chatWidgeData?.welcomeMessage ? [chatBot.chatWidgeData?.welcomeMessage] : chatBot.chatWidgeData?.welcomeMessages || chatWidgetDefaultValues.welcomeMessages,
			prompt: chatBot.prompt || chatWidgetDefaultValues.prompt,
			defaultAnswer: chatBot.defaultAnswer || chatWidgetDefaultValues.defaultAnswer,
			launcherIcon: chatBot.chatWidgeData?.launcherIcon || chatWidgetDefaultValues.launcherIcon,
			chatInputPlaceholderText: chatBot.chatWidgeData?.chatInputPlaceholderText || chatWidgetDefaultValues.chatInputPlaceholderText,
			assistantTabHeader: chatBot.chatWidgeData?.assistantTabHeader || chatWidgetDefaultValues.assistantTabHeader,
			offlineMsgTabHeader: chatBot.chatWidgeData?.offlineMsgTabHeader || chatWidgetDefaultValues.offlineMsgTabHeader,
			readMoreText: chatBot.chatWidgeData?.readMoreText || chatWidgetDefaultValues.readMoreText,
			offlineMsgHeading: chatBot.chatWidgeData?.offlineMsgHeading || chatWidgetDefaultValues.offlineMsgHeading,
			offlineMsgDescription: chatBot.chatWidgeData?.offlineMsgDescription || chatWidgetDefaultValues.offlineMsgDescription,
			nameFieldLabel: chatBot.chatWidgeData?.nameFieldLabel || chatWidgetDefaultValues.nameFieldLabel,
			nameFieldPlaceholder: chatBot.chatWidgeData?.nameFieldPlaceholder || chatWidgetDefaultValues.nameFieldPlaceholder,
			emailFieldLabel: chatBot.chatWidgeData?.emailFieldLabel || chatWidgetDefaultValues.emailFieldLabel,
			emailFieldPlaceholder: chatBot.chatWidgeData?.emailFieldPlaceholder || chatWidgetDefaultValues.emailFieldPlaceholder,
			msgFieldLabel: chatBot.chatWidgeData?.msgFieldLabel || chatWidgetDefaultValues.msgFieldLabel,
			msgFieldPlaceholder: chatBot.chatWidgeData?.msgFieldPlaceholder || chatWidgetDefaultValues.msgFieldPlaceholder,
			requiredFieldMsg: chatBot.chatWidgeData?.requiredFieldMsg || chatWidgetDefaultValues.requiredFieldMsg,
			invalidEmailMsg: chatBot.chatWidgeData?.invalidEmailMsg || chatWidgetDefaultValues.invalidEmailMsg,
			formSubmitBtnLabel: chatBot.chatWidgeData?.formSubmitBtnLabel || chatWidgetDefaultValues.formSubmitBtnLabel,
			formSubmitBtnSubmittingText: chatBot.chatWidgeData?.formSubmitBtnSubmittingText || chatWidgetDefaultValues.formSubmitBtnSubmittingText,
			formSubmitSuccessMsg: chatBot.chatWidgeData?.formSubmitSuccessMsg || chatWidgetDefaultValues.formSubmitSuccessMsg,
			formSubmitErrorMsg: chatBot.chatWidgeData?.formSubmitErrorMsg || chatWidgetDefaultValues.formSubmitErrorMsg,
			formSendAgainBtnLabel: chatBot.chatWidgeData?.formSendAgainBtnLabel || chatWidgetDefaultValues.formSendAgainBtnLabel,
			formTryAgainBtnLabel: chatBot.chatWidgeData?.formTryAgainBtnLabel || chatWidgetDefaultValues.formTryAgainBtnLabel,
			model: chatBot.chatWidgeData?.model || chatWidgetDefaultValues.model,
		};
	}, [chatBot]);


	const onChatEvent = React.useCallback((data: { msg: string; sessionId: string; sender: 'admin' }) => {
        console.log(data.msg, 'received');
    }, []);

	useEffect(() => {
		const onConnect = () => {
			console.log('connected');
		}
		const onDisconnect = () => {
			console.log('disconnected');
		}
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('admin_chat', onChatEvent);
		return () => {
			console.log('unmounting');
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('admin_chat', onChatEvent);
		};
	}, [onChatEvent]);


	const getMainComponent = React.useCallback(() => {
		if (!chatBot._id) {
			return (
				<Flex h="100%" alignItems="center" justifyContent="center">
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
		return (
			<>
				<Flex
					h="100%"
					direction="column"
					style={{
						display: currentStep === "product-setup" ? "flex" : "none",
					}}
				>
					<ChatBotProductSetup
						onCrawlDataPaginationClick={getCrawlDataPagination}
						onDocsDataPaginationClick={getDocsDataPagination}
						defaultWebsite={chatBot.websiteData?.websiteUrl}
						defaultExcludedPaths={getExcludedPaths()}
						defaultIncludedPaths={getIncludedPaths()}
						onTabsChange={handleTabChange}
						showSecondaryButton
						disableTabs={false}
						onSecondaryBtnClick={() => {
							history.push("/app/chat-bots/");
						}}
						defaultCrauledData={defaultCrauledData}
						isSubmitting={isSubmitting}
						isUploadingDocs={isUploadingDocs}
						docsDataLoading={docsDataLoading}
						docsData={docsData}
						crawlDataLoading={crawlDataLoading}
						loadingText={productSetupLoadingText}
						primaryButtonLabel={primaryButtonLabel}
						disableWebsiteInput={true}
						onPrimaryBtnClick={(formValues : ProductSetupData, hasWebsiteDataChanged: boolean) => {
							handleChatbotUpdate(formValues)
						}}
					/>
				</Flex>
				<Flex
					h="100%"
					direction="column"
					style={{
						display: currentStep === "customize" ? "flex" : "none",
					}}
				>
                    {
                        chatBot._id && <ChatBotsCustomize
                            onBackClick={() => {
                                history.push("/app/chat-bots/");
                            }}
                            isSubmitting={isSubmitting}
                            primaryButtonLabel="Update widget style"
                            defaultCustomizationValues={getDefaultCustomizationValues()}
                            onNextClick={async (formData: ChatBotCustomizeData) => {

                                try {
                                    setIsSubmitting(true)
                                    customizeWidget(chatBot._id, formData);
                                    updatePrompt(chatBot._id, formData.prompt || '');
                                    updateDefaultAnswer(chatBot._id, formData.defaultAnswer || '');
																	updateAdminEmail(chatBot._id, formData.adminEmail || '');
																	updateModelName(chatBot._id, formData.model || '');
									toast({
										title: `Chatbot customizations have been updated successfully`,
										status: "success",
										isClosable: true,
									});
                                } catch (error) {
									toast({
										title: `Oops! Something went wrong`,
										status: "error",
										isClosable: true,
									});
                                } finally {
                                    setIsSubmitting(false)
                                }
                            }}
                        />
                    }
					
				</Flex>
				<Flex
					direction="column"
					style={{
						display: currentStep === "add-to-site" ? "flex" : "none",
					}}
					h="100%" overflow="auto"
				>
					<SectionTitle title="Add to your website" description="Choose any of the below options to add the chatbot to your website." />
					<Flex direction="column" alignItems="start">
						{getAddToWebsiteContent()}
					</Flex>
				</Flex>
				<Flex
					direction="column"
					style={{
						display: currentStep === "train-custom-data" ? "flex" : "none",
					}}
					alignItems="center"
					h="100%" overflow="auto"
				>
					<VStack alignItems="start" w="100%" position="relative">
						<SectionTitle title="Fine tune data" description="Improve your chatbot by adding more training data. The more you add, the better its responses. Group logically & avoid lengthy inputs." />
						<Box position="absolute" right="0" bottom="8">
							<AddTrainingData knowledgeBaseId={props.match.params.chatbotId} onSubmit={handleTrainingDataSave} answer="" question="" />

						</Box>
					</VStack>
					<Flex w="100%" className={styles.trainingDataCont}>
						{getCustomDataComponent()}
					</Flex>
				</Flex>
				{currentStep === "chat-sessions" ? <Flex
					direction="column"
					style={{
						display: currentStep === "chat-sessions" ? "flex" : "none",
					}}
					alignItems="center"
					h="100%" overflow="auto"
				>
					<SectionTitle title="Chat sessions" description="All the chat sessions with your customers." />
					<Flex w="100%" className={styles.trainingDataCont}>
						{ <ChatSessionsNew chatbotId={props.match.params.chatbotId}  />}
					</Flex>
				</Flex> : null}
				<Flex
					direction="column"
					style={{
						display: currentStep === 'custom-domain' ? 'flex' : 'none',
					}}
					h="100%"
					overflow="auto"
					>
					<SectionTitle
						title="Set custom domain"
						description="Access the chatbot from your domain"
					/>
						{chatBot._id? <CustomDomain defaultCustomDomain={chatBot.customDomain} chatBotId={chatBot._id}></CustomDomain>: null}
					</Flex>
				<Flex
					direction="column"
					style={{
						display: currentStep === "offline-messages" ? "flex" : "none",
					}}
					alignItems="center"
					h="100%" overflow="auto"
				>
					<SectionTitle title="Offline messages" description="Offline messages sent by your customers." />
					<Flex w="100%" className={styles.trainingDataCont}>
						{offlineMessages && offlineMessages.results && <OfflineMessagesNew isChatListLoading={isChatLoading} onPageChange={handleOfflinePageClick} chatSessionsPage={offlineMessages} />}
					</Flex>
				</Flex>
				<Flex
					direction="column"
					style={{
						display: currentStep === "chatbot" ? "flex" : "none",
					}}
					alignItems="center"
					h="100%" overflow="auto"
				>
					<SectionTitle title="Try out chatbot" description="Chat with your chatbot and see how it responds. If you don't get the desired response, follow the instructions below." />
					<HStack w="100%">
						<Box w="50%">
						
							<ChatBot knowledgeBaseId={chatBot._id} customStyle={chatBot.chatWidgeData} defaultMessageNumber={0} />

						</Box>
						<Box w="50%" pos="relative" h="100%">
							<Flex className={styles.resultTips} direction="column">
								<Alert status='info' flexShrink={0} borderRadius="md">
									<Text as="span" color="blue.500" mt="2px" mr="4">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</Text>
									<Box>
										<AlertTitle fontWeight="600">Not getting correct response?</AlertTitle>
										<AlertDescription fontSize="14px" color="#004c77">
											It is all about the training data. Here are some ways to improve the accuracy of your chatbot.
										</AlertDescription>
									</Box>
								</Alert>
								<Box className={styles.resultTip}>
									<Box className={styles.resultTipNumber} > 1</Box>
									<Heading className={styles.resultTipHeading} fontSize="medium">Add more training Data</Heading>
									<Text className={styles.resultTipDescg}>The more data you add, the better the chatbot response will be. You can add custom data to train in the form of question-answer pairs from the <Text as="span" cursor="pointer" textDecoration="underline" onClick={() => {
										goToStep("train-custom-data");
									}}>Train custom data</Text> section </Text>
								</Box>
								<Box className={styles.resultTip}>
									<Box className={styles.resultTipNumber} > 2</Box>
									<Heading className={styles.resultTipHeading} fontSize="medium">Ensure Correct Crawling of Website Pages.</Heading>
									<Text className={styles.resultTipDescg}>verify that all the necessary pages on your website are crawled correctly. To do this, head to the <Text as="span" cursor="pointer" textDecoration="underline" onClick={() => {
										goToStep("product-setup");
									}}>Data sources</Text> tab and click on the "View Crawled Data" button. </Text>
								</Box>
								<Box className={styles.resultTip}>
									<Box className={styles.resultTipNumber} > 3</Box>
									<Heading className={styles.resultTipHeading} fontSize="medium">Train Chatbot with Previous Support Questions</Heading>
									<Text className={styles.resultTipDescg}>To reduce the number of repetitive emails and inquiries, make sure to train your chatbot with past support questions and answers. </Text>
								</Box>
								<Box className={styles.resultTip}>
									<Box className={styles.resultTipNumber} > 4</Box>
									<Heading className={styles.resultTipHeading} fontSize="medium">Contact Us</Heading>
									<Text className={styles.resultTipDescg}>Still not statisfied? Email us at <a href="mailto:hi@webwhiz.ai" style={{ textDecoration: 'underline' }}>hi@webwhiz.ai</a> or schedule a <a href="https://tidycal.com/neravath/webwhiz-15-minute-meeting" target="_blank" style={{ textDecoration: 'underline' }}>meeting.</a> We'll help you with the setup </Text>
								</Box>
							</Flex>
						</Box>
					</HStack>
				</Flex>
			</>
		);
	}, [chatBot._id, chatBot.websiteData?.websiteUrl, chatBot.customDomain, chatBot.chatWidgeData, currentStep, getCrawlDataPagination, getDocsDataPagination, getExcludedPaths, getIncludedPaths, handleTabChange, defaultCrauledData, isSubmitting, isUploadingDocs, docsDataLoading, docsData, crawlDataLoading, productSetupLoadingText, primaryButtonLabel, getDefaultCustomizationValues, getAddToWebsiteContent, props.match.params.chatbotId, handleTrainingDataSave, getCustomDataComponent, isChatLoading, offlineMessages, handleOfflinePageClick, history, handleChatbotUpdate, toast, goToStep]);

	const getEmbedErrorComponent = React.useCallback(() => {
		if(!isEmbedError) return null;
		return <Alert status='warning'>
			<AlertIcon />
			Unable to create chatbot. Please try again or contact support
		</Alert>
	}, [isEmbedError]);

	return (
		<VStack w="100%" h="100vh" overflow="hidden" spacing={0}>
			<Flex shrink={0} alignItems="center" w="100%" justifyContent="start" h="48px" bg="blue.500" color="white" pl="5">
				<Link to="/app/chat-bots/">
					<Flex alignItems="center">
						<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
						<Heading ml="2" color="white" fontSize="14" fontWeight="400">Chatbots</Heading>
					</Flex>
				</Link>
			</Flex>
			{
				getEmbedErrorComponent()
			}
			
			<Flex flex={1} h="calc(100% - 100px)" w="100%">
				<HStack spacing="0" w="100%">
					<Box
						h="100%"
						w="260px"
						shadow="inner"
						bg="#faf9ff"
						flexShrink={0}
						borderRadius="lg"
						pt="8"
						className={styles.sidebar}
					>
						<Box className={styles.title}>{chatBot.name}</Box>
						<List spacing={2}>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								className={currentStep === "product-setup" ? styles.active : ""}
								cursor="pointer"
								onClick={() => {
									goToStep("product-setup");
								}}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M9 21V13.6C9 13.0399 9 12.7599 9.10899 12.546C9.20487 12.3578 9.35785 12.2049 9.54601 12.109C9.75992 12 10.0399 12 10.6 12H13.4C13.9601 12 14.2401 12 14.454 12.109C14.6422 12.2049 14.7951 12.3578 14.891 12.546C15 12.7599 15 13.0399 15 13.6V21M11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								Data sources
							</ListItem>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								className={currentStep === "train-custom-data" ? styles.active : ""}
								cursor="pointer"
								onClick={() => {
									goToStep("train-custom-data");
								}}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 5C21 6.65685 16.9706 8 12 8C7.02944 8 3 6.65685 3 5M21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5M21 5V19C21 20.66 17 22 12 22C7 22 3 20.66 3 19V5M21 12C21 13.66 17 15 12 15C7 15 3 13.66 3 12" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								Train Custom Data
							</ListItem>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								className={currentStep === "chat-sessions" ? styles.active : ""}
								cursor="pointer"
								onClick={() => {
									goToStep("chat-sessions");
								}}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M7.5 12H7.51M12 12H12.01M16.5 12H16.51M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.1971 3.23374 14.3397 3.65806 15.3845C3.73927 15.5845 3.77988 15.6845 3.798 15.7653C3.81572 15.8443 3.8222 15.9028 3.82221 15.9839C3.82222 16.0667 3.80718 16.1569 3.77711 16.3374L3.18413 19.8952C3.12203 20.2678 3.09098 20.4541 3.14876 20.5888C3.19933 20.7067 3.29328 20.8007 3.41118 20.8512C3.54589 20.909 3.73218 20.878 4.10476 20.8159L7.66265 20.2229C7.84309 20.1928 7.9333 20.1778 8.01613 20.1778C8.09715 20.1778 8.15566 20.1843 8.23472 20.202C8.31554 20.2201 8.41552 20.2607 8.61549 20.3419C9.6603 20.7663 10.8029 21 12 21ZM8 12C8 12.2761 7.77614 12.5 7.5 12.5C7.22386 12.5 7 12.2761 7 12C7 11.7239 7.22386 11.5 7.5 11.5C7.77614 11.5 8 11.7239 8 12ZM12.5 12C12.5 12.2761 12.2761 12.5 12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12ZM17 12C17 12.2761 16.7761 12.5 16.5 12.5C16.2239 12.5 16 12.2761 16 12C16 11.7239 16.2239 11.5 16.5 11.5C16.7761 11.5 17 11.7239 17 12Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								Chat sessions
							</ListItem>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								className={currentStep === "offline-messages" ? styles.active : ""}
								cursor="pointer"
								onClick={() => {
									goToStep("offline-messages");
								}}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2 7L10.1649 12.7154C10.8261 13.1783 11.1567 13.4097 11.5163 13.4993C11.8339 13.5785 12.1661 13.5785 12.4837 13.4993C12.8433 13.4097 13.1739 13.1783 13.8351 12.7154L22 7M6.8 20H17.2C18.8802 20 19.7202 20 20.362 19.673C20.9265 19.3854 21.3854 18.9265 21.673 18.362C22 17.7202 22 16.8802 22 15.2V8.8C22 7.11984 22 6.27976 21.673 5.63803C21.3854 5.07354 20.9265 4.6146 20.362 4.32698C19.7202 4 18.8802 4 17.2 4H6.8C5.11984 4 4.27976 4 3.63803 4.32698C3.07354 4.6146 2.6146 5.07354 2.32698 5.63803C2 6.27976 2 7.11984 2 8.8V15.2C2 16.8802 2 17.7202 2.32698 18.362C2.6146 18.9265 3.07354 19.3854 3.63803 19.673C4.27976 20 5.11984 20 6.8 20Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>


								Offline messages
							</ListItem>
							{/* You can also use custom icons from react-icons */}
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								cursor="pointer"
								onClick={() => {
									goToStep("customize");
								}}
								className={currentStep === "customize" ? styles.active : ""}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2 12C2 17.5228 6.47715 22 12 22C13.6569 22 15 20.6569 15 19V18.5C15 18.0356 15 17.8034 15.0257 17.6084C15.2029 16.2622 16.2622 15.2029 17.6084 15.0257C17.8034 15 18.0356 15 18.5 15H19C20.6569 15 22 13.6569 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									<path d="M7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									<path d="M16 9C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7C15.4477 7 15 7.44772 15 8C15 8.55228 15.4477 9 16 9Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									<path d="M10 8C10.5523 8 11 7.55228 11 7C11 6.44772 10.5523 6 10 6C9.44772 6 9 6.44772 9 7C9 7.55228 9.44772 8 10 8Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								Customize
							</ListItem>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								cursor="pointer"
								onClick={() => {
									goToStep("add-to-site");
								}}
								className={currentStep === "add-to-site" ? styles.active : ""}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M22 9H2M14 17.5L16.5 15L14 12.5M10 12.5L7.5 15L10 17.5M2 7.8L2 16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27977 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3L6.8 3C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>


								Add to site
							</ListItem>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								cursor="pointer"
								onClick={() => {
									goToStep("chatbot");
								}}
								className={currentStep === "chatbot" ? styles.active : ""}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8.5 12.5C8.5 12.5 9.8125 14 12 14C14.1875 14 15.5 12.5 15.5 12.5M14.75 7.5H14.76M9.25 7.5H9.26M7 18V20.3355C7 20.8684 7 21.1348 7.10923 21.2716C7.20422 21.3906 7.34827 21.4599 7.50054 21.4597C7.67563 21.4595 7.88367 21.2931 8.29976 20.9602L10.6852 19.0518C11.1725 18.662 11.4162 18.4671 11.6875 18.3285C11.9282 18.2055 12.1844 18.1156 12.4492 18.0613C12.7477 18 13.0597 18 13.6837 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V14C3 14.93 3 15.395 3.10222 15.7765C3.37962 16.8117 4.18827 17.6204 5.22354 17.8978C5.60504 18 6.07003 18 7 18ZM15.25 7.5C15.25 7.77614 15.0261 8 14.75 8C14.4739 8 14.25 7.77614 14.25 7.5C14.25 7.22386 14.4739 7 14.75 7C15.0261 7 15.25 7.22386 15.25 7.5ZM9.75 7.5C9.75 7.77614 9.52614 8 9.25 8C8.97386 8 8.75 7.77614 8.75 7.5C8.75 7.22386 8.97386 7 9.25 7C9.52614 7 9.75 7.22386 9.75 7.5Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>

								Try ChatBot
							</ListItem>
							<ListItem
								display="flex"
								alignItems="center"
								fontSize="md"
								cursor="pointer"
								onClick={() => {
									goToStep("custom-domain");
								}}
								className={currentStep === "custom-domain" ? styles.active : ""}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2C15 4 15.9228 8.29203 16 12C15.9228 15.708 15 20 12 22M12 2C9 4 8.07725 8.29203 8 12C8.07725 15.708 9 20 12 22M12 2C6.47715 2 2 6.47715 2 12M12 2C17.5228 2 22 6.47715 22 12M12 22C17.5229 22 22 17.5228 22 12M12 22C6.47716 22 2 17.5228 2 12M22 12C20 15 15.708 15.9228 12 16C8.29203 15.9228 4 15 2 12M22 12C20 9 15.708 8.07725 12 8C8.29203 8.07725 4 9 2 12" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>


								Custom domain
							</ListItem>
						</List>
					</Box>
					<Box
						w="100%"
						p="10"
						pt="8"
						pb="8"
						bg="white"
						shadow="sm"
						h="100%"
						borderRadius="lg"
						position="relative"
					>
						{getMainComponent()}
					</Box>
				</HStack>
			</Flex>
			<AlertDialog
				isOpen={isDeleteDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteDialogClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Delete CustomData
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure? You can't undo this action afterwards.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button size="sm" ref={cancelRef} onClick={onDeleteDialogClose}>
								Cancel
							</Button>
							<Button size="sm" colorScheme='red'
								onClick={() => {
									handleQuestionDelete()
								}}
								ml={3}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</VStack>
	);
};
export default withRouter(EditChatbot);
