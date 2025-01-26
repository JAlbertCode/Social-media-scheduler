'use client'

import { Inter } from "next/font/google"
import { Providers } from "./providers"
import NextLink from 'next/link'
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerContent,
  Icon,
  Text,
  VStack,
  HStack,
  Divider,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { BiHome, BiCalendar, BiEditAlt, BiTime, BiCog, BiBarChart, BiMenu } from 'react-icons/bi'

const inter = Inter({ subsets: ["latin"] })

const navigation = [
  { name: 'Dashboard', href: '/', icon: BiHome },
  { name: 'Schedule', href: '/schedule', icon: BiCalendar },
  { name: 'Compose', href: '/compose', icon: BiEditAlt },
  { name: 'Queue', href: '/queue', icon: BiTime },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: BiCog },
  { name: 'Analytics', href: '/analytics', icon: BiBarChart },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const pathname = usePathname()

  const SidebarContent = () => (
    <Box
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: 'full', md: 60 }}
      h="full"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <NextLink href="/" passHref legacyBehavior>
          <ChakraLink _hover={{ textDecoration: 'none' }}>
          <HStack spacing={3}>
            <Box bg="brand.500" w="8" h="8" rounded="lg" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="bold">S</Text>
            </Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              Scheduler
            </Text>
          </HStack>
          </ChakraLink>
        </NextLink>
      </Flex>

      <VStack spacing={1} align="stretch" px={3}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <NextLink key={item.name} href={item.href} passHref legacyBehavior>
              <ChakraLink
              px={3}
              py={2}
              rounded="md"
              display="flex"
              alignItems="center"
              transition="all 0.2s"
              fontSize="sm"
              fontWeight="medium"
              color={isActive ? 'brand.700' : 'gray.600'}
              bg={isActive ? 'brand.50' : 'transparent'}
              _hover={{
                bg: isActive ? 'brand.50' : 'gray.50',
                color: isActive ? 'brand.700' : 'gray.900',
              }}
            >
              <Icon as={item.icon} boxSize={4} mr={3} />
              {item.name}
              </ChakraLink>
            </NextLink>
          )
        })}

        <Divider my={4} />

        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <NextLink key={item.name} href={item.href} passHref legacyBehavior>
              <ChakraLink
              px={3}
              py={2}
              rounded="md"
              display="flex"
              alignItems="center"
              transition="all 0.2s"
              fontSize="sm"
              fontWeight="medium"
              color={isActive ? 'brand.700' : 'gray.600'}
              bg={isActive ? 'brand.50' : 'transparent'}
              _hover={{
                bg: isActive ? 'brand.50' : 'gray.50',
                color: isActive ? 'brand.700' : 'gray.900',
              }}
            >
              <Icon as={item.icon} boxSize={4} mr={3} />
              {item.name}
              </ChakraLink>
            </NextLink>
          )
        })}
      </VStack>
    </Box>
  )

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Flex minH="100vh">
            {/* Sidebar for desktop */}
            <Box display={{ base: 'none', md: 'block' }} w={60}>
              <Box position="fixed" h="full">
                <SidebarContent />
              </Box>
            </Box>

            {/* Mobile nav */}
            <Drawer
              autoFocus={false}
              isOpen={isOpen}
              placement="left"
              onClose={onClose}
              returnFocusOnClose={false}
              onOverlayClick={onClose}
              size="full"
            >
              <DrawerContent>
                <SidebarContent />
              </DrawerContent>
            </Drawer>

            {/* Mobile nav button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              position="fixed"
              top={4}
              left={4}
              onClick={onOpen}
              variant="outline"
              aria-label="open menu"
              icon={<Icon as={BiMenu} />}
              zIndex="overlay"
            />

            {/* Main content */}
            <Box flex={1} ml={{ base: 0, md: 60 }}>
              <Box py={6} px={{ base: 4, md: 8 }}>
                {children}
              </Box>
            </Box>
          </Flex>
        </Providers>
      </body>
    </html>
  )
}