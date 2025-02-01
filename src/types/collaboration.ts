export type CollaboratorRole = 
  | 'owner'      // Can do everything including delete calendar
  | 'admin'      // Can manage posts and members, but can't delete calendar
  | 'editor'     // Can create/edit posts
  | 'scheduler'  // Can only schedule/move posts
  | 'viewer'     // Can only view

export interface Collaborator {
  userId: string
  userEmail: string
  userName: string
  role: CollaboratorRole
  addedAt: Date
  addedBy: string
  lastAccess?: Date
}

export interface SharingSettings {
  isPublic: boolean               // If true, anyone with link can view
  allowComments: boolean          // Allow viewers to comment on posts
  requireApproval: boolean        // Require owner/admin approval for changes
  notifyOnChanges: boolean        // Email notifications for changes
  autoAcceptInvites: boolean      // Auto-accept team member invites
}

export interface CollaborationInvite {
  id: string
  calendarId: string
  invitedEmail: string
  invitedBy: string
  role: CollaboratorRole
  createdAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
}