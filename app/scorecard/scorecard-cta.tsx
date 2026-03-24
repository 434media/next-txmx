"use client"

import { useState } from "react"
import SubscribeButton from "../../components/subscribe-button"
import AuthModal from "../../components/auth-modal"

export default function ScorecardCta() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <SubscribeButton onAuthClick={() => setIsAuthOpen(true)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
