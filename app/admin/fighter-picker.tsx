'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'
import { quickAddFighter } from '../actions/fighters'
import Combobox, { type ComboboxOption } from './combobox'

export const fighterDisplayName = (f: Fighter) =>
  [f.firstName, f.lastName].filter(Boolean).join(' ').trim()

const createBtn =
  'px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50'

/**
 * Fighter selection for the fight card, on the shared Combobox. Picking an
 * existing fighter pulls their name + gym + weight class into the bout; a name
 * that isn't in the DB gets an inline Male/Female add (a stub fighter), keeping
 * the card and the database aligned.
 */
export default function FighterPicker({
  fighters,
  value,
  onPick,
  defaultGym,
  defaultWeightClass,
  onFightersChanged,
  placeholder = 'Select a fighter',
}: {
  fighters: Fighter[]
  value: string
  onPick: (info: { name: string; gym: string; weightClass: string }) => void
  defaultGym?: string
  defaultWeightClass?: string
  onFightersChanged: () => void
  placeholder?: string
}) {
  const [creating, setCreating] = useState(false)

  const options: ComboboxOption[] = fighters.map((f) => ({
    value: f.id || '',
    label: fighterDisplayName(f) + (f.nickname ? ` "${f.nickname}"` : ''),
    hint: [f.gym, f.weightClass].filter(Boolean).join(' · '),
  }))

  function handleSelect(id: string) {
    const f = fighters.find((x) => x.id === id)
    if (!f) return
    onPick({
      name: fighterDisplayName(f),
      gym: f.gym || '',
      weightClass: f.weightClass || '',
    })
  }

  async function handleCreate(sex: 'male' | 'female', name: string, close: () => void) {
    const parts = name.split(/\s+/)
    setCreating(true)
    try {
      await quickAddFighter({
        firstName: parts[0] || name,
        lastName: parts.slice(1).join(' '),
        sex,
        gym: defaultGym,
        weightClass: defaultWeightClass,
      })
      onPick({ name, gym: defaultGym || '', weightClass: defaultWeightClass || '' })
      onFightersChanged()
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
      searchPlaceholder="Search fighters…"
      ariaLabel="Fighter"
      createSlot={(query, close) => (
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">
            Not in the database — add{' '}
            <span className="font-semibold text-gray-700">{query}</span>:
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={creating}
              onClick={() => handleCreate('male', query, close)}
              className={createBtn}
            >
              {creating ? '…' : 'Add as Male'}
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={() => handleCreate('female', query, close)}
              className={createBtn}
            >
              Add as Female
            </button>
          </div>
        </div>
      )}
    />
  )
}
