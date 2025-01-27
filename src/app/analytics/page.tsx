'use client'

import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  HStack,
  VStack,
  Icon,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Badge,
  ButtonGroup,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaChartLine,
  FaUsers,
  FaShareAlt,
  FaRegCommentDots,
  FaRegHeart,
  FaDownload,
  FaShare,
} from 'react-icons/fa'

const mockData = {
  overview: {
    followers: {
      total: 15420,
      growth: 12.5,
      platform: {
        twitter: 5200,
        linkedin: 8100,
        instagram: 2120,
      }
    },
    engagement: {
      total: 2845,
      growth: 8.2,
      breakdown: {
        likes: 1540,
        comments: 845,
        shares: 460,
      }
    },
    reach: {
      total: 45200,
      growth: -2.3,
    }
  },
  posts: [
    {
      id: 1,
      platform: 'twitter',
      content: 'Exciting news! We\'re launching our new feature...',
      engagement: 245,
      reach: 1200,
      performance: 8.5,
    },
    {
      id: 2,
      platform: 'linkedin',
      content: 'Join us for an exclusive webinar on social media...',
      engagement: 180,
      reach: 950,
      performance: 7.8,
    },
  ]
}

export default function AnalyticsPage() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const softBg = useColorModeValue('gray.50', 'gray.700')

  const StatCard = ({ label, value, change, icon, color = 'brand' }) => (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <HStack spacing={4}>
          <Box 
            p={3} 
            bg={useColorModeValue(`${color}.50`, `${color}.900`)}
            color={`${color}.500`}
            rounded="lg"
          >
            <Icon as={icon} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="sm" color="gray.500">{label}</Text>
            <Text fontSize="2xl" fontWeight="bold">{value}</Text>
            {typeof change === 'number' && (
              <Text fontSize="sm" color={change >= 0 ? 'green.500' : 'red.500'}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </Text>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )

  const PlatformStats = ({ platform, stats }) => (
    <HStack 
      p={4} 
      bg={softBg} 
      rounded="lg" 
      justify="space-between"
      spacing={4}
    >
      <HStack spacing={3}>
        <Icon 
          as={
            platform === 'twitter' ? FaTwitter :
            platform === 'linkedin' ? FaLinkedin :
            FaInstagram
          }
          color={
            platform === 'twitter' ? 'twitter.500' :
            platform === 'linkedin' ? 'linkedin.500' :
            'pink.500'
          }
          boxSize={5}
        />
        <Text fontWeight="medium" textTransform="capitalize">
          {platform}
        </Text>
      </HStack>
      <HStack spacing={6}>
        <VStack spacing={0} align="start">
          <Text fontSize="sm" color="gray.500">Followers</Text>
          <Text fontWeight="bold">{stats.toLocaleString()}</Text>
        </VStack>
        <Badge colorScheme="green">Active</Badge>
      </HStack>
    </HStack>
  )

  const PostPerformanceCard = ({ post }) => (
    <Card variant="outline">
      <CardBody>
        <HStack spacing={4} mb={4}>
          <Icon 
            as={
              post.platform === 'twitter' ? FaTwitter :
              post.platform === 'linkedin' ? FaLinkedin :
              FaInstagram
            }
            color={
              post.platform === 'twitter' ? 'twitter.500' :
              post.platform === 'linkedin' ? 'linkedin.500' :
              'pink.500'
            }
            boxSize={4}
          />
          <Text fontSize="sm" noOfLines={1} flex={1}>
            {post.content}
          </Text>
        </HStack>
        <SimpleGrid columns={3} gap={4}>
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500">Engagement</Text>
            <Text fontWeight="bold">{post.engagement}</Text>
          </VStack>
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500">Reach</Text>
            <Text fontWeight="bold">{post.reach}</Text>
          </VStack>
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500">Score</Text>
            <Badge colorScheme={post.performance >= 8 ? 'green' : 'yellow'}>
              {post.performance}
            </Badge>
          </VStack>
        </SimpleGrid>
      </CardBody>
    </Card>
  )

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={6}>
      <HStack mb={8} justify="space-between" align="center" wrap="wrap" gap={4}>
        <Heading size="lg">Analytics</Heading>
        <HStack spacing={4} wrap="wrap">
          <Select 
            size="sm" 
            w={{ base: 'full', sm: '200px' }} 
            defaultValue="7d"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Select>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button leftIcon={<Icon as={FaDownload} boxSize={3} />}>
              Export
            </Button>
            <Button leftIcon={<Icon as={FaShare} boxSize={3} />}>
              Share
            </Button>
          </ButtonGroup>
        </HStack>
      </HStack>

      <Tabs variant="enclosed">
        <TabList mb={6}>
          <Tab>Overview</Tab>
          <Tab>Content Performance</Tab>
          <Tab>Audience Insights</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            {/* Overview Stats */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <StatCard
                label="Total Followers"
                value={mockData.overview.followers.total.toLocaleString()}
                change={mockData.overview.followers.growth}
                icon={FaUsers}
              />
              <StatCard
                label="Total Engagement"
                value={mockData.overview.engagement.total.toLocaleString()}
                change={mockData.overview.engagement.growth}
                icon={FaRegHeart}
                color="red"
              />
              <StatCard
                label="Total Reach"
                value={mockData.overview.reach.total.toLocaleString()}
                change={mockData.overview.reach.growth}
                icon={FaChartLine}
                color="green"
              />
              <StatCard
                label="Avg. Engagement Rate"
                value="5.8%"
                change={3.2}
                icon={FaShareAlt}
                color="purple"
              />
            </SimpleGrid>

            {/* Platform Performance */}
            <Card mb={8}>
              <CardHeader>
                <Heading size="md">Platform Performance</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {Object.entries(mockData.overview.followers.platform).map(([platform, stats]) => (
                    <PlatformStats 
                      key={platform}
                      platform={platform}
                      stats={stats}
                    />
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Engagement Breakdown */}
            <Card>
              <CardHeader>
                <Heading size="md">Engagement Breakdown</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                  <VStack 
                    p={4} 
                    bg={softBg} 
                    rounded="lg" 
                    align="start"
                    spacing={1}
                  >
                    <HStack color="red.500">
                      <Icon as={FaRegHeart} boxSize={4} />
                      <Text fontWeight="medium">Likes</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {mockData.overview.engagement.breakdown.likes.toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack 
                    p={4} 
                    bg={softBg} 
                    rounded="lg" 
                    align="start"
                    spacing={1}
                  >
                    <HStack color="brand.500">
                      <Icon as={FaRegCommentDots} boxSize={4} />
                      <Text fontWeight="medium">Comments</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {mockData.overview.engagement.breakdown.comments.toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack 
                    p={4} 
                    bg={softBg} 
                    rounded="lg" 
                    align="start"
                    spacing={1}
                  >
                    <HStack color="green.500">
                      <Icon as={FaShareAlt} boxSize={4} />
                      <Text fontWeight="medium">Shares</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {mockData.overview.engagement.breakdown.shares.toLocaleString()}
                    </Text>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel px={0}>
            {/* Content Performance */}
            <Card mb={8}>
              <CardHeader>
                <Heading size="md">Top Performing Posts</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {mockData.posts.map(post => (
                    <PostPerformanceCard key={post.id} post={post} />
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel px={0}>
            {/* Audience Insights */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Text color="gray.500">
                    Audience insights coming soon...
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}