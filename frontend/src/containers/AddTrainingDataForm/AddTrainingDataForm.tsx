import * as React from "react";

import {
	Box,
	Flex,
	Button,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	
	useDisclosure,
} from "@chakra-ui/react";
import { updateTrainingData } from "../../services/knowledgebaseService";
import MDEditor from "@uiw/react-md-editor";


export const AddTrainingDataForm = ({
	selectedTrainingData,
	knowledgeBaseId,
	onSubmit,
}) => {

	const [answer, setAnswer] = React.useState<string>(selectedTrainingData.content || '');
	const [question, setQuestion] = React.useState<string>(selectedTrainingData.title || '');

	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

	React.useEffect(()=>{
		setAnswer(selectedTrainingData.content)
		setQuestion(selectedTrainingData.title)
		console.log('selectedTrainingData', selectedTrainingData)
	}, [selectedTrainingData])


	const handleAnswerChange = React.useCallback((value) => {
		setAnswer(value)
	}, [])
	const handleQuestionChange = React.useCallback((e) => {
		setQuestion(e.target.value)
	}, [])
	const handleSubmit = React.useCallback(async (e) => {
		console.log('submit', answer, question)
		setIsSubmitting(true)
		const data = ({
			q: question,
			a: answer,
			_id: selectedTrainingData._id
		});
		await updateTrainingData(knowledgeBaseId, data)
		setIsSubmitting(false)
		onSubmit(data);
	}, [answer, knowledgeBaseId, onSubmit, question, selectedTrainingData._id])

	return (
		<Box>
			<FormControl>
				<FormLabel fontSize="sm">Question</FormLabel>
				<Input value={question}
					onChange={handleQuestionChange} placeholder='Question' />
			</FormControl>

			<FormControl mt={6}>
				<FormLabel fontSize="sm">Data</FormLabel>
				<Box data-color-mode="light">
					<MDEditor height={200} value={answer} preview="edit" onChange={handleAnswerChange} />
				</Box>
			</FormControl>
			<Flex mt="8" justifyContent="end">
				<Button onClick={handleSubmit} colorScheme='blue' isLoading={isSubmitting}>
					Save
				</Button>
			</Flex>
		</Box>
	);
};
