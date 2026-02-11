import { useRef, useState, useEffect } from "react";

const SourceBadge = ({ source }) => {
  const config = {
    youtube: { label: "YT", colorClass: "bg-youtube" },
    instagram: { label: "IG", colorClass: "bg-instagram" },
    facebook: { label: "FB", colorClass: "bg-facebook" },
    file: { label: "VID", colorClass: "bg-secondary" },
  };

  const { label, colorClass } = config[source] || config.file;

  return (
    <span className={`${colorClass} text-foreground text-[8px] font-bold px-1.5 py-0.5 rounded`}>
      {label}
    </span>
  );
};

const normalizeProvider = (source, url) => {
  if (source === "youtube" || source === "instagram" || source === "facebook") {
    return source;
  }

  const lowerUrl = (url || "").toLowerCase();
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "youtube";
  if (lowerUrl.includes("instagram.com")) return "instagram";
  if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.watch")) return "facebook";
  return "file";
};

const getYoutubeEmbedUrl = (url) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0` : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1];
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0` : null;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const getInstagramEmbedUrl = (url) => {
  try {
    const parsed = new URL(url);
    let path = parsed.pathname;
    
    // Remove trailing slash if present
    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    
    // Extract post/reel ID from path
    if (path.includes("/reel/")) {
      const reelId = path.split("/reel/")[1].split("/")[0];
      if (reelId) {
        return `https://www.instagram.com/reel/${reelId}/embed/`;
      }
    } else if (path.includes("/p/")) {
      const postId = path.split("/p/")[1].split("/")[0];
      if (postId) {
        return `https://www.instagram.com/p/${postId}/embed/`;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const getFacebookEmbedUrl = (url) => {
  try {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=1`;
  } catch {
    return null;
  }
};

const getEmbedUrl = (provider, url) => {
  if (!url) return null;
  if (provider === "youtube") return getYoutubeEmbedUrl(url);
  if (provider === "instagram") return getInstagramEmbedUrl(url);
  if (provider === "facebook") return getFacebookEmbedUrl(url);
  return null;
};

const VideoCard = ({ video, isActive, isFirst }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(isFirst);
  const provider = normalizeProvider(video.source, video.url);
  const embedUrl = getEmbedUrl(provider, video.url);
  const isNativeVideo = provider === "file" || !embedUrl;

  useEffect(() => {
    if (!isNativeVideo || !videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      videoRef.current.pause();
      setExpanded(false);
    }
  }, [isActive, isNativeVideo]);

  useEffect(() => {
    if (!isFirst) return;
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, [isFirst]);

  useEffect(() => {
    if (isFirst && !isActive) setShowHint(false);
  }, [isFirst, isActive]);

  const togglePlay = () => {
    if (!isNativeVideo || !videoRef.current) return;
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
      <div className="relative flex-1 min-h-0 bg-black" onClick={togglePlay}>
        {isNativeVideo ? (
          <video
            ref={videoRef}
            src={video.url}
            className="absolute inset-0 w-full h-full object-contain"
            loop
            muted={muted}
            playsInline
            preload="metadata"
          />
        ) : (
          <iframe
            key={`${video.id}-${isActive}`}
            className="absolute inset-0 w-full h-full border-0"
            src={isActive && embedUrl ? embedUrl : "about:blank"}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          />
        )}

        {isNativeVideo && paused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-background/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {showHint && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none animate-scroll-hint">
            <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-foreground/50 text-[8px] font-medium tracking-wide uppercase">Swipe</span>
          </div>
        )}
      </div>

      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-center pt-1 pb-0.5"
        >
          <svg
            className={`w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <div className="px-3 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-foreground text-[8px] font-bold border border-border/50 flex-shrink-0">
              {video.sellerLogo?.charAt(0) || "S"}
            </div>

            <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
              <span className="text-foreground text-[11px] font-semibold truncate">{video.sellerName}</span>
              <span className="text-muted-foreground text-[8px] flex-shrink-0">{video.postedAgo}</span>
            </div>

            <SourceBadge source={provider} />

            {isNativeVideo && (
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
            )}

            <button className="bg-accent text-accent-foreground text-[9px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-transform flex-shrink-0">
              Contact
            </button>
          </div>

          <p className={`text-foreground/70 text-[10px] leading-snug mt-1 transition-all duration-200 ${expanded ? "" : "line-clamp-1"}`}>
            {video.title}
          </p>

          {expanded && (
            <div className="mt-1.5 animate-fade-in">
              {video.description && (
                <p className="text-muted-foreground text-[9px] leading-relaxed mb-1">
                  {video.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/60 text-[8px] capitalize">{provider}</span>
                <span className="text-muted-foreground/30 text-[8px]">.</span>
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
