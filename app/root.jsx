import {getShopAnalytics} from '@shopify/hydrogen';
import {Outlet, useRouteError, isRouteErrorResponse} from '@remix-run/react';
import {useEffect} from 'react';
import favicon from '~/assets/favicon.jpg';
import {FOOTER_QUERY, HEADER_QUERY, COUNTRIES_QUERY} from '~/lib/fragments';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/jpg', href: favicon},
  ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
      storeDomain: env.PUBLIC_STORE_DOMAIN,
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
    }),
    selectedLocale: args.context.storefront.i18n,
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'ss-main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'ss-footer-menu', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  const availableCountries = storefront
    .query(COUNTRIES_QUERY, {
      cache: storefront.CacheLong(),
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
    availableCountries,
  };
}

export default function App() {
  useEffect(() => {
    // Inject Shopify customer privacy script
    const privacyScript = document.createElement('script');
    privacyScript.setAttribute('id', 'customer-privacy-api');
    privacyScript.type = 'text/javascript';
    privacyScript.src =
      'https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js';
    privacyScript.async = true;
    document.body.appendChild(privacyScript);
    privacyScript.addEventListener('load', () => {
      const customerPrivacy = window.Shopify?.customerPrivacy;
      console.log('Privacy loaded:', customerPrivacy);
    });

    // Inject UserWay script
    const script = document.createElement('script');

    // Optional customization attributes
    script.setAttribute('data-position', '3'); // Override default position
    script.setAttribute('data-size', 'small'); // small or large
    // script.setAttribute('data-language', 'fr'); // e.g., fr, de, es, he, nl
    script.setAttribute('data-color', '#000'); // Widget color
    script.setAttribute('data-type', '3'); // 1=person, 2=chair, 3=eye, 4=text
    // script.setAttribute('data-statement_text', 'Our Accessibility Statement');
    // script.setAttribute('data-statement_url', 'http://www.example.com/accessibility');
    script.setAttribute('data-mobile', 'true'); // Support on mobile
    // script.setAttribute('data-trigger', 'triggerId'); // Custom trigger ID
    // script.setAttribute('data-z-index', '10001'); // Widget z-index
    // script.setAttribute('data-site-language', 'null'); // Live site translations

    script.setAttribute('data-widget_layout', 'full');
    script.setAttribute('data-account', '8KH2VC1ULy');
    script.src = 'https://cdn.userway.org/widget.js';
    script.async = true;
    (document.body || document.head).appendChild(script);

    // const waitForUC = setInterval(() => {
    //   const cmp = document.querySelector('#usercentrics-cmp-ui');
    //   if (cmp) {
    //     cmp.style.zIndex = '9999999999999';
    //     clearInterval(waitForUC);
    //   }
    // }, 1);
  }, []);

  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {Class<loader>} RootLoader */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
