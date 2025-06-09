import {CartForm, Money} from '@shopify/hydrogen';
import {useRef} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {useState} from 'react';
/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  console.log(cart);

  const [open, setOpen] = useState(false);
  function close() {
    setOpen(false);
  }
  return (
    <div aria-labelledby="cart-summary" className={className}>
      {/* <CartDiscounts discountCodes={cart.discountCodes} />
      <CartGiftCard giftCardCodes={cart.appliedGiftCards} /> */}
      <div className="cart-sub-text">
        <dl className="cart-subtotal">
          <dt>Subtotal</dt>
          <dd>
            {cart.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </dd>
        </dl>

        <p>Taxes and shipping calcuated at checkout.</p>
        <button onClick={() => setOpen(true)}>
          {cart.note.length > 0 ? 'Edit an order note' : 'Submit an order note'}
        </button>
      </div>
      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
      <AnimatePresence mode="popLayout">
        {open && <AddANote close={close} initialNote={cart.note} />}
      </AnimatePresence>
    </div>
  );
}

function AddANote({close, initialNote}) {
  const [note, setNote] = useState(initialNote);
  return (
    <motion.div
      className="note-form-container"
      initial={{y: '100%'}}
      animate={{y: 0}}
      exit={{y: '100%'}}
      transition={{ease: 'easeInOut', duration: 0.15}}
    >
      <div className="add-a-chain-header">
        <p>Order Note:</p>
        <button onClick={close}>
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
      <div className="textarea-container">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          id="note"
          class="textarea"
          placeholder="Message*"
          maxLength={1000}
        />
        <div id="counter" class="character-counter">
          {note.length}/1000
        </div>
      </div>
      <CartForm
        route="/cart"
        inputs={{note}}
        action={CartForm.ACTIONS.NoteUpdate}
      >
        {(fetcher) => (
          <button
            className="cart-button"
            type="submit"
            disabled={fetcher.state !== 'idle'}
            onClick={close}
          >
            SUBMIT
          </button>
        )}
      </CartForm>
    </motion.div>
  );
}
/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <div className="cart-checkout">
      <a href={checkoutUrl} target="_self">
        <p>Check Out</p>
      </a>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 * }}
 */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 * }}
 */
function CartGiftCard({giftCardCodes}) {
  const appliedGiftCardCodes = useRef([]);
  const giftCardCodeInput = useRef(null);
  const codes =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

/**
 * @param {{
 *   giftCardCodes?: string[];
 *   saveAppliedCode?: (code: string) => void;
 *   removeAppliedCode?: () => void;
 *   children: React.ReactNode;
 * }}
 */
function UpdateGiftCardForm({giftCardCodes, saveAppliedCode, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code);
        }
        return children;
      }}
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
