import {useWindowSize} from 'react-use';
import React, {useState, useEffect} from 'react';

function GridPlaceholder({products}) {
  const [columns, setColumns] = useState(null);
  const {width, height} = useWindowSize();

  useEffect(() => {
    if (width < 768) {
      setColumns(2);
    } else {
      setColumns(4);
    }
  }, [width]);

  if (!columns || !Array.isArray(products) || height <= 0) return null;

  const itemHeight = 300;
  const totalItems = products.length;
  const currentRows = Math.ceil(totalItems / columns);
  const estimatedRows = Math.ceil(height / itemHeight);
  const missingRows = Math.max(estimatedRows - currentRows, 0);

  const emptyTilesInLastRow = (columns - (totalItems % columns)) % columns;
  const viewportFillTiles = missingRows * columns;

  let totalPlaceholders = emptyTilesInLastRow + viewportFillTiles;
  if (width < 768) {
    const isSingleRow = currentRows === 1;
    const hasLoneItem = totalItems % columns === 1;
    totalPlaceholders = isSingleRow && hasLoneItem ? 1 : 0;
  }

  return (
    <>
      {[...Array(totalPlaceholders)].map((_, i) => (
        <div
          key={`placeholder-${i}`}
          className="placeholder-tile product-item placeholder-tile-responsive"
          style={{
            aspectRatio: '1 / 1',
            background: '#fff',
          }}
        />
      ))}
    </>
  );
}

export default GridPlaceholder;
