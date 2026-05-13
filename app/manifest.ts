import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Motion Finance",
    short_name: "Motion",
    description: "Gestion des finances personnelles",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192-maskable.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Ajouter une transaction",
        short_name: "Transaction",
        description: "Ouvrir le formulaire d'ajout de transaction",
        url: "/?action=add-transaction",
        icons: [{ src: "/icons/icon-192.png?v=3", sizes: "192x192" }],
      },
      {
        name: "Voir le dashboard",
        short_name: "Dashboard",
        description: "Accéder au tableau de bord",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192.png?v=3", sizes: "192x192" }],
      },
    ],
    categories: ["finance", "productivity"],
  }
}
