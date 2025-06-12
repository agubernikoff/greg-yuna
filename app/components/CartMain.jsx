import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
// import {SimplyWidget} from './SimplyWidget';
import {useEffect, useRef, useState} from 'react';

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.

  // const [insurancePlan, setInsurancePlan] = useState({});
  // const [SkipProduct, setSkipProduct] = useState({});

  // useEffect(() => {
  //   var myHeaders = new Headers();
  //   myHeaders.append('shopname', 'greg-yuna-store.myshopify.com');

  //   var requestOptions = {
  //     method: 'GET',
  //     headers: myHeaders,
  //     redirect: 'follow',
  //   };

  //   fetch(
  //     'https://greg-yuna-store.myshopify.com/apps/simplyinsurance/storefront-api/metafields/',
  //     requestOptions,
  //   )
  //     .then((response) => response.json())
  //     .then((result) => {
  //       // setting state
  //       setInsurancePlan(result.data.InsurancePlan);
  //       setSkipProduct(result.data.SkipProduct);
  //     })
  //     .catch((error) => console.log('error', error));
  // }, []);

  const cart = useOptimisticCart(originalCart);
  const linesExist = cart?.lines?.nodes?.length > 0;
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity && cart?.totalQuantity > 0;

  return (
    <div className={className}>
      {!linesExist && <CartEmpty layout={layout} />}
      <div className="cart-details">
        <div aria-labelledby="cart-lines" className="cart-lines">
          <ul>
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>
        {/* {cartHasItems &&
          insurancePlan &&
          insurancePlan.planArray &&
          SkipProduct && (
            <SimplyWidget
              cart={cart}
              insurancePlan={insurancePlan}
              SkipProduct={SkipProduct}
            />
          )} */}
        {cart?.totalQuantity > 0 && <CartSummary cart={cart} layout={layout} />}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div className="empty-cart-div" hidden={hidden}>
      <p className="empty-cart-message">Your cart is empty.</p>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
