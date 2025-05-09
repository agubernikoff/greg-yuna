import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData, NavLink, useSearchParams} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import ProductGridItem from '~/components/ProductGridItem';
import {useState, useRef, useEffect} from 'react';
import {AnimatePresence, motion} from 'motion/react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });
  const filters = [];
  let reverse = false;
  let sortKey = null;

  if (!handle) {
    throw redirect('/collections');
  }

  if (searchParams.has('filter')) {
    filters.push(...searchParams.getAll('filter').map((x) => JSON.parse(x)));
  }
  if (searchParams.has('sortKey')) sortKey = searchParams.get('sortKey');
  if (searchParams.has('reverse'))
    reverse = searchParams.get('reverse') === 'true';

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, filters, reverse, sortKey, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
    handle,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();

  return (
    <div className="collection">
      <div className="filter-placeholder" />
      <Filter title={collection.title} filters={collection.products.filters} />
      <PaginatedResourceSection
        connection={collection.products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductGridItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

export function Filter({title, filters, shopAll}) {
  const [searchParams, setSearchParams] = useSearchParams();

  function addFilter(input) {
    setSearchParams(
      (prev) => {
        prev.set('filter', input);
        return prev;
      },
      {preventScrollReset: true},
    );
  }

  function removeFilter(input) {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev); // Clone to avoid mutation
        const filters = newParams.getAll('filter'); // Get all filter values
        newParams.delete('filter'); // Remove all instances

        // Re-add only the filters that are NOT being removed
        filters
          .filter((f) => f !== input)
          .forEach((f) => newParams.append('filter', f));

        return newParams;
      },
      {preventScrollReset: true},
    );
  }

  function isChecked(input) {
    if (input === 'viewAll') return !searchParams.get('filter');
    return searchParams.getAll('filter').includes(input);
  }

  function clearFilter() {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('filter'); // Remove all `filter` parameters
        return newParams;
      },
      {preventScrollReset: true},
    );
  }

  function addSort(input) {
    const parsed = JSON.parse(input);
    setSearchParams(
      (prev) => {
        prev.set('reverse', Boolean(parsed.reverse));
        prev.set('sortKey', parsed.sortKey);
        return prev;
      },
      {preventScrollReset: true},
    );
  }

  function removeSort() {
    setSearchParams(
      (prev) => {
        prev.delete('reverse');
        prev.delete('sortKey');
        return prev;
      },
      {preventScrollReset: true},
    );
  }

  function isSortChecked(input) {
    const parsed = JSON.parse(input);
    return (
      searchParams.get('reverse') === parsed.reverse.toString() &&
      searchParams.get('sortKey') === parsed.sortKey
    );
  }
  return (
    <div className="filter-container">
      <div className="padded-filter-div full-border">
        <>
          <NavLink className="crumb" to="/">
            Home
          </NavLink>
          <span className="crumb">{' → '}</span>
          <span>{title}</span>
        </>
      </div>
      <div className="filter-space-between bottom-border filter-second-row">
        <Filt
          filter={
            title === 'New Arrivals' || title === 'Shop All'
              ? filters
                  .find((f) => f.id === 'filter.p.tag')
                  .values.filter((v) => v.id !== 'filter.p.tag.new-arrivals')
              : filters.find((f) => f.id === 'filter.v.option.material').values
          }
          isNewArrivals={title === 'New Arrivals' || title === 'Shop All'}
          addFilter={addFilter}
          removeFilter={removeFilter}
          isChecked={isChecked}
          clearFilter={clearFilter}
        />
        <Sort
          addSort={addSort}
          removeSort={removeSort}
          isChecked={isSortChecked}
          shopAll={shopAll}
        />
      </div>
    </div>
  );
}

function Sort({addSort, removeSort, isChecked, term, shopAll}) {
  const [isOpen, setIsOpen] = useState(false);
  function toggleIsOpen() {
    setIsOpen(!isOpen);
  }
  return (
    <button
      className={`filter-space-between sort-by-button ${isOpen ? 'isOpen-btn' : ''}`}
      onClick={toggleIsOpen}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`sort-by-${isOpen}`}
          initial={{opacity: 1}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          style={{display: 'inline-block', width: '100%', textAlign: 'left'}}
        >
          {!isOpen ? 'Sort By' : 'Close'}
        </motion.span>
      </AnimatePresence>
      <svg
        width="16"
        height="12"
        viewBox="0 0 16 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line y1="3" x2="16" y2="3" stroke="black" />
        <motion.rect
          x="3.5"
          y="1"
          width="4"
          height="4"
          fill="white"
          stroke="black"
          initial={{x: 0}}
          animate={{x: isOpen ? '6px' : 0}}
          transition={{ease: 'easeInOut', duration: 0.15}}
        />
        <line y1="9" x2="16" y2="9" stroke="black" />
        <motion.rect
          x="9.5"
          y="7"
          width="4"
          height="4"
          fill="white"
          stroke="black"
          initial={{x: 0}}
          animate={{x: isOpen ? '-6px' : 0}}
          transition={{ease: 'easeInOut', duration: 0.15}}
        />
      </svg>
      <AnimatePresence>
        {isOpen && (
          <div className="sort-overflow-hidden-container">
            <motion.div
              initial={{y: '-100%'}}
              animate={{y: '1px'}}
              exit={{y: '-100%'}}
              transition={{ease: 'easeInOut', duration: 0.15}}
            >
              <div className="sort-container">
                <FilterInput
                  label={'Best Selling'}
                  value={JSON.stringify({
                    reverse: false,
                    sortKey: 'BEST_SELLING',
                  })}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  isSort={true}
                />
                <FilterInput
                  label={'Alphabetically, A-Z'}
                  value={JSON.stringify({reverse: false, sortKey: 'TITLE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  count={term ? 0 : null}
                  isSort={true}
                />
                <FilterInput
                  label={'Alphabetically, A-Z'}
                  value={JSON.stringify({reverse: true, sortKey: 'TITLE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  count={term ? 0 : null}
                  isSort={true}
                />
                <FilterInput
                  label={'Date, new to old'}
                  value={JSON.stringify({
                    reverse: true,
                    sortKey: shopAll ? 'CREATED_AT' : 'CREATED',
                  })}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  count={term ? 0 : null}
                  isSort={true}
                />
                <FilterInput
                  label={'Date, old to new'}
                  value={JSON.stringify({
                    reverse: false,
                    sortKey: shopAll ? 'CREATED_AT' : 'CREATED',
                  })}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  count={term ? 0 : null}
                  isSort={true}
                />
                <FilterInput
                  label={'Price, low to high'}
                  value={JSON.stringify({reverse: false, sortKey: 'PRICE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  isSort={true}
                />
                <FilterInput
                  label={'Price, high to low'}
                  value={JSON.stringify({reverse: true, sortKey: 'PRICE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  isSort={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </button>
  );
}

function Filt({
  filter,
  addFilter,
  isChecked,
  removeFilter,
  clearFilter,
  isNewArrivals,
}) {
  const filterOrderRef = useRef(new Map()); // Persist across renders

  function storeInitialOrder(filters) {
    if (filterOrderRef.current.size === 0) {
      filters.forEach((filter, index) => {
        filterOrderRef.current.set(filter.label, index);
      });
    }
  }

  function sortByStoredOrder(filters) {
    return filters.slice().sort((a, b) => {
      return (
        (filterOrderRef.current.get(a.label) ?? Infinity) -
        (filterOrderRef.current.get(b.label) ?? Infinity)
      );
    });
  }

  useEffect(() => {
    storeInitialOrder(filter);
  }, []);

  return (
    <>
      <div style={{display: 'flex'}} className="desktop-filter">
        {isNewArrivals ? (
          <FilterInput
            label={'View All'}
            value={'viewAll'}
            addFilter={clearFilter}
            isChecked={isChecked}
            removeFilter={clearFilter}
          />
        ) : null}
        {sortByStoredOrder(filter).map((v) => (
          <FilterInput
            key={v.id}
            label={v.label}
            value={v.input}
            addFilter={addFilter}
            isChecked={isChecked}
            removeFilter={removeFilter}
          />
        ))}
      </div>
      <MobileFilt>
        <FilterInput
          label={'View All'}
          value={'viewAll'}
          addFilter={clearFilter}
          isChecked={isChecked}
          removeFilter={clearFilter}
          isSort={true}
        />
        {sortByStoredOrder(filter).map((v) => (
          <FilterInput
            key={v.id}
            label={v.label}
            value={v.input}
            addFilter={addFilter}
            isChecked={isChecked}
            removeFilter={removeFilter}
            isSort={true}
          />
        ))}
      </MobileFilt>
    </>
  );
}
function MobileFilt({children}) {
  const [isOpen, setIsOpen] = useState(false);
  function toggleIsOpen() {
    setIsOpen(!isOpen);
  }
  return (
    <button
      className={`filter-space-between inline-border sort-by-button mobile-filter ${isOpen ? 'isOpen-btn' : ''}`}
      onClick={toggleIsOpen}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`filt-by-${isOpen}`}
          initial={{opacity: 1}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          style={{display: 'inline-block', width: '100%', textAlign: 'left'}}
        >
          {!isOpen ? 'Filter' : 'Close'}
        </motion.span>
      </AnimatePresence>
      <motion.svg
        width="11"
        height="12"
        viewBox="0 0 11 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{rotate: 0}}
        animate={{rotate: isOpen ? '45deg' : 0}}
        transition={{ease: 'easeInOut', duration: 0.15}}
      >
        <line x1="5.5" y1="0.5" x2="5.5" y2="11.5" stroke="black" />
        <line x1="4.37113e-08" y1="6" x2="11" y2="6" stroke="black" />
      </motion.svg>

      <AnimatePresence>
        {isOpen && (
          <div className="sort-overflow-hidden-container">
            <motion.div
              initial={{y: '-100%'}}
              animate={{y: '1px'}}
              exit={{y: '-100%'}}
              transition={{ease: 'easeInOut', duration: 0.15}}
            >
              <div className="sort-container">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </button>
  );
}

function FilterInput({
  label,
  value,
  addFilter,
  isChecked,
  removeFilter,
  isSort,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <button
        className="padded-filter-div inline-border filter-input"
        onClick={(e) => {
          e.stopPropagation();
          if (!isChecked(value)) addFilter(value);
          else removeFilter(value);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {label}
        {hovered && (
          <motion.div
            layoutId={`${isSort ? 'sort-' : ''}hover-indicator`}
            id={`${isSort ? 'sort-' : ''}hover-indicator`}
            style={{
              right: isSort ? 'auto' : 0,
              left: 0,
              height: isSort ? '100%' : '3px',
              width: isSort ? '3px' : '100%',
              position: 'absolute',
              bottom: 0,
              background: '#999999',
            }}
            transition={{ease: 'easeInOut', duration: 0.15}}
          />
        )}
        {isChecked(value) && (
          <motion.div
            layoutId={`${isSort ? 'sort-' : ''}filter-indicator`}
            id={`${isSort ? 'sort-' : ''}filter-indicator`}
            style={{
              right: isSort ? 'auto' : 0,
              left: 0,
              height: isSort ? '100%' : '3px',
              width: isSort ? '3px' : '100%',
              position: 'absolute',
              bottom: 0,
              background: 'black',
            }}
            transition={{ease: 'easeInOut', duration: 0.15}}
          />
        )}
      </button>
    </>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first:2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $reverse: Boolean
    $sortKey: ProductCollectionSortKeys
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        reverse: $reverse,
        sortKey: $sortKey
      ) {
        filters{
          id
          label
          presentation
          type
          values{
            count
            id
            input
            label
            swatch{
              color
            }
          }
        }
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
