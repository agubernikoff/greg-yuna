import {useLoaderData, Link, redirect} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Filter} from './($locale).collections.$handle';
import ProductGridItem from '~/components/ProductGridItem';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Greg Yüna | Products`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const url = new URL(args.request.url);
  const isHardRefresh =
    args.request.method === 'GET' &&
    args.request.headers.get('sec-fetch-dest') === 'document';

  if (isHardRefresh) {
    const paginationKeys = ['cursor', 'direction'];
    let shouldRedirect = false;

    for (const key of paginationKeys) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        shouldRedirect = true;
      }
    }

    if (shouldRedirect) {
      return redirect(`${url.pathname}?${url.searchParams.toString()}`);
    }
  }
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
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });
  let query = null;
  let reverse = false;
  let sortKey = null;

  if (searchParams.has('filter')) {
    query = `tag:${JSON.parse(searchParams.get('filter')).tag}`;
  }
  if (searchParams.has('sortKey')) sortKey = searchParams.get('sortKey');
  if (searchParams.has('reverse'))
    reverse = searchParams.get('reverse') === 'true';

  const [{products}, {search}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        query,
        reverse,
        sortKey,
      },
    }),
    storefront.query(SEARCH_QUERY_FOR_FILTERS),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    products,
    filters: search?.productFilters,
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
  const {products, filters} = useLoaderData();
  return (
    <div className="collection">
      <div className="filter-placeholder" />
      <Filter title={'Shop All'} filters={filters} shopAll={true} />
      <PaginatedResourceSection
        connection={products}
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
            id: 'shop_all',
            handle: 'shop_all',
          },
        }}
      />
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
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

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
    $reverse: Boolean
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, query: $query,reverse: $reverse, sortKey: $sortKey) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
`;

const SEARCH_QUERY_FOR_FILTERS = `#graphql
query SEARCH {
  search(first: 1, query: "") {
    productFilters {
      id
      label
      presentation
      type
      values {
        id
        count
        input
        label
      }
    }
  }
}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
