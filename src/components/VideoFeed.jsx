import { useRef, useState, useEffect, useCallback } from "react";
import VideoCard from "./VideoCard";
import useResolvedVideos from "../hooks/useResolvedVideos";
import { trackEvent } from "../lib/analytics";

const VideoFeed = ({ initialVideoId, sellerId }) => {
  const containerRef = useRef(null);
  const didSetInitialPositionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedVideos = useResolvedVideos();
  const [isMuted, setIsMuted] = useState(true);
  const activeVideoIdRef = useRef(null);
  const activeStartTimeRef = useRef(null);
  const totalFeedTimeMsRef = useRef(0);
  const viewedVideosRef = useRef(new Set());
  const didSendSummaryRef = useRef(false);

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

  const flushActiveVideo = useCallback(
    (exitReason, now = Date.now()) => {
      if (!activeVideoIdRef.current || !activeStartTimeRef.current) return;

      const durationMs = Math.max(0, now - activeStartTimeRef.current);
      if (durationMs <= 0) return;

      totalFeedTimeMsRef.current += durationMs;
      trackEvent("video_focus_end", {
        seller_id: sellerId,
        video_id: activeVideoIdRef.current,
        duration_ms: durationMs,
        exit_reason: exitReason,
      });
      activeStartTimeRef.current = null;
    },
    [sellerId],
  );

  useEffect(() => {
    const current = resolvedVideos[activeIndex];
    if (!current) return;

    const now = Date.now();
    const nextVideoId = String(current.id);

    if (!activeVideoIdRef.current) {
      activeVideoIdRef.current = nextVideoId;
      activeStartTimeRef.current = now;
      viewedVideosRef.current.add(nextVideoId);
      trackEvent("video_focus_start", {
        seller_id: sellerId,
        video_id: nextVideoId,
      });
      return;
    }

    if (activeVideoIdRef.current === nextVideoId) return;

    flushActiveVideo("scroll", now);
    activeVideoIdRef.current = nextVideoId;
    activeStartTimeRef.current = now;
    viewedVideosRef.current.add(nextVideoId);
    trackEvent("video_focus_start", {
      seller_id: sellerId,
      video_id: nextVideoId,
    });
  }, [activeIndex, resolvedVideos, sellerId, flushActiveVideo]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentVideo = resolvedVideos[activeIndex];
      if (!currentVideo) return;

      if (document.visibilityState === "hidden") {
        flushActiveVideo("hidden");
      } else if (document.visibilityState === "visible" && activeVideoIdRef.current) {
        activeStartTimeRef.current = Date.now();
      }
    };

    const handlePageHide = () => {
      flushActiveVideo("pagehide");
      if (didSendSummaryRef.current) return;

      didSendSummaryRef.current = true;
      trackEvent("feed_session_summary", {
        seller_id: sellerId,
        feed_total_ms: totalFeedTimeMsRef.current,
        videos_viewed_count: viewedVideosRef.current.size,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [activeIndex, resolvedVideos, sellerId, flushActiveVideo]);

  useEffect(() => {
    return () => {
      flushActiveVideo("unmount");
      if (didSendSummaryRef.current) return;

      didSendSummaryRef.current = true;
      trackEvent("feed_session_summary", {
        seller_id: sellerId,
        feed_total_ms: totalFeedTimeMsRef.current,
        videos_viewed_count: viewedVideosRef.current.size,
      });
    };
  }, [sellerId, flushActiveVideo]);

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
          sellerId={sellerId}
        />
      ))}
    </div>
  );
};

export default VideoFeed;
