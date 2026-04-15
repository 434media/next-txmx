export interface FighterRecord {
  wins: number
  losses: number
  draws: number
  knockouts: number
}

export interface FighterMeasurement {
  imperial: string // "5'4"" or "67""
  metric: number   // cm
}

export interface FighterLocation {
  city: string
  state: string
  country: string
}

export interface FighterTitle {
  org: string        // WBC, WBO, WBA, IBF
  title: string      // "World Super Flyweight"
  current: boolean
}

export interface FighterSocial {
  instagram?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  website?: string
}

export interface FightRecord {
  id?: string
  date: string
  opponent: string
  opponentId?: string
  result: 'W' | 'L' | 'D' | 'NC'
  method: 'KO' | 'TKO' | 'UD' | 'SD' | 'MD' | 'RTD' | 'DQ' | 'NC' | ''
  round?: number
  scheduledRounds?: number
  weightClass: string
  venue?: string
  location?: string
  titleFight?: boolean
}

export interface Fighter {
  id?: string

  // Identity
  firstName: string
  lastName: string
  birthName?: string
  nickname?: string
  slug: string

  // Physical
  sex: 'male' | 'female'
  dateOfBirth?: string
  height?: FighterMeasurement
  reach?: FighterMeasurement
  stance?: 'orthodox' | 'southpaw' | 'switch'

  // Location
  birthPlace?: FighterLocation
  residence?: FighterLocation
  region: 'TX' | 'MX' | 'OTHER'

  // Record
  weightClass: string
  status: 'active' | 'inactive' | 'retired'
  record: FighterRecord
  bouts?: number
  rounds?: number
  koPercentage?: number
  careerStart?: string
  careerEnd?: string
  debutDate?: string

  // Titles
  titles?: FighterTitle[]

  // Team
  gym?: string
  gymId?: string
  trainer?: string
  manager?: string
  promoter?: string

  // Media
  profileImageUrl?: string
  actionPhotos?: string[]
  highlightVideoUrl?: string

  // Social
  social?: FighterSocial

  // TXMX
  bio?: string
  featuredOnTXMX?: boolean
  txmxEvents?: string[]

  // Meta
  createdAt?: string
  updatedAt?: string
}

export const WEIGHT_CLASSES = [
  'Minimumweight',
  'Light Flyweight',
  'Flyweight',
  'Super Flyweight',
  'Bantamweight',
  'Super Bantamweight',
  'Featherweight',
  'Super Featherweight',
  'Lightweight',
  'Super Lightweight',
  'Welterweight',
  'Super Welterweight',
  'Middleweight',
  'Super Middleweight',
  'Light Heavyweight',
  'Cruiserweight',
  'Bridgerweight',
  'Heavyweight',
] as const

export const TITLE_ORGS = ['WBC', 'WBO', 'WBA', 'IBF', 'WBC Interim', 'WBO Interim', 'WBA Regular', 'NABF', 'NABO', 'WBC Silver', 'WBO International'] as const
