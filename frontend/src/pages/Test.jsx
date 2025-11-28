import { useState } from 'react';
import api from '../services/api';

function Test() {
  const [status, setStatus] = useState({});
  
  const testBackend = async () => {
    try {
      const response = await api.get('/test');
      setStatus(prev => ({ ...prev, backend: '✅ ' + response.message }));
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: '❌ ' + error.message }));
    }
  };
  
  const testUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'test');
      
      try {
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStatus(prev => ({ ...prev, upload: '✅ Uploaded: ' + response.data.imageId }));
      } catch (error) {
        setStatus(prev => ({ ...prev, upload: '❌ ' + error.message }));
      }
    };
    
    input.click();
  };
  
  const testAI = async () => {
    try {
      const response = await api.post('/ai/generate-copy', {
        productInfo: {
          name: 'Test Product',
          category: 'test'
        },
        style: 'modern'
      });
      setStatus(prev => ({ ...prev, ai: '✅ AI works: ' + response.data.suggestions[0].headline }));
    } catch (error) {
      setStatus(prev => ({ ...prev, ai: '❌ ' + error.message }));
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">System Tests</h1>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testBackend}
            className="px-4 py-2 bg-blue-600 text-white rounded mr-4"
          >
            Test Backend
          </button>
          <span>{status.backend}</span>
        </div>
        
        <div>
          <button
            onClick={testUpload}
            className="px-4 py-2 bg-green-600 text-white rounded mr-4"
          >
            Test Upload
          </button>
          <span>{status.upload}</span>
        </div>
        
        <div>
          <button
            onClick={testAI}
            className="px-4 py-2 bg-purple-600 text-white rounded mr-4"
          >
            Test AI
          </button>
          <span>{status.ai}</span>
        </div>
      </div>
    </div>
  );
}

export default Test;