"use client"

import { useState } from "react"
import Navbar from "./components/navbar"
import HeroSection from "./components/hero-section"
import SlideOutModal from "./components/slide-out-modal"
import GlobalStyles from "./components/global-styles"

export default function TXMXLanding() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <GlobalStyles />
      <main className="relative min-h-screen bg-black overflow-hidden font-sans">
        <Navbar onMenuClick={openModal} />
        <HeroSection />
        <SlideOutModal isOpen={isModalOpen} onClose={closeModal} />
      </main>
    </>
  )
}
