import React from 'react';
import { createRoot } from 'react-dom/client';
import MorePage from './pages/MorePage.jsx';
import '../more.css';

const root = document.createElement('div');
root.id = 'root';
document.body.replaceChildren(root);

createRoot(root).render(<React.StrictMode><MorePage /></React.StrictMode>);