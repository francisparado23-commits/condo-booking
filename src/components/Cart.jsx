import { useState } from "react";

export default function Cart({ cart, onQty, onCheckout }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function submit(e) {
    e.preventDefault();
    onCheckout({ customer: name || "Guest" });
    setName("");
    setShowForm(false);
  }

  return (
    <aside className="cart" aria-label="Cart">
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <div className="empty">Your cart is empty</div>
      ) : (
        <div className="cart-list">
          {cart.map((it) => (
            <div key={it.id} className="cart-item">
              <div className="cart-name">{it.name}</div>
              <div className="cart-controls">
                <button onClick={() => onQty(it.id, it.qty - 1)}>-</button>
                <span className="qty">{it.qty}</span>
                <button onClick={() => onQty(it.id, it.qty + 1)}>+</button>
              </div>
              <div className="cart-price">£{(it.price * it.qty).toFixed(2)}</div>
            </div>
          ))}
          <div className="cart-total">Total: £{total.toFixed(2)}</div>
          <div className="cart-actions">
            <button onClick={() => setShowForm(true)} className="btn-checkout">Checkout</button>
          </div>
        </div>
      )}

      {showForm && (
        <form className="checkout-form" onSubmit={submit}>
          <label>
            Name:
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Place order</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </aside>
  );
}
