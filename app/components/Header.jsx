import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {motion} from 'motion/react';
import {useState} from 'react';
import {useEffect} from 'react';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [t, setT] = useState(true);
  useEffect(() => {
    setTimeout(() => setT(false), 1000);
  }, []);
  return (
    <motion.header
      className="header"
      initial={{width: '100vw'}}
      animate={{width: 'auto'}}
      style={{justifyContent: t ? 'center' : 'space-between'}}
      transition={{width: {delay: 2, duration: 1}}}
    >
      <motion.div
        layout
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{opacity: {duration: 1}, layout: {duration: 1}}}
      >
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
          <Logo />
        </NavLink>
      </motion.div>
      {/* <button onClick={toggle}>fuck</button> */}
      <motion.div
        style={{
          position: 'absolute',
          left: 'calc(57px * .5)',
          bottom: '1rem',
          transform: 'translateX(-50%)',
        }}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 2, duration: 1}}
      >
        ☰
      </motion.div>
      {/* <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
    </motion.header>
  );
}

function Logo() {
  return (
    <motion.svg
      initial={{width: '351px', height: '362px'}}
      animate={{width: '41px', height: '42.281px'}}
      transition={{
        width: {delay: 1, duration: 1},
        height: {delay: 1, duration: 1},
      }}
      width="351"
      height="362"
      viewBox="0 0 351 362"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_104_2698)">
        <path
          d="M350.744 90.9433C349.6 94.6682 345.047 94.3969 341.967 95.5335C334.803 98.1733 330.982 104.23 328.013 110.859C324.713 118.235 321.743 126.008 318.642 133.502C293.945 193.248 270.041 253.325 245.183 313.005C235.189 338.347 202.683 369.122 173.419 358.937C163.131 355.359 159.604 348.708 157.118 338.728C157.059 338.501 157.265 338.376 156.825 338.435C141.411 347.887 124.847 355.476 106.992 359.069C78.5853 364.788 51.0806 360.11 25.0423 348.231C13.8747 343.135 -0.753942 334.248 0.389951 319.993C1.26254 309.156 15.2312 293.537 22.3439 285.339C26.8828 280.104 31.715 275.198 36.4813 270.19L36.2026 269.728C29.4199 263.876 19.0002 259.081 18.3329 248.947C17.541 236.804 26.9268 224.903 35.1247 216.926L48.5948 204.827C44.3785 200.764 39.605 197.296 35.3227 193.314C3.44033 163.69 10.4577 114.686 46.4683 92.0358C71.5533 76.2633 98.1635 76.3146 125.104 87.5336C128.418 88.9121 131.879 90.9139 135.208 92.0652C139.102 93.4144 143.487 92.9817 147.505 92.4611L148.524 86.067H234.602L234.969 92.8717C229.528 93.9276 223.75 93.4804 218.815 96.3328C207.625 102.785 213.975 117.113 217.854 126.155C231.816 154.532 244.978 183.32 259.035 211.646C260.589 214.777 262.144 217.915 263.889 220.944L264.292 220.673C276.23 190.11 289.34 160.002 301.307 129.454C304.24 121.968 308.97 111.049 308.383 102.961C307.709 93.6857 297.59 94.0156 290.624 93.297V86.2724H350.157L350.744 88.6115V90.9506V90.9433ZM84.2828 90.4153C54.9595 92.3511 50.2666 122.789 51.3445 146.466C52.5178 172.196 65.2106 205.553 96.851 200.772C128.183 196.035 128.675 156.702 124.466 132.483C120.961 112.289 107.821 88.8608 84.2828 90.4153ZM152.051 111.834C153.723 115.698 155.989 119.269 157.609 123.163C171.439 156.416 154.559 194.422 120.924 206.506C106.266 211.771 90.0903 212.812 74.6917 210.766C70.7981 210.245 63.7294 208.09 60.3197 209.329C58.4719 210.003 55.0109 213.685 53.581 215.276C45.2951 224.486 40.3382 237.501 56.9613 240.595C65.4452 242.172 74.2737 242.113 82.8749 242.597C95.7951 243.323 108.789 243.983 121.709 244.753C143.641 246.051 168.872 245.574 180.78 267.653C189.8 284.379 184.425 300.855 178.295 317.354V318.153C182.68 319.531 187.241 320.272 191.633 321.606C200.571 324.312 207.024 329.24 216.219 323.066C227.35 315.586 233.664 297.614 238.613 285.537C240.901 279.957 243.871 273.424 245.601 267.733C246.576 264.544 246.173 262.146 244.934 259.118C226.008 219.947 208.065 180.284 188.92 141.223C186.852 137.007 184.762 132.776 182.606 128.604C180.436 124.402 177.796 118.705 175.252 114.884C174.298 113.462 172.502 111.827 170.698 111.827H152.058L152.051 111.834ZM50.7066 271.935C49.6874 272.06 48.7048 272.434 47.8322 272.969C39.0624 285.962 19.6968 305.203 36.4079 319.891C49.3574 331.278 73.3792 335.055 90.0756 336.484C93.0013 336.734 96.7923 337.232 99.6447 337.078C106.655 336.704 115.417 335.377 122.442 334.307C133.287 332.657 143.956 330.061 153.085 323.762C168.542 313.093 182.43 286.63 155.563 280.17C147.483 278.227 138.955 277.281 130.676 276.562C109.075 274.685 87.3185 273.768 65.6872 272.654C61.3316 272.426 54.8495 271.436 50.7139 271.928L50.7066 271.935Z"
          fill="black"
        />
        <path
          d="M218.369 0.442073C234.434 -1.10512 246.709 13.0762 242.559 28.7314C237.947 46.1025 215.465 50.2381 203.96 36.988C192.55 23.8479 201.078 2.10658 218.369 0.442073Z"
          fill="black"
        />
        <path
          d="M289.808 0.45226C306.013 -0.984939 317.856 13.1817 313.757 28.8956C308.257 49.9697 276.639 50.2043 271.051 29.0496C267.605 15.9901 275.891 1.69148 289.808 0.459593V0.45226Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_104_2698">
          <rect width="350.743" height="361.683" fill="white" />
        </clipPath>
      </defs>
    </motion.svg>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
