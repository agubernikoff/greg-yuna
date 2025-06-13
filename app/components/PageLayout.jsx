import {
  Await,
  Link,
  useLocation,
  useFetcher,
  Form,
  useNavigation,
} from '@remix-run/react';
import {Suspense, useId, useState, useEffect} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {useAside} from './Aside';
import {useRef} from 'react';
import {AnimatePresence, motion} from 'motion/react';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  selectedLocale,
  availableCountries,
}) {
  const {pathname} = useLocation();
  const {state, location} = useNavigation();
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside
        header={header}
        publicStoreDomain={publicStoreDomain}
        selectedLocale={selectedLocale}
        availableCountries={availableCountries}
      />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 1}}
          transition={{ease: 'easeInOut', duration: 0.1}}
          key={state === 'loading' ? location?.pathname : pathname}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
      <script
        id="customer-privacy-api"
        type="text/javascript"
        src="https://cdn.shopifycloud.com/privacy-banner/storefront-banner.js"
        data-shop-domain="greg-yuna-store.myshopify.com"
      />
    </Aside.Provider>
  );
}

// function LocationAside({availableCountries, selectedLocale}) {
//   const {close} = useAside();
//   return (
//     <Aside type="location" heading="choose country">
//       <Suspense fallback={<div>Loading...</div>}>
//         <Await resolve={availableCountries}>
//           {(availableCountries) => {
//             return (
//               <LocationForm
//                 availableCountries={availableCountries}
//                 selectedLocale={selectedLocale}
//                 close={close}
//               />
//             );
//           }}
//         </Await>
//       </Suspense>
//     </Aside>
//   );
// }

export function LocationForm({availableCountries, selectedLocale, close}) {
  const fetcher = useFetcher();
  fetcher.formAction = '/locale';
  const {pathname, search} = useLocation();
  const {type} = useAside();
  const formRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState({
    currency: {
      isoCode: 'USD',
      name: 'United States Dollar',
      symbol: '$',
    },
    isoCode: 'US',
    name: 'United States',
    unitSystem: 'IMPERIAL_SYSTEM',
  });

  useEffect(() => {
    setCountry(availableCountries.localization.country);
  }, [availableCountries, pathname, selectedLocale]);

  useEffect(() => {
    setTimeout(() => {
      setCountry(availableCountries.localization.country);
    }, 300);
  }, [type]);

  const sortedCountries = availableCountries.localization.availableCountries
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const countryOptions = [
    country,
    ...sortedCountries.filter((c) => c.isoCode !== country.isoCode),
  ];

  const strippedPathname = pathname.includes('EN-')
    ? pathname
        .split('/')
        .filter((part) => !part.includes('EN-'))
        .join('/')
    : pathname;

  const handleCountrySelect = (selected) => {
    setCountry(selected);
    close();

    // Update inputs and submit form
    const formData = new FormData();
    formData.append('country', `${selected.isoCode}`);
    formData.append('path', `${strippedPathname}${search}`);

    fetcher.submit(formData, {method: 'POST', preventScrollReset: true});
  };

  return (
    <div className="location-form">
      {countryOptions.map((c) => (
        <p
          className="country-option"
          key={c.isoCode}
          onClick={() => handleCountrySelect(c)}
        >
          <span>{`${c.name}`}</span>
          <span>{`(${c.currency.isoCode} ${c.currency.symbol})`}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  return (
    <Suspense fallback={<p>Loading cart ...</p>}>
      <Await resolve={cart}>
        {(cartData) => (
          <Aside type="cart" heading={`Bag [${cartData?.totalQuantity || 0}]`}>
            <CartMain cart={cartData} layout="aside" />
          </Aside>
        )}
      </Await>
    </Suspense>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 * }}
 */
function MobileMenuAside({
  header,
  publicStoreDomain,
  selectedLocale,
  availableCountries,
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          selectedLocale={selectedLocale}
          availableCountries={availableCountries}
        />
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
