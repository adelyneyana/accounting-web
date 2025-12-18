import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleRegister(){
    try {
      setError('');
      setSuccess('');
      
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
        setError('All fields are required');
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      setLoading(true);
      const res = await api.post('/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        nav('/');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
    } finally { 
      setLoading(false); 
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleRegister();
    }
  };

  const isFormValid = formData.name && formData.email && formData.password && formData.password_confirmation;

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
          JOIN US
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          Create your accounting account
        </p>
      </div>

      {/* Register Card */}
      <div 
        className="w-96 p-8 rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#ffffff' }}
      >
        <h2 
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: '#333333' }}
        >
          Register
        </h2>

        {/* Success Message */}
        {success && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: '#efe',
              color: '#3c3',
              border: '1px solid #cfc'
            }}
          >
            ✓ {success}
          </div>
        )}

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
            ✗ {error}
          </div>
        )}

        {/* Full Name Input */}
        <div className="mb-4">
          <label 
            className="block text-sm font-semibold mb-2"
            style={{ color: '#555555' }}
          >
            Full Name
          </label>
          <input 
            type="text"
            name="name"
            value={formData.name} 
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="John Doe" 
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
            style={{ 
              borderColor: '#e0e0e0'
            }}
            disabled={loading}
          />
        </div>

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
            name="email"
            value={formData.email} 
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="you@example.com" 
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
            style={{ 
              borderColor: '#e0e0e0'
            }}
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label 
            className="block text-sm font-semibold mb-2"
            style={{ color: '#555555' }}
          >
            Password
          </label>
          <input 
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="At least 8 characters" 
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
            style={{ 
              borderColor: '#e0e0e0'
            }}
            disabled={loading}
          />
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <label 
            className="block text-sm font-semibold mb-2"
            style={{ color: '#555555' }}
          >
            Confirm Password
          </label>
          <input 
            type="password" 
            name="password_confirmation"
            value={formData.password_confirmation} 
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Confirm your password" 
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition"
            style={{ 
              borderColor: '#e0e0e0'
            }}
            disabled={loading}
          />
        </div>

        {/* Register Button */}
        <button 
          onClick={handleRegister} 
          disabled={loading || !isFormValid}
          className="w-full py-3 rounded-lg font-bold text-white transition duration-200 transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#667eea',
            opacity: (loading || !isFormValid) ? 0.6 : 1,
            cursor: (loading || !isFormValid) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
          <span style={{ margin: '0 10px', color: '#999999' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p style={{ color: '#666666' }}>
            Already have an account?{' '}
            <Link 
              to="/" 
              className="font-bold hover:underline"
              style={{ color: '#667eea', textDecoration: 'none' }}
            >
              Sign in here
            </Link>
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
