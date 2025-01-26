import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#e6f1fe',
    100: '#cce4fd',
    200: '#99c9fb',
    300: '#66aef9',
    400: '#3393f7',
    500: '#0078f5',
    600: '#0060c4',
    700: '#004893',
    800: '#003062',
    900: '#001831',
  },
}

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})

export default theme