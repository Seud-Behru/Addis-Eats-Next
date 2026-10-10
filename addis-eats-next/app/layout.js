import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Providers } from "./components/Providers";
import Analytics from "./components/Analytics";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// Self-hosted variable fonts (latin subset, weight axis). next/font copies the
// files into the build, serves them from our own origin, preloads them, and
// generates a size-adjusted fallback so swapping in the real font moves
// nothing (that is the CLS win). No request ever goes to fonts.googleapis.com.
const newsreader = localFont({
  src: "./fonts/Newsreader-latin-wght.woff2",
  variable: "--font-newsreader",
  weight: "200 800",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const plusJakarta = localFont({
  src: "./fonts/PlusJakartaSans-latin-wght.woff2",
  variable: "--font-plus-jakarta",
  weight: "200 800",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// metadataBase turns every relative URL in metadata (og:image, canonical...)
// into an absolute one. Child routes set only `title: "Menu"` and the
// template below makes it "Menu | Addis Eats"; a route with no title of its
// own gets `default`.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("addis-eats-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Ethiopian food delivered across Addis Ababa`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_ET",
    // No title/description here on purpose: pages that set their own `title`
    // and `description` then get matching og:title / og:description.
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before the first paint: puts the saved (or OS) theme on <html> so
            the page never flashes light and then switches to dark. Same keys and
            logic as ThemeProvider. suppressHydrationWarning on <html> is needed
            because this script changes its class before React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex flex-col min-h-screen bg-cream text-charcoal font-body">

        <Providers>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />

      </body>
    </html>
  );
}
