import {data as remixData} from '@shopify/remix-oxygen';
import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {useState} from 'react';
import {motion} from 'motion/react';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account-container">
      <div className="account">
        <p>ACCOUNT</p>
        {/* <AccountMenu /> */}
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

// function AccountMenu() {
//   function isActiveStyle({isActive, isPending}) {
//     return {
//       fontWeight: isActive ? 'bold' : undefined,
//       color: isPending ? 'grey' : 'black',
//     };
//   }

//   return (
//     <nav role="navigation">
//       <NavLink to="/account/orders" style={isActiveStyle}>
//         Orders &nbsp;
//       </NavLink>
//       &nbsp;|&nbsp;
//       <NavLink to="/account/profile" style={isActiveStyle}>
//         &nbsp; Profile &nbsp;
//       </NavLink>
//       &nbsp;|&nbsp;
//       <NavLink to="/account/addresses" style={isActiveStyle}>
//         &nbsp; Addresses &nbsp;
//       </NavLink>
//       &nbsp;|&nbsp;
//       <Logout />
//     </nav>
//   );
// }

export function Logout() {
  const [hover, setHover] = useState(false);
  return (
    <motion.Form
      className="account-logout"
      method="POST"
      action="/account/logout"
      layout
    >
      <motion.button
        type="submit"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={hover ? {background: 'black', color: 'white'} : null}
        layout
      >
        LOG OUT
      </motion.button>
    </motion.Form>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
