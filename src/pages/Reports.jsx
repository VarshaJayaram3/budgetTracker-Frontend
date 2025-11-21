/* eslint-disable react-hooks/set-state-in-effect */

import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { MonthContext } from "../context/MonthContext";

export default function Reports() {
   const { month: contextMonth } = useContext(MonthContext);

  const [selectedMonth, setSelectedMonth] = useState(contextMonth);
  const [report, setReport] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetch = async () => {
    try {
      const [rRes, cRes] = await Promise.all([
        API.get(`/reports/${selectedMonth}`),
        API.get("/categories")
      ]);
      setReport(rRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetch(); 
}, [selectedMonth]);

  const categoryName = (id) => categories.find(c => String(c._id) === String(id))?.name || id;

  return (
    <>
      <Navbar />
      <div className="container app-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Reports</h3>
          <div className="d-flex gap-2">
            <input
              type="month"
              className="form-control w-auto month-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        <div className="card p-3">
          <div className="table-responsive">
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget (₹)</th>
                  <th>Spent (₹)</th>
                  <th>Remaining (₹)</th>
                </tr>
              </thead>
              <tbody>
                {report.map(r => (
                  <tr key={r.categoryId}>
                    <td>{categoryName(r.categoryId)}</td>
                    <td>{r.budget}</td>
                    <td>{r.spent}</td>
                    <td className={r.remaining < 0 ? "text-danger" : "text-success"}>{r.remaining}</td>
                  </tr>
                ))}

                {report.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-muted">No data for {selectedMonth}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
