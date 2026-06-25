import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SecondPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderType = queryParams.get('type') === 'dinein' ? 'DINE IN' : 'PICK UP';
  const customerId = queryParams.get('id') || '';

  const [selectedCategory, setSelectedCategory] = useState('Hot Dish');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [animatingItem, setAnimatingItem] = useState(null);
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const cartRef = useRef(null);
  const receiptRef = useRef(null);

  //  Load foodData & foodStatus from localStorage
  const [foodData, setFoodData] = useState(() => {
    const saved = localStorage.getItem('foodData');
    return saved ? JSON.parse(saved) : {
      "Hot Dish": [
        { name: "Sopas", price: "₱30", image: "/images/sopas.jpg", addOns: [] },
        { name: "Lugaw", price: "₱30", image: "/images/lugaw.jpg", addOns: [] },
        { name: "Sotanghon", price: "₱30", image: "/images/sotanghon.jpg", addOns: [] },
        { name: "Champorado", price: "₱30", image: "/images/champorado.jpg", addOns: [] }
      ],
      "Pasta": [
        { name: "Spaghetti", price: "₱50", image: "/images/spaghetti.jpg", addOns: [{name: "More Cheese", price: "₱10"}] },
        { name: "Carbonara", price: "₱50", image: "/images/carbonara.jpg", addOns: [{name: "More Sauce", price: "₱10"}] }
      ],
      "Rice Meal": [
        { name: "Menudo with Rice", price: "₱90", image: "/images/menudo.jpg", addOns: [{name: "Extra Rice", price: "₱15"}] },
        { name: "Bicol Express with Rice", price: "₱85", image: "/images/bicol-express.jpg", addOns: [{name: "Extra Rice", price: "₱15"}] },
        { name: "Sinigang with Rice", price: "₱70", image: "/images/sinigang.jpg", addOns: [{name: "Extra Rice", price: "₱15"}] }
      ],
      "Drinks": [
        { name: "Hot coffee", price: "₱20", image: "/images/hot-coffee.jpg", addOns: [] },
        { name: "Ice Coffee", price: "₱30", image: "/images/ice-coffee.jpg", addOns: [] },
        { name: "Bottled Water", price: "₱10", image: "/images/water.jpg", addOns: [] },
        { name: "Coke", price: "₱25", image: "/images/coke.jpg", addOns: [] },
        { name: "Mountain Dew", price: "₱25", image: "/images/mountain-dew.jpg", addOns: [] },  
        { name: "C2 Apple", price: "₱30", image: "/images/c2-apple.jpg", addOns: [] }
      ],
      "Dessert": [
        { name: "Ice Cream", price: "₱40", image: "/images/ice-cream.jpg", addOns: [] }
      ],
      "Other": [
        { name: "Nova", price: "₱12", image: "/images/nova.jpg", addOns: [] },
        { name: "Piatos", price: "₱12", image: "/images/piatos.jpg", addOns: [] },
        { name: "Sponge", price: "₱12", image: "/images/sponge.jpg", addOns: [] },
        { name: "Cloud 9", price: "₱13", image: "/images/cloud9.jpg", addOns: [] }
      ]
    };
  });

  const [foodStatus, setFoodStatus] = useState(() => {
  const saved = localStorage.getItem('foodStatus');
    return saved ? JSON.parse(saved) : {};
  });

  //  Real-time update from Admin
  useEffect(() => {
    const updateFromStorage = () => {
      const newData = localStorage.getItem('foodData');
      const newStatus = localStorage.getItem('foodStatus');
      if (newData) setFoodData(JSON.parse(newData));
      if (newStatus) setFoodStatus(JSON.parse(newStatus));
    };
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  //  UPDATED: Close receipt ANYWHERE on screen click
  useEffect(() => {
  const handleClickAnywhere = () => {
      if (showReceipt) {
        setShowReceipt(false);
        setCart([]);
      }
    };
    document.addEventListener('mousedown', handleClickAnywhere);
    return () => document.removeEventListener('mousedown', handleClickAnywhere);
  }, [showReceipt]);

  const getStatus = (itemName) => foodStatus[itemName] || 'available';
  const getNum = (str) => parseInt(str.replace('₱','')) || 0;

// logic to add items
  const addToCart = (item, addOn = null, buttonRef = null) => {
    if (getStatus(item.name) === 'not_available') {
      alert('❌ This item is currently NOT AVAILABLE!');
      return;
    }
    if (buttonRef && cartRef.current) {
      const btnRect = buttonRef.getBoundingClientRect();
      const cartRect = cartRef.current.getBoundingClientRect();
      setAnimatingItem({ 
        x: btnRect.left + btnRect.width/2 - cartRect.left, 
        y: btnRect.top + btnRect.height/2 - cartRect.top, 
        img: item.image 
      });
      setTimeout(() => setAnimatingItem(null), 600);
    }

    // --- ADD BASE ITEM ---
    if (!addOn) {
      setCart(prev => {
        // Get ALL unpaired add-ons for this item
        const allUnpairedAddons = prev.filter(i => i.type === 'addon_only' && i.baseName === item.name);
        const otherItems = prev.filter(i => !(i.type === 'addon_only' && i.baseName === item.name));

        let attachAddon = null;
        const remainingAddons = [...allUnpairedAddons];

        // Take ONLY FIRST add-on to attach, keep others separate
        if (allUnpairedAddons.length > 0) {
          attachAddon = remainingAddons.shift();
        }

        const newBase = {
          uniqueId: Date.now() + Math.random(),
          type: 'base',
          baseName: item.name,
          name: item.name,
          price: getNum(item.price),
          image: item.image,
          addOns: attachAddon ? [{
          id: attachAddon.uniqueId,
          name: attachAddon.name.replace('+ ',''),
          price: attachAddon.price
          }] : []
        };

        return [...otherItems, newBase, ...remainingAddons];
      });
      return;
    }

    // --- ADD ADD-ON ---
    setCart(prev => {
      // Find LAST base WITHOUT add-ons to attach
      const lastEmptyBase = [...prev].reverse().find(i => i.type === 'base' && i.baseName === item.name && i.addOns.length === 0);
      if (lastEmptyBase) {
        return prev.map(i => 
          i.uniqueId === lastEmptyBase.uniqueId 
            ? {...i, addOns: [...i.addOns, {id: Date.now(), name: addOn.name, price: getNum(addOn.price)}]} 
            : i
        );
      } else {
        // Always add as separate if no empty base
        return [...prev, { 
          uniqueId: Date.now() + Math.random(), 
          type: 'addon_only', 
          baseName: item.name, 
          name: `+ ${addOn.name}`, 
          price: getNum(addOn.price), 
          image: null, 
          addOns: [] 
        }];
      }
    });
  };

  const deleteFromCart = (uniqueId) => setCart(prev => prev.filter(i => i.uniqueId !== uniqueId));
  const removeAddOn = (itemId, addId) => setCart(prev => prev.map(i => 
    i.uniqueId === itemId ? {...i, addOns:i.addOns.filter(a=>a.id!==addId)} : i
  ));
  const getTotalPrice = () => `₱${cart.reduce((sum,i)=>{
    let s=i.price; 
    if(i.addOns)s+=i.addOns.reduce((x,y)=>x+y.price,0); 
    return sum+s
  },0).toFixed(2)}`;

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getGroupedCart = () => {
    const groups = {};
    cart.forEach(item => {
      // Unique key includes name + add-ons list to group identical items
      const addOnKey = item.addOns?.map(a => a.name).sort().join('|') || '';
      const key = `${item.name}||${addOnKey}`;
      
      if (!groups[key]) {
        groups[key] = { ...item, qty: 1 };
      } else {
        groups[key].qty += 1;
      }
    });
    return Object.values(groups);
  };

  const groupedItems = getGroupedCart();
  // ✅ Split items between first and second box to continue list
  const firstBoxItems = groupedItems.slice(0, Math.ceil(groupedItems.length / 2));
  const secondBoxItems = groupedItems.slice(Math.ceil(groupedItems.length / 2));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.menuTag}>🍽️ Menu</h1>
        <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
          <span style={{color:'#fff', fontSize:'0.9rem'}}>ID: {customerId}</span>
          <span style={{color:'#fff', fontSize:'0.9rem'}}>{orderType}</span>
          <button ref={cartRef} style={styles.viewCartBtn} onClick={() => setShowCart(!showCart)}>🛒 View Cart ({cart.length})</button>
        </div>
      </header>

      {animatingItem && (
        <img src={animatingItem.img} alt="" style={{position:'absolute', left:animatingItem.x, top:animatingItem.y, width:40, height:40, borderRadius:'50%', objectFit:'cover', zIndex:9999, animation:'flyToCart 0.6s forwards'}} />
      )}
      <style>{`@keyframes flyToCart { 0% {transform:scale(1);opacity:1} 100% {transform:scale(0);opacity:0} }`}</style>

      <p style={styles.descText}>✨ Let Yourself Order ALL YOU WANT! ✨</p>

      {showCart && (
        <div style={styles.cartPopup}>
          <h3 style={styles.cartTitle}>Your Cart</h3>
          <div style={styles.cartScrollArea}>
            {cart.length === 0 ? <p style={{color:'#fff'}}>Cart is empty</p> :
              cart.map(i => (
                <div key={i.uniqueId} style={styles.cartItemRow}>
                  <div style={{flex:1}}>
                    {i.type === 'base' && (
                      <>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', color:'#fff'}}>
                          <span>{i.name.charAt(0).toUpperCase() + i.name.slice(1).toLowerCase()}</span>
                          <button style={styles.delBtn} onClick={() => deleteFromCart(i.uniqueId)}>Remove 🗑</button>
                        </div>
                        {i.addOns.length > 0 && (
                          <div style={styles.addOnList}>
                            {i.addOns.map(ad => (
                              <div key={ad.id} style={styles.addOnRow}>
                                <span>{ad.name.charAt(0).toUpperCase() + ad.name.slice(1).toLowerCase()}</span>
                                <span>₱{ad.price.toFixed(2)} <button style={styles.removeAddOnBtn} onClick={() => removeAddOn(i.uniqueId, ad.id)}>❌</button></span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {i.type === 'addon_only' && (
                      <div style={styles.separateAddOnRow}>
                        <span>{i.name.charAt(0).toUpperCase() + i.name.slice(1).toLowerCase()}</span>
                        <button style={styles.delBtn} onClick={() => deleteFromCart(i.uniqueId)}>Remove 🗑</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
          <div style={styles.totalPrice}><strong>Total: {getTotalPrice()}</strong></div>
          <button style={styles.checkoutBtn} onClick={() => { 
            const r = Math.floor(3000+Math.random()*9000); 
            setOrderNumber(`ORD-${r}`); 
            setShowCart(false); 
            setShowOrderDetails(true); 
          }}>✅ Proceed to Checkout</button>
          <button style={styles.closeCartBtn} onClick={() => setShowCart(false)}>Close</button>
        </div>
      )}

      {showOrderDetails && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Order Details</h3>
            <p style={styles.infoText}>Order No: <strong>{orderNumber}</strong></p>
            <p style={styles.infoText}>ID: {customerId}</p>
            <p style={styles.infoText}>{orderType}</p>
            <div style={styles.orderListContainer}>
              {cart.map((i,idx) => {
                const t = i.price + (i.addOns ? i.addOns.reduce((s,a)=>s+a.price,0) : 0);
                return (
                  <div key={idx} style={styles.orderItemRow}>
                   <div style={{color:i.type==='addon_only'?'#ffcc00':'#fff'}}>
                    {i.name.charAt(0).toUpperCase() + i.name.slice(1).toLowerCase()}
                    </div>
                    {i.addOns.map(a=><div key={a.id} style={styles.smallAddOn}>+ {a.name.charAt(0).toUpperCase() + a.name.slice(1).toLowerCase()}</div>)}
                    <div style={styles.itemPrice}>₱{t.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
            <p style={styles.grandTotal}>Total: {getTotalPrice()}</p>
            <div style={styles.buttonRow}>
              <button style={styles.proceedBtn} onClick={() => { setShowOrderDetails(false); setShowPaymentStep(true); }}>✅ Confirm</button>
              <button style={styles.cancelBtn} onClick={() => setShowOrderDetails(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentStep && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Time & Payment</h3>
            <p style={styles.infoText}>Order No: <strong>{orderNumber}</strong></p>
            <p style={styles.infoText}>ID: {customerId}</p>
            <p style={styles.infoText}>{orderType}</p>
            <div style={styles.sectionBox}>
              <label style={styles.labelText}>⏰ {orderType==='PICK UP'?'Pick-up Time':'Eating Time'}:</label>
              <select value={pickupTime} onChange={(e)=>setPickupTime(e.target.value)} style={styles.selectInput}>
                <option value="">-- Select Time --</option>
                <option>10:00 AM</option>
                <option>10:30 AM</option>
                <option>11:00 AM</option>
                <option>11:30 AM</option>
                <option>12:00 PM</option>
                <option>12:30 PM</option>
                <option>01:00 PM</option>
                <option>01:30 PM</option>
                <option>02:00 PM</option>
              </select>
            </div>
            <div style={styles.sectionBox}>
              <label style={styles.labelText}>💳 Mode of Payment:</label>
              <div style={styles.paymentOptionsLeft}>
                <label style={styles.radioLabelLeft}>
                  <input type="radio" name="payment" value="Cash" checked={paymentMethod==='Cash'} onChange={(e)=>{setPaymentMethod(e.target.value); setShowQR(false);}} /> Cash
                </label>
                <label style={styles.radioLabelLeft}>
                  <input type="radio" name="payment" value="G-Cash" checked={paymentMethod==='G-Cash'} onChange={(e)=>{setPaymentMethod(e.target.value); setShowQR(true);}} /> G-Cash
                </label>
                <label style={styles.radioLabelLeft}>
                  <input type="radio" name="payment" value="Bank-Transfer" checked={paymentMethod==='Bank-Transfer'} onChange={(e)=>{setPaymentMethod(e.target.value); setShowQR(true);}} /> Bank-Transfer
                </label>
              </div>
            </div>
            <div style={styles.buttonRight}>
              <button style={styles.completeBtn} onClick={() => { 
                if (!pickupTime || !paymentMethod) return alert('Please select time and payment method first!'); 
                setShowPaymentStep(false); 
                setShowReceipt(true); 
              }}>✅ Complete Order</button>
            </div>
          </div>
        </div>
      )}

      {showQR && (
        <div style={styles.modalOverlay}>
          <div style={styles.qrModalBox}>
            <button style={styles.qrCloseBtn} onClick={() => setShowQR(false)}>❌</button>
            <h4 style={styles.qrTitle}>Scan QR for {paymentMethod}</h4>
            <img src="/images/Gcash.jpg" alt="QR Code" style={styles.qrImage} />
            <p style={styles.qrNote}>Close after payment is Done!</p>
          </div>
        </div>
      )}

{showReceipt && (
  <div style={styles.modalOverlay}>
    <div ref={receiptRef} style={styles.receiptContainerRow}>
      {/* --- NEW LOGIC: SPLIT ITEMS (FIXED) --- */}
      {(() => {
        const allItems = [...firstBoxItems, ...secondBoxItems];
        let updatedFirstBox = [];
        let updatedSecondBox = [];

        // 7 items or less → all in first box
        if (allItems.length <= 7) {
          updatedFirstBox = allItems;
          updatedSecondBox = [];
        } 
        // More than 7 → split
        else {
          updatedFirstBox = allItems.slice(0, 7);
          updatedSecondBox = allItems.slice(7);
        }

        return (
          <>
            {/* --- MAIN RECEIPT BOX --- */}
            <div style={{...styles.receiptBoxSmall, height: 'auto', overflow: 'visible'}}>
              <h2 style={styles.receiptTitle}>SCHOOL CANTEEN</h2>
              <p style={styles.receiptDateTime}>{getCurrentDateTime()}</p>
              <hr style={styles.receiptDivider} />

              <p style={styles.receiptInfo}><strong>Order No:</strong> {orderNumber}</p>
              <p style={styles.receiptInfo}><strong>ID:</strong> {customerId}</p>
              <p style={styles.receiptInfo}><strong>Type:</strong> {orderType}</p>
              <hr style={styles.receiptDivider} />

              <div style={{...styles.receiptItemsNoScroll, height: 'auto', overflow: 'visible'}}>
                {updatedFirstBox.map((item, idx) => {
                  const itemTotal = (item.price + (item.addOns ? item.addOns.reduce((s, a) => s + a.price, 0) : 0)) * item.qty;
                  return (
                    <div key={idx} style={styles.receiptItemRowSmall}>
                      <div style={{flex: 1, textAlign: 'left'}}>
                        <span style={{color: item.type==='addon_only' ? '#ff9900' : '#000', fontWeight: (item.type==='base' || item.addOns.length>0) ? '600' : '400', fontSize: '0.65rem'}}>
                          {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                        </span>
                        {item.addOns.map(ad => <div key={ad.id} style={styles.receiptAddOnSmall}>+ {ad.name}</div>)}
                      </div>
                      <div style={{textAlign:'right'}}>
                        <span style={styles.priceTextSmall}>({item.qty}) ₱{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {updatedSecondBox.length > 0 && (
                <>
                  <hr style={styles.receiptDivider} />
                  <p style={{textAlign:'center', fontSize:'0.6rem', fontStyle:'italic', color:'#666', margin:'3px 0'}}>
                    (CONTINUED)
                  </p>
                </>
              )}

              {updatedSecondBox.length === 0 && (
                <>
                  <hr style={styles.receiptDivider} />
                  <div style={styles.receiptTotalSmall}><strong>TOTAL AMOUNT: {getTotalPrice()}</strong></div>
                  <hr style={styles.receiptDivider} />
                  <p style={styles.receiptInfoSmall}><strong>Payment:</strong> {paymentMethod}</p>
                  <p style={styles.receiptInfoSmall}><strong>{orderType==='PICK UP'?'Pick-up Time':'Eating Time'}:</strong> {pickupTime}</p>
                  <hr style={styles.receiptDivider} />
                  <p style={styles.receiptThankYouSmall}>Thank you for your purchase!</p>
                  <p style={styles.receiptNoteSmall}>Please come again</p>
                </>
              )}
            </div>

            {updatedSecondBox.length > 0 && (
              <div style={{...styles.receiptBoxSmall, height: 'auto', overflow: 'visible'}}>
                <div style={{...styles.receiptItemsNoScroll, height: 'auto', overflow: 'visible'}}>
                  {updatedSecondBox.map((item, idx) => {
                    const itemTotal = (item.price + (item.addOns ? item.addOns.reduce((s, a) => s + a.price, 0) : 0)) * item.qty;
                    return (
                      <div key={idx} style={styles.receiptItemRowSmall}>
                        <div style={{flex: 1, textAlign: 'left'}}>
                          <span style={{color: item.type==='addon_only' ? '#ff9900' : '#000', fontWeight: (item.type==='base' || item.addOns.length>0) ? '600' : '400', fontSize: '0.65rem'}}>
                            {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                          </span>
                          {item.addOns.map(ad => <div key={ad.id} style={styles.receiptAddOnSmall}>+ {ad.name}</div>)}
                        </div>
                        <div style={{textAlign:'right'}}>
                          <span style={styles.priceTextSmall}>({item.qty}) ₱{itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <hr style={styles.receiptDivider} />
                <div style={styles.receiptTotalSmall}><strong>TOTAL AMOUNT: {getTotalPrice()}</strong></div>
                <hr style={styles.receiptDivider} />
                <p style={styles.receiptInfoSmall}><strong>Payment:</strong> {paymentMethod}</p>
                <p style={styles.receiptInfoSmall}><strong>{orderType==='PICK UP'?'Pick-up Time':'Eating Time'}:</strong> {pickupTime}</p>
                <hr style={styles.receiptDivider} />
                <p style={styles.receiptThankYouSmall}>Thank you for your purchase!</p>
                <p style={styles.receiptNoteSmall}>Please come again</p>
              </div>
            )}
          </>
        );
      })()}

    </div>
  </div>
)}
      <div style={styles.mainLayout}>
        <div style={styles.categoryScroll}>
          {[...Object.keys(foodData), "Back to Home"].map(cat => (
            <button key={cat} style={{...styles.categoryBtn, ...(selectedCategory===cat?styles.activeCategory:{})}} onClick={()=>cat==="Back to Home"?navigate('/home'):setSelectedCategory(cat)}>{cat}</button> 
          ))}
        </div>
        <div style={styles.foodDisplay}>
          <h3 style={styles.categoryTitle}>{selectedCategory}</h3>
          <div style={styles.foodGrid}>
            {foodData[selectedCategory].map((item, idx) => {
              const available = getStatus(item.name) !== 'not_available';
              return (
              <div key={idx} style={{...styles.foodCard, opacity: available ? 1 : 0.5}}>
                <div style={{ position: 'relative' }}>
                  <img src={item.image} alt={item.name} style={styles.foodImage} />
                  {!available && (
                    <div style={styles.unavailableTag}>
                      TEMPORARILY<br/>UNAVAILABLE
                    </div>
                  )}
                </div>
                <div style={styles.foodInfo}>
                 <h4 style={styles.foodName}>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</h4>
                  <p style={styles.foodPrice}>{item.price}</p>
                 {item.addOns.length > 0 && (
                  <div style={styles.addOns}>
                    <small style={{color:'#fff'}}>Add-ons:</small>
                    {item.addOns.map((add,i) => (
                      <button key={i} style={styles.addOnBtn} onClick={(e)=>addToCart(item,add,e.currentTarget)}>
                        + {add.name} ({add.price})
                      </button>
                    ))}
                  </div>
                )}
                  <button 
                    style={{...styles.addBtn, opacity: available ? 1 : 0.5, pointerEvents: available ? 'auto' : 'none'}} 
                    onClick={(e)=>addToCart(item,null,e.currentTarget)}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
  fontFamily:'Segoe UI, Roboto, sans-serif', 
  minHeight:'100vh', 
  backgroundImage: 'url(/images/Second.gif)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'rgba(0,0,0,0.55)', // dark overlay so text clear
  backgroundBlendMode: 'darken',
  position:'relative'},

  header: {
    background:'linear-gradient(90deg, #d32f2f, #b71c1c)', 
    color:'white', padding:'1.5rem 2rem', 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center'},

  menuTag: {
    margin:0, 
    fontSize:'2rem'},

  viewCartBtn: {
    background:'white', 
    color:'#d32f2f', 
    border:'none', 
    padding:'0.7rem 1.2rem', 
    borderRadius:'8px', 
    fontWeight:'bold', 
    cursor:'pointer'},

  descText: {
    color:'white', 
    textAlign:'center', 
    margin:'1.5rem 0', 
    fontSize:'1.1rem'},

  mainLayout: {
    display:'flex', 
    height:'calc(100vh - 180px)'},

  categoryScroll: {
    width:'220px', 
    height: '80%', // ← change this value to make it shorter/longer
    alignSelf: 'center', // ← centers it vertically
    background:'#1a1a1a', 
    padding:'1rem', 
    overflowY:'auto',
    background:'rgba(26, 26, 26, 0.75)', // transparent black
  },
  categoryBtn: {
    width:'100%', 
    padding:'1rem', 
    margin:'0.3rem 0', 
    background:'#333', 
    color:'white', 
    border:'none', 
    borderRadius:'6px', 
    cursor:'pointer', 
    textAlign:'left'},

  activeCategory: {
    background:'#d32f2f', 
    transform:'translateX(5px)'},

  foodDisplay: {
    flex:1, 
    padding:'2rem', 
    overflowY:'auto'},

  categoryTitle: {
    color:'white', 
    textAlign:'center', 
    marginBottom:'2rem'},

  foodGrid: {
    display:'grid', 
    gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', 
    gap:'1.5rem'},

  foodCard: {
    background:'#1a1a1a', 
    borderRadius:'12px', 
    overflow:'hidden', 
    border:'1px solid #d32f2f40', 
    transition: 'opacity 0.3s ease'},

  foodImage: {
    width:'100%', 
    height:'180px', 
    objectFit:'cover'},

  unavailableTag: {
    position:'absolute', 
    top:'50%', 
    left:'50%', 
    transform:'translate(-50%, -50%) rotate(-15deg)', 
    border:'3px solid #d32f2f', 
    color:'#d32f2f', 
    fontSize:'0.85rem', 
    fontWeight:'900', 
    background:'rgba(255,255,255,0.85)', 
    padding:'0.4rem 1rem', 
    borderRadius:'4px', 
    textAlign:'center'},

  foodInfo: {
    padding:'1rem', 
    textAlign:'center'},

  foodName: {
    color:'white', 
    margin:'0 0 0.5rem'},

  foodPrice: {
    color:'#ff6666', 
    fontWeight:'bold', 
    fontSize:'1.1rem', 
    margin:'0 0 0.8rem'},

  addOns: {
    margin:'0.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'},

  addOnBtn: {
    background:'#d32f2f', 
    color:'white', 
    border:'none', 
    padding:'0.3rem 0.6rem', 
    borderRadius:'4px', 
    margin:'0.2rem', 
    cursor:'pointer', 
    fontSize:'0.8rem'},

  addBtn: {
    width:'100%', 
    background:'#d32f2f', 
    color:'white', 
    border:'none', 
    padding:'0.6rem', 
    borderRadius:'6px', 
    fontWeight:'bold', 
    cursor:'pointer', 
    marginTop:'0.5rem'},

  cartPopup: {
    position:'absolute', 
    top:'100px', 
    right:'20px', 
    width:'320px', 
    background:'#1a1a1a', 
    border:'2px solid #d32f2f', 
    borderRadius:'12px', 
    padding:'1.5rem', 
    zIndex:100, 
    color:'white'},

  cartTitle: {
    color:'#e8b76d', 
    marginTop:0},

  cartScrollArea: {
    maxHeight:'150px', 
    overflowY:'auto', 
    overflowX:'hidden', 
    marginBottom:'1rem'},

  cartItemRow: {
    padding:'0.7rem 0', 
    borderBottom:'1px solid #444', 
    width:'100%'},

  delBtn: {
    background:'transparent', 
    color:'#f3e6e6', 
    border:'none', 
    cursor:'pointer', 
    fontSize:'0.8rem', 
    padding:'0 4px'},

  addOnList: {
    color:'#ff6666', 
    fontSize:'0.85rem', 
    display:'flex', 
    flexDirection:'column', 
    gap:'0.2rem', 
    marginTop:'0.2rem'},

  addOnRow: {
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center'},

  removeAddOnBtn: {
    background:'transparent', 
    color:'#ff4444', 
    border:'none', 
    cursor:'pointer', 
    fontSize:'0.7rem'},

  separateAddOnRow: {
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center', 
    color:'#ffcc00'},

  totalPrice: {
    margin:'1rem 0', 
    padding:'0.8rem 0', 
    borderTop:'1px solid #444', 
    borderBottom:'1px solid #444', 
    textAlign:'center', 
    fontSize:'1.1rem', 
    color:'#ecdddd'},

  checkoutBtn: {
    width:'100%', 
    background:'#28a745', 
    color:'white', 
    border:'none', 
    padding:'0.7rem', 
    borderRadius:'6px', 
    fontWeight:'bold', 
    cursor:'pointer'},

  closeCartBtn: {
    width:'100%', 
    background:'#d32f2f', 
    color:'white', 
    border:'none', 
    padding:'0.6rem', 
    borderRadius:'6px', 
    marginTop:'0.8rem', 
    cursor:'pointer'},

  modalOverlay: {
    position:'fixed', 
    top:0, 
    left:0, 
    width:'100%', 
    height:'100%', 
    background:'rgba(0,0,0,0.7)', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center', 
    zIndex:9999},

  modalBox: {
    width:'320px', 
    background:'#1a1a1a', 
    border:'2px solid #d32f2f', 
    borderRadius:'12px', 
    padding:'1.5rem',
    color:'white'},

  modalTitle: {
    color:'#e8b76d', 
    textAlign:'center', 
    marginTop:0},

  infoText: {
    textAlign:'center', 
    margin:'0.3rem 0'},

  sectionBox: {
    margin:'0.8rem 0', 
    padding:'0.5rem 0', 
    borderTop:'1px solid #444', 
    borderBottom:'1px solid #444'},

  labelText: {
    display:'block', 
    marginBottom:'0.5rem', 
    fontSize:'0.9rem', 
    color:'#f5dede', 
    textAlign:'left'},

  selectInput: {
    width:'100%', 
    padding:'0.5rem', 
    borderRadius:'6px', 
    border:'1px solid #ccc', 
    background:'#333', 
    color:'white'},

  paymentOptionsLeft: {
    display:'flex', 
    flexDirection:'column', 
    gap:'0.4rem', 
    alignItems:'flex-start', 
    paddingLeft:'0.2rem'},

  radioLabelLeft: {
    fontSize:'0.9rem', 
    cursor:'pointer', 
    textAlign:'left', 
    width:'100%'},

  buttonRight: {
    display:'flex', 
    justifyContent:'flex-end', 
    marginTop:'1rem'},

  completeBtn: {
    background:'#28a745', 
    color:'white', 
    border:'none', 
    padding:'0.6rem 1.2rem', 
    borderRadius:'6px', 
    fontWeight:'bold', 
    cursor:'pointer'},

  orderListContainer: {
    borderTop:'1px solid #444', 
    borderBottom:'1px solid #444', 
    padding:'0.5rem 0', 
    margin:'0.8rem 0', 
    maxHeight:'180px', 
    overflowY:'auto'},

  orderItemRow: {
    padding:'0.3rem 0', 
    fontSize:'0.9rem', 
    display:'flex', 
    justifyContent:'space-between',
    alignItems:'flex-start', 
    flexDirection:'column'},

  smallAddOn: {
    color:'#ff6666', 
    fontSize:'0.8rem', 
    marginLeft:'0.4rem'},

  itemPrice: {
    fontWeight:'bold', 
    alignSelf:'flex-end'},

  grandTotal: {
    textAlign:'center', 
    fontWeight:'bold', 
    fontSize:'1.1rem'},

  buttonRow: {
    display:'flex', 
    gap:'0.5rem', 
    marginTop:'1rem'},

  proceedBtn: {
    flex:1, 
    background:'#28a745', 
    color:'white', 
    border:'none', 
    padding:'0.7rem', 
    borderRadius:'6px', 
    fontWeight:'bold', 
    cursor:'pointer'},

  cancelBtn: {
    flex:1, 
    background:'#d32f2f', 
    color:'white', 
    border:'none', 
    padding:'0.7rem', 
    borderRadius:'6px', 
    fontWeight:'bold', 
    cursor:'pointer'},

  qrModalBox: {
    width:'260px', 
    background:'#ede4e4', 
    border:'2px solid #d32f2f', 
    borderRadius:'12px', 
    padding:'1.5rem', 
    color:'white', 
    position:'relative'},

  qrCloseBtn: {
    position:'absolute', 
    top:'0.5rem', 
    right:'0.5rem', 
    background:'transparent', 
    border:'none', 
    fontSize:'1rem', 
    cursor:'pointer', 
    color:'#ff4444'},

  qrTitle: {
    color:'#2691e9', 
    textAlign:'center', 
    margin:'0 0 1rem 0'},

  qrImage: {
    width:'140px', 
    height:'140px', 
    borderRadius:'6px', 
    display:'block', 
    margin:'0 auto'},

  qrNote: {
    textAlign:'center',
    color: '#000000', 
    fontSize:'0.85rem', 
    marginTop:'1rem'},
  
  receiptContainerRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.8rem',
    alignItems: 'flex-start'
  },
  receiptBoxSmall: {
    background: '#ffffff',
    color: '#000000',
    borderRadius: '6px',
    padding: '0.6rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.25)',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    width: '220px'
  },
  receiptTitle: {
    textAlign: 'center',
    color: '#000000',
    margin: '0 0 0.2rem 0', 
    fontSize: '0.85rem', 
    fontWeight: 'bold'},

  receiptDateTime: {
    textAlign: 'center',
    color: '#000000', 
    margin: '0 0 0.2rem 0', 
    fontSize: '0.6rem'},

  receiptDivider: {
    border: 'none', 
    borderTop: '1px dashed #000', 
    margin: '0.2rem 0'},

  receiptInfo: {
    margin: '0.1rem 0',
    color: '#000000', 
    fontSize: '0.6rem'},

  receiptItemsNoScroll: {
    margin: '0.2rem 0'},

  receiptItemRowSmall: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    margin: '0.1rem 0'},

  receiptAddOnSmall: {
    fontSize: '0.55rem', 
    marginLeft: '0.3rem', 
    color: '#555'},

  priceTextSmall: {
    fontSize: '0.6rem'},

  receiptTotalSmall: {
    textAlign: 'center', 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    margin: '0.2rem 0'},

  receiptInfoSmall: {
    margin: '0.1rem 0', 
    fontSize: '0.6rem'},

  receiptThankYouSmall: {
    textAlign: 'center', 
    fontSize: '0.65rem', 
    margin: '0.2rem 0 0 0'},

  receiptNoteSmall: {
    textAlign: 'center', 
    fontSize: '0.55rem', 
    margin: '0.1rem 0 0 0', 
    color: '#666'}
};