import { createIcon } from '@chakra-ui/react'

export const FarcasterIcon = createIcon({
  displayName: 'FarcasterIcon',
  viewBox: '0 0 24 24',
  defaultProps: {
    fill: '#4A148C', // Deep purple color matching the logo
  },
  path: (
    <>
      <rect width="24" height="24" rx="4" fill="currentColor" />
      <path
        d="M19 7.5L16 16.5L13 7.5H11L8 16.5L5 7.5H3L7 18.5H9L12 9.5L15 18.5H17L21 7.5H19Z"
        fill="white"
      />
    </>
  ),
})
