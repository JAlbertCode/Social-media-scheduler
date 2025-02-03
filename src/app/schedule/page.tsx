'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import {
  VStack,
  Box,
  HStack,
  Text,
  Button,
  ButtonGroup,
  Select,
  Divider,
  useDisclosure,
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
import { PlatformType } from '../../types/platforms'
import { PlatformToggle } from '../../components/PlatformToggle'
import { SchedulerOnboarding } from '../../components/SchedulerOnboarding'
import { ScheduleEmptyState } from '../../components/ScheduleEmptyState'
import { SchedulerLoading } from '../../components/SchedulerLoading'
import { PostCreator } from '../../components/PostCreator'

// Import DndProvider dynamically
const DndProvider = dynamic(() => import('../../components/DndProvider'), {
  ssr: false,
})

type ViewMode = 'calendar' | 'timeline'

export default function SchedulePage() {
  return (
    <Suspense fallback={<SchedulerLoading />}>
      <ClientSideScheduler />
    </Suspense>
  )
}

function ClientSideScheduler() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState<string>('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Twitter', 'LinkedIn', 'Instagram'])
  const [activeFilter, setActiveFilter] = useState<PlatformType>('Twitter')
  const [isFrequencyPanelOpen, setIsFrequencyPanelOpen] = useState(true)
  const { isOpen: isComposeOpen, onOpen: openCompose, onClose: closeCompose } = useDisclosure()
  const [scheduleTime, setScheduleTime] = useState<Date | null>(null)
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
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([{
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
  }])

  const handleOpenCompose = (time?: Date) => {
    if (time) {
      setScheduleTime(time)
    }
    openCompose()
  }

  const handleCloseCompose = () => {
    setScheduleTime(null)
    closeCompose()
  }

  const handlePostCreate = useCallback((post: {
    content: string
    hashtags: string[]
    mentions: string[]
    urls: string[]
    threads?: string[]
    media?: File[]
    scheduledTime?: Date
  }) => {
    const newPost: ScheduledPost = {
      id: Math.random().toString(36).substring(7), // In real app, this would come from backend
      content: post.content,
      platforms: selectedPlatforms,
      scheduledTime: post.scheduledTime || new Date(),
    }
    setScheduledPosts(prev => [...prev, newPost])
    handleCloseCompose()
  }, [selectedPlatforms])

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
    return activeCalendars.length > 0 ? scheduledPosts : []
  }

  const getFilteredPosts = () => {
    if (selectedPlatforms.length === 0) return scheduledPosts
    return scheduledPosts.filter(post =>
      post.platforms.some(platform => selectedPlatforms.includes(platform))
    )
  }

  const handleCreatePost = (time?: Date) => {
    handleOpenCompose(time)
  }

  if (!timezone) {
    return null
  }

  const handleMovePost = (postId: string, newDate: Date) => {
    setScheduledPosts(prev => prev.map(post => 
      post.id === postId
        ? { ...post, scheduledTime: newDate }
        : post
    ))
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
    <DndProvider>
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
                      setSelectedPlatforms(prev => {
                        const newPlatforms = prev.includes(platform)
                          ? prev.filter(p => p !== platform)
                          : [...prev, platform]
                        
                        if (prev.includes(platform) && platform === activeFilter) {
                          setActiveFilter(newPlatforms[0] || 'Twitter')
                        }
                        else if (!prev.includes(platform) && prev.length === 0) {
                          setActiveFilter(platform)
                        }
                        
                        return newPlatforms
                      })
                    }}
                  />
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
            {scheduledPosts.length === 0 ? (
              <ScheduleEmptyState onCreatePost={handleCreatePost} />
            ) : viewMode === 'calendar' ? (
              <Calendar
                posts={getPostsInTimezone(getFilteredPostsByCalendar())}
                onMovePost={handleMovePost}
                onSelectSlot={(date) => {
                  handleCreatePost(date)
                }}
                localTimezone={timezone}
                targetTimezones={["America/New_York", "Europe/London", "Asia/Tokyo"]}
              />
            ) : (
              <Timeline
                date={selectedDate}
                posts={getPostsInTimezone(getFilteredPosts())}
                onMovePost={handleMovePost}
                onBack={() => setViewMode('calendar')}
                onCreatePost={handleCreatePost}
              />
            )}
          </Box>

          {/* Analytics Panel */}
          {isFrequencyPanelOpen && (
            <Box
              position="fixed"
              height="calc(100vh - 140px)"
              top="140px"
              overflowY="auto"
              right={6}
              width="350px"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="lg"
              shadow="sm"
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
                      handleCreatePost(time)
                    }}
                  />
                </Box>

                <Box p={6} mb={4} borderTopWidth="1px" borderColor="gray.100">
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

        {/* Post Creator Dialog */}
        <PostCreator
          isOpen={isComposeOpen}
          onClose={handleCloseCompose}
          initialScheduledTime={scheduleTime}
          selectedPlatforms={selectedPlatforms}
          onPostCreate={handlePostCreate}
        />
      </Box>
    </DndProvider>
  )
}