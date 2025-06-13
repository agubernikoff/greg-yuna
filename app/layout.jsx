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
    function hasConsentCookie() {
      return document.cookie.includes('_tracking_consent');
    }

    function waitForShopifyConsent() {
      if (window.Shopify?.customerPrivacy?.showBanner) {
        if (!hasConsentCookie()) {
          Shopify.customerPrivacy.showBanner();
        }
      } else {
        setTimeout(waitForShopifyConsent, 100);
      }
    }

    waitForShopifyConsent();
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
