/**
 * TDLR (Texas Dept of Licensing and Regulation) shared types.
 *
 * The actual parsing is handled by the Python serverless function
 * at api/tdlr-parse.py using pdfplumber on Vercel's Python runtime.
 */

export interface TDLREvent {
  date: string
  eventNumber: string
  city: string
  promoter: string
  venue: string
  address: string
  bouts: TDLRBout[]
}

export interface TDLRFighter {
  name: string
  city: string
  state: string
  boxerId: string
  weight: number
}

export interface TDLRBout {
  boutNumber: number
  referee: string
  fighter1: TDLRFighter
  fighter2: TDLRFighter
  rounds: number
  result: string
  method: string
  scores: string[]
  weightClass: string | null
  titleFight: string | null
}
