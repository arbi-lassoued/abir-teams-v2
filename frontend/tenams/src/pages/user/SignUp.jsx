import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/IHHeader';
import { useAuth } from '../../context/UseAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Create new user with User role (not admin)
      const response = await fetch('http://localhost:8001/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          department: formData.department || 'Engineering',
          sub_department: formData.department || 'Engineering',
          position: formData.position || 'Engineer',
          shift: 'All',
          user_roles_summary: ['User'], // New users get User role only
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.detail || errorData.message || 'Failed to create account';
        throw new Error(errorMsg);
      }

      const newUser = await response.json();
      
      // Login the new user
      const loginResponse = await fetch('http://localhost:8001/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to login after registration');
      }

      const userData = await loginResponse.json();
      
      // Save to localStorage
      localStorage.setItem('access_token', userData.access_token);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('roles', JSON.stringify(userData.roles || []));
      
      login(userData);
      
      // Redirect to Engineering Tools
      navigate('/project_management');
    } catch (err) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-xl font-semibold text-gray-800">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
          <p className="text-center text-gray-600">Sign up to access Engineering Tools</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g., Engineering"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.department}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                id="position"
                name="position"
                type="text"
                placeholder="e.g., Engineer"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.position}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
