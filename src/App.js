import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import NoteList from './components/NoteList';
import NoteForm from './components/NoteForm';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed unused apiError

  const fetchNotes = useCallback(async () => {
    if (!token) {
      setNotes([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.get('http://localhost:5000/api/notes', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.data.success) {
        setNotes(response.data.notes || []);
      } else {
        setNotes([]);
      }
    } catch (err) {
      setNotes([]);
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

 // Add this useEffect after the fetchNotes function
// Add this useEffect in App.js
useEffect(() => {
  if (token) {
    console.log('Setting axios header with token');
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
}, [token]);

 const handleLogin = (newToken, userData) => {
  console.log('🔑 LOGIN - Token received:', newToken);
  console.log('Token length:', newToken?.length);
  console.log('Token first 100 chars:', newToken?.substring(0, 100));
  
  // Save token
  localStorage.setItem('token', newToken);
  localStorage.setItem('user', JSON.stringify(userData));
  
  // Test token immediately
  setTimeout(() => {
    testToken(newToken);
  }, 500);
  
  setToken(newToken);
  setUser(userData);
  
  // Set axios header
  axios.defaults.headers.common['x-auth-token'] = newToken;
};

// Add test function
const testToken = async (token) => {
  console.log('🧪 Testing token...');
  try {
    const response = await axios.get('http://localhost:5000/api/notes/test-auth', {
      headers: { 'x-auth-token': token }
    });
    console.log('✅ Token test successful:', response.data);
  } catch (err) {
    console.error('❌ Token test failed:', err.response?.data || err.message);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setNotes([]);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        
        <div className="container">
          <Routes>
            <Route path="/login" element={
              !token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
            } />
            <Route path="/register" element={
              !token ? <Register onLogin={handleLogin} /> : <Navigate to="/" />
            } />
            <Route path="/" element={
              token ? (
                <div>
                  <NoteForm refreshNotes={fetchNotes} />
                  
                  {loading ? (
                    <p>Loading notes...</p>
                  ) : (
                    <NoteList 
                      notes={notes} 
                      refreshNotes={fetchNotes} 
                      user={user}
                    />
                  )}
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;