import React, {useState, useEffect, useRef} from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useNavigate, Link, useLocation} from '@remix-run/react';
import GridPlaceholder from './GridPlaceholder';

export function PaginatedResourceSection(props) {
  const location = useLocation();
  const key = location.pathname + location.search;

  return <PaginatedResourceSectionInner key={key} {...props} />;
}

function PaginatedResourceSectionInner({
  connection,
  children,
  resourcesClassName,
  fillEmptySpaces = true,
}) {
  const loadMoreRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {rootMargin: '100px'},
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, []);

  function cleanFilterUrl(url) {
    if (!url) return '';
    const parsed =
      typeof window !== 'undefined'
        ? new URL(url, window.location.origin)
        : new URL(url, 'http://localhost');
    const params = parsed.searchParams;

    const filter = params.get('filter');
    const direction = params.get('direction');
    const cursor = params.get('cursor');

    const clean = new URLSearchParams();
    if (filter) clean.set('filter', filter);
    if (direction) clean.set('direction', direction);
    if (cursor) clean.set('cursor', cursor);

    return `${parsed.pathname}?${clean.toString()}`;
  }

  return (
    <Pagination connection={connection}>
      {({
        nodes,
        isLoading,
        hasNextPage,
        nextPageUrl,
        hasPreviousPage,
        previousPageUrl,
        state,
      }) => {
        // Auto-load next page on scroll
        useEffect(() => {
          if (isIntersecting && hasNextPage && !isLoading) {
            nav(nextPageUrl, {
              replace: true,
              preventScrollReset: true,
              state,
            });
          }
        }, [isIntersecting, hasNextPage, isLoading, nextPageUrl, state]);

        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div
            className="account-orders-grid"
            style={{
              display: 'grid',
              gridColumn: '1/5',
              gridTemplateColumns: 'subgrid',
            }}
          >
            {hasPreviousPage && (
              <Link
                to={previousPageUrl}
                style={{
                  gridColumn: '1/-1',
                  borderBottom: '1px solid #e9e9e9',
                  padding: '12px 0',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'block',
                }}
                preventScrollReset
                replace
                state={state}
              >
                {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
              </Link>
            )}

            {resourcesClassName ? (
              <div className={resourcesClassName}>
                {resourcesMarkup}
                {fillEmptySpaces && <GridPlaceholder products={nodes} />}
              </div>
            ) : (
              resourcesMarkup
            )}

            {hasNextPage && (
              <div
                ref={loadMoreRef}
                style={{
                  textAlign: 'center',
                  padding: '8px 30px 8px 10px',
                  background: 'white',
                  gridColumn: '1/-1',
                }}
              >
                {isLoading ? 'Loading more...' : 'Scroll to load more'}
              </div>
            )}
          </div>
        );
      }}
    </Pagination>
  );
}
