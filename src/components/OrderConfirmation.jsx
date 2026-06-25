export default function OrderConfirmation({ order, onClose }) {
  return (
    <div className="order-confirm-overlay" role="dialog" aria-modal="true">
      <div className="order-confirm">
        <h2>Order Confirmed</h2>
        <div className="order-id">Order #{order.id}</div>
        <div className="order-customer">Customer: {order.details.customer}</div>
        <ul className="order-items">
          {order.items.map((it) => (
            <li key={it.id}>{it.qty}× {it.name} — £{(it.price * it.qty).toFixed(2)}</li>
          ))}
        </ul>
        <div className="order-total">Total paid: £{order.total.toFixed(2)}</div>
        <div className="order-actions">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}
