import * as React from "react";
import {
	Box,
	Flex,
	Text,
	HStack,
	ListItem,
	useToast,
	Button,
	FormControl,
	FormErrorMessage,
	FormHelperText,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	OrderedList,
} from "@chakra-ui/react";

import { Formik, Form, Field } from "formik";
import { createChatBotSession, sendOfflineMessage, setCustomDomain } from "../../services/knowledgebaseService";

function validateWebsite(value: string) {
	let error;
	const domainRegex = /^(?:[\w-]+\.)?\w+\.[a-z]{2,}(?:\.[a-z]{2,})?$/i;
	if (value &&
		!domainRegex.test(
			value
		)
	) {
		error = "Invalid domain name";
	}
	return error;
}

interface CustomDomainProps {
	chatBotId: string;
	defaultCustomDomain: string;
}


export const CustomDomain = ({
	chatBotId,
	defaultCustomDomain,
}: CustomDomainProps) => {
	const toast = useToast();
	const handleCustomDomainSave = React.useCallback(async (values) => {
		setCustomDomain(chatBotId, values.customDomain);
	}, [chatBotId]);
	const [isNameCopied, setIsNameCopied] = React.useState<boolean>(false);
	const [isValueCopied, setIsValueCopied] = React.useState<boolean>(false);

	const [recordName, setRecordName] = React.useState<string>(defaultCustomDomain ? defaultCustomDomain.split('.')[0] : '');

	const [domainName, setDomainName] = React.useState<string>(defaultCustomDomain);

	React.useEffect(() => {
		setRecordName(domainName ? domainName.split('.')[0] : '');
	}, [domainName]);

	const handleRecordNotifier = React.useCallback(async () => {
		toast({
			title: `Thanks, we'll issue the SSL certificate for ${recordName} shortly and notify you via email.`,
			status: "info",
			isClosable: true,
		});
		const res = await createChatBotSession('6432611b6655e0d245e760ed');
		sendOfflineMessage({
			"knowledgebaseId": "6432611b6655e0d245e760ed",
			"sessionId": res.data,
			"name": "Custom Domain",
			"email": "admin@webwhiz.ai",
			"message": domainName + '---'+ chatBotId,
		})
	}, [chatBotId, domainName, recordName, toast]);
	const handleNameCopy = React.useCallback(() => {
		navigator.clipboard.writeText(
			recordName || ''
		);
		toast({
			title: `Copied to Clipboard`,
			status: "info",
			isClosable: true,
		});
		setIsNameCopied(true);
		setTimeout(() => {
			setIsNameCopied(false);
		}, 1000)
	}, [recordName, toast]);
	const handleValueCopy = React.useCallback(() => {
		navigator.clipboard.writeText(
			'widget.webwhiz.ai.'
		);
		toast({
			title: `Copied to Clipboard`,
			status: "info",
			isClosable: true,
		});
		setIsValueCopied(true);
		setTimeout(() => {
			setIsValueCopied(false);
		}, 1000)
	}, [toast]);
	return (
		<Box maxW="620px">
			<Flex direction="column" alignItems="start">
				<Formik
					initialValues={{
						customDomain: defaultCustomDomain || '',
					}}
					onSubmit={async () => { }}
				>
					{({ values, isValid, dirty }) => (
						<>
							<Form style={{ width: '100%' }}>
								<Field
									type="text"
									name="customDomain"
									validate={validateWebsite}
								>
									{({ field, form }: any) => (
										<FormControl
											// isRequired
											mb="8"
										>
											<FormLabel
												fontWeight={400}
												color="gray.700"
												fontSize="sm"
												htmlFor="customDomain"
											>
												Custom domain
											</FormLabel>
											<Input
												color="gray.700"
												{...field}
												id="customDomain"
												onChange={(e) => {
													setDomainName(e.target.value);
													field.onChange(e);
												}}
												// required
												placeholder="chat.timemaster.ai"
											/>
											<FormHelperText fontSize="smaller" color="gray.400">
												Only enter the domain name. Do not include additional path or protocol
											</FormHelperText>
											{form.touched.customDomain &&
												form.errors.customDomain && (
													<FormHelperText color="red">
														{form.errors.customDomain}
													</FormHelperText>
												)}
											<FormErrorMessage>
												{form.errors.customDomain}
											</FormErrorMessage>
										</FormControl>
									)}
								</Field>
								<Button disabled={!isValid} colorScheme='blue' onClick={() => {
									handleCustomDomainSave(values);
								}}>
									Save
								</Button>
							</Form>
						</>
					)}
				</Formik>
			</Flex>
			<Text fontSize="md" mt="10" mb="4" pb="2" fontWeight="500" borderBottom={"1px solid"} borderBottomColor="gray.200">Create a CNAME record for your domain</Text>
			<HStack>
				<FormControl
				>
					<FormLabel fontSize="sm" htmlFor="collectEmailText" color="gray.700" fontWeight="400" >
						Name
					</FormLabel>
					<InputGroup size='md'>
						<Input
							readOnly
							value={recordName}
						/>
						<InputRightElement width='4.5rem'>
							<Button disabled={!recordName} h='1.75rem' size='sm' onClick={handleNameCopy}>
								{isNameCopied ? 'Copied' : 'Copy'}
							</Button>
						</InputRightElement>
					</InputGroup>
				</FormControl>
				<FormControl

				>
					<FormLabel fontSize="sm" htmlFor="collectEmailText" color="gray.700" fontWeight="400" >
						Value
					</FormLabel>
					<InputGroup size='md'>
						<Input
							readOnly value={'widget.webwhiz.ai.'}
						/>
						<InputRightElement width='4.5rem'>
							<Button h='1.75rem' size='sm' onClick={handleValueCopy}>
								{isValueCopied ? 'Copied' : 'Copy'}
							</Button>
						</InputRightElement>
					</InputGroup>
				</FormControl>
			</HStack>
			<Box>
				<OrderedList fontSize="md" mt="4" pl="1" mb="2">
					<ListItem>Navigate to the dashboard of your DNS hosting service. </ListItem>
					<ListItem>In the 'Name' or 'Host' field, input your chosen subdomain. Copy from the 'Name' field above.</ListItem>
					<ListItem>In the 'Value' or 'Target', use widget.webwhiz.ai. Make sure it's typed correctly for the right domain link.</ListItem>
					<ListItem>After adding the record, click on the button link below. We'll then issue the SSL certificate for your domain..</ListItem>
				</OrderedList>
				<Button colorScheme='blue' disabled={!recordName} onClick={() => {
					handleRecordNotifier();
				}}>
					I've added the record
				</Button>
			</Box>
		</Box>

	);
};
