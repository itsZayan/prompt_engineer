import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiTrash2, FiEdit, FiCheck, FiLoader, FiAlertCircle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';

// Function to format Markdown with HTML - as a workaround for ReactMarkdown issues
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

const Library = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filteredPrompts, setFilteredPrompts] = useState([]);

  // Fetch all saved prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setPrompts(data || []);
        setFilteredPrompts(data || []);
      } catch (err) {
        console.error('Error fetching prompts:', err);
        setError('Failed to load your saved prompts');
        toast.error('Error loading your prompt library');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPrompts();
    }
  }, [user]);

  // Filter prompts when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrompts(prompts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = prompts.filter(
      prompt => 
        prompt.original_text.toLowerCase().includes(term) || 
        prompt.enhanced_prompt.toLowerCase().includes(term) ||
        (prompt.prompt_type ? prompt.prompt_type.toLowerCase().includes(term) : false)
    );
    setFilteredPrompts(filtered);
  }, [searchTerm, prompts]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(id);
        toast.success('Prompt copied to clipboard!');
        setTimeout(() => setCopied(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy prompt');
      });
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt.id);
    setEditedText(prompt.enhanced_prompt);
  };

  const saveEdit = async () => {
    if (!editingPrompt || !editedText.trim()) {
      toast.error('No changes to save');
      return;
    }

    try {
      setSavingEdit(true);
      
      const { error } = await supabase
        .from('prompts')
        .update({ enhanced_prompt: editedText })
        .eq('id', editingPrompt);

      if (error) throw error;
      
      // Update local state
      setPrompts(prompts.map(prompt => 
        prompt.id === editingPrompt 
          ? { ...prompt, enhanced_prompt: editedText } 
          : prompt
      ));
      
      toast.success('Prompt updated successfully!');
      setEditingPrompt(null);
    } catch (err) {
      console.error('Error updating prompt:', err);
      toast.error('Failed to update prompt');
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingPrompt(null);
    setEditedText('');
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setPrompts(prompts.filter(prompt => prompt.id !== id));
      setFilteredPrompts(filteredPrompts.filter(prompt => prompt.id !== id));
      
      toast.success('Prompt deleted successfully!');
    } catch (err) {
      console.error('Error deleting prompt:', err);
      toast.error('Failed to delete prompt');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-DEFAULT">
      <Navbar />
      
      {/* Add the custom scrollbar styles */}
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
              <span className="gradient-text">Your Prompt Library</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Access, edit, and manage all your saved prompts in one place
            </p>
          </motion.div>
          
          {/* Search and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-slate-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your prompts..."
                className="input pl-10 py-3"
              />
            </div>
          </motion.div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center text-red-400 max-w-xl mx-auto">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Prompts Grid/List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-300">Loading your prompts...</p>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="col-span-3 text-center py-12"
              >
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📚</span>
                </div>
                {searchTerm ? (
                  <p className="text-slate-300">No prompts match your search term</p>
                ) : (
                  <>
                    <p className="text-slate-300 text-lg mb-2">Your library is empty</p>
                    <p className="text-slate-400">
                      Go to the dashboard to create and save prompts
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="card overflow-hidden bg-foreground-DEFAULT p-6 rounded-lg border border-slate-700 flex flex-col h-[420px] hover:shadow-glow hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 animate-floating"
                  style={{ 
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  {/* Card Header with Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {(prompt.title || "Untitled Prompt").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} is an Prompt...
                    </h3>
                    <p className="text-sm text-slate-400">
                      Created on {formatDate(prompt.created_at)}
                    </p>
                  </div>
                  
                  {/* Card Content - Enhanced Prompt */}
                  <div className="mb-4 flex-grow overflow-auto custom-scrollbar pr-2 markdown-wrapper">
                    <div 
                      className="markdown-content prose prose-invert prose-sm max-w-none text-slate-300"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(prompt.enhanced_prompt) }}
                    />
                  </div>
                  
                  {/* Card Actions */}
                  <div className="flex space-x-2 mt-auto pt-4">
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="px-4 py-2 bg-slate-700 hover:bg-indigo-600 text-white rounded flex items-center transition-colors duration-200"
                    >
                      <FiEdit className="mr-2" /> Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="px-4 py-2 bg-slate-700 hover:bg-red-600 text-white rounded flex items-center transition-colors duration-200"
                      disabled={deleting === prompt.id}
                    >
                      {deleting === prompt.id ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <>
                          <FiTrash2 className="mr-2" /> Delete
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Edit Mode Content */}
                  {editingPrompt === prompt.id && (
                    <div className="mt-4 border-t border-slate-700 pt-4">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Edit Enhanced Prompt</h4>
                      
                      {/* Preview Section */}
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-slate-500 mb-1">Preview:</h5>
                        <div 
                          className="bg-slate-800 p-3 rounded-lg mb-3 custom-scrollbar markdown-wrapper"
                          style={{ maxHeight: '150px', overflow: 'auto' }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(editedText) }} />
                        </div>
                      </div>
                      
                      {/* Editor Section */}
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="input h-40 w-full mb-3"
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={saveEdit}
                          className="btn-primary flex items-center py-1 px-3 text-sm"
                          disabled={savingEdit}
                        >
                          {savingEdit ? (
                            <FiLoader className="animate-spin mr-1" />
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn-secondary flex items-center py-1 px-3 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Library; 