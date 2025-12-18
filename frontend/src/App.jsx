import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaxPage from './pages/TaxPage';
import FilesPage from './pages/FilesPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  console.log('App component loaded');
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/tax" element={<PrivateRoute><TaxPage/></PrivateRoute>} />
          <Route path="/files" element={<PrivateRoute><FilesPage/></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage/></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
