"use client"

import FanPolls from "../../components/fan-polls"
import ShareButton from "../../components/share-button"

export default function PollsClient() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">
          Active & Recent Polls
        </p>
        <ShareButton
          url="https://www.txmxboxing.com/polls"
          title="Fan Polls | TXMX Boxing"
          text="Vote on TXMX Boxing fan polls and earn TX-Credits!"
          variant="compact"
        />
      </div>
      <FanPolls />
    </div>
  )
}
