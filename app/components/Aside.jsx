import {createContext, useContext, useEffect, useState} from 'react';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {
    type: activeType,
    close,
    growVertically,
    growHorizontally,
  } = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
    >
      <button className="close-outside" onClick={close} />
      <aside
        id={type}
        className={`${growVertically ? 'taller' : ''} ${growHorizontally ? 'wider' : ''}`}
      >
        <header>
          <h3>{heading}</h3>
          <button className="close reset" onClick={close} aria-label="Close">
            &times;
          </button>
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');
  const [growVertically, setGrowVertically] = useState(false);
  const [growHorizontally, setGrowHorizontally] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    window
      .matchMedia('(max-width:500px)')
      .addEventListener('change', (e) => setIsMobile(e.matches));
    if (window.matchMedia('(max-width:500px)').matches) setIsMobile(true);
  }, []);

  return (
    <AsideContext.Provider
      value={{
        type,
        growVertically,
        growHorizontally,
        open: (type) => {
          setType(type);
          if (type === 'cart') {
            setGrowHorizontally(true);
            setTimeout(() => {
              setGrowVertically(true);
            }, 400);
          }
        },
        close: () => {
          if (type === 'cart' && !isMobile) {
            setGrowVertically(false);
            setTimeout(() => {
              setGrowHorizontally(false);
            }, 400);
            setTimeout(() => {
              setType('closed');
            }, 800);
          } else setType('closed');
        },
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
