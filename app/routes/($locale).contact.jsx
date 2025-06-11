import {useLoaderData, NavLink} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {useEffect} from 'react';

export const meta = ({data}) => {
  return [
    {title: `Contact`},
    {
      rel: 'canonical',
      href: `/contact`,
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
async function loadCriticalData({context, request}) {}

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

export default function Contact() {
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
    <div className="page-contact">
      <main>
        <div className="pp-page">
          <p className="header-aux-page">CONTACT</p>

          <div id="form-embed">
            <div className="powr-form-builder" id="b41bdd2b_1749484866"></div>
          </div>

          <p className="section-header-aux">APPOINTMENTS</p>
          <p>
            To book an appointment at our Nolita location, please reach out
            through the form above and include the reason for your visit or the
            products you’re interested in. A member of our team will follow up
            to confirm availability.
          </p>

          <p className="section-header-aux">LEAD TIMES</p>
          <p>
            Some items may be in stock & able to ship immediately. Please allow
            8–10 business days for custom fine orders to process & deliver.
          </p>

          <p className="section-header-aux">PRESS</p>
          <p>
            For questions regarding press, please email us at{' '}
            <a
              href="mailto:info@gregyuna.com"
              style={{textDecoration: 'underline'}}
            >
              info@gregyuna.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
