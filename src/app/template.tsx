'use client'

import { Navigation } from "@/components/Navigation"
import { Box, Container } from '@chakra-ui/react'

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Box pl="64" pt="5">
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}