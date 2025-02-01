'use client'

import React from 'react'
import {
  HStack,
  IconButton,
  Tooltip,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUndo, FaRedo } from 'react-icons/fa'

interface UndoRedoControlsProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  undoTooltip?: string
  redoTooltip?: string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

export function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoTooltip = 'Undo last action',
  redoTooltip = 'Redo last action',
  size = 'sm',
  showLabels = false,
}: UndoRedoControlsProps) {
  const buttonColor = useColorModeValue('gray.600', 'gray.400')
  const disabledColor = useColorModeValue('gray.300', 'gray.600')

  return (
    <HStack spacing={2}>
      <Tooltip 
        label={undoTooltip} 
        isDisabled={!canUndo}
        placement="bottom"
      >
        <IconButton
          icon={<FaUndo />}
          aria-label="Undo"
          onClick={onUndo}
          isDisabled={!canUndo}
          size={size}
          variant="ghost"
          color={canUndo ? buttonColor : disabledColor}
        />
      </Tooltip>

      {showLabels && (
        <Text
          fontSize={size === 'sm' ? 'xs' : 'sm'}
          color={canUndo ? buttonColor : disabledColor}
        >
          Undo
        </Text>
      )}

      <Tooltip 
        label={redoTooltip} 
        isDisabled={!canRedo}
        placement="bottom"
      >
        <IconButton
          icon={<FaRedo />}
          aria-label="Redo"
          onClick={onRedo}
          isDisabled={!canRedo}
          size={size}
          variant="ghost"
          color={canRedo ? buttonColor : disabledColor}
        />
      </Tooltip>

      {showLabels && (
        <Text
          fontSize={size === 'sm' ? 'xs' : 'sm'}
          color={canRedo ? buttonColor : disabledColor}
        >
          Redo
        </Text>
      )}
    </HStack>
  )
}