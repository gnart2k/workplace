import { baseOptions } from "@/app/layout.config";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Book, Server } from "lucide-react";
import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kaneo - Project management made simple",
  description:
    "Free open source project management software for teams. Self-hosted alternative to Jira, Asana & Monday.com. Features kanban boards, time tracking, Gantt charts, and team collaboration. Docker deployment in 5 minutes.",
  alternates: {
    canonical: "https://kaneo.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kaneo.app",
    title: "Kaneo - Project management made simple",
    description:
      "Free open source project management software for teams. Self-hosted alternative to Jira, Asana & Monday.com with kanban boards, time tracking, and team collaboration.",
    siteName: "Kaneo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kaneo - Free Open Source Project Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaneo - Project management made simple",
    description:
      "Free open source project management software for teams. Self-hosted alternative to Jira, Asana & Monday.com with kanban boards, time tracking, and team collaboration.",
    images: ["/og-image.png"],
    creator: "@usekaneo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "none",
    },
  },
  metadataBase: new URL("https://kaneo.app"),
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          type: "menu",
          on: "menu",
          text: "Documentation",
          items: [
            {
              text: "Getting Started",
              url: "/docs",
              icon: <Book />,
            },
            {
              text: "Deployments",
              url: "/docs/deployments/nginx",
              icon: <Server />,
            },
          ],
        },
        {
          type: "icon",
          url: "https://github.com/usekaneo/kaneo",
          text: "GitHub",
          icon: (
            <svg
              aria-label="GitHub"
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          ),
          external: true,
        },
      ]}
    >
      <Script
        defer
        data-domain="kaneo.app"
        src="https://plausible.kaneo.app/js/script.js"
      />
      {children}
    </HomeLayout>
  );
}
