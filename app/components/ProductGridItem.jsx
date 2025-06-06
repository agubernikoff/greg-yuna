import React, {useState} from 'react';
import {useVariantUrl} from '~/lib/variants';
import {Link, useLocation} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {motion} from 'motion/react';
import {useNavigationContext} from '~/context/NavigationContext';
import {useEffect} from 'react';

function ProductGridItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const {pathname} = useLocation();

  const [imageIndex, setImageIndex] = useState(0);

  function handleScroll(scrollWidth, scrollLeft) {
    const widthOfAnImage = scrollWidth / product.images.nodes.length;
    const dividend = scrollLeft / widthOfAnImage;
    const rounded = parseFloat((scrollLeft / widthOfAnImage).toFixed(0));
    if (Math.abs(dividend - rounded) < 0.2) setImageIndex(rounded);
  }

  const mappedIndicators =
    product.images.nodes.length > 1
      ? product.images.nodes.map((e, i) => (
          <div
            key={e.id}
            className="circle"
            style={{
              height: '3px',
              width: '22px',
              position: 'relative',
            }}
          >
            {i === imageIndex ? (
              <motion.div
                layoutId={`product-grid-indicator-${product.handle}`}
                key={`product-grid-indicator-${product.handle}`}
                id={`product-grid-indicator-${product.handle}`}
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

  const {setLastCollectionPath} = useNavigationContext();

  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      onClick={() => setLastCollectionPath(pathname)}
    >
      <div style={{position: 'relative'}}>
        <div
          className="product-item-imgs-container"
          onScroll={(e) =>
            handleScroll(e.target.scrollWidth, e.target.scrollLeft)
          }
        >
          {product.images.nodes.map((image) => (
            <Image
              key={image.id}
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={'eager'}
              sizes="(min-width: 45em) 400px, 100vw"
            />
          ))}
        </div>
        <div className="mapped-indicators">{mappedIndicators}</div>
      </div>
      <div className="product-item-details">
        <p>{product.title.toLowerCase()}</p>
        <Money data={product.priceRange.minVariantPrice} />
      </div>
    </Link>
  );
}

export default ProductGridItem;
