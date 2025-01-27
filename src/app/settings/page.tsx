'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
  Badge,
  Divider,
} from '@chakra-ui/react'
import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaBell,
  FaPalette,
  FaClock,
  FaGlobe,
  FaKey,
  FaServer,
} from 'react-icons/fa'

// Mock settings data
const connections = {
  twitter: { connected: true, username: '@twitteruser' },
  linkedin: { connected: true, username: 'LinkedIn User' },
  instagram: { connected: false, username: null },
}

const notifications = {
  postPublished: true,
  postFailed: true,
  mentions: true,
  analytics: false,
  newsletter: true,
}

export default function SettingsPage() {
  const { colorMode, toggleColorMode } = useColorMode()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const PlatformConnection = ({ platform, connected, username }) => {
    const icon = {
      twitter: FaTwitter,
      linkedin: FaLinkedin,
      instagram: FaInstagram,
    }[platform]

    const color = {
      twitter: 'twitter',
      linkedin: 'linkedin',
      instagram: 'pink',
    }[platform]

    return (
      <Card variant="outline">
        <CardBody>
          <HStack justify="space-between">
            <HStack spacing={4}>
              <Icon as={icon} boxSize={6} color={`${color}.500`} />
              <Box>
                <Text fontWeight="medium" textTransform="capitalize">
                  {platform}
                </Text>
                {username && (
                  <Text fontSize="sm" color="gray.500">
                    {username}
                  </Text>
                )}
              </Box>
            </HStack>
            <HStack spacing={4}>
              <Badge colorScheme={connected ? 'green' : 'gray'}>
                {connected ? 'Connected' : 'Not Connected'}
              </Badge>
              <Button
                size="sm"
                colorScheme={connected ? 'red' : color}
                variant={connected ? 'outline' : 'solid'}
              >
                {connected ? 'Disconnect' : 'Connect'}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={6}>
      <Stack spacing={6}>
        <Heading size="lg">Settings</Heading>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab><HStack><Icon as={FaKey} boxSize={4} /><Text>Connections</Text></HStack></Tab>
            <Tab><HStack><Icon as={FaBell} boxSize={4} /><Text>Notifications</Text></HStack></Tab>
            <Tab><HStack><Icon as={FaPalette} boxSize={4} /><Text>Appearance</Text></HStack></Tab>
            <Tab><HStack><Icon as={FaServer} boxSize={4} /><Text>Advanced</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            {/* Platform Connections */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Platform Connections</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {Object.entries(connections).map(([platform, data]) => (
                      <PlatformConnection
                        key={platform}
                        platform={platform}
                        {...data}
                      />
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Notifications */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Notification Preferences</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {Object.entries(notifications).map(([key, enabled]) => (
                      <FormControl key={key} display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          <Text>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Get notified when {key.toLowerCase().includes('post') ? 'a post is ' : ''}
                            {key.toLowerCase()}
                          </Text>
                        </FormLabel>
                        <Switch defaultChecked={enabled} colorScheme="brand" />
                      </FormControl>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Appearance */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Appearance Settings</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" flex="1">
                        <Text>Dark Mode</Text>
                        <Text fontSize="sm" color="gray.500">
                          Toggle between light and dark theme
                        </Text>
                      </FormLabel>
                      <Switch
                        isChecked={colorMode === 'dark'}
                        onChange={toggleColorMode}
                        colorScheme="brand"
                      />
                    </FormControl>

                    <Divider />

                    <FormControl>
                      <FormLabel>Color Theme</FormLabel>
                      <Select defaultValue="blue">
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="green">Green</option>
                        <option value="orange">Orange</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Default View</FormLabel>
                      <Select defaultValue="calendar">
                        <option value="calendar">Calendar</option>
                        <option value="list">List</option>
                        <option value="grid">Grid</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Advanced Settings */}
            <TabPanel px={0}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <HStack>
                        <Icon as={FaClock} boxSize={5} color="brand.500" />
                        <Heading size="md">Time Settings</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Timezone</FormLabel>
                          <Select defaultValue="auto">
                            <option value="auto">Auto-detect</option>
                            <option value="utc">UTC</option>
                            <option value="est">Eastern Time</option>
                            <option value="pst">Pacific Time</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Time Format</FormLabel>
                          <Select defaultValue="24h">
                            <option value="12h">12-hour</option>
                            <option value="24h">24-hour</option>
                          </Select>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <HStack>
                        <Icon as={FaGlobe} boxSize={5} color="brand.500" />
                        <Heading size="md">Content Settings</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Default Language</FormLabel>
                          <Select defaultValue="en">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>URL Shortener</FormLabel>
                          <Select defaultValue="bitly">
                            <option value="none">None</option>
                            <option value="bitly">Bitly</option>
                            <option value="custom">Custom</option>
                          </Select>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">API Settings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>API Key</FormLabel>
                          <Input type="password" value="••••••••••••••••" isReadOnly />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Webhook URL</FormLabel>
                          <Input placeholder="https://your-webhook-url.com" />
                        </FormControl>
                        <Button colorScheme="brand" alignSelf="start">
                          Regenerate API Key
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  )
}