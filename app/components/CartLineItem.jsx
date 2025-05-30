import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <li key={id} className="cart-line">
      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={300}
          loading="lazy"
          width={300}
        />
      )}

      <div className="cart-product-details">
        <div className="cart-title-price">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            style={{textDecoration: 'none'}}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <p>{product.title}</p>
          </Link>
          <ProductPrice price={line?.cost?.totalAmount} />
        </div>
        <div className="cart-variant-info">
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <span style={{color: '#999999'}}>{option.name}:</span>{' '}
                {option.value}
              </li>
            ))}
          </ul>
        </div>

        <CartLineQuantity line={line} />
        <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;

  const {id: lineId, quantity, isOptimistic, merchandise} = line;
  const availableQty = merchandise?.quantityAvailable ?? Infinity; // fallback just in case

  const prevQuantity = Math.max(0, quantity - 1);
  const nextQuantity = quantity + 1;

  const disableDecrease = quantity <= 1 || !!isOptimistic;
  const disableIncrease = !!isOptimistic || quantity >= availableQty;

  return (
    <div className="cart-line-quantity">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={disableDecrease}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722;</span>
        </button>
      </CartLineUpdateButton>

      <p>{quantity}</p>

      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          disabled={disableIncrease}
          name="increase-quantity"
          value={nextQuantity}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
