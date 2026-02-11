import { useRef, useState, useEffect } from "react";

const SourceBadge = ({ source }) => {
  const config = {
    youtube: { label: "YT", colorClass: "bg-youtube" },
    instagram: { label: "IG", colorClass: "bg-instagram" },
    facebook: { label: "FB", colorClass: "bg-facebook" },
  };

  const { label, colorClass } = config[source] || config.youtube;

  return (
    <span className={`${colorClass} text-foreground text-[8px] font-bold px-1.5 py-0.5 rounded`}>
      {label}
    </span>
  );
};

const VideoCard = ({ video, isActive, isFirst }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(isFirst);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      videoRef.current.pause();
      setExpanded(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isFirst) return;
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, [isFirst]);

  useEffect(() => {
    if (isFirst && !isActive) setShowHint(false);
  }, [isFirst, isActive]);

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
      {/* Video area — takes all available space */}
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

        {/* Pause indicator */}
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-background/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Scroll hint */}
        {showHint && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none animate-scroll-hint">
            <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-foreground/50 text-[8px] font-medium tracking-wide uppercase">Swipe</span>
          </div>
        )}
      </div>

      {/* Ultra-compact bottom bar */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50">
        {/* Tap to expand */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-center pt-1 pb-0.5"
        >
          <svg
            className={`w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <div className="px-3 pb-2">
          {/* Single compact row: avatar + name + badges + actions */}
          <div className="flex items-center gap-1.5">
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-foreground text-[8px] font-bold border border-border/50 flex-shrink-0">
              {video.sellerLogo?.charAt(0) || "S"}
            </div>

            {/* Name + time inline */}
            <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
              <span className="text-foreground text-[11px] font-semibold truncate">{video.sellerName}</span>
              <span className="text-muted-foreground text-[8px] flex-shrink-0">{video.postedAgo}</span>
            </div>

            {/* Source badge */}
            <SourceBadge source={video.source} />

            {/* Mute */}
            <button onClick={toggleMute} className="w-6 h-6 bg-secondary/80 rounded-full flex items-center justify-center flex-shrink-0">
              {muted ? (
                <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Contact — small pill */}
            <button className="bg-accent text-accent-foreground text-[9px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-transform flex-shrink-0">
              Contact
            </button>
          </div>

          {/* Title — single line, expands on toggle */}
          <p className={`text-foreground/70 text-[10px] leading-snug mt-1 transition-all duration-200 ${expanded ? "" : "line-clamp-1"}`}>
            {video.title}
          </p>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-1.5 animate-fade-in">
              {video.description && (
                <p className="text-muted-foreground text-[9px] leading-relaxed mb-1">
                  {video.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/60 text-[8px] capitalize">{video.source}</span>
                <span className="text-muted-foreground/30 text-[8px]">·</span>
                <span className="text-muted-foreground/60 text-[8px]">{video.postedAgo}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
