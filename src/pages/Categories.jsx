/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff6b6b");
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetch = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetch(); }, []);

  const createOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/categories/${editing._id}`, { name, color });
        setMsg("Category updated");
      } else {
        await API.post("/categories", { name, color });
        setMsg("Category created");
      }
      setName(""); setColor("#ff6b6b"); setEditing(null);
      fetch();
      setTimeout(() => setMsg(null), 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setName(c.name);
    setColor(c.color || "#ff6b6b");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      fetch();
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <Navbar />
      <div className="container app-container">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3>Categories</h3>
        </div>

        {msg && <div className="alert alert-primary py-2">{msg}</div>}

        <div className="row">
          <div className="col-md-4">
            <div className="card p-3 mb-3">
              <h5>{editing ? "Edit Category" : "Add Category"}</h5>
              <form onSubmit={createOrUpdate}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={e=>setName(e.target.value)} required/>
                </div>

                <div className="mb-3">
                  <label className="form-label">Color</label>
                  <input type="color" className="form-control form-control-color" value={color} onChange={e=>setColor(e.target.value)} title="Choose color"/>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit">{editing ? "Update" : "Add"}</button>
                  {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setName(""); setColor("#ff6b6b"); }}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card p-3">
              <h5>Existing Categories</h5>
              <div className="list-group list-group-flush">
                {categories.map(c => (
                  <div key={c._id} className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width:18, height:18, borderRadius:6, background: c.color || "#6c757d" }} />
                      <div>{c.name}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-light me-2" onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <div className="text-muted p-3">No categories yet.</div>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
