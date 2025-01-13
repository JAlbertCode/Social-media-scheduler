import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'

// Get user's timezone from browser
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Convert local time to UTC
export const toUTC = (date: Date, timeZone: string): Date => {
  return zonedTimeToUtc(date, timeZone)
}

// Convert UTC to local time
export const fromUTC = (date: Date, timeZone: string): Date => {
  return utcToZonedTime(date, timeZone)
}

// Format date with timezone
export const formatInTimezone = (date: Date, timeZone: string, formatStr: string): string => {
  return format(utcToZonedTime(date, timeZone), formatStr, { timeZone })
}

// Get all available timezones
export const getAvailableTimezones = (): string[] => {
  return Intl.supportedValuesOf('timeZone')
}

// Group timezones by region
export const getGroupedTimezones = (): Record<string, string[]> => {
  const timezones = getAvailableTimezones()
  return timezones.reduce((acc, timezone) => {
    const [region] = timezone.split('/')
    if (!acc[region]) {
      acc[region] = []
    }
    acc[region].push(timezone)
    return acc
  }, {} as Record<string, string[]>)
}