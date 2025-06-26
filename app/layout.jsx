import {useNonce, Analytics, useCustomerPrivacy} from '@shopify/hydrogen';
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
