import { useRef, useState, useEffect, useCallback } from "react";
import VideoCard from "./VideoCard";
import useResolvedVideos from "../hooks/useResolvedVideos";

const VideoFeed = ({ initialVideoId }) => {
  const containerRef = useRef(null);
  const didSetInitialPositionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedVideos = useResolvedVideos();
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

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (didSetInitialPositionRef.current) return;
    if (!containerRef.current || resolvedVideos.length === 0) return;

    const targetId = initialVideoId ? String(initialVideoId) : null;
    const initialIndex = targetId
      ? Math.max(
          0,
          resolvedVideos.findIndex((video) => String(video.id) === targetId),
        )
      : 0;

    const height = containerRef.current.clientHeight || window.innerHeight;
    containerRef.current.scrollTop = initialIndex * height;
    setActiveIndex(initialIndex);
    didSetInitialPositionRef.current = true;
  }, [initialVideoId, resolvedVideos]);

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
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
