import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// --- LOCATION SETTINGS: ONLY PLARIDEL, BULACAN ALLOWED
const PLARIDEL_LAT = 14.8842;
const PLARIDEL_LNG = 120.8592;
const ALLOWED_RADIUS_METERS = 5000; // 5km coverage for whole Plaridel

// MAIN FRONT PAGE
export default function HomePage() {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [showId, setShowId] = useState(false); 
  // --- LOCATION STATES
  const [locationAllowed, setLocationAllowed] = useState(false);

  const [locationMessage, setLocationMessage] = useState('Checking location access...');
  const [showMessage, setShowMessage] = useState(true);
  const timerRef = useRef(null); 
  const watchIdRef = useRef(null); 

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionChoice, setPermissionChoice] = useState(null); 

  // --- Calculate distance between two coordinates (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * Math.PI / 180;
    const R = 6371e3; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (locationMessage) {
      setShowMessage(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowMessage(false);
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [locationMessage]);

  useEffect(() => {
    const saved = localStorage.getItem('locationPermission');
    if (saved) {
      setPermissionChoice(saved);
      setShowPermissionModal(false); 
     
      setLocationMessage('Checking location access...');
      setLocationAllowed(false);
    } else {
      setShowPermissionModal(true);
    }
  }, []);

  // --- Check location: ONLY ALLOW PLARIDEL AREA
  const checkLocation = async () => {
  
    setLocationMessage('Checking location access...');
    setLocationAllowed(false);

    if (!navigator.geolocation) {
      setLocationMessage('⚠️ Turn on your Device Location / GPS to use the App');
      setLocationAllowed(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const distanceFromPlaridelCenter = getDistance(userLat, userLng, PLARIDEL_LAT, PLARIDEL_LNG);
        
      if (distanceFromPlaridelCenter <= ALLOWED_RADIUS_METERS) {
        setLocationAllowed(true);
        setLocationMessage('✅ Location verified — You are in Plaridel. App available.');
      } else {
        setLocationMessage('❌ You can use this app in PLARIDEL ONLY!');
        setLocationAllowed(false);
      }

    } catch (err) {
      setLocationMessage('⚠️ Turn on your Device Location / GPS to use the App');
      setLocationAllowed(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        
        setLocationMessage('Checking location access...');
        setLocationAllowed(false);

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distanceFromPlaridelCenter = getDistance(userLat, userLng, PLARIDEL_LAT, PLARIDEL_LNG);
        
        if (distanceFromPlaridelCenter <= ALLOWED_RADIUS_METERS) {
          setLocationAllowed(true);
          setLocationMessage('✅ Location verified — You are in Plaridel. App available.');
        } else {
          setLocationMessage('❌ You can use this app in PLARIDEL ONLY!');
          setLocationAllowed(false);
        }
      },
      (err) => {
        setLocationMessage('⚠️ Turn on your Device Location / GPS to use the App');
        setLocationAllowed(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handlePermissionSelect = (choice) => {
    setPermissionChoice(choice);
    setShowPermissionModal(false); 
    if (choice === 'always') {
      localStorage.setItem('locationPermission', 'always'); 
    }
    checkLocation();
  };


  useEffect(() => {
    if (permissionChoice !== null) {
      checkLocation();
    }
  }, [permissionChoice]);

  const handleNavigation = (type) => {
    if (!locationAllowed) {
      setError('❌ You can use this app in PLARIDEL ONLY!');
      return;
    }
    if (!/^\d{6}$/.test(idNumber.trim())) {
      setError('⚠️ Please enter a valid 6‑Digit ID Number First');
      return;
    }
    setError('');
    navigate(`/second-page?type=${type}&id=${idNumber}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🍽️ Canteen App</h1>
      </header>

      {showPermissionModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Allow Location Notification</h3>
            <p style={styles.modalText}>This app needs location access to verify you are in Plaridel, Bulacan.</p>
            <div style={styles.modalButtons}>
              <button 
                style={styles.modalBtn} 
                onClick={() => handlePermissionSelect('this_time')}
              >
                Allow this time
              </button>
              <button 
                style={styles.modalBtnPrimary} 
                onClick={() => handlePermissionSelect('always')}
              >
                Allow Always
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessage && locationMessage && (
        <div style={styles.messageWrapper}>
          <div style={locationAllowed ? styles.locationGood : styles.locationBad}>
            {locationMessage}
          </div>
        </div>
      )}

      <section style={styles.hero}>
        <div style={styles.card}>
          <h3 style={styles.title}>START TO ORDER!</h3>
          <p style={styles.subtitle}>Order your Favorite meals, Snacks & Drinks in Seconds!</p>

          <div style={styles.inputBoxWrapper}>
            <div style={styles.inputContainer}>
              <input
                type="text" 
                placeholder="Input ID Number"
                value={idNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setIdNumber(val);
                  setError('');
                }}
                style={styles.idInput}
                disabled={!locationAllowed}
              />
              
            </div>
            {error && <p style={styles.errorText}>{error}</p>}
          </div>
          
          <div style={styles.buttonGroup}>
            <button 
              style={{...styles.btnPrimary, opacity: locationAllowed ? 1 : 0.6, cursor: locationAllowed ? 'pointer' : 'not-allowed'}}
              onClick={() => handleNavigation('pickup')}
              disabled={!locationAllowed}
            >
              🏠 Take Out
            </button>
            <button 
              style={{...styles.btnSecondary, opacity: locationAllowed ? 1 : 0.6, cursor: locationAllowed ? 'pointer' : 'not-allowed'}}
              onClick={() => handleNavigation('dinein')}
              disabled={!locationAllowed}
            >
              🍽️ Dine in
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    background: 'transparent',
  },
  header: {
    background: '#2a7390',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logo: {
   margin: 0,
   fontSize: '1.5rem',
   fontFamily: 'Georgia, "Times New Roman", serif',
   fontWeight: 'bold',
   fontStyle: 'italic',
   letterSpacing: '0.5px',
  },
  messageWrapper: {
    position: 'absolute',
    top: '100px',
    left: 0,
    right: 0,
    textAlign: 'center',
    background: 'transparent !important',
    padding: '0',
    margin: '0',
    zIndex: 10,
  },

  locationGood: {
    background: '#e6ffed',
    color: '#2e7d32',
    padding: '0.4rem 1rem',
    margin: '0 auto',
    fontSize: '0.9rem',
    borderRadius: '20px',
    width: 'fit-content',
    display: 'inline-block',
    boxShadow: 'none',
    border: 'none',
  },
  locationBad: {
    background: '#fff3f3',
    color: '#d32f2f',
    padding: '0.4rem 1rem',
    margin: '0 auto',
    fontSize: '0.9rem',
    borderRadius: '20px',
    width: 'fit-content',
    display: 'inline-block',
    boxShadow: 'none',
    border: 'none',
  },

  hero: {
    background: 'url(/public/images/Homepage.jpg) center/cover no-repeat',
    height: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    background: 'rgba(243, 212, 202, 0.8)',
    padding: '2rem 4rem 3rem',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '300px',
  },
  title: {
    margin: 10,
    color: 'black',
    fontSize: '2.5rem',
    fontFamily: 'Montserrat, Poppins, Arial Black, sans-serif',
    fontWeight: '800',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    textShadow: '2px 3px 2px rgb(0 0 0 / 0.2)',
  },
  subtitle: {
   fontSize: '1.1rem',
   marginBottom: '1.2rem',
   color: '#444', 
   fontFamily: 'Poppins, Roboto, sans-serif',
   fontWeight: '300', 
  },

  inputBoxWrapper: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputContainer: {
    position: 'relative',
    width: '160px', 
  },
  idInput: {
    width: '100%',
    padding: '0.5rem 0.8rem',
    fontSize: '0.95rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    textAlign: 'center',
    letterSpacing: '0.15rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '0.8rem',
    margin: '0.3rem 0 0 0',
  },

  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  btnPrimary: {
    background: '#165DFF',
  color: 'white',
  border: 'none',
  padding: '0.8rem 1.8rem',
  fontSize: '1.05rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'Poppins, Montserrat, Arial Black, sans-serif',
  fontWeight: '700',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  },
  btnSecondary: {
    background: 'white',
  color: '#165DFF',
  border: '2px solid #165DFF',
  padding: '0.8rem 1.8rem',
  fontSize: '1.05rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'Poppins, Montserrat, Arial Black, sans-serif',
  fontWeight: '700',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalBox: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    width: '320px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    margin: '0 0 1rem',
    fontSize: '1.2rem',
    color: '#333',
  },
  modalText: {
    margin: '0 0 1.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  modalButtons: {
    display: 'flex',
    gap: '0.8rem',
    justifyContent: 'center',
  },
  modalBtn: {
    background: '#f0f0f0',
    color: '#333',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  modalBtnPrimary: {
    background: '#165DFF',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  }
};