import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/HomePage.jsx';
import '../styles.css';

const root = document.createElement('div');
root.id = 'root';
document.body.replaceChildren(root);

createRoot(root).render(<React.StrictMode><HomePage /></React.StrictMode>);