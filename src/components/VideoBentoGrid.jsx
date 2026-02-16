import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useResolvedVideos from "../hooks/useResolvedVideos";
import { cn } from "../lib/utils";

const getTileSpan = (video, index) => {
  const width = Number(video.mediaWidth) || 0;
  const height = Number(video.mediaHeight) || 0;
  const isPortrait = width > 0 && height > width;
  const pattern = index % 8;

  if (pattern === 0) return isPortrait ? "col-span-1 row-span-3" : "col-span-1 row-span-2";
  if (pattern === 1) return "col-span-1 row-span-2";
  if (pattern === 2) return "col-span-1 row-span-2";
  if (pattern === 3) return "col-span-2 row-span-2";
  if (pattern === 4) return isPortrait ? "col-span-1 row-span-3" : "col-span-1 row-span-2";
  if (pattern === 5) return "col-span-1 row-span-2";
  if (pattern === 6) return "col-span-1 row-span-2";
  if (pattern === 7) return "col-span-1 row-span-2";

  return "col-span-1 row-span-2";
};

const VideoBentoGrid = () => {
  const navigate = useNavigate();
  const videos = useResolvedVideos();
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchDevice(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const openVideo = (videoId) => navigate(`/feed/${videoId}`);

  return (
    <section className="h-full overflow-y-auto bg-gradient-to-b from-zinc-700 to-zinc-800 px-2 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto w-full max-w-[620px] border border-zinc-700 bg-[#070707] p-2 sm:p-3">
        <div
          className="grid grid-flow-dense grid-cols-2 auto-rows-[74px] gap-2 bg-zinc-900/45 p-1 sm:auto-rows-[86px] sm:gap-3 sm:p-1.5"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => {
                if (isTouchDevice && selectedVideoId !== video.id) {
                  setSelectedVideoId(video.id);
                  return;
                }
                openVideo(video.id);
              }}
              onMouseEnter={() => setHoveredVideoId(video.id)}
              onMouseLeave={() => setHoveredVideoId(null)}
              onFocus={() => setHoveredVideoId(video.id)}
              onBlur={() => setHoveredVideoId(null)}
              onTouchStart={() => {
                if (isTouchDevice) setSelectedVideoId(video.id);
              }}
              className={cn(
                "group relative overflow-hidden rounded-none border border-zinc-800 bg-card text-left cursor-pointer",
                "transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.95)]",
                (hoveredVideoId === video.id || selectedVideoId === video.id) &&
                  "z-10 -translate-y-1 scale-[1.02] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.95)]",
                getTileSpan(video, index),
              )}
            >
              <img
                src={video.thumbnailUrl || "/placeholder.svg"}
                alt={video.title || "Video thumbnail"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/20 transition-colors duration-200 group-hover:bg-black/38" />

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm sm:h-12 sm:w-12">
                  <svg className="ml-0.5 h-4 w-4 text-white sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>

              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3 transition-all duration-200",
                  hoveredVideoId === video.id || selectedVideoId === video.id
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2",
                )}
              >
                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground">
                  {video.title || "Video"}
                </p>
              </div>
            </button>
          ))}

          <div className="col-span-1 row-span-1 border border-zinc-800/80 bg-gradient-to-br from-zinc-800/50 to-zinc-900/80" aria-hidden="true" />
          <div className="col-span-1 row-span-1 border border-zinc-800/80 bg-gradient-to-br from-zinc-900/65 to-black/90" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default VideoBentoGrid;
