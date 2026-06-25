import React from "react";

const MENU = [
  { id: "b1", name: "Cheeseburger", price: 3.5, desc: "Beef patty, cheese, lettuce" },
  { id: "b2", name: "Chicken Sandwich", price: 3.0, desc: "Crispy chicken, mayo" },
  { id: "f1", name: "Fries", price: 1.5, desc: "Crispy salted fries" },
  { id: "d1", name: "Coke", price: 1.0, desc: "330ml" },
  { id: "s1", name: "Salad", price: 2.5, desc: "Fresh greens" },
];

export default function Menu({ onAdd }) {
  return (
    <section className="menu" aria-label="Menu">
      <h2>Menu</h2>
      <div className="menu-grid">
        {MENU.map((item) => (
          <div key={item.id} className="menu-item">
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-desc">{item.desc}</div>
            </div>
            <div className="item-actions">
              <div className="item-price">£{item.price.toFixed(2)}</div>
              <button onClick={() => onAdd(item)} className="btn-add">Add</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
