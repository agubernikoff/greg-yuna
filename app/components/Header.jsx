import React, {Suspense, useId} from 'react';
import {Await, useAsyncValue, useLocation} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {motion} from 'motion/react';
import {useState, useEffect} from 'react';
import {SearchFormPredictive} from './SearchFormPredictive';
import NavLink from './NavLink';
import {LocationForm} from './PageLayout';
import LoaderAnimation from './LoaderAnimation';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  // const [t, setT] = useState(true);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setT(false);
  //   }, 1000);

  //   setTimeout(() => {
  //     const banner = document.querySelector('#shopify-pc__banner');
  //     if (banner) {
  //       banner.style.opacity = 1;
  //     }
  //   }, 2000);
  // }, []);
  const {close, type} = useAside();
  const [isMobile, setIsMobile] = useState(false);
  const [zIndex, setZindex] = useState(10);
  // Detect mobile screen
  // useEffect(() => {
  //   const mediaQuery = window.matchMedia('(max-width: 768px)');
  //   const handleChange = (e) => setIsMobile(e.matches);

  //   handleChange(mediaQuery);
  //   mediaQuery.addEventListener('change', handleChange);
  //   return () => mediaQuery.removeEventListener('change', handleChange);
  // }, []);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Check if animation has already run in this session
    const hasAnimationRun = sessionStorage.getItem('loader-animation-run');

    if (hasAnimationRun) {
      setShouldAnimate(false);
    } else {
      // Mark animation as run in session storage
      sessionStorage.setItem('loader-animation-run', 'true');
    }
  }, []);

  useEffect(() => {
    if (type === 'cart') setZindex(9);
    else setTimeout(() => setZindex(10), 150);
  }, [type]);

  useEffect(() => {
    const headerElement = document.querySelector('header');

    const interval = setInterval(() => {
      const bannerVisible = !!document.querySelector('[class*="cmp-wrapper"]');
      console.log('Polling. Cookie banner visible?', bannerVisible);
      if (bannerVisible) {
        setZindex(0);
        if (headerElement) headerElement.style.zIndex = 0;
      } else {
        setZindex(10);
        if (headerElement) headerElement.style.zIndex = 10;
      }
    }, 500); // every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {shouldAnimate && <LoaderAnimation />}
      <motion.header
        className="header"
        // initial={
        //   !isMobile
        //     ? {width: '100vw', height: '100vh'}
        //     : {width: '100vw', height: '100vh'}
        // }
        // animate={
        //   !isMobile
        //     ? {width: 'var(--header-width)', height: '100vh'}
        //     : {width: '100vw', height: 'var(--header-height)'}
        // }
        // style={{
        //   justifyContent: t ? 'center' : 'space-between',
        //   alignItems: !isMobile ? 'center' : t ? 'center' : 'flex-start',
        //   position: 'fixed',
        //   // zIndex,
        // }}
        // transition={
        //   !isMobile
        //     ? {width: {delay: 1.5, duration: 0.5}}
        //     : {height: {delay: 1.5, duration: 0.5}}
        // }
        layoutRoot
        layoutScroll
      >
        <CartToggle cart={cart} />
        <motion.div
          layout
          // initial={{opacity: 0}}
          // animate={{opacity: 1}}
          // transition={{opacity: {duration: 1}, layout: {duration: 0.5}}}
        >
          <NavLink
            prefetch="intent"
            to="/"
            style={activeLinkStyle}
            end
            onClick={close}
          >
            <Logo isMobile={isMobile} />
          </NavLink>
        </motion.div>
        {/* <button onClick={toggle}>fuck</button> */}
        <MenuToggle />
        {/* <HeaderMenu
      menu={menu}
      viewport="desktop"
      primaryDomainUrl={header.shop.primaryDomain.url}
      publicStoreDomain={publicStoreDomain}
    />
    <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
      </motion.header>
    </>
  );
}
function MenuToggle({}) {
  const {open, close, type} = useAside();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (type === 'mobile') setIsOpen(true);
    else setIsOpen(false);
  }, [type]);

  function handleClick() {
    if (!isOpen) open('mobile');
    else close();
  }
  return (
    <motion.button
      // initial={{opacity: 0}}
      // animate={{opacity: 1}}
      // transition={{delay: 2, duration: 0.5}}
      onClick={handleClick}
    >
      <svg
        width="49"
        height="34"
        viewBox="0 0 49 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          className="line"
          x1="11"
          y1="10.5"
          x2="38"
          y2="10.5"
          stroke="black"
          style={{opacity: isOpen ? 0 : 1}}
        />
        <line
          className="line"
          x1="11"
          y1="14.5"
          x2="38"
          y2="14.5"
          stroke="black"
          style={{
            transformOrigin: 'center',
            transform: isOpen
              ? 'rotate(-15deg) translateY(2px)'
              : 'rotate(0deg) translateY(0px)',
          }}
        />
        <line
          className="line"
          x1="11"
          y1="18.5"
          x2="38"
          y2="18.5"
          stroke="black"
          style={{
            transformOrigin: 'center',
            transform: isOpen
              ? 'rotate(15deg) translateY(-2px)'
              : 'rotate(0deg) translateY(0px)',
          }}
        />
        <line
          className="line"
          x1="11"
          y1="22.5"
          x2="38"
          y2="22.5"
          stroke="black"
          style={{opacity: isOpen ? 0 : 1}}
        />
      </svg>
    </motion.button>
  );
}
function Logo({isMobile}) {
  return (
    <motion.svg
      // initial={
      //   !isMobile
      //     ? {width: '351px', height: '362px'}
      //     : {width: '274px', height: '282px'}
      // }
      // animate={
      //   !isMobile
      //     ? {width: '32px', height: '32px'}
      //     : {width: '32px', height: '32px'}
      // }
      // transition={{
      //   width: {delay: 1, duration: 0.5},
      //   height: {delay: 1, duration: 0.5},
      // }}
      initial={
        !isMobile
          ? {width: '32px', height: '32px'}
          : {width: '32px', height: '32px'}
      }
      animate={
        !isMobile
          ? {width: '32px', height: '32px'}
          : {width: '32px', height: '32px'}
      }
      width="351"
      height="362"
      viewBox="0 0 351 362"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        maxWidth:
          'calc(100vw - 2rem - var(--cart-badge-adjustment) - var(--cart-badge-adjustment))',
      }}
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
  selectedLocale,
  availableCountries,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();
  const queriesDatalistId = useId();

  const [open, setOpen] = useState(false);
  function openLocation() {
    setOpen(true);
  }
  function closeLocation() {
    setOpen(false);
  }

  return (
    <div className="header-menu-container">
      <SearchFormPredictive>
        {({fetchResults, goToSearch, inputRef}) => (
          <>
            <input
              name="q"
              onChange={fetchResults}
              onFocus={fetchResults}
              placeholder="Search"
              ref={inputRef}
              type="search"
              list={queriesDatalistId}
            />

            <button onClick={goToSearch}>→</button>
          </>
        )}
      </SearchFormPredictive>
      <nav className={className} role="navigation">
        {/* {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )} */}
        {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
          if (!item.url) return null;

          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;

          return item.items && item.items.length > 0 ? (
            <React.Fragment key={item.id}>
              <NavLink
                className="header-menu-item-blank"
                end
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                }}
                prefetch="intent"
                style={{cursor: 'auto'}}
                to={url}
              >
                {''}
              </NavLink>

              {item.items.map((item) => {
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
                    key={`${item.id}${item.resourceId}`}
                    onClick={close}
                    prefetch="intent"
                    style={activeLinkStyle}
                    to={url}
                  >
                    {item.title}
                  </NavLink>
                );
              })}
            </React.Fragment>
          ) : (
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
      <nav className="header-menu-bottom-container">
        <NavLink
          className="header-menu-item-aux"
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/account"
        >
          Account
        </NavLink>
        <NavLink
          className="header-menu-item-aux"
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/contact"
        >
          Contact
        </NavLink>
      </nav>
      <LocationToggle
        selectedLocale={selectedLocale}
        availableCountries={availableCountries}
        openLocation={openLocation}
        closeLocation={closeLocation}
        open={open}
      />
    </div>
  );
}

function LocationToggle({
  selectedLocale,
  availableCountries,
  openLocation,
  closeLocation,
  open,
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={availableCountries}>
        {(availableCountries) => {
          return (
            <div
              style={{
                height: '100%',
                position: 'absolute',
                width: '100%',
                top: 0,
                left: 0,
                background: open ? 'rgba(0,0,0,0.2)' : 'transparent',
                transition: 'background 150ms ease-in-out',
                pointerEvents: open ? 'auto' : 'none',
              }}
            >
              {open && (
                <button
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'transparent',
                    border: 'none',
                  }}
                  onClick={closeLocation}
                />
              )}
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  borderTop: '1px solid #e9e9e9',
                  left: 0,
                  right: 0,
                  background: 'white',
                  pointerEvents: 'auto',
                }}
                initial={{height: '32px'}}
                animate={{height: open ? 'auto' : '32px'}}
              >
                <button
                  className="header-menu-item-aux"
                  onClick={() => {
                    if (!open) openLocation();
                    else closeLocation();
                  }}
                >
                  <div style={{flex: 1, textAlign: 'left', height: '16px'}}>
                    <span
                      style={{opacity: open ? 0 : 1}}
                    >{`${availableCountries.localization.country.name} (${availableCountries.localization.country.currency.isoCode} ${availableCountries.localization.country.currency.symbol})`}</span>
                    <span style={{opacity: !open ? 0 : 1}}>
                      CHOOSE A LOCATION
                    </span>
                  </div>
                  <svg
                    width="9"
                    height="6"
                    viewBox="0 0 9 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      rotate: open ? '-180deg' : '0deg',
                      transition: 'rotate 150ms ease-in-out',
                    }}
                  >
                    <path d="M8 4.75L4.5 1.25L0.999999 4.75" stroke="black" />
                  </svg>
                </button>

                <LocationForm
                  availableCountries={availableCountries}
                  selectedLocale={selectedLocale}
                  close={closeLocation}
                />
              </motion.div>
            </div>
          );
        }}
      </Await>
    </Suspense>
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
  const {open, close, type} = useAside();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (type === 'cart') setIsOpen(true);
    else setIsOpen(false);
  }, [type]);

  const {publish, shop, cart, prevCart} = useAnalytics();

  const {pathname} = useLocation();

  return (
    <motion.a
      // initial={{opacity: 0}}
      // animate={{opacity: 1}}
      // transition={{delay: 2, duration: 0.5}}
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        if (isOpen) close();
        else open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      style={{
        display: isOpen ? 'none' : 'inline',
        visibility:
          count === 0 &&
          !pathname.includes('/collections') &&
          !pathname.includes('/product')
            ? 'hidden'
            : 'visible',
      }}
      className="cart-badge"
    >
      <span>{`Bag [${count === null ? <span>&nbsp;</span> : count}]`}</span>
      <svg
        width="25"
        height="21"
        viewBox="0 0 25 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M21.3287 5H3.96032L1 20H24L21.3287 5Z" stroke="black" />
        <path
          d="M8 8.5V3C8 1.89543 8.89543 1 10 1H15.5C16.6046 1 17.5 1.89543 17.5 3V8.5"
          stroke="black"
        />
      </svg>
    </motion.a>
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
  return null;
  // {
  //   fontWeight: isActive ? 'bold' : undefined,
  //   color: isPending ? 'grey' : 'black',
  // };
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
