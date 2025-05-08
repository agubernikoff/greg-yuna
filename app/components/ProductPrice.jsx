import {Money} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'motion/react';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {price ? <Money data={price} /> : null}
          <s>
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${price.amount}`}
            initial={{opacity: 1}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{ease: 'easeInOut', duration: 0.15}}
          >
            <Money data={price} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
