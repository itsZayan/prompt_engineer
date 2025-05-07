import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      {/* Add style for text glow */}
      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 10px rgba(129, 140, 248, 0.7);
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <motion.div 
                className="relative w-10 h-10 mr-2"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <svg 
                  viewBox="0 0 50 50" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                >
                  {/* Background circle with pulse animation */}
                  <motion.circle 
                    cx="25" 
                    cy="25" 
                    r="23" 
                    fill="url(#logoGradient)"
                    animate={{ 
                      opacity: [0.8, 1, 0.8],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Brain/neural network nodes */}
                  <g>
                    {/* Nodes */}
                    <circle cx="20" cy="18" r="3" fill="white" />
                    <circle cx="32" cy="15" r="2.5" fill="white" />
                    <circle cx="16" cy="28" r="2.5" fill="white" />
                    <circle cx="28" cy="28" r="2" fill="white" />
                    <circle cx="36" cy="25" r="2" fill="white" />
                    <circle cx="24" cy="37" r="2.5" fill="white" />
                    <circle cx="34" cy="35" r="2" fill="white" />
                    
                    {/* Connections with animation */}
                    <motion.path 
                      d="M20 18L32 15M20 18L16 28M20 18L28 28M32 15L36 25M16 28L24 37M28 28L24 37M36 25L34 35M28 28L34 35" 
                      stroke="white" 
                      strokeWidth="1"
                      strokeLinecap="round"
                      animate={{ 
                        opacity: [0.4, 0.8, 0.4] 
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    />
                  </g>
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="logoGradient" x1="10" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366F1" />
                      <stop offset="0.5" stopColor="#8B5CF6" />
                      <stop offset="1" stopColor="#D946EF" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-glow">
                Prompt Engineer
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/'
                    ? 'text-white bg-indigo-700'
                    : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                } transition-all`}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/dashboard'
                        ? 'text-white bg-indigo-700'
                        : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                    } transition-all`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/library"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/library'
                        ? 'text-white bg-indigo-700'
                        : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                    } transition-all`}
                  >
                    Library
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/login'
                        ? 'text-white bg-indigo-700'
                        : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                    } transition-all`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-indigo-700/50 focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-slate-900 shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/'
                  ? 'text-white bg-indigo-700'
                  : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
              } transition-all`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/dashboard'
                      ? 'text-white bg-indigo-700'
                      : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                  } transition-all`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/library"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/library'
                      ? 'text-white bg-indigo-700'
                      : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                  } transition-all`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Library
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/login'
                      ? 'text-white bg-indigo-700'
                      : 'text-gray-300 hover:text-white hover:bg-indigo-700/50'
                  } transition-all`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar; 