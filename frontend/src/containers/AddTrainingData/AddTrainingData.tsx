import * as React from "react";

import {
	Box,
	Flex,
	useToast,
	Button,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,

	useDisclosure,
} from "@chakra-ui/react";
import { FiPlus } from 'react-icons/fi';
import { addTrainingData } from "../../services/knowledgebaseService";


export const AddTrainingData = ({
	initialAnswer,
	initialQuestion,
	onSubmit,
	knowledgeBaseId
}) => {

	const { isOpen, onOpen, onClose } = useDisclosure()
	const toast = useToast();

	const initialRef = React.useRef(null)
	const finalRef = React.useRef(null)

	const [answer, setAnswer] = React.useState<string>('');
	const [question, setQuestion] = React.useState<string>('');

	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);


	const handleAnswerChange = React.useCallback((e) => {
		setAnswer(e.target.value)
	}, [])
	const handleQuestionChange = React.useCallback((e) => {
		setQuestion(e.target.value)
	}, [])
	const handleSubmit = React.useCallback(async (e) => {
		try {
			setIsSubmitting(true)
			const data = ({
				q: question,
				a: answer
			});
			const response = await addTrainingData(knowledgeBaseId, data)
			setAnswer('');
			setQuestion('');
			onSubmit(response.data);
			onClose()
		} catch (error) {
			const errorData = error?.response?.data?.message
			toast({
				title:  (errorData) || 'Oops! Something went wrong',
				status: "error",
				isClosable: true,
			});
		} finally {
			setIsSubmitting(false)
		}
	}, [question, answer, knowledgeBaseId, onSubmit, onClose, toast])

	return (
		<Box>
			<Box>
				<Button leftIcon={<FiPlus />} onClick={onOpen} colorScheme='blue'>Add data</Button>
			</Box>
			<Modal
				initialFocusRef={initialRef}
				finalFocusRef={finalRef}
				isOpen={isOpen}
				onClose={onClose}
				size="xl"
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add new training data</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<FormLabel fontSize="sm">Question</FormLabel>
							<Input ref={initialRef} value={question}
								onChange={handleQuestionChange} placeholder='Question' />
						</FormControl>

						<FormControl mt={6}>
							<FormLabel fontSize="sm">Data</FormLabel>
							<Textarea
								value={answer} onChange={handleAnswerChange}
								size='sm'
								rows="10"
							/>
						</FormControl>
						<Flex mt="8" justifyContent="end">
							<Button onClick={onClose} mr={3}>Cancel</Button>
							<Button onClick={handleSubmit} colorScheme='blue' isLoading={isSubmitting}>
								Save
							</Button>
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Box>
	);
};
