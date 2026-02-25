const SESSION_KEY = "pv_session_id";

const getSessionId = () => {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return "session-unavailable";
  }
};

const isReady = () => typeof window !== "undefined" && typeof window.gtag === "function";

export const initGA = () => {
  if (typeof window === "undefined") return;
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || window.__gaInitialized) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
  window.__gaInitialized = true;
};

export const trackPageView = (path) => {
  const payload = {
    page_path: path,
    session_id: getSessionId(),
  };
  console.log("[analytics] page_view", payload);

  if (!isReady()) return;
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  window.gtag("config", measurementId, payload);
};

export const trackEvent = (eventName, params = {}) => {
  const payload = {
    ...params,
    session_id: getSessionId(),
  };
  console.log("[analytics] event", eventName, payload);

  if (!isReady()) return;
  window.gtag("event", eventName, payload);
};
