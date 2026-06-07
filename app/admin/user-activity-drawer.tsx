"use client"

import { useCallback, useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { X, RefreshCw } from "lucide-react"
import { db } from "../../lib/firebase-client"
import { getBouts, type FightNightBout } from "../actions/fightnight"
import {
  getUserPicks,
  type FightNightPick,
} from "../actions/fightnight-picks"
import {
  removeFightNightParticipant,
  type FightNightStanding,
} from "../actions/fightnight-standings"
import {
  getPolls,
  getUserVotesForFightNight,
  type FightNightPoll,
  type FightNightPollVote,
} from "../actions/fightnight-polls"
import {
  getProps,
  getUserPropPicks,
  type FightNightProp,
  type FightNightPropPick,
} from "../actions/fightnight-props"

interface UserActivityDrawerProps {
  fightNightId: string
  userId: string
  onClose: () => void
}

/**
 * Slide-in drawer that surfaces one user's complete per-event activity:
 * standing, every bout pick (made or skipped), every poll vote, every
 * prop pick. Opens from clicking a row in the Standings panel. Closes via
 * backdrop click, X button, or Escape.
 *
 * Standing is a live `onSnapshot` subscription so points update in real
 * time while the drawer is open. The bulkier collections (picks, polls,
 * props) are one-shot fetches with a manual Refresh button — they update
 * at settlement points which are infrequent enough that polling-on-demand
 * is the right cost trade-off.
 */
export default function UserActivityDrawer({
  fightNightId,
  userId,
  onClose,
}: UserActivityDrawerProps) {
  const [standing, setStanding] = useState<FightNightStanding | null>(null)
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [picks, setPicks] = useState<FightNightPick[]>([])
  const [polls, setPolls] = useState<FightNightPoll[]>([])
  const [pollVotes, setPollVotes] = useState<FightNightPollVote[]>([])
  const [props, setProps] = useState<FightNightProp[]>([])
  const [propPicks, setPropPicks] = useState<FightNightPropPick[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeResult, setRemoveResult] = useState<string | null>(null)

  // Lock background scroll while open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Live standing
  useEffect(() => {
    const ref = doc(db, "fightNights", fightNightId, "standings", userId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setStanding(snap.exists() ? (snap.data() as FightNightStanding) : null)
      },
      () => setStanding(null)
    )
    return () => unsub()
  }, [fightNightId, userId])

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const [boutsData, picksData, pollsData, votesData, propsData, propPicksData] =
        await Promise.all([
          getBouts(fightNightId),
          getUserPicks(fightNightId, userId),
          getPolls(fightNightId, "all"),
          getUserVotesForFightNight(fightNightId, userId),
          getProps(fightNightId),
          getUserPropPicks(fightNightId, userId),
        ])
      setBouts(boutsData)
      setPicks(picksData)
      setPolls(pollsData)
      setPollVotes(votesData)
      setProps(propsData)
      setPropPicks(propPicksData)
      setLoading(false)
    } finally {
      setRefreshing(false)
    }
  }, [fightNightId, userId])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemove() {
    const name = standing?.displayName || "Anonymous"
    if (
      !confirm(
        `Remove ${name} from this fight night? This deletes their standing, every pick they made, every poll vote, and every prop pick. Their TXMX account is NOT deleted — they can rejoin a future event.`
      )
    )
      return
    setRemoving(true)
    setRemoveResult(null)
    try {
      const res = await removeFightNightParticipant(fightNightId, userId)
      if (!res.success) {
        setRemoveResult(res.error || "Failed to remove")
        setRemoving(false)
        return
      }
      // Success — close the drawer; the live Participants subscription
      // will drop this user from the list automatically.
      onClose()
    } catch (e) {
      setRemoveResult(e instanceof Error ? e.message : "Failed to remove")
      setRemoving(false)
    }
  }

  const picksByBout = new Map(picks.map((p) => [p.boutNumber, p]))
  const votesByPoll = new Map(pollVotes.map((v) => [v.pollId, v]))
  const propPicksByProp = new Map(propPicks.map((p) => [p.propId, p]))
  const settledPicks = picks.filter((p) => p.settled).length
  const wonPicks = picks.filter((p) => p.won === true).length

  return (
    <div role="dialog" aria-label="Player activity" className="fixed inset-0 z-50">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 cursor-default"
      />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase mb-1">
                Player
              </p>
              <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
                {standing?.displayName || "Anonymous"}
              </h2>
              <p className="text-[12px] text-gray-500 truncate mt-0.5">
                {standing?.email || "—"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={load}
                disabled={refreshing}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium">
              Joined {formatJoinedAt(standing?.joinedAt)}
            </span>
            <span className="text-[10px] text-gray-300 font-mono truncate">
              {userId}
            </span>
          </div>
        </div>

        {/* Standing summary */}
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase mb-2">
            Standing
          </p>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label="Points"
                value={(standing?.points || 0).toLocaleString()}
              />
              <Stat label="Made" value={(standing?.picksMade || 0).toString()} />
              <Stat label="Won" value={(standing?.picksWon || 0).toString()} />
            </div>
          )}
        </div>

        {/* Bout picks */}
        <Section
          title="Bout Picks"
          count={`${picks.length} of ${bouts.length}`}
          hint={`${settledPicks} settled · ${wonPicks} won`}
        >
          {bouts.length === 0 ? (
            <Empty>No bouts on this card yet.</Empty>
          ) : (
            <div className="space-y-2">
              {bouts.map((bout) => {
                const pick = picksByBout.get(bout.boutNumber)
                return (
                  <BoutPickRow key={bout.boutNumber} bout={bout} pick={pick} />
                )
              })}
            </div>
          )}
        </Section>

        {/* Poll votes */}
        {polls.length > 0 && (
          <Section
            title="Poll Votes"
            count={`${pollVotes.length} of ${polls.length}`}
          >
            <div className="space-y-2">
              {polls.map((poll) => {
                const vote = votesByPoll.get(poll.id)
                return <PollVoteRow key={poll.id} poll={poll} vote={vote} />
              })}
            </div>
          </Section>
        )}

        {/* Prop picks */}
        {props.length > 0 && (
          <Section
            title="Prop Picks"
            count={`${propPicks.length} of ${props.length}`}
          >
            <div className="space-y-2">
              {props.map((prop) => {
                const pick = propPicksByProp.get(prop.id)
                return <PropPickRow key={prop.id} prop={prop} pick={pick} />
              })}
            </div>
          </Section>
        )}

        {/* Destructive footer — remove this user from the event. Confined
            to the drawer so admin has full context before deleting. */}
        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/40">
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase mb-2">
            Danger Zone
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            Removing a participant deletes their standing, picks, poll votes,
            and prop picks for this fight night. Their global account remains
            so they can rejoin future events.
          </p>
          {removeResult && (
            <p className="text-[11px] text-red-700 font-medium mb-2">
              {removeResult}
            </p>
          )}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="px-3 py-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-700 text-[11px] font-bold tracking-wider uppercase rounded-md transition-colors disabled:opacity-50"
          >
            {removing ? "Removing…" : "Remove participant"}
          </button>
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}

// ── Section + row helpers ──────────────────────────────────

function Section({
  title,
  count,
  hint,
  children,
}: {
  title: string
  count?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-200 px-5 py-4">
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase">
          {title}
        </p>
        <div className="flex items-baseline gap-2 shrink-0">
          {count && (
            <p className="text-[11px] text-gray-500 font-medium tabular-nums">
              {count}
            </p>
          )}
          {hint && (
            <p className="text-[10px] text-gray-400 font-medium">{hint}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 text-[12px] py-3">{children}</p>
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-md px-2.5 py-2">
      <p className="text-base font-bold text-gray-900 tabular-nums leading-none">
        {value}
      </p>
      <p className="text-[9px] text-gray-500 font-bold tracking-wider uppercase mt-1">
        {label}
      </p>
    </div>
  )
}

function BoutPickRow({
  bout,
  pick,
}: {
  bout: FightNightBout
  pick: FightNightPick | undefined
}) {
  const isSettled = bout.status === "completed"
  const won = pick?.won === true
  const lost = isSettled && pick && pick.won !== true

  return (
    <div className="border border-gray-200 rounded-md px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[12px] font-bold text-gray-900 truncate">
          <span className="text-gray-400 mr-1">#{bout.boutNumber}</span>
          {bout.fighter1Name || "TBA"}
          <span className="text-gray-300 mx-1.5">vs</span>
          {bout.fighter2Name || "TBA"}
        </p>
        <BoutStatusChip status={bout.status} />
      </div>
      {pick ? (
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <p className="text-gray-700">
            <span className="text-gray-400">Pick:</span>{" "}
            <span className="font-bold">{pick.pickedFighterName}</span>
          </p>
          {won && (
            <p className="text-green-700 font-bold tracking-wider uppercase text-[9px]">
              ✓ Won · +{pick.pointsAwarded} pts
            </p>
          )}
          {lost && (
            <p className="text-gray-400 font-medium tracking-wider uppercase text-[9px]">
              Lost
            </p>
          )}
          {!isSettled && (
            <p className="text-gray-500 font-medium tracking-wider uppercase text-[9px]">
              Pending
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">No pick made</p>
      )}
    </div>
  )
}

function PollVoteRow({
  poll,
  vote,
}: {
  poll: FightNightPoll
  vote: FightNightPollVote | undefined
}) {
  const chosenLabel =
    vote !== undefined ? poll.options[vote.optionIndex]?.label : null

  return (
    <div className="border border-gray-200 rounded-md px-3 py-2">
      <p className="text-[12px] font-bold text-gray-900 leading-snug mb-1">
        {poll.question}
      </p>
      {chosenLabel ? (
        <p className="text-[11px] text-gray-700">
          <span className="text-gray-400">Voted:</span>{" "}
          <span className="font-bold">{chosenLabel}</span>
        </p>
      ) : (
        <p className="text-[11px] text-gray-400 italic">Did not vote</p>
      )}
    </div>
  )
}

function PropPickRow({
  prop,
  pick,
}: {
  prop: FightNightProp
  pick: FightNightPropPick | undefined
}) {
  const chosen =
    pick !== undefined ? prop.options.find((o) => o.id === pick.optionId) : null
  const settled = prop.status === "settled" && pick?.settled
  const won = settled && pick?.won === true
  const lost = settled && pick && pick.won !== true

  return (
    <div className="border border-gray-200 rounded-md px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[12px] font-bold text-gray-900 leading-snug truncate">
          {prop.title}
        </p>
        {prop.boutNumber && (
          <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase shrink-0">
            Bout {prop.boutNumber}
          </span>
        )}
      </div>
      {chosen ? (
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <p className="text-gray-700 truncate">
            <span className="text-gray-400">Pick:</span>{" "}
            <span className="font-bold">{chosen.label}</span>
          </p>
          {won && (
            <p className="text-green-700 font-bold tracking-wider uppercase text-[9px] shrink-0">
              ✓ +{pick?.pointsAwarded} pts
            </p>
          )}
          {lost && (
            <p className="text-gray-400 font-medium tracking-wider uppercase text-[9px] shrink-0">
              Lost
            </p>
          )}
          {!settled && (
            <p className="text-gray-500 font-medium tracking-wider uppercase text-[9px] shrink-0">
              Pending
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">Did not pick</p>
      )}
    </div>
  )
}

function BoutStatusChip({
  status,
}: {
  status: "scheduled" | "live" | "completed"
}) {
  if (status === "live") {
    return (
      <span className="text-red-700 text-[9px] font-bold tracking-wider uppercase shrink-0">
        Live
      </span>
    )
  }
  if (status === "completed") {
    return (
      <span className="text-green-700 text-[9px] font-bold tracking-wider uppercase shrink-0">
        Settled
      </span>
    )
  }
  return (
    <span className="text-gray-400 text-[9px] font-bold tracking-wider uppercase shrink-0">
      Scheduled
    </span>
  )
}

function formatJoinedAt(iso: string | undefined): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
