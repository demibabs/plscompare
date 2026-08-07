import posthog from "posthog-js";

const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined;

if (key) {
  posthog.init(key, {
    api_host: host ?? "https://us.i.posthog.com",
    defaults: "2026-05-30",
    capture_pageview: "history_change",
  });
}

export default posthog;
