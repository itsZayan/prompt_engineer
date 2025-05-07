import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiSave, FiCheck, FiLoader, FiAlertCircle, FiHelpCircle, FiWifi, FiWifiOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { generatePromptResult, testApiConnection } from '../lib/openRouter';
import { generateFallbackPrompt } from '../lib/fallbackPromptGenerator';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Function to format Markdown with HTML
const formatMarkdown = (text) => {
  if (!text) return '';
  
  // Escape HTML
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  // Use escaped text for processing
  let formatted = escapeHtml(text);
  
  // Replace headers (after escaping HTML)
  formatted = formatted
    .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold mb-3 text-indigo-300">$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold mb-2 text-indigo-300">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold mb-2 text-indigo-300">$1</h3>');
  
  // Replace bold and italic (after escaping HTML)
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic text-slate-200">$1</em>');
  
  // Replace unordered lists with proper HTML structure
  let inList = false;
  let listLines = [];
  let listResult = [];
  
  formatted.split('\n').forEach(line => {
    // Convert list markers to HTML list items
    if (line.match(/^- /)) {
      if (!inList) {
        listResult.push('<ul class="list-disc mb-3">');
        inList = true;
      }
      listResult.push(`<li class="text-slate-300">${line.replace(/^- /, '')}</li>`);
    } else if (inList) {
      listResult.push('</ul>');
      listResult.push(line);
      inList = false;
    } else {
      listResult.push(line);
    }
  });
  
  if (inList) {
    listResult.push('</ul>');
  }
  
  formatted = listResult.join('\n');
  
  // Simple paragraph conversion for lines that aren't special markdown
  const lines = formatted.split('\n');
  let inPre = false;
  let paragraphs = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip lines that are already wrapped in HTML
    if (line.startsWith('<') && line.endsWith('>')) {
      paragraphs.push(line);
      continue;
    }
    
    // Handle code blocks
    if (line.match(/^```/)) {
      inPre = !inPre;
      if (inPre) {
        paragraphs.push('<pre class="bg-slate-800 p-3 rounded-md overflow-auto my-3"><code class="text-amber-300">');
      } else {
        paragraphs.push('</code></pre>');
      }
      continue;
    }
    
    if (inPre) {
      paragraphs.push(line);
      continue;
    }
    
    // Handle normal paragraphs
    if (line.trim() !== '') {
      paragraphs.push(`<p class="mb-2 text-slate-300">${line}</p>`);
    } else {
      paragraphs.push(line); // Keep empty lines
    }
  }
  
  formatted = paragraphs.join('\n');
  
  // Replace code inline (after handling blocks)
  formatted = formatted
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-amber-300">$1</code>');
  
  // Replace links
  formatted = formatted
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline">$1</a>');
  
  // Replace blockquotes
  formatted = formatted
    .replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-indigo-500 pl-4 italic text-slate-400 my-2">$1</blockquote>');
  
  return formatted;
};

// Custom CSS for scrollbars and markdown
const customStyles = `
  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1e293b;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
  
  /* Markdown styling */
  .markdown-wrapper ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .markdown-wrapper ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .markdown-wrapper li {
    margin-bottom: 0.25rem;
  }
  
  .markdown-wrapper pre {
    margin: 1rem 0;
    padding: 0.75rem;
    background-color: #1e293b;
    border-radius: 0.375rem;
    overflow-x: auto;
  }
  
  .markdown-wrapper code {
    font-family: monospace;
  }
  
  .markdown-wrapper p {
    margin-bottom: 0.75rem;
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [promptType, setPromptType] = useState('general');
  const [showTips, setShowTips] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [apiStatus, setApiStatus] = useState({ tested: false, working: null, message: 'API status unknown' });
  const [testingApi, setTestingApi] = useState(false);
  const resultRef = useRef(null);

  // Placeholder ideas to make it fun for users
  const promptPlaceholders = [
    "Describe a futuristic city where nature and technology are in perfect harmony...",
    "Write a creative story about a detective who can communicate with animals...",
    "Create a detailed guide for designing a user-friendly mobile app...",
    "Explain quantum computing to a 10-year-old in a fun and engaging way...",
    "Design a character for a fantasy novel with unique abilities and background...",
  ];

  // Randomly select a placeholder
  const [placeholderText] = useState(() => {
    const randomIndex = Math.floor(Math.random() * promptPlaceholders.length);
    return promptPlaceholders[randomIndex];
  });

  const promptTypeOptions = [
    { value: 'general', label: 'General Purpose' },
    { value: 'creative', label: 'Creative Writing' },
    { value: 'technical', label: 'Technical Documentation' },
    { value: 'marketing', label: 'Marketing Copy' },
    { value: 'educational', label: 'Educational Content' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      setError('Please enter some text to generate a prompt');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      setGeneratedPrompt('');
      setUsingFallback(false);
      
      // Create a more focused prompt instruction
      const promptInstruction = `As a prompt engineer, enhance and structure this ${promptType} idea: "${userInput}". 
      Create a well-formatted, detailed prompt that includes specific requirements, context, and clear instructions.
      Focus on making it comprehensive yet concise, ready to use with AI systems.`;
      
      console.log("Sending to OpenRouter with prompt:", promptInstruction);
      
      // First do a quick API test if we haven't tested it yet
      if (!apiStatus.tested) {
        console.log("Testing API connection first...");
        const testResult = await testApiConnection();
        setApiStatus({
          tested: true,
          working: testResult.success,
          message: testResult.success ? 'API connection successful' : testResult.message || 'API test failed'
        });
        
        // If API test fails, use fallback immediately
        if (!testResult.success) {
          console.warn("API test failed, using fallback generator");
          setUsingFallback(true);
          const fallbackPrompt = generateFallbackPrompt(userInput, promptType);
          setGeneratedPrompt(fallbackPrompt);
          
          // Scroll to result
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }
      }
      
      let enhancedPrompt;
      try {
        // Try the API first
        enhancedPrompt = await generatePromptResult(promptInstruction);
      } catch (apiError) {
        console.warn("API request failed, using fallback generator:", apiError);
        toast.error("API is currently unavailable. Using offline mode.");
        
        // Update API status
        setApiStatus({
          tested: true,
          working: false,
          message: 'API request failed'
        });
        
        // Use fallback if API fails
        setUsingFallback(true);
        enhancedPrompt = generateFallbackPrompt(userInput, promptType);
      }
      
      if (!enhancedPrompt || enhancedPrompt.trim() === '') {
        throw new Error('Received empty response');
      }
      
      setGeneratedPrompt(enhancedPrompt);
      
      // Scroll to result
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (err) {
      console.error('Error generating prompt:', err);
      
      // Provide more specific error messages based on error type
      if (err.message.includes('API request failed')) {
        setError('API request failed. Please check your connection and try again.');
      } else if (err.message.includes('Unexpected response format')) {
        setError('Received unexpected response format. Please try again later.');
      } else {
        setError(`Failed to generate prompt: ${err.message}`);
      }
      
      toast.error('Unable to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt)
      .then(() => {
        setCopied(true);
        toast.success('Prompt copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy text.');
      });
  };

  const handleSave = async () => {
    if (!generatedPrompt.trim()) {
      toast.error('No prompt to save');
      return;
    }

    try {
      setSaving(true);
      
      // Debug flag to show details in console
      const DEBUG = true;
      
      if (DEBUG) {
        console.log("Attempting to save prompt with user:", user?.id);
        console.log("User input length:", userInput.length);
        console.log("Generated prompt length:", generatedPrompt.length);
      }
      
      // Check if user is authenticated
      if (!user || !user.id) {
        throw new Error('You must be logged in to save prompts');
      }
      
      // Create title from user input (it's required in the database)
      const title = userInput.length > 50 
        ? userInput.substring(0, 50) + '...' 
        : userInput;
      
      // Create object with required database fields (title is required)
      const promptData = { 
        user_id: user.id, 
        original_text: userInput,
        enhanced_prompt: generatedPrompt,
        created_at: new Date().toISOString(),
        title: title // Required field
      };
      
      if (DEBUG) console.log("Saving prompt data:", promptData);
      
      // Save to Supabase with better error handling
      const { data, error } = await supabase
        .from('prompts')
        .insert([promptData]);

      if (error) {
        console.error('Supabase Error:', error);
        throw new Error(error.message || 'Database error');
      }
      
      if (DEBUG) console.log('Prompt saved successfully:', data);
      
      toast.success('Prompt saved to your library!');
    } catch (err) {
      console.error('Error saving prompt:', err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleApiTest = async () => {
    try {
      setTestingApi(true);
      setApiStatus({ tested: true, working: null, message: 'Testing API connection...' });
      
      const result = await testApiConnection();
      
      if (result.success) {
        setApiStatus({ 
          tested: true, 
          working: true, 
          message: 'API connection successful' 
        });
        toast.success('API is working properly');
      } else {
        setApiStatus({ 
          tested: true, 
          working: false, 
          message: result.message || 'API test failed' 
        });
        toast.error('API connection failed');
      }
    } catch (error) {
      setApiStatus({ 
        tested: true, 
        working: false, 
        message: `Error testing API: ${error.message}` 
      });
      toast.error('Error testing API connection');
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-DEFAULT">
      <Navbar />
      
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="pt-20 pb-10 px-4 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Prompt Engineer</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Transform your simple ideas into powerful, detailed prompts optimized for AI systems
            </p>
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
              {usingFallback && (
                <div className="inline-flex items-center px-3 py-1 bg-amber-800/50 text-amber-300 text-sm rounded-full">
                  <FiWifiOff className="mr-1" /> Using offline mode (API unavailable)
                </div>
              )}
              
              {apiStatus.tested && (
                <div className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${
                  apiStatus.working 
                    ? 'bg-green-800/50 text-green-300' 
                    : 'bg-red-800/50 text-red-300'
                }`}>
                  {apiStatus.working ? <FiWifi className="mr-1" /> : <FiWifiOff className="mr-1" />}
                  {apiStatus.message}
                </div>
              )}
              
              <button
                onClick={handleApiTest}
                disabled={testingApi}
                className="inline-flex items-center px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-full transition-colors"
              >
                {testingApi ? (
                  <>
                    <FiLoader className="animate-spin mr-1" /> Testing API...
                  </>
                ) : (
                  <>
                    <FiWifi className="mr-1" /> Test API Connection
                  </>
                )}
              </button>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col"
            >
              <div className="card h-full">
                <h2 className="text-2xl font-semibold mb-6">Your Idea</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center text-red-400">
                    <FiAlertCircle className="mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Prompt Type
                    </label>
                    <select
                      value={promptType}
                      onChange={(e) => setPromptType(e.target.value)}
                      className="input"
                    >
                      {promptTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Enter Your Idea
                    </label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={placeholderText}
                      className="input h-56 resize-none"
                      required
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showTips && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-indigo-900/20 border border-indigo-800 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-indigo-300 flex items-center">
                            <FiHelpCircle className="mr-2" /> Tips for better results
                          </h3>
                          <button 
                            onClick={() => setShowTips(false)}
                            className="text-slate-400 hover:text-white"
                            aria-label="Close tips"
                          >
                            &times;
                          </button>
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                          <li>Be specific about your goals and intended audience</li>
                          <li>Include key concepts or terms you want to include</li>
                          <li>Specify the tone, style, or format you prefer</li>
                          <li>Longer inputs typically yield more detailed prompts</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className={`btn-primary py-3 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <FiLoader className="animate-spin mr-2" />
                        Engineering Prompt...
                      </span>
                    ) : (
                      'Engineer My Prompt'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
            
            {/* Result Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-7"
              ref={resultRef}
            >
              <div className="card h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Enhanced Prompt</h2>
                  
                  <div className="flex space-x-2">
                    {generatedPrompt && (
                      <>
                        <button
                          onClick={handleCopy}
                          disabled={copied}
                          className="btn-secondary flex items-center"
                        >
                          {copied ? (
                            <>
                              <FiCheck className="mr-1" /> Copied
                            </>
                          ) : (
                            <>
                              <FiCopy className="mr-1" /> Copy
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-accent flex items-center"
                        >
                          {saving ? (
                            <>
                              <FiLoader className="animate-spin mr-1" /> Saving
                            </>
                          ) : (
                            <>
                              <FiSave className="mr-1" /> Save
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 h-96 overflow-y-auto">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-300">Engineering your prompt...</p>
                      <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
                    </div>
                  ) : generatedPrompt ? (
                    <div className="text-slate-200 whitespace-pre-wrap markdown-wrapper custom-scrollbar">
                      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(generatedPrompt) }} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full p-1 opacity-50">
                        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                          <span className="text-4xl">✨</span>
                        </div>
                      </div>
                      <p className="text-slate-400 mt-4">Your enhanced prompt will appear here</p>
                    </div>
                  )}
                </div>
                
                {generatedPrompt && (
                  <div className="mt-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-indigo-900/30 border border-indigo-800 rounded-lg">
                      <div>
                        <h3 className="font-medium text-indigo-300 mb-1">What would you like to do with your prompt?</h3>
                        <p className="text-slate-300 text-sm">You can copy it for immediate use or save it to your library for later.</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCopy}
                          disabled={copied}
                          className="btn-secondary flex items-center py-2 px-4"
                        >
                          {copied ? (
                            <>
                              <FiCheck className="mr-2" /> Copied to Clipboard
                            </>
                          ) : (
                            <>
                              <FiCopy className="mr-2" /> Copy Prompt
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-accent flex items-center py-2 px-4"
                        >
                          {saving ? (
                            <>
                              <FiLoader className="animate-spin mr-2" /> Saving...
                            </>
                          ) : (
                            <>
                              <FiSave className="mr-2" /> Save to Library
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <Link to="/library" className="text-indigo-400 hover:text-indigo-300 text-sm">
                        View all your saved prompts in your library
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard; 