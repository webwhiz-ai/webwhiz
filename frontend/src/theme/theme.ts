// theme.ts

// 1. import `extendTheme` function
import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    black: '#000',
    white: '#fff',
    brand: {
      100: '#f7fafc',
      900: '#rgba(0, 0, 0, 0.92)',
    },
    blue: {
      50: 'rgba(145,156,250,.2)',
      500: '#7f58ff',
      600: '#7454ff',
      700: '#6b51ff',
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3.25rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  styles: {
    global: (props) => ({
      body: {
        color: mode('gray.800', 'gray.400')(props),
        background: mode('gray.50', 'gray.900')(props),
      },
    }),
  },
});

export default theme;
