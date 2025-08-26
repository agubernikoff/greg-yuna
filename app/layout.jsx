import {useNonce, Analytics, useCustomerPrivacy} from '@shopify/hydrogen';
import {
  Links,
  Meta,
  Scripts,
  useRouteLoaderData,
  ScrollRestoration,
  Outlet,
  useLocation,
} from '@remix-run/react';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from '~/components/PageLayout';
import {NavigationProvider} from './context/NavigationContext';
import {useEffect} from 'react';

// Version-agnostic client-side pageview tracker for GTM/GA4/Meta/Klaviyo
function ClientTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      page_location: window.location.href,
      page_path: location.pathname + location.search,
      page_title: document?.title,
    };

    // GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event: 'page_view', ...payload});

    // GA4 / Meta / Klaviyo (no-ops if not present)
    window.gtag?.('event', 'page_view', payload);
    window.fbq?.('track', 'PageView', payload);
    window._learnq?.push(['track', 'Viewed Page', payload]);
  }, [location.key]);

  return null;
}

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData('root');

  // const {privacyBanner} = useCustomerPrivacy({
  //   storefrontAccessToken: data.consent.storefrontAccessToken,
  //   checkoutDomain: data.consent.checkoutDomain,
  //   withPrivacyBanner: true,
  //   onVisitorConsentCollected: (consent) => {
  //     console.log('Visitor consent collected:', consent);
  //   },
  // });

  // useEffect(() => {
  //   const root = document.documentElement;
  //   if (privacyBanner) {
  //     privacyBanner.showPreferences();
  //     setTimeout(() => {
  //       document.querySelector('#shopify-pc__banner').style.display = 'block';
  //       document.querySelector('#shopify-pc__prefs__header-close').click();
  //       root.style.setProperty('--janky-cookie-display-fix', 1);
  //     }, 750);
  //   }
  // }, [privacyBanner]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="og:description"
          content="Jewelry that makes a statement. Crafted with precision, designed to last a lifetime."
        />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/8d6e12516798989988aceb72/script.js"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PKN2CLHH');`,
          }}
        />
        <Meta />
        <Links />
        <script
          async
          type="text/javascript"
          src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=TBMgC2"
        ></script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PKN2CLHH"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}
            title="gtm"
          ></iframe>
        </noscript>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <ClientTracker />
            <PageLayout {...data}>
              <NavigationProvider>
                <Outlet />
              </NavigationProvider>
            </PageLayout>
          </Analytics.Provider>
        ) : (
          <Outlet />
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
