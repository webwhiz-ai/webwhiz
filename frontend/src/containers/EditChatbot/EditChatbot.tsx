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
import { fetchKnowledgebaseCrawlData, customizeWidget, deleteTrainingData, fetcKnowledgebase, fetchKnowledgebaseDetails, generateEmbeddings, getTrainingData, getTrainingDataDetails, updateWebsiteData, getChatSessions, getOfflineMessages, updatePrompt } from "../../services/knowledgebaseService";
import { ChatBot } from "../../components/ChatBot/ChatBot";
import { chatWidgetDefaultValues, getDomainFromUrl } from "../../utils/commonUtils";
import { AddTrainingData } from "../AddTrainingData/AddTrainingData";
import { AddTrainingDataForm } from "../AddTrainingDataForm/AddTrainingDataForm";
import { NoDataSubscribeIcon } from "../../components/Icons/noData/NoDataSubscribeIcon";
import { ChatSessions } from "../ChatSessions/ChatSessions";
import { OfflineMessages } from "../OfflineMessages/OfflineMessages";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { CurrentUser, User } from "../../services/appConfig";
import { ChatBotCustomizeData, OfflineMessage, TrainingData, ChatSession, OfflineMessagePagination, ChatSessionPagination } from "../../types/knowledgebase.type";
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
	| "chatbot";

interface MatchParams {
	chatbotId: string;
}

export type EditChatbotProps = RouteComponentProps<MatchParams>;

const EditChatbot = (props: EditChatbotProps) => {
	const toast = useToast();
	let history = useHistory();
	let { search } = useLocation();

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

	const defaultStep = new URLSearchParams(search).get("step") as Steps;

	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
	const [questionsToDelete, setQuestionsToDelete] = React.useState<string>('0');
	const [chatBot, setChatbot] = React.useState({} as any);
	const [defaultCrauledData, setDefaultCrauledData] = React.useState<any>();


	const [currentStep, setCurrentStep] = React.useState<Steps>(
		defaultStep || "product-setup"
	);


	const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();

	const cancelRef = React.useRef()


	const [isChatLoading, setIsChatLoading] = React.useState<boolean>(false);

	const [crawlDataLoading, setIrawlDataLoading] = React.useState<boolean>(false);
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

	const [productSetupLoadingText, setProductSetupLoadingText] = React.useState("Setting up your product");

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
					welcomeMessage: chatWidgetDefaultValues.welcomeMessage
				}

				const _crawlDataResponse = await fetchKnowledgebaseCrawlData(chatBotData._id, 1);

				const _data = {
					stats: chatBotData.crawlData?.stats,
					urls: _crawlDataResponse.data.results,
					pages: _crawlDataResponse.data.pages,
					knowledgebaseId: chatBotData._id
				}

				setDefaultCrauledData(_data)
				setChatbot(response.data);
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
		}
		fetchData();
	}, [props.match.params.chatbotId]);

	const [chatSessions, setChatSessions] = React.useState<ChatSessionPagination>(
		{
			results: [] as ChatSession[],
			pages: 0,
		} as ChatSessionPagination
	);
	const [offlineMessages, setOfflineMessages] = React.useState<OfflineMessagePagination>(
		{
			results: [] as OfflineMessage[],
			pages: 0,
		} as OfflineMessagePagination
	);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await getChatSessions(props.match.params.chatbotId, '1');
				setChatSessions(response.data);
				//setSelectedTrainingData(response.data[0] || {});
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
			try {
				const response = await getOfflineMessages(props.match.params.chatbotId, '1');
				setOfflineMessages(response.data);
				//setSelectedTrainingData(response.data[0] || {});
			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
		}
		fetchData();
	}, [props.match.params.chatbotId]);


	const handlePageClick = React.useCallback(async (event) => {
		try {
			setIsChatLoading(true);
			const response = await getChatSessions(props.match.params.chatbotId, event.selected + 1);
			setChatSessions(response.data);
			//setSelectedTrainingData(response.data[0] || {});
		} catch (error) {
			console.log("Unable to fetch chats", error);
		} finally {
			setIsChatLoading(false);
		}
	}, [props.match.params.chatbotId]);


	const handleOfflinePageClick = React.useCallback(async (event) => {
		try {
			setIsChatLoading(true);
			const response = await getOfflineMessages(props.match.params.chatbotId, event.selected + 1);
			setOfflineMessages(response.data);
			//setSelectedTrainingData(response.data[0] || {});
		} catch (error) {
			console.log("Unable to fetch chats", error);
		} finally {
			setIsChatLoading(false);
		}
	}, [props.match.params.chatbotId]);

	const [deleteCustomDataLoading, setDeleteCustomDataLoading] = React.useState(false);

	const [trainingData, setTrainingData] = React.useState<TrainingData[]>(
		[] as TrainingData[]
	);
	const [selectedTrainingData, setSelectedTrainingData] = React.useState<TrainingData>(
		{} as TrainingData
	);

	const [isCustomDataDetailsLoading, setIsCustomDataDetailsLoading] = React.useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await getTrainingData(props.match.params.chatbotId);

				console.log('response.data.results', response.data.results)
				const data = response.data.results || [];
				setTrainingData(data);
				if (data.length > 0) {
					setIsCustomDataDetailsLoading(true)
					const _trainingData = await getTrainingDataDetails(props.match.params.chatbotId, data[0]?._id)
					console.log('response.data.results details', _trainingData)
					setSelectedTrainingData(_trainingData.data);
					setIsCustomDataDetailsLoading(false)
				}

			} catch (error) {
				console.log("Unable to fetch chatbots", error);
			} finally {
			}
		}
		fetchData();
	}, [props.match.params.chatbotId]);


	const handleQuestionDelete = React.useCallback(async () => {
		const id = questionsToDelete;
		setDeleteCustomDataLoading(true);
		try {
			await deleteTrainingData(props.match.params.chatbotId, id as string);
			setTrainingData(trainingData?.filter((data) => data._id !== id));
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


	}, [onDeleteDialogClose, props.match.params.chatbotId, questionsToDelete, toast, trainingData]);


	const goToStep = React.useCallback((step: Steps) => {
		setCurrentStep(step);
	}, []);

	const handleTrainingDataSave = React.useCallback((values) => {
		console.log("values", values);

		setTrainingData([values, ...trainingData]);

	}, [trainingData]);

	const handleTrainingDataUpdate = React.useCallback((values) => {

		const trainingDataToUpdate = trainingData.find((data) => data._id === values._id);
		console.log("trainingDataToUpdate", trainingDataToUpdate);
		console.log("values", values);
		if (trainingDataToUpdate) {
			trainingDataToUpdate.title = values.q;
			trainingDataToUpdate.content = values.a;

			setTrainingData([...trainingData]);
		}

	}, [trainingData]);


	const getAddToWebsiteContent = React.useCallback(() => {
		console.log("user", user);
		if (user && user?.subscriptionData?.name === 'FREE') {
			return <VStack
				alignItems="center"
				direction="column"
				justifyContent="center"
				pt={32}
				pb={32}
				spacing="9"
			>
				<NoDataSubscribeIcon width="auto" height="180px" />
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
						Upgrade to a paid plan to add chatbot to your website
					</Heading>
					<Link to="/app/settings/subscription">
						<Button variant='outline' colorScheme='blue' size='md'>Subscribe Now</Button>
					</Link>
				</Box>
			</VStack>
		}



		return <>
			<Box className={styles.codeBlock}>
				<span style={{ color: '#808080' }}>&lt;<span style={{ color: '#ed6a43' }}>script</span>
					<span style={{ color: '#0086b3' }}> id</span>=<span style={{ color: '#183691' }}>"__webwhizSdk__"</span>
					<br></br>
					<span style={{ color: '#0086b3', paddingLeft: '20px' }}> src</span>=<span style={{ color: '#183691' }}>"https://widget.webwhiz.ai/webwhiz-sdk.js"</span>
					<br></br>
					<span style={{ color: '#0086b3', paddingLeft: '20px' }}> chatbotId</span>=<span style={{ color: '#183691' }}>"{chatBot._id}"</span>
					&gt;</span>
				<br></br>
				<span style={{ color: '#808080' }}>&lt;/<span style={{ color: '#ed6a43' }}>script</span>&gt;</span>
			</Box>
			{/* <Code p="4" shadow="sm" mt="12" borderRadius="md">
						<pre>
								&lt;script
								id="__webwhizSdk__" 
								src="https://widget.webwhiz.ai/webwhiz-sdk.js" 
								chatbotId="{chatBot._id}"&gt;
								&lt;/script&gt;
						</pre>
						</Code> */}
			<HStack mt="6">
				<Link to="/app/chat-bots/">
					<Button size="sm" variant="outline">View ChatBots</Button>
				</Link>
				<Button
					colorScheme="blue"
					variant="solid"
					size="sm"
					isLoading={isSubmitting}
					isDisabled={isSubmitting}
					onClick={() => {
						navigator.clipboard.writeText(
							`<script id="__webwhizSdk__" src="https://widget.webwhiz.ai/webwhiz-sdk.js" chatbotId="${chatBot._id}"></script>`
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
		</>

	}, [chatBot._id, isSubmitting, toast, user]);

	const getCustomDataComponent = React.useCallback(() => {

		if (!trainingData.length) {

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
			<Box w="50%" className={styles.questionCont}>
				{trainingData.map((data) => (
					<Box className={classNames(styles.questionTab, {
						[styles.activeQuestion]: selectedTrainingData && selectedTrainingData._id === data._id
					})} key={data._id} p="3">
						<Box onClick={async () => {

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
							{data.title}
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
			</Box>
			<Box w="50%" className={styles.answerCont}>
				{isCustomDataDetailsLoading && <Box className={styles.customDataloadingCont}>	<Spinner /></Box>}
				{selectedTrainingData && <AddTrainingDataForm knowledgeBaseId={props.match.params.chatbotId} onSubmit={handleTrainingDataUpdate} selectedTrainingData={selectedTrainingData} />}
			</Box>
		</>
	}, [deleteCustomDataLoading, handleTrainingDataUpdate, isCustomDataDetailsLoading, onDeleteDialogOpen, props.match.params.chatbotId, questionsToDelete, selectedTrainingData, trainingData]);



	const getExcludedPaths = React.useCallback(() => {
		if (!chatBot._id) return;
		const excludedPaths = chatBot.websiteData.exclude.join(',')
		return excludedPaths;
	}, [chatBot]);
	const getIncludedPaths = React.useCallback(() => {
		if (!chatBot._id) return;
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
			welcomeMessage: chatBot.chatWidgeData?.welcomeMessage || chatWidgetDefaultValues.welcomeMessage,
			questionExamples: chatBot.chatWidgeData?.questionExamples || chatWidgetDefaultValues.questionExamples
		};
	}, [chatBot]);

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
						defaultWebsite={chatBot.websiteData.websiteUrl}
						defaultExcludedPaths={getExcludedPaths()}
						defaultIncludedPaths={getIncludedPaths()}
						showSecondaryButton
						onSecondaryBtnClick={() => {
							history.push("/app/chat-bots/");
						}}
						defaultCrauledData={defaultCrauledData}
						isSubmitting={isSubmitting}
						crawlDataLoading={crawlDataLoading}
						loadingText={productSetupLoadingText}
						primaryButtonLabel="Update Data"
						disableWebsiteInput={true}
						onPrimaryBtnClick={async (formValues) => {



							setProductSetupLoadingText('Crawling your website data.. This may take some time based on the amount of the data...');
							setIsSubmitting(true);
							console.log('payload', formValues)
							// try {
							// 	const response = await createKnowledgebase(payLoad);
							// 	setIsChatbotCreated(true);

							// 	let interval = setInterval(async () => {
							// 		const details = await fetchKnowledgebaseDetails(response.data._id);
							// 		console.log("details", details);
							// 		if(details.data.status === 'CRAWL_ERROR') {
							// 			clearInterval(interval);
							// 			setIsChatbotCreated(false);
							// 			toast({
							// 				title: `Oops! Something went wrong`,
							// 				status: "error",
							// 				isClosable: true,
							// 			});
							// 			//setCrauledData(details.data.crawlData);
							// 		} else if (details.data.status === 'CRAWLED') {
							// 			clearInterval(interval);
							// 			setIsChatbotCreated(false);
							// 			setCreatingEmbeding(true);
							// 			await generateEmbeddings(details._id);
							// 		}
							// 	}, 2000);


							// } catch (error) {
							// }


							try {

								const response = await updateWebsiteData(chatBot._id, {
									urls: [],
									websiteUrl: formValues.websiteUrl,
									include: formValues.include,
									exclude: formValues.exclude,
								})

								let interval = setInterval(async () => {
									const details = await fetchKnowledgebaseDetails(response.data._id);
									console.log("details", details);
									const chatBotId = details.data._id
									if (details.data.status === 'CRAWLED') {
										//setDefaultCrauledData(details.data.)
										//Training ChatGPT with your website data...

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


									}
								}, 2000);


							} catch (error) {
								setIsSubmitting(false);
								const errorData = error?.response?.data?.message
								toast({
									title: (errorData && errorData[0]) || 'Oops! Something went wrong',
									status: "error",
									isClosable: true,
								});
							}
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
                            defaultPrompt={chatBot.prompt}
                            primaryButtonLabel="Update widget style"
                            defaultCustomizationValues={getDefaultCustomizationValues()}
                            onNextClick={async (formData: ChatBotCustomizeData) => {

                                try {
                                    setIsSubmitting(true)
                                    customizeWidget(chatBot._id, formData);
                                    updatePrompt(chatBot._id, formData.prompt || '');
                                } catch (error) {

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
					<SectionTitle title="Add to your website" description="Add the below script to your site to embed chatbot." />
					<Flex direction="column" >
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
						<SectionTitle title="Fine tune data" description="Improve your chatbot by adding more Q&A training data. The more you add, the better its responses. Group logically & avoid lengthy inputs." />
						<Box position="absolute" right="0" bottom="8">
							<AddTrainingData knowledgeBaseId={props.match.params.chatbotId} onSubmit={handleTrainingDataSave} answer="" question="" />

						</Box>
					</VStack>
					<Flex w="100%" className={styles.trainingDataCont}>
						{getCustomDataComponent()}
					</Flex>
				</Flex>
				<Flex
					direction="column"
					style={{
						display: currentStep === "chat-sessions" ? "flex" : "none",
					}}
					alignItems="center"
					h="100%" overflow="auto"
				>
					<SectionTitle title="Chat sessions" description="All the chat sessions with your customers." />
					<Flex w="100%" className={styles.trainingDataCont}>
						{chatSessions && <ChatSessions isChatLoading={isChatLoading} handlePageClick={handlePageClick} chatData={chatSessions} />}
					</Flex>
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
						{offlineMessages && <OfflineMessages isChatLoading={isChatLoading} handlePageClick={handleOfflinePageClick} chatData={offlineMessages} />}
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
							<ChatBot knowledgeBaseId={chatBot._id} customStyle={chatBot.chatWidgeData} defaultMessageNumber={((chatSessions?.results) || []).length} />

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
									}}>product setup</Text> tab and click on the "View Crawled Data" button. </Text>
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
	}, [chatBot, currentStep, getCrawlDataPagination, getExcludedPaths, getIncludedPaths, defaultCrauledData, isSubmitting, crawlDataLoading, productSetupLoadingText, getDefaultCustomizationValues, getAddToWebsiteContent, props.match.params.chatbotId, handleTrainingDataSave, getCustomDataComponent, chatSessions, isChatLoading, handlePageClick, offlineMessages, handleOfflinePageClick, history, toast, goToStep]);

	return (
		<VStack w="100%" h="100vh" overflow="hidden" spacing={0}>
			<Flex shrink={0} alignItems="center" w="100%" justifyContent="start" h="48px" bg="blue.500" color="white" pl="5">
				<Link to="/app/chat-bots/">
					<Flex alignItems="center">
						<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
						<Heading ml="2" color="white" fontSize="14" fontWeight="400">Chat bots</Heading>
					</Flex>
				</Link>
			</Flex>
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
						<Box className={styles.title}>{getDomainFromUrl(chatBot?.websiteData?.websiteUrl)}</Box>
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

								Product setup
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
