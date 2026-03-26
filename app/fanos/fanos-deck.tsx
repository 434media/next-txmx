"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView, useMotionValue, useTransform } from "motion/react"
import Image from "next/image"
import DeckNav, { useDeckNavigation } from "./deck-nav"
import { Building2, User, Swords, Eye, Zap, Trophy, CreditCard, Clapperboard } from "lucide-react"

const VIDEO_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FBam%20Intro.mp4?alt=media"
const VIDEO_2_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FTXMX%20Ethan%20Commerical.mp4?alt=media"
const LOGO_SRC =
  "https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
const FIGHTER_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fbam-Fightnight.jpg?alt=media"
const FIGHTER_2_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fbam-crowd.jpg?alt=media"
const FIGHTER_3_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fbam-fight2.jpg?alt=media"
const FIGHTER_4_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffeb28-29.jpg?alt=media"

const SLIDE_LABELS = [
  "Title",
  "The Problem",
  "Structural Weakness",
  "Market Gap",
  "The Solution",
  "The Product",
  "The Membership",
  "The Ecosystem",
  "Competitive Landscape",
  "Why Now",
  "Why Boxing",
  "Why Texas",
  "The Revenue Engine",
  "The Unit Economics",
  "The Scale",
  "The Numbers",
  "End Slide",
]

/* ── Slide wrapper ────────────────────────────────────────────── */
function Slide({ id, children, className = "" }: { id: number; children: React.ReactNode; className?: string }) {
  return (
    <section
      id={`slide-${id}`}
      className={`w-full h-dvh shrink-0 md:h-auto md:min-h-dvh md:shrink snap-start relative flex items-start md:items-center justify-center overflow-y-auto md:overflow-hidden py-16 md:py-0 ${className}`}
    >
      {children}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 0 — TITLE
   ════════════════════════════════════════════════════════════════ */
function SlideTitle() {
  return (
    <Slide id={0}>
      <video
        src={VIDEO_SRC}
        poster={FIGHTER_SRC}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)" }}
      />

      <div className="relative z-10 text-center px-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-white text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6 uppercase"
        >
          <span className="text-[#00d4ff]">FanOS:</span> Own the Action
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-white/50 text-base sm:text-lg font-bold mb-12 max-w-xl mx-auto"
        >
          The Future of Fandom
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 max-w-2xl mx-auto"
        >
          {[
            { label: "Year 1 Revenue", value: "$6.065M" },
            { label: "Blended Margins", value: "~75%" },
            { label: "State Verified", value: "TX Pilot" },
            { label: "Expansion", value: "3 Phases" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black px-4 py-4 text-center">
              <p className="text-white text-xl sm:text-2xl font-black">{stat.value}</p>
              <p className="text-white/30 text-[9px] font-bold tracking-wider uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 1 — PROBLEM: FRAGMENTED FANDOM
   ════════════════════════════════════════════════════════════════ */
function SlideProblem() {
  return (
    <Slide id={1}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-amber-500" />
            <span className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">The Problem</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            Fandom is <span className="text-white/30">Fragmented</span>
          </h2>
          <p className="text-white/50 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            A sea of data, tribal communities, and millions of fans — they exist in isolation.
            Fans engage on fight night, then disappear.
          </p>
        </motion.div>

        {/* Three disconnected nodes */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-12">
          {[
            { label: "Promoters", icon: <Building2 className="w-8 h-8 text-white/50" />, desc: "Own the events" },
            { label: "Fans", icon: <User className="w-8 h-8 text-white/50" />, desc: "Watch & leave" },
            { label: "Athletes", icon: <Swords className="w-8 h-8 text-white/50" />, desc: "Fight & disappear" },
          ].map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                {node.icon}
              </div>
              <p className="text-white text-sm font-bold uppercase tracking-wide">{node.label}</p>
              <p className="text-white/30 text-xs font-bold">{node.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Broken connections */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        >
          <span className="text-[#ff3b5c] text-sm font-bold">✕ No connection</span>
          <span className="text-white/10">·</span>
          <span className="text-[#ff3b5c] text-sm font-bold">✕ No data flow</span>
          <span className="text-white/10">·</span>
          <span className="text-[#ff3b5c] text-sm font-bold">✕ No value exchange</span>
        </motion.div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 2 — STRUCTURAL WEAKNESS: STAR-DEPENDENT & FRAGILE
   ════════════════════════════════════════════════════════════════ */
function SlideWeakness() {
  return (
    <Slide id={2}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#ff3b5c]" />
            <span className="text-[#ff3b5c]/80 text-[10px] font-bold tracking-[0.25em] uppercase">
              Structural Weakness
            </span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            Economically <span className="text-white/30">Fragile</span>
          </h2>
          <p className="text-white/50 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            The industry relies on individual free-agent stars who fight twice a year.
            When a star retires or loses, the fan leaves. Zero year-round infrastructure to monetize the downtime.
          </p>
        </motion.div>

        {/* SVG Engagement Graph */}
        <div className="relative max-w-3xl mx-auto">
          <svg viewBox="0 0 600 220" className="w-full" style={{ overflow: "visible" }}>
            {/* Horizontal grid */}
            {[40, 80, 120, 160].map((y) => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}

            {/* Engagement line */}
            <motion.path
              d="M 0,165 L 60,165 L 78,158 L 90,35 L 102,158 L 130,165 L 220,165 L 238,158 L 250,25 L 262,158 L 290,165 L 390,165 L 408,158 L 420,40 L 432,158 L 460,165 L 600,165"
              fill="none"
              stroke="#ff3b5c"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
            />

            {/* FanOS continuous line (aspirational) */}
            <motion.path
              d="M 0,100 C 100,90 200,80 300,70 C 400,60 500,50 600,40"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="2"
              strokeDasharray="6,4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
            />

            {/* Event markers */}
            {[
              { x: 90, label: "Fight Night 1" },
              { x: 250, label: "Fight Night 2" },
              { x: 420, label: "Fight Night 3" },
            ].map((event) => (
              <g key={event.label}>
                <line
                  x1={event.x} y1="20" x2={event.x} y2="175"
                  stroke="rgba(255,59,92,0.15)" strokeWidth="1" strokeDasharray="4,4"
                />
                <text
                  x={event.x} y="195" fill="rgba(255,255,255,0.25)"
                  fontSize="10" textAnchor="middle" fontWeight="600"
                >
                  {event.label}
                </text>
              </g>
            ))}

            {/* Flatline annotation */}
            <text
              x="320" y="148"
              fill="rgba(255,59,92,0.5)" fontSize="10"
              textAnchor="middle" fontWeight="700" fontStyle="italic"
            >
              Zero retention
            </text>
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#ff3b5c]" />
              <span className="text-white/30 text-[10px] font-bold tracking-wider uppercase">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#00d4ff] opacity-60" style={{ borderBottom: "2px dashed #00d4ff" }} />
              <span className="text-white/30 text-[10px] font-bold tracking-wider uppercase">With FanOS</span>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 3 — MARKET GAP
   ════════════════════════════════════════════════════════════════ */
function SlideMarketGap() {
  return (
    <Slide id={3}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-amber-500" />
            <span className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">Market Gap</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            A Massive Market <span className="text-[#00d4ff]">Without Continuity</span>
          </h2>
          <p className="text-white/50 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Sports engagement spans media, betting, fantasy, and social.
            But participation is episodic, not continuous. No infrastructure exists for daily, compounding engagement.
          </p>
        </motion.div>

        {/* Pillars + empty center */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-3xl mx-auto" style={{ height: 260 }}>
          {[
            { label: "Media", h: "75%", color: "#ff3b5c" },
            { label: "Betting", h: "65%", color: "#f5a623" },
          ].map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="w-16 sm:w-20 border border-white/10 rounded-t flex flex-col items-center justify-end pb-3"
              style={{ height: p.h, transformOrigin: "bottom", background: `${p.color}08` }}
            >
              <span className="text-xs font-black tracking-wider uppercase" style={{ color: `${p.color}90` }}>{p.label}</span>
            </motion.div>
          ))}

          {/* Empty center — the gap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-24 sm:w-32 flex flex-col items-center justify-center gap-2 self-center"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#00d4ff]/30 flex items-center justify-center animate-pulse">
              <User className="w-7 h-7 text-[#00d4ff]/40" />
            </div>
            <p className="text-[#00d4ff] text-xs font-black tracking-wider uppercase">The Fan</p>
          </motion.div>

          {[
            { label: "Fantasy", h: "55%", color: "#1a6bff" },
            { label: "Social", h: "60%", color: "#00ff88" },
          ].map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="w-16 sm:w-20 border border-white/10 rounded-t flex flex-col items-center justify-end pb-3"
              style={{ height: p.h, transformOrigin: "bottom", background: `${p.color}08` }}
            >
              <span className="text-xs font-black tracking-wider uppercase" style={{ color: `${p.color}90` }}>{p.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-white/40 text-sm font-bold leading-relaxed"
        >
          Participation is episodic, not continuous —{" "}
          <span className="text-[#ff3b5c] font-black">no infrastructure for daily compounding engagement</span>
        </motion.p>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 4 — THE SOLUTION: ALWAYS-ON 16-WEEK SEASONS
   ════════════════════════════════════════════════════════════════ */
function SlideSolution() {
  const pillars = [
    {
      num: "01",
      title: "Prediction Platform",
      desc: "Legal, skill-based Ticket and sweepstakes system.",
      color: "#00d4ff",
    },
    {
      num: "02",
      title: "League Infrastructure",
      desc: "A 16-week seasonal Gym vs. Gym competition.",
      color: "#f5a623",
    },
    {
      num: "03",
      title: "Media Engine",
      desc: "High-production docuseries (The Blueprint) building emotional equity before the fight.",
      color: "#ff3b5c",
    },
  ]

  const phases = [
    {
      weeks: "Weeks 1–4",
      name: "The Pledge",
      color: "#00d4ff",
      items: [
        "Fans subscribe ($14.99/mo) and Pledge to a Gym.",
        "Launch of The Blueprint high-production docuseries.",
      ],
    },
    {
      weeks: "Weeks 5–12",
      name: "The Grind",
      color: "#ff3b5c",
      items: [
        "Bi-weekly live events and raw sparring streams.",
        "Prediction markets focus on Gym Efficiency micro-markets (e.g., Round 1 KO rates).",
      ],
    },
    {
      weeks: "Weeks 13–16",
      name: "The Post-Season",
      color: "#f5a623",
      items: [
        "The Championship events.",
        "Fans redeem earned TC (Tickets) for exclusive merch drops and real-world gym experiences.",
      ],
    },
  ]

  return (
    <Slide id={4}>
      <img
        src={FIGHTER_4_SRC}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00d4ff]" />
            <span className="text-[#00d4ff]/80 text-[10px] font-bold tracking-[0.25em] uppercase">The Solution</span>
          </div>
          <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] mb-3 md:mb-4">
            Always On. <span className="text-[#00d4ff] block">3 Seasons. 48 Weeks.</span>
          </h2>
          <p className="text-white/60 text-xs sm:text-sm font-bold max-w-lg mx-auto leading-relaxed">
            A 16-week media season converts isolated events into tribal narratives.
          </p>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto mb-10 md:mb-14">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="border border-white/10 p-4 md:p-6"
              style={{ background: `${p.color}06` }}
            >
              <span className="text-[10px] font-bold tracking-wider" style={{ color: p.color }}>
                {p.num}
              </span>
              <h3 className="text-white text-base md:text-lg font-black uppercase tracking-tight leading-snug md:leading-tight mt-2 mb-2">
                {p.title}
              </h3>
              <p className="text-white/60 text-[11px] md:text-xs font-bold leading-snug md:leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Season Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* Timeline bar */}
          <div className="flex gap-0 mb-4 md:mb-6">
            {phases.map((phase) => (
              <div
                key={phase.name}
                className="flex-1 py-2 md:py-2.5 text-center border border-white/10"
                style={{ background: `${phase.color}10`, borderBottom: `2px solid ${phase.color}` }}
              >
                <p className="text-[8px] md:text-[10px] font-bold tracking-wider uppercase" style={{ color: phase.color }}>
                  {phase.weeks}
                </p>
                <p className="text-white text-[10px] md:text-sm font-black uppercase tracking-tight leading-tight mt-0.5">
                  {phase.name}
                </p>
              </div>
            ))}
          </div>

          {/* Phase details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex flex-col gap-1.5 md:gap-2"
              >
                {phase.items.map((item) => (
                  <p key={item} className="text-white/50 text-[10px] md:text-[11px] font-bold leading-snug md:leading-relaxed">
                    <span style={{ color: phase.color }}>▸</span> {item}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Produced by tag */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 md:mt-10 text-[9px] md:text-[10px] font-bold tracking-widest uppercase"
        >
          <span className="text-white/30">Produced by </span>
          <a
            href="https://434media.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5a623] hover:text-[#f5a623]/80 transition-colors"
          >
            434 Media
          </a>
        </motion.p>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 5 — WHY BOXING: THE HIGH-INTENSITY CATALYST
   ════════════════════════════════════════════════════════════════ */
function SlideWhyBoxing() {
  return (
    <Slide id={10}>
      <img
        src={FIGHTER_3_SRC}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/85" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#ff3b5c]" />
            <span className="text-[#ff3b5c]/80 text-[10px] font-bold tracking-[0.25em] uppercase">Why Boxing</span>
          </div>
          <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] mb-3 md:mb-4">
            The High-Intensity <span className="text-[#ff3b5c]">Catalyst</span>
          </h2>
        </motion.div>

        {/* Two cards: The Asset + The Renaissance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="border border-[#ff3b5c]/20 p-5 md:p-8"
            style={{ background: "rgba(255,59,92,0.04)" }}
          >
            <h3 className="text-[#ff3b5c] text-lg md:text-xl font-black uppercase tracking-tight leading-snug mb-3">
              The Asset
            </h3>
            <p className="text-white/60 text-[11px] md:text-sm font-bold leading-relaxed">
              Boxing is the ultimate High-Intensity, Low-Frequency sport. It commands a massive global footprint and possesses a deep-rooted, pre-existing gym culture.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="border border-[#00d4ff]/20 p-5 md:p-8"
            style={{ background: "rgba(0,212,255,0.04)" }}
          >
            <h3 className="text-[#00d4ff] text-lg md:text-xl font-black uppercase tracking-tight leading-snug mb-3">
              The Renaissance
            </h3>
            <p className="text-white/60 text-[11px] md:text-sm font-bold leading-relaxed">
              It completely lacks the technological layer required to sustain user activity between events. It is a high-value asset class perfectly primed for a tech-enabled renaissance.
            </p>
          </motion.div>
        </div>

        {/* Data metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 max-w-3xl mx-auto"
        >
          {[
            { label: "Impact Velocity", color: "#ff3b5c" },
            { label: "Fighter Engagement", color: "#f5a623" },
            { label: "Round Duration", color: "#00d4ff" },
            { label: "Energy Expenditure", color: "#00ff88" },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="bg-black px-3 py-4 md:px-4 md:py-5 text-center"
            >
              <div
                className="w-2 h-2 rounded-full mx-auto mb-2"
                style={{ background: metric.color, boxShadow: `0 0 8px ${metric.color}40` }}
              />
              <p className="text-white/50 text-[9px] md:text-[10px] font-bold tracking-wider uppercase leading-tight">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 md:mt-10 text-white/40 text-[10px] md:text-xs font-bold leading-relaxed"
        >
          High-intensity data per event ×{" "}
          <span className="text-[#ff3b5c] font-black">deep tribal identity</span>
          {" "}= the perfect engagement substrate
        </motion.p>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 6 — TIMING / WEDGE: WHY NOW
   ════════════════════════════════════════════════════════════════ */
function SlideTiming() {
  return (
    <Slide id={9}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00d4ff]" />
            <span className="text-[#00d4ff]/80 text-[10px] font-bold tracking-[0.25em] uppercase">Why Now</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            The Regulatory <span className="text-[#00d4ff]">Wedge</span>
          </h2>
          <p className="text-white/50 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Sports betting is banned in Texas. Prediction markets are complex and unregulated.
            FanOS is skill-based, legal, and rewarded.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              title: "Sportsbooks",
              status: "Banned in TX",
              color: "#ff3b5c",
              items: ["Gambling classification", "State-by-state licensing", "Heavy regulatory burden", "User as bettor"],
              icon: "✕",
            },
            {
              title: "Prediction Markets",
              status: "Complex",
              color: "#f5a623",
              items: ["SEC gray area", "Regulatory Burden", "Niche user base", "No fan identity"],
              icon: "~",
            },
            {
              title: "FanOS",
              status: "Legal & Rewarded",
              color: "#00d4ff",
              items: ["Skill-based (legal all 50)", "No real-money wagering", "Mass-market appeal", "Fan-as-participant"],
              icon: "✓",
            },
          ].map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.15 }}
              className="border p-6"
              style={{ borderColor: `${col.color}30`, background: `${col.color}06` }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-lg font-black uppercase tracking-tight">{col.title}</p>
                <span
                  className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    color: col.color,
                    background: `${col.color}12`,
                    border: `1px solid ${col.color}30`,
                  }}
                >
                  {col.status}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                    <span style={{ color: col.color }}>{col.icon}</span>
                    <span className="text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 5 — COMPETITIVE ADVANTAGE
   ════════════════════════════════════════════════════════════════ */
function SlideAdvantage() {
  const columns = ["2026 Reality", "Focus", "Vertical Ownership", "Legal Status in TX"]
  const competitors = [
    {
      name: "DraftKings / FanDuel",
      values: ["Blocked", "Generalist", "Platform only", "ILLEGAL"],
      highlight: false,
      colors: ["#ff3b5c", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)", "#ff3b5c"],
    },
    {
      name: "Zuffa / Polymarket",
      values: ["Under Federal Fire", "Individual", "Platform only", "ILLEGAL"],
      highlight: false,
      colors: ["#ff3b5c", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)", "#ff3b5c"],
    },
    {
      name: "PFL",
      values: ["Seasonal", "Individual", "Promoter only", "Legal"],
      highlight: false,
      colors: ["#f5a623", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)", "#f5a623"],
    },
    {
      name: "TXMX",
      values: ["Dominating the Vacuum", "Gym Tribes", "Promoter + Platform + Compliance", "100% LEGAL & VERIFIED"],
      highlight: true,
      colors: ["#00d4ff", "#00d4ff", "#00d4ff", "#00ff88"],
    },
  ]

  return (
    <Slide id={8}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00d4ff]" />
            <span className="text-[#00d4ff]/80 text-[10px] font-bold tracking-[0.25em] uppercase">
              The Competitive Landscape
            </span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05]">
            Owning the <span className="text-[#00d4ff]">Engagement Layer</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full max-w-4xl mx-auto text-[10px] md:text-sm">
            <thead>
              <tr>
                <th className="text-left text-white/30 text-[8px] md:text-[10px] font-bold tracking-wider uppercase py-2 px-1.5 md:py-3 md:px-3">
                  Competitor
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-center text-white/30 text-[8px] md:text-[10px] font-bold tracking-wider uppercase py-2 px-1.5 md:py-3 md:px-3"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, ci) => (
                <motion.tr
                  key={comp.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + ci * 0.08 }}
                  className={`border-t ${comp.highlight ? "border-[#00d4ff]/20 bg-[#00d4ff]/4" : "border-white/5"}`}
                >
                  <td className={`py-2 px-1.5 md:py-3 md:px-3 font-semibold md:font-bold leading-tight md:leading-snug text-[10px] md:text-sm ${comp.highlight ? "text-[#00d4ff]" : "text-white/60"}`}>
                    {comp.name}
                  </td>
                  {comp.values.map((val, vi) => (
                    <td
                      key={vi}
                      className="text-center py-2 px-1.5 md:py-3 md:px-3 text-[9px] md:text-xs font-semibold md:font-bold leading-tight md:leading-snug"
                      style={{ color: comp.colors[vi] }}
                    >
                      {val}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 6 — PRODUCT TRUTH
   ════════════════════════════════════════════════════════════════ */
function SlideProduct() {
  return (
    <Slide id={5}>
      <img
        src={FIGHTER_SRC}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00d4ff]" />
            <span className="text-[#00d4ff]/80 text-[10px] font-bold tracking-[0.25em] uppercase">Product</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            Behavior → <span className="text-[#00d4ff]">System</span>
          </h2>
          <p className="text-white/50 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Fans already analyze, predict, and debate daily.
            FanOS structures this raw energy into a system of continuous participation.
          </p>
        </motion.div>

        {/* 3-stage progression */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              stage: "01",
              title: "Passive Viewer",
              desc: "Watches fights, scrolls social. Zero participation. Zero value captured.",
              color: "#ff3b5c",
              icon: <Eye className="w-7 h-7" style={{ color: "#ff3b5c" }} />,
              items: ["No account", "No data", "No rewards"],
            },
            {
              stage: "02",
              title: "Engaged Fan",
              desc: "Makes predictions, earns XP, joins a gym tribe. Active daily participant.",
              color: "#f5a623",
              icon: <Zap className="w-7 h-7" style={{ color: "#f5a623" }} />,
              items: ["Daily predictions", "XP + streak system", "Gym identity"],
            },
            {
              stage: "03",
              title: "Ranked Participant",
              desc: "Top-ranked fan with global status, NIL pool access, and IRL perks.",
              color: "#00d4ff",
              icon: <Trophy className="w-7 h-7" style={{ color: "#00d4ff" }} />,
              items: ["Global leaderboard", "NIL pool shares", "Black Card access"],
            },
          ].map((s, i) => (
            <motion.div
              key={s.stage}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative border border-white/10 bg-black/60 backdrop-blur-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                {s.icon}
                <span className="text-[10px] font-bold tracking-wider" style={{ color: s.color }}>
                  {s.stage}
                </span>
              </div>
              <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">{s.title}</h3>
              <p className="text-white/50 text-xs font-bold leading-5 mb-4">{s.desc}</p>
              <div className="flex flex-col gap-1.5">
                {s.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-bold text-white/60">
                    <span style={{ color: s.color }}>▸</span> {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <p className="text-white/40 text-xs font-bold">
            Behavioral functionalization via FanOS
          </p>
        </motion.div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 7 — BLACK CARD
   ════════════════════════════════════════════════════════════════ */
function SlideBlackCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set(e.clientX - (rect.left + rect.width / 2))
    y.set(e.clientY - (rect.top + rect.height / 2))
  }

  return (
    <Slide id={6}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-amber-500" />
            <span className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">Membership</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            The{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #f5a623, #d4890a)" }}
            >
              Black Card
            </span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl mx-auto">
          {/* 3D Card */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouse}
            onMouseLeave={() => { x.set(0); y.set(0) }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-[320px] h-[200px] shrink-0 rounded-lg overflow-hidden cursor-default"
          >
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #0d1420, #111827, #0d1420)",
                border: "1px solid rgba(245,166,35,0.2)",
              }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: "linear-gradient(135deg, transparent 30%, rgba(245,166,35,0.15) 50%, transparent 70%)",
              }}
            />
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[#00d4ff] text-lg font-black tracking-tight">FanOS</span>
                <div
                  className="w-8 h-6 rounded-sm"
                  style={{ background: "linear-gradient(135deg, #f5a623, #d4890a)" }}
                />
              </div>
              <div>
                <p className="text-white/30 text-[8px] tracking-[0.2em] uppercase font-bold">Black Card Member</p>
                <p className="text-white/80 text-xs font-bold tracking-wider">ELITE PARTICIPANT · TOP 3%</p>
              </div>
            </div>
          </motion.div>

          {/* Value Pillars */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                {
                  name: "Status",
                  items: ["Verified global rank", "Elite identity tied to performance + gym", "Recognition across platform + events"],
                  color: "#f5a623",
                },
                {
                  name: "Access",
                  items: ["Backstage + VIP event entry", "Direct connection to gyms + fighters", "Priority access to drops and experiences"],
                  color: "#00d4ff",
                },
                {
                  name: "Participation",
                  items: ["Full access to NIL pools", "Performance-based rewards", "Earn through accuracy + streaks"],
                  color: "#00ff88",
                },
                {
                  name: "Experience",
                  items: ["Physical Black Card (identity key)", "Always-on engagement", "Digital + IRL elevated experience"],
                  color: "#ff3b5c",
                },
              ].map((pillar) => (
                <div
                  key={pillar.name}
                  className="border border-white/10 p-4"
                  style={{ background: `${pillar.color}06` }}
                >
                  <p className="text-sm font-black uppercase tracking-wider mb-2" style={{ color: pillar.color }}>{pillar.name}</p>
                  <div className="flex flex-col gap-1.5">
                    {pillar.items.map((item) => (
                      <p key={item} className="text-white/40 text-[11px] font-semibold leading-4">
                        <span style={{ color: pillar.color }}>{"\u25B8"}</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-amber-500/20 bg-amber-500/4 p-3">
              <p className="text-white/40 text-xs font-bold text-center">
                Not just watching the fight {"\u2014"}{" "}
                <span className="text-amber-500 font-bold">participating in the ecosystem</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 8 — FLYWHEEL
   ════════════════════════════════════════════════════════════════ */
function SlideFlywheel() {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const interval = setInterval(() => setActive((p) => (p + 1) % 4), 2000)
    return () => clearInterval(interval)
  }, [isInView])

  const quadrants = [
    { label: "Capital", desc: "Black Card subscriptions ($14.99/mo) fund specific Gym NIL Pools", icon: <CreditCard className="w-6 h-6" />, color: "#00d4ff" },
    { label: "Athletes", desc: "Targeted funding improves athlete performance, recovery, and training", icon: <Swords className="w-6 h-6" />, color: "#f5a623" },
    { label: "Content", desc: "Elite performance generates richer data and exclusive media content", icon: <Clapperboard className="w-6 h-6" />, color: "#00ff88" },
    { label: "Fans", desc: "High-fidelity content and data attract and retain more fans, driving new subscriptions", icon: <Zap className="w-6 h-6" />, color: "#ff3b5c" },
  ]

  return (
    <Slide id={7}>
      <div ref={ref} className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00d4ff]" />
            <span className="text-[#00d4ff]/80 text-[10px] font-bold tracking-[0.25em] uppercase">The Ecosystem</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05]">
            Self-Sustaining <span className="text-[#00d4ff]">Flywheel</span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl mx-auto">
          {/* Gear visual */}
          <div className="relative w-[280px] h-[280px] shrink-0">
            <motion.div
              className="absolute inset-0 border-2 border-dashed rounded-full"
              style={{ borderColor: "rgba(0,212,255,0.12)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Center label */}
            <div className="absolute inset-[25%] rounded-full border border-white/10 flex items-center justify-center bg-white/2">
              <p className="text-white text-xs font-black uppercase tracking-wider text-center leading-tight">
                Continuous
                <br />
                Growth
              </p>
            </div>

            {/* Quadrant nodes */}
            {quadrants.map((q, i) => {
              const angle = (i * 90 - 90) * (Math.PI / 180)
              const radius = 115
              const cx = 140 + radius * Math.cos(angle)
              const cy = 140 + radius * Math.sin(angle)
              return (
                <motion.div
                  key={q.label}
                  className="absolute flex flex-col items-center gap-0.5"
                  style={{ left: cx - 28, top: cy - 28 }}
                  animate={{
                    scale: active === i ? 1.15 : 1,
                    opacity: active === i ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center border"
                    style={{
                      borderColor: active === i ? q.color : "rgba(255,255,255,0.1)",
                      background: active === i ? `${q.color}15` : "rgba(0,0,0,0.5)",
                      boxShadow: active === i ? `0 0 15px ${q.color}30` : "none",
                      color: active === i ? q.color : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {q.icon}
                  </div>
                  <span
                    className="text-[9px] font-bold tracking-wider uppercase"
                    style={{ color: active === i ? q.color : "rgba(255,255,255,0.3)" }}
                  >
                    {q.label}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Active description */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-white/10 bg-white/2 p-6"
              >
                <div className="flex items-center gap-3 mb-3" style={{ color: quadrants[active].color }}>
                  {quadrants[active].icon}
                  <span className="text-white text-xl font-black uppercase tracking-tight">
                    {quadrants[active].label}
                  </span>
                </div>
                <p className="text-white/50 text-sm font-semibold leading-6">
                  {quadrants[active].desc}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="h-px flex-1"
                    style={{ background: `linear-gradient(90deg, ${quadrants[active].color}, transparent)` }}
                  />
                  <span
                    className="text-[10px] font-bold tracking-wider"
                    style={{ color: quadrants[active].color }}
                  >
                    → {quadrants[(active + 1) % 4].label}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {quadrants.map((q, i) => (
                <button
                  key={q.label}
                  onClick={() => setActive(i)}
                  className="py-2 text-[9px] font-bold tracking-wider uppercase text-center transition-all border cursor-pointer"
                  style={{
                    borderColor: active === i ? q.color : "rgba(255,255,255,0.05)",
                    color: active === i ? q.color : "rgba(255,255,255,0.2)",
                    background: active === i ? `${q.color}08` : "transparent",
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 9 — REVENUE MODEL
   ════════════════════════════════════════════════════════════════ */
function SlideRevenue() {
  const layers = [
    { name: "Subscriptions", short: "SUBS", amt: "$4.49M", pct: "74%", color: "#00d4ff", desc: "B2C subscription tiers (85% margin)", r: 34, sw: 18 },
    { name: "Sponsorships", short: "SPONSORS", amt: "$750K", pct: "12%", color: "#f5a623", desc: "Brand partnerships + event sponsors (80% margin)", r: 60, sw: 10 },
    { name: "Compliance", short: "COMPLIANCE", amt: "$608K", pct: "10%", color: "#00ff88", desc: "Regulatory + compliance services (76% margin)", r: 80, sw: 8 },
    { name: "Merchandise", short: "MERCH", amt: "$500K", pct: "8%", color: "#1a6bff", desc: "Exclusive drops + Black Card merch (40% margin)", r: 98, sw: 7 },
    { name: "B2B SaaS", short: "SAAS", amt: "$240K", pct: "4%", color: "#ff3b5c", desc: "Gym analytics + data licensing (90% margin)", r: 114, sw: 5 },
  ]

  const cx = 140
  const cy = 140

  return (
    <Slide id={12}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00ff88]" />
            <span className="text-[#00ff88]/80 text-[10px] font-bold tracking-[0.25em] uppercase">
              Revenue Engine
            </span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05]">
            Multi-Layered <span className="text-[#00ff88]">Revenue Engine</span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl mx-auto">
          {/* Concentric rings visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative shrink-0"
          >
            <svg viewBox="0 0 280 280" className="w-[280px] h-[280px]">
              {/* Background rings (faint guide) */}
              {layers.map((layer) => (
                <circle
                  key={`bg-${layer.name}`}
                  cx={cx}
                  cy={cy}
                  r={layer.r}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth={layer.sw}
                  opacity={0.06}
                />
              ))}

              {/* Animated rings that draw in */}
              {layers.map((layer, i) => {
                const circumference = 2 * Math.PI * layer.r
                return (
                  <motion.circle
                    key={layer.name}
                    cx={cx}
                    cy={cy}
                    r={layer.r}
                    fill="none"
                    stroke={layer.color}
                    strokeWidth={layer.sw}
                    strokeLinecap="round"
                    opacity={0.45}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.18, duration: 1.2, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${layer.color}30)` }}
                  />
                )
              })}

              {/* Ring labels positioned at staggered angles */}
              {layers.map((layer, i) => {
                const angles = [-60, 35, 160, -130, 80]
                const angle = (angles[i] * Math.PI) / 180
                const lx = cx + Math.cos(angle) * layer.r
                const ly = cy + Math.sin(angle) * layer.r
                return (
                  <motion.g
                    key={`label-${layer.name}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.12 }}
                  >
                    <circle cx={lx} cy={ly} r={3} fill={layer.color} />
                    <rect
                      x={lx + (angles[i] > 0 && angles[i] < 180 ? 6 : -42)}
                      y={ly - 7}
                      width={36}
                      height={14}
                      rx={2}
                      fill="rgba(0,0,0,0.8)"
                      stroke={layer.color}
                      strokeWidth={0.5}
                      opacity={0.9}
                    />
                    <text
                      x={lx + (angles[i] > 0 && angles[i] < 180 ? 24 : -24)}
                      y={ly + 1}
                      textAnchor="middle"
                      fill={layer.color}
                      fontSize="6"
                      fontWeight="800"
                    >
                      {layer.short}
                    </text>
                  </motion.g>
                )
              })}

              {/* Center total */}
              <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="15" fontWeight="900">
                $6.065M
              </text>
              <text x={cx} y={cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontWeight="700" letterSpacing="0.12em">
                YEAR 1
              </text>
            </svg>
          </motion.div>

          {/* Revenue layers list */}
          <div className="flex-1 flex flex-col gap-3">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-4 border border-white/5 bg-white/2 p-3"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 border-2"
                  style={{ borderColor: layer.color, background: `${layer.color}20` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-bold">{layer.name}</p>
                    <p className="text-white font-black text-sm">{layer.amt}</p>
                  </div>
                  <p className="text-white/30 text-[11px] font-semibold">{layer.desc}</p>
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: layer.color }}>
                  {layer.pct}
                </span>
              </motion.div>
            ))}

            <div className="border-t border-white/10 pt-3 flex items-center justify-between px-3">
              <span className="text-white/50 text-sm font-bold">Total Year 1</span>
              <span className="text-[#00d4ff] text-xl font-black">$6.065M</span>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 10 — UNIT ECONOMICS
   ════════════════════════════════════════════════════════════════ */
function SlideEconomics() {
  const bars = [
    { label: "Subs", value: 4.49, display: "$4.49M", color: "#00d4ff", margin: "85%" },
    { label: "Sponsors", value: 0.75, display: "$750K", color: "#f5a623", margin: "80%" },
    { label: "Compliance", value: 0.608, display: "$608K", color: "#00ff88", margin: "76%" },
    { label: "Merch", value: 0.50, display: "$500K", color: "#1a6bff", margin: "40%" },
    { label: "SaaS", value: 0.24, display: "$240K", color: "#ff3b5c", margin: "90%" },
  ]
  const maxVal = 5.0

  return (
    <Slide id={13}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00ff88]" />
            <span className="text-[#00ff88]/80 text-[10px] font-bold tracking-[0.25em] uppercase">
              Unit Economics
            </span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            <span className="text-[#00ff88]">~75%</span> Blended Margin
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Bar chart */}
          <div className="flex items-end gap-4 sm:gap-8 justify-center" style={{ height: 220 }}>
            {bars.map((bar, i) => (
              <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 max-w-20 h-full justify-end">
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                  className="w-full rounded-t relative"
                  style={{
                    height: `${(bar.value / maxVal) * 100}%`,
                    background: bar.color,
                    transformOrigin: "bottom",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-black text-[11px] font-black">{bar.display}</span>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Labels */}
          <div className="flex gap-4 sm:gap-8 justify-center mt-3">
            {bars.map((bar) => (
              <div key={bar.label} className="flex-1 max-w-20 text-center">
                <p className="text-white/40 text-[10px] font-bold tracking-wider uppercase">{bar.label}</p>
                <p className="text-[9px] font-bold mt-0.5" style={{ color: bar.color }}>
                  {bar.margin} margin
                </p>
              </div>
            ))}
          </div>

          {/* Totals row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="mt-10 border-t border-white/10 pt-5 flex items-center justify-center gap-8 sm:gap-12"
          >
            <div className="text-center">
              <p className="text-white text-3xl font-black">$6.065M</p>
              <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase">Year 1 Revenue</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-[#00ff88] text-3xl font-black">~75%</p>
              <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase">Blended Margin</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-amber-500 text-3xl font-black">$4.5M</p>
              <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase">Gross Profit</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 11 — EXPANSION: 3-PHASE PIPELINE
   ════════════════════════════════════════════════════════════════ */
function SlideExpansion() {
  return (
    <Slide id={14}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#00d4ff]" />
            <span className="text-[#00d4ff]/80 text-[10px] font-bold tracking-[0.25em] uppercase">The Scale</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            TODAY TEXAS. <span className="text-white/30 block">TOMORROW WORLD.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 max-w-4xl mx-auto">
          {[
            {
              phase: "Phase 1",
              title: "Texas Pilot",
              timeline: "Year 1",
              color: "#00d4ff",
              items: ["Data Ingest", "50 Gyms in Tribal System", "25k Fans Onboarded", "Black Card Launch"],
              active: true,
            },
            {
              phase: "Phase 2",
              title: "National Expansion",
              timeline: "Year 2",
              color: "#f5a623",
              items: ["Replicate blueprint across U.S.", "100,000+ fans", "200+ gyms", "NIL pool scaling"],
              active: false,
            },
            {
              phase: "Phase 3",
              title: "Global Infrastructure",
              timeline: "Year 3+",
              color: "#00ff88",
              items: ["Soccer, cricket, racing", "International federations", "1M+ fans", "Full commerce stack"],
              active: false,
            },
          ].map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`border p-6 relative ${phase.active ? "bg-white/3" : ""}`}
              style={{ borderColor: `${phase.color}30` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: phase.color }} />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: phase.color }}>
                  {phase.phase}
                </span>
                <span className="text-white/20 text-[10px] font-semibold">{phase.timeline}</span>
              </div>

              <h3 className="text-white text-xl font-black uppercase tracking-tight mb-4">{phase.title}</h3>

              <div className="flex flex-col gap-2">
                {phase.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-white/50">
                    <span style={{ color: phase.color }}>▸</span> {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 12 — TEXAS MARKET
   ════════════════════════════════════════════════════════════════ */
function SlideTexas() {
  return (
    <Slide id={11}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-amber-500" />
            <span className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">Why Texas</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-4">
            <span className="text-amber-500">$500M+</span> Locked Market
          </h2>
          <p className="text-white/50 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Texas is the largest combat sports licensing market in the U.S. — sports betting
            remains strictly illegal following failed 2025 legislation. Texans are desperate for legal gamification.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
          {/* Stats */}
          <div className="flex flex-col gap-4">
            {[
              { stat: "#1", label: "Combat sports licensing market in the U.S.", color: "#f5a623" },
              { stat: "0", label: "Legal sportsbooks — failed 2025 legislation", color: "#ff3b5c" },
              { stat: "30M+", label: "Population — 2nd largest state", color: "#00ff88" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 border border-white/5 bg-white/2 p-4"
              >
                <span
                  className="text-3xl font-black shrink-0 min-w-[70px] text-right"
                  style={{ color: item.color }}
                >
                  {item.stat}
                </span>
                <p className="text-white/50 text-sm font-bold leading-snug">{item.label}</p>
              </motion.div>
            ))}
          </div>

          {/* TX visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-[360px] mx-auto">
              <img src="/texas.png" alt="Texas" className="w-full h-auto object-contain" />
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10 text-white/40 text-sm font-bold leading-relaxed"
        >
          Exclusive TDLR data pipeline +{" "}
          <span className="text-amber-500 font-black">Zero legal competition</span>
          {" "}= First-mover lock
        </motion.p>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 13 — FINANCIAL SNAPSHOT
   ════════════════════════════════════════════════════════════════ */
function SlideSnapshot() {
  return (
    <Slide id={15}>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-amber-500" />
            <span className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">The Numbers</span>
          </div>
          <h2 className="text-white text-5xl sm:text-6xl font-black uppercase tracking-tight leading-[1.05]">
            Financial <span className="text-amber-500">Snapshot</span>
          </h2>
        </motion.div>

        {/* 3 hero stat blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {[
            {
              value: "$6.065M",
              label: "Year 1 Revenue",
              sub: "6 revenue streams, subscription-led model",
              color: "#00d4ff",
            },
            {
              value: "~75%",
              label: "Blended Margins",
              sub: "Software-first, web-native, zero app store tax",
              color: "#00ff88",
            },
            {
              value: "$500K",
              label: "Seed Round",
              sub: "Texas pilot, platform build, GTM execution",
              color: "#f5a623",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="border border-white/10 bg-white/2 p-8 text-center"
            >
              <p
                className="text-5xl sm:text-6xl font-black tracking-tight mb-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-white text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-white/30 text-xs font-bold">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Supporting details */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { val: "25K", label: "Fans", color: "#00d4ff" },
            { val: "50+", label: "Gym Partners", color: "#f5a623" },
            { val: "100%", label: "Web — No App Tax", color: "#00ff88" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xl font-black" style={{ color: item.color }}>
                {item.val}
              </p>
              <p className="text-white/30 text-[9px] font-bold tracking-wider uppercase mt-0.5">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   SLIDE 14 — CLOSE
   ════════════════════════════════════════════════════════════════ */
function SlideClose() {
  return (
    <Slide id={16}>
      <video
        src={VIDEO_2_SRC}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 text-center px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Image
            src={LOGO_SRC}
            alt="TXMX Boxing"
            width={100}
            height={50}
            className="mx-auto mb-8 filter brightness-0 invert"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-white text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 uppercase"
        >
          Infrastructure for
          <br />
          <span className="text-[#00d4ff]">the Future of Fandom</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-base font-bold mb-12 max-w-lg mx-auto leading-relaxed"
        >
          FanOS scales anywhere fans and data exist.
          <br />
          Skill-based. Fan-owned. Texas-built.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-3 border border-[#00d4ff]/20 px-6 py-3"
          style={{ background: "rgba(0,212,255,0.04)" }}
        >
          <span className="text-[#00d4ff] text-sm font-black tracking-tight">FanOS</span>
          <span className="text-white/20">·</span>
          <span className="text-white/50 text-sm font-semibold">txmxboxing.com</span>
        </motion.div>
      </div>
    </Slide>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN DECK COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function FanosDeck() {
  const { currentSlide, navigateTo, containerRef } = useDeckNavigation(17)

  return (
    <main ref={containerRef} className="h-dvh flex flex-row overflow-x-auto snap-x snap-mandatory md:block md:overflow-x-hidden md:overflow-y-auto md:snap-y bg-black">
      <DeckNav
        totalSlides={17}
        currentSlide={currentSlide}
        onNavigate={navigateTo}
        slideLabels={SLIDE_LABELS}
      />

      <SlideTitle />
      <SlideProblem />
      <SlideWeakness />
      <SlideMarketGap />
      <SlideSolution />
      <SlideProduct />
      <SlideBlackCard />
      <SlideFlywheel />
      <SlideAdvantage />
      <SlideTiming />
      <SlideWhyBoxing />
      <SlideTexas />
      <SlideRevenue />
      <SlideEconomics />
      <SlideExpansion />
      <SlideSnapshot />
      <SlideClose />
    </main>
  )
}
