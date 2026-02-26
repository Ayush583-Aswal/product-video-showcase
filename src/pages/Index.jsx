import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import VideoBentoGrid from "../components/VideoBentoGrid";
import "../styles/pages.css";

const DEFAULT_TEST_SELLER_ID = "codex-test-seller";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("seller")) return;
    const next = new URLSearchParams(searchParams);
    next.set("seller", DEFAULT_TEST_SELLER_ID);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="page-shell">
      <VideoBentoGrid />
    </div>
  );
};

export default Index;
