// import * as React from 'react';
// import {Pagination} from '@shopify/hydrogen';
import GridPlaceholder from './GridPlaceholder';

// /**
//  * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
//  * @param {Class<Pagination<NodesType>>['connection']>}
//  */
// export function PaginatedResourceSection({
//   connection,
//   children,
//   resourcesClassName,
//   fillEmptySpaces = true,
// }) {
//   return (
//     <Pagination connection={connection}>
//       {({nodes, isLoading, PreviousLink, NextLink}) => {
//         const resourcesMarkup = nodes.map((node, index) =>
//           children({node, index}),
//         );

//         return (
//           <div
//             className="account-orders-grid"
//             style={{
//               display: 'grid',
//               gridColumn: '1/5',
//               gridTemplateColumns: 'subgrid',
//             }}
//           >
//             <PreviousLink>
//               {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
//             </PreviousLink>
//             {resourcesClassName ? (
//               <div className={resourcesClassName}>
//                 {resourcesMarkup}
//                 {fillEmptySpaces && <GridPlaceholder products={nodes} />}
//               </div>
//             ) : (
//               <>
//                 {resourcesMarkup}
//                 {fillEmptySpaces && <GridPlaceholder products={nodes} />}
//               </>
//             )}
//             <NextLink>
//               {isLoading ? 'Loading...' : <span>Load more ↓</span>}
//             </NextLink>
//           </div>
//         );
//       }}
//     </Pagination>
//   );
// }

import React, {useState, useEffect, useRef} from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useNavigate} from '@remix-run/react';

export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  fillEmptySpaces = true,
}) {
  const loadMoreRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {rootMargin: '100px'},
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, []);

  const nav = useNavigate();

  return (
    <Pagination connection={connection}>
      {({
        nodes,
        isLoading,
        hasNextPage,
        nextPageUrl,
        hasPreviousPage,
        PreviousLink,
        state,
      }) => {
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
            <PreviousLink>
              {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
            </PreviousLink>
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
                style={{textAlign: 'center', padding: '20px'}}
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
