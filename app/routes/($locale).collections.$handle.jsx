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
  return [{title: `Greg Yüna | ${data?.collection.title ?? ''} Collection`}];
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
        key={JSON.stringify(collection.products.nodes.map((p) => p.id))}
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

export function Filter({title, filters, shopAll, term}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState();
  function openFilterSort(name) {
    setIsOpen(name);
  }
  function closeFilterSort() {
    setIsOpen();
  }
  function addFilter(input) {
    setSearchParams(
      (prev) => {
        prev.set('filter', input);
        prev.delete('cursor');
        prev.delete('direction');
        return prev;
      },
      {preventScrollReset: true},
    );
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function removeFilter(input) {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        const filters = newParams.getAll('filter');
        newParams.delete('filter');

        // Re-add only the filters that are NOT being removed
        filters
          .filter((f) => f !== input)
          .forEach((f) => newParams.append('filter', f));

        newParams.delete('cursor');
        newParams.delete('direction');

        return newParams;
      },
      {preventScrollReset: true},
    );
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function isChecked(input) {
    if (input === 'viewAll') return !searchParams.get('filter');
    return searchParams.getAll('filter').includes(input);
  }

  function clearFilter() {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('filter');
        newParams.delete('cursor');
        newParams.delete('direction');
        return newParams;
      },
      {preventScrollReset: true},
    );
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function addSort(input) {
    const parsed = JSON.parse(input);
    setSearchParams(
      (prev) => {
        prev.set('reverse', Boolean(parsed.reverse));
        prev.set('sortKey', parsed.sortKey);
        prev.delete('cursor');
        prev.delete('direction');
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
          {term ? (
            <span>{term}</span>
          ) : (
            <>
              <NavLink className="crumb" to="/">
                Home
              </NavLink>
              <span className="crumb-dash">{' → '}</span>
              <span>{title}</span>
            </>
          )}
        </>
      </div>
      <div className="filter-space-between bottom-border filter-second-row">
        <Filt
          filter={
            title === 'New Arrivals' || title === 'Shop All' || term
              ? filters
                  .find((f) => f.id === 'filter.p.tag')
                  ?.values.filter((v) => v.id !== 'filter.p.tag.new-arrivals')
              : filters.find((f) => f.id === 'filter.v.option.material')?.values
          }
          addFilter={addFilter}
          removeFilter={removeFilter}
          isChecked={isChecked}
          clearFilter={clearFilter}
          isOpen={isOpen}
          open={openFilterSort}
          close={closeFilterSort}
        />
        <Sort
          addSort={addSort}
          removeSort={removeSort}
          isChecked={isSortChecked}
          shopAll={shopAll}
          term={term}
          isOpen={isOpen}
          open={openFilterSort}
          close={closeFilterSort}
        />
      </div>
    </div>
  );
}

function Sort({
  addSort,
  removeSort,
  isChecked,
  term,
  shopAll,
  isOpen,
  open,
  close,
}) {
  // const [isOpen, setIsOpen] = useState(false);
  function toggleIsOpen() {
    if (isOpen === 'sort') close();
    else open('sort');
  }
  return (
    <div
      className={`filter-space-between  sort-by-button ${isOpen === 'sort' ? 'isOpen-btn' : ''}`}
    >
      <button
        onClick={toggleIsOpen}
        className={`sort-by-button ${isOpen === 'sort' ? 'isOpen-btn' : ''}`}
        style={{border: 'none', width: '100%'}}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={`sort-by-${isOpen === 'sort'}`}
            initial={{opacity: 1}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            style={{display: 'inline-block', width: '100%', textAlign: 'left'}}
          >
            {isOpen !== 'sort' ? 'Sort By' : 'Close'}
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
            animate={{x: isOpen === 'sort' ? '6px' : 0}}
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
            animate={{x: isOpen === 'sort' ? '-6px' : 0}}
            transition={{ease: 'easeInOut', duration: 0.15}}
          />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen === 'sort' && (
          <motion.div
            className="sort-overflow-hidden-container"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
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
                  term={term}
                  close={toggleIsOpen}
                />
                <FilterInput
                  label={'Alphabetically, A-Z'}
                  value={JSON.stringify({reverse: false, sortKey: 'TITLE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  term={term}
                  isSort={true}
                  close={toggleIsOpen}
                />
                <FilterInput
                  label={'Alphabetically, Z-A'}
                  value={JSON.stringify({reverse: true, sortKey: 'TITLE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  term={term}
                  isSort={true}
                  close={toggleIsOpen}
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
                  term={term}
                  isSort={true}
                  close={toggleIsOpen}
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
                  term={term}
                  isSort={true}
                  close={toggleIsOpen}
                />
                <FilterInput
                  label={'Price, low to high'}
                  value={JSON.stringify({reverse: false, sortKey: 'PRICE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  isSort={true}
                  close={toggleIsOpen}
                />
                <FilterInput
                  label={'Price, high to low'}
                  value={JSON.stringify({reverse: true, sortKey: 'PRICE'})}
                  addFilter={addSort}
                  isChecked={isChecked}
                  removeFilter={removeSort}
                  isSort={true}
                  close={toggleIsOpen}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Filt({
  filter,
  addFilter,
  isChecked,
  removeFilter,
  clearFilter,
  isOpen,
  open,
  close,
}) {
  const filterOrderRef = useRef(new Map()); // Persist across renders

  function storeInitialOrder(filters) {
    if (filters && filterOrderRef.current.size === 0) {
      filters.forEach((filter, index) => {
        filterOrderRef.current.set(filter.label, index);
      });
    }
  }

  function sortByStoredOrder(filters) {
    if (!filters) return [];
    return filters?.slice().sort((a, b) => {
      return (
        (filterOrderRef.current.get(a.label) ?? Infinity) -
        (filterOrderRef.current.get(b.label) ?? Infinity)
      );
    });
  }

  useEffect(() => {
    storeInitialOrder(filter);
  }, []);

  function toggleIsOpen() {
    if (isOpen === 'filt') close();
    else open('filt');
  }

  return (
    <>
      <div style={{display: 'flex'}} className="desktop-filter">
        {filter &&
          sortByStoredOrder(filter)?.map((v) => (
            <FilterInput
              key={v.id}
              label={v.label}
              value={v.input}
              addFilter={addFilter}
              isChecked={isChecked}
              removeFilter={removeFilter}
            />
          ))}
        <FilterInput
          label={'View All'}
          value={'viewAll'}
          addFilter={clearFilter}
          isChecked={isChecked}
          removeFilter={clearFilter}
        />
      </div>
      <MobileFilt isOpen={isOpen} toggleIsOpen={toggleIsOpen}>
        {filter &&
          sortByStoredOrder(filter).map((v) => (
            <FilterInput
              key={v.id}
              label={v.label}
              value={v.input}
              addFilter={addFilter}
              isChecked={isChecked}
              removeFilter={removeFilter}
              isSort={true}
              close={toggleIsOpen}
            />
          ))}
        <FilterInput
          label={'View All'}
          value={'viewAll'}
          addFilter={clearFilter}
          isChecked={isChecked}
          removeFilter={clearFilter}
          isSort={true}
          close={toggleIsOpen}
        />
      </MobileFilt>
    </>
  );
}
function MobileFilt({children, isOpen, toggleIsOpen}) {
  // const [isOpen, setIsOpen] = useState(false);
  // function toggleIsOpen() {
  //   setIsOpen(!isOpen);
  // }
  return (
    <button
      className={`filter-space-between inline-border sort-by-button mobile-filter ${isOpen === 'filt' ? 'isOpen-btn' : ''}`}
      onClick={toggleIsOpen}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`filt-by-${isOpen === 'filt'}`}
          initial={{opacity: 1}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          style={{display: 'inline-block', width: '100%', textAlign: 'left'}}
        >
          {isOpen !== 'filt' ? 'Filter' : 'Close'}
        </motion.span>
      </AnimatePresence>
      <motion.svg
        width="11"
        height="12"
        viewBox="0 0 11 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{rotate: 0}}
        animate={{rotate: isOpen === 'filt' ? '45deg' : 0}}
        transition={{ease: 'easeInOut', duration: 0.15}}
      >
        <line x1="5.5" y1="0.5" x2="5.5" y2="11.5" stroke="black" />
        <line x1="4.37113e-08" y1="6" x2="11" y2="6" stroke="black" />
      </motion.svg>

      <AnimatePresence>
        {isOpen === 'filt' && (
          <motion.div
            className="sort-overflow-filter-hidden-container"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            <motion.div
              initial={{y: '-100%'}}
              animate={{y: '1px'}}
              exit={{y: '-100%'}}
              transition={{ease: 'easeInOut', duration: 0.15}}
            >
              <div className="sort-container">{children}</div>
            </motion.div>
          </motion.div>
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
  term,
  close,
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
          if (typeof close === 'function') close();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={term ? true : false}
      >
        {label}
        <AnimatePresence mode="popLayout">
          {hovered && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              // layoutId={`${isSort ? 'sort-' : ''}hover-indicator`}
              key={`${isSort ? 'sort-' : ''}hover-indicator`}
              style={{
                right: isSort ? 'auto' : 0,
                left: 0,
                height: isSort ? '3px' : '3px',
                width: isSort ? '100%' : '100%',
                position: 'absolute',
                bottom: 0,
                background: '#999999',
              }}
              transition={{ease: 'easeInOut', duration: 0.15}}
            />
          )}
          {isChecked(value) && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              // layoutId={`${isSort ? 'sort-' : ''}filter-indicator`}
              key={`${isSort ? 'sort-' : ''}filter-indicator`}
              style={{
                right: isSort ? 'auto' : 0,
                left: 0,
                height: isSort ? '3px' : '3px',
                width: isSort ? '100%' : '100%',
                position: 'absolute',
                bottom: 0,
                background: 'black',
              }}
              transition={{ease: 'easeInOut', duration: 0.15}}
            />
          )}
        </AnimatePresence>
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
