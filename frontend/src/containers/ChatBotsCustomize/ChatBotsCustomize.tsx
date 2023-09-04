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
	AccordionItem,
	Accordion,
	AccordionIcon,
	AccordionPanel,
	AccordionButton,
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
	const [selectedTab, setSelectedTab] = React.useState<number>(0);

	const handleTextAreaChange = React.useCallback((e: any) => {
		const { value } = e.target;
		setMessage(value);
	}, []);

	const handleSwitchChange = React.useCallback((e: any, form) => {
		const { checked, name } = e.target;
		form.setFieldValue(name, checked);
		if(name === 'offlineMessage' && !checked){
			setSelectedTab(0);
		}
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
													<Tab>Offline Message</Tab>
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
														<Field type="text" name="collectEmail">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<Flex justifyContent="space-between" w="100%" alignItems="center">

																		<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="collectEmail">
																			Collect Email
																		</FormLabel>
																		<Switch
																			{...field}
																			defaultChecked={(defaultCustomizationValues || chatWidgetDefaultValues).collectEmail}
																			onChange={(event) => { handleSwitchChange(event, form) }}
																			colorScheme="teal"
																			size="md"
																			mr="2"
																		/>
																	</Flex>
																</FormControl>
															)}
														</Field>
														{values.collectEmail && (
															<Field type="text" name="collectEmailText">
																{({ field, form }: any) => (
																	<FormControl
																		mb="6"
																		isInvalid={
																			form.errors.collectEmailText && form.touched.collectEmailText
																		}
																	>
																		<FormLabel fontSize="sm" htmlFor="collectEmailText" color="gray.700" fontWeight="400" >
																			Collect email Text
																		</FormLabel>
																		<Input
																			{...field}
																			placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).collectEmailText}
																		/>
																		<FormErrorMessage>
																			{form.errors.collectEmailText}
																		</FormErrorMessage>
																	</FormControl>
																)}
															</Field>
														)}
														<Field type="text" name="showReadMore">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<Flex justifyContent="space-between" w="100%" alignItems="center">

																		<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="showReadMore">
																			Show read more links
																		</FormLabel>
																		<Switch
																			{...field}
																			defaultChecked={(defaultCustomizationValues || chatWidgetDefaultValues).showReadMore}
																			onChange={(event) => { handleSwitchChange(event, form) }}
																			colorScheme="teal"
																			size="md"
																			mr="2"
																		/>
																	</Flex>
																</FormControl>
															)}
														</Field>
														{values.showReadMore && (
															<Field type="text" name="readMoreText">
																{({ field, form }: any) => (
																	<FormControl
																		mb="6"
																		isInvalid={
																			form.errors.readMoreText && form.touched.readMoreText
																		}
																	>
																		<FormLabel fontSize="sm" htmlFor="readMoreText" color="gray.700" fontWeight="400" >
																			Read More Text
																</FormLabel>
																		<Input
																			{...field}
																			placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).readMoreText}
																		/>
																		<FormErrorMessage>
																			{form.errors.readMoreText}
																		</FormErrorMessage>
																	</FormControl>
																)}
															</Field>
														)}
													</TabPanel>
													<TabPanel  pt="8">
														<Field type="text" name="offlineMessage">
															{({ field, form }: any) => (
																<FormControl mb="6">
																	<Flex justifyContent="space-between" w="100%" alignItems="center">

																		<FormLabel fontWeight="400" fontSize="sm" color="gray.700" htmlFor="offlineMessage">
																			Enable offline message
																		</FormLabel>
																			<Switch
																				{...field}
																				defaultChecked={(defaultCustomizationValues || chatWidgetDefaultValues).offlineMessage}
																				onChange={(event) => { handleSwitchChange(event, form) }}
																				colorScheme="teal"
																				size="md"
																				mr="2"
																			/>
																	</Flex>
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
																		isDisabled={!values.offlineMessage}
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
																		isDisabled={!values.offlineMessage}
																	/>
																	<FormErrorMessage>
																		{form.errors.offlineMsgTabHeader}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>

														<Field type="text" name="offlineMsgHeading">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.offlineMsgHeading && form.touched.offlineMsgHeading
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="offlineMsgHeading" color="gray.700" fontWeight="400" >
																		Heading
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).offlineMsgHeading}
																		isDisabled={!values.offlineMessage}
																	/>
																	<FormErrorMessage>
																		{form.errors.offlineMsgHeading}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>

														<Field type="text" name="offlineMsgDescription">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.offlineMsgDescription && form.touched.offlineMsgDescription
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="offlineMsgDescription" color="gray.700" fontWeight="400" >
																		Description
																	</FormLabel>
																	<Textarea
																		{...field}
																		rows={2}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).offlineMsgDescription}
																		isDisabled={!values.offlineMessage}
																	/>
																	<FormErrorMessage>
																		{form.errors.offlineMsgDescription}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>

														<Field type="text" name="formSubmitBtnLabel">
															{({ field, form }: any) => (
																<FormControl
																	mb="6"
																	isInvalid={
																		form.errors.formSubmitBtnLabel && form.touched.formSubmitBtnLabel
																	}
																>
																	<FormLabel fontSize="sm" htmlFor="formSubmitBtnLabel" color="gray.700" fontWeight="400" >
																		Submit Button Label
																	</FormLabel>
																	<Input
																		{...field}
																		placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).formSubmitBtnLabel}
																		isDisabled={!values.offlineMessage}
																	/>
																	<FormErrorMessage>
																		{form.errors.formSubmitBtnLabel}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>

														{/* <Text className={styles.nestedFormHeading} fontSize="md" mb="4" pb="2" fontWeight="500" borderBottom={"1px solid"} borderBottomColor="gray.200">Additional</Text> */}

														<Accordion allowToggle allowMultiple>
															<AccordionItem isDisabled={!values.offlineMessage}>
																<AccordionButton _focus={{boxShadow:'none'}} pl={0}>
																	<Box as="span" flex='1' textAlign='left' fontSize="md" fontWeight="500">
																		Field Labels and Placeholders
																	</Box>
																	<AccordionIcon />
																</AccordionButton>
																<AccordionPanel pb={4}>
																	<Field type="text" name="nameFieldLabel">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.nameFieldLabel && form.touched.nameFieldLabel
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="nameFieldLabel" color="gray.700" fontWeight="400" >
																					Name Field Label
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).nameFieldLabel}
																					isDisabled={!values.offlineMessage}
																				/>
																				<FormErrorMessage>
																					{form.errors.nameFieldLabel}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>
																	<Field type="text" name="nameFieldPlaceholder">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.nameFieldPlaceholder && form.touched.nameFieldPlaceholder
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="nameFieldPlaceholder" color="gray.700" fontWeight="400" >
																					Name Field Placeholder
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).nameFieldPlaceholder}
																					isDisabled={!values.offlineMessage}
																				/>
																				<FormErrorMessage>
																					{form.errors.nameFieldPlaceholder}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>

																	<Field type="text" name="emailFieldLabel">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.emailFieldLabel && form.touched.emailFieldLabel
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="emailFieldLabel" color="gray.700" fontWeight="400" >
																					Email Field Label
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).emailFieldLabel}
																					isDisabled={!values.offlineMessage}
																					autoComplete="nope"
																				/>
																				<FormErrorMessage>
																					{form.errors.emailFieldLabel}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>
																	<Field type="text" name="emailFieldPlaceholder">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.emailFieldPlaceholder && form.touched.emailFieldPlaceholder
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="emailFieldPlaceholder" color="gray.700" fontWeight="400" >
																					Email Field Placeholder
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).emailFieldPlaceholder}
																					isDisabled={!values.offlineMessage}
																					autoComplete="nope"
																				/>
																				<FormErrorMessage>
																					{form.errors.emailFieldPlaceholder}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>

																	<Field type="text" name="msgFieldLabel">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.msgFieldLabel && form.touched.msgFieldLabel
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="msgFieldLabel" color="gray.700" fontWeight="400" >
																					Message Field Label
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).msgFieldLabel}
																					isDisabled={!values.offlineMessage}
																				/>
																				<FormErrorMessage>
																					{form.errors.msgFieldLabel}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>
																	<Field type="text" name="msgFieldPlaceholder">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.msgFieldPlaceholder && form.touched.msgFieldPlaceholder
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="msgFieldPlaceholder" color="gray.700" fontWeight="400" >
																					Message Field Placeholder
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).msgFieldPlaceholder}
																					isDisabled={!values.offlineMessage}
																				/>
																				<FormErrorMessage>
																					{form.errors.msgFieldPlaceholder}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>
																</AccordionPanel>
															</AccordionItem>
															<AccordionItem isDisabled={!values.offlineMessage}>
																<AccordionButton _focus={{boxShadow:'none'}} pl={0}>
																	<Box as="span" flex='1' textAlign='left' fontWeight="500" fontSize="md">
																		Error Messages
																	</Box>
																	<AccordionIcon />
																</AccordionButton>
																<AccordionPanel>
																	<Field type="text" name="requiredFieldMsg">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.requiredFieldMsg && form.touched.requiredFieldMsg
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="requiredFieldMsg" color="gray.700" fontWeight="400" >
																					Field Required Message
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).requiredFieldMsg}
																					isDisabled={!values.offlineMessage}
																				/>
																				<FormErrorMessage>
																					{form.errors.requiredFieldMsg}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>

																	<Field type="text" name="invalidEmailMsg">
																		{({ field, form }: any) => (
																			<FormControl
																				mb="6"
																				isInvalid={
																					form.errors.invalidEmailMsg && form.touched.invalidEmailMsg
																				}
																			>
																				<FormLabel fontSize="sm" htmlFor="invalidEmailMsg" color="gray.700" fontWeight="400" >
																					Invalid Email Message
																				</FormLabel>
																				<Input
																					{...field}
																					placeholder={(defaultCustomizationValues || chatWidgetDefaultValues).invalidEmailMsg}
																					isDisabled={!values.offlineMessage}
																				/>
																				<FormErrorMessage>
																					{form.errors.invalidEmailMsg}
																				</FormErrorMessage>
																			</FormControl>
																		)}
																	</Field>
																</AccordionPanel>
															</AccordionItem>
														</Accordion>

													</TabPanel>
												</TabPanels>
											</Tabs>

										</Box>

									</Form>
								</Box>
								<Flex w="50%" height="100%" pos="absolute" right="0" top="0" bottom="74px" justifyContent="center" overflow="auto">
									<div className="chat-wrap widget-open" id="chat-wrap" style={{ marginTop: '0', minHeight: "550px" }}>


										<div className="chat-widget" style={{ borderRadius: values.borderRadius, height: "520px", width: "400px" }}>
											<div className="chat-header" style={{ backgroundColor: values.backgroundColor, color: values.fontColor }}>
												
													<div className="chat-header-top" style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
														<div className="chat-tabs" id="chat-tabs"
															style={{
																marginTop: '-17px',
																display: values.offlineMessage ? 'flex' : 'none',
																position: 'relative',
																backgroundColor: 'rgba(255, 255, 255, 0.2)',
																borderRadius: '16px',
															}}>
															<button id="tab-ai-assistant"
																onClick={() => { setSelectedTab(0) }}
																style={{
																	border: 'none',
																	padding: '6px 10px',
																	fontSize: '13px',
																	borderRadius: '16px',
																	cursor: 'pointer',
																	position: 'relative',
																	zIndex: 2,
																}}>
																	{selectedTab === 0 && <div className={styles.activeTab} style={{ backgroundColor: values.backgroundColor, left: "4px" }}></div>}
																{values.assistantTabHeader}
															</button>
															<button id="tab-offline-msg"
																onClick={() => { setSelectedTab(1) }}
																style={{
																	border: 'none',
																	padding: '6px 10px',
																	fontSize: '13px',
																	borderRadius: '16px',
																	cursor: 'pointer',
																	position: 'relative',
																	zIndex: 2,
																}}
															>
																{selectedTab === 1 && <div className={styles.activeTab} style={{ backgroundColor: values.backgroundColor, right: "4px" }}></div>}
																{values.offlineMsgTabHeader}
															</button>
														</div>


														<div className="chat-close">
															<button className="chat-close-btn" id="chat-close-btn">
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
																	<line x1="18" y1="6" x2="6" y2="18"></line>
																	<line x1="6" y1="6" x2="18" y2="18"></line>
																</svg>
															</button>
														</div>
													</div>

													{
														selectedTab === 0 && (
															<div className="ai-assistant-header">
																<h2>
																	{values.heading}
																</h2>
																<p>{values.description}</p>
															</div>
														)
													}
													{
														selectedTab === 1 && (
															<div className="offline-message-header">
																<h2>
																	{values.offlineMsgHeading}
																</h2>
																<p>{values.offlineMsgDescription}</p>
															</div>
														)
													}
											</div>
											<div id="chat-container" className="chat-container" style={{ minHeight: "140px"}}>
												{selectedTab === 0 && (
													<div>
														<div id="chat-messages" className="chat-messages">
															<div className="chat-message chatbot">
																<div className="chat-message-text">{values.welcomeMessage}</div>
															</div>
															<div className="chat-message user" >
																<div className="chat-message-text" style={{ backgroundColor: values.backgroundColor, color: values.fontColor }}>What is webwhiz?</div>
															</div>
														</div>
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
																<textarea value={message} onChange={handleTextAreaChange} rows={1} className="chat-input textarea js-auto-size" id="chat-input" placeholder={values.chatInputPlaceholderText} ></textarea>
																<button className="chat-submit-btn"><svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path fillRule="evenodd" clipRule="evenodd" d="M4.394 14.7L13.75 9.3c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 00-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 002.25 1.299z" style={{ fill: values.backgroundColor }}></path>
																</svg></button>
															</div>
														</Box>
													</div>
												)}

												{selectedTab === 1 && (
													<div className="offline-message" style={{ padding: "20px 20px 10px 20px", position: "relative", height: "100%", overflow: "auto" }}>
														<div className={styles.formGroup}>
															<label className={styles.formLabel}>Name <span className={styles.formRequired}>*</span></label>
															<input type="text" className={styles.formControl} id="offline-message-name" placeholder="Enter your name"></input>
														</div>

														<div className={styles.formGroup}>
															<label className={styles.formLabel}>Email <span className={styles.formRequired}>*</span></label>
															<input type="text" className={styles.formControl} id="offline-message-email" placeholder="Enter your email"></input>
														</div>
														<div className={styles.formGroup}>
															<label className={styles.formLabel}>Message <span className={styles.formRequired}>*</span></label>
															<textarea className={styles.formControl} rows={4} id="offline-message-message"
																placeholder="Enter your message"></textarea>
														</div>
														<button className={styles.formSubmit} id="offline-message-submit"
															type="button" style={{ backgroundColor: values.backgroundColor, color: values.fontColor }}>Submit</button>
													</div>
												)}
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
