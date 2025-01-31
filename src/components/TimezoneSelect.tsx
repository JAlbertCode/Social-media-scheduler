'use client'

import React from 'react'
import { getGroupedTimezones } from '../utils/timezone'

interface TimezoneSelectProps {
  value: string
  onChange: (timezone: string) => void
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  const groupedTimezones = getGroupedTimezones()

  if (!value) {
    return null;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    >
      {Object.entries(groupedTimezones).map(([region, timezones]) => (
        <optgroup key={region} label={region}>
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone.replace('_', ' ')}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}