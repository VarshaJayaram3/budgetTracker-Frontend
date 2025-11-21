/* eslint-disable react-hooks/set-state-in-effect */
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { MonthContext } from "../context/MonthContext";

export default function Budgets() {
  const { month: contextMonth } = useContext(MonthContext);

  const [selectedMonth, setSelectedMonth] = useState(contextMonth);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [msg, setMsg] = useState(null);

  // ---------------------- FETCH CATEGORIES ----------------------
  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- FETCH BUDGETS ----------------------
  const fetchBudgets = async () => {
    try {
      const res = await API.get(`/budgets/${selectedMonth}`);
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length) fetchBudgets();
  }, [selectedMonth, categories]);

  // ---------------------- LOCAL UPDATE FOR INPUT ----------------------
  const updateLocalBudget = (categoryId, value) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => String(b.categoryId) === String(categoryId));

      if (exists) {
        return prev.map((b) =>
          String(b.categoryId) === String(categoryId)
            ? { ...b, limit: value }
            : b
        );
      } else {
        return [...prev, { categoryId, month: selectedMonth, limit: value }];
      }
    });
  };

  // ---------------------- SAVE BUDGET ----------------------
  const handleSave = async (categoryId, value) => {
    try {
      await API.post("/budgets", {
        categoryId,
        month: selectedMonth,
        limit: Number(value || 0),
      });

      setMsg("Budget saved");
      setTimeout(() => setMsg(null), 1200);

      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- CLEAR BUDGET ----------------------
  const handleClear = async (categoryId) => {
    try {
      await API.delete(`/budgets/${categoryId}/${selectedMonth}`);

      setMsg("Budget cleared");
      setTimeout(() => setMsg(null), 1200);

      fetchBudgets(); // refresh inputs
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- GET BUDGET FOR CATEGORY ----------------------
  const getBudgetFor = (categoryId) =>
    budgets.find((b) => String(b.categoryId) === String(categoryId));

  return (
    <>
      <Navbar />
      <div className="container app-container">

        {/* HEADER + MONTH SELECTOR */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <h3>Budgets</h3>
            <input
              type="month"
              className="form-control w-auto month-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {msg && <div className="alert alert-primary py-2">{msg}</div>}

        <div className="card p-3">

          {/* IF NO CATEGORIES */}
          {categories.length === 0 && (
            <div className="text-muted">
              No categories. Create in Categories first.
            </div>
          )}

          <div className="row">
            {categories.map((cat) => {
              const b = getBudgetFor(cat._id);

              return (
                <div key={cat._id} className="col-12 col-md-6 mb-3">
                  <div className="d-flex align-items-center gap-3">

                    {/* CATEGORY COLOR DOT */}
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 6,
                        background: cat.color,
                      }}
                    />

                    {/* CATEGORY NAME + INPUT */}
                    <div className="flex-grow-1">
                      <div>{cat.name}</div>

                      <div className="d-flex gap-2 mt-2">
                        {/* BUDGET INPUT (controlled) */}
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Monthly limit"
                          value={b?.limit || ""}
                          onChange={(e) =>
                            updateLocalBudget(cat._id, e.target.value)
                          }
                        />

                        {/* SAVE BUTTON */}
                        <button
                          className="btn btn-outline-light"
                          onClick={() => handleSave(cat._id, b?.limit)}
                        >
                          Save
                        </button>

                        {/* CLEAR BUTTON */}
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleClear(cat._id)}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}
