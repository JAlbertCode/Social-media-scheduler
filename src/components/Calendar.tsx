'use client'

import React, { useState } from 'react'
import { useDrop } from 'react-dnd'
import { ScheduledPost, DragItem } from '../types/calendar'
import { DraggablePost } from './DraggablePost'
import { BusinessEventOverlay } from './BusinessEventOverlay'
import { getBusinessEvents, BusinessEvent } from '../utils/businessEvents'
import {
  Box,
  Grid,
  Heading,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
  ButtonGroup,
} from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { startOfDay, endOfDay } from 'date-fns'

interface CalendarDayProps {
  date: Date
  posts: ScheduledPost[]
  isCurrentMonth: boolean
  onDrop: (item: DragItem) => void
  onClick: () => void
  isToday: boolean
  allPosts: ScheduledPost[]
  localTimezone: string
  targetTimezones?: string[]
  businessEvents: BusinessEvent[]
}

function CalendarDay({ 
  date,
  posts,
  isCurrentMonth,
  onDrop,
  onClick,
  isToday,
  allPosts,
  localTimezone,
  targetTimezones,
  businessEvents,
}: CalendarDayProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'POST',
    canDrop: (item: DragItem, monitor) => {
      return monitor.isOver({ shallow: true })
    },
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) {
        return
      }
      onDrop(item)
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }))

  const bgColor = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const dropBg = useColorModeValue('blue.50', 'blue.900')
  const inactiveBg = useColorModeValue('gray.50', 'gray.900')
  const todayBg = useColorModeValue('brand.50', 'brand.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      bg={
        !isCurrentMonth ? inactiveBg :
        isToday ? todayBg :
        isOver ? dropBg :
        bgColor
      }
      h="120px"
      maxH="120px"
      position="relative"
      transition="all 0.2s"
      _hover={isCurrentMonth ? { bg: hoverBg } : {}}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Box
        ref={drop}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        onClick={(e) => {
          if (!isOver) {
            onClick()
          }
        }}
        cursor={isCurrentMonth ? 'pointer' : 'default'}
      />

      <Box p={2} flex="1" display="flex" flexDirection="column" overflow="hidden">
        {isCurrentMonth && businessEvents.length > 0 && (
          <BusinessEventOverlay events={businessEvents} />
        )}

        <Text
          fontSize="sm"
          fontWeight={isToday ? 'bold' : 'medium'}
          color={isToday ? 'brand.500' : isCurrentMonth ? 'inherit' : 'gray.400'}
          mb={1}
          flexShrink={0}
        >
          {isCurrentMonth ? date.getDate() : ''}
        </Text>

        <VStack 
          spacing={1} 
          align="stretch"
          flex="1"
          overflow="auto"
          minH={0}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.200',
              borderRadius: '24px',
            },
          }}
        >
          {posts.map((post) => (
            <Box
              key={post.id}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <DraggablePost post={post} allPosts={allPosts} />
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  )
}

interface CalendarProps {
  posts: ScheduledPost[]
  onSelectSlot?: (date: Date) => void
  onMovePost?: (postId: string, newDate: Date) => void
  localTimezone: string
  targetTimezones?: string[]
}

export function Calendar({ posts, onSelectSlot, onMovePost, localTimezone, targetTimezones }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const days = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  
  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledTime)
      return postDate.getDate() === date.getDate() &&
             postDate.getMonth() === date.getMonth() &&
             postDate.getFullYear() === date.getFullYear()
    })
  }

  const changeMonth = (increment: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + increment))
  }

  const headerBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const weekdayBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box
      bg={headerBg}
      rounded="xl"
      shadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      h="calc(100vh - 200px)"
      display="flex"
      flexDirection="column"
    >
      <Box
        px={6}
        py={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexShrink={0}
      >
        <Heading size="md" color={useColorModeValue('gray.900', 'white')}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Heading>
        <ButtonGroup size="sm" spacing={2}>
          <IconButton
            aria-label="Previous month"
            icon={<FaChevronLeft size="12px" />}
            onClick={() => changeMonth(-1)}
            variant="ghost"
          />
          <IconButton
            aria-label="Next month"
            icon={<FaChevronRight size="12px" />}
            onClick={() => changeMonth(1)}
            variant="ghost"
          />
        </ButtonGroup>
      </Box>

      <Grid
        templateRows="auto auto"
        gridTemplateRows="auto 1fr"
        templateColumns="repeat(7, 1fr)"
        height="100%"
        flex={1}
      >
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box
            key={day}
            bg={weekdayBg}
            py={2}
            textAlign="center"
          >
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={useColorModeValue('gray.600', 'gray.400')}
            >
              {day}
            </Text>
          </Box>
        ))}

        {/* Calendar Days */}
        {Array.from({ length: 42 }, (_, i) => {
          const dayNumber = i - firstDay + 1
          const isCurrentMonth = dayNumber > 0 && dayNumber <= days
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            dayNumber
          )
          const dayPosts = isCurrentMonth ? getPostsForDay(date) : []
          
          return (
            <CalendarDay
              key={i}
              date={date}
              posts={dayPosts}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday(date)}
              onDrop={(item) => {
                if (onMovePost && isCurrentMonth) {
                  onMovePost(item.id, date)
                }
              }}
              onClick={() => {
                if (isCurrentMonth && onSelectSlot) {
                  onSelectSlot(date)
                }
              }}
              allPosts={posts}
              localTimezone={localTimezone}
              targetTimezones={targetTimezones}
              businessEvents={
                isCurrentMonth 
                  ? getBusinessEvents(startOfDay(date), endOfDay(date)) 
                  : []
              }
            />
          )
        })}
      </Grid>
    </Box>
  )
}