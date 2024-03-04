import * as React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

export interface SectionTitleProps {
  title: string;
  description: string;
}

export const SectionTitle = ({ title, description }) => {
  return (
    <Flex
      w="100%"
      mb="4"
      pb="4"
      borderBottom="1px solid"
      borderBottomColor="gray.100"
    >
      <Flex maxW="620px" direction="column">
        <Heading
          as="h2"
          fontSize="2xl"
          mb="2"
          fontWeight="600"
          color="gray.800"
          isTruncated
        >
          {title}
        </Heading>
        <Text color="gray.500">{description}</Text>
      </Flex>
    </Flex>
  );
};
