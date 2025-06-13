import {Suspense, useState} from 'react';
import {Await} from '@remix-run/react';
import NavLink from './NavLink';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="footer">
      <div className="footer-left">
        <p>
          Greg Yüna New York is an American jewelry brand known for intricate
          craftsmanship that seamlessly blends high-end jewelry with streetwise
          sophistication. Everything we make is inspired by the city we call
          home. Worn by the people we call family.
        </p>
      </div>
      <div className="footer-right">
        <Newsletter />
        <div>
          <Suspense>
            <Await resolve={footerPromise}>
              {(footer) =>
                footer?.menu &&
                header.shop.primaryDomain?.url && (
                  <FooterMenu
                    menu={footer.menu}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )
              }
            </Await>
          </Suspense>
          <p className="site-credit">
            © 2025 GREG YÜNA, ALL RIGHTS RESERVED /{' '}
            <a href="https://www.swallstudios.com/" target="_blank">
              Site Credit
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  function subscribe(e) {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email');
      setTimeout(() => {
        setError();
      }, 1500);
      return;
    }

    const payload = {
      data: {
        type: 'subscription',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email: `${email}`,
              },
            },
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: 'VqQNTT',
            },
          },
        },
      },
    };

    var requestOptions = {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        revision: '2025-04-15',
      },
      body: JSON.stringify(payload),
    };

    fetch(
      'https://a.klaviyo.com/client/subscriptions/?company_id=TBMgC2',
      requestOptions,
    ).then((result) => {
      if (result.ok) {
        setText('Thank you for subscribing.');
      } else {
        result.json().then((data) => {
          console.log(data);
          setError(data.errors[0].detail);
          setTimeout(() => {
            setError();
          }, 1500);
        });
      }
    });
  }

  return (
    // <div>
    //   <p>NEWSLETTER</p>
    //   <div className="newsletter-bar">
    //     <input placeholder="Enter Email" />
    //     <span className="subscribe-text">Subscribe</span>
    //   </div>
    // </div>
    <form
      className="footer-newsletter"
      onSubmit={subscribe}
      style={{position: 'relative'}}
    >
      <p>NEWSLETTER</p>
      <div
        className="newsletter-bar"
        style={text ? {border: 'none'} : undefined}
      >
        {!text ? (
          <>
            <input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="subscribe-text">
              Subscribe
            </button>
          </>
        ) : (
          <p>{text}</p>
        )}
      </div>
      <p style={{position: 'absolute', bottom: '-1.5rem', fontSize: '12px'}}>
        {error}
      </p>
    </form>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
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

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    // color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
