import * as React from "react";
import {
	Box,
	Flex,
	HStack,
	Heading,
	VStack,
} from "@chakra-ui/react";
import {
	Route,
	NavLink,
	Switch as RouterSwitch,
} from "react-router-dom";

import styles from "./Settings.module.scss";


import { SettingsSubscription } from "../SettingsSubscription/SettingsSubscription";
import { SettingsGeneral } from "../SettingsGeneral/SettingsGeneral";

export const Settings = () => {
	return (
		<Box
			w="100%"
			p="6"
			shadow="sm"
			h="100%"
			position="relative"
			overflow="auto"
		>
			<VStack w="100%" spacing="10" maxW="1200px">
				<Flex
					shrink={0}
					w="100%"
					direction="column"
					justifyContent="space-between"
				>
					<Flex width="100%" mb="8">
						<Heading fontSize="30">Settings</Heading>
					</Flex>
					<Box width="100%" height="300px">
						<HStack spacing="0" mb="9">
							<NavLink className={styles.nav} activeClassName={styles.activeNav} to="/app/settings/subscription/">Subscription</NavLink>
							<NavLink className={styles.nav} activeClassName={styles.activeNav} to="/app/settings/general/">General</NavLink>
						</HStack>
						<RouterSwitch>
							<Route path="/app/settings/subscription/">
								<SettingsSubscription />
							</Route>
							<Route path="/app/settings/general/">
								<SettingsGeneral />
							</Route>
							<SettingsSubscription />
						</RouterSwitch>
					</Box>
				</Flex>
			</VStack>
		</Box>
	);
};
