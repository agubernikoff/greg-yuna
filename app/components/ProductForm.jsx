import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import React, {useEffect} from 'react';
import {Link, useNavigate, useLocation} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'motion/react';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
  const location = useLocation();

  // useEffect(() => {
  //   console.log('🔁 Variant changed! Location is now:', location.search);
  // }, [location.search]);

  // useEffect(() => {
  //   console.log(
  //     'Selected Option Values:',
  //     productOptions.map((opt) => opt.optionValues.filter((v) => v.selected)),
  //   );
  // }, [productOptions]);

  const navigate = useNavigate();
  const {open} = useAside();

  const itemStyle = (selected, available, isColorOption) => {
    return {
      opacity: available ? 1 : 0.3,
      padding: isColorOption ? 0 : null,
    };
  };

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        const isColorOption = option.name.toLowerCase() === 'color';

        return (
          <div className="product-options" key={option.name}>
            <p>
              <span style={{color: '#999999'}}>{option.name}:</span>{' '}
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`${option.optionValues.find((v) => v.selected)?.name}`}
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  style={{display: 'inline-block', width: '10rem'}}
                >
                  {option.optionValues.find((v) => v.selected)?.name || ''}
                </motion.span>
              </AnimatePresence>
            </p>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                  variant,
                } = value;
                const variantImage = isColorOption ? variant?.image : null;
                const styles = itemStyle(selected, available, isColorOption);

                if (isDifferentProduct) {
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={styles}
                      state={location.state}
                    >
                      <ProductOptionSwatch
                        swatch={swatch}
                        name={name}
                        isColorOption={isColorOption}
                        productImage={variantImage}
                      />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={`product-options-item${
                        exists && !selected ? ' link' : ''
                      }`}
                      key={option.name + name}
                      style={styles}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                            state: location.state,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch
                        swatch={swatch}
                        name={name}
                        isColorOption={isColorOption}
                        productImage={variantImage}
                      />
                      {selected ? (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '-1px',
                            right: '-1px',
                            height: '2px',
                            background: 'black',
                          }}
                        />
                      ) : null}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'ADD TO CART' : 'SOLD OUT'}
      </AddToCartButton>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 *   isColorOption: boolean;
 *   productImage?: string;
 * }}
 */
function ProductOptionSwatch({swatch, name, isColorOption, productImage}) {
  if (isColorOption) {
    const image = productImage || swatch?.image?.previewImage;
    return (
      <div
        aria-label={name}
        className="product-option-label-swatch"
        style={{
          backgroundColor: image
            ? 'transparent'
            : swatch?.color || 'transparent',
        }}
      >
        <Image data={productImage} alt={name} aspectRatio="1/1" width="75px" />
      </div>
    );
  }

  return <div className="product-option-label-text">{name}</div>;
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
