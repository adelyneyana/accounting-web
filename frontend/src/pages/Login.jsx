import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function handleLogin(){
    try {
      setError('');
      setLoading(true);
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
    } finally { 
      setLoading(false); 
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Welcome Section */}
      <div className="mb-12 text-center">
        <h1 
          className="text-6xl font-bold mb-2"
          style={{ color: '#ffffff' }}
        >
          WELCOME
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          Accounting Management System
        </p>
      </div>

      {/* Login Card */}
      <div 
        className="w-96 p-8 rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#ffffff' }}
      >
        <h2 
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: '#333333' }}
        >
          Sign In
        </h2>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: '#fee',
              color: '#c33',
              border: '1px solid #fcc'
            }}
          >
            {error}
          </div>
        )}

        {/* Email Input */}
        <div className="mb-4">
          <label 
            className="block text-sm font-semibold mb-2"
            style={{ color: '#555555' }}
          >
            Email Address
          </label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="you@example.com" 
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
            style={{ 
              borderColor: '#e0e0e0',
              focusBorderColor: '#667eea'
            }}
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label 
            className="block text-sm font-semibold mb-2"
            style={{ color: '#555555' }}
          >
            Password
          </label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your password" 
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
            style={{ 
              borderColor: '#e0e0e0'
            }}
            disabled={loading}
          />
        </div>

        {/* Sign In Button */}
        <button 
          onClick={handleLogin} 
          disabled={loading || !email || !password}
          className="w-full py-3 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#667eea',
            opacity: (loading || !email || !password) ? 0.6 : 1,
            cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
          <span style={{ margin: '0 10px', color: '#999999' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p style={{ color: '#666666' }}>
            Don't have an account?{' '}
            <a 
              href="/register" 
              className="font-bold hover:underline"
              style={{ color: '#667eea' }}
            >
              Register here
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p 
        className="mt-12 text-sm"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        © 2025 Accounting System. All rights reserved.
      </p>
    </div>
  );
}
