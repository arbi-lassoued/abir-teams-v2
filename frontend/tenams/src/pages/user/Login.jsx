// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/IHHeader';
import loginUserAPI from '../../api/user/UserLoginAPI';
import { useAuth } from '../../context/UseAuth';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    try {
      const userData = await loginUserAPI(username, password);
      login(userData);
      
      // Redirect based on user role
      let isAdmin = false;
      if (Array.isArray(userData.roles)) {
        isAdmin = userData.roles.includes('Administrator');
      } else if (typeof userData.roles === 'string') {
        isAdmin = userData.roles === 'Administrator';
      }
      
      if (isAdmin) {
        navigate('/ih_prem_pm_list');
      } else {
        navigate('/project_management');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Invalid username or password');
      } else if (err.request) {
        setError('Network error - please check your connection');
      } else {
        setError('Login failed - please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-xl font-semibold text-gray-800">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <h2 className="text-3xl font-bold text-center text-gray-900">Login</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Don't have an account? Sign up
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}