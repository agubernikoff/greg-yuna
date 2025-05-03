import {
  Link,
  useLoaderData,
  useOutletContext,
  useFetcher,
} from '@remix-run/react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useState} from 'react';
import {Logout} from './($locale).account';
import {useEffect} from 'react';
/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();
  const {orders} = customer;
  return (
    <div className="orders">
      <p className="orders-header">ORDER HISTORY</p>
      {orders.nodes.length ? <OrdersTable orders={orders} /> : <EmptyOrders />}
      <Addresses />
      <Logout />
    </div>
  );
}

/**
 * @param {Pick<CustomerOrdersFragment, 'orders'>}
 */
function OrdersTable({orders}) {
  return (
    <div className="account-orders">
      <p>ORDER #</p>
      <p>PLACED ON</p>
      <p>STATUS</p>
      <p>TOTAL</p>
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div>
      <p>You haven&apos;t placed any orders yet.</p>
      <br />
      <p>
        <Link to="/collections">Start Shopping →</Link>
      </p>
    </div>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  console.log(order.processedAt);
  return (
    <>
      <Link to={`/account/orders/${btoa(order.id)}`}>
        <strong className="order-number-link">#{order.number}</strong>
      </Link>
      <p>
        {new Date(order.processedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <p>
        {order.financialStatus === 'UNFULFILLED'
          ? 'Processing'
          : order.financialStatus === 'PAID'
            ? 'Fulfilled'
            : order.financialStatus === 'PARTIALLY_FULFILLED'
              ? 'Partially Fulfilled'
              : order.financialStatus}
      </p>
      {fulfillmentStatus && <p>{fulfillmentStatus}</p>}
      <Money className="order-item-money" data={order.totalPrice} />
    </>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

function Addresses() {
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;
  const [displayAddressForm, setDisplayAddressForm] = useState();
  const [address, setAddress] = useState();
  const [addressId, setAddressId] = useState();
  const [defaultAddy, setDefaultAddy] = useState();

  function openEditForm(address, defaultAddress) {
    setDisplayAddressForm(true);
    setAddress(address);
    setAddressId(address.id);
    setDefaultAddy(defaultAddress);
  }

  function openNewForm() {
    const newAddress = {
      address1: '',
      address2: '',
      city: '',
      company: '',
      territoryCode: '',
      firstName: '',
      id: 'new',
      lastName: '',
      phoneNumber: '',
      zoneCode: '',
      zip: '',
    };
    setDisplayAddressForm(true);
    setAddress(newAddress);
    setAddressId('NEW_ADDRESS_ID');
    setDefaultAddy(null);
  }

  function closeForm() {
    setDisplayAddressForm(false);
  }

  return (
    <div className="account-addresses">
      <p>{displayAddressForm ? 'ADD A NEW ADDRESS' : 'ADDRESSES'}</p>
      {!addresses.nodes.length ? (
        <p>You have no addresses saved.</p>
      ) : (
        <>
          {displayAddressForm ? (
            <AddressForm
              addressId={addressId}
              address={address}
              defaultAddress={defaultAddy}
              closeForm={closeForm}
            >
              {({stateForMethod}) => (
                <div className="form-button-container">
                  {addressId === 'NEW_ADDRESS_ID' ? (
                    <button
                      disabled={stateForMethod('POST') !== 'idle'}
                      formMethod="POST"
                      type="submit"
                    >
                      {stateForMethod('POST') !== 'idle'
                        ? 'Saving'
                        : 'Save Address'}
                    </button>
                  ) : (
                    <button
                      disabled={stateForMethod('PUT') !== 'idle'}
                      formMethod="PUT"
                      type="submit"
                    >
                      {stateForMethod('PUT') !== 'idle'
                        ? 'Saving Address'
                        : 'Save Address'}
                    </button>
                  )}
                  <button onClick={closeForm}>Cancel</button>
                </div>
              )}
            </AddressForm>
          ) : (
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
              openEditForm={openEditForm}
              openNewForm={openNewForm}
            />
          )}
        </>
      )}
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div>
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating' : 'Create'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

/**
 * @param {Pick<CustomerFragment, 'addresses' | 'defaultAddress'>}
 */
function ExistingAddresses({
  addresses,
  defaultAddress,
  openEditForm,
  openNewForm,
}) {
  return (
    <div className="existing-addresses">
      {addresses.nodes.map((address) => (
        <ExistingAddress
          key={address.id}
          address={address}
          defaultAddress={defaultAddress}
          openEditForm={openEditForm}
        />
      ))}
      <div className="add-address-btn-container">
        <button onClick={openNewForm}>+ Add Address</button>
      </div>
    </div>
  );
}

function ExistingAddress({address, defaultAddress, openEditForm}) {
  function formatPhoneNumber(e164Number) {
    if (!e164Number) return null;
    const match = e164Number.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (!match) return e164Number; // return as-is if it doesn't match expected US format
    const [, areaCode, centralOffice, lineNumber] = match;
    return `${areaCode}-${centralOffice}-${lineNumber}`;
  }
  const fetcher = useFetcher();
  return (
    <>
      <div className="existing-address-container">
        <div>
          <p>{`${address.firstName} ${address.lastName}`}</p>
          <p>{`${address.address1}${address.address2 ? ', Apt ' + address.address2 : ''}`}</p>
          <p>{`${address.city}, ${address.province}`}</p>
          <p>{`${address.country}, ${address.zip}`}</p>
        </div>
        <p>{formatPhoneNumber(address.phoneNumber)}</p>
        <div className="existing-address-form-buttons-container">
          <MakeDefaultButton
            addressId={address.id}
            defaultAddressId={defaultAddress.id}
          />
          <div className="edit-delete-button-container">
            <button onClick={() => openEditForm(address, defaultAddress)}>
              Edit
            </button>
            <button
              onClick={() => {
                fetcher.submit(
                  {addressId: address.id},
                  {method: 'delete', action: '/account/addresses'},
                );
              }}
              disabled={fetcher.state !== 'idle'}
            >
              {fetcher.state !== 'idle' ? 'Deleting' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
      {/* <AddressForm
        key={address.id}
        addressId={address.id}
        address={address}
        defaultAddress={defaultAddress}
      >
        {({stateForMethod}) => (
          <div>
            <button
              disabled={stateForMethod('PUT') !== 'idle'}
              formMethod="PUT"
              type="submit"
            >
              {stateForMethod('PUT') !== 'idle' ? 'Saving' : 'Save'}
            </button>
            <button
              disabled={stateForMethod('DELETE') !== 'idle'}
              formMethod="DELETE"
              type="submit"
            >
              {stateForMethod('DELETE') !== 'idle' ? 'Deleting' : 'Delete'}
            </button>
          </div>
        )}
      </AddressForm> */}
    </>
  );
}

function MakeDefaultButton({addressId, defaultAddressId}) {
  const fetcher = useFetcher();
  return (
    <button
      className={addressId === defaultAddressId ? 'default' : 'make-default'}
      disabled={
        fetcher.state !== 'idle' || addressId === defaultAddressId
          ? true
          : false
      }
      onClick={() => {
        fetcher.submit(
          {addressId: addressId, defaultAddress: 'on'},
          {method: 'put', action: '/account/addresses'},
        );
      }}
    >
      {fetcher.state !== 'idle'
        ? 'Saving'
        : addressId === defaultAddressId
          ? 'Default'
          : 'Make Default'}
    </button>
  );
}

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
  closeForm,
}) {
  const fetcher = useFetcher();
  /** @type {ActionReturnData} */
  const error = fetcher.data?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  useEffect(() => {
    if (fetcher?.data?.createdAddress) closeForm();
  }, [fetcher.data]);
  return (
    <fetcher.Form
      id={addressId}
      action="/account/addresses"
      navigate={false}
      className="addy-form"
    >
      {/* <fieldset> */}
      <input type="hidden" name="addressId" defaultValue={addressId} />
      <div>
        <label htmlFor="firstName">First name*</label>
        <input
          aria-label="First name"
          autoComplete="given-name"
          defaultValue={address?.firstName ?? ''}
          id="firstName"
          name="firstName"
          placeholder="First name"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="lastName">Last name*</label>
        <input
          aria-label="Last name"
          autoComplete="family-name"
          defaultValue={address?.lastName ?? ''}
          id="lastName"
          name="lastName"
          placeholder="Last name"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="company">Company</label>
        <input
          aria-label="Company"
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id="company"
          name="company"
          placeholder="Company"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="address1">Address line*</label>
        <input
          aria-label="Address line 1"
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id="address1"
          name="address1"
          placeholder="Address line 1*"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="address2">Address line 2</label>
        <input
          aria-label="Address line 2"
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id="address2"
          name="address2"
          placeholder="Address line 2"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="city">City*</label>
        <input
          aria-label="City"
          autoComplete="address-level2"
          defaultValue={address?.city ?? ''}
          id="city"
          name="city"
          placeholder="City"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="zoneCode">State / Province*</label>
        <input
          aria-label="State/Province"
          autoComplete="address-level1"
          defaultValue={address?.zoneCode ?? ''}
          id="zoneCode"
          name="zoneCode"
          placeholder="State / Province"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="zip">Zip / Postal Code*</label>
        <input
          aria-label="Zip"
          autoComplete="postal-code"
          defaultValue={address?.zip ?? ''}
          id="zip"
          name="zip"
          placeholder="Zip / Postal Code"
          required
          type="text"
        />
      </div>
      <div>
        <label htmlFor="territoryCode">Country Code*</label>
        <input
          aria-label="territoryCode"
          autoComplete="country"
          defaultValue={address?.territoryCode ?? ''}
          id="territoryCode"
          name="territoryCode"
          placeholder="Country"
          required
          type="text"
          maxLength={2}
        />
      </div>
      <div>
        <label htmlFor="phoneNumber">Phone</label>
        <input
          aria-label="Phone Number"
          autoComplete="tel"
          defaultValue={address?.phoneNumber ?? ''}
          id="phoneNumber"
          name="phoneNumber"
          placeholder="+16135551111"
          pattern="^\+?[1-9]\d{3,14}$"
          type="tel"
        />
      </div>
      <div>
        <input
          defaultChecked={isDefaultAddress}
          id="defaultAddress"
          name="defaultAddress"
          type="checkbox"
        />
        <label htmlFor="defaultAddress">Set as default address</label>
      </div>
      {error ? (
        <p>
          <mark>
            <small>{error}</small>
          </mark>
        </p>
      ) : (
        <br />
      )}
      {children({
        stateForMethod: (method) =>
          fetcher.formMethod === method ? fetcher.state : 'idle',
      })}
      {/* </fieldset> */}
    </fetcher.Form>
  );
}
