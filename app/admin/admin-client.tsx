'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'
import AddFighterForm from './add-fighter-form'
import FighterList from './fighter-list'
import TDLRImport from './tdlr-import'
import VenueList from './venue-list'
import GymList from './gym-list'
import PromoterList from './promoter-list'
import type { VenueData } from '../actions/venues'
import type { EventPromoter } from '../actions/events'

interface AdminClientProps {
  initialFighters: Fighter[]
  initialVenues: VenueData[]
  eventPromoters: EventPromoter[]
}

type Tab = 'list' | 'add' | 'venues' | 'gyms' | 'promoters' | 'tdlr'

const NAV_SECTIONS = [
  {
    label: 'DATABASE',
    items: [
      { key: 'list' as Tab, label: 'Fighters', icon: '🥊' },
      { key: 'venues' as Tab, label: 'Venues', icon: '🏟️' },
      { key: 'gyms' as Tab, label: 'Gyms', icon: '🏋️' },
      { key: 'promoters' as Tab, label: 'Promoters', icon: '🎤' },
    ],
  },
  {
    label: 'ACTIONS',
    items: [
      { key: 'add' as Tab, label: 'Add Fighter', icon: '+' },
      { key: 'tdlr' as Tab, label: 'Import TDLR', icon: '📄' },
    ],
  },
]

export default function AdminClient({ initialFighters, initialVenues, eventPromoters }: AdminClientProps) {
  const [fighters, setFighters] = useState<Fighter[]>(initialFighters)
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const counts: Record<Tab, number> = {
    list: fighters.length,
    venues: initialVenues.length,
    gyms: new Set(fighters.map(f => f.gym).filter(Boolean)).size,
    promoters: new Set([
      ...fighters.map(f => f.promoter).filter(Boolean),
      ...eventPromoters.map(p => p.name),
    ]).size,
    add: 0,
    tdlr: 0,
  }

  const pageTitle: Record<Tab, string> = {
    list: 'FIGHTERS',
    venues: 'VENUES',
    gyms: 'GYMS',
    promoters: 'PROMOTERS',
    add: 'ADD FIGHTER',
    tdlr: 'IMPORT TDLR',
  }

  const handleNav = (key: Tab) => {
    setActiveTab(key)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-black/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <span className="text-white/90 text-xs font-semibold tracking-[0.2em]">{pageTitle[activeTab]}</span>
        <div className="w-5" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-56 bg-black border-r border-white/6 shrink-0 overflow-y-auto transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="px-4 pt-6 pb-3">
            <h1 className="text-[11px] font-semibold text-white/30 tracking-[0.25em] leading-none">
              ADMIN PORTAL
            </h1>
          </div>

          <nav className="px-2 pb-8">
            {NAV_SECTIONS.map(section => (
              <div key={section.label} className="mb-5">
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-white/25 tracking-[0.2em] leading-relaxed">
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
                          ? 'bg-white/8 text-white'
                          : 'text-white/50 hover:bg-white/4 hover:text-white/80'
                      }`}
                    >
                      <span className="text-sm leading-none w-5 text-center shrink-0">{item.icon}</span>
                      <span className="text-[13px] font-medium tracking-wide leading-none flex-1">
                        {item.label}
                      </span>
                      {count > 0 && (
                        <span className={`text-[10px] font-semibold tabular-nums leading-none px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-[#FFB800]/20 text-[#FFB800]'
                            : 'bg-white/6 text-white/30 group-hover:text-white/50'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:ml-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8 pb-16">
            {/* Page header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-[0.15em] leading-tight">
                {pageTitle[activeTab]}
              </h2>
              <div className="mt-1.5 h-px w-10 bg-[#FFB800]/60" />
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
              <FighterList fighters={fighters} onDelete={handleFighterDeleted} onUpdate={handleFighterUpdated} />
            ) : activeTab === 'add' ? (
              <AddFighterForm onSuccess={handleFighterAdded} />
            ) : activeTab === 'venues' ? (
              <VenueList venues={initialVenues} />
            ) : activeTab === 'gyms' ? (
              <GymList fighters={fighters} />
            ) : activeTab === 'promoters' ? (
              <PromoterList fighters={fighters} eventPromoters={eventPromoters} />
            ) : (
              <TDLRImport />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
