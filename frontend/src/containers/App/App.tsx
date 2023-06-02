import * as React from "react";
import {
	Avatar,
	Box,
	Button,
	Flex,
	HStack,
	List,
	ListIcon,
	ListItem,
	Menu,
	MenuButton,
	MenuDivider,
	Progress,
	MenuItem,
	MenuList,
	Spinner,
	VStack,
	Heading,
	Text,
} from "@chakra-ui/react";


import styles from "./App.module.scss";

import { Link, NavLink, Route, Switch } from "react-router-dom";
import { Logo } from "../../components/Logo/Logo";
import { ChatbotList } from "../ChatbotList/ChatbotList";
import { Settings } from "../Settings/Settings";
import { getUserProfile } from "../../services/userServices";
import { CurrentUser, User } from "../../services/appConfig";
import { DemoChatbots } from "../DemoChatbots/DemoChatbots";
import classNames  from "classnames";
interface AppProps {
	onLoginOut: () => void;
}

export const App = (props: AppProps) => {
	const [userData, setUserData] = React.useState<User | null>(null);
	React.useEffect(() => {
		async function fetchData() {
			try {
				const response = await getUserProfile();
				CurrentUser.set(response.data);
				setUserData(response.data);
			} catch (error) {
				console.log("Unable to user profile", error);
			} finally {
			}
		}
		fetchData();
	}, []);

	const getUsageComponent = React.useCallback(() => {

		if(!userData) return null

		try {	
			let usage = (userData.monthUsage.count * 100 ) / userData?.subscriptionData?.maxTokens;

			usage = usage.toFixed(2);

			let isExceded = false;
			
			if(userData?.subscriptionData?.maxTokens !== undefined) {
				isExceded = userData.monthUsage.count >= userData?.subscriptionData?.maxTokens
			}


			return <Box className={classNames(styles.usageCont, {
				[styles.usageContExceeded]: isExceded,
			})}>
				<Heading className={styles.usagePlan} size="h4" color="gray.500">{(userData?.subscriptionData?.name || '').toLowerCase()} plan</Heading>
				<Box className={styles.usgaeNumbers}><Text as="span" fontWeight="bold">{Math.floor((userData.monthUsage.count / 1000))}K</Text> / {(userData?.subscriptionData?.maxTokens / 1000)}K</Box>
				<Text className={styles.usageLabel} fontSize="sm">Monthly usage limits</Text>
				<Progress className={styles.progressbar} w="100%" value={usage} size='sm' colorScheme={isExceded ? 'red': 'blue'} borderRadius="md" />
				<Box w="100%" className={styles.usageUpgradeBtn}>
					<Link to="/app/settings/subscription/">
						<Button
							w="100%"
							colorScheme="gray"
							variant="solid"
							size="sm"
						>
							Upgrade now
						</Button>
					</Link>
				</Box>
			</Box>
		} catch (error) {
			console.log("error", error);
			return null
		}

	}, [userData]);
	return (
		<VStack spacing="0" w="100%" h="100vh">
			<Flex
				shrink={0}
				shadow="base"
				w="100%"
				h="60px"
				bg="white"
				justifyContent="space-between"
				pr="10"
				pb="4"
				pt="4"
				pl="10"
				zIndex="2"
				alignItems="center"
			>
				<Logo></Logo>
				<Box>
					<Menu>
						<MenuButton>
							<Avatar size="sm" bg="teal.500" />
						</MenuButton>
						<MenuList minW="180px">
							<MenuItem fontSize="small">
								<Avatar mr={2} size="sm" bg="teal.500" /> {userData?.email}
							</MenuItem>
							<MenuDivider />
							<Link to="/app/settings/subscription/">
								<MenuItem fontSize="small">Subscription</MenuItem>
							</Link>
							<MenuDivider />
							<MenuItem onClick={props.onLoginOut} fontSize="small">
								Log Out
							</MenuItem>
						</MenuList>
					</Menu>
				</Box>
			</Flex>
			<Flex flex={1} h="calc(100% - 100px)" w="100%">
				<HStack spacing="0" w="100%" justify="start">
					<Flex
						h="100%"
						w="260px"
						shadow="base"
						bg="white"
						flexShrink={0}
						p="10"
						direction="column"
						justifyContent="space-between"
						pt="10"
					>
						<List spacing={7}>
							<ListItem display="flex" alignItems="center" fontSize="sm">
								<NavLink activeClassName={styles.activeNav} to="/app/chat-bots">
									<Flex alignItems="center">
										<svg style={{marginRight: '10px'}} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M13 7L11.8845 4.76892C11.5634 4.1268 11.4029 3.80573 11.1634 3.57116C10.9516 3.36373 10.6963 3.20597 10.4161 3.10931C10.0992 3 9.74021 3 9.02229 3H5.2C4.0799 3 3.51984 3 3.09202 3.21799C2.71569 3.40973 2.40973 3.71569 2.21799 4.09202C2 4.51984 2 5.0799 2 6.2V7M2 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7ZM12 17V11M9 14H15" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>

										Projects
									</Flex>
								</NavLink>
							</ListItem>
							<ListItem display="flex" alignItems="center" fontSize="sm">
								<NavLink activeClassName={styles.activeNav} to="/app/chat-bots-demo">
									<Flex alignItems="center">
										<svg style={{marginRight: '10px'}}  width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M9 10.5L11 12.5L15.5 8M7 18V20.3355C7 20.8684 7 21.1348 7.10923 21.2716C7.20422 21.3906 7.34827 21.4599 7.50054 21.4597C7.67563 21.4595 7.88367 21.2931 8.29976 20.9602L10.6852 19.0518C11.1725 18.662 11.4162 18.4671 11.6875 18.3285C11.9282 18.2055 12.1844 18.1156 12.4492 18.0613C12.7477 18 13.0597 18 13.6837 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V14C3 14.93 3 15.395 3.10222 15.7765C3.37962 16.8117 4.18827 17.6204 5.22354 17.8978C5.60504 18 6.07003 18 7 18Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>

										Demo chatbots
									</Flex>
								</NavLink>
							</ListItem>
							<ListItem display="flex" alignItems="center" fontSize="sm">
								<NavLink activeClassName={styles.activeNav} to="/app/settings/subscription">
									<Flex alignItems="center">
										<svg width="24" height="24" style={{marginRight: '10px'}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M9.21296 14.5001C9.52517 15.0946 10.1486 15.5001 10.8667 15.5001H13C14.1046 15.5001 15 14.6047 15 13.5001C15 12.3955 14.1046 11.5001 13 11.5001H11C9.89543 11.5001 9 10.6047 9 9.50011C9 8.39555 9.89543 7.50011 11 7.50011H13.1333C13.8514 7.50011 14.4748 7.90561 14.787 8.50011M12 6.00011V7.50011M12 15.5001V17.0001M20 12.0001C20 16.9086 14.646 20.4785 12.698 21.615C12.4766 21.7442 12.3659 21.8087 12.2097 21.8422C12.0884 21.8682 11.9116 21.8682 11.7903 21.8422C11.6341 21.8087 11.5234 21.7442 11.302 21.615C9.35396 20.4785 4 16.9086 4 12.0001V7.21772C4 6.4182 4 6.01845 4.13076 5.67482C4.24627 5.37126 4.43398 5.10039 4.67766 4.88564C4.9535 4.64255 5.3278 4.50219 6.0764 4.22146L11.4382 2.21079C11.6461 2.13283 11.75 2.09385 11.857 2.07839C11.9518 2.06469 12.0482 2.06469 12.143 2.07839C12.25 2.09385 12.3539 2.13283 12.5618 2.21079L17.9236 4.22146C18.6722 4.50219 19.0465 4.64255 19.3223 4.88564C19.566 5.10039 19.7537 5.37126 19.8692 5.67482C20 6.01845 20 6.4182 20 7.21772V12.0001Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>


										Subscription
									</Flex>
								</NavLink>
							</ListItem>
						</List>
						{getUsageComponent()}
					</Flex>
					{userData ? (
						<Switch>
							<Route path="/app/chat-bots">
								<ChatbotList />
							</Route>
							<Route path="/app/chat-bots-demo">
								<DemoChatbots />
							</Route>
							<Route path="/app/settings">
								<Settings />
							</Route>
							<ChatbotList />
						</Switch>
					) : (
						<Flex className={styles.appLoading}>
							<Spinner mr={2} /> Loading App...
						</Flex>
					)}
				</HStack>
			</Flex>
		</VStack>
	);
};
