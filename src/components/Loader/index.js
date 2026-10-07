import React from 'react';
import './Loader.css';
import logo from '../Navbar/logo-03.png';

export const Loader = () => (
  <div className="loading-state" role="status" aria-live="polite">
    <img src={logo} alt="" width="64" height="64" />
    <span>Loading…</span>
  </div>
);
