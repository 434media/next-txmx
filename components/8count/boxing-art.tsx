"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function BoxingArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    // Set canvas size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    let animationId: number
    let time = 0

    // Distortion effect that masks/breaks the logo
    const draw = () => {
      const width = rect.width
      const height = rect.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (isHovering) {
        const mouseX = mousePosition.x * width
        const mouseY = mousePosition.y * height
        const distortionRadius = 80

        // Create distortion mask that will hide parts of the logo
        ctx.globalCompositeOperation = 'source-over'
        
        // Create chaotic distortion blocks around mouse
        for (let i = 0; i < 30; i++) {
          const angle = (i / 30) * Math.PI * 2 + time * 0.02
          const radius = (Math.random() * distortionRadius * 0.8) + (Math.sin(time * 0.03 + i) * 10)
          const x = mouseX + Math.cos(angle) * radius
          const y = mouseY + Math.sin(angle) * radius
          
          // Create irregular distortion blocks
          const blockWidth = Math.random() * 20 + 5
          const blockHeight = Math.random() * 20 + 5
          
          // Use black blocks to mask out logo parts
          ctx.fillStyle = `rgba(0, 0, 0, ${0.8 + Math.random() * 0.2})`
          ctx.fillRect(x - blockWidth/2, y - blockHeight/2, blockWidth, blockHeight)
          
          // Add some pixelated noise
          if (Math.random() > 0.6) {
            ctx.fillStyle = Math.random() > 0.5 ? 
              `rgba(255, 255, 255, ${Math.random() * 0.4})` : 
              `rgba(0, 0, 0, ${Math.random() * 0.6})`
            const noiseSize = Math.random() * 8 + 2
            ctx.fillRect(
              x + (Math.random() - 0.5) * 30, 
              y + (Math.random() - 0.5) * 30, 
              noiseSize, 
              noiseSize
            )
          }
        }

        // Add horizontal glitch lines that cut through the logo
        for (let i = 0; i < 8; i++) {
          const lineY = mouseY + (Math.random() - 0.5) * distortionRadius * 1.5
          const lineWidth = width * (0.3 + Math.random() * 0.4)
          const lineHeight = Math.random() * 3 + 1
          
          ctx.fillStyle = `rgba(0, 0, 0, ${0.7 + Math.random() * 0.3})`
          ctx.fillRect(
            mouseX - lineWidth/2 + Math.sin(time * 0.05) * 10, 
            lineY, 
            lineWidth, 
            lineHeight
          )
        }

        // Add vertical distortion streaks
        for (let i = 0; i < 5; i++) {
          const streakX = mouseX + (Math.random() - 0.5) * distortionRadius
          const streakHeight = height * 0.4
          const streakWidth = Math.random() * 2 + 1
          
          ctx.fillStyle = `rgba(0, 0, 0, ${0.6 + Math.random() * 0.4})`
          ctx.fillRect(streakX, mouseY - streakHeight/2, streakWidth, streakHeight)
        }
      }

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [mousePosition, isHovering])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <div className="border border-white/20 bg-black/40 p-4">
      <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-white" />
          <div className="w-1.5 h-1.5 bg-white" />
          <div className="w-1.5 h-1.5 bg-white" />
        </div>
        <span className="text-xs font-mono text-zinc-500">[ SHOP ]</span>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-square bg-black border border-zinc-800 overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center z-0">
          <a href="https://www.434media.com/shop" target="_blank" rel="noopener noreferrer">
            <Image
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/bam2.jpg"
              alt="TXMX Logo"
              width={200}
              height={200}
              className="w-full h-auto opacity-60 mix-blend-screen drop-shadow-sm" 
              priority
            />    
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-white/40 font-mono text-xs">
        <span>●</span>
        <span>●</span>
        <span>●</span>
        <span className="mx-2">FOUNDERS TEE</span>
        <span>●</span>
        <span>●</span>
        <span>●</span>
      </div>
    </div>
  )
}
