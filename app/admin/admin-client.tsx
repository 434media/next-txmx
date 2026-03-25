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

type Tab = 'list' | 'add' | 'venues' | 'gyms' | 'promoters' | 'events' | 'props' | 'polls' | 'economy' | 'notifications' | 'tdlr' | 'eightcount'

const NAV_SECTIONS = [
  {
    label: 'DATABASE',
    items: [
      { key: 'list' as Tab, label: 'Fighters', icon: '🥊' },
      { key: 'venues' as Tab, label: 'Venues', icon: '🏟️' },
      { key: 'gyms' as Tab, label: 'Gyms', icon: '🏋️' },
      { key: 'promoters' as Tab, label: 'Promoters', icon: '🎤' },
      { key: 'events' as Tab, label: 'Events', icon: '📅' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { key: 'eightcount' as Tab, label: '8 Count', icon: '📰' },
    ],
  },
  {
    label: 'ACTIONS',
    items: [
      { key: 'add' as Tab, label: 'Add Fighter', icon: '+' },
      { key: 'props' as Tab, label: 'Props', icon: '🎯' },
      { key: 'polls' as Tab, label: 'Polls', icon: '📊' },
      { key: 'economy' as Tab, label: 'Economy', icon: '⚙️' },
      { key: 'notifications' as Tab, label: 'Notify', icon: '🔔' },
      { key: 'tdlr' as Tab, label: 'Import TDLR', icon: '📄' },
    ],
  },
]

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
    polls: 0,
    economy: 0,
    notifications: 0,
    add: 0,
    tdlr: 0,
    eightcount: 0,
  }

  const pageTitle: Record<Tab, string> = {
    list: 'FIGHTERS',
    venues: 'VENUES',
    gyms: 'GYMS',
    promoters: 'PROMOTERS',
    events: 'EVENTS',
    eightcount: 'THE 8 COUNT',
    props: 'PROP PICKS',
    polls: 'FAN POLLS',
    economy: 'ECONOMY GOVERNOR',
    notifications: 'PUSH NOTIFICATIONS',
    add: 'ADD FIGHTER',
    tdlr: 'IMPORT TDLR',
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
        <span className="text-gray-800 text-xs font-semibold tracking-[0.2em]">{pageTitle[activeTab]}</span>
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

          <nav className="px-2 pb-8 flex flex-col h-[calc(100%-3.5rem)]">
            <div className="flex-1">
            {NAV_SECTIONS.map(section => (
              <div key={section.label} className="mb-5">
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-300 tracking-[0.2em] leading-relaxed">
                  {section.label}
                </p>
                {section.items.map(item => {
                  const isActive = activeTab === item.key
                  const count = counts[item.key]
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNav(item.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors duration-150 group ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <span className="text-sm leading-none w-5 text-center shrink-0">{item.icon}</span>
                      <span className="text-[13px] font-medium tracking-wide leading-none flex-1">
                        {item.label}
                      </span>
                      {count > 0 && (
                        <span className={`text-[10px] font-semibold tabular-nums leading-none px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-amber-100 text-[#FFB800]'
                            : 'bg-gray-100 text-gray-400 group-hover:text-gray-400'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 pt-4">
              {user && (
                <p className="px-3 mb-2 text-[10px] text-gray-300 tracking-wide truncate" title={user.email || ''}>
                  {user.email}
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="text-[13px] font-medium tracking-wide leading-none">
                  Sign Out
                </span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content — offset by sidebar width on desktop */}
        <main className="flex-1 min-w-0 lg:ml-56 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8 pb-16">
            {/* Page header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-[0.15em] leading-tight">
                {pageTitle[activeTab]}
              </h2>
              <div className="mt-1.5 h-px w-10 bg-[#FFB800]/60" />
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
              <FighterList fighters={fighters} onDelete={handleFighterDeleted} onUpdate={handleFighterUpdated} gymNames={gymDocs.map(g => g.name).sort()} />
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
            ) : activeTab === 'eightcount' ? (
              <EightCountManager />
            ) : activeTab === 'polls' ? (
              <PollManager />
            ) : activeTab === 'economy' ? (
              <EconomyGovernor />
            ) : activeTab === 'notifications' ? (
              <NotificationSender />
            ) : (
              <TDLRImport onImportComplete={handleImportComplete} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
