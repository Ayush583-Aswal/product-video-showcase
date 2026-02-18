import { useRef, useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";

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

const getYoutubeEmbedUrl = (url, isMuted) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const mute = isMuted ? 1 : 0;
    const query = `autoplay=1&mute=${mute}&playsinline=1&controls=1&rel=0&modestbranding=1&fs=0&iv_load_policy=3&cc_load_policy=0`;

    if (host === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube-nocookie.com/embed/${id}?${query}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}?${query}` : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1];
        return id ? `https://www.youtube-nocookie.com/embed/${id}?${query}` : null;
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
    if (path.endsWith("/")) path = path.slice(0, -1);

    if (path.includes("/reel/")) {
      const reelId = path.split("/reel/")[1].split("/")[0];
      if (reelId) return `https://www.instagram.com/reel/${reelId}/embed/`;
    } else if (path.includes("/p/")) {
      const postId = path.split("/p/")[1].split("/")[0];
      if (postId) return `https://www.instagram.com/p/${postId}/embed/`;
    }
  } catch {
    return null;
  }

  return null;
};

const getFacebookEmbedUrl = (url, isMuted) => {
  try {
    const mute = isMuted ? "true" : "false";
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=1&mute=${mute}`;
  } catch {
    return null;
  }
};

const getEmbedUrl = (provider, url, isMuted) => {
  if (!url) return null;
  if (provider === "youtube") return getYoutubeEmbedUrl(url, isMuted);
  if (provider === "instagram") return getInstagramEmbedUrl(url);
  if (provider === "facebook") return getFacebookEmbedUrl(url, isMuted);
  return null;
};

const VideoCard = ({ video, isActive, isFirst, isMuted, onToggleMuted, sellerId }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(isFirst);
  const provider = normalizeProvider(video.source, video.url);
  const embedUrl = getEmbedUrl(provider, video.url, isMuted);
  const isNativeVideo = provider === "file" || !embedUrl;
  const description = video.description?.trim() || "";
  const postedAgo = video.postedAgo || "recently";
  const relatedProducts = Array.isArray(video.relatedProducts) ? video.relatedProducts : [];
  const videoId = String(video.id);

  const handleMuteToggle = (event) => {
    event.stopPropagation();
    onToggleMuted();
    trackEvent("mute_toggle", {
      seller_id: sellerId,
      video_id: videoId,
      mute_state: isMuted ? "unmuted" : "muted",
    });
  };

  const handleContactSupplierClick = () => {
    trackEvent("contact_supplier_click", {
      seller_id: sellerId,
      video_id: videoId,
    });
  };

  const handleMoreDetailToggle = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    trackEvent("more_detail_click", {
      seller_id: sellerId,
      video_id: videoId,
      expanded: nextExpanded,
    });
  };

  const muteButton = (
    <button
      onClick={handleMuteToggle}
      className="w-7 h-7 bg-secondary/80 rounded-full flex items-center justify-center flex-shrink-0"
      aria-label={isMuted ? "Unmute videos" : "Mute videos"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );

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
    if (!isNativeVideo || !videoRef.current) return;
    videoRef.current.muted = isMuted;
  }, [isMuted, isNativeVideo]);

  useEffect(() => {
    if (!isFirst) return;
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, [isFirst]);

  useEffect(() => {
    if (isFirst && !isActive) setShowHint(false);
  }, [isFirst, isActive]);

  return (
    <div className="w-full h-dvh snap-start snap-always flex-shrink-0 bg-background flex flex-col">
      <div className="relative flex-1 min-h-0 bg-black">
        {isNativeVideo ? (
          <video
            ref={videoRef}
            src={video.url}
            className="absolute inset-0 w-full h-full object-contain"
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            controls
            controlsList="nofullscreen nodownload noplaybackrate"
            disablePictureInPicture
          />
        ) : (
          <iframe
            key={`${video.id}-${isActive}-${isMuted}`}
            className="absolute inset-0 w-full h-full border-0"
            src={isActive && embedUrl ? embedUrl : "about:blank"}
            title={video.title}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            style={{ pointerEvents: isActive ? "auto" : "none" }}
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
          onClick={handleMoreDetailToggle}
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

        <div className="px-3 py-2">
          <div className={`flex gap-2 ${expanded ? "items-start" : "items-center"}`}>
            <div className="min-w-0 flex-1">
              <p className={`text-foreground text-[11px] font-semibold leading-snug ${expanded ? "line-clamp-3" : "truncate"}`}>
                {video.title}
              </p>
              <p className="text-foreground/70 text-[9px] mt-1 leading-none">
                Posted {postedAgo}
              </p>
            </div>

            {!expanded && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleContactSupplierClick}
                  className="h-7 px-2.5 bg-gradient-to-r from-teal-600 to-emerald-700 text-white text-[10px] font-semibold rounded-md whitespace-nowrap active:scale-[0.99] transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  Contact Supplier
                </button>
                {muteButton}
              </div>
            )}
          </div>

          {expanded && (
            <div className="mt-2.5 animate-fade-in rounded-md border border-border/60 bg-secondary/20 p-2.5">
              {description && <p className="text-foreground/75 text-[10px] leading-snug">{description}</p>}

              {relatedProducts.length > 0 && (
                <div className={`${description ? "mt-2.5" : ""}`}>
                  <p className="text-muted-foreground/80 text-[9px] uppercase tracking-wide mb-2">Related Products</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {relatedProducts.map((product, index) => (
                      <article
                        key={product.id || `${video.id}-${index}`}
                        onClick={() =>
                          trackEvent("related_product_click", {
                            seller_id: sellerId,
                            video_id: videoId,
                            product_id: String(product.id || `${video.id}-${index}`),
                          })
                        }
                        className="w-28 bg-secondary/30 border border-border/60 rounded-md overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name || "Related product"}
                          className="w-full h-20 object-cover bg-muted/40"
                          loading="lazy"
                        />
                        <div className="px-2 py-1.5">
                          <p className="text-foreground text-[10px] font-semibold leading-tight">{product.price || ""}</p>
                          <p className="text-foreground/80 text-[9px] leading-tight mt-1 line-clamp-2">
                            {product.name || "Product"}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                {muteButton}
                <button
                  onClick={handleContactSupplierClick}
                  className="h-7 px-3 bg-gradient-to-r from-teal-600 to-emerald-700 text-white text-[10px] font-semibold rounded-md whitespace-nowrap active:scale-[0.99] transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  Contact Supplier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
