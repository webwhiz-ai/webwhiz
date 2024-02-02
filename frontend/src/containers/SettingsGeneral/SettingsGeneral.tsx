import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  Switch,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import styles from './SettingsGeneral.module.scss';
import { getUserProfile, setOpenAIKey } from '../../services/userServices';

export const SettingsGeneral = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [isApiKeyLoading, setIsApiKeyLoading] = React.useState<boolean>();
  const [apiKey, setApiKey] = React.useState<string>('');
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsApiKeyLoading(true);
        const response = await getUserProfile();
        if (response.data.customKeys && response.data.customKeys.useOwnKey) {
			setApiKey('***************************************************');
        }
		setUser(response.data);
      } catch (error) {
        console.log('Unable to fetch deals', error);
      } finally {
        setIsApiKeyLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleApiKeySave = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (!apiKey.includes('**')) {
		if(user && user.subscriptionData && user.subscriptionData.name === 'FREE') {
			toast({
        title: `Please upgrade to a paid plan to use your own API key`,
				status: 'warning',
				isClosable: true,
			  });
		} else {
			await setOpenAIKey(apiKey, !!apiKey);
			toast({
				title: `API key has been updated successfully!`,
				status: 'success',
				isClosable: true,
			  });
		}
      } else {
        toast({
          title: `Please enter a valid API key. If you want to disable your own API key, please remove it and save.`,
          status: 'warning',
          isClosable: true,
        });
      }
    } catch (error) {
      console.log('Unable to fetch deals', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, toast, user]);

  const handleApiKeyChange = React.useCallback((e) => {
    setApiKey(e.target.value);
  }, []);

  return (
    <Flex bg="white" p="12" borderRadius="md" shadow="sm" maxW="3xl">
      <VStack spacing="8">
        <Flex direction={'column'} w="100%">
          <Box>
            <Heading className={styles.heading} size="md">
              OpenAI API key
            </Heading>
            <Text className={styles.subHeading} mb="2">
				We securely encrypt your API key. Once encrypted, you cannot view the original key in your WebWhiz account.
				However, you can always replace it.
            </Text>
            <Text className={styles.subHeading} mb="6">
				If the API key is invalid, WebWhiz will use its default API key. Please note that if your plan requires your own API key for brand removal, branding will be displayed if the API key is empty or invalid.
            </Text>
          </Box>
          <Input
            isDisabled={isApiKeyLoading}
            onChange={handleApiKeyChange}
            type="password"
            value={apiKey}
            mb={4}
          />
          <HStack>
            <Button
              colorScheme="teal"
              size="md"
              isLoading={isLoading}
			  isDisabled={isApiKeyLoading}
              loadingText={'Saving...'}
              onClick={handleApiKeySave}
            >
              Save
            </Button>
          </HStack>
        </Flex>
		{/* {user? (<><Divider maxW="3xl" orientation="horizontal" />
        <Flex direction={'column'} w="100%">
          <Box>
            <Flex alignItems="center" justifyContent="space-between">
              <Heading className={styles.heading} size="md">
                Use your own API key
              </Heading>
              <Switch
                //defaultChecked={(defaultCustomizationValues || chatWidgetDefaultValues).showReadMore}
                //defaultChecked={getDefaultUsageValue()}
				defaultChecked={user.customKeys && user.customKeys.useOwnKey}
				//isDisabled={!apiKey || apiKey.includes('**')}
                colorScheme="teal"
				value={}
				onChange={}
                size="md"
              />
            </Flex>
            <Text className={styles.subHeading}>
			If turned off, or if the API key is invalid, WebWhiz will use its default API key. Please note that if your plan requires your own API key for brand removal, branding will be displayed when this option is off.
            </Text>
          </Box>
        </Flex></>):null} */}
		
      </VStack>

    </Flex>
  );
};
