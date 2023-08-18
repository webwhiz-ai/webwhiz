import * as React from "react";
import {
	Box,
	Flex,
	Heading,
	HStack,
	Button,
	VStack,
	Text,
	Switch,
	Tabs, TabList, TabPanels, Tab, TabPanel,
	Textarea,
	FormControl,
	FormErrorMessage,
	FormHelperText,
	FormLabel,
	Input,
	IconButton,
	Radio,
	RadioGroup,
	ButtonGroup,
} from "@chakra-ui/react";

import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { mergeStyles } from "react-select";
import { format } from "date-fns";

import { RiDeleteBin5Line } from "react-icons/ri"

import styles from "./ChatBotsCustomize.module.scss";

import { chatWidgetDefaultValues } from "../../utils/commonUtils";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { ChatBotCustomizeData, launcherIcon } from "../../types/knowledgebase.type";
import ChatBotLauncher from "../ChatBotLauncher/ChatBotLauncher";
import LauncherIcon1 from "../../components/Icons/ChatBotLauncherIcons/LauncherIcon1";
import LauncherIcon2 from "../../components/Icons/ChatBotLauncherIcons/LauncherIcon2";
import LauncherIcon3 from "../../components/Icons/ChatBotLauncherIcons/LauncherIcon3";
import LauncherIcon4 from "../../components/Icons/ChatBotLauncherIcons/LauncherIcon4";
import LauncherIcon5 from "../../components/Icons/ChatBotLauncherIcons/LauncherIcon5";
import { LauncherIconsSVGs } from "../../utils/LauncherIconSVGs";
export function validateEmailAddress(email: string) {
	return email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}


interface ChatBotsCustomizeProps {
	onNextClick: (formValues: ChatBotCustomizeData) => void;
	onBackClick: () => void;
	defaultCustomizationValues?: ChatBotCustomizeData;
	primaryButtonLabel?: string;
	isSubmitting?: boolean;
	showheader?: boolean;
	showTimeMessage?: boolean;
}


const AvailableIcons = [
	{ id: 'icon1', icon: <LauncherIcon1 /> },
	{ id: 'icon2', icon: <LauncherIcon2 /> },
	{ id: 'icon3', icon: <LauncherIcon3 /> },
	{ id: 'icon4', icon: <LauncherIcon4 /> },
	{ id: 'icon5', icon: <LauncherIcon5 /> },
];

export const ChatBotsCustomize = ({
	onNextClick,
	onBackClick,
	defaultCustomizationValues,
	primaryButtonLabel = "Update widget style",
	isSubmitting = false,
}: ChatBotsCustomizeProps) => {

	const [message, setMessage] = React.useState("");

	const handleTextAreaChange = React.useCallback((e: any) => {
		const { value } = e.target;
		setMessage(value);
	}, []);

	return (
		<Flex h="100%" direction="column">
			<VStack alignItems="start" w="100%">
				<SectionTitle title="Customize" description="Customize the chat widget style based on your website theme." />
			</VStack>
			<Formik
				initialValues={defaultCustomizationValues || chatWidgetDefaultValues}
				onSubmit={async () => { }}
			>
				{({
					values,
				}) => (
					<>
						<VStack
							alignItems="start"
							overflowY="auto"
							spacing="8"
							mb="41px"
							position="relative"
							height="calc(100vh - 250px)"
						>
							<HStack w="100%" alignItems="start" overflow="hidden">
								<Box w="50%" h="100%" overflow="auto">
									<Form style={{ width: '100%' }}>
										<Box maxW="620px">
											<Tabs variant='soft-rounded' colorScheme='gray' mt="1" size="sm" p={1}>
												<TabList>
													<Tab>Content</Tab>
													<Tab>Appearance</Tab>
													<Tab>Advanced</Tab>
												</TabList>
												<TabPanels>
													<TabPanel pt="8">
														<Field type="text" name="heading">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.heading && form.touched.heading
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="heading" color="gray.700" fontWeight="400" >
																		Heading
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).heading}
																	/>
																	<FormErrorMessage>
																		{form.errors.heading}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="description">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.description && form.touched.description
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="description" color="gray.700" fontWeight="400" >
																		Description
																	</FormLabel>
																	<Textarea
																		{...field}
																		rows={2}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).description}
																	/>
																	<FormErrorMessage>
																		{form.errors.description}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="welcomeMessage">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.welcomeMessage && form.touched.welcomeMessage
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="welcomeMessage" color="gray.700" fontWeight="400" >
																		Welcome message
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).welcomeMessage}
																	/>
																	<FormErrorMessage>
																		{form.errors.welcomeMessage}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="chatInputPlaceholderText">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.chatInputPlaceholderText && form.touched.chatInputPlaceholderText
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="chatInputPlaceholderText" color="gray.700" fontWeight="400" >
																		Chat Input Placeholder Text
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).chatInputPlaceholderText}
																	/>
																	<FormErrorMessage>
																		{form.errors.chatInputPlaceholderText}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="assistantTabHeader">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.assistantTabHeader && form.touched.assistantTabHeader
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="assistantTabHeader" color="gray.700" fontWeight="400" >
																		Assistant Tab Header
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).assistantTabHeader}
																	/>
																	<FormErrorMessage>
																		{form.errors.assistantTabHeader}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="offlineMsgTabHeader">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.offlineMsgTabHeader && form.touched.offlineMsgTabHeader
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="offlineMsgTabHeader" color="gray.700" fontWeight="400" >
																		Offline Message Tab Header
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).offlineMsgTabHeader}
																	/>
																	<FormErrorMessage>
																		{form.errors.offlineMsgTabHeader}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Box className={styles.nestedFormCont} mt="8">
															<Text className={styles.nestedFormHeading} fontSize="md" mb="4" pb="2" fontWeight="500" borderBottom={"1px solid"} borderBottomColor="gray.200">Sample Questions</Text>

															<FieldArray name="questionExamples">
																{({ insert, remove, push }) => (
																	<Box className={styles.nestedForm}>
																		{values.questionExamples.length > 0 &&
																			values.questionExamples.map((friend, index) => (
																				<Box key={index} mb="4" pos="relative">
																					<IconButton
																						className={styles.questionDeleteBtn}
																						variant='outline'
																						colorScheme='gray'
																						aria-label='Delete Question'
																						fontSize='14px'
																						size="xs"
																						onClick={() => remove(index)}
																						icon={<RiDeleteBin5Line />}
																					/>
																					<Field type="text" name={`questionExamples.${index}.question`}>
																						{({ field, form }: any) => (
																							<FormControl
																								mb="2"
																							>
																								<FormLabel fontWeight="400" color="gray.700" fontSize="sm" htmlFor={`questionExamples.${index}.question`}>
																									Question
																								</FormLabel>
																								<Input
																									{...field}
																								/>
																							</FormControl>
																						)}
																					</Field>
																					<Field type="text" name={`questionExamples.${index}.label`}>
																						{({ field, form }: any) => (
																							<FormControl
																								mb="2"
																							>
																								<FormLabel fontWeight="400" color="gray.700" fontSize="sm" htmlFor={`questionExamples.${index}.label`}>
																									Label
																								</FormLabel>
																								<Input
																									{...field}
																								/>
																							</FormControl>
																						)}
																					</Field>
																				</Box>
																			))}
																		<Button
																			colorScheme="teal"
																			variant="solid"
																			size="xs"
																			mb="8"
																			onClick={() => push({ question: '', label: '' })}
																		>
																			Add Sample Question
																		</Button>
																	</Box>
																)}
															</FieldArray>
														</Box>
													</TabPanel>
													<TabPanel pt="8">
														<Field t pt="8" type="text" name="backgroundColor">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.backgroundColor &&
																		form.touched.backgroundColor
																	}
																>
																	<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="backgroundColor">
																		Background color
																	</FormLabel>
																	<Input
																		{...field}
																		size="sm"
																		id="backgroundColor"
																		placeholder="#11141C"
																	/>
																	<FormErrorMessage>
																		{form.errors.backgroundColor}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="fontColor">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.fontColor &&
																		form.touched.fontColor
																	}
																>
																	<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="fontColor">
																		Text color
																	</FormLabel>
																	<Input
																		{...field}
																		size="sm"
																		id="fontColor"
																		placeholder="#11141C"
																	/>
																	<FormErrorMessage>
																		{form.errors.fontColor}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="borderRadius">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.borderRadius && form.touched.borderRadius
																	}
																>
																	<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="borderRadius">
																		Border radius
																	</FormLabel>
																	<Input
																		{...field}
																		size="sm"
																		id="borderRadius"
																		placeholder="0px"
																	/>
																	<FormErrorMessage>
																		{form.errors.borderRadius}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="placement">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="placement">
																		Widget position
																	</FormLabel>
																	<RadioGroup
																		{...field}
																		size="sm"
																		defaultValue="right"
																	>
																		<HStack height="38px" spacing="24px">
																			<Radio {...field}
																				size="md" value="left">
																				<Text fontSize="sm">

																					left
																				</Text>
																			</Radio>
																			<Radio {...field}
																				size="md" value="right">
																				<Text fontSize="sm">

																					Right
																				</Text>
																			</Radio>
																		</HStack>
																	</RadioGroup>
																</FormControl>
															)}
														</Field>
														{/* @todo enable this after finizing the icons */}
														{/* <Field type="text" name="launcherIcon">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="launcherIcon">
																		Launcher Icon
																</FormLabel>
																	<ButtonGroup spacing="3" mt={2}>
																		{AvailableIcons.map((icon) => (
																			<IconButton
																				size="lg"
																				key={icon.id}
																				aria-label={`icon_${icon.id}`}
																				icon={icon.icon}
																				onClick={() => form.setFieldValue('launcherIcon', {
																					id: icon.id,
																					svgElement: LauncherIconsSVGs.get(icon.id)
																				})}
																				colorScheme={form.values.launcherIcon.id === icon.id ? 'blue' : 'gray'}
																				isSelected={field.value.id === icon.id}
																			/>
																		))}
																	</ButtonGroup>
																</FormControl>
															)}
														</Field> */}
													</TabPanel>
													<TabPanel pt="8">
                                                        <Field type="text" name="prompt">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.prompt && form.touched.prompt
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="prompt" color="gray.700" fontWeight="400" >
																		Base Prompt
																	</FormLabel>
																	<Textarea
																		{...field}
																		rows={4}
																		placeholder="You are a very enthusiastic chatbot who loves to help people! Your name is {{chatbotName}} and you are designed to respond only based on the given context, outputted in Markdown format."
																	/>
																	<FormHelperText fontSize="sm">This base prompt serves as a foundational instruction set for your chatbot. Feel free to tailor it to suit your specific needs. For instance, if you'd like your chatbot to respond solely in French, include the directive "Reply only in the French language".</FormHelperText>
																	<FormHelperText fontSize="sm">It's a good practice to provide some elementary information about your website in the base prompt to give your chatbot context.</FormHelperText>
																	<FormErrorMessage>
																		{form.errors.prompt}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
                                                        <Field type="text" name="defaultAnswer">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.defaultAnswer && form.touched.defaultAnswer
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="defaultAnswer" color="gray.700" fontWeight="400" >
																		Default Answer
																	</FormLabel>
																	<Textarea
																		{...field}
																		rows={4}
																		placeholder="I don't know how to answer that"
																	/>
																	<FormHelperText fontSize="sm">This field allows you to set a default response for the chatbot when it can't find an appropriate answer. You can personalize it with your own text or even translate it into another language.</FormHelperText>
																	<FormHelperText fontSize="sm">For example, you could write 'Sorry, I don't have the answer to that. Please email hi@example.com for help.'</FormHelperText>

																	<FormErrorMessage>
																		{form.errors.defaultAnswer}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="showReadMore">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<Flex justifyContent="space-between" w="100%" alignItems="center">

																		<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="showReadMore">
																			Show read more links
																		</FormLabel>
																		<Switch
																			defaultChecked={(defaultCustomizationValues || chatWidgetDefaultValues).showReadMore}
																			{...field}
																			colorScheme="teal"
																			size="md"
																			mr="2"
																		/>
																	</Flex>
																</FormControl>
															)}
														</Field>
														<Field type="text" name="offlineMessage">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<Flex justifyContent="space-between" w="100%" alignItems="center">

																		<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="offlineMessage">
																			Enable offline message
																		</FormLabel>
																		<Switch
																			defaultChecked={(defaultCustomizationValues || chatWidgetDefaultValues).offlineMessage}
																			{...field}
																			colorScheme="teal"
																			size="md"
																			mr="2"
																		/>
																	</Flex>
																</FormControl>
															)}
														</Field>
													</TabPanel>
												</TabPanels>
											</Tabs>





										</Box>

									</Form>
								</Box>
								<Flex w="50%" height="100%" pos="absolute" right="0" top="0" bottom="74px" justifyContent="center" overflow="auto">
									<div className="chat-wrap widget-open" id="chat-wrap" style={{ marginTop: '0', minHeight: "500px" }}>


										<div className="chat-widget" style={{ borderRadius: values.borderRadius }}>
											<div className="chat-header" style={{ backgroundColor: values.backgroundColor, color: values.fontColor }}>
												<div className="chat-close">
													<button className="chat-close-btn" id="chat-close-btn">
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
															<line x1="18" y1="6" x2="6" y2="18"></line>
															<line x1="6" y1="6" x2="18" y2="18"></line>
														</svg>
													</button>
												</div>
												<h2>
													{values.heading}
												</h2>
												<p>{values.description}</p>
											</div>
											<div id="chat-container" className="chat-container">
												<div id="chat-messages" className="chat-messages">
													<div className="chat-message chatbot">
														<div className="chat-message-text">{values.welcomeMessage}</div>
													</div>
													<div className="chat-message user" ><div className="chat-message-text" style={{ backgroundColor: values.backgroundColor, color: values.fontColor }}>What is webwhiz?</div></div></div>
												<div className={styles.chatSampleMessages} id="chat-sample-messages">
													{values.questionExamples.map((item: any, index: number) => (

														<button onClick={() => {
															setMessage(item.question)
														}} className={styles.chatSampleMessage} data-message={item.question} key={index}>{item.label}</button>


													))
													}
												</div>
												<Box id="chat-form">
													<div className="chat-input-wrap">
														<textarea value={message} onChange={handleTextAreaChange} rows="1" className="chat-input textarea js-auto-size" id="chat-input" placeholder={values.chatInputPlaceholderText} ></textarea>
														<button className="chat-submit-btn"><svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
															<path fillRule="evenodd" clipRule="evenodd" d="M4.394 14.7L13.75 9.3c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 00-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 002.25 1.299z" style={{ fill: values.backgroundColor }}></path>
														</svg></button>
													</div>
												</Box>
											</div>
										</div>
										<ChatBotLauncher backgroundColor= { values.backgroundColor} fontColor= {values.fontColor} launcherIcon={values.launcherIcon.id} />
									</div>
								</Flex>

							</HStack>
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
								<Button onClick={onBackClick} variant="outline">
									Go back
								</Button>
								<Button
									colorScheme="blue"
									variant="solid"
									isLoading={isSubmitting}
									isDisabled={isSubmitting}
									onClick={() => {
										onNextClick(values);
									}}
								>
									{primaryButtonLabel}
								</Button>
							</HStack>
						</Box>
					</>
				)}
			</Formik>
		</Flex>
	);
};
