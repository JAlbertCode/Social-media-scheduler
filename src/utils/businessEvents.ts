import { getYear } from 'date-fns'

export type BusinessEventType = 
  | 'holiday' 
  | 'shopping' 
  | 'business' 
  | 'industry' 
  | 'company'

export interface BusinessEvent {
  id: string
  name: string
  startDate: Date
  endDate: Date
  type: BusinessEventType
  region?: string
  impact: 'high' | 'medium' | 'low'
  suggestedContent?: string
  postingRecommendation: 'avoid' | 'encouraged' | 'neutral'
  icon?: string
}

// Key shopping dates that affect most businesses
const getShoppingEvents = (year: number = getYear(new Date())): BusinessEvent[] => [
  {
    id: 'black-friday',
    name: 'Black Friday',
    startDate: new Date(year, 10, 24), // November 24
    endDate: new Date(year, 10, 24, 23, 59),
    type: 'shopping',
    impact: 'high',
    suggestedContent: 'Promote special offers, deals, and discounts. Use urgency in messaging.',
    postingRecommendation: 'encouraged',
    icon: '🛍️'
  },
  {
    id: 'cyber-monday',
    name: 'Cyber Monday',
    startDate: new Date(year, 10, 27), // November 27
    endDate: new Date(year, 10, 27, 23, 59),
    type: 'shopping',
    impact: 'high',
    suggestedContent: 'Focus on online deals and digital offerings. Highlight website exclusives.',
    postingRecommendation: 'encouraged',
    icon: '💻'
  },
  // Add more shopping events...
]

// Major holidays that might affect business operations
const getHolidays = (year: number = getYear(new Date())): BusinessEvent[] => [
  {
    id: 'christmas',
    name: 'Christmas Day',
    startDate: new Date(year, 11, 25), // December 25
    endDate: new Date(year, 11, 25, 23, 59),
    type: 'holiday',
    impact: 'high',
    region: 'global',
    suggestedContent: 'Season\'s greetings and holiday wishes. Avoid hard selling.',
    postingRecommendation: 'avoid',
    icon: '🎄'
  },
  {
    id: 'new-years',
    name: 'New Year\'s Day',
    startDate: new Date(year, 0, 1), // January 1
    endDate: new Date(year, 0, 1, 23, 59),
    type: 'holiday',
    impact: 'high',
    region: 'global',
    suggestedContent: 'New Year wishes, annual reflections, or future plans.',
    postingRecommendation: 'neutral',
    icon: '🎉'
  },
  // Add more holidays...
]

// Business operation dates
const getBusinessOperationEvents = (year: number = getYear(new Date())): BusinessEvent[] => [
  {
    id: 'fiscal-year-end',
    name: 'Fiscal Year End',
    startDate: new Date(year, 11, 31), // December 31
    endDate: new Date(year, 11, 31, 23, 59),
    type: 'business',
    impact: 'medium',
    suggestedContent: 'Year-end summaries, achievements, and future goals.',
    postingRecommendation: 'encouraged',
    icon: '📊'
  },
  {
    id: 'tax-day-us',
    name: 'Tax Day (US)',
    startDate: new Date(year, 3, 15), // April 15
    endDate: new Date(year, 3, 15, 23, 59),
    type: 'business',
    region: 'US',
    impact: 'medium',
    suggestedContent: 'Tax-related services or products, financial planning tips.',
    postingRecommendation: 'neutral',
    icon: '📑'
  },
  // Add more business events...
]

export const getBusinessEvents = (
  startDate: Date,
  endDate: Date,
  types: BusinessEventType[] = ['holiday', 'shopping', 'business']
): BusinessEvent[] => {
  const year = startDate.getFullYear()
  
  // Combine all relevant events
  const allEvents = [
    ...(types.includes('shopping') ? getShoppingEvents(year) : []),
    ...(types.includes('holiday') ? getHolidays(year) : []),
    ...(types.includes('business') ? getBusinessOperationEvents(year) : [])
  ]

  // If the date range spans multiple years, add events from next year
  if (endDate.getFullYear() > year) {
    allEvents.push(
      ...(types.includes('shopping') ? getShoppingEvents(year + 1) : []),
      ...(types.includes('holiday') ? getHolidays(year + 1) : []),
      ...(types.includes('business') ? getBusinessOperationEvents(year + 1) : [])
    )
  }

  // Filter events within the date range
  return allEvents.filter(event => 
    (event.startDate >= startDate && event.startDate <= endDate) ||
    (event.endDate >= startDate && event.endDate <= endDate) ||
    (event.startDate <= startDate && event.endDate >= endDate)
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

export const getEventRecommendations = (date: Date): BusinessEvent[] => {
  // Get events within 7 days of the given date
  const startDate = new Date(date)
  startDate.setDate(startDate.getDate() - 7)
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 7)

  return getBusinessEvents(startDate, endDate)
}