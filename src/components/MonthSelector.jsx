import { useContext } from "react";
import { MonthContext } from "../context/MonthContext";

export default function MonthSelector() {
  const { month, setMonth } = useContext(MonthContext);

  return (
    <input
      type="month"
      className="form-control w-auto month-input"
      value={month}
      onChange={(e) => setMonth(e.target.value)}
    />
  );
}
