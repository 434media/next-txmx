"use client"

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      /* Enhanced CSS Variables for Monochrome Design */
      :root {
        --primary-white: #ffffff;
        --primary-black: #000000;
        --gray-light: #f5f5f5;
        --gray-medium: #a0a0a0;
        --gray-dark: #404040;
        --white-rgb: 255, 255, 255;
        --black-rgb: 0, 0, 0;
        --shadow-light: rgba(255, 255, 255, 0.1);
        --shadow-dark: rgba(0, 0, 0, 0.3);
      }

      /* Smooth scrolling for the entire page */
      html {
        scroll-behavior: smooth;
      }

      /* Hide scrollbars on mobile devices */
      @media (max-width: 768px) {
        ::-webkit-scrollbar {
          display: none;
        }
        
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      }

      /* Enhanced custom scrollbar styling for desktop */
      @media (min-width: 769px) {
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }
      }

      /* Font family utilities */
      .font-sans {
        font-family: var(--font-geist-sans), system-ui, sans-serif;
      }

      .font-mono {
        font-family: var(--font-geist-mono), 'Courier New', monospace;
      }

      /* Enhanced animation keyframes - Monochrome */
      @keyframes glowPulse {
        0%, 100% { 
          box-shadow: 
            0 0 20px rgba(var(--white-rgb), 0.2),
            0 0 40px rgba(var(--white-rgb), 0.1),
            inset 0 1px 0 rgba(var(--white-rgb), 0.15);
        }
        50% { 
          box-shadow: 
            0 0 35px rgba(var(--white-rgb), 0.4),
            0 0 70px rgba(var(--white-rgb), 0.2),
            inset 0 1px 0 rgba(var(--white-rgb), 0.25);
        }
      }
      
      @keyframes rotateBorder {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes floatUp {
        0% { 
          opacity: 0; 
          transform: translateY(20px) scale(0.8); 
        }
        50% { 
          opacity: 1; 
          transform: translateY(-10px) scale(1.1); 
        }
        100% { 
          opacity: 0; 
          transform: translateY(-40px) scale(0.9); 
        }
      }

      @keyframes pulseGlow {
        0%, 100% { 
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
        }
        50% { 
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
        }
      }

      /* Enhanced utility classes */
      .animate-glow-pulse {
        animation: glowPulse 3s ease-in-out infinite;
      }

      .animate-rotate-border {
        animation: rotateBorder 2s linear infinite;
      }

      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out;
      }

      .animate-shimmer {
        animation: shimmer 2s ease-in-out infinite;
      }

      .animate-float-up {
        animation: floatUp 2s ease-out infinite;
      }

      .animate-pulse-glow {
        animation: pulseGlow 2s ease-in-out infinite;
      }

      /* Performance optimizations */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Enhanced focus styles for accessibility */
      button:focus-visible,
      input:focus-visible,
      a:focus-visible {
        outline: 2px solid rgba(var(--white-rgb), 0.8);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(var(--white-rgb), 0.2);
      }

      /* Prevent layout shift */
      img:not([class*="h-"]), video {
        max-width: 100%;
        height: auto;
      }

      /* Enhanced selection styles - Monochrome */
      ::selection {
        background: rgba(var(--white-rgb), 0.2);
        color: var(--primary-black);
      }

      ::-moz-selection {
        background: rgba(var(--white-rgb), 0.2);
        color: var(--primary-black);
      }

      /* Premium glass morphism utilities */
      .glass-effect {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .glass-effect-dark {
        backdrop-filter: blur(20px);
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      /* Enhanced mobile optimizations */
      @media (max-width: 768px) {
        /* Disable hover effects on mobile */
        .group:hover .group-hover\\:scale-105 {
          transform: none;
        }
        
        /* Optimize touch targets */
        button, a {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Reduce motion for better mobile performance */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        :root {
          --shadow-light: rgba(255, 255, 255, 0.3);
          --shadow-dark: rgba(0, 0, 0, 0.7);
        }
        
        .glass-effect,
        .glass-effect-dark {
          border-width: 2px;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    `}</style>
  )
}
