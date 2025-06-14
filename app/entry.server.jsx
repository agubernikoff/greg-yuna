import {RemixServer} from '@remix-run/react';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    scriptSrc: [
      'https://www.powr.io',
      'https://cdn.shopify.com',
      'https://cdn.shopifycloud.com',
      'http://localhost:*',
      "'self'",
      "'unsafe-eval'",
      'https://web.cmp.usercentrics.eu',
      "'sha256-Ga2f9jcNooQ8/dOcbhTgkES0ymHn1AYZdfFNf+tDyYA='",
      "'sha256-pD1IvxrgXgKrAhNJmdMwtplCR1BZCy9ekf7LyKljrWI='",
      "'sha256-mZHbRA2WAyFk8pn6GhLoc1aVTbJkHitrb+cD7RaZbgw='",
      "'sha256-p7GE78bbMHDrE4IWzpiMSttAsTpUu7wwi5/wvnH54Os='",
      "'sha256-0uuGuddzBoZE8zH0ota5hiSgKmaEQdBTE6UYtISnrtw='",
      "'sha256-ot4uWMULOgQERJVeW+1RS4LiQazeh9VYa+IzbwCX43U='",
      "'sha256-qetjs2Y6bWSzfJa9QIFrpKGTUpg7e4xVqZA2xBCWGMw='",
      "'sha256-D9S5KXsSSajKKVF3Jf+B22EHGKgFWMmaLff5rY6FNZc='",
      "'sha256-YmkDicEK7X4iT+xFPeYy2+Rj5yAcQbVMWhW0bFcC0as='",
      "'sha256-fk0hq8vVCEr/mxFfq2UBOsX/0g+NyYZ3M0/b0lAh0gs='",
      "'sha256-FeKBGzRHcROv0xd1BUE68Cy1yefbayaeP0AhzHm/mNo='",
      "'sha256-IuetB3Ay61Ha6uNWce1HGi04d/9MzcEuBz9jR3rjYgs='",
    ],
    connectSrc: [
      'engaged-orca-warm.ngrok-free.app',
      'wss://kitten-composed-notably.ngrok-free.app:*',
      'https://www.powr.io',
      'https://greg-yuna-store.myshopify.com',
      'https://greg-yuna-store.myshopify.com/*',
      'https://checkout.greg-yuna-store.myshopify.com/*',
      'https://greg-yuna-store.com',
      'https://greg-yuna-store.com/*',
      'http://localhost:3000',
      'https://greg-yuna-hydrogen-4403d774125ce12f8cb7.o2.myshopify.dev',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com',
      'https://*.klaviyo.com/*',
      'https://gregyuna.com',
      'https://greg-yuna-store.myshopify.com/api/unstable/graphql.json',
      'https://cdn.shopifycloud.com',
      'https://v1.api.service.cmp.usercentrics.eu',
    ],
    imgSrc: [
      'https://cdn.shopify.com',
      'https://www.powrcdn.com',
      'http://localhost:*',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://fonts.googleapis.com',
    ],
    frameSrc: [
      'https://www.powr.io',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com',
      'http://localhost:3000',
      'https://*.klaviyo.com/*',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} nonce={nonce} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
