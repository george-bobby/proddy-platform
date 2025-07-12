import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { PropsWithChildren } from "react";
import { Analytics } from '@vercel/analytics/next';
import { ConvexClientProvider } from "@/config/convex-client-provider";
import { JotaiProvider } from "@/components/jotai-provider";
import { ModalProvider } from "@/components/modal-provider";
import { Toaster } from "@/components/ui/sonner";
import { TidioChat } from "@/components/tidio-chat";
import { UsetifulProvider } from "@/components/usetiful-provider";
import { siteConfig } from "@/config";

import * as Sentry from '@sentry/nextjs';
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4A0D68",
};

// Add generateMetadata function to include Sentry trace data
export function generateMetadata(): Metadata {
  return {
    ...siteConfig,
    title: "Proddy - Your Team's Second Brain",
    description:
      "A vibrant team collaboration platform with real-time messaging, rich text editing, and emoji support.",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Proddy",
    },
    applicationName: "Proddy",
    formatDetection: {
      telephone: false,
    },
    other: {
      ...Sentry.getTraceData()
    }
  };
}



const RootLayout = ({ children }: Readonly<PropsWithChildren>) => {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" href="/logo-nobg.png" />
          {/* Canny SDK */}
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}}(window,document,"canny-jssdk","script");`
            }}
          />
        </head>
        <body className={`${poppins.className} antialiased`}>
          <ConvexClientProvider>
            <JotaiProvider>
              <UsetifulProvider>
                <Toaster theme="light" richColors closeButton />
                <ModalProvider />
                <TidioChat />

                {children}
                <Analytics />
              </UsetifulProvider>
            </JotaiProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
};

export default RootLayout;
