'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Badge,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react'
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaPalette } from 'react-icons/fa'
import { CalendarConfig } from '../types/calendars'

interface CalendarManagerProps {
  calendars: CalendarConfig[]
  activeCalendars: string[]
  onToggleCalendar: (calendarId: string) => void
  onAddCalendar: (calendar: Omit<CalendarConfig, 'id' | 'createdAt' | 'updatedAt'>) => void
  onEditCalendar: (calendar: CalendarConfig) => void
  onDeleteCalendar: (calendarId: string) => void
}

export function CalendarManager({
  calendars,
  activeCalendars,
  onToggleCalendar,
  onAddCalendar,
  onEditCalendar,
  onDeleteCalendar,
}: CalendarManagerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingCalendar, setEditingCalendar] = React.useState<CalendarConfig | null>(null)
  const [newCalendar, setNewCalendar] = React.useState({
    name: '',
    description: '',
    color: '#3182CE',
    type: 'custom' as const,
    isActive: true,
  })

  const handleAddOrEdit = () => {
    if (editingCalendar) {
      onEditCalendar({
        ...editingCalendar,
        ...newCalendar,
        updatedAt: new Date(),
      })
    } else {
      onAddCalendar(newCalendar)
    }
    handleClose()
  }

  const handleClose = () => {
    setEditingCalendar(null)
    setNewCalendar({
      name: '',
      description: '',
      color: '#3182CE',
      type: 'custom',
      isActive: true,
    })
    onClose()
  }

  const handleEdit = (calendar: CalendarConfig) => {
    setEditingCalendar(calendar)
    setNewCalendar({
      name: calendar.name,
      description: calendar.description || '',
      color: calendar.color,
      type: calendar.type,
      isActive: calendar.isActive,
    })
    onOpen()
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" fontWeight="medium">
          Calendars
        </Text>
        <Button
          size="sm"
          leftIcon={<FaPlus />}
          colorScheme="brand"
          variant="ghost"
          onClick={onOpen}
        >
          Add Calendar
        </Button>
      </HStack>

      <VStack align="stretch" spacing={2}>
        {calendars.map((calendar) => (
          <HStack
            key={calendar.id}
            p={2}
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            rounded="md"
            spacing={3}
          >
            <Checkbox
              isChecked={activeCalendars.includes(calendar.id)}
              onChange={() => onToggleCalendar(calendar.id)}
              colorScheme="brand"
            />
            <Box
              w="3"
              h="3"
              rounded="full"
              bg={calendar.color}
              flexShrink={0}
            />
            <Text fontSize="sm" flex={1} noOfLines={1}>
              {calendar.name}
            </Text>
            <Badge
              colorScheme={
                calendar.type === 'campaign' ? 'purple' :
                calendar.type === 'product' ? 'blue' :
                calendar.type === 'brand' ? 'green' :
                calendar.type === 'team' ? 'orange' :
                'gray'
              }
              fontSize="xs"
            >
              {calendar.type}
            </Badge>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
                aria-label="Calendar options"
              />
              <MenuList>
                <MenuItem icon={<FaEdit />} onClick={() => handleEdit(calendar)}>
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<FaTrash />}
                  onClick={() => onDeleteCalendar(calendar.id)}
                  color="red.500"
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingCalendar ? 'Edit Calendar' : 'Add Calendar'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={newCalendar.name}
                  onChange={(e) => setNewCalendar(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="e.g., Q1 Campaign, Product Launch"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={newCalendar.description}
                  onChange={(e) => setNewCalendar(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Optional description"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={newCalendar.type}
                  onChange={(e) => setNewCalendar(prev => ({
                    ...prev,
                    type: e.target.value as CalendarConfig['type']
                  }))}
                >
                  <option value="campaign">Campaign</option>
                  <option value="product">Product</option>
                  <option value="brand">Brand</option>
                  <option value="team">Team</option>
                  <option value="custom">Custom</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Color</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={newCalendar.color}
                    onChange={(e) => setNewCalendar(prev => ({
                      ...prev,
                      color: e.target.value
                    }))}
                    width="100px"
                  />
                  <Text fontSize="sm" color="gray.500">
                    Choose a color for calendar identification
                  </Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleAddOrEdit}
              isDisabled={!newCalendar.name}
            >
              {editingCalendar ? 'Save Changes' : 'Add Calendar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}