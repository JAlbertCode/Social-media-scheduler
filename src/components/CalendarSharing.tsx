'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  IconButton,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaEllipsisV, FaCopy, FaUserPlus } from 'react-icons/fa'
import { 
  Collaborator, 
  CollaboratorRole, 
  SharingSettings,
  CollaborationInvite 
} from '../types/collaboration'
import { CalendarConfig } from '../types/calendars'

interface CalendarSharingProps {
  calendar: CalendarConfig
  collaborators: Collaborator[]
  sharingSettings: SharingSettings
  pendingInvites: CollaborationInvite[]
  onAddCollaborator: (email: string, role: CollaboratorRole) => void
  onRemoveCollaborator: (userId: string) => void
  onUpdateCollaboratorRole: (userId: string, role: CollaboratorRole) => void
  onUpdateSharingSettings: (settings: SharingSettings) => void
  onCancelInvite: (inviteId: string) => void
  onResendInvite: (inviteId: string) => void
}

export function CalendarSharing({
  calendar,
  collaborators,
  sharingSettings,
  pendingInvites,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateCollaboratorRole,
  onUpdateSharingSettings,
  onCancelInvite,
  onResendInvite,
}: CalendarSharingProps) {
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<CollaboratorRole>('editor')
  const toast = useToast()

  const handleAddCollaborator = () => {
    if (!newEmail.trim()) {
      toast({
        title: 'Email required',
        status: 'error',
        duration: 3000,
      })
      return
    }
    onAddCollaborator(newEmail.trim(), newRole)
    setNewEmail('')
  }

  const getShareLink = () => {
    // In real app, this would be a proper sharing URL
    return `${window.location.origin}/calendar/${calendar.id}`
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareLink())
    toast({
      title: 'Link copied',
      status: 'success',
      duration: 2000,
    })
  }

  const getRoleBadgeColor = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return 'purple'
      case 'admin':
        return 'red'
      case 'editor':
        return 'green'
      case 'scheduler':
        return 'blue'
      default:
        return 'gray'
    }
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            Share {calendar.name}
          </Text>
          <HStack>
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
            />
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as CollaboratorRole)}
              width="150px"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="scheduler">Scheduler</option>
              <option value="viewer">Viewer</option>
            </Select>
            <Button
              leftIcon={<FaUserPlus />}
              colorScheme="brand"
              onClick={handleAddCollaborator}
            >
              Invite
            </Button>
          </HStack>
        </Box>

        <Divider />

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            Sharing Settings
          </Text>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm">Allow public view access</Text>
              <Switch
                isChecked={sharingSettings.isPublic}
                onChange={(e) => onUpdateSharingSettings({
                  ...sharingSettings,
                  isPublic: e.target.checked
                })}
              />
            </HStack>
            {sharingSettings.isPublic && (
              <HStack>
                <Input
                  value={getShareLink()}
                  isReadOnly
                  size="sm"
                />
                <IconButton
                  icon={<FaCopy />}
                  aria-label="Copy link"
                  size="sm"
                  onClick={copyShareLink}
                />
              </HStack>
            )}
            <HStack justify="space-between">
              <Text fontSize="sm">Allow comments</Text>
              <Switch
                isChecked={sharingSettings.allowComments}
                onChange={(e) => onUpdateSharingSettings({
                  ...sharingSettings,
                  allowComments: e.target.checked
                })}
              />
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm">Require approval for changes</Text>
              <Switch
                isChecked={sharingSettings.requireApproval}
                onChange={(e) => onUpdateSharingSettings({
                  ...sharingSettings,
                  requireApproval: e.target.checked
                })}
              />
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm">Email notifications</Text>
              <Switch
                isChecked={sharingSettings.notifyOnChanges}
                onChange={(e) => onUpdateSharingSettings({
                  ...sharingSettings,
                  notifyOnChanges: e.target.checked
                })}
              />
            </HStack>
          </VStack>
        </Box>

        <Divider />

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            Team Members
          </Text>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Last Access</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {collaborators.map((collaborator) => (
                <Tr key={collaborator.userId}>
                  <Td>
                    <Text fontSize="sm">{collaborator.userName}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {collaborator.userEmail}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getRoleBadgeColor(collaborator.role)}>
                      {collaborator.role}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="xs" color="gray.500">
                      {collaborator.lastAccess
                        ? new Date(collaborator.lastAccess).toLocaleDateString()
                        : 'Never'}
                    </Text>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          onClick={() => onUpdateCollaboratorRole(
                            collaborator.userId,
                            'admin'
                          )}
                        >
                          Make Admin
                        </MenuItem>
                        <MenuItem
                          onClick={() => onUpdateCollaboratorRole(
                            collaborator.userId,
                            'editor'
                          )}
                        >
                          Make Editor
                        </MenuItem>
                        <MenuItem
                          onClick={() => onUpdateCollaboratorRole(
                            collaborator.userId,
                            'scheduler'
                          )}
                        >
                          Make Scheduler
                        </MenuItem>
                        <MenuItem
                          onClick={() => onUpdateCollaboratorRole(
                            collaborator.userId,
                            'viewer'
                          )}
                        >
                          Make Viewer
                        </MenuItem>
                        <MenuItem
                          onClick={() => onRemoveCollaborator(collaborator.userId)}
                          color="red.500"
                        >
                          Remove Access
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {pendingInvites.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                Pending Invites
              </Text>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Invited By</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingInvites.map((invite) => (
                    <Tr key={invite.id}>
                      <Td>{invite.invitedEmail}</Td>
                      <Td>
                        <Badge colorScheme={getRoleBadgeColor(invite.role)}>
                          {invite.role}
                        </Badge>
                      </Td>
                      <Td>{invite.invitedBy}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            invite.status === 'pending' ? 'yellow' :
                            invite.status === 'accepted' ? 'green' :
                            'red'
                          }
                        >
                          {invite.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              onClick={() => onResendInvite(invite.id)}
                            >
                              Resend Invite
                            </MenuItem>
                            <MenuItem
                              onClick={() => onCancelInvite(invite.id)}
                              color="red.500"
                            >
                              Cancel Invite
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  )
}