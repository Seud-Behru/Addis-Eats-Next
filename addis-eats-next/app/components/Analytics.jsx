import Script from "next/script";

// The only third-party script on the site. Renders nothing unless
// NEXT_PUBLIC_GA_ID is set (see .env.example).
//
// strategy="lazyOnload": the browser loads it during idle time AFTER the
// page has finished loading, so it can't compete with the hero image or
// hydration for bandwidth/main thread (the usual source of bad LCP and INP
// from analytics tags). Don't use beforeInteractive/afterInteractive here.
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  // Only a real GA4 id loads anything. The placeholder from .env.example
  // (G-XXXXXXXXXX) used to download ~100 KB of gtag.js and run it for
  // nothing, which showed up as blocking time and console errors.
  if (!id || !/^G-[A-Z0-9]{8,}$/.test(id) || /^G-X+$/.test(id)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
