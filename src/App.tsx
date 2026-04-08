import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import Layout from './components/Layout';
import React, { useState, useEffect } from 'react';
import { useTracking } from './hooks/useTracking';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function AppContent() {
  useTracking(); // Hook para rastrear mudanças de página

  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/produto/:id" element={<Layout><ProductDetailsPage /></Layout>} />
      <Route path="/mais-vendidos" element={<Layout><ProductsPage /></Layout>} />
      <Route path="/por-tamanho" element={<Layout><ProductsPage /></Layout>} />
      <Route path="/assinaturas" element={<Layout><div className="container mx-auto py-20 text-center">Página de Assinaturas em Breve</div></Layout>} />
      <Route path="/admin" element={<Login />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <Layout isAdmin>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
