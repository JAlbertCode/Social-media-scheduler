'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Heading,
  HStack,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
  useClipboard,
  Input,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react'
import {
  FaKey,
  FaCode,
  FaBook,
  FaCopy,
  FaCheckCircle,
  FaServer,
  FaPlug,
  FaBolt,
  FaExclamationTriangle,
} from 'react-icons/fa'

const API_KEY = 'sk_test_12345678901234567890'

// Sample webhook events
const webhookEvents = [
  { id: 'post.published', description: 'Triggered when a post is published', example: { post_id: '123', status: 'published', platform: 'twitter' }},
  { id: 'post.failed', description: 'Triggered when a post fails to publish', example: { post_id: '123', status: 'failed', error: 'API rate limit exceeded' }},
  { id: 'analytics.report', description: 'Triggered when an analytics report is ready', example: { report_id: '456', type: 'weekly', url: 'https://api.example.com/reports/456' }},
]

// Sample API endpoints
const apiEndpoints = [
  { 
    method: 'GET',
    path: '/v1/posts',
    description: 'List all scheduled posts',
    parameters: 'page, limit, status',
  },
  {
    method: 'POST',
    path: '/v1/posts',
    description: 'Create a new post',
    parameters: 'content, platforms[], scheduledTime',
  },
  {
    method: 'PUT',
    path: '/v1/posts/:id',
    description: 'Update a scheduled post',
    parameters: 'content, platforms[], scheduledTime',
  },
]

export default function DeveloperPortalPage() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const codeBg = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()

  const { hasCopied, onCopy } = useClipboard(API_KEY)

  const CodeBlock = ({ language = 'bash', children }) => (
    <Box
      bg={codeBg}
      p={4}
      rounded="md"
      fontFamily="mono"
      fontSize="sm"
      position="relative"
    >
      <Button
        size="xs"
        position="absolute"
        top={2}
        right={2}
        onClick={() => {
          navigator.clipboard.writeText(children)
          toast({
            title: 'Code copied',
            status: 'success',
            duration: 2000,
          })
        }}
        leftIcon={<Icon as={FaCopy} />}
      >
        Copy
      </Button>
      <Code display="block" whiteSpace="pre" children={children} />
    </Box>
  )

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Developer Portal</Heading>
          <Button
            colorScheme="brand"
            leftIcon={<Icon as={FaKey} />}
          >
            Generate New API Key
          </Button>
        </HStack>

        <Alert status="info">
          <AlertIcon />
          <Text>
            Welcome to the developer portal. Here you can find documentation for our API,
            manage your API keys, and configure webhooks.
          </Text>
        </Alert>

        <Tabs variant="enclosed">
          <TabList>
            <Tab><HStack><Icon as={FaKey} boxSize={4} /><Text>Authentication</Text></HStack></Tab>
            <Tab><HStack><Icon as={FaCode} boxSize={4} /><Text>API Reference</Text></HStack></Tab>
            <Tab><HStack><Icon as={FaPlug} boxSize={4} /><Text>Webhooks</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            {/* Authentication */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaKey} color="brand.500" boxSize={5} />
                      <Heading size="md">API Keys</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text mb={2} fontWeight="medium">Your API Key</Text>
                        <InputGroup size="md">
                          <Input
                            pr="4.5rem"
                            type="password"
                            value={API_KEY}
                            isReadOnly
                          />
                          <InputRightElement width="4.5rem">
                            <Button h="1.75rem" size="sm" onClick={onCopy}>
                              {hasCopied ? <Icon as={FaCheckCircle} /> : <Icon as={FaCopy} />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>Example Usage</Text>
                        <CodeBlock>
{`curl -X GET "https://api.scheduler.com/v1/posts" \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -H "Content-Type: application/json"`}
                        </CodeBlock>
                      </Box>

                      <Alert status="warning">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Keep your API key secure and never share it publicly. If compromised,
                          generate a new key immediately.
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaBolt} color="brand.500" boxSize={5} />
                      <Heading size="md">Rate Limits</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Plan</Th>
                          <Th>Requests per minute</Th>
                          <Th>Requests per day</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Developer</Td>
                          <Td>60</Td>
                          <Td>10,000</Td>
                        </Tr>
                        <Tr>
                          <Td>Business</Td>
                          <Td>300</Td>
                          <Td>100,000</Td>
                        </Tr>
                        <Tr>
                          <Td>Enterprise</Td>
                          <Td>1,000</Td>
                          <Td>Unlimited</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* API Reference */}
            <TabPanel px={0}>
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={FaBook} color="brand.500" boxSize={5} />
                    <Heading size="md">API Endpoints</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    {apiEndpoints.map((endpoint, index) => (
                      <Box key={index}>
                        <HStack mb={2}>
                          <Badge colorScheme={
                            endpoint.method === 'GET' ? 'green' :
                            endpoint.method === 'POST' ? 'blue' :
                            endpoint.method === 'PUT' ? 'orange' :
                            'red'
                          }>
                            {endpoint.method}
                          </Badge>
                          <Code>{endpoint.path}</Code>
                        </HStack>
                        <Text color="gray.500" mb={2}>{endpoint.description}</Text>
                        <Text fontSize="sm">Parameters: {endpoint.parameters}</Text>
                        {index < apiEndpoints.length - 1 && <Divider mt={4} />}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Webhooks */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaServer} color="brand.500" boxSize={5} />
                      <Heading size="md">Webhook Configuration</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Input placeholder="Enter your webhook URL" />
                      <Text fontSize="sm" color="gray.500">
                        We'll send POST requests to this URL when events occur
                      </Text>
                      <Button colorScheme="brand" alignSelf="start">
                        Save Webhook URL
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Available Events</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {webhookEvents.map((event, index) => (
                        <Box key={index}>
                          <HStack mb={2}>
                            <Badge colorScheme="purple">{event.id}</Badge>
                          </HStack>
                          <Text color="gray.500" mb={2}>{event.description}</Text>
                          <Text fontSize="sm" mb={2}>Example payload:</Text>
                          <CodeBlock language="json">
                            {JSON.stringify(event.example, null, 2)}
                          </CodeBlock>
                          {index < webhookEvents.length - 1 && <Divider mt={4} />}
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaExclamationTriangle} color="orange.500" boxSize={5} />
                      <Heading size="md">Security Best Practices</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Text>
                        1. Verify webhook signatures to ensure requests come from us
                      </Text>
                      <Text>
                        2. Process webhooks asynchronously to prevent timeouts
                      </Text>
                      <Text>
                        3. Implement retry logic for failed webhook deliveries
                      </Text>
                      <CodeBlock language="javascript">
{`// Example webhook signature verification
const signature = req.headers['x-webhook-signature'];
const isValid = verifySignature(payload, signature, webhookSecret);

if (!isValid) {
  return res.status(401).send('Invalid signature');
}`}
                      </CodeBlock>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}