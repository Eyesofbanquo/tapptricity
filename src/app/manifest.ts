import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apptricity Guide",
    short_name: "Apptricity",
    description: "Interactive step-by-step guides for Apptricity procedures",
    start_url: "/",
    display: "standalone",
    background_color: "#FCF7F8",
    theme_color: "#A31621",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
