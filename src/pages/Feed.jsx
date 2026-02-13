import { useNavigate, useParams } from "react-router-dom";
import VideoFeed from "../components/VideoFeed";

const Feed = () => {
  const navigate = useNavigate();
  const { videoId } = useParams();

  return (
    <div className="w-full h-screen bg-background overflow-hidden flex flex-col">
      <header className="h-12 px-3 flex items-center border-b border-border/60 bg-background">
        <button
          onClick={() => navigate("/")}
          className="px-2.5 py-1.5 rounded-md bg-card border border-border/70 text-xs font-semibold text-foreground"
        >
          Back
        </button>
      </header>
      <div className="flex-1 min-h-0">
        <VideoFeed initialVideoId={videoId} />
      </div>
    </div>
  );
};

export default Feed;
