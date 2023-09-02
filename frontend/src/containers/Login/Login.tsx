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
	InputGroup,
	Text,
	useToast,
} from '@chakra-ui/react';

import styles from './Login.module.scss'

import { Field, Form, Formik } from 'formik';

import { authGoogle, logIn } from '../../services/authServices';
import {
	Link,
	Redirect,
	RouteComponentProps,
	withRouter,
} from 'react-router-dom';
import { useState } from 'react';
import { Logo } from '../../components/Logo/Logo';
import LoginWithGoogle from '../LoginWithGoogle/LoginWithGoogle';
import { GOOGLE_AUTH_ID } from '../../config';
export function validateEmailAddress(email: string) {
	return email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}
interface FormValues {
	email: string;
	password: string;
}
interface LoginProps extends RouteComponentProps {
	onLoginIn: (token: string, redirectTo?: string) => void;
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
const Login = (props: LoginProps) => {
	const toast = useToast();

	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const responseGoogleSuccess = React.useCallback((googleResponse: any) => {
		async function googleLogin() {
			try {
				const response: any = await authGoogle({
					token: googleResponse.access_token,
				});
				const routeState = props.location.state as any;
				const redirectTo = routeState?.redirectTo || '';
				props.onLoginIn(
					response.data.access,
					redirectTo
				);
				setIsAuthenticated(true);
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
	}, [props, toast])



	const responseGoogleFailure = React.useCallback((error) => {
		let title = 'Oops! Something went wrong!';
		toast({
			title: title,
			status: "error",
			isClosable: true,
		});
	}, [toast])


	if (isAuthenticated) {
		const routeState = props.location.state as any;
		const redirectTo = routeState?.redirectTo || '';
		return <Redirect to={redirectTo} />;
	}

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
						Sign in
					</Heading>
					<Formik
						initialValues={{ email: '', password: '' }}
						onSubmit={async (values: FormValues, actions) => {
							try {
								const response = await logIn({
									username: values.email,
									password: values.password,
								});
								const routeState = props.location.state as any;
								const redirectTo = routeState?.redirectTo || '';
								props.onLoginIn(
									response.data.access,
									redirectTo
								);
								setIsAuthenticated(true);
							} catch (error) {
								console.log('errro', error);
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
											isInvalid={
												form.errors.email &&
												form.touched.email
											}
											mb='6'
										>
											<FormLabel
												fontSize='sm'
												htmlFor='email'
											>
												Email
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
											isInvalid={
												form.errors.password &&
												form.touched.password
											}
											mb='6'
										>
											<FormLabel
												fontSize='sm'
												htmlFor='password'
											>
												Password
											</FormLabel>
											<InputGroup size='md'>
												<Input
													{...field}
													type='password'
													id='password'
													placeholder='********'
												/>

											</InputGroup>
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
									Sign in
								</Button>
								{GOOGLE_AUTH_ID && <div className={styles.googleSingIn}>
									<LoginWithGoogle buttonText='Sign in with Google' responseGoogleSuccess={responseGoogleSuccess} responseGoogleFailure={responseGoogleFailure}></LoginWithGoogle>
								</div>}
							</Form>
						)}
					</Formik>
					<Flex justifyContent="center" fontSize='sm' mt='8' textAlign='center'>
						<Text mr='4px' color="gray.600">
							Don't have an account?
						</Text>
						<Link to='/sign-up'>
							<Text display='inline' color="gray.700">
								Sign up
							</Text>
						</Link>
					</Flex>
				</Box>
			</Flex>
		</Flex>
	);
};

export default withRouter(Login);
