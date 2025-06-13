import {Await, useLoaderData} from '@remix-run/react';
import {Suspense, useState, useEffect} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import ProductGridItem from '~/components/ProductGridItem';
import {motion} from 'motion/react';
import NavLink from '~/components/NavLink';
import mobileIcon from '~/assets/Social-Sharing.jpg';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Greg Ÿuna'},
    {name: 'og:title', property: 'Greg Ÿuna'},
    {property: 'og:image', content: mobileIcon},
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}) {
  const [newArrivals, {collections}, storeLocations] = await Promise.all([
    context.storefront.query(NEW_ARRIVALS_QUERY),
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(STORE_LOCATIONS_QUERY),
  ]);

  return {
    featuredCollection: newArrivals.collection,
    collections,
    storeLocations,
  };
}

function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.featuredCollection} />
      <Collections collections={data.collections} />
      <FlagshipHome storeLocations={data.storeLocations} />
    </div>
  );
}

function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <NavLink
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div
          className="featured-collection-image"
          style={{
            background: `url("${image.url}&width=100") center center`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <p>{collection.title.toUpperCase()}</p>
    </NavLink>
  );
}

function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product, index) => (
                    <ProductGridItem
                      key={product.id}
                      product={product}
                      loading={index < 8 ? 'eager' : undefined}
                    />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

function Collections({collections}) {
  const mapped = collections.nodes.map((node) => (
    <CollectionGridItem key={node.id} node={node} />
  ));
  return <div className="collections-container">{mapped}</div>;
}

function CollectionGridItem({node}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={`collection-grid-item ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink to={`/collections/${node.handle}`}>
        <Image data={node.image} sizes="25vw" aspectRatio=".8/1" />
      </NavLink>
      <p>{`Shop ${node.title} →`}</p>
    </motion.div>
  );
}

function FlagshipHome({storeLocations}) {
  useEffect(() => {}, [storeLocations]);

  if (!storeLocations) return null;

  const getImageFromMetaobjectFields = (nodes) => {
    const imageField = nodes?.[0]?.fields?.find((f) => f.key === 'image');
    return imageField?.reference?.image?.url || null;
  };

  const mainImageUrl = getImageFromMetaobjectFields(
    storeLocations.store_location_main.nodes,
  );
  const secondaryImageUrl = getImageFromMetaobjectFields(
    storeLocations.store_location_secondary.nodes,
  );

  return (
    <div className="flagship-container">
      <div className="flagship-left">
        {mainImageUrl && (
          <img
            src={mainImageUrl}
            alt="Greg Yuna Flagship"
            className="flagship-image"
          />
        )}
      </div>
      <div className="flagship-right">
        <p className="flagship-title">GREG YUNA NOLITA FLAGSHIP</p>
        {secondaryImageUrl && (
          <img
            src={secondaryImageUrl}
            alt="flagship"
            className="flagship-subimage"
          />
        )}
        <p className="flagship-address">215 Mulberry Street</p>
        <p className="flagship-address">New York, New York</p>
        <p className="flagship-address">Monday–Sunday, 12PM–7PM</p>
      </div>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true, query:"NOT title:'New Arrivals'") {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment ProductItem on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
`;

const STORE_LOCATIONS_QUERY = `#graphql
  query StoreLocationImages {
  store_location_main: metaobjects(type: "store_location_main", first: 1) {
    nodes {
      fields {
        key
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
  store_location_secondary: metaobjects(type: "store_location_secondary", first: 1) {
    nodes {
      fields {
        key
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
}
`;

const NEW_ARRIVALS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: "new-arrivals-1") {
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
        first: 12
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
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
