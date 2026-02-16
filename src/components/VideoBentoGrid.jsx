import { useNavigate } from "react-router-dom";
import useResolvedVideos from "../hooks/useResolvedVideos";
import { cn } from "../lib/utils";

const getTileSpan = (video, index) => {
  const width = Number(video.mediaWidth) || 0;
  const height = Number(video.mediaHeight) || 0;
  const isPortrait = width > 0 && height > width;
  const pattern = index % 7;

  if (pattern === 0) return isPortrait ? "col-span-1 row-span-4" : "col-span-1 row-span-3";
  if (pattern === 1) return "col-span-1 row-span-2";
  if (pattern === 2) return "col-span-1 row-span-2";
  if (pattern === 3) return "col-span-2 row-span-2";
  if (pattern === 4) return isPortrait ? "col-span-1 row-span-3" : "col-span-1 row-span-2";
  if (pattern === 5) return "col-span-1 row-span-2";
  if (pattern === 6) return "col-span-2 row-span-2";

  return "col-span-1 row-span-2";
};

const VideoBentoGrid = () => {
  const navigate = useNavigate();
  const videos = useResolvedVideos();

  return (
    <section className="h-full overflow-y-auto bg-gradient-to-b from-zinc-700 to-zinc-800 px-2 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto w-full max-w-[620px] border border-zinc-700 bg-[#070707] p-2 sm:p-3">
        <div className="grid grid-flow-dense grid-cols-2 auto-rows-[78px] gap-2 sm:auto-rows-[92px] sm:gap-3">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => navigate(`/feed/${video.id}`)}
              className={cn(
                "group relative overflow-hidden rounded-none border border-zinc-800 bg-card text-left",
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
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm">
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
