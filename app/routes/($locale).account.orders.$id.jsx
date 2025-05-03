import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData, NavLink} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDER_QUERY,
    {
      variables: {orderId},
    },
  );

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  console.log(order);
  return (
    <div className="account-order">
      <div style={{paddingTop: '.25rem'}}>
        <p style={{marginBottom: '1rem'}}>
          ORDER {order.name.replace('#', '')}
        </p>
        <p className="track-order">
          <a target="_blank" href={order.statusPageUrl} rel="noreferrer">
            TRACK ORDER
          </a>
        </p>
      </div>
      <div style={{borderTop: '1px solid #e9e9e9', paddingTop: '.25rem'}}>
        <p>SHIPPING ADDRESS</p>
        <br />
        {order?.shippingAddress ? (
          <>
            <p>{order.shippingAddress.name}</p>
            <p>{`${order.shippingAddress.address1}${order.shippingAddress.address2 ? ', Apt ' + order.shippingAddress.address2 : ''}`}</p>
            <p>{`${order.shippingAddress.city}, ${order.shippingAddress.province}`}</p>
            <p>{`${order.shippingAddress.country}, ${order.shippingAddress.zip}`}</p>
          </>
        ) : (
          <p>No shipping address defined</p>
        )}
      </div>
      <div style={{borderTop: '1px solid #e9e9e9', paddingTop: '.25rem'}}>
        <p>ITEMS</p>
        {lineItems.map((lineItem, lineItemIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
        ))}
        {/* {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3}>
                  <p>Discounts</p>
                </th>
                <th scope="row">
                  <p>Discounts</p>
                </th>
                <td>
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </td>
              </tr>
            )} */}
      </div>
      <div style={{borderTop: '1px solid #e9e9e9', paddingTop: '.25rem'}}>
        <div className="total-container">
          <p>Subtotal</p>
          <Money data={order.subtotal} />
        </div>
        <div className="total-container">
          <p>Shipping</p>
          <Money data={order.totalShipping} />
        </div>
        <div className="total-container">
          <p>Tax</p>
          <Money data={order.totalTax} />
        </div>
      </div>
      <div
        className="total-container"
        style={{borderTop: '1px solid #e9e9e9', paddingTop: '.25rem'}}
      >
        <p>Total</p>
        <Money data={order.totalPrice} />
      </div>
      <NavLink to="/account/orders">← Back to Orders</NavLink>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <div className="line-item-container">
      {lineItem?.image && (
        <div style={{border: '1px solid #e9e9e9', width: 'fit-content'}}>
          <Image data={lineItem.image} width={194} height={194} />
        </div>
      )}
      <div className="line-item-inside-container">
        <div>
          <p style={{marginBottom: '1rem'}}>{lineItem.title}</p>
          <div>
            {lineItem?.variantOptions.map((opt) => (
              <p>
                <span>{`${opt.name}: `}</span>
                {opt.value}
              </p>
            ))}
            <p>
              <span>QTY: </span>
              {lineItem.quantity}
            </p>
          </div>
        </div>
        <Money data={lineItem.price} />
        {/* <Money data={lineItem.totalDiscount} /> */}
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
