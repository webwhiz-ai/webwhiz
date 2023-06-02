import * as React from "react";
import {
	Box,
	Flex,
	VStack,
} from "@chakra-ui/react";
import {
	Route,
	Switch as RouterSwitch,
} from "react-router-dom";


import { SettingsSubscription } from "../SettingsSubscription/SettingsSubscription";

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
					<Box width="100%" height="300px">
						<RouterSwitch>
							<Route path="/app/settings/subscription/">
								<SettingsSubscription />
							</Route>
							<SettingsSubscription />
						</RouterSwitch>
					</Box>
				</Flex>
			</VStack>
		</Box>
	);
};
