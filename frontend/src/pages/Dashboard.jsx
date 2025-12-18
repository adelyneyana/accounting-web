import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

function Icon({name}){
  if(name==='tax') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1v22" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 7h14" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  if(name==='files') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  return null;
}

export default function Dashboard(){
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [lastTax, setLastTax] = useState({ taxDue: 0 });
  const [filesCount, setFilesCount] = useState(0);

  useEffect(() => {
    loadTaxSummary();
    loadFilesCount();
  }, []);

  async function loadTaxSummary() {
    try {
      // Try to load from backend first (persisted across sessions)
      const res = await api.get('/user/profile');
      if (res.data.user?.last_tax_summary) {
        console.log('Dashboard loaded tax summary from backend:', res.data.user.last_tax_summary);
        setLastTax(res.data.user.last_tax_summary);
        return;
      }
    } catch (e) {
      console.log('Backend not available, trying localStorage:', e.message);
    }
    
    // Fallback to localStorage
    try {
      const storageKey = user?.id ? `lastTaxSummary_${user.id}` : 'lastTaxSummary';
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('Dashboard loaded tax summary from localStorage:', parsed);
        setLastTax(parsed);
      } else {
        setLastTax({ taxDue: 0 });
      }
    } catch (e) {
      console.error('Failed to load tax summary:', e);
      setLastTax({ taxDue: 0 });
    }
  }

  async function loadFilesCount() {
    try {
      const res = await api.get('/files');
      setFilesCount(res.data.length);
    } catch (e) {
      console.error('Failed to load files count:', e);
      setFilesCount(0);
    }
  }

  // Listen for navigation back to dashboard to refresh data
  useEffect(() => {
    const handleFocus = () => {
      loadTaxSummary();
      loadFilesCount();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/');
  }
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome{user?.name ? (
              <>
                , <button onClick={() => nav('/profile')} className="text-indigo-600 hover:text-indigo-700 hover:underline transition">{user.name}</button>
              </>
            ) : ''}
          </h1>
          <p className="text-sm text-gray-600">Overview of your accounting workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition">Logout</button>
        </div>
      </header>

      <main>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-lg"><Icon name="tax"/></div>
              <div>
                <div className="text-xs text-gray-500">Tax Due</div>
                <div className="text-xl font-semibold">₱ {(lastTax?.taxDue || 0).toLocaleString()}</div>
                {lastTax?.updatedAt && (
                  <div className="text-[10px] text-gray-400 mt-1">as of {new Date(lastTax.updatedAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg"><Icon name="files"/></div>
              <div>
                <div className="text-xs text-gray-500">Files</div>
                <div className="text-xl font-semibold">{filesCount}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/tax" className="p-6 rounded-xl shadow hover:shadow-lg transition text-center text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <h3 className="text-lg font-semibold mb-2">Tax</h3>
            <p className="text-sm opacity-90">Manage tax entries and payments</p>
          </Link>

          <Link to="/files" className="p-6 rounded-xl shadow hover:shadow-lg transition text-center text-white" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <h3 className="text-lg font-semibold mb-2">Files</h3>
            <p className="text-sm opacity-90">Upload and download important documents</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
