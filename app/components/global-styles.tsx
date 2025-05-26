"use client"

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      /* Enhanced CSS Variables for Mexican Flag Colors */
      :root {
        --mexican-green: #006847;
        --mexican-red: #ce1126;
        --mexican-white: #ffffff;
        --mexican-green-rgb: 0, 104, 71;
        --mexican-red-rgb: 206, 17, 38;
        --mexican-green-light: #007a56;
        --mexican-red-light: #e01e42;
      }

      /* Smooth scrolling for the entire page */
      html {
        scroll-behavior: smooth;
      }

      /* Enhanced custom scrollbar styling */
      ::-webkit-scrollbar {
        width: 10px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 5px;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, var(--mexican-green), var(--mexican-red));
        border-radius: 5px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, var(--mexican-green-light), var(--mexican-red-light));
        box-shadow: 0 0 10px rgba(var(--mexican-green-rgb), 0.5);
      }

      /* Font family utilities */
      .font-sans {
        font-family: var(--font-geist-sans), system-ui, sans-serif;
      }

      .font-mono {
        font-family: var(--font-geist-mono), 'Courier New', monospace;
      }

      /* Enhanced animation keyframes */
      @keyframes glowPulse {
        0%, 100% { 
          box-shadow: 
            0 0 20px rgba(var(--mexican-green-rgb), 0.3),
            0 0 40px rgba(var(--mexican-red-rgb), 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        50% { 
          box-shadow: 
            0 0 35px rgba(var(--mexican-green-rgb), 0.5),
            0 0 70px rgba(var(--mexican-red-rgb), 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
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

      /* Performance optimizations */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Enhanced focus styles for accessibility */
      button:focus-visible,
      input:focus-visible,
      a:focus-visible {
        outline: 2px solid var(--mexican-green);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(var(--mexican-green-rgb), 0.2);
      }

      /* Prevent layout shift */
      img, video {
        max-width: 100%;
        height: auto;
      }

      /* Enhanced selection styles */
      ::selection {
        background: linear-gradient(135deg, var(--mexican-green), var(--mexican-red));
        color: white;
      }

      ::-moz-selection {
        background: linear-gradient(135deg, var(--mexican-green), var(--mexican-red));
        color: white;
      }
    `}</style>
  )
}
