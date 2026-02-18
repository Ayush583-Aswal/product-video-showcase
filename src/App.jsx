import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index.jsx";
import Feed from "./pages/Feed.jsx";
import NotFound from "./pages/NotFound.jsx";
import { trackPageView } from "./lib/analytics";

const queryClient = new QueryClient();

const AnalyticsPageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AnalyticsPageTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/feed/:videoId" element={<Feed />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
