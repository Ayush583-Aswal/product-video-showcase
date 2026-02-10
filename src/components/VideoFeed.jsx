import { useRef, useState, useEffect, useCallback } from "react";
import VideoCard from "./VideoCard";
import videos from "../data/videos";

const VideoFeed = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
    >
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} isActive={index === activeIndex} />
      ))}
    </div>
  );
};

export default VideoFeed;
