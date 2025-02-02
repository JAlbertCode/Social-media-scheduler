'use client'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useEffect } from 'react'
import {
  VStack,
  Box,
  HStack,
  Text,
  Button,
  ButtonGroup,
  Select,
  Divider,
} from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Calendar } from '../../components/Calendar'
import { Timeline } from '../../components/Timeline'
import { TimezoneSelect } from '../../components/TimezoneSelect'
import { FrequencyRecommendations } from '../../components/FrequencyRecommendations'
import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { ScheduleGapAnalysis } from '../../components/ScheduleGapAnalysis'
import { CalendarManager } from '../../components/CalendarManager'
import { ScheduledPost } from '../../types/calendar'
import { CalendarConfig } from '../../types/calendars'
import { getUserTimezone, fromUTC, toUTC } from '../../utils/timezone'
import { PlatformType } from '../../components/PostCreator'

import { PlatformToggle } from '../../components/PlatformToggle'

type ViewMode = 'calendar' | 'timeline'

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState<string>('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Twitter', 'LinkedIn', 'Instagram'])
  const [activeFilter, setActiveFilter] = useState<PlatformType>('Twitter')
  const [isFrequencyPanelOpen, setIsFrequencyPanelOpen] = useState(true)
  const [calendars, setCalendars] = useState<CalendarConfig[]>([
    {
      id: '1',
      name: 'Main Campaign',
      color: '#3182CE',
      type: 'campaign',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Product Launch',
      color: '#38A169',
      type: 'product',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
  const [activeCalendars, setActiveCalendars] = useState<string[]>(['1', '2'])

  useEffect(() => {
    setTimezone(getUserTimezone())
  }, [])
  
  // Sample data - this would come from your backend
  const [scheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Sample scheduled post for Twitter',
      platforms: ['Twitter'],
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    },
    {
      id: '2',
      content: 'Sample LinkedIn & Twitter post',
      platforms: ['LinkedIn', 'Twitter'],
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
    }
  ])

  const handleToggleCalendar = (calendarId: string) => {
    setActiveCalendars(prev =>
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    )
  }

  const handleAddCalendar = (calendar: Omit<CalendarConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCalendar: CalendarConfig = {
      ...calendar,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCalendars(prev => [...prev, newCalendar])
    setActiveCalendars(prev => [...prev, newCalendar.id])
  }

  const handleEditCalendar = (calendar: CalendarConfig) => {
    setCalendars(prev =>
      prev.map(cal => cal.id === calendar.id ? calendar : cal)
    )
  }

  const handleDeleteCalendar = (calendarId: string) => {
    setCalendars(prev => prev.filter(cal => cal.id !== calendarId))
    setActiveCalendars(prev => prev.filter(id => id !== calendarId))
  }

  const getFilteredPostsByCalendar = () => {
    // In a real app, posts would have calendarIds
    // For now, we'll just return all posts if any calendar is active
    return activeCalendars.length > 0 ? scheduledPosts : []
  }

  const getFilteredPosts = () => {
    if (selectedPlatforms.length === 0) return scheduledPosts
    return scheduledPosts.filter(post =>
      post.platforms.some(platform => selectedPlatforms.includes(platform))
    )
  }

  if (!timezone) {
    return null
  }

  const handleMovePost = (postId: string, newDate: Date) => {
    console.log('Moving post', postId, 'to', newDate)
  }

  const getPostsInTimezone = (posts: ScheduledPost[]): ScheduledPost[] => {
    return posts.map(post => ({
      ...post,
      scheduledTime: fromUTC(post.scheduledTime, timezone)
    }))
  }

  const getPostsForPlatform = (platform: PlatformType): Date[] => {
    return scheduledPosts
      .filter(post => post.platforms.includes(platform))
      .map(post => new Date(post.scheduledTime))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box minH="calc(100vh - 64px)" bg="gray.50">
        {/* Header Controls */}
        <Box bg="white" shadow="sm" borderBottomWidth="1px" borderColor="gray.200" mb={4}>
          <Box maxW="7xl" mx="auto" px={6} py={4}>
            <HStack justify="space-between" align="center">
              {/* Left side - View controls */}
              <HStack spacing={8}>
                {/* View Mode Toggle */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    View Mode
                  </Text>
                  <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                      onClick={() => setViewMode('calendar')}
                      colorScheme={viewMode === 'calendar' ? 'blue' : undefined}
                    >
                      Calendar
                    </Button>
                    <Button
                      onClick={() => setViewMode('timeline')}
                      colorScheme={viewMode === 'timeline' ? 'blue' : undefined}
                    >
                      Timeline
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* Platform Toggles */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Platforms
                  </Text>
                  <PlatformToggle
                    selectedPlatforms={selectedPlatforms}
                    onTogglePlatform={(platform) => {
                      setSelectedPlatforms(prev =>
                        prev.includes(platform)
                          ? prev.filter(p => p !== platform)
                          : [...prev, platform]
                      )
                    }}
                  />
                </Box>

                {/* Platform Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Platform
                  </Text>
                  <Select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value as PlatformType)}
                    size="sm"
                    width="200px"
                  >
                    {selectedPlatforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </Select>
                </Box>

                {/* Timezone Selector */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Timezone
                  </Text>
                  <Box width="200px">
                    <TimezoneSelect
                      value={timezone}
                      onChange={setTimezone}
                    />
                  </Box>
                </Box>
              </HStack>

              {/* Right side - Analytics Toggle */}
              <Box>
                <Button
                  onClick={() => setIsFrequencyPanelOpen(!isFrequencyPanelOpen)}
                  size="sm"
                  variant="ghost"
                  rightIcon={isFrequencyPanelOpen ? <FaChevronRight /> : <FaChevronLeft />}
                >
                  {isFrequencyPanelOpen ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
              </Box>
            </HStack>
          </Box>
        </Box>

        {/* Main Content */}
        <Box maxW="7xl" mx="auto" position="relative" px={6}>
          <Box
            pb={6}
            pr={isFrequencyPanelOpen ? '380px' : 0}
            transition="all 0.2s"
          >
            {viewMode === 'calendar' ? (
              <Calendar
                posts={getPostsInTimezone(getFilteredPostsByCalendar())}
                onMovePost={handleMovePost}
                onSelectSlot={(date) => {
                  setSelectedDate(date)
                  setViewMode('timeline')
                }}
                localTimezone={timezone}
                targetTimezones={["America/New_York", "Europe/London", "Asia/Tokyo"]}
              />
            ) : (
              <Timeline
                date={selectedDate}
                posts={getPostsInTimezone(getFilteredPosts())}
                onMovePost={handleMovePost}
              />
            )}
          </Box>

          {/* Analytics Panel */}
          {isFrequencyPanelOpen && (
            <Box
              position="fixed"
              right={6}
              top="120px"
              width="350px"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="lg"
              shadow="sm"
              overflow="hidden"
            >
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                <Box p={6} bg="gray.50">
                  <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={1}>
                    Analytics & Insights
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    Optimize your posting schedule
                  </Text>
                  <FrequencyRecommendations
                    platform={activeFilter}
                    existingPosts={getPostsForPlatform(activeFilter)}
                    timezone={timezone}
                    onSelectTime={(time) => {
                      setSelectedDate(time)
                      setViewMode('timeline')
                    }}
                  />
                </Box>

                <Box p={6} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={1}>
                    Schedule Analysis
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    Monitor post frequency and gaps
                  </Text>
                  <ScheduleGapAnalysis
                    posts={getPostsInTimezone(getFilteredPosts())}
                    date={selectedDate}
                    recommendedMaxGap={8}
                    recommendedMinGap={2}
                  />
                </Box>

                <Box p={6} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={1}>
                    Calendar Management
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    Organize your content calendars
                  </Text>
                  <CalendarManager
                    calendars={calendars}
                    activeCalendars={activeCalendars}
                    onToggleCalendar={handleToggleCalendar}
                    onAddCalendar={handleAddCalendar}
                    onEditCalendar={handleEditCalendar}
                    onDeleteCalendar={handleDeleteCalendar}
                  />
                </Box>
              </VStack>
            </Box>
          )}
        </Box>
      </Box>
    </DndProvider>
  )
}