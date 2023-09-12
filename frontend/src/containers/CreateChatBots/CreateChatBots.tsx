import * as React from "react";
import {
	Box,
	Flex,
	Heading,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";

import {
	ChatBotProductSetup,
} from "../ChatBotProductSetup/ChatBotProductSetup";
import { createKnowledgebase, deleteKnowledgebase, fetchKnowledgebaseCrawlData, fetchKnowledgebaseDetails, generateEmbeddings, addTrainingDocs, fetchKnowledgebaseCrawlDataForDocs, addTrainingDoc, updateWebsiteData } from "../../services/knowledgebaseService";
import { ProductSetupData, DocsKnowledgeData } from "../../types/knowledgebase.type";


export const CreateChatBots = () => {
	const toast = useToast();
	const history = useHistory();
	const [primaryButtonLabel, setPrimaryButtonLabel] = React.useState("Verify pages");
	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
	const [isSecondaryBtnSubmitting, setIsSecondaryBtnSubmitting] = React.useState<boolean>(false);
	const [knowledgeBaseId, setKnowledgeBaseId] = React.useState<string>('');
	const [savingStep, setSavingStep] = React.useState<string>('CRAWL');

	const [defaultCrauledData, setDefaultCrauledData] = React.useState<any>();

	const [productSetupLoadingText, setProductSetupLoadingText] = React.useState("Setting up your product");

	const [docsDataLoading, setDocsDataLoading] = React.useState<boolean>(false);
	const [docsData, setDocsData] = React.useState<any>();
	const [isUploadingDocs, setIsUploadingDocs] = React.useState<boolean>(false);

	const [crawlDataLoading, setIrawlDataLoading] = React.useState<boolean>(false);
	const getCrawlDataPagination = React.useCallback(async (pageNo: number) => {
		try {
			setIrawlDataLoading(true);
			const _crawlDataResponse = await fetchKnowledgebaseCrawlData(defaultCrauledData.knowledgebaseId,pageNo);		
			console.log("_crawlDataResponse", _crawlDataResponse);							
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

	const handlePrimaryButtonClick = React.useCallback(async (payLoad: ProductSetupData) => {
		setIsSubmitting(true);
		console.log('payload', payLoad)

		if(savingStep ==='CRAWL') {
			try {
				setProductSetupLoadingText('Crawling your website data.. This may take some time based on the amount of the data...');
				const response = await createKnowledgebase(payLoad.websiteData);

				setKnowledgeBaseId(response.data._id);

				if (payLoad.files?.length && payLoad.files.length > 0) {
					setIsUploadingDocs(true);
					for (const file of payLoad.files) {
						try {
							const addDocResponse = await addTrainingDoc(response.data._id, file);
						} catch (error) {
							console.log('error', error)
						}
					}
					setIsUploadingDocs(false);


					setDocsDataLoading(true);
					const _docsDataResponse = await fetchKnowledgebaseCrawlDataForDocs(response.data._id, 1); 
					const _docsData: DocsKnowledgeData = {
						docs: _docsDataResponse.data.results,
						pages: _docsDataResponse.data.pages,
						knowledgebaseId: response.data._id
					}
					setDocsData(_docsData);
					setDocsDataLoading(false);
				}

				let interval = setInterval(async () => {
					const details = await fetchKnowledgebaseDetails(response.data._id);
					console.log("details", details);
					if(details.data.status === 'CRAWLED' || !details.data.websiteData) {
						clearInterval(interval);
						
						const _crawlDataResponse = await fetchKnowledgebaseCrawlData(response.data._id, 1);
						const _data = {
							stats: details.data.crawlData?.stats,
							urls: _crawlDataResponse.data.results,
							pages: _crawlDataResponse.data.pages,
							knowledgebaseId: details.data._id
						}

						setDefaultCrauledData(_data)
						setIsSubmitting(false);
						setPrimaryButtonLabel('Create Chatbot');


						setSavingStep('EMBED');
						//Training ChatGPT with your website data...
						
						
						//await generateEmbeddings(chatBotId);
						
					} else if ( details.data.status === 'CRAWL_ERROR') {
						clearInterval(interval);
						setIsSubmitting(false);
						setPrimaryButtonLabel('Verify pages');
						setKnowledgeBaseId('');
						toast({
							title: `Oops! Something went wrong`,
							status: "error",
							isClosable: true,
						});
					}
				}, 2000);

				
			} catch (error) {
				setIsSubmitting(false);
				const errorData = error?.response?.data?.message
				toast({
					title:  (errorData) || 'Oops! Something went wrong',
					status: "error",
					isClosable: true,
				});
			}
		} else {
			try {
				setProductSetupLoadingText('Training ChatGPT with your website data... This may take some time based on the amount of the data...');
				await generateEmbeddings(knowledgeBaseId);


				let interval = setInterval(async () => {
					const details = await fetchKnowledgebaseDetails(knowledgeBaseId);
					console.log("details", details);
					const chatBotId = details.data._id
					
					if ( details.data.status === 'EMBEDDING_ERROR') {
						clearInterval(interval);
						setIsSubmitting(false);
						toast({
							title: `Oops! Something went wrong`,
							status: "error",
							isClosable: true,
						});
					} else if(details.data.status === 'READY') {
						clearInterval(interval);
						setIsSubmitting(false);
						toast({
							title: `Successfully created your chatbot`,
							status: "success",
							isClosable: true,
						});
						history.push(`/app/edit-chatbot/${chatBotId}/?step=chatbot`);
					}
				}, 2000);

				
			} catch (error) {
				setIsSubmitting(false);
				setDocsDataLoading(false);
				const errorData = error?.response?.data?.message
				toast({
					title:  (errorData) || 'Oops! Something went wrong',
					status: "error",
					isClosable: true,
				});
			}
		}
	}, [history, knowledgeBaseId, savingStep, toast]);


	const handleSecondaryButtonClick = React.useCallback(async (payLoad: ProductSetupData) => {
		console.log('payload', payLoad)
		setIsSubmitting(true);
		setIsSecondaryBtnSubmitting(true);
		
		try {
			setProductSetupLoadingText('Crawling your website data... This may take some time based on the amount of the data...');

			if (payLoad.websiteData.websiteUrl) {
				const response = await updateWebsiteData(knowledgeBaseId, {
					urls: [],
					websiteUrl: payLoad.websiteData.websiteUrl,
					include: payLoad.websiteData.include,
					exclude: payLoad.websiteData.exclude,
				})
			}

			if (payLoad.files?.length && payLoad.files.length > 0) {
				setIsUploadingDocs(true);
				for (const file of payLoad.files) {
					try {
						const addDocResponse = await addTrainingDoc(knowledgeBaseId, file);
					} catch (error) {
						console.log('error', error)
					}
				}
				setIsUploadingDocs(false);
				setDocsDataLoading(true);
				const _docsDataResponse = await fetchKnowledgebaseCrawlDataForDocs(knowledgeBaseId, 1); 
				const _docsData: DocsKnowledgeData = {
					docs: _docsDataResponse.data.results,
					pages: _docsDataResponse.data.pages,
					knowledgebaseId: knowledgeBaseId
				}
				setDocsData(_docsData);
				setDocsDataLoading(false);
			}

			let interval = setInterval(async () => {
				const details = await fetchKnowledgebaseDetails(knowledgeBaseId);
				console.log("details", details);
				if(details.data.status === 'CRAWLED' || !details.data.websiteData) {
					clearInterval(interval);
					console.log('details.data', details.data.crawlData)
					
					
					const _crawlDataResponse = await fetchKnowledgebaseCrawlData(knowledgeBaseId, 1);
					
					const _data = {
						stats: details.data.crawlData?.stats,
						urls: _crawlDataResponse.data.results,
						pages: _crawlDataResponse.data.pages,
						knowledgebaseId: details.data._id
					}
					
					
					setPrimaryButtonLabel('Create Chatbot');
					setIsSecondaryBtnSubmitting(false);
					setIsSubmitting(false);
					setDefaultCrauledData(_data)
					setSavingStep('EMBED');
					//Training ChatGPT with your website data...
					
					
					//await generateEmbeddings(chatBotId);
					
				} else if ( details.data.status === 'CRAWL_ERROR') {
					clearInterval(interval);
					setIsSubmitting(false);
					setIsSecondaryBtnSubmitting(false);
					setPrimaryButtonLabel('Verify pages');
					setKnowledgeBaseId('');
					toast({
						title: `Oops! Something went wrong`,
						status: "error",
						isClosable: true,
					});
				}
			}, 2000);

			
		} catch (error) {
			setIsSubmitting(false);
			setDocsDataLoading(false);
			setIsSecondaryBtnSubmitting(false);
			const errorData = error?.response?.data?.message
			toast({
				title:  (errorData) || 'Oops! Something went wrong',
				status: "error",
				isClosable: true,
			});
		}
	}, [knowledgeBaseId, toast]);



	const getProductSetupComponent = React.useCallback(() => {
		return (
			<ChatBotProductSetup
				defaultCrauledData={defaultCrauledData}
				onCrawlDataPaginationClick={getCrawlDataPagination}
				onDocsDataPaginationClick={getDocsDataPagination}
				crawlDataLoading={crawlDataLoading}
				isSubmitting={isSubmitting}
				isSecondaryBtnSubmitting={isSecondaryBtnSubmitting}
				showSecondaryButton={savingStep === 'EMBED'}
				loadingText={productSetupLoadingText}
				disableSubmitBtnByDefault
				primaryButtonLabel={primaryButtonLabel}
				secondaryBtnLabel={"Update paths"}
				onPrimaryBtnClick={handlePrimaryButtonClick}
				onSecondaryBtnClick={handleSecondaryButtonClick}
				docsData={docsData}
				isUploadingDocs={isUploadingDocs}
				docsDataLoading={docsDataLoading}
			/>
		);
	}, [crawlDataLoading, defaultCrauledData, getCrawlDataPagination, getDocsDataPagination, handlePrimaryButtonClick, handleSecondaryButtonClick, isSecondaryBtnSubmitting, isSubmitting, isUploadingDocs, primaryButtonLabel, productSetupLoadingText, savingStep]);

	const getMainComponent = React.useCallback(() => {
		return (
			<>
				

				<Flex
					h="100%"
					direction="column"
					style={{
						display: "flex"
					}}
				>
					{getProductSetupComponent()}
				</Flex>
				
			</>
		);
	}, [getProductSetupComponent]);

	return (
		<VStack w="100%" h="100vh" overflow="hidden">
			<Flex shrink={0} alignItems="center" w="100%" justifyContent="start" h="60px" bg="blue.500" color="white" pl="6">
				<Link to="/app/chat-bots/">
					<Flex alignItems="center">
						<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
						<Heading ml="2" color="white" fontSize="18" fontWeight="400">Chat bots</Heading>
					</Flex>
				</Link>
			</Flex>
			<Flex flex={1} h="calc(100% - 100px)" w="100%">
				<Box
					w="100%"
					maxW="1320px"
					p="8"
					bg="white"
					shadow="sm"
					h="100%"
					borderRadius="lg"
					position="relative"
				>
					{getMainComponent()}
				</Box>
			</Flex>
		</VStack>
	);
};
