import Script from "next/script";
import type { Integrations } from "@/lib/cms/types";

/*
 * Analytics and custom code from Admin → Code & tracking. Rendered by SiteChrome, so it runs on
 * public pages only — never inside the admin. IDs are validated against each service's format
 * before they get here, so they are safe to place inside the snippets.
 */

export function TrackingTop({ i }: { i: Integrations }) {
  return (
    <>
      {i.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${i.gtmId}');`}
        </Script>
      )}
      {i.gtmId && (
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${i.gtmId}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
        </noscript>
      )}

      {/* GA4 tracks page changes in this single-page site automatically ("enhanced measurement"). */}
      {i.gaId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${i.gaId}`} strategy="afterInteractive" />}
      {i.gaId && (
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${i.gaId}');`}
        </Script>
      )}

      {i.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${i.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {i.metaPixelId && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element -- Meta's no-JS tracking pixel */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${i.metaPixelId}&ev=PageView&noscript=1`} />
        </noscript>
      )}

      {i.clarityId && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${i.clarityId}");`}
        </Script>
      )}

      {/* Custom code: in the server HTML, so its scripts run on page load, like any pasted embed snippet. */}
      {i.customCodeEnabled && i.headCode.trim() && <div data-custom-code="start" style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: i.headCode }} />}
    </>
  );
}

export function TrackingBottom({ i }: { i: Integrations }) {
  if (!i.customCodeEnabled || !i.bodyCode.trim()) return null;
  return <div data-custom-code="end" style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: i.bodyCode }} />;
}
