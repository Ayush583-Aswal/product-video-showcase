import { useParams } from "react-router-dom";
import VideoFeed from "../components/VideoFeed";

const Feed = () => {
  const { videoId } = useParams();

  return (
    <div className="w-full h-dvh bg-background overflow-hidden">
      <VideoFeed initialVideoId={videoId} />
    </div>
  );
};

export default Feed;
