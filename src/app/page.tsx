'use client'

import NextLink from 'next/link'
import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Divider,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaChartLine,
  FaRegBell,
} from 'react-icons/fa'

export default function DashboardPage() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={6}>
      <HStack mb={8} justify="space-between">
        <Heading size="lg">Dashboard</Heading>
        <NextLink href="/compose" passHref>
          <Button
            colorScheme="brand"
            leftIcon={<Icon as={FaPlus} />}
            w="full"
          >
            Create Post
          </Button>
        </NextLink>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {/* Post Status */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="md">Post Status</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel>Scheduled</StatLabel>
                <StatNumber>12</StatNumber>
                <StatHelpText>For next 7 days</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Published</StatLabel>
                <StatNumber>48</StatNumber>
                <StatHelpText>This month</StatHelpText>
              </Stat>
            </SimpleGrid>
            <Box mt={4}>
              <Text fontSize="sm" mb={2}>Queue Status</Text>
              <Progress value={60} size="sm" colorScheme="brand" rounded="full" />
              <Text fontSize="xs" color="gray.500" mt={1}>
                12/20 slots used
              </Text>
            </Box>
          </CardBody>
          <CardFooter pt={0}>
            <NextLink href="/queue" passHref>
              <Button
                variant="ghost"
                size="sm"
                width="full"
                leftIcon={<Icon as={FaClock} />}
              >
                View Queue
              </Button>
            </NextLink>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="md">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              <NextLink href="/schedule" passHref style={{ width: '100%' }}>
                <Button
                  width="full"
                  leftIcon={<Icon as={FaCalendarAlt} />}
                  variant="outline"
                >
                  View Schedule
                </Button>
              </NextLink>
              <NextLink href="/analytics" passHref style={{ width: '100%' }}>
                <Button
                  width="full"
                  leftIcon={<Icon as={FaChartLine} />}
                  variant="outline"
                >
                  Analytics
                </Button>
              </NextLink>
              <NextLink href="/notifications" passHref style={{ width: '100%' }}>
                <Button
                  width="full"
                  leftIcon={<Icon as={FaRegBell} />}
                  variant="outline"
                >
                  Notifications
                  <Badge ml={2} colorScheme="red" variant="solid" rounded="full">
                    3
                  </Badge>
                </Button>
              </NextLink>
            </VStack>
          </CardBody>
        </Card>

        {/* Platform Status */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="md">Platform Status</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaTwitter} color="twitter.500" boxSize={5} />
                  <Text>Twitter</Text>
                </HStack>
                <Badge colorScheme="green">Connected</Badge>
              </HStack>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaLinkedin} color="linkedin.500" boxSize={5} />
                  <Text>LinkedIn</Text>
                </HStack>
                <Badge colorScheme="green">Connected</Badge>
              </HStack>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaInstagram} color="pink.500" boxSize={5} />
                  <Text>Instagram</Text>
                </HStack>
                <Badge colorScheme="gray">Not Connected</Badge>
              </HStack>
            </VStack>
          </CardBody>
          <Divider />
          <CardFooter pt={4}>
            <NextLink href="/settings/connections" passHref>
              <Button
                size="sm"
                width="full"
                variant="ghost"
              >
                Manage Connections
              </Button>
            </NextLink>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box borderLeftWidth="4px" borderLeftColor="brand.500" pl={4}>
                <Text fontSize="sm">Post scheduled for Twitter</Text>
                <Text fontSize="xs" color="gray.500">2 hours ago</Text>
              </Box>
              <Box borderLeftWidth="4px" borderLeftColor="green.500" pl={4}>
                <Text fontSize="sm">Post published on LinkedIn</Text>
                <Text fontSize="xs" color="gray.500">5 hours ago</Text>
              </Box>
              <Box borderLeftWidth="4px" borderLeftColor="yellow.500" pl={4}>
                <Text fontSize="sm">Queue updated</Text>
                <Text fontSize="xs" color="gray.500">Yesterday</Text>
              </Box>
            </VStack>
          </CardBody>
          <CardFooter pt={0}>
            <Link
              fontSize="sm"
              color="brand.500"
              _hover={{ textDecoration: 'none', color: 'brand.600' }}
              width="full"
              textAlign="center"
            >
              View All Activity
            </Link>
          </CardFooter>
        </Card>

        {/* Performance Overview */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="md">Performance Overview</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel>Engagement</StatLabel>
                <StatNumber>1.2K</StatNumber>
                <StatHelpText>
                  ↑ 12% from last week
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Reach</StatLabel>
                <StatNumber>8.5K</StatNumber>
                <StatHelpText>
                  ↑ 23% from last week
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
          <CardFooter pt={0}>
            <NextLink href="/analytics" passHref>
              <Button
                variant="ghost"
                size="sm"
                width="full"
                leftIcon={<Icon as={FaChartLine} />}
              >
                View Analytics
              </Button>
            </NextLink>
          </CardFooter>
        </Card>

        {/* Upcoming Posts */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="md">Upcoming Posts</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} rounded="md">
                <HStack justify="space-between" mb={1}>
                  <Badge colorScheme="twitter">Twitter</Badge>
                  <Text fontSize="xs" color="gray.500">Today, 3:00 PM</Text>
                </HStack>
                <Text fontSize="sm" noOfLines={2}>
                  Exciting news! We're launching our new feature next week...
                </Text>
              </Box>
              <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} rounded="md">
                <HStack justify="space-between" mb={1}>
                  <Badge colorScheme="linkedin">LinkedIn</Badge>
                  <Text fontSize="xs" color="gray.500">Tomorrow, 10:00 AM</Text>
                </HStack>
                <Text fontSize="sm" noOfLines={2}>
                  Join us for an exclusive webinar on social media strategies...
                </Text>
              </Box>
            </VStack>
          </CardBody>
          <CardFooter pt={0}>
            <NextLink href="/schedule" passHref>
              <Button
                variant="ghost"
                size="sm"
                width="full"
                leftIcon={<Icon as={FaCalendarAlt} />}
              >
                View Schedule
              </Button>
            </NextLink>
          </CardFooter>
        </Card>
      </SimpleGrid>
    </Box>
  )
}