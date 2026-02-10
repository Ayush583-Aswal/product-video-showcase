import { useRef, useState, useEffect } from "react";

const SourceBadge = ({ source }) => {
  const config = {
    youtube: { label: "YouTube", colorClass: "bg-youtube" },
    instagram: { label: "Instagram", colorClass: "bg-instagram" },
    facebook: { label: "Facebook", colorClass: "bg-facebook" },
  };

  const { label, colorClass } = config[source] || config.youtube;

  return (
    <span className={`${colorClass} text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
      {label}
    </span>
  );
};

const VideoCard = ({ video, isActive }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted((m) => !m);
  };

  return (
    <div className="w-full h-screen snap-start snap-always flex-shrink-0 bg-background flex flex-col">
      {/* Video area — takes remaining space, no overlays */}
      <div className="relative flex-1 min-h-0 bg-black" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={video.url}
          className="absolute inset-0 w-full h-full object-contain"
          loop
          muted={muted}
          playsInline
          preload="metadata"
        />

        {/* Pause indicator — only visual hint, not text overlay */}
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 bg-background/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar — completely separate from video */}
      <div className="bg-card px-4 py-3 flex flex-col gap-2 border-t border-border">
        {/* Seller row */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground text-[10px] font-bold border border-border flex-shrink-0">
            {video.sellerLogo?.charAt(0) || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-semibold truncate">{video.sellerName}</p>
            <p className="text-muted-foreground text-[10px]">{video.postedAgo}</p>
          </div>
          <SourceBadge source={video.source} />
          {/* Mute toggle */}
          <button onClick={toggleMute} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
            {muted ? (
              <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>

        {/* Title */}
        <p className="text-foreground/80 text-xs leading-relaxed line-clamp-2">
          {video.title}
        </p>

        {/* Contact button */}
        <button className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-transform">
          Contact Supplier
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
