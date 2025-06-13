import {useNonce, Analytics} from '@shopify/hydrogen';
import {useEffect} from 'react';
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

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData('root');

  useEffect(() => {
    console.log('Hydrogen layout mounted');

    function hasConsentCookie() {
      const hasCookie = document.cookie.includes('_tracking_consent');
      console.log('Consent cookie present:', hasCookie);
      return hasCookie;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.shopify.com/shopifycloud/privacy-banner/v1/en.js';
    script.async = true;

    script.onload = () => {
      console.log('Shopify privacy script loaded');

      function waitForShopifyConsent() {
        console.log('Waiting for Shopify.customerPrivacy...');
        if (window.Shopify?.customerPrivacy?.showBanner) {
          console.log('Shopify.customerPrivacy is available');
          if (!hasConsentCookie()) {
            console.log('Showing cookie banner...');
            Shopify.customerPrivacy.showBanner();
          } else {
            console.log('Consent already given, not showing banner.');
          }
        } else {
          console.log('Shopify.customerPrivacy not ready yet, retrying...');
          setTimeout(waitForShopifyConsent, 100);
        }
      }

      waitForShopifyConsent();
    };

    console.log('Injecting privacy script...');
    document.body.appendChild(script);
  }, []);

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
        <Meta />
        <Links />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
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
