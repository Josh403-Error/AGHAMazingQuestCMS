import React, { useState, useEffect, useRef } from 'react';
import { fetchAuth } from './api';

export default function ContentForm({ item = null, onDone }) {
  const [title, setTitle] = useState(item?.title || '');
  const [body, setBody] = useState(item?.body || '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTitle(item?.title || '');
    setBody(item?.body || '');
  }, [item]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('body', body);
      if (file) fd.append('file', file);

      const url = item ? `/api/content/items/${item.id}/` : '/api/content/items/';
      const method = item ? 'PATCH' : 'POST';

      const res = await fetchAuth(url, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        const msg = ct.includes('application/json') ? JSON.stringify(await res.json()) : await res.text();
        console.error('Upload failed:', msg);
        let userMessage = 'Content Failed to Upload';
        try {
          if (ct.includes('application/json')) {
            const data = JSON.parse(msg);
            if (typeof data === 'object') {
              const parts = [];
              for (const k of Object.keys(data)) {
                parts.push(`${k}: ${Array.isArray(data[k]) ? data[k].join(', ') : String(data[k])}`);
              }
              userMessage += '\n' + parts.join('\n');
            } else if (data.message) {
              userMessage += `\n${data.message}`;
            }
          } else if (msg) {
            userMessage += `\n${msg}`;
          }
        } catch (e) {
          console.error('Error parsing server error payload', e);
        }
        setErrorMsg(userMessage);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const payload = await res.json();
        if (payload && payload.message) {
          alert(`${payload.message}\nContent ID: ${payload.id}`);
        } else {
          alert('Content Uploaded');
        }
      } else {
        alert('Content Uploaded');
      }
      onDone();
    } catch (err) {
      console.error(err);
      setErrorMsg('Content Failed to Upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{item ? 'Edit Content' : 'Upload Content'}</h3>
      
      <div className="mb-5">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Enter content title"
        />
      </div>
      
      <div className="mb-5">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="body">
          Body
        </label>
        <textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          placeholder="Enter content body"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          File (optional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          onChange={e => setFile(e.target.files[0])}
          className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            transition"
        />
        <p className="mt-2 text-sm text-gray-500">
          Supported formats: JPG, PNG, PDF. Max size: 10MB.
        </p>
      </div>
      
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 whitespace-pre-wrap text-sm">{errorMsg}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition
            ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {item ? 'Saving...' : 'Uploading...'}
            </span>
          ) : (
            item ? 'Save Changes' : 'Upload Content'
          )}
        </button>
        
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}