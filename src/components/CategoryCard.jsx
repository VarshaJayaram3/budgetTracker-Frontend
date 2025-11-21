export default function CategoryCard({ name, spent, limit }) {
  const remaining = limit - spent;
  const percent = Math.min((spent / limit) * 100, 100);

  return (
    <div className="card p-3 mb-3">
      <h5>{name}</h5>
      <div className="progress my-2">
        <div
          className={`progress-bar ${remaining < 0 ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="mb-0">Spent: ₹{spent}</p>
      <p className={remaining < 0 ? "text-danger" : "text-success"}>
        Remaining: ₹{remaining}
      </p>
    </div>
  );
}
