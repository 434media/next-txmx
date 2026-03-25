"use client"

const VIDEO_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FBruno%20Eddie%20Reel.mp4?alt=media"

export default function EightCountVideo() {
  return (
    <div className="absolute inset-0 md:relative md:w-1/2 bg-black">
      <video
        src={VIDEO_SRC}
        preload="metadata"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="w-full h-full object-cover object-center"
      />
      <div
        className="absolute inset-0 hidden md:block pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 15%, transparent 35%)",
        }}
      />
      {/* Bottom gradient for hero-to-feed transition */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
        }}
      />
    </div>
  )
}
