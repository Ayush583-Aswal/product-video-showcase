import { useSearchParams, useParams } from "react-router-dom";
import VideoFeed from "../components/VideoFeed";
import "../styles/pages.css";

const DEFAULT_TEST_SELLER_ID = "codex-test-seller";

const Feed = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get("seller") || DEFAULT_TEST_SELLER_ID;

  return (
    <div className="page-shell">
      <VideoFeed initialVideoId={videoId} sellerId={sellerId} />
    </div>
  );
};

export default Feed;
