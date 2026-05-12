'use client'

import { useState, useCallback } from 'react'
import type { Fighter } from '../../lib/types/fighter'
import { useAdminAuth } from './admin-auth-gate'
import AddFighterForm from './add-fighter-form'
import FighterList from './fighter-list'
import TDLRImport from './tdlr-import'
import VenueList from './venue-list'
import GymList from './gym-list'
import PromoterList from './promoter-list'
import PropManager from './prop-manager'
import EventList from './event-list'
import PollManager from './poll-manager'
import EconomyGovernor from './economy-governor'
import NotificationSender from './notification-sender'
import EightCountManager from './eight-count-manager'
import FeatureFlagsManager from './feature-flags'
import QuestManager from './quest-manager'
import RewardsManager from './rewards-manager'
import SeasonManager from './season-manager'
import CommunityManager from './community-manager'
import AbuseDashboard from './abuse-dashboard'
import VerifiedManager from './verified-manager'
import LegacyRankManager from './legacy-rank-manager'
import SettlementManager from './settlement-manager'
import FightNightsManager from './fight-nights-manager'
import type { VenueData } from '../actions/venues'
import type { EventPromoter, PromoterData, TXMXEvent } from '../actions/events'
import type { GymData } from '../actions/gyms'
import { getFighters } from '../actions/fighters'
import { getVenues } from '../actions/venues'
import { getEventPromoters, getPromoters } from '../actions/events'
import { getGyms } from '../actions/gyms'

interface AdminClientProps {
  initialFighters: Fighter[]
  initialVenues: VenueData[]
  eventPromoters: EventPromoter[]
  initialPromoterDocs: PromoterData[]
  initialGyms: GymData[]
  initialEvents: TXMXEvent[]
}

type Tab = 'list' | 'add' | 'venues' | 'gyms' | 'promoters' | 'events' | 'props' | 'polls' | 'economy' | 'notifications' | 'tdlr' | 'eightcount' | 'flags' | 'quests' | 'rewards' | 'seasons' | 'community' | 'abuse' | 'verified' | 'legacy' | 'settlement' | 'fnights'

interface NavItem {
  key: Tab
  label: string
}

interface NavSubsection {
  label: string
  items: NavItem[]
}

interface NavSection {
  label: string
  /** Flat list of items (used when the section has no subgroups) */
  items?: NavItem[]
  /** Grouped subsections (used when the section nests, e.g. SCORECARD) */
  subsections?: NavSubsection[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Fight Nights',
    items: [{ key: 'fnights', label: 'Fight Nights' }],
  },
  {
    label: 'Scorecard',
    subsections: [
      {
        label: 'Database',
        items: [
          { key: 'list', label: 'Fighters' },
          { key: 'venues', label: 'Venues' },
          { key: 'gyms', label: 'Gyms' },
          { key: 'promoters', label: 'Promoters' },
          { key: 'events', label: 'Events' },
        ],
      },
      {
        label: 'Engagement',
        items: [
          { key: 'props', label: 'Props' },
          { key: 'settlement', label: 'Settlement' },
          { key: 'polls', label: 'Polls' },
          { key: 'quests', label: 'Quests' },
          { key: 'rewards', label: 'Rewards' },
          { key: 'seasons', label: 'Seasons' },
          { key: 'economy', label: 'Economy' },
        ],
      },
      {
        label: 'Content',
        items: [
          { key: 'eightcount', label: '8 Count' },
          { key: 'community', label: 'Community' },
        ],
      },
      {
        label: 'Moderation',
        items: [
          { key: 'abuse', label: 'Abuse Prevention' },
          { key: 'verified', label: 'Verified Accounts' },
          { key: 'legacy', label: 'Legacy Rank' },
        ],
      },
      {
        label: 'Tools',
        items: [{ key: 'tdlr', label: 'Import TDLR' }],
      },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'flags', label: 'Feature Flags' },
      { key: 'notifications', label: 'Push Notifications' },
    ],
  },
]

function NavLink({
  item,
  isActive,
  count,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left transition-colors duration-100 ${
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="text-[13px] leading-none truncate">
        {item.label}
      </span>
      {count > 0 && (
        <span
          className={`text-[10px] tabular-nums leading-none px-1.5 py-0.5 rounded shrink-0 ${
            isActive
              ? 'bg-white text-gray-600 border border-gray-200'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export default function AdminClient({ initialFighters, initialVenues, eventPromoters: initialEventPromoters, initialPromoterDocs, initialGyms, initialEvents }: AdminClientProps) {
  const [fighters, setFighters] = useState<Fighter[]>(initialFighters)
  const [venues, setVenues] = useState<VenueData[]>(initialVenues)
  const [promoters, setPromoters] = useState<EventPromoter[]>(initialEventPromoters)
  const [promoterDocs, setPromoterDocs] = useState<PromoterData[]>(initialPromoterDocs)
  const [gymDocs, setGymDocs] = useState<GymData[]>(initialGyms)
  const [eventDocs, setEventDocs] = useState<TXMXEvent[]>(initialEvents)
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut: handleSignOut } = useAdminAuth()

  const handleFighterAdded = (fighter: Fighter) => {
    setFighters(prev => [...prev, fighter].sort((a, b) => a.lastName.localeCompare(b.lastName)))
    setActiveTab('list')
  }

  const handleFighterDeleted = (id: string) => {
    setFighters(prev => prev.filter(f => f.id !== id))
  }

  const handleFighterUpdated = (updated: Fighter) => {
    setFighters(prev =>
      prev.map(f => (f.id === updated.id ? updated : f)).sort((a, b) => a.lastName.localeCompare(b.lastName))
    )
  }

  const handleImportComplete = useCallback(async () => {
    const [newFighters, newVenues, newPromoters, newPromoterDocs, newGyms] = await Promise.all([
      getFighters(),
      getVenues(),
      getEventPromoters(),
      getPromoters(),
      getGyms(),
    ])
    setFighters(newFighters)
    setVenues(newVenues)
    setPromoters(newPromoters)
    setPromoterDocs(newPromoterDocs)
    setGymDocs(newGyms)
  }, [])

  const handleVenueUpdated = (updated: VenueData) => {
    setVenues(prev => prev.map(v => v.id === updated.id ? updated : v))
  }

  const handleVenueDeleted = (id: string) => {
    setVenues(prev => prev.filter(v => v.id !== id))
  }

  const handlePromoterDocUpdated = (updated: PromoterData) => {
    setPromoterDocs(prev => {
      const exists = prev.find(p => p.id === updated.id)
      if (exists) return prev.map(p => p.id === updated.id ? updated : p)
      return [...prev, updated]
    })
  }

  const handlePromoterDocDeleted = (id: string) => {
    setPromoterDocs(prev => prev.filter(p => p.id !== id))
  }

  const handleGymAdded = (gym: GymData) => {
    setGymDocs(prev => [...prev, gym].sort((a, b) => a.name.localeCompare(b.name)))
  }

  const handleGymUpdated = (updated: GymData) => {
    setGymDocs(prev => prev.map(g => g.id === updated.id ? updated : g))
  }

  const handleGymDeleted = (id: string) => {
    setGymDocs(prev => prev.filter(g => g.id !== id))
  }

  const handleEventAdded = (event: TXMXEvent) => {
    setEventDocs(prev => [event, ...prev])
  }

  const handleEventUpdated = (updated: TXMXEvent) => {
    setEventDocs(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  const handleEventDeleted = (id: string) => {
    setEventDocs(prev => prev.filter(e => e.id !== id))
  }

  const counts: Record<Tab, number> = {
    list: fighters.length,
    venues: venues.length,
    gyms: gymDocs.length,
    promoters: new Set([
      ...fighters.map(f => f.promoter).filter(Boolean),
      ...promoters.map(p => p.name),
    ]).size,
    events: eventDocs.length,
    props: 0,
    settlement: 0,
    fnights: 0,
    polls: 0,
    economy: 0,
    notifications: 0,
    add: 0,
    tdlr: 0,
    eightcount: 0,
    flags: 0,
    quests: 0,
    rewards: 0,
    seasons: 0,
    community: 0,
    abuse: 0,
    verified: 0,
    legacy: 0,
  }

  const pageTitle: Record<Tab, string> = {
    list: 'Fighters',
    venues: 'Venues',
    gyms: 'Gyms',
    promoters: 'Promoters',
    events: 'Events',
    eightcount: 'The 8 Count',
    props: 'Prop Picks',
    settlement: 'Match Settlement',
    fnights: 'Fight Nights',
    polls: 'Fan Polls',
    economy: 'Economy Governor',
    notifications: 'Push Notifications',
    add: 'Add Fighter',
    tdlr: 'Import TDLR',
    flags: 'Feature Flags',
    quests: 'Quests & Badges',
    rewards: 'Rewards Store',
    seasons: 'Seasons',
    community: 'Community',
    abuse: 'Abuse Prevention',
    verified: 'Verified Accounts',
    legacy: 'Legacy Rank',
  }

  const handleNav = (key: Tab) => {
    setActiveTab(key)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-white pt-16 admin-selection-fix">
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <span className="text-gray-900 text-sm font-semibold tracking-tight">{pageTitle[activeTab]}</span>
        <div className="w-5" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar — fixed, never scrolls with content */}
        <aside
          className={`fixed top-16 z-30 h-[calc(100vh-4rem)] w-56 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="px-4 pt-6 pb-3">
            <h1 className="text-[11px] font-semibold text-gray-400 tracking-[0.25em] leading-none">
              ADMIN PORTAL
            </h1>
          </div>

          <nav className="px-3 pb-8 flex flex-col h-[calc(100%-3.5rem)]">
            <div className="flex-1 space-y-6">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="px-2 mb-2 text-[11px] font-semibold text-gray-500 tracking-tight leading-none">
                    {section.label}
                  </p>

                  {/* Flat section */}
                  {section.items && (
                    <div className="space-y-0.5">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.key}
                          item={item}
                          isActive={activeTab === item.key}
                          count={counts[item.key]}
                          onClick={() => handleNav(item.key)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Nested subsections (e.g. SCORECARD) */}
                  {section.subsections && (
                    <div className="space-y-4 mt-1">
                      {section.subsections.map((sub) => (
                        <div key={sub.label}>
                          <p className="px-2 mb-1 text-[10px] font-medium text-gray-400 tracking-tight leading-none uppercase">
                            {sub.label}
                          </p>
                          <div className="space-y-0.5">
                            {sub.items.map((item) => (
                              <NavLink
                                key={item.key}
                                item={item}
                                isActive={activeTab === item.key}
                                count={counts[item.key]}
                                onClick={() => handleNav(item.key)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              {user && (
                <p className="px-2 mb-2 text-[11px] text-gray-400 tracking-tight truncate" title={user.email || ''}>
                  {user.email}
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="text-[13px] leading-none">Sign out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content — offset by sidebar width on desktop */}
        <main className="flex-1 min-w-0 lg:ml-56 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8 pb-16">
            {/* Page header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">
                {pageTitle[activeTab]}
              </h2>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setActiveTab('add')}
                  className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium px-4 py-2 rounded-md transition-colors"
                >
                  <span className="text-base leading-none">+</span>
                  Add Fighter
                </button>
                <FighterList fighters={fighters} onDelete={handleFighterDeleted} onUpdate={handleFighterUpdated} gymNames={gymDocs.map(g => g.name).sort()} gymDocs={gymDocs} />
              </div>
            ) : activeTab === 'add' ? (
              <AddFighterForm onSuccess={handleFighterAdded} existingGyms={gymDocs.map(g => g.name).sort()} />
            ) : activeTab === 'venues' ? (
              <VenueList venues={venues} onUpdate={handleVenueUpdated} onDelete={handleVenueDeleted} />
            ) : activeTab === 'gyms' ? (
              <GymList fighters={fighters} gymDocs={gymDocs} onAdd={handleGymAdded} onUpdate={handleGymUpdated} onDelete={handleGymDeleted} />
            ) : activeTab === 'promoters' ? (
              <PromoterList fighters={fighters} eventPromoters={promoters} promoterDocs={promoterDocs} onUpdate={handlePromoterDocUpdated} onDelete={handlePromoterDocDeleted} />
            ) : activeTab === 'events' ? (
              <EventList events={eventDocs} fighters={fighters} onAdd={handleEventAdded} onUpdate={handleEventUpdated} onDelete={handleEventDeleted} />
            ) : activeTab === 'props' ? (
              <PropManager events={initialEvents} />
            ) : activeTab === 'settlement' ? (
              <SettlementManager events={initialEvents} />
            ) : activeTab === 'fnights' ? (
              <FightNightsManager />
            ) : activeTab === 'eightcount' ? (
              <EightCountManager />
            ) : activeTab === 'polls' ? (
              <PollManager />
            ) : activeTab === 'economy' ? (
              <EconomyGovernor />
            ) : activeTab === 'notifications' ? (
              <NotificationSender />
            ) : activeTab === 'flags' ? (
              <FeatureFlagsManager />
            ) : activeTab === 'quests' ? (
              <QuestManager />
            ) : activeTab === 'rewards' ? (
              <RewardsManager />
            ) : activeTab === 'seasons' ? (
              <SeasonManager />
            ) : activeTab === 'community' ? (
              <CommunityManager />
            ) : activeTab === 'abuse' ? (
              <AbuseDashboard />
            ) : activeTab === 'verified' ? (
              <VerifiedManager />
            ) : activeTab === 'legacy' ? (
              <LegacyRankManager />
            ) : (
              <TDLRImport onImportComplete={handleImportComplete} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
