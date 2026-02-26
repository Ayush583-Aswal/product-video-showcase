import { useRef, useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import "../styles/video-card.css";

let youtubeApiPromise;

const loadYouTubeIframeApi = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("window unavailable"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };
  });

  return youtubeApiPromise;
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

const getYoutubeEmbedUrl = (url, isMuted) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const mute = isMuted ? 1 : 0;
    const params = new URLSearchParams({
      autoplay: "1",
      mute: String(mute),
      playsinline: "1",
      controls: "1",
      rel: "0",
      modestbranding: "1",
      fs: "0",
      iv_load_policy: "3",
      cc_load_policy: "0",
      enablejsapi: "1",
      origin: typeof window !== "undefined" ? window.location.origin : "",
    });
    const query = params.toString();

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
  const iframeRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytPlaybackStartRef = useRef(null);
  const playbackStartRef = useRef(null);
  const inferredStartRef = useRef(null);
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
  const providerForTracking = provider || "unknown";
  const supportsInferredIframeTracking = !isNativeVideo && (provider === "instagram" || provider === "facebook");
  const isYouTubeEmbed = provider === "youtube" && !isNativeVideo;

  const flushNativePlaybackSegment = (reason) => {
    if (!playbackStartRef.current) return;
    const watchedMs = Math.max(0, Date.now() - playbackStartRef.current);
    playbackStartRef.current = null;

    trackEvent("video_pause", {
      seller_id: sellerId,
      video_id: videoId,
      provider: providerForTracking,
      reason,
      watched_ms: watchedMs,
    });
  };

  const flushInferredIframeSegment = (reason) => {
    if (!inferredStartRef.current) return;
    const watchedMs = Math.max(0, Date.now() - inferredStartRef.current);
    inferredStartRef.current = null;

    trackEvent("video_pause_inferred", {
      seller_id: sellerId,
      video_id: videoId,
      provider: providerForTracking,
      reason,
      watched_ms: watchedMs,
    });
  };

  const flushYouTubePlaybackSegment = (reason) => {
    if (!ytPlaybackStartRef.current) return;
    const watchedMs = Math.max(0, Date.now() - ytPlaybackStartRef.current);
    ytPlaybackStartRef.current = null;

    trackEvent("video_pause", {
      seller_id: sellerId,
      video_id: videoId,
      provider: "youtube",
      reason,
      watched_ms: watchedMs,
    });
  };

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
      className="video-card-mute-button"
      aria-label={isMuted ? "Unmute videos" : "Mute videos"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <svg className="video-card-mute-icon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="video-card-mute-icon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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

    const element = videoRef.current;

    const handlePlay = () => {
      playbackStartRef.current = Date.now();
      setPaused(false);
      trackEvent("video_play", {
        seller_id: sellerId,
        video_id: videoId,
        provider: providerForTracking,
      });
    };

    const handlePause = () => {
      setPaused(true);
      flushNativePlaybackSegment("pause");
    };

    const handleEnded = () => {
      flushNativePlaybackSegment("ended");
    };

    element.addEventListener("play", handlePlay);
    element.addEventListener("pause", handlePause);
    element.addEventListener("ended", handleEnded);

    return () => {
      element.removeEventListener("play", handlePlay);
      element.removeEventListener("pause", handlePause);
      element.removeEventListener("ended", handleEnded);
    };
  }, [isNativeVideo, sellerId, videoId, providerForTracking]);

  useEffect(() => {
    if (!supportsInferredIframeTracking) return;

    if (isActive && !inferredStartRef.current) {
      inferredStartRef.current = Date.now();
      trackEvent("video_play_inferred", {
        seller_id: sellerId,
        video_id: videoId,
        provider: providerForTracking,
      });
      return;
    }

    if (!isActive) {
      flushInferredIframeSegment("inactive");
    }
  }, [isActive, supportsInferredIframeTracking, sellerId, videoId, providerForTracking]);

  useEffect(() => {
    if (!isYouTubeEmbed || !iframeRef.current || !isActive) return;

    let cancelled = false;

    const setupYouTubePlayer = async () => {
      try {
        const YT = await loadYouTubeIframeApi();
        if (cancelled || !iframeRef.current) return;

        ytPlayerRef.current = new YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                ytPlaybackStartRef.current = Date.now();
                trackEvent("video_play", {
                  seller_id: sellerId,
                  video_id: videoId,
                  provider: "youtube",
                });
              } else if (event.data === YT.PlayerState.PAUSED) {
                flushYouTubePlaybackSegment("pause");
              } else if (event.data === YT.PlayerState.ENDED) {
                flushYouTubePlaybackSegment("ended");
              }
            },
          },
        });
      } catch {
        // Best-effort only; keep player rendering even if API setup fails.
      }
    };

    setupYouTubePlayer();

    return () => {
      cancelled = true;
      flushYouTubePlaybackSegment("unmount");
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy();
      }
      ytPlayerRef.current = null;
    };
  }, [isYouTubeEmbed, isActive, sellerId, videoId]);

  useEffect(() => {
    return () => {
      flushNativePlaybackSegment("unmount");
      flushInferredIframeSegment("unmount");
      flushYouTubePlaybackSegment("unmount");
    };
  }, []);

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
    <div className="video-card">
      <div className="video-card-media">
        {isNativeVideo ? (
          <video
            ref={videoRef}
            src={video.url}
            className="video-card-media-element"
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
            ref={iframeRef}
            key={`${video.id}-${isActive}-${isMuted}`}
            className="video-card-media-element video-card-iframe"
            src={isActive && embedUrl ? embedUrl : "about:blank"}
            title={video.title}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            style={{ pointerEvents: isActive ? "auto" : "none" }}
          />
        )}

        {isNativeVideo && paused && (
          <div className="video-card-paused-overlay">
            <div className="video-card-paused-pill">
              <svg className="video-card-paused-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {showHint && (
          <div className="video-card-scroll-hint animate-scroll-hint">
            <svg className="video-card-scroll-icon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="video-card-scroll-label">Swipe</span>
          </div>
        )}
      </div>

      <div className="video-card-panel">
        <button
          onClick={handleMoreDetailToggle}
          className="video-card-expand-toggle"
        >
          <svg
            className={`video-card-expand-icon${expanded ? " is-expanded" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <div className="video-card-content">
          <div className={`video-card-header${expanded ? " is-expanded" : ""}`}>
            <div className="video-card-title-wrap">
              <p className={`video-card-title${expanded ? " is-expanded" : ""}`}>
                {video.title}
              </p>
              <p className="video-card-posted">
                Posted {postedAgo}
              </p>
            </div>

            {!expanded && (
              <div className="video-card-inline-actions">
                <button
                  onClick={handleContactSupplierClick}
                  className="video-card-contact-button"
                >
                  Contact Supplier
                </button>
                {muteButton}
              </div>
            )}
          </div>

          {expanded && (
            <div className="video-card-expanded animate-fade-in">
              {description && <p className="video-card-description">{description}</p>}

              {relatedProducts.length > 0 && (
                <div className={description ? "video-card-related has-margin" : "video-card-related"}>
                  <p className="video-card-related-label">Related Products</p>
                  <div className="video-card-related-list hide-scrollbar">
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
                        className="video-card-related-item"
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name || "Related product"}
                          className="video-card-related-image"
                          loading="lazy"
                        />
                        <div className="video-card-related-content">
                          <p className="video-card-related-price">{product.price || ""}</p>
                          <p className="video-card-related-name">
                            {product.name || "Product"}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="video-card-expanded-footer">
                {muteButton}
                <button
                  onClick={handleContactSupplierClick}
                  className="video-card-contact-button video-card-contact-button--wide"
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
