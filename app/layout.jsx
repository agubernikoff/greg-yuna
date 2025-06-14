import {useNonce, Analytics} from '@shopify/hydrogen';
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
import {useEffect, useState} from 'react';

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData('root');
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consentCookie = document.cookie.match(/_tracking_consent=([^;]+)/);
    const hasConsentCookie = consentCookie?.[1]?.includes('t_f_');
    if (hasConsentCookie) {
      setHasConsent(true);
    }
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
        {data && hasConsent ? (
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
          <PageLayout {...data}>
            <NavigationProvider>
              <Outlet />
            </NavigationProvider>
          </PageLayout>
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
