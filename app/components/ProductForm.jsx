import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useLocation} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'motion/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({
  productOptions,
  selectedVariant,
  compliments,
  openPopUp,
  closePopUp,
  chain,
  addAChain,
  removeChain,
}) {
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
        if (option.optionValues.length === 0) return null;

        const isColorOption =
          option.name.toLowerCase() === 'material' ||
          option.name.toLowerCase() === 'color';

        return (
          <div className="product-options" key={option.name}>
            <p>
              <span style={{color: '#999999'}}>{option.name}:</span>{' '}
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`${option.optionValues.find((v) => v.selected)?.name}`}
                  initial={{opacity: 1}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  style={{display: 'inline-block', width: '10rem'}}
                  transition={{ease: 'easeInOut', duration: 0.15}}
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
                      {selected && (
                        <motion.div
                          layoutId={`${option.name}-${selectedVariant.product.handle}`}
                          id={`${option.name}`}
                          transition={{ease: 'easeInOut', duration: 0.15}}
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '-1px',
                            right: '-1px',
                            height: '2px',
                            background: 'black',
                          }}
                        />
                      )}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      {compliments.productRecommendations.length > 0 ? (
        <Comps
          compliments={compliments.productRecommendations}
          openPopUp={openPopUp}
          closePopUp={closePopUp}
          chain={chain}
          addAChain={addAChain}
          removeChain={removeChain}
        />
      ) : null}
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
                ...(chain
                  ? [
                      {
                        merchandiseId: chain.id,
                        quantity: 1,
                        selectedVariant: chain,
                      },
                    ]
                  : []),
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'ADD TO CART' : 'SOLD OUT'}
      </AddToCartButton>
    </div>
  );
}
function Comps({
  compliments,
  chain,
  addAChain,
  removeChain,
  openPopUp,
  closePopUp,
}) {
  return (
    <div className="product-options">
      <div style={{display: 'flex', alignItems: 'center', gap: '.25rem'}}>
        <span style={{color: '#999999'}}>Add a Chain:</span>{' '}
        <AnimatePresence mode="popLayout">
          {chain && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{ease: 'easeInOut', duration: 0.15}}
              className="chain-title-container"
            >
              <span>{chain.product.title}</span>
              <button onClick={removeChain}>
                <span>Remove</span>
                <svg
                  width="15"
                  height="13"
                  viewBox="0 0 15 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.977 0.197266L7.65503 5.51984L2.35128 0.197266H0.328125L6.65294 6.52208L0.328125 12.8469H2.35128L7.65503 7.54254L12.977 12.8469H15.0001L8.67533 6.52208L15.0001 0.197266H12.977Z"
                    fill="black"
                  />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="product-options-grid">
        {compliments.map((comp) => (
          <Compliment
            compliment={comp}
            key={comp.id}
            setClicked={openPopUp}
            chain={chain}
          />
        ))}
      </div>
    </div>
  );
}

export function AddAChainPopUp({clicked, closePopUp, addAChain}) {
  const [selectedVariant, setSelectedVariant] = useState();

  useEffect(
    () => setSelectedVariant(clicked?.selectedOrFirstAvailableVariant),
    [clicked],
  );

  const productOptions = getProductOptions({
    ...clicked,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  function handleClick(variant) {
    setSelectedVariant(variant);
  }

  const itemStyle = (selected, available, isColorOption) => {
    return {
      opacity: available ? 1 : 0.3,
      padding: isColorOption ? 0 : null,
    };
  };
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width:768px)').matches;
    }
    return false; // default to desktop for SSR
  });

  const overlay = {
    initial: {opacity: 0},
    animate: {opacity: 1},
    exit: {opacity: 0},
  };

  const popup = {
    initial: {y: isMobile ? '100%' : 0},
    animate: {y: 0},
    exit: {y: isMobile ? '100%' : 0},
  };
  return (
    <motion.div
      className={`popupoverlay overlay ${clicked ? 'expanded' : ''}`}
      variants={overlay}
      initial="initial"
      animate="animate"
      exit="exit"
      key="popup"
    >
      <button
        onClick={closePopUp}
        style={{position: 'absolute', inset: 0, background: 'transparent'}}
      />
      <motion.div
        className="add-a-chain-pop-up"
        variants={popup}
        key="popup-p"
        transition={{ease: 'easeInOut', duration: 0.15}}
      >
        <div className="add-a-chain-header">
          <p>Add A Chain</p>
          <button onClick={closePopUp}>
            <span>Close</span>
            <svg
              width="15"
              height="13"
              viewBox="0 0 15 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.977 0.197266L7.65503 5.51984L2.35128 0.197266H0.328125L6.65294 6.52208L0.328125 12.8469H2.35128L7.65503 7.54254L12.977 12.8469H15.0001L8.67533 6.52208L15.0001 0.197266H12.977Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
        <Image data={clicked.images.nodes[0]} width={304} height={304} />
        <div className="add-a-chain-pop-up-title-and-money">
          <p>{clicked.title}</p>
          <div className="add-a-chain-pop-up-money">
            <Money data={clicked.priceRange.minVariantPrice} />
          </div>
        </div>
        {productOptions.map((option) => {
          if (option.optionValues.length === 0) return null;

          const isColorOption =
            option.name.toLowerCase() === 'material' ||
            option.name.toLowerCase() === 'color';

          return (
            <div className="product-options" key={option.name}>
              <p>
                <span style={{color: '#999999'}}>{option.name}:</span>{' '}
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`${option.optionValues.find((v) => v.selected)?.name}`}
                    initial={{opacity: 1}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    style={{display: 'inline-block', width: '10rem'}}
                    transition={{ease: 'easeInOut', duration: 0.15}}
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
                      <button className="product-options-item" style={styles}>
                        <ProductOptionSwatch
                          swatch={swatch}
                          name={name}
                          isColorOption={isColorOption}
                          productImage={variantImage}
                        />
                      </button>
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
                        onClick={() => handleClick(variant, name)}
                      >
                        <ProductOptionSwatch
                          swatch={swatch}
                          name={name}
                          isColorOption={isColorOption}
                          productImage={variantImage}
                        />
                        {selected && (
                          <motion.div
                            layoutId={`${option.name}-${clicked.handle}`}
                            id={`${option.name}`}
                            transition={{ease: 'easeInOut', duration: 0.15}}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: '-1px',
                              right: '-1px',
                              height: '2px',
                              background: 'black',
                            }}
                          />
                        )}
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
        <button
          className="cart-button"
          onClick={() => {
            setTimeout(() => addAChain(selectedVariant), 150);
            closePopUp();
          }}
        >
          ADD CHAIN
        </button>
      </motion.div>
    </motion.div>
  );
}

function Compliment({compliment, setClicked, chain}) {
  return (
    <button
      className="add-a-chain-option"
      onClick={() => setClicked(compliment)}
    >
      <div className="add-a-chain-option-img-container">
        <Image data={compliment.images.nodes[0]} width={200} height={200} />
        {chain?.product?.title === compliment.title && (
          <motion.div
            layoutId={`chain-indicator`}
            id={`chain-indicator`}
            transition={{ease: 'easeInOut', duration: 0.15}}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '-1px',
              right: '-1px',
              height: '2px',
              background: 'black',
            }}
          />
        )}
      </div>
      <p>{compliment.title}</p>
      <Money data={compliment.priceRange.minVariantPrice} />
    </button>
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
