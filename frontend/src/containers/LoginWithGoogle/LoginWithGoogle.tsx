import * as React from 'react';
import {
	Button,
} from '@chakra-ui/react';



import { GoogleIcon } from '../../components/Icons/Google';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginWithGoogleProps {
	responseGoogleSuccess: (googleResponse: any) => void;
	responseGoogleFailure: (error: any) => void;
	buttonText: string;
}

const LoginWithGoogle = (
	{ responseGoogleSuccess, responseGoogleFailure, buttonText }: LoginWithGoogleProps
) => {


	const handleResponseGoogleSuccess = React.useCallback((googleResponse: any) => {
		responseGoogleSuccess(googleResponse);
	}, [responseGoogleSuccess])



	const handleResponseGoogleFailure = React.useCallback((error) => {
		responseGoogleFailure(error)
	}, [responseGoogleFailure])


	const googleSignIn = useGoogleLogin({
		onSuccess: handleResponseGoogleSuccess,
		onError: handleResponseGoogleFailure
	});


	return (
		<Button
			onClick={() => googleSignIn()}
			isFullWidth
			size='lg' leftIcon={<GoogleIcon />}>
			{buttonText}
		</Button>
	);
};

export default LoginWithGoogle;
