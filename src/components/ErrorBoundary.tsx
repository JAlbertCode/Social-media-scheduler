'use client'

import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

const ErrorFallback = ({ error }: { error: Error | null }) => {
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      bg={bgColor}
    >
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="lg"
        py={6}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Something went wrong
        </AlertTitle>
        <AlertDescription maxWidth="sm" mb={4}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </AlertDescription>
        <VStack spacing={2}>
          <Button
            colorScheme="red"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Text fontSize="sm" color="gray.500">
            If the problem persists, please contact support.
          </Text>
        </VStack>
      </Alert>
    </Box>
  )
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Here you could send error to your error reporting service
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}