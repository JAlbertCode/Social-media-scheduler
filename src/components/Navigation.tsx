'use client'

import React from 'react'
import Link from 'next/link'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Box,
  HStack,
  VStack,
  Text,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaHome,
  FaCalendarAlt,
  FaPen,
  FaClock,
  FaCog,
  FaChartBar,
} from 'react-icons/fa'

const navigation = [
  { name: 'Dashboard', href: '/', icon: FaHome },
  { name: 'Schedule', href: '/schedule', icon: FaCalendarAlt },
  { name: 'Compose', href: '/compose', icon: FaPen },
  { name: 'Queue', href: '/queue', icon: FaClock },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: FaCog },
  { name: 'Analytics', href: '/analytics', icon: FaChartBar },
]

interface NavItemProps {
  href: string
  isActive: boolean
  icon: React.ElementType
  children: React.ReactNode
}

function NavItem({ href, isActive, icon: Icon, children }: NavItemProps) {
  return (
    <NextLink href={href} passHref>
      <Box
        display="block"
        width="100%"
        textDecoration="none"
        _hover={{ textDecoration: 'none' }}
      >
      <Box
        px={3}
        py={2}
        rounded="md"
        bg={isActive ? 'brand.50' : 'transparent'}
        color={isActive ? 'brand.700' : 'gray.600'}
        _hover={{
          bg: isActive ? 'brand.50' : 'gray.50',
          color: isActive ? 'brand.700' : 'gray.900',
        }}
        cursor="pointer"
        transition="all 0.2s"
      >
        <HStack spacing={3}>
          <Icon size="16px" />
          <Text>{children}</Text>
        </HStack>
      </Box>
      </Box>
    </NextLink>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      w="64"
      top={0}
      h="full"
      bg={useColorModeValue('white', 'gray.800')}
      borderRightWidth="1px"
      borderColor={borderColor}
    >
      <VStack h="full" py={5} px={3} spacing={6}>
        {/* Logo */}
        <NextLink href="/" passHref>
          <Box
            width="100%"
            px={3}
            textDecoration="none"
            _hover={{ textDecoration: 'none' }}
          >
          <HStack spacing={3}>
            <Box bg="brand.500" w="8" h="8" rounded="lg" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="bold">S</Text>
            </Box>
            <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.900', 'white')}>
              Scheduler
            </Text>
          </HStack>
          </Box>
        </NextLink>

        {/* Primary Navigation */}
        <VStack spacing={1} align="stretch" width="full">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            >
              {item.name}
            </NavItem>
          ))}
        </VStack>

        <Divider />

        {/* Secondary Navigation */}
        <VStack spacing={1} align="stretch" width="full">
          {secondaryNavigation.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            >
              {item.name}
            </NavItem>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}