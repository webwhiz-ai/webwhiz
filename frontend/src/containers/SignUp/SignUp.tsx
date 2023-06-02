import * as React from 'react';
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Text,
	useToast,
} from '@chakra-ui/react';

import { useGoogleLogin } from '@react-oauth/google';

import { Field, Form, Formik } from 'formik';

import styles from './SignUp.module.scss';
import { authGoogle, signUp } from '../../services/authServices';
import {
	Link,
	RouteComponentProps,
	useHistory,
	withRouter,
} from 'react-router-dom';
import { Logo } from '../../components/Logo/Logo';
import GoogleLogin from 'react-google-login';
import { GoogleIcon } from '../../components/Icons/Google';
export function validateEmailAddress(email: string) {
	return email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}
interface FormValues {
	email: string;
	password: string;
}
interface SignUpProps extends RouteComponentProps {
	onSignUp: (token: string, redirectTo?: string) => void;
}
function validateEmail(value: string) {
	let error;
	if (!value) {
		error = 'Please enter your email.';
	} else if (validateEmailAddress(value)) {
		error = 'Please enter a valid email address.';
	}
	return error;
}
function validatePassword(value: string) {
	let error;
	if (!value) {
		error = 'Please enter a password.';
	}
	return error;
}
const SignUp = (props: SignUpProps) => {
	const toast = useToast();
	let history = useHistory();

	const responseGoogleSuccess = React.useCallback((googleResponse: any) => {
		console.log('googleResponse', googleResponse)
		async function googleLogin() {
			try {
				const response: any = await authGoogle({
					token: googleResponse.access_token,
				});
				props.onSignUp(response.data.access);
				history.push('/dashboard');
			} catch (error: any) {
				let title = 'Oops! Something went wrong!';
				const errors = error?.response?.data?.nonFieldErrors;
				if (errors) {
					title = errors
				}
				toast({
					title: title,
					status: "error",
					isClosable: true,
				});
			}
		}
		googleLogin();
	}, [history, props, toast])

	const responseGoogleFailure = React.useCallback((error) => {
		console.log('error', error)
		let title = 'Oops! Something went wrong!';
		toast({
			title: title,
			status: "error",
			isClosable: true,
		});
	}, [toast])

	const googleSignUp = useGoogleLogin({
		onSuccess: responseGoogleSuccess,
		onError: responseGoogleFailure
	});

	return (
		<Flex bg='white' h='100vh' direction='column'>
			<Flex
				shrink={0}
				shadow='base'
				w='100%'
				h='60px'
				bg='white'
				pr='10'
				pb='4'
				pt='4'
				pl='10'
				zIndex='2'
				alignItems='center'
			>
				<Logo></Logo>
			</Flex>
			<Flex alignItems='center' justifyContent='center' h='100%'>
				<Box
					bg='gray.50'
					p='100px 60px '
					shadow='md'
					width={480}
					maxW="90vw"
					borderRadius='md'
					m='0 auto'
				>
					<Heading
						textAlign='center'
						fontSize='32px'
						as='h3'
						isTruncated
						mb='12'
					>
						Sign up
					</Heading>
					<Formik
						initialValues={{ email: '', password: '' }}
						onSubmit={async (values: FormValues, actions) => {
							try {
								const response = await signUp({
									email: values.email,
									password: values.password,
									confirmPassword: values.password,
								});
								actions.setSubmitting(false);
								props.onSignUp(response.data.access);
								history.push('/dashboard');
							} catch (error) {
								toast({
									title: `Oops! Something went wrong`,
									status: 'error',
									isClosable: true,
								});
								actions.setSubmitting(false);
							}
						}}
					>
						{(props) => (
							<Form>
								<Field
									type='email'
									name='email'
									validate={validateEmail}
								>
									{({ field, form }: any) => (
										<FormControl
											mb='6'
											isInvalid={
												form.errors.email &&
												form.touched.email
											}
										>
											<FormLabel
												fontSize='sm'
												htmlFor='email'
											>
												What’s your email address?
											</FormLabel>
											<Input
												{...field}
												id='email'
												placeholder='name@company.com'
											/>
											<FormErrorMessage>
												{form.errors.email}
											</FormErrorMessage>
										</FormControl>
									)}
								</Field>
								<Field
									type='password'
									name='password'
									validate={validatePassword}
								>
									{({ field, form }: any) => (
										<FormControl
											mb='6'
											isInvalid={
												form.errors.password &&
												form.touched.password
											}
										>
											<FormLabel
												fontSize='sm'
												htmlFor='password'
											>
												Enter a password
											</FormLabel>
											<Input
												{...field}
												type='password'
												id='password'
												placeholder='********'
											/>
											<FormErrorMessage>
												{form.errors.password}
											</FormErrorMessage>
										</FormControl>
									)}
								</Field>
								<Button
									colorScheme="blue"
									variant='solid'
									mt={4}
									isFullWidth
									size='lg'
									isLoading={props.isSubmitting}
									isDisabled={
										props.isSubmitting ||
										!props.isValid ||
										!props.dirty
									}
									type='submit'
								>
									Sign up for free
								</Button>
								<div className={styles.googleSingIn}>
								



									<Button onClick={() => googleSignUp()}
											isFullWidth
											size='lg'leftIcon={<GoogleIcon />}>
											Sign up with Google
										</Button>
								</div>
							</Form>
						)}
					</Formik>
					<Text fontSize='sm' mt='8' textAlign='center' color="gray.600">
						Already have an account?{' '}
						<Link to='/login'>
							<Text display='inline' color="gray.700">
								Sign in
							</Text>
						</Link>
					</Text>
				</Box>
			</Flex>
		</Flex>
	);
};
export default withRouter(SignUp);
