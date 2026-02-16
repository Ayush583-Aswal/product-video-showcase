import { useNavigate } from "react-router-dom";
import useResolvedVideos from "../hooks/useResolvedVideos";
import { cn } from "../lib/utils";

const getTileSpan = (video, index) => {
  const width = Number(video.mediaWidth) || 0;
  const height = Number(video.mediaHeight) || 0;
  const isPortrait = width > 0 && height > width;
  const pattern = index % 7;

  if (pattern === 0) return "col-span-1 row-span-4";
  if (pattern === 1) return "col-span-1 row-span-2";
  if (pattern === 2) return "col-span-1 row-span-3";
  if (pattern === 3) return "col-span-2 row-span-2";
  if (pattern === 4) return isPortrait ? "col-span-1 row-span-4" : "col-span-1 row-span-3";
  if (pattern === 5) return "col-span-1 row-span-2";
  if (pattern === 6) return "col-span-2 row-span-2";

  return "col-span-1 row-span-3";
};

const VideoBentoGrid = () => {
  const navigate = useNavigate();
  const videos = useResolvedVideos();

  return (
    <section className="h-full overflow-y-auto bg-zinc-700/70 px-3 py-3 sm:px-5 sm:py-4">
      <div className="mx-auto w-full max-w-[620px] rounded-none bg-[#050505] p-3 sm:rounded-xl sm:p-4">
        <div className="grid grid-cols-2 auto-rows-[78px] gap-3 sm:auto-rows-[92px] sm:gap-4">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => navigate(`/feed/${video.id}`)}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-card text-left shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]",
                getTileSpan(video, index),
              )}
            >
              <img
                src={video.thumbnailUrl || "/placeholder.svg"}
                alt={video.title || "Video thumbnail"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/20 transition-colors duration-200 group-hover:bg-black/35" />

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                  <svg className="ml-0.5 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground">
                  {video.title || "Video"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoBentoGrid;
