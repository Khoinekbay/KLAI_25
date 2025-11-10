import React, { useState, useEffect } from 'react';
import { KlAiLogo } from './Icons';
import { type User } from '../types';

interface AuthProps {
  onAuthSuccess: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Force dark theme for the auth page
    document.documentElement.classList.add('dark');
    return () => {
      // Clean up class when component unmounts, though App component will take over
      // document.documentElement.classList.remove('dark');
    };
  }, []);


  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setError(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = () => {
    if (!username || !password) {
      setError('Tên đăng nhập và mật khẩu không được để trống.');
      return;
    }
    const users: User[] = JSON.parse(localStorage.getItem('kl-ai-users') || '[]');
    const user = users.find(u => u.username === username);
    if (user && user.password === password) {
      onAuthSuccess(username);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  const handleRegister = () => {
    if (!username || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    const users: User[] = JSON.parse(localStorage.getItem('kl-ai-users') || '[]');
    if (users.some(u => u.username === username)) {
      setError('Tên đăng nhập đã tồn tại.');
      return;
    }

    const newUser: User = { username, password };
    users.push(newUser);
    localStorage.setItem('kl-ai-users', JSON.stringify(users));
    onAuthSuccess(username);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary p-4">
      <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex justify-center mb-6">
          <KlAiLogo className="w-32 text-text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-1">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
        <p className="text-center text-text-secondary mb-6">
          {mode === 'login' ? 'Chào mừng trở lại!' : 'Bắt đầu cuộc trò chuyện với KL AI.'}
        </p>

        {error && <p className="bg-red-500/20 text-red-300 text-sm text-center p-3 rounded-lg mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">
                Tên đăng nhập
                </label>
                <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                required
                />
            </div>
            <div>
                <label htmlFor="password"className="block text-sm font-medium text-text-secondary mb-1">
                Mật khẩu
                </label>
                <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none"
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                />
            </div>
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword"className="block text-sm font-medium text-text-secondary mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}
            {mode === 'register' && (
              <p className="text-xs text-center text-text-secondary/90 !mt-3">
                Bằng việc đăng kí tài khoản, bạn đã chấp nhận mọi{' '}
                <a 
                  href="https://klai.framer.ai/terms-and-conditions" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-brand hover:underline"
                >
                  ĐIỀU KHOẢN &amp; ĐIỀU KIỆN
                </a>.
              </p>
            )}
            <button
                type="submit"
                className="w-full bg-brand text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-brand transition-opacity duration-200"
            >
                {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
        </form>
        <p className="text-center text-sm text-text-secondary mt-6">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button onClick={toggleMode} className="font-medium text-brand hover:underline ml-1">
            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>

        <p className="text-center text-xs text-text-secondary/70 mt-8">
          Được tạo bởi hai đồng tác giả là Khởi và Lý
        </p>
      </div>
    </div>
  );
};

export default Auth;