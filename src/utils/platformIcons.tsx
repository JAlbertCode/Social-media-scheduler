import { FaTwitter, FaLinkedin, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { SiBluesky } from 'react-icons/si'
import { FarcasterIcon } from '../components/icons/FarcasterIcon'
import { PlatformType } from '../types/platforms'

export const PLATFORM_ICONS: Record<PlatformType, React.ElementType> = {
  Twitter: FaTwitter,
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  YouTube: FaYoutube,
  Bluesky: SiBluesky,
  Threads: FaTwitter, // Using Twitter icon as placeholder for Threads
  Warpcast: FarcasterIcon,
}