import * as React from "react";
import {
	HStack,
	Button,
	VStack,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	FormHelperText,
	Box,
	Flex,
	AlertIcon,
	Alert,
	Text,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	Spinner,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
	useDisclosure,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	IconButton,
	Heading,
	useToast,
} from "@chakra-ui/react";


import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react'

import classNames from 'classnames';

import { useEffect, useRef } from "react";
import { Formik, Form, Field } from "formik";

import styles from './ChatBotProductSetup.module.scss'
import { getDomainFromUrl } from "../../utils/commonUtils";
import { fetchKnowledgebaseCrawlDataDetails, deleteTrainingData } from "../../services/knowledgebaseService";
import { CrawlData, WebsiteData, ProductSetupData, DocsKnowledgeData } from "../../types/knowledgebase.type";
import ReactMarkdown from "react-markdown";
import { Paginator } from "../../widgets/Paginator/Paginator";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import CustomDropzone from "../../components/FileDropzone/CustomDropzone";
import { RiDeleteBin5Line } from "react-icons/ri";
import { NoDataFineTuneIcon } from "../../components/Icons/noData/NoDataFineTuneIcon";

interface FormValues {
	websiteUrl: string;
	target?: string[];
	exclude?: string[];
	files: File[];
}
interface ChatBotProductSetupProps {
	onPrimaryBtnClick: (finalFormValues: ProductSetupData) => void;
	onSecondaryBtnClick: (finalFormValues: ProductSetupData) => void;
	onCrawlDataPaginationClick: (pageNo: number) => void;
	onDocsDataPaginationClick: (pageNo: number) => void;
	primaryButtonLabel?: string;
	secondaryBtnLabel?: string;
	showSecondaryButton?: boolean;
	defaultExcludedPaths?: string[];
	defaultIncludedPaths?: string[];
	defaultProductDescription?: string;
	defaultWebsite?: string;
	showDescription?: boolean;
	crawlDataLoading?: boolean;
	defaultCrauledData: CrawlData;
	defaultFiles?: File[];
	isSubmitting?: boolean;
	isUploadingDocs?: boolean;
	isSecondaryBtnSubmitting?: boolean;
	disableWebsiteInput?: boolean;
	loadingText?: string;
	disableSubmitBtnByDefault?: boolean;
	docsData?: DocsKnowledgeData;
	docsDataLoading?: boolean;
}

function validateWebsite(value: string) {
	let error;
	if (value &&
		!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/gim.test(
			value
		)
	) {
		error = "Invalid website url";
	}
	console.log("error", error);
	return error;
}

export const ChatBotProductSetup = ({
	onPrimaryBtnClick,
	onSecondaryBtnClick,
	onCrawlDataPaginationClick,
	onDocsDataPaginationClick,
	crawlDataLoading,
	defaultWebsite = "",
	primaryButtonLabel = "Create Chat bot",
	secondaryBtnLabel = "Go Back",
	showSecondaryButton = false,
	disableSubmitBtnByDefault = false,
	defaultCrauledData,
	defaultExcludedPaths,
	defaultIncludedPaths,
	defaultFiles = [],
	disableWebsiteInput = false,
	loadingText = '',
	isSubmitting = false,
	isUploadingDocs = false,
	isSecondaryBtnSubmitting = false,
	docsDataLoading = false,
	docsData,
}: ChatBotProductSetupProps) => {
	const customDropzoneRef = useRef(); 
	const toast = useToast();

	const { isOpen, onOpen, onClose } = useDisclosure()

	const [crauledData, setCrauledData] = React.useState<CrawlData>(defaultCrauledData as unknown as CrawlData)

	const [crauledDataDetail, setCrauledDataDetail] = React.useState<string>(defaultCrauledData as unknown as string)

	const [selectedTab, setSelectedTab] = React.useState<number>(0);
	const [deleteDocLoading, setDeleteDocLoading] = React.useState<boolean>(false);
	const [localDocsData, setLocalDocsData] = React.useState<DocsKnowledgeData>(docsData as unknown as DocsKnowledgeData);
	const [docToDelete, setDocToDelete] = React.useState<string>('0');

	useEffect(() => {
		setLocalDocsData(docsData as unknown as DocsKnowledgeData);
	}, [docsData]);

	useEffect(() => {
		setCrauledData(defaultCrauledData);
	}, [defaultCrauledData]);

	const onNextButtonClick = React.useCallback(
		async ({ websiteUrl, target, exclude, files }: FormValues, type) => {
			const formValues: FormValues = {} as FormValues;
			formValues.websiteUrl = websiteUrl;

			let targetPaths = (target || '').split(',')
			// filter out empty paths and trim white spaces
			targetPaths = targetPaths.filter(path => !!path).map(path => path.trim());

			// targetPaths = targetPaths.map((path) => {
			// 	return (website.endsWith('/') ? website.slice(0, -1) : website) + path + '/**/*';
			// });

			let excludePaths = (exclude || '').split(',')
			// filter out empty paths and trim white spaces
			excludePaths = excludePaths.filter(path => !!path).map(path => path.trim())

			// excludePaths = excludePaths.map((path) => {
			// 	return (website.endsWith('/') ? website.slice(0, -1) : website) + path + '!/**/*';
			// });
			let chatbotName = '';
			if (websiteUrl) {
				chatbotName = getDomainFromUrl(websiteUrl);
			} else if (files.length) {
				chatbotName = files[0].name;
			}
			const websiteData: WebsiteData = {
				name: chatbotName,
				websiteUrl: websiteUrl,
				urls: [],
				include: targetPaths,
				exclude: excludePaths,
			}

			const payLoad: ProductSetupData = {
				websiteData: websiteData,
				files: files
			}

			if (customDropzoneRef.current) {
				customDropzoneRef.current.clearFiles();
			}

			// formValues.targetPagesBar = [...includedTarget, ...excludedTarget];
			// if((!formValues.targetPagesBar || !formValues.targetPagesBar.length) && target) {
			// 	formValues.targetPagesBar = [{ action: "include", path: target }]
			// }
			if (type === 'primary') {
				onPrimaryBtnClick(payLoad);
			} else {
				onSecondaryBtnClick(payLoad);
			}
		},
		[onPrimaryBtnClick, onSecondaryBtnClick, customDropzoneRef, customDropzoneRef.current]
	);


	const handlePageClick = React.useCallback((page) => {
		onCrawlDataPaginationClick(page+1);
	}, [onCrawlDataPaginationClick]);

	const handleDocsPageClick = React.useCallback((page) => {
		onDocsDataPaginationClick(page + 1);
	}, [onDocsDataPaginationClick]);

	const [crawlDatLoading, setCrawlDatLoading] = React.useState<string>('');

	const handleURLClick = React.useCallback(async (knowledgebaseId, crawlDataId) => {
		setCrawlDatLoading(crawlDataId);
		const resposne = await fetchKnowledgebaseCrawlDataDetails(knowledgebaseId, crawlDataId);
		setCrauledDataDetail(resposne.data?.content);
		setCrawlDatLoading('');
		onOpen();
	}, [onOpen]);

	const handleDocDelete = React.useCallback(async (knowledgeBaseId, docId) => {
		setDeleteDocLoading(true);
		try {
			await deleteTrainingData(knowledgeBaseId, docId);
			const updatedResults = localDocsData?.docs.filter((data) => data._id !== docId);
			if (updatedResults) {
				setLocalDocsData(prevPage => ({
					...prevPage,
					docs: updatedResults,
				}));
			}
			toast({
				title: `Document has been deleted successfully `,
				status: "success",
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: `Oops! unable to delete the document`,
				status: "error",
				isClosable: true,
			});
		} finally {
			setDeleteDocLoading(false);
			setDocToDelete('0');
		}
	}, [localDocsData, toast]);

	// TODO: Add proper validation
	// const validationSchema = Yup.object().shape(
	// 	{
	// 		files: Yup.array().when("websiteUrl", {
	// 			is: "",
	// 			then: Yup.array()
	// 				.min(1, "Pick at least 1 item")
	// 				.of(Yup.number().required("This field is required.")),
	// 			otherwise: Yup.array()
	// 		}),
	// 		websiteUrl: Yup.string().when("files", {
	// 			is: files => files.length === 0,
	// 			then: Yup.string().required("This field is required."),
	// 			otherwise: Yup.string()
	// 		})
	// 	},
	// 	[["files", "websiteUrl"]]
	// );

	const getCrauledPaths = React.useCallback(() => {
		if (isSubmitting) {
			return <>
				<VStack alignItems="center" w="100%" mb="6">
					<VStack w="100%">
						<Flex direction="column" justifyContent="center" alignItems="center" borderRadius="md" border="1px solid" borderColor="gray.200" w="100%" p="12">

							<Spinner color='gray.700' mb="4" />
							<Text color="gray.500">
								{loadingText}
							</Text>
						</Flex>
					</VStack>
				</VStack>
			</>
		}
		if (crauledData) {
			const totalPages = crauledData?.stats?.crawledPages + crauledData?.stats?.failedPages;
			const crawledPercentage = (crauledData?.stats?.crawledPages * 100) / totalPages;
			const failedPercentage = (crauledData?.stats?.failedPages * 100) / totalPages;
			return <>
				<Alert status='info' mb="10" fontSize='sm' borderRadius="sm">
					<Text as="span" color="blue.500" mt="2px" mr="6px">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</Text>

					Verify that all the required pages are crawled. If not, you can adjust the target paths and try again
				</Alert>
				<StatGroup mb={10}>
					<Stat>
						<StatLabel>Crawled pages</StatLabel>
						<StatNumber>{crauledData?.stats?.crawledPages}</StatNumber>
						<StatHelpText>
							<StatArrow type='increase' />
							{crawledPercentage.toFixed(2)}%
						</StatHelpText>
					</Stat>

					<Stat>
						<StatLabel>Failed pages</StatLabel>
						<StatNumber>{crauledData?.stats?.failedPages}</StatNumber>
						<StatHelpText>
							<StatArrow type='decrease' />
							{failedPercentage.toFixed(2)}%
						</StatHelpText>
					</Stat>
				</StatGroup>

				<Box>
					<Box position="relative">
						{crawlDataLoading ? <Box className={styles.crawlDataLoading}><Spinner color='gray.700' size="xs" /></Box> : ''}
						<TableContainer>
							<Table size='sm'>
								<Thead>
									<Tr>
										<Th>URLs</Th>
									</Tr>
								</Thead>
								<Tbody>
									{crauledData?.urls?.map((url, index) => {
										return (
											<Tr key={url._id}>
												<Td className={classNames(styles.urls, {
													[styles.firstUrl]: index === 0,
												})} onClick={() => {
													handleURLClick(crauledData?.knowledgebaseId, url._id)
												}} maxW="400px" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
													{url.url}
													{crawlDatLoading === url._id ? <Box className={styles.urlSpinner}><Spinner color='gray.700' size="xs" /></Box> : ''}

													<Button className={styles.urlBtn} colorScheme='gray' size='xs'>
														View Crawled data
													</Button>
												</Td>
											</Tr>
										)
									})}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>
					<Box mt="4">
						<Paginator onPageChange={handlePageClick} pageRangeDisplayed={5}
							pageCount={crauledData.pages} />
					</Box>
				</Box>
			</>
		}
		return null
	}, [crauledData, crawlDatLoading, crawlDataLoading, handlePageClick, handleURLClick, isSubmitting, loadingText]);

	const getCrawledDocs = React.useCallback(() => {
		if (isUploadingDocs || isSubmitting) {
			return <>
				<VStack alignItems="center" w="100%" mb="6">
					<VStack w="100%">
						<Flex direction="column" justifyContent="center" alignItems="center" borderRadius="md" border="1px solid" borderColor="gray.200" w="100%" p="12">

							<Spinner color='gray.700' mb="4" />
							<Text color="gray.500">
								{isUploadingDocs ? 'Uploading files...' : loadingText}
							</Text>
						</Flex>
					</VStack>
				</VStack>
			</>
		}

		if (localDocsData && !localDocsData?.docs.length) {

			return <VStack
				alignItems="center"
				direction="column"
				justifyContent="center"
				w="100%"
				h="100%"
				pt={12}
				pb={12}
				spacing="9"
			>
				<NoDataFineTuneIcon />
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

		if (localDocsData) {
			return <>
			<Box>
				<Box position="relative">
					{docsDataLoading ? <Box className={styles.crawlDataLoading}><Spinner color='gray.700' size="xs" /></Box> : ''}
					<TableContainer>
						<Table size='sm'>
							<Thead>
								<Tr>
									<Th>Files</Th>
								</Tr>
							</Thead>
							<Tbody>
								{localDocsData?.docs?.map((doc, index) => {
									return (
										<Tr key={doc._id}>
											<Td className={classNames(styles.urls, {
												[styles.firstUrl]: index === 0,
											})} maxW="400px" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" align="center">
												<Flex alignItems="center" justifyContent="space-between">
													{doc.url}
													{crawlDatLoading === doc._id ? <Box className={styles.urlSpinner}><Spinner color='gray.700' size="xs" /></Box> : ''}

													<Box right="5px" top="5px" position="absolute">
														<Button colorScheme='gray' size='xs' mr={2}
															onClick={() => {
																handleURLClick(localDocsData?.knowledgebaseId, doc._id)
															}}
														>
															View data
														</Button>
														<IconButton
															variant='outline'
															colorScheme='gray'
															aria-label='Call Sage'
															fontSize='14px'
															size="xs"
															isLoading={deleteDocLoading && docToDelete === doc._id}
															onClick={() => {
																setDocToDelete(doc._id);
																handleDocDelete(localDocsData.knowledgebaseId, doc._id)
															}}
															icon={<RiDeleteBin5Line />}
														/>
													</Box>
												</Flex>
												

											</Td>
										</Tr>
									)
								})}
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
				<Box mt="4">
					<Paginator onPageChange={handleDocsPageClick} pageRangeDisplayed={5}
						pageCount={localDocsData.pages} />
				</Box>
			</Box>
			</>
		}
		return null
	}, [isUploadingDocs, localDocsData, crawlDataLoading, handleDocsPageClick, handleURLClick, handleDocDelete, deleteDocLoading, docToDelete, crawlDatLoading, docsDataLoading, loadingText, isSubmitting]);

	return (
		<>
			<Flex h="100%" direction="column">
				<Formik
					initialValues={{
						websiteUrl: defaultWebsite,
						target: defaultIncludedPaths,
						exclude: defaultExcludedPaths,
						files: defaultFiles,
					}}
					onSubmit={async () => { }}
					// validationSchema={validationSchema}
				>
					{({ values, isValid, dirty }) => (
						<>
							<VStack
								alignItems="start"
								overflowY="auto"
								spacing="4"
								p={2}
								mb="51"
							>
								<SectionTitle title="Product setup" description="Enter your website URL and path, will automatically fetch data from your website" />
								<Form style={{ width: '100%' }}>
									<HStack spacing="16" alignItems="start">
										<Box w="50%" maxW="520px">

											<Tabs variant='soft-rounded' colorScheme='gray' mt="1" size="sm" onChange={(index) => setSelectedTab(index)}>
												<TabList>
													<Tab>Website</Tab>
													<Tab>Files</Tab>
												</TabList>
												<TabPanels>
													<TabPanel pt="8">
														<Field
															type="text"
															name="websiteUrl"
															validate={validateWebsite}
														>
															{({ field, form }: any) => (
																<FormControl 
																// isRequired 
																mb="8">
																	<FormLabel fontWeight={400} color="gray.700" fontSize="sm" htmlFor="websiteUrl">
																		Website URL
														</FormLabel>
																	<Input
																		color="gray.700"
																		{...field}
																		id="websiteUrl"
																		isDisabled={disableWebsiteInput}
																		// required
																		placeholder="https://www.paritydeals.com"
																	/>
																	{disableWebsiteInput && (<FormHelperText fontSize="smaller" color="gray.400">
																		The website name can not be edited once the product is created.
																	</FormHelperText>)}
																	{form.touched.websiteUrl && form.errors.websiteUrl && (
																		<FormHelperText color="red">
																			{form.errors.websiteUrl}
																		</FormHelperText>
																	)}
																	<FormErrorMessage>
																		{form.errors.websiteUrl}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="target">
															{({ field, form }: any) => (
																<FormControl
																	mb="8"
																	isInvalid={form.errors.target && form.touched.target}
																>
																	<FormLabel fontWeight={400} color="gray.700" fontSize="sm" htmlFor="target">
																		Included paths
														</FormLabel>
																	<Input
																		color="gray.700"
																		{...field}
																		id="target"
																		placeholder="/docs"
																	/>
																	<FormHelperText fontSize="smaller" color="gray.400">
																		Add only the path after the domain separated by a comma. For e.g. /docs, /features.
														</FormHelperText>

																	<FormErrorMessage>
																		{form.errors.target}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="exclude">
															{({ field, form }: any) => (
																<FormControl
																	mb="8"
																	isInvalid={form.errors.exclude && form.touched.exclude}
																>
																	<FormLabel fontWeight={400} color="gray.700" fontSize="sm" htmlFor="exclude">
																		Excluded paths
																	</FormLabel>
																	<Input
																		color="gray.700"
																		{...field}
																		id="exclude"
																		placeholder="/privacy"
																	/>
																	<FormHelperText fontSize="smaller" color="gray.400">
																		Add only the path after the domain separated by a comma. For e.g. /privacy, /terms-and-conditions.
																	</FormHelperText>

																	<FormErrorMessage>
																		{form.errors.exclude}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
													</TabPanel>
													<TabPanel pt="8">
														<CustomDropzone 
															ref={customDropzoneRef} 
															name="files" label="Upload Files" 
															helperText="Upload files to be crawled. For e.g. sitemap.xml, robots.txt."
														/>
													</TabPanel>
												</TabPanels>
											</Tabs>

										</Box>
										<Box w="50%">
											{selectedTab === 0 ? getCrauledPaths() : getCrawledDocs()}
										</Box>
									</HStack>

								</Form>
							</VStack>
							<Box
								pos="absolute"
								w="100%"
								zIndex={2}
								display="flex"
								p="8"
								pt="4"
								pb="4"
								bottom="0"
								left="0"
								right="0"
								bg="white"
								borderTop="1px solid"
								borderColor="gray.100"
								justifyContent="space-between"
							>
								<HStack></HStack>
								<HStack>
									{showSecondaryButton ? (
										<Button onClick={() => {
											onNextButtonClick(values, "secondary");
										}} variant="outline"
											isLoading={isSecondaryBtnSubmitting}
											disabled={
												isSecondaryBtnSubmitting
													? !(isValid && dirty)
													: !isValid
											}
										>
											{secondaryBtnLabel}
										</Button>
									) : null}

									<Button
										colorScheme="blue"
										variant="solid"
										isLoading={isSubmitting}

										disabled={
											!isValid ||
											((localDocsData === undefined || localDocsData.docs.length === 0) &&
												values.files.length === 0 &&
												!values.websiteUrl)
										}

										onClick={() => {
											onNextButtonClick(values, "primary");
										}}
									>
										{primaryButtonLabel}
									</Button>
								</HStack>
							</Box>
						</>
					)}
				</Formik>

				<Modal isOpen={isOpen} onClose={onClose} size="6xl">
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>Crawled date from the webpage</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<Alert status='info' mb="10" fontSize='sm'>
								<AlertIcon />
								We try to automatically strip unwanted content from the crawled data. This may remove some of your content. You can always add custom training data to improve the results.
							</Alert>
							<Box className="markdown-body">

								<ReactMarkdown children={crauledDataDetail}></ReactMarkdown>
							</Box>
						</ModalBody>

						<ModalFooter>
							<Button colorScheme='blue' mr={3} onClick={onClose}>
								Close
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>

			</Flex>
		</>
	);
};
