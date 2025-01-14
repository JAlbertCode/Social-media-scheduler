import { PlatformType } from '@/components/PostCreator'
import { NotionTemplate } from './types'
import { prisma } from '../prisma'

interface TemplateVariable {
  name: string
  description?: string
  defaultValue?: string
  required: boolean
  type: 'text' | 'date' | 'number' | 'url' | 'list'
  options?: string[] // For list type
}

interface FormattingRule {
  platform: PlatformType
  maxLength?: number
  prefix?: string
  suffix?: string
  hashtags?: string[]
  mentions?: string[]
  formatting?: {
    bold?: boolean
    italic?: boolean
    code?: boolean
  }
}

export interface ContentTemplate {
  id: string
  name: string
  description?: string
  variables: TemplateVariable[]
  content: string
  platforms: Array<{
    type: PlatformType
    rules: FormattingRule
  }>
  userId: string
  notionTemplateId?: string
}

export async function createTemplate(
  template: Omit<ContentTemplate, 'id'>
): Promise<ContentTemplate> {
  return await prisma.contentTemplate.create({
    data: {
      name: template.name,
      description: template.description,
      variables: template.variables,
      content: template.content,
      platforms: template.platforms,
      userId: template.userId,
      notionTemplateId: template.notionTemplateId
    }
  })
}

export async function formatContent(
  templateId: string,
  variables: Record<string, string>,
  platform: PlatformType
): Promise<string> {
  const template = await prisma.contentTemplate.findUnique({
    where: { id: templateId }
  })

  if (!template) {
    throw new Error('Template not found')
  }

  // Validate required variables
  const missingVariables = template.variables
    .filter(v => v.required && !variables[v.name])
    .map(v => v.name)

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required variables: ${missingVariables.join(', ')}`
    )
  }

  // Get platform-specific rules
  const platformConfig = template.platforms.find(p => p.type === platform)
  if (!platformConfig) {
    throw new Error(`No configuration found for platform ${platform}`)
  }

  // Replace variables
  let content = template.content
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(
      new RegExp(`{{${key}}}`, 'g'),
      formatVariable(value, template.variables.find(v => v.name === key)?.type)
    )
  }

  // Apply platform-specific formatting
  const { rules } = platformConfig
  content = applyFormatting(content, rules)

  // Validate length
  if (rules.maxLength && content.length > rules.maxLength) {
    throw new Error(
      `Content exceeds maximum length of ${rules.maxLength} for ${platform}`
    )
  }

  return content
}

function formatVariable(value: string, type?: string): string {
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'number':
      return Number(value).toLocaleString()
    case 'url':
      try {
        const url = new URL(value)
        return url.toString()
      } catch {
        return value
      }
    default:
      return value
  }
}

function applyFormatting(content: string, rules: FormattingRule): string {
  let formatted = content

  // Add prefix/suffix
  if (rules.prefix) {
    formatted = rules.prefix + formatted
  }
  if (rules.suffix) {
    formatted = formatted + rules.suffix
  }

  // Add hashtags at appropriate position
  if (rules.hashtags?.length) {
    formatted = formatted + '\\n' + rules.hashtags.join(' ')
  }

  // Add mentions at appropriate position
  if (rules.mentions?.length) {
    formatted = rules.mentions.join(' ') + '\\n' + formatted
  }

  // Apply text formatting
  if (rules.formatting?.bold) {
    formatted = `**${formatted}**`
  }
  if (rules.formatting?.italic) {
    formatted = `*${formatted}*`
  }
  if (rules.formatting?.code) {
    formatted = `\`${formatted}\``
  }

  return formatted
}

export async function getUserTemplates(userId: string): Promise<ContentTemplate[]> {
  return await prisma.contentTemplate.findMany({
    where: { userId }
  })
}

export async function updateTemplate(
  templateId: string,
  updates: Partial<Omit<ContentTemplate, 'id' | 'userId'>>
): Promise<ContentTemplate> {
  return await prisma.contentTemplate.update({
    where: { id: templateId },
    data: updates
  })
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await prisma.contentTemplate.delete({
    where: { id: templateId }
  })
}

export async function validateTemplate(template: Partial<ContentTemplate>): Promise<{
  valid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  // Check required fields
  if (!template.name) {
    errors.push('Template name is required')
  }
  if (!template.content) {
    errors.push('Template content is required')
  }
  if (!template.platforms?.length) {
    errors.push('At least one platform must be configured')
  }

  // Validate variables used in content exist in variables list
  const contentVariables = template.content?.match(/{{(.*?)}}/g)?.map(v => 
    v.replace('{{', '').replace('}}', '')
  ) || []

  const definedVariables = template.variables?.map(v => v.name) || []
  const undefinedVariables = contentVariables.filter(
    v => !definedVariables.includes(v)
  )

  if (undefinedVariables.length > 0) {
    errors.push(
      `Variables used in content but not defined: ${undefinedVariables.join(', ')}`
    )
  }

  // Validate platform-specific rules
  template.platforms?.forEach(platform => {
    if (platform.rules.maxLength && platform.rules.maxLength < 10) {
      errors.push(
        `Maximum length for ${platform.type} must be at least 10 characters`
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}