import {Await, Link, useLocation, Form} from '@remix-run/react';
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
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <LocationAside
        availableCountries={availableCountries}
        selectedLocale={selectedLocale}
      />
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
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

function LocationAside({availableCountries, selectedLocale}) {
  const {close} = useAside();
  return (
    <Aside type="location" heading="choose country">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={availableCountries}>
          {(availableCountries) => {
            return (
              <LocationForm
                availableCountries={availableCountries}
                selectedLocale={selectedLocale}
                close={close}
              />
            );
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function LocationForm({availableCountries, selectedLocale, close}) {
  const {pathname, search} = useLocation();
  const {type} = useAside();
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
  console.log(availableCountries);
  useEffect(
    () => setCountry(availableCountries.localization.country),
    [availableCountries, pathname, selectedLocale],
  );

  useEffect(() => {
    setTimeout(() => setCountry(availableCountries.localization.country), 300);
  }, [type]);

  // Prepare sorted country options
  const sortedCountries = availableCountries.localization.availableCountries
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  // Move selected country to the top
  const countryOptions = [
    country,
    ...sortedCountries.filter((c) => c.isoCode !== country.isoCode),
  ];

  const options = countryOptions.map((c) => (
    <p
      className="country-option"
      key={c.isoCode}
      onClick={() => {
        setCountry(c);
        setOpen(false);
      }}
    >
      {`${c.name.toLowerCase()} / ${c.currency.isoCode.toLowerCase()}`}
    </p>
  ));

  const strippedPathname = pathname.includes('EN-')
    ? pathname
        .split('/')
        .filter((part) => !part.includes('EN-'))
        .join('/')
    : pathname;

  return (
    <div className="location-form">
      <p>
        {'Please select the country where your order will be shipped to. This will give you the correct pricing, delivery dates and shipping costs for your destination. All orders are dispatched from the united states.'.toLowerCase()}
      </p>
      <div className="country-dropdown">
        <div className="location-select" onClick={() => setOpen(true)}>
          <p>{`${country.name.toLowerCase()} / ${country.currency.isoCode.toLowerCase()}`}</p>
          <svg
            width="7"
            height="8"
            viewBox="0 0 7 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 3.79668L0.7 7.43399L0.7 0.159373L7 3.79668Z"
              fill="black"
            />
          </svg>
        </div>
        {open ? (
          <div className="country-dropdown-content">{options}</div>
        ) : null}
      </div>
      {open ? (
        <button
          className="close-dropdown"
          onClick={() => setOpen(false)}
        ></button>
      ) : null}
      <Form method="post" action="/locale" preventScrollReset={true}>
        <input type="hidden" name="language" value={country.language} />
        <input type="hidden" name="country" value={country.isoCode} />
        <input
          type="hidden"
          name="path"
          value={`${strippedPathname}${search}`}
        />
        <button type="submit" onClick={close} className="add-to-cart-form-pdp">
          save
        </button>
      </Form>
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
