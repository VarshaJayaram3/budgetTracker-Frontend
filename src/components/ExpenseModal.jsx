/* eslint-disable no-unused-vars */
import { useState } from "react";
import API from "../api/axios";

export default function ExpenseModal({ show, onClose, categories, month, onSaved }) {
  const [categoryId, setCategoryId] = useState(categories?.[0]?._id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // Keep categoryId synced if categories change
  if (!categoryId && categories?.length) {
    setCategoryId(categories[0]._id);
  }

  const handleSave = async (e) => {
    e?.preventDefault();
    setErr(null);
    setMsg(null);

    if (!categoryId || !amount) {
      setErr("Please choose category and enter amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/expenses", {
        categoryId,
        amount: Number(amount),
        date
      });
      console.log(res)

      // After creating expense, fetch report server-side to check over/within budget
      // We will call reports endpoint to get budget vs spent status
      const reportRes = await API.get(`/reports/${date.slice(0,7)}`);

      // find budget entry for category
      const entry = reportRes.data.find(r => String(r.categoryId) === String(categoryId));
      let toastMsg = "Expense added";
      if (entry) {
        if (entry.remaining < 0) toastMsg = "Over budget";
        else toastMsg = "Within budget";
      }

      setMsg(toastMsg);
      setAmount("");
      setDate(new Date().toISOString().slice(0,10));
      onSaved && onSaved();
      setTimeout(() => { setMsg(null); onClose(); }, 900);

    } catch (error) {
      setErr(error.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ background: "#00000088" }}>
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header">
            <h5 className="modal-title">Add Expense</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSave}>
            <div className="modal-body">
              {err && <div className="alert alert-primary py-2">{err}</div>}
              {msg && <div className="alert alert-primary py-2">{msg}</div>}

              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories?.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
