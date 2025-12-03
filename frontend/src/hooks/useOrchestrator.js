import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api/orchestrator';

function useOrchestrator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const processRequest = async (request) => {
    setIsProcessing(true);
    const loadingToast = toast.loading('AI is analyzing your request...');

    try {
      const response = await axios.post(`${API_BASE}/process`, request);

      if (response.data.success) {
        setResults(response.data.data);
        toast.success('✨ AI analysis complete!', { id: loadingToast });
        return response.data.data;
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Orchestrator error:', error);
      toast.error('Failed to process request', { id: loadingToast });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestImprovements = async (creativeData) => {
    try {
      const response = await axios.post(`${API_BASE}/suggest-improvements`, {
        creativeData,
      });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Improvement suggestions error:', error);
      throw error;
    }
  };

  const generateComplete = async (request) => {
    setIsProcessing(true);
    const loadingToast = toast.loading('Generating complete creative...');

    try {
      const response = await axios.post(`${API_BASE}/generate-complete`, request);

      if (response.data.success) {
        setResults(response.data.data);
        toast.success('🎨 Creative generated!', { id: loadingToast });
        return response.data.data;
      }
    } catch (error) {
      console.error('Complete generation error:', error);
      toast.error('Failed to generate creative', { id: loadingToast });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processRequest,
    suggestImprovements,
    generateComplete,
    isProcessing,
    results,
  };
}

export default useOrchestrator;