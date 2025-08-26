import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock } from 'react-icons/fi';
import cusmanoLogo from '../../assets/cusmano-logo.png';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-4">

      {/* Floating background decorations */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-100 rounded-full opacity-5 blur-2xl animate-ping-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-200 rounded-full opacity-5 blur-lg animate-float-sm"></div>

      {/* Logo */}
      <img
        src={cusmanoLogo}
        alt="Cusmano Logo"
        className="absolute top-6 left-6 w-40 opacity-30 z-20 animate-subtle-float drop-shadow-lg"
      />

      {/* Form container */}
      <div className="z-10 w-full max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-200 backdrop-blur-md bg-opacity-80">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-lime-400 text-white text-lg font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-lime-500 hover:-translate-y-1 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:transform-none disabled:hover:scale-100"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Link to register */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
