import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agenda de Entregas",
    short_name: "Entregas",
    description: "Agenda de entregas del taller en tiempo real",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
