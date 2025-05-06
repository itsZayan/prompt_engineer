import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiTrash2, FiEdit, FiCheck, FiLoader, FiAlertCircle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
        prompt.prompt_type.toLowerCase().includes(term)
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
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-300">Loading your prompts...</p>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
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
                  className="card overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs uppercase">
                        {prompt.prompt_type}
                      </span>
                      <span className="ml-3 text-slate-400 text-sm">
                        Saved on {formatDate(prompt.created_at)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopy(prompt.id, prompt.enhanced_prompt)}
                        className="btn-secondary flex items-center py-1 px-3 text-sm"
                        disabled={copied === prompt.id}
                      >
                        {copied === prompt.id ? (
                          <>
                            <FiCheck className="mr-1" /> Copied
                          </>
                        ) : (
                          <>
                            <FiCopy className="mr-1" /> Copy
                          </>
                        )}
                      </button>
                      {editingPrompt !== prompt.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(prompt)}
                            className="btn-accent flex items-center py-1 px-3 text-sm"
                          >
                            <FiEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            className="btn-danger flex items-center py-1 px-3 text-sm"
                            disabled={deleting === prompt.id}
                          >
                            {deleting === prompt.id ? (
                              <FiLoader className="animate-spin" />
                            ) : (
                              <>
                                <FiTrash2 className="mr-1" /> Delete
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={saveEdit}
                            className="btn-primary flex items-center py-1 px-3 text-sm"
                            disabled={savingEdit}
                          >
                            {savingEdit ? (
                              <FiLoader className="animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn-danger flex items-center py-1 px-3 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Original Idea</h3>
                    <p className="text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                      {prompt.original_text}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Enhanced Prompt</h3>
                    {editingPrompt === prompt.id ? (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="input h-40 w-full"
                      />
                    ) : (
                      <div className="bg-slate-800/50 p-3 rounded-lg text-slate-200 whitespace-pre-wrap">
                        {prompt.enhanced_prompt}
                      </div>
                    )}
                  </div>
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