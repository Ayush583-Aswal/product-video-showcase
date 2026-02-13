import { useRef, useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import VideoCard from "./VideoCard";
import videos from "../data/videos";
import { fetchYouTubeMetadata, isYouTubeUrl } from "../lib/youtube";

const VideoFeed = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [resolvedVideos, setResolvedVideos] = useState(videos);
  const [isMuted, setIsMuted] = useState(true);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const index = Math.round(scrollTop / height);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    // Set initial scroll position to top
    el.scrollTop = 0;
    
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Call once to set initial active index
    
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    let cancelled = false;

    const hydrateYouTubeMetadata = async () => {
      const hydrated = await Promise.all(
        videos.map(async (video) => {
          const shouldHydrate = video.source === "youtube" || isYouTubeUrl(video.url);
          if (!shouldHydrate) return video;

          const metadata = await fetchYouTubeMetadata(video.url);
          if (!metadata) return video;

          const title = metadata.title || video.title;
          const description = metadata.description || video.description;
          const postedAgo = metadata.publishedAt
            ? formatDistanceToNow(new Date(metadata.publishedAt), { addSuffix: true })
            : video.postedAgo;

          return {
            ...video,
            title,
            description,
            postedAgo,
          };
        }),
      );

      if (!cancelled) {
        setResolvedVideos(hydrated);
      }
    };

    hydrateYouTubeMetadata();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
    >
      {resolvedVideos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          isActive={index === activeIndex}
          isFirst={index === 0}
          isMuted={isMuted}
          onToggleMuted={() => setIsMuted((value) => !value)}
        />
      ))}
    </div>
  );
};

export default VideoFeed;
