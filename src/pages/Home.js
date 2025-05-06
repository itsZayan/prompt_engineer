import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const features = [
    {
      icon: '✨',
      title: 'AI-Powered Prompt Engineering',
      description: 'Transform simple ideas into powerful, detailed prompts optimized for AI systems.'
    },
    {
      icon: '📚',
      title: 'Personal Prompt Library',
      description: 'Save and organize your best prompts for future use with easy editing and management.'
    },
    {
      icon: '🔄',
      title: 'One-Click Copy',
      description: 'Instantly copy your engineered prompts with a single click to use anywhere.'
    },
    {
      icon: '🧠',
      title: 'Smart Suggestions',
      description: 'Get intelligent recommendations to improve your prompts for better results.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-background-DEFAULT bg-hero-pattern">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full p-1"
            >
              <div className="w-full h-full bg-background-DEFAULT rounded-full flex items-center justify-center">
                <span className="text-4xl">✨</span>
              </div>
            </motion.div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Prompt Engineer Pro</span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Transform simple ideas into powerful, detailed AI prompts with our cutting-edge prompt engineering tool. Elevate your AI interactions today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background-lighter">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Our tools make prompt engineering simple, efficient, and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:shadow-glow transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-background-DEFAULT">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Just three simple steps to transform your ideas into powerful prompts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Your Idea',
                description: 'Type in your basic idea or concept that you want to expand into a detailed prompt.'
              },
              {
                step: '02',
                title: 'AI Enhancement',
                description: 'Our AI system analyzes your input and transforms it into a well-structured, detailed prompt.'
              },
              {
                step: '03',
                title: 'Copy & Use',
                description: 'Copy your new enhanced prompt with a single click and use it in any AI system.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-lg text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-opacity-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Prompts?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of users creating powerful, effective prompts with our advanced tools.
          </p>
          <Link 
            to="/register" 
            className="btn-primary text-lg px-8 py-3 inline-block animate-pulse-slow"
          >
            Get Started For Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 