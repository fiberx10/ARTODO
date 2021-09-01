import React, { useState, useEffect, createContext , useCallback ,  FC } from 'react';
type ContextType = {
  counter: number;
  increment: ContextType;
};

export const CounterContext = createContext({
  increment: () => {},
  counter: 0,
});

const CounterContextProvider: React.FC = ({ children }) => {
  const [counter, increment] = useState(0);

   const c = useCallback((a) => {
    setCounter((previousCounter) => previousCounter + 1);
  }, []); 

  const value = {increment , counter} ;

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
};


export default CounterContextProvider;