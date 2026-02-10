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
    <div className="relative w-full h-screen snap-start snap-always flex-shrink-0 bg-background">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Pause indicator */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-background/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        {/* Mute toggle */}
        <button onClick={toggleMute} className="w-10 h-10 bg-background/30 backdrop-blur-sm rounded-full flex items-center justify-center">
          {muted ? (
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Share */}
        <button className="w-10 h-10 bg-background/30 backdrop-blur-sm rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6"
        style={{ background: "linear-gradient(to top, hsl(0 0% 0% / 0.85), transparent)" }}
      >
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground text-xs font-bold border border-border">
            {video.sellerLogo?.charAt(0) || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-semibold truncate">{video.sellerName}</p>
          </div>
          <SourceBadge source={video.source} />
        </div>

        {/* Title */}
        <p className="text-foreground/90 text-xs leading-relaxed line-clamp-2">
          {video.title}
        </p>

        {/* Posted time */}
        <p className="text-muted-foreground text-[10px] mt-1">{video.postedAgo}</p>

        {/* Contact button */}
        <button className="mt-3 w-full bg-accent text-accent-foreground text-sm font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-transform">
          Contact Supplier
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
