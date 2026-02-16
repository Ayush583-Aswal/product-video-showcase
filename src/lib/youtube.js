export const isYouTubeUrl = (url = "") => {
  const value = url.toLowerCase();
  return value.includes("youtube.com") || value.includes("youtu.be");
};

export const extractYouTubeVideoId = (url) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtu.be") {
      return parsed.pathname.replace("/", "") || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/shorts/")[1] || null;
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/embed/")[1] || null;
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeThumbnailUrl = (url) => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
};

const fetchYouTubeDataApiMetadata = async (videoId, apiKey) => {
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint);
  if (!response.ok) return null;

  const payload = await response.json();
  const snippet = payload?.items?.[0]?.snippet;
  if (!snippet?.title) return null;
  const thumbnails = snippet?.thumbnails || {};
  const bestThumbnail = thumbnails?.maxres || thumbnails?.standard || thumbnails?.high || thumbnails?.medium || thumbnails?.default;

  return {
    title: snippet.title,
    description: snippet.description || "",
    publishedAt: snippet.publishedAt || null,
    thumbnailUrl: bestThumbnail?.url || null,
    thumbnailWidth: bestThumbnail?.width || null,
    thumbnailHeight: bestThumbnail?.height || null,
  };
};

const fetchYouTubeOEmbedMetadata = async (url) => {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(endpoint);
  if (!response.ok) return null;

  const payload = await response.json();
  if (!payload?.title) return null;

  return {
    title: payload.title,
    description: "",
    publishedAt: null,
    thumbnailUrl: payload.thumbnail_url || null,
    thumbnailWidth: payload.thumbnail_width || null,
    thumbnailHeight: payload.thumbnail_height || null,
  };
};

export const fetchYouTubeMetadata = async (url) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const data = await fetchYouTubeDataApiMetadata(videoId, apiKey);
      if (data) return data;
    } catch {
      // fall through to oEmbed fallback
    }
  }

  try {
    return await fetchYouTubeOEmbedMetadata(url);
  } catch {
    return null;
  }
};
