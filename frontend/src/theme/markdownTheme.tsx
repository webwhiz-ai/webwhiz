import { Text, Code } from '@chakra-ui/react';
import React from 'react';

export const markdownTheme = {
  p: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text mb={0} fontSize={'sm'} p={1}>
        {children}
      </Text>
    );
  },
  code: (props: { children: any }) => {
    const { children } = props;
    return (
      <Code p={1} borderRadius="lg" background="gray.100" fontSize="sm">
        {children}
      </Code>
    );
  },
};
