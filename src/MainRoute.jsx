import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './AdminPage.jsx';
import HomePage from './App.jsx';
import SecondPage from './SecondPage.jsx';

export default function MainRoute() {
  return (
    <Router basename="/"> {/* ← ADD THIS PART */}
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/second-page" element={<SecondPage />} />
      </Routes>
    </Router>
  );
}