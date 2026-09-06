// Pages/OAuthSuccess.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userString));
        
        // 1. Store token in localStorage
        localStorage.setItem('token', token);
        
        // 2. Store user in AuthContext & localStorage
        updateUser(parsedUser);

        // 3. Navigate straight to profile
        navigate('/profile', { replace: true });
      } catch (err) {
        console.error('Failed to parse OAuth user payload:', err);
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <p className="text-lg animate-pulse">Completing authentication...</p>
    </div>
  );
}