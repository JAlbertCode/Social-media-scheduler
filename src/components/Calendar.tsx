'use client'

import React, { useState } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ScheduledPost, DragItem } from '../types/calendar'
import { DraggablePost } from './DraggablePost'
import {
  Box,
  Grid,
  Heading,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
  ButtonGroup,
  useToken,
} from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface CalendarProps {
  posts: ScheduledPost[]
  onSelectSlot?: (date: Date) => void
  onMovePost?: (postId: string, newDate: Date) => void
}

function CalendarDay({ 
  date,
  posts,
  isCurrentMonth,
  onDrop,
  onClick,
  isToday,
}: { 
  date: Date
  posts: ScheduledPost[]
  isCurrentMonth: boolean
  onDrop: (item: DragItem) => void
  onClick: () => void
  isToday: boolean
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'POST',
    drop: (item: DragItem) => onDrop(item),
    collect: monitor => ({
      isOver: !!monitor.isOver()
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
      ref={drop}
      onClick={onClick}
      bg={
        !isCurrentMonth ? inactiveBg :
        isToday ? todayBg :
        isOver ? dropBg :
        bgColor
      }
      borderWidth="1px"
      borderColor={borderColor}
      minH="120px"
      p={2}
      cursor={isCurrentMonth ? 'pointer' : 'default'}
      transition="all 0.2s"
      _hover={isCurrentMonth ? { bg: hoverBg } : {}}
      role="group"
    >
      <Text
        fontSize="sm"
        fontWeight={isToday ? 'bold' : 'medium'}
        color={isToday ? 'brand.500' : isCurrentMonth ? 'inherit' : 'gray.400'}
        mb={1}
      >
        {isCurrentMonth ? date.getDate() : ''}
      </Text>
      <VStack spacing={1} align="stretch">
        {posts.map((post) => (
          <DraggablePost key={post.id} post={post} />
        ))}
      </VStack>
    </Box>
  )
}

export function Calendar({ posts, onSelectSlot, onMovePost }: CalendarProps) {
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
    <DndProvider backend={HTML5Backend}>
      <Box
        bg={headerBg}
        rounded="xl"
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Box
          px={6}
          py={4}
          borderBottomWidth="1px"
          borderColor={borderColor}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
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

        <Grid templateColumns="repeat(7, 1fr)">
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
              />
            )
          })}
        </Grid>
      </Box>
    </DndProvider>
  )
}