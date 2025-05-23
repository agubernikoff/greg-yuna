import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import GridPlaceholder from './GridPlaceholder';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  fillEmptySpaces = true,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
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
              <>
                {resourcesMarkup}
                {fillEmptySpaces && <GridPlaceholder products={nodes} />}
              </>
            )}
            <NextLink>
              {isLoading ? 'Loading...' : <span>Load more ↓</span>}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
