import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [adminId, setAdminId] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Sign Up Manager State ---
  const [showSignUpManager, setShowSignUpManager] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [adminList, setAdminList] = useState(() => {
    const saved = localStorage.getItem('admins');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('admins');
      return [];
    }
  });

  // --- DYNAMIC BACKGROUND IMAGES (fixed path) ---
  const bgImages = [
    `${import.meta.env.BASE_URL}images/Bg1.jpg`,
    `${import.meta.env.BASE_URL}images/Bg2.jpg`,
    `${import.meta.env.BASE_URL}images/Bg3.jpg`
  ];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % bgImages.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [bgImages.length]);

  const [selectedCategory, setSelectedCategory] = useState('Hot Dish');
  const [foodData, setFoodData] = useState(() => {
    const saved = localStorage.getItem('foodData');
    return saved ? JSON.parse(saved) : {
      "Hot Dish": [
        { name: "Sopas", price: "₱30", image: "images/sopas.jpg", addOns: [] },
        { name: "Lugaw", price: "₱30", image: "images/lugaw.jpg", addOns: [] },
        { name: "Sotanghon", price: "₱30", image: "images/sotanghon.jpg", addOns: [] },
        { name: "Champorado", price: "₱30", image: "images/champorado.jpg", addOns: [] }
      ],
      "Pasta": [
        { name: "Spaghetti", price: "₱50", image: "images/spaghetti.jpg", addOns: [{name: "More Cheese", price: "₱10"}] },
        { name: "Carbonara", price: "₱50", image: "images/carbonara.jpg", addOns: [{name: "More Sauce", price: "₱10"}] }
      ],
      "Rice Meal": [
        { name: "Menudo with Rice", price: "₱90", image: "images/menudo.jpg", addOns: [{name: "Extra Rice", price: "₱15"}] },
        { name: "Bicol Express with Rice", price: "₱85", image: "images/bicol-express.jpg", addOns: [{name: "Extra Rice", price: "₱15"}] },
        { name: "Sinigang with Rice", price: "₱70", image: "images/sinigang.jpg", addOns: [{name: "Extra Rice", price: "₱15"}] }
      ],
      "Drinks": [
        { name: "Hot coffee", price: "₱20", image: "images/hot-coffee.jpg", addOns: [] },
        { name: "Ice Coffee", price: "₱30", image: "images/ice-coffee.jpg", addOns: [] },
        { name: "Bottled Water", price: "₱10", image: "images/water.jpg", addOns: [] },
        { name: "Coke", price: "₱25", image: "images/coke.jpg", addOns: [] },
        { name: "Mountain Dew", price: "₱25", image: "images/mountain-dew.jpg", addOns: [] },  
        { name: "C2 Apple", price: "₱30", image: "images/c2-apple.jpg", addOns: [] }
      ],
      "Dessert": [
        { name: "Ice Cream", price: "₱40", image: "images/ice-cream.jpg", addOns: [] }
      ],
      "Other": [
        { name: "Nova", price: "₱12", image: "images/nova.jpg", addOns: [] },
        { name: "Piatos", price: "₱12", image: "images/piatos.jpg", addOns: [] },
        { name: "Sponge", price: "₱12", image: "images/sponge.jpg", addOns: [] },
        { name: "Cloud 9", price: "₱13", image: "images/cloud9.jpg", addOns: [] }
      ]

    };
  });
  const [foodStatus, setFoodStatus] = useState(() => {
    const saved = localStorage.getItem('foodStatus');
    return saved ? JSON.parse(saved) : {};
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Hot Dish');

  // --- Delete & Edit State ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allItemsList, setAllItemsList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  useEffect(() => {
    localStorage.setItem('foodData', JSON.stringify(foodData));
    window.dispatchEvent(new Event('storage'));
  }, [foodData]);

  useEffect(() => {
    localStorage.setItem('foodStatus', JSON.stringify(foodStatus));
    window.dispatchEvent(new Event('storage'));
  }, [foodStatus]);

  useEffect(() => {
    localStorage.setItem('admins', JSON.stringify(adminList));
  }, [adminList]);

  const updateStatus = (itemName, statusType) => {
    setFoodStatus(prev => ({ ...prev, [itemName]: statusType }));
  };

  const getStatus = (itemName) => foodStatus[itemName] || 'available';

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim()) return alert('Please fill name and price!');
    
    const formattedPrice = newItemPrice.startsWith('₱') ? newItemPrice : `₱${newItemPrice}`;
    
    const newItem = {
      name: newItemName.trim().toUpperCase(),
      price: formattedPrice,
      image: "images/default.jpg",
      addOns: []
    };

    setFoodData(prev => ({
      ...prev,
      [newItemCategory]: [...prev[newItemCategory], newItem]
    }));

    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('Hot Dish');
    setShowAddForm(false);
  };

  const openDeleteModal = () => {
    const items = [];
    Object.entries(foodData).forEach(([category, itemList]) => {
      itemList.forEach((item, idx) => {
        items.push({ 
          category, 
          index: idx, 
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase(), 
          price: item.price 
        });
      });
    });
    setAllItemsList(items);
    setShowDeleteModal(true);
  };

  const handleDeleteItem = (category, index, itemName) => {
    if (!window.confirm(`Are you sure you want to DELETE "${itemName}"?`)) return;

    setFoodData(prev => {
      const updatedCategory = [...prev[category]];
      updatedCategory.splice(index, 1);
      return { ...prev, [category]: updatedCategory };
    });

    setFoodStatus(prev => {
      const updated = { ...prev };
      delete updated[itemName];
      return updated;
    });

    setAllItemsList(prev => prev.filter(i => !(i.category === category && i.index === index)));
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditPriceValue(item.price);
  };

  const saveEditPrice = () => {
    if (!editPriceValue.trim()) return;
    const formatted = editPriceValue.startsWith('₱') ? editPriceValue : `₱${editPriceValue}`;

    setFoodData(prev => {
      const updated = { ...prev };
      updated[editingItem.category][editingItem.index].price = formatted;
      return updated;
    });

    setAllItemsList(prev => prev.map(i => 
      i.category === editingItem.category && i.index === editingItem.index 
        ? {...i, price: formatted} 
        : i
    ));

    setEditingItem(null);
    setEditPriceValue('');
  };

  const handleLogin = () => {
    if (!username.trim() || !adminId.trim()) {
      setLoginError('Please enter both Username and ID Number');
      return;
    }
    if (!/^\d{4}$/.test(adminId)) {
      setLoginError('ID must be exactly 4 digits');
      return;
    }

    const found = adminList.find(a => a.username === username && a.adminId === adminId);
    const userExists = adminList.some(a => a.username === username);
    const idExists = adminList.some(a => a.adminId === adminId);

    if (found) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      if (!userExists && !idExists) {
        setLoginError('Incorrect Username and ID');
      } else if (!userExists) {
        setLoginError('Incorrect Username');
      } else if (!idExists) {
        setLoginError('Incorrect ID Number');
      }
    }
  };

  const handleSaveAdmin = () => {
    if (!newAdminUser.trim() || !newAdminId.trim()) {
      return alert('Please enter both Username and ID Number');
    }
    if (!/^\d{4}$/.test(newAdminId)) {
      return alert('ID must be exactly 4 digits (numbers only)');
    }
    const exists = adminList.some(a => a.username === newAdminUser || a.adminId === newAdminId);
    if (exists) {
      return alert('Username or ID already registered');
    }
    setAdminList(prev => [...prev, { username: newAdminUser, adminId: newAdminId }]);
    setNewAdminUser('');
    setNewAdminId('');
  };

  const handleDeleteAdmin = (index) => {
    if (!window.confirm('Delete this admin?')) return;
    setAdminList(prev => prev.filter((_, i) => i !== index));
  };

  if (!isLoggedIn) {
    return (
      <div style={{
        ...styles.container,
        backgroundImage: `url(${bgImages[bgIndex]})`
      }}>
        <div style={styles.loginBox}>
          <h2 style={styles.loginTitle}>🔧 Admin Login</h2>
          
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.loginInput}
            />

            <input
              type="password" 
              placeholder="Enter ID Number (4 digits)"
              value={adminId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setAdminId(val);
              }}
              style={styles.loginInput}
              maxLength={4}
            />
          </div>

          {loginError && <p style={styles.loginError}>{loginError}</p>}

          <div style={styles.loginBtnGroup}>
            <button style={styles.loginBtn} onClick={handleLogin}>Login</button>
            <button style={styles.signupBtn} onClick={() => setShowSignUpManager(true)}>Sign Up</button>
          </div>
        </div>

        {showSignUpManager && (
          <div style={styles.modalOverlay}>
            <div style={styles.manageAdminBox}>
              <h3 style={{color:'#fff', marginTop:0}}>👤 Manage Admins</h3>

              <div style={{display:'flex', gap:'0.5rem', margin:'1rem 0'}}>
                <input
                  type="text"
                  placeholder="New Username"
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  style={styles.manageInput}
                />
                <input
                  type="password" 
                  placeholder="New ID (4 digits)"
                  value={newAdminId}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setNewAdminId(val);
                  }}
                  style={styles.manageInput}
                  maxLength={4}
                />
              </div>

              <div style={styles.adminListContainer}>
                {adminList.length === 0 ? (
                  <p style={{color:'#aaa', textAlign:'center'}}>No admins saved</p>
                ) : (
                  adminList.map((adm, idx) => (
                    <div key={idx} style={styles.adminRow}>
                      <span><strong>User:</strong> {adm.username} | <strong>ID:</strong> {adm.adminId}</span>
                      <button style={styles.delAdminBtn} onClick={() => handleDeleteAdmin(idx)}>🗑️</button>
                    </div>
                  ))
                )}
              </div>

              <div style={{display:'flex', gap:'0.8rem', justifyContent:'flex-end', marginTop:'1rem'}}>
                <button style={styles.saveAdminBtnFull} onClick={handleSaveAdmin}>Save</button>
                <button style={styles.closeBtn} onClick={() => setShowSignUpManager(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (  
  <div style={{
    ...styles.container,
    backgroundImage: `url(${bgImages[bgIndex]})`
  }}>
      <header style={styles.header}>
        <h2 style={styles.menuTag}>🔧 ADMIN </h2>
        <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
          <button style={styles.AddItemBtn} onClick={() => setShowAddForm(true)}>
            ➕ Add Item
          </button>
          <button style={styles.deleteItemBtn} onClick={openDeleteModal}>
            🔧 Manage Items
          </button>
          <button style={styles.logoutBtn} onClick={() => setIsLoggedIn(false)}>🚪 Logout</button>
        </div>
      </header>

      <p style={styles.descText}>✨ Manage Food Availability ✨</p>

      <div style={styles.mainLayout}>
        <div style={styles.categoryScroll}>
          {[...Object.keys(foodData), "Go to HomePage"].map(cat => (
            <button 
              key={cat} 
              style={{
                ...styles.categoryBtn, 
                ...(selectedCategory === cat ? styles.activeCategory : {}),
                ...(cat === "Go to HomePage" ? {background:'#28a745', marginTop:'1.5rem', fontWeight:'bold'} : {})
              }} 
              onClick={() => cat === "Go to HomePage" ? navigate('/home') : setSelectedCategory(cat)}
            >
              {cat}
            </button> 
          ))}
        </div>

        <div style={styles.foodDisplay}>
          <h3 style={styles.categoryTitle}>{selectedCategory}</h3>
          <div style={styles.foodGrid}>
            {foodData[selectedCategory]?.map((item, idx) => (
              <div key={idx} style={styles.foodCard}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}${item.image}`} 
                    alt={item.name} 
                    style={styles.foodImage}
                  />
                  
                  {getStatus(item.name) === 'not_available' && (
                    <div style={styles.stampOverlay}>
                      TEMPORARILY<br/>UNAVAILABLE
                    </div>
                  )}
                </div>

                <div style={styles.foodInfo}>
                  <h4 style={styles.foodName}>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</h4>
                  <p style={styles.foodPrice}>{item.price}</p>
                  <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                    <button style={{...styles.addBtn, background:'#28a745'}} onClick={() => updateStatus(item.name, 'available')}>✅<br/>Available</button>
                    <button style={{...styles.addBtn, background:'#dc3545'}} onClick={() => updateStatus(item.name, 'not_available')}>❌<br/>Not Available</button>
                  </div>
                  <p style={{fontSize:'0.8rem', marginTop:'0.5rem', color: getStatus(item.name) === 'available' ? '#28a745' : '#dc3545', fontWeight:'bold'}}>
                    Current: {getStatus(item.name) === 'available' ? 'AVAILABLE' : 'NOT AVAILABLE'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{color:'#d32f2f', textAlign:'center', marginTop:0}}>➕ Add New Food Item</h3>
            <form onSubmit={handleAddItem} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Item Name:</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. FRIED CHICKEN"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price:</label>
                <input 
                  type="text" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 50 or ₱50"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Category:</label>
                <select 
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  style={styles.select}
                >
                  {Object.keys(foodData).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div style={{display:'flex', gap:'0.8rem', marginTop:'1rem'}}>
                <button type="submit" style={styles.saveBtn}>✅ Save Item</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAddForm(false)}>❌ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.manageModalBox}>
            <h3 style={{color:'#d32f2f', textAlign:'center', marginTop:0}}>📋 All Items</h3>
            <div style={styles.manageListContainer}>
              <div style={styles.listHeaderRow}>
                <span style={{width:'40%', textAlign:'left'}}>Item Name</span>
                <span style={{width:'20%', textAlign:'center'}}>Price</span>
                <span style={{width:'25%', textAlign:'center'}}>Category</span>
                <span style={{width:'15%', textAlign:'right'}}>Action</span>
              </div>

              {allItemsList.length === 0 ? (
                <p style={{color:'#aaa', textAlign:'center', padding:'1rem 0'}}>No items found</p>
              ) : (
                allItemsList.map((item, i) => (
                  <div key={i} style={styles.manageItemRow}>
                    <span style={{width:'40%', textAlign:'left', color:'#fff', fontWeight:'500'}}>{item.name}</span>
                    <span style={{width:'20%', textAlign:'center', color:'#ff6666'}}>{item.price}</span>
                    <span style={{width:'25%', textAlign:'center', color:'#ccc', fontSize:'0.85rem'}}>{item.category}</span>
                    <div style={{width:'15%', textAlign:'right', display:'flex', gap:'0.3rem', justifyContent:'flex-end'}}>
                      <button style={styles.editBtnSmall} onClick={() => startEdit(item)}>✏️</button>
                      <button style={styles.delBtnSmall} onClick={() => handleDeleteItem(item.category, item.index, item.name)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {editingItem && (
              <div style={styles.editFormContainer}>
                <h4 style={{color:'#fff', margin:'0 0 0.5rem 0'}}>Edit Price: {editingItem.name}</h4>
                <input 
                  type="text" 
                  value={editPriceValue}
                  onChange={(e) => setEditPriceValue(e.target.value)}
                  style={styles.editInput}
                  placeholder="e.g. ₱50 or 50"
                />
                <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                  <button style={styles.saveBtnSmall} onClick={saveEditPrice}>💾 Save</button>
                  <button style={styles.cancelBtnSmall} onClick={() => setEditingItem(null)}>❌ Cancel</button>
                </div>
              </div>
            )}

            <button style={styles.closeBtn} onClick={() => setShowDeleteModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily:'Segoe UI, Roboto, sans-serif', 
    minHeight:'100vh', 
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 1.2s ease-in-out',
    position:'relative',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },

  loginBox: {
    background:'rgba(26, 26, 26, 0.75)',
    border:'1px solid #d32f2f',
    borderRadius:'12px',
    padding:'2.5rem 2rem',
    width:'100%',
    maxWidth:'320px',
    boxShadow:'0 0 20px rgba(211, 47, 47, 0.2)',
    textAlign:'center'
  },
  loginTitle: {
    color:'#fff',
    marginBottom:'1.5rem'
  },
  inputWrapper: {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    width:'100%'
  },
  loginInput: {
    width:'90%',
    padding:'0.8rem',
    margin:'0.5rem 0',
    borderRadius:'6px',
    border:'1px solid #d32f2f',
    background:'#333',
    color:'white',
    fontSize:'1rem'
  },
  loginError: {
    color:'#ff6666',
    fontSize:'0.85rem',
    margin:'0.5rem 0'
  },
  loginBtnGroup: {
    display:'flex',
    gap:'0.8rem',
    marginTop:'1rem'
  },
  loginBtn: {
    flex:1,
    background:'#28a745',
    color:'white',
    border:'none',
    padding:'0.7rem',
    borderRadius:'6px',
    fontWeight:'bold',
    cursor:'pointer'
  },
  signupBtn: {
    flex:1,
    background:'#165DFF',
    color:'white',
    border:'none',
    padding:'0.7rem',
    borderRadius:'6px',
    fontWeight:'bold',
    cursor:'pointer'
  },

  manageAdminBox: {
    background:'#1a1a1a',
    border:'1px solid #d32f2f',
    borderRadius:'12px',
    padding:'2rem',
    width:'100%',
    maxWidth:'450px',
    color:'white',
    boxShadow:'0 0 20px rgba(211, 47, 47, 0.2)'
  },
  manageInput: {
    flex:1,
    padding:'0.6rem',
    borderRadius:'6px',
    border:'1px solid #d32f2f',
    background:'#333',
    color:'white',
    fontSize:'0.9rem'
  },
  saveAdminBtnFull: {
    background:'#28a745',
    color:'white',
    border:'none',
    padding:'0.6rem 1.2rem',
    borderRadius:'6px',
    cursor:'pointer',
    fontWeight:'bold'
  },
  adminListContainer: {
    maxHeight:'250px',
    overflowY:'auto',
    margin:'1rem 0',
    borderTop:'1px solid #444',
    borderBottom:'1px solid #444',
    padding:'0.5rem 0'
  },
  adminRow: {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    padding:'0.5rem',
    borderBottom:'1px solid #333',
    fontSize:'0.9rem'
  },
  delAdminBtn: {
    background:'#d31c1c',
    color:'white',
    border:'none',
    padding:'0.3rem 0.5rem',
    borderRadius:'4px',
    cursor:'pointer',
    fontSize:'0.75rem'
  },

  header: {
    background:'linear-gradient(90deg, #d32f2f, #b71c1c)', 
    color:'white', padding:'1.5rem 0.1rem', 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center',
    width:'100%',
    position:'absolute',
    top:0
  },

  menuTag: {
    margin:0, 
    fontSize:'2rem'
  },

  AddItemBtn: {
    background:'white', 
    color:'#d32f2f', 
    border:'none', 
    padding:'0.7rem 1.2rem', 
    borderRadius:'8px', 
    fontWeight:'bold', 
    cursor:'pointer'
  },

  deleteItemBtn: {
    background:'#dde937', 
    color:'white', 
    border:'none', 
    padding:'0.7rem 1.2rem', 
    borderRadius:'8px', 
    fontWeight:'bold', 
    cursor:'pointer'
  },

  logoutBtn: {
    background:'#666', 
    color:'white', 
    border:'none', 
    padding:'0.7rem 1.2rem', 
    borderRadius:'8px', 
    fontWeight:'bold', 
    cursor:'pointer'
  },

 descText: {
  color:'black', 
  textAlign: 'center',
  margin: '1.5rem auto',
  fontSize: '1.25rem', 
  fontWeight: '800', 
  fontFamily: 'Segoe UI, Impact, Poppins, sans-serif', 
  letterSpacing: '0.5px',
  margin:'1.5rem auto', 
  fontSize:'1.1rem',
  position:'absolute',
  top:'71px',
  left:'50%',
  transform:'translateX(-50%)',
  background:'rgba(120, 120, 120, 0.55)', 
  padding:'0.1rem 1.2rem',
  borderRadius:'20px',
  width:'fit-content',
  border:'1px solid rgba(255, 255, 255, 0.3)', 
  boxShadow:'0 0 8px rgba(255, 255, 255, 0.25)',
  WebkitTextStroke: '0.1px #ffffff',
  textShadow: '1px 1px 0 #f3efef, -1px -1px 0 #fbf9f9, 1px -1px 0 #ffffff, -1px 1px 0 #efefef' 
},

  mainLayout: {
    display:'flex', 
    height:'calc(100vh - 180px)',
    marginTop:'80px',
    width:'100%'
  },

  categoryScroll: {
  width:'220px', 
  background:'rgba(26, 26, 26, 0.75)', 
  padding:'1rem', 
  overflowY:'auto'
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
    textAlign:'left'
  },

  activeCategory: {
    background:'#d32f2f', 
    transform:'translateX(5px)'
  },

  foodDisplay: {
  flex:1, 
  padding:'2rem', 
  overflowY:'auto',

},
  categoryTitle: {
    color:'white', 
    textAlign:'center', 
    marginBottom:'2rem',
    letterSpacing: '0.5px',
    fontFamily: 'Segoe UI, Impact, Poppins, sans-serif', 
    WebkitTextStroke: '0.5px #1d1b1b',
    textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' 
  },

  foodGrid: {
    display:'grid', 
    gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', 
    gap:'1.5rem'
  },

  foodCard: {
    background:'#1a1a1a', 
    borderRadius:'12px', 
    overflow:'hidden', 
    border:'1px solid #d32f2f40',
  
  },

  foodImage: {
    width:'100%', 
    height:'180px', 
    objectFit:'cover',
    display:'block'
  },

  stampOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-15deg)',
    border: '3px solid #d32f2f',
    color: '#d32f2f',
    fontSize: '0.85rem',
    fontWeight: '900',
    fontFamily: 'Arial, sans-serif',
    textTransform: 'uppercase',
    padding: '0.4rem 1rem',
    background: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: '1px',
    lineHeight: '1.2',
    textAlign: 'center',
    borderRadius: '4px',
    boxShadow: '0 0 4px rgba(0,0,0,0.2)',
    pointerEvents: 'none'
  },

  foodInfo: {
    padding:'1rem', 
    textAlign:'center'
  },

  foodName: {
    color:'white', 
    margin:'0 0 0.5rem'
  },

  foodPrice: {
    color:'#ff6666', 
    fontWeight:'bold', 
    fontSize:'1.1rem', 
    margin:'0 0 0.8rem'
  },

  addBtn: {
    flex:1, 
    color:'white',
    border:'none', 
    padding:'0.6rem 0.2rem',
    borderRadius:'6px', 
    fontWeight:'bold',
    fontSize:'0.8rem',
    lineHeight:'1.2',
    cursor:'pointer'
  },

  modalOverlay: {
    position:'fixed',
    top:0,
    left:0,
    width:'100%',
    height:'100%',
    background:'rgba(0,0,0,0.75)',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    zIndex:9999
  },
  modalBox: {
    background:'#1a1a1a',
    border:'1px solid #d32f2f',
    borderRadius:'12px',
    padding:'2rem',
    width:'100%',
    maxWidth:'350px',
    color:'white',
    boxShadow:'0 0 20px rgba(211, 47, 47, 0.2)'
  },

  manageModalBox: {
    background:'#1a1a1a',
    border:'1px solid #d32f2f',
    borderRadius:'12px',
    padding:'2rem',
    width:'100%',
    maxWidth:'550px',
    color:'white',
    boxShadow:'0 0 20px rgba(211, 47, 47, 0.2)'
  },

  manageListContainer: {
    maxHeight:'380px',
    overflowY:'auto',
    margin:'1rem 0',
    borderTop:'1px solid #444',
    borderBottom:'1px solid #444',
    padding:'0.5rem 0'
  },

  listHeaderRow: {
    display:'flex',
    padding:'0.5rem',
    borderBottom:'1px solid #555',
    fontWeight:'bold',
    color:'#e8b76d',
    fontSize:'0.9rem'
  },

  manageItemRow: {
    display:'flex',
    alignItems:'center',
    padding:'0.7rem 0.5rem',
    borderBottom:'1px solid #333',
    fontSize:'0.9rem'
  },

  editBtnSmall: {
    background:'#28a745',
    color:'white',
    border:'none',
    padding:'0.3rem 0.5rem',
    borderRadius:'4px',
    cursor:'pointer',
    fontSize:'0.75rem'
  },

  delBtnSmall: {
    background:'#d31c1c',
    color:'white',
    border:'none',
    padding:'0.3rem 0.5rem',
    borderRadius:'4px',
    cursor:'pointer',
    fontSize:'0.75rem'
  },

  editFormContainer: {
    marginTop:'1rem',
    padding:'1rem',
    background:'#2a2a2a',
    borderRadius:'8px',
    border:'1px solid #444'
  },

  editInput: {
    width:'100%',
    padding:'0.6rem',
    borderRadius:'6px',
    border:'1px solid #d32f2f',
    background:'#333',
    color:'white',
    fontSize:'1rem'
  },

  saveBtnSmall: {
    background:'#28a745',
    color:'white',
    border:'none',
    padding:'0.5rem 1rem',
    borderRadius:'4px',
    cursor:'pointer'
  },

  cancelBtnSmall: {
    background:'#666',
    color:'white',
    border:'none',
    padding:'0.5rem 1rem',
    borderRadius:'4px',
    cursor:'pointer'
  },

  form: {
    display:'flex',
    flexDirection:'column',
    gap:'1rem'
  },
  formGroup: {
    display:'flex',
    flexDirection:'column',
    gap:'0.4rem'
  },
  label: {
    color:'#f5dede',
    fontSize:'0.9rem'
  },
  input: {
    padding:'0.7rem',
    borderRadius:'6px',
    border:'1px solid #d32f2f',
    background:'#333',
    color:'white',
    fontSize:'1rem'
  },
  select: {
    padding:'0.7rem',
    borderRadius:'6px',
    border:'1px solid #d32f2f',
    background:'#333',
    color:'white',
    fontSize:'1rem'
  },
  saveBtn: {
    flex:1,
    background:'#28a745',
    color:'white',
    border:'none',
    padding:'0.7rem',
    borderRadius:'6px',
    fontWeight:'bold',
    cursor:'pointer'
  },
  cancelBtn: {
    flex:1,
    background:'#d32f2f',
    color:'white',
    border:'none',
    padding:'0.7rem',
    borderRadius:'6px',
    fontWeight:'bold',
    cursor:'pointer'
  },
  closeBtn: {
    background:'#666',
    color:'white',
    border:'none',
    padding:'0.7rem 1.2rem',
    borderRadius:'6px',
    fontWeight:'bold',
    cursor:'pointer'
  } 
};