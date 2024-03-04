import * as React from 'react';
import { ChakraProvider, Box, Grid } from '@chakra-ui/react';
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import theme from './theme/theme';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import SignUp from './containers/SignUp/SignUp';
import axios from 'axios';
import { removeAuthenticationDetails, setAuthDetails } from './utils/authUtils';
import Login from './containers/Login/Login';
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute';
import { App } from './containers/App/App';
import { CreateChatBots } from './containers/CreateChatBots/CreateChatBots';
import EditChatbot from './containers/EditChatbot/EditChatbot';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_AUTH_ID } from './config';
import { ConfirmationProvider } from './providers/providers';

interface AppState {
  isAuthenticated: boolean;
}
interface AppProps {}
export class Base extends React.Component<AppProps, AppState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      isAuthenticated: !!localStorage.getItem('accesstoken'),
    };
    this.interceptor();
  }
  interceptor() {
    axios.interceptors.response.use(
      (response: any) => {
        return response;
      },
      (error: any) => {
        if (error.response && error.response.status === 401) {
          removeAuthenticationDetails();
          this.setState({
            isAuthenticated: false,
          });
        }
        return Promise.reject(error);
      },
    );
    const token = localStorage.getItem('accesstoken');
    if (!token) {
      this.setState({
        isAuthenticated: false,
      });
    } else {
      this.setState({
        isAuthenticated: true,
      });
      setAuthDetails(token as string);
    }
  }
  onLoginIn = (token: string) => {
    setAuthDetails(token as string);
    this.setState({
      isAuthenticated: true,
    });
  };
  onLoginOut = () => {
    removeAuthenticationDetails();
    this.setState({
      isAuthenticated: false,
    });
  };

  getAppRoutes = () => {
    return (
      <Box>
        <Grid minH="100vh">
          <ConfirmationProvider>
            <Router>
              <Switch>
                <Route path="/sign-up">
                  <SignUp onSignUp={this.onLoginIn} />
                </Route>
                <Route path="/login">
                  <Login onLoginIn={this.onLoginIn} />
                </Route>
                <PrivateRoute
                  isAuthenticated={this.state.isAuthenticated}
                  path="/app/create-chatbot"
                  component={CreateChatBots}
                ></PrivateRoute>
                <PrivateRoute
                  isAuthenticated={this.state.isAuthenticated}
                  path="/app/edit-chatbot/:chatbotId/:step/"
                  component={EditChatbot}
                ></PrivateRoute>
                <PrivateRoute
                  isAuthenticated={this.state.isAuthenticated}
                  path="/app"
                  onLoginOut={this.onLoginOut}
                  component={App}
                ></PrivateRoute>
                <PrivateRoute
                  path="/"
                  isAuthenticated={this.state.isAuthenticated}
                  onLoginOut={this.onLoginOut}
                  component={App}
                ></PrivateRoute>
              </Switch>
            </Router>
          </ConfirmationProvider>
        </Grid>
      </Box>
    );
  };

  render() {
    return (
      <ChakraProvider theme={theme}>
        {GOOGLE_AUTH_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_AUTH_ID}>
            {this.getAppRoutes()}
          </GoogleOAuthProvider>
        ) : (
          this.getAppRoutes()
        )}
      </ChakraProvider>
    );
  }
}
