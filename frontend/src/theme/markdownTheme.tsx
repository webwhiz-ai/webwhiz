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
  h1: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text fontSize={'2xl'} fontWeight="bold" p={1}>
        {children}
      </Text>
    );
  },
  h2: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text fontSize={'xl'} fontWeight="bold" p={1}>
        {children}
      </Text>
    );
  },
  h3: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text fontSize={'lg'} fontWeight="bold" p={1}>
        {children}
      </Text>
    );
  },
  h4: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text fontSize={'md'} fontWeight="bold" p={1}>
        {children}
      </Text>
    );
  },
  h5: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text fontSize={'sm'} fontWeight="bold" p={1}>
        {children}
      </Text>
    );
  },
  h6: (props: { children: any }) => {
    const { children } = props;
    return (
      <Text fontSize={'sm'} fontWeight="bold" p={1}>
        {children}
      </Text>
    );
  },
};
