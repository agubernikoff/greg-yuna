import {useLoaderData, NavLink} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';

export const meta = ({data}) => {
  return [
    {title: `Bespoke`},
    {
      rel: 'canonical',
      href: `/bespoke`,
    },
  ];
};

export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;

  const [bespoke] = await Promise.all([
    storefront.query(BESPOKE_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    bespokeImages: bespoke?.metaobjects?.nodes
      .map((node) => node.fields?.[0]?.reference?.image)
      .filter(Boolean),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Bespoke() {
  const {bespokeImages} = useLoaderData();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!bespokeImages || bespokeImages.length < 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bespokeImages.length);
    }, 4000); // 4 seconds per image

    return () => clearInterval(interval);
  }, [bespokeImages]);

  useEffect(() => {
    // Check if POWR is already loaded
    if (!window.POWR) {
      const script = document.createElement('script');
      script.src = 'https://www.powr.io/powr.js?platform=shopify';
      script.async = true;
      script.onload = () => {
        if (window.POWR) {
          window.POWR.renderAll();
        }
      };
      document.body.appendChild(script);
    } else {
      // Re-render POWR if already loaded
      window.POWR.renderAll();
    }
  }, []);

  return (
    <div className="bespoke-container">
      <div className="bespoke-breadcrumbs">
        <div className="padded-filter-div full-border breadcrumbs">
          <>
            <NavLink className="crumb" to="/">
              Home
            </NavLink>
            <span className="crumb-dash">{' → '}</span>
            <span className="crumb">Bespoke</span>
          </>
        </div>
      </div>
      <div className="bespoke-form-container">
        <div className="powr-form-builder" id="ebdf6df2_1749490648"></div>
      </div>
      <div className="bespoke-image-container">
        {bespokeImages.map((img, index) => (
          <Image
            key={index}
            alt={img.altText || `Bespoke image ${index + 1}`}
            src={img.url}
            loading="eager"
            sizes="(min-width: 500px) 50vw, 100vw"
            className={`fade-image ${
              index === currentIndex ? 'active' : 'inactive'
            }`}
            loaderOptions={{scale: 1}}
          />
        ))}
      </div>
    </div>
  );
}

const BESPOKE_QUERY = `#graphiql

    query Bespoke(
        $country: CountryCode
        $language: LanguageCode
      ) @inContext(country: $country, language: $language) {
    metaobjects(type: "bespoke_page_image", first: 10, sortKey: "updated_at") {
      nodes {
        id
        fields {
          reference {
            ... on MediaImage {
              id
              image {
                url
                width
                altText
                height
              }
            }
          }
        }
      }
    }
  }
`;
