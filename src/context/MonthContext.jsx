/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const MonthContext = createContext();

export function MonthProvider({ children }) {
  const current = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(current);

  return (
    <MonthContext.Provider value={{ month, setMonth }}>
      {children}
    </MonthContext.Provider>
  );
}
