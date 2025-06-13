import {useLoaderData, NavLink, useLocation} from '@remix-run/react';
import {useState, useEffect, Suspense} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import ProductGridItem from '~/components/ProductGridItem';
import {AnimatePresence, motion} from 'motion/react';
import {AddAChainPopUp} from '~/components/ProductForm';
import {useNavigationContext} from '~/context/NavigationContext';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Greg Ÿuna | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}, compliments] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(COMPLEMENTARY_QUERY, {
      variables: {handle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
    compliments,
    request,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  const {handle} = params;
  const {storefront} = context;

  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.
  const recs = storefront.query(PRODUCT_RECOMENDATIONS_QUERY, {
    variables: {handle},
  });

  return {recs};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, compliments, recs} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const filteredImages = product.images.edges.filter((i) => {
    if (selectedVariant?.availableForSale || !i?.node?.altText)
      return (
        i?.node?.altText?.toLowerCase() ===
        selectedVariant?.image?.altText?.toLowerCase()
      );
    else
      return selectedVariant.title
        .toLowerCase()
        .includes(i?.node?.altText?.toLowerCase());
  });
  const productImage = filteredImages.map((edge) => (
    <ProductImage key={edge.node.id} image={edge.node} />
  ));

  const [imageIndex, setImageIndex] = useState(0);

  function handleScroll(scrollWidth, scrollLeft) {
    const widthOfAnImage = scrollWidth / filteredImages.length;
    const dividend = scrollLeft / widthOfAnImage;
    const rounded = parseFloat((scrollLeft / widthOfAnImage).toFixed(0));
    if (Math.abs(dividend - rounded) < 0.2) setImageIndex(rounded);
  }

  const mappedIndicators =
    filteredImages.length > 1
      ? filteredImages.map((e, i) => (
          <div
            key={e.node.id}
            className="circle"
            style={{
              height: '3px',
              width: '22px',
              position: 'relative',
            }}
          >
            {i === imageIndex ? (
              <motion.div
                layoutId="mapped-indicator"
                key="mapped-indicator"
                style={{
                  background: '#999999',
                  height: '3px',
                  width: '22px',
                  position: 'absolute',
                }}
                transition={{ease: 'easeInOut', duration: 0.15}}
              />
            ) : null}
          </div>
        ))
      : null;

  const {title, descriptionHtml} = product;

  const {lastCollectionPath} = useNavigationContext();
  console.log(lastCollectionPath);

  function capitalizeFirstLetter(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Prefer a non-"New Arrivals" collection if available
  const notNewArrivalsCollection = product.collections.nodes.find(
    (col) => col.title !== 'New Arrivals',
  );

  // Determine if lastCollectionPath is a valid collection path
  const isValidCollectionPath = lastCollectionPath?.includes('/collections/');

  // Choose the fallback collection if needed
  const fallbackCollection =
    notNewArrivalsCollection || product.collections.nodes[0];

  // Final path for breadcrumb
  const to = isValidCollectionPath
    ? lastCollectionPath
    : `/collections/${fallbackCollection?.handle}`;

  const [clicked, setClicked] = useState();

  function openPopUp(chain) {
    setClicked(chain);
  }
  function closePopUp() {
    setClicked();
  }

  const [chain, setChain] = useState();

  function addAChain(chain) {
    setChain(chain);
  }

  function removeChain() {
    setChain();
  }
  return (
    <>
      <div className="product">
        <div className="padded-filter-div full-border breadcrumbs">
          <>
            <NavLink className="crumb" to="/">
              Home
            </NavLink>
            <span className="crumb-dash">{' → '}</span>

            {to && (
              <>
                <NavLink className="crumb" to={to}>
                  {capitalizeFirstLetter(to.split('/collections/')[1])}
                </NavLink>
                <span className="crumb-dash">{' → '}</span>
              </>
            )}

            <span className="crumb">{title}</span>
          </>
        </div>
        <div
          style={{
            position: 'relative',
            gridColumnStart: 'span 2',
          }}
        >
          <div
            className="product-images"
            onScroll={(e) =>
              handleScroll(e.target.scrollWidth, e.target.scrollLeft)
            }
          >
            {productImage}
          </div>
          <div className="mapped-indicators">{mappedIndicators}</div>
        </div>
        <div className="product-main">
          <div className="product-main-details">
            <div className="product-title-price">
              <p>{title}</p>
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>
            {chain ? (
              <div className="chain-title-price">
                <p>{`+ ${chain.product.title}`}</p>
                <ProductPrice
                  price={chain?.price}
                  compareAtPrice={chain?.compareAtPrice}
                />
              </div>
            ) : null}

            {/* <br /> */}
            <motion.div
              layout
              transition={{ease: 'easeInOut', duration: 0.15}}
              style={{marginTop: '2rem'}}
            >
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                compliments={compliments}
                openPopUp={openPopUp}
                closePopUp={closePopUp}
                chain={chain}
                addAChain={addAChain}
                removeChain={removeChain}
              />
            </motion.div>
            <br />
            <br />
            <motion.p
              layout
              style={{color: '#999999', marginBottom: '.25rem'}}
              transition={{ease: 'easeInOut', duration: 0.15}}
            >
              Details:
            </motion.p>
            <motion.div
              transition={{ease: 'easeInOut', duration: 0.15}}
              layout
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
            <br />
          </div>
          <Analytics.ProductView
            data={{
              products: [
                {
                  id: product.id,
                  title: product.title,
                  price: selectedVariant?.price.amount || '0',
                  vendor: product.vendor,
                  variantId: selectedVariant?.id || '',
                  variantTitle: selectedVariant?.title || '',
                  quantity: 1,
                },
              ],
            }}
          />
        </div>
      </div>
      <AnimatePresence mode="popLayout">
        {clicked && (
          <AddAChainPopUp
            clicked={clicked}
            closePopUp={closePopUp}
            addAChain={addAChain}
          />
        )}
      </AnimatePresence>
      <YouMayAlsoLike recs={recs} />
    </>
  );
}

function YouMayAlsoLike({recs}) {
  const [resolvedCompliments, setResolvedCompliments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([recs])
      .then(([complimentsRes, recsRes]) => {
        const complimentsData = complimentsRes?.productRecommendations || [];
        const recsData = recsRes?.productRecommendations || [];

        const uniqueProducts = [
          ...new Map(
            [...complimentsData, ...recsData]
              .filter((p) => p?.id)
              .map((p) => [p.id, p]),
          ).values(),
        ].slice(0, 4);

        setResolvedCompliments(uniqueProducts);
      })
      .finally(() => setLoading(false));
  }, [recs]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="you-may-also-like-container">
      <p className="recs-title">Recommended Products</p>
      <div className="recommended-products">
        <div className="products-grid">
          {resolvedCompliments.map((product, index) => (
            <ProductGridItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    collections(first:2){
      nodes{
        handle
        title
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_RECOMENDATIONS_QUERY = `#graphql
query MyQuery(
$country: CountryCode
$handle: String!
$language: LanguageCode
) @inContext(country: $country, language: $language) {
  productRecommendations(intent: RELATED, productHandle: $handle) {
    images(first: 2) {
      nodes {
        id
        url
        width
        height
        altText
      }
    }
    id
    handle
    title
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
}`;

const COMPLEMENTARY_QUERY = `#graphql
query MyQuery(
$country: CountryCode
$handle: String!
$language: LanguageCode
) @inContext(country: $country, language: $language) {
  productRecommendations(intent: COMPLEMENTARY, productHandle: $handle) {
    images(first: 1) {
      nodes {
        url
        width
        height
        altText
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants {
      ...ProductVariant
    }
    id
    handle
    title
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
}
${PRODUCT_VARIANT_FRAGMENT}`;
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
