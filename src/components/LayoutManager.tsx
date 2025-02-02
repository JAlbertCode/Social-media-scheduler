'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  useDisclosure,
  useToast,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react'
import { FaPlus, FaEllipsisV, FaCopy, FaTrash, FaSave } from 'react-icons/fa'
import { useLayout } from '../contexts/LayoutContext'
import { LayoutConfig, LayoutViewType } from '../types/layouts'

interface LayoutEditorProps {
  layout: LayoutConfig
  onSave: (layout: LayoutConfig) => void
  onClose: () => void
}

function LayoutEditor({ layout, onSave, onClose }: LayoutEditorProps) {
  const [editedLayout, setEditedLayout] = useState<LayoutConfig>({ ...layout })

  const handleSave = () => {
    if (!editedLayout.name.trim()) {
      return
    }
    onSave(editedLayout)
    onClose()
  }

  return (
    <>
      <FormControl mb={4}>
        <FormLabel>Layout Name</FormLabel>
        <Input
          value={editedLayout.name}
          onChange={(e) => setEditedLayout(prev => ({
            ...prev,
            name: e.target.value
          }))}
          placeholder="Enter layout name"
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>View Type</FormLabel>
        <Select
          value={editedLayout.type}
          onChange={(e) => setEditedLayout(prev => ({
            ...prev,
            type: e.target.value as LayoutViewType
          }))}
        >
          <option value="calendar">Calendar</option>
          <option value="timeline">Timeline</option>
          <option value="kanban">Kanban</option>
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="agenda">Agenda</option>
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Columns</FormLabel>
        <VStack align="stretch" spacing={2}>
          {editedLayout.columns.map((column, index) => (
            <HStack key={column.id} spacing={4}>
              <Switch
                isChecked={column.visible}
                onChange={(e) => {
                  const updatedColumns = [...editedLayout.columns]
                  updatedColumns[index] = {
                    ...column,
                    visible: e.target.checked
                  }
                  setEditedLayout(prev => ({
                    ...prev,
                    columns: updatedColumns
                  }))
                }}
              />
              <Text flex={1}>{column.title}</Text>
              <Select
                value={column.order}
                onChange={(e) => {
                  const updatedColumns = [...editedLayout.columns]
                  updatedColumns[index] = {
                    ...column,
                    order: parseInt(e.target.value)
                  }
                  setEditedLayout(prev => ({
                    ...prev,
                    columns: updatedColumns.sort((a, b) => a.order - b.order)
                  }))
                }}
                width="100px"
              >
                {editedLayout.columns.map((_, i) => (
                  <option key={i} value={i}>{i + 1}</option>
                ))}
              </Select>
            </HStack>
          ))}
        </VStack>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Preferences</FormLabel>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text fontSize="sm">Compact View</Text>
            <Switch
              isChecked={editedLayout.preferences.compactView}
              onChange={(e) => setEditedLayout(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  compactView: e.target.checked
                }
              }))}
            />
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">Show Analytics</Text>
            <Switch
              isChecked={editedLayout.preferences.showAnalytics}
              onChange={(e) => setEditedLayout(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  showAnalytics: e.target.checked
                }
              }))}
            />
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">Show Previews</Text>
            <Switch
              isChecked={editedLayout.preferences.showPreviews}
              onChange={(e) => setEditedLayout(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  showPreviews: e.target.checked
                }
              }))}
            />
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">Enable Drag & Drop</Text>
            <Switch
              isChecked={editedLayout.preferences.enableDragDrop}
              onChange={(e) => setEditedLayout(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  enableDragDrop: e.target.checked
                }
              }))}
            />
          </HStack>
        </VStack>
      </FormControl>

      <HStack spacing={4}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          colorScheme="brand"
          leftIcon={<FaSave />}
          onClick={handleSave}
          isDisabled={!editedLayout.name.trim()}
        >
          Save Layout
        </Button>
      </HStack>
    </>
  )
}

export function LayoutManager() {
  const {
    layouts,
    currentLayout,
    setCurrentLayout,
    addLayout,
    updateLayout,
    deleteLayout,
    duplicateLayout,
  } = useLayout()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingLayout, setEditingLayout] = useState<LayoutConfig | null>(null)
  const toast = useToast()

  const handleEdit = (layout: LayoutConfig) => {
    setEditingLayout(layout)
    onOpen()
  }

  const handleSave = (updatedLayout: LayoutConfig) => {
    updateLayout(updatedLayout)
    toast({
      title: 'Layout updated',
      status: 'success',
      duration: 2000,
    })
    onClose()
  }

  const handleDelete = (layoutId: string) => {
    if (layouts.length <= 1) {
      toast({
        title: 'Cannot delete last layout',
        status: 'error',
        duration: 2000,
      })
      return
    }
    deleteLayout(layoutId)
    toast({
      title: 'Layout deleted',
      status: 'success',
      duration: 2000,
    })
  }

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Text fontSize="lg" fontWeight="medium">
          Layouts
        </Text>
        <Button
          size="sm"
          leftIcon={<FaPlus />}
          onClick={() => handleEdit({
            id: '',
            name: 'New Layout',
            type: 'calendar',
            columns: [],
            filters: {},
            preferences: {
              compactView: false,
              showAnalytics: true,
              showPreviews: true,
              enableDragDrop: true,
            }
          })}
        >
          New Layout
        </Button>
      </HStack>

      <VStack align="stretch" spacing={2}>
        {layouts.map((layout) => (
          <HStack
            key={layout.id}
            p={2}
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            rounded="md"
            spacing={3}
          >
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium">
                {layout.name}
              </Text>
              <HStack spacing={2} mt={1}>
                <Badge size="sm">{layout.type}</Badge>
                {currentLayout?.id === layout.id && (
                  <Badge colorScheme="brand">Active</Badge>
                )}
              </HStack>
            </Box>

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem
                  icon={<FaSave />}
                  onClick={() => setCurrentLayout(layout.id)}
                  isDisabled={currentLayout?.id === layout.id}
                >
                  Set as Active
                </MenuItem>
                <MenuItem
                  icon={<FaCopy />}
                  onClick={() => duplicateLayout(layout.id)}
                >
                  Duplicate
                </MenuItem>
                <MenuItem
                  icon={<FaTrash />}
                  onClick={() => handleDelete(layout.id)}
                  color="red.500"
                  isDisabled={layouts.length <= 1}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingLayout?.id ? 'Edit Layout' : 'New Layout'}
          </ModalHeader>
          <ModalBody>
            {editingLayout && (
              <LayoutEditor
                layout={editingLayout}
                onSave={handleSave}
                onClose={onClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}