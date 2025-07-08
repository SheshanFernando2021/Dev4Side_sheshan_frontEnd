import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Auth/Login';
import Register from './Auth/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
