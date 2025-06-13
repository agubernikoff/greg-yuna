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
