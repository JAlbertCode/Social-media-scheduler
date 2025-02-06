import { FaTwitter, FaLinkedin, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { RiWechat2Fill } from 'react-icons/ri'
import { SiBluesky } from 'react-icons/si'
import { PlatformType } from '../types/platforms'

export const PLATFORM_ICONS: Record<PlatformType, React.ElementType> = {
  Twitter: FaTwitter,
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
  TikTok: FaTiktok,
  YouTube: FaYoutube,
  Bluesky: SiBluesky,
  Threads: FaTwitter, // Using Twitter icon as placeholder for Threads
  Warpcast: RiWechat2Fill,
}