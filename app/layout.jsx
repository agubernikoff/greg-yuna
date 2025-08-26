import {
  useNonce,
  Analytics,
  useCustomerPrivacy,
  useAnalytics,
} from '@shopify/hydrogen';
import {
  Links,
  Meta,
  Scripts,
  useRouteLoaderData,
  ScrollRestoration,
  Outlet,
} from '@remix-run/react';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from '~/components/PageLayout';
import {NavigationProvider} from './context/NavigationContext';
import {useEffect} from 'react';

// Mirrors Hydrogen analytics events to GTM/Meta/GA4/Klaviyo.
// Mount once inside <Analytics.Provider>.
function ThirdPartyAnalyticsIntegration() {
  const {subscribe, register} = useAnalytics();

  useEffect(() => {
    const {ready} = register('Third Party');
    const unsubs = [];

    function sub(eventName, handler) {
      unsubs.push(subscribe(eventName, handler));
    }

    // PAGE VIEW
    sub('page_viewed', (payload) => {
      // GTM / dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'page_viewed', ...payload});

      // Meta, GA4, Klaviyo examples (safe-optional with optional chaining)
      window.fbq?.('track', 'PageView', payload);
      window.gtag?.('event', 'page_view', payload);
      window._learnq?.push(['track', 'Viewed Page', payload]);
    });

    // PRODUCT VIEWED
    sub('product_viewed', (payload) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'product_viewed', ...payload});
      window.gtag?.('event', 'view_item', payload);
      window.fbq?.('track', 'ViewContent', payload);
      window._learnq?.push(['track', 'Viewed Product', payload]);
    });

    // CART UPDATED (fires often — dedupe on your side if needed)
    sub('cart_updated', (payload) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'cart_updated', ...payload});
      window.gtag?.('event', 'add_to_cart', payload);
      window.fbq?.('track', 'AddToCart', payload);
      window._learnq?.push(['track', 'Cart Updated', payload]);
    });

    // PRODUCT ADDED TO CART (if you emit custom events for this in routes)
    sub('product_added_to_cart', (payload) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'product_added_to_cart', ...payload});
      window.gtag?.('event', 'add_to_cart', payload);
      window.fbq?.('track', 'AddToCart', payload);
      window._learnq?.push(['track', 'Added to Cart', payload]);
    });

    // CHECKOUT STARTED (Hydrogen emits when checkout URL is generated)
    sub('checkout_started', (payload) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event: 'checkout_started', ...payload});
      window.gtag?.('event', 'begin_checkout', payload);
      window.fbq?.('track', 'InitiateCheckout', payload);
      window._learnq?.push(['track', 'Started Checkout', payload]);
    });

    ready();
    return () => unsubs.forEach((u) => u && u());
  }, [register, subscribe]);

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
            <Analytics />
            <ThirdPartyAnalyticsIntegration />
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
