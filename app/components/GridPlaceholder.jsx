import {useWindowSize} from 'react-use';
import React, {useState, useEffect} from 'react';

function GridPlaceholder({products}) {
  const [columns, setColumns] = useState(null);
  const {width} = useWindowSize();

  useEffect(() => {
    if (width < 768) {
      setColumns(2); // mobile
    } else {
      setColumns(4); // desktop
    }
  }, [width]);

  const placeholders =
    columns !== null ? (columns - (products.length % columns)) % columns : 0;
  return (
    <>
      {columns !== null &&
        [...Array(placeholders)].map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="placeholder-tile product-item"
            style={{background: 'white'}}
          />
        ))}
    </>
  );
}

export default GridPlaceholder;
