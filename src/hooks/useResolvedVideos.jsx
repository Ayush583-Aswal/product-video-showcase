import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import videos from "../data/videos";
import { fetchYouTubeMetadata, getYouTubeThumbnailUrl, isYouTubeUrl } from "../lib/youtube";

const useResolvedVideos = () => {
  const [resolvedVideos, setResolvedVideos] = useState(videos);

  useEffect(() => {
    let cancelled = false;

    const hydrateYouTubeMetadata = async () => {
      const hydrated = await Promise.all(
        videos.map(async (video) => {
          const shouldHydrate = video.source === "youtube" || isYouTubeUrl(video.url);
          if (!shouldHydrate) {
            return {
              ...video,
              thumbnailUrl: video.thumbnailUrl || "/placeholder.svg",
              mediaWidth: video.mediaWidth || null,
              mediaHeight: video.mediaHeight || null,
            };
          }

          const metadata = await fetchYouTubeMetadata(video.url);
          const title = metadata?.title || video.title;
          const description = metadata?.description || video.description;
          const postedAgo = metadata?.publishedAt
            ? formatDistanceToNow(new Date(metadata.publishedAt), { addSuffix: true })
            : video.postedAgo;

          return {
            ...video,
            title,
            description,
            postedAgo,
            thumbnailUrl: metadata?.thumbnailUrl || getYouTubeThumbnailUrl(video.url) || "/placeholder.svg",
            mediaWidth: metadata?.thumbnailWidth || video.mediaWidth || null,
            mediaHeight: metadata?.thumbnailHeight || video.mediaHeight || null,
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

  return resolvedVideos;
};

export default useResolvedVideos;
