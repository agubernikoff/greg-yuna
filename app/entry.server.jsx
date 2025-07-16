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
  const {header} = createContentSecurityPolicy({
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
      "'unsafe-inline'",
      'https://web.cmp.usercentrics.eu',
      'https://cdn.userway.org', // added
      'https://cdn-cookieyes.com',
      // Klaviyo entries
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
    ],
    connectSrc: [
      'engaged-orca-warm.ngrok-free.app',
      'wss://kitten-composed-notably.ngrok-free.app:*',
      'https://www.powr.io',
      'https://greg-yuna-store.myshopify.com',
      'https://greg-yuna-store.myshopify.com/*',
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
      'https://api.userway.org', // added
      'https://cdn.userway.org', // added
      'https://log.cookieyes.com',
      'https://cdn-cookieyes.com',
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://directory.cookieyes.com/api/v1/ip',
    ],
    imgSrc: [
      'https://cdn.shopify.com',
      'https://www.powrcdn.com',
      'http://localhost:*',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://fonts.googleapis.com',
      'data:', // allows data URIs like inline SVGs
      'https://cdn.userway.org', // added
      'https://engaged-orca-warm.ngrok-free.app', // allow local favicon during dev
      'https://cdn-cookieyes.com',
      'https://d3k81ch9hvuctc.cloudfront.net',
    ],
    fontSrc: [
      "'self'",
      'https://cdn.userway.org',
      'https://cdn.shopify.com', // added to restore production font
      'https://fonts.gstatic.com',
    ],
    frameSrc: [
      'https://www.powr.io',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com',
      'http://localhost:3000',
      'https://*.klaviyo.com/*',
      'https://cdn.userway.org', // allow UserWay iframe
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'http://localhost:*',
      'https://cdn.userway.org', // added
      'https://fonts.googleapis.com',
      'https://static.klaviyo.com',
    ],
  });

  const headerWithoutNonce = header
    .replace(/'nonce-[^']*'/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
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
  responseHeaders.set('Content-Security-Policy', headerWithoutNonce);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
