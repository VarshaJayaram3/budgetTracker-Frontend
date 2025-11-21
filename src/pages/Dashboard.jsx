
import { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import MonthSelector from "../components/MonthSelector";
import ExpenseModal from "../components/ExpenseModal";
import { MonthContext } from "../context/MonthContext";
import { AuthContext } from "../context/AuthContext";

function CategoryCard({ category, budgetEntry }) {
  const spent = budgetEntry?.spent || 0;
  const limit = budgetEntry?.budget || 0;
  const remaining = limit - spent;
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 100;

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="mb-1">{category.name}</h5>
          <div style={{ width: 12, height: 12, background: category.color || "#6c757d", borderRadius: 6 }} />
        </div>

        {remaining < 0 && <span className="badge bg-danger">OVER BUDGET</span>}
      </div>

      <div className="mt-3">
        <div className="progress" style={{ height: 8 }}>
          <div
            className={`progress-bar ${remaining < 0 ? "bg-danger" : "bg-primary"}`}
            role="progressbar"
            style={{ width: `${percent}%` }}
            aria-valuenow={percent}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        <div className="d-flex justify-content-between mt-2">
          <small>Limit: ₹{limit}</small>
          <small>Spent: ₹{spent}</small>
        </div>

        <div className="mt-2">
          <strong className={remaining < 0 ? "text-danger" : "text-success"}>
            Remaining: ₹{remaining}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { month } = useContext(MonthContext);
  // const { user } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [report, setReport] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("err", err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/reports/${month}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length) fetchReport();
    // eslint-disable-next-line
  }, [month, categories]);

  const handleRefresh = () => {
    fetchCategories();
    fetchReport();
  };

  // map budgets/spent by category id
  const mapByCategory = {};
  report.forEach(r => mapByCategory[String(r.categoryId)] = r);

  return (
    <>
      <Navbar />
      <div className="app-container container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Dashboard</h3>
          <div className="d-flex gap-2 align-items-center">
            <MonthSelector />
            <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add Expense</button>
          </div>
        </div>

        {loading && <div className="text-center mb-3">Loading...</div>}

        <div className="row grid-cards">
          {categories.length === 0 && <div>No categories. Add some in Settings → Categories.</div>}
          {categories.map(cat => (
            <div key={cat._id} className="col-12 col-md-6 col-lg-4 mb-3">
              <CategoryCard category={cat} budgetEntry={mapByCategory[String(cat._id)]} />
            </div>
          ))}
        </div>
      </div>

      <ExpenseModal
        show={showModal}
        onClose={() => setShowModal(false)}
        categories={categories}
        month={month}
        onSaved={() => { handleRefresh(); }}
      />
    </>
  );
}
