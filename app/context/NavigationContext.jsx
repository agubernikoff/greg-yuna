import {createContext, useContext, useState, useEffect} from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({children}) => {
  const [lastCollectionPath, setLastCollectionPath] = useState(
    () =>
      (typeof window !== 'undefined' &&
        localStorage.getItem('lastCollectionPath')) ||
      null,
  );

  useEffect(() => {
    if (lastCollectionPath) {
      localStorage.setItem('lastCollectionPath', lastCollectionPath);
    }
  }, [lastCollectionPath]);

  return (
    <NavigationContext.Provider
      value={{lastCollectionPath, setLastCollectionPath}}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => useContext(NavigationContext);
