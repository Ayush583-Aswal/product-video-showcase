import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useResolvedVideos from "../hooks/useResolvedVideos";
import { trackEvent } from "../lib/analytics";
import "../styles/video-bento-grid.css";

const VideoBentoGrid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videos = useResolvedVideos();
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const sellerId = new URLSearchParams(location.search).get("seller") || "codex-test-seller";

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchDevice(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section className="video-bento">
      <div className="video-bento-shell">
        <div className="video-bento-grid">
          {videos.map((video) => {
            const isActive = hoveredVideoId === video.id || selectedVideoId === video.id;
            return (
              <button
                key={video.id}
                onClick={() => {
                  if (isTouchDevice && selectedVideoId !== video.id) {
                    setSelectedVideoId(video.id);
                    return;
                  }
                  trackEvent("landing_video_click", {
                    seller_id: sellerId,
                    video_id: String(video.id),
                    page: "landing",
                  });
                  navigate(`/feed/${video.id}${location.search || ""}`);
                }}
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                onFocus={() => setHoveredVideoId(video.id)}
                onBlur={() => setHoveredVideoId(null)}
                onTouchStart={() => {
                  if (isTouchDevice) setSelectedVideoId(video.id);
                }}
                className={`video-bento-card${isActive ? " is-active" : ""}`}
              >
                <img
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt={video.title || "Video thumbnail"}
                  loading="lazy"
                  className="video-bento-image"
                />

                <div className={`video-bento-overlay${isActive ? " is-active" : ""}`} />

                <div className="video-bento-center">
                  <span className="video-bento-play-pill">
                    <svg className="video-bento-play-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>

                <div className={`video-bento-caption${isActive ? " is-active" : ""}`}>
                  <p className="video-bento-title">{video.title || "Video"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VideoBentoGrid;
