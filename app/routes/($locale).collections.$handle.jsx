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

function Filter({title, filters}) {
  // console.log(filters);
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
      <div className="filter-space-between bottom-border">
        <Filt
          filter={filters
            .find((f) => f.id === 'filter.p.tag')
            .values.filter((v) => v.id !== 'filter.p.tag.new-arrivals')}
          addFilter={addFilter}
          removeFilter={removeFilter}
          isChecked={isChecked}
          clearFilter={clearFilter}
        />
        <Sort />
      </div>
    </div>
  );
}

function Sort({}) {
  const [isOpen, setIsOpen] = useState(false);
  function toggleIsOpen() {
    setIsOpen(!isOpen);
  }
  return (
    <button
      className="filter-space-between inline-border sort-by-button"
      onClick={toggleIsOpen}
    >
      <span>Sort By</span>
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
              animate={{y: 0}}
              exit={{y: '-100%'}}
              transition={{ease: 'easeInOut', duration: 0.15}}
            >
              <div className="sort-container">x</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </button>
  );
}

function Filt({filter, addFilter, isChecked, removeFilter, clearFilter}) {
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
    <div style={{display: 'flex'}}>
      <FilterInput
        label={'View All'}
        value={'viewAll'}
        addFilter={clearFilter}
        isChecked={isChecked}
        removeFilter={clearFilter}
      />
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
  );
}

function FilterInput({label, value, addFilter, isChecked, removeFilter}) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <button
        className="padded-filter-div inline-border filter-input"
        onClick={() => {
          if (!isChecked(value)) addFilter(value);
          else removeFilter(value);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {label}

        {hovered && (
          <motion.div
            layoutId="hover-indicator"
            id="hover-indicator"
            style={{
              right: 0,
              left: 0,
              height: '3px',
              position: 'absolute',
              bottom: 0,
              background: '#999999',
            }}
            transition={{ease: 'easeInOut', duration: 0.15}}
          />
        )}
        {isChecked(value) && (
          <motion.div
            layoutId="filter-indicator"
            id="filter-indicator"
            style={{
              right: 0,
              left: 0,
              height: '3px',
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
