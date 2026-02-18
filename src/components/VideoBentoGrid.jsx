import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useResolvedVideos from "../hooks/useResolvedVideos";
import { cn } from "../lib/utils";

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

  return (
    <section className="h-full overflow-y-auto bg-gradient-to-b from-zinc-700 to-zinc-800 px-2 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto w-full max-w-[720px] border border-zinc-700 bg-[#070707] p-2 sm:p-3">
        <div className="columns-2 gap-2 sm:gap-3">
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
                  navigate(`/feed/${video.id}`);
                }}
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                onFocus={() => setHoveredVideoId(video.id)}
                onBlur={() => setHoveredVideoId(null)}
                onTouchStart={() => {
                  if (isTouchDevice) setSelectedVideoId(video.id);
                }}
                className={cn(
                  "group relative mb-2 block w-full break-inside-avoid overflow-hidden border border-zinc-800 bg-card text-left sm:mb-3",
                  "transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.01]",
                  isActive && "z-10 -translate-y-1 scale-[1.01]",
                )}
              >
                <img
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt={video.title || "Video thumbnail"}
                  loading="lazy"
                  className="block w-full h-auto"
                />

                <div className={cn("absolute inset-0 transition-colors duration-200", isActive ? "bg-black/35" : "bg-black/20 group-hover:bg-black/35")} />

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm sm:h-10 sm:w-10">
                    <svg className="ml-0.5 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>

                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2.5 transition-all duration-200",
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                  )}
                >
                  <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground">{video.title || "Video"}</p>
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
