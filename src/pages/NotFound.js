import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-DEFAULT">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-pulse-slow opacity-50"></div>
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-6xl">🔍</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <h2 className="text-2xl text-slate-300 mb-6">Page Not Found</h2>
          
          <p className="text-slate-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-x-4">
            <Link to="/" className="btn-primary px-6 py-3">
              Back to Home
            </Link>
            <Link to="/dashboard" className="btn-secondary px-6 py-3">
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound; 