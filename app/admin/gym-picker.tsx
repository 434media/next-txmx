'use client'

import { useState } from 'react'
import type { GymData } from '../actions/gyms'
import { quickAddGym } from '../actions/gyms'
import Combobox, { type ComboboxOption } from './combobox'

/**
 * Gym selection for the fight card, on the shared Combobox. Picking an existing
 * gym sets its name; a name that isn't in the DB gets an inline "add to gyms",
 * which creates it so fighters, gyms, and fight cards share the same names.
 */
export default function GymPicker({
  gyms,
  value,
  onChange,
  onGymsChanged,
  placeholder = 'Select a gym',
}: {
  gyms: GymData[]
  value: string
  onChange: (name: string) => void
  onGymsChanged: () => void
  placeholder?: string
}) {
  const [creating, setCreating] = useState(false)

  const options: ComboboxOption[] = gyms.map((g) => ({
    value: g.id,
    label: g.name,
    hint: [g.city, g.state].filter(Boolean).join(', '),
  }))

  function handleSelect(id: string) {
    const g = gyms.find((x) => x.id === id)
    if (g) onChange(g.name)
  }

  async function handleCreate(name: string, close: () => void) {
    setCreating(true)
    try {
      await quickAddGym(name)
      onChange(name)
      onGymsChanged()
      close()
    } finally {
      setCreating(false)
    }
  }

  return (
    <Combobox
      value={value}
      options={options}
      onSelect={handleSelect}
      placeholder={placeholder}
      searchPlaceholder="Search gyms…"
      ariaLabel="Gym"
      createSlot={(query, close) => (
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">
            Not in the gyms database — add{' '}
            <span className="font-semibold text-gray-700">{query}</span>:
          </p>
          <button
            type="button"
            disabled={creating}
            onClick={() => handleCreate(query, close)}
            className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {creating ? '…' : 'Add to gyms'}
          </button>
        </div>
      )}
    />
  )
}
