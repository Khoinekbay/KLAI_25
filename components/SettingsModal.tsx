import React, { useState } from 'react';
import { type User } from '../types';
import { XIcon, SunIcon, MoonIcon } from './Icons';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const AVATARS = ['😊', '🧑‍💻', '🚀', '🤖', '💡', '🎓', '🌟', '🧠'];
const FONTS = [
    { name: 'Mặc định', value: "'Inter', sans-serif" },
    { name: 'Cổ điển', value: "'Lora', serif" },
    { name: 'Lập trình', value: "'Roboto Mono', monospace" },
];
const ROLES: { name: string; value: Required<User>['aiRole'] }[] = [
    { name: '🤖 Trợ lý', value: 'assistant' },
    { name: '👩‍🏫 Giáo viên', value: 'teacher' },
    { name: '🧑‍🎓 Bạn học', value: 'classmate' },
];
const TONES: { name: string; value: Required<User>['aiTone'] }[] = [
    { name: 'Cân bằng', value: 'balanced' },
    { name: 'Vui vẻ', value: 'humorous' },
    { name: 'Học thuật', value: 'academic' },
    { name: 'Ngắn gọn', value: 'concise' },
];

const DEFAULT_FONT = "'Inter', sans-serif";
const DEFAULT_ROLE = 'assistant';
const DEFAULT_TONE = 'balanced';


const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdateUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdate = (updates: Partial<User>) => {
    const updatedUser = { ...user, ...updates };
    onUpdateUser(updatedUser);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường.'); return;
    }
    if (user.password !== currentPassword) {
      setError('Mật khẩu hiện tại không đúng.'); return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.'); return;
    }

    handleUpdate({ password: newPassword });
    setSuccessMessage('Đổi mật khẩu thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 m-4 text-text-primary relative overflow-y-auto max-h-[90vh] border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-bold">Cài đặt Tài khoản</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-card-hover" aria-label="Đóng">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Theme Selection */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Giao diện</h3>
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => handleUpdate({ theme: 'light' })}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${ (user.theme || 'light') === 'light' ? 'bg-brand text-white font-semibold' : 'bg-input-bg hover:bg-border' }`}
                >
                   <SunIcon className="w-4 h-4" /> Sáng
                </button>
                 <button
                    onClick={() => handleUpdate({ theme: 'dark' })}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${ (user.theme || 'light') === 'dark' ? 'bg-brand text-white font-semibold' : 'bg-input-bg hover:bg-border' }`}
                >
                   <MoonIcon className="w-4 h-4" /> Tối
                </button>
            </div>
        </div>

        {/* Avatar Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Chọn Avatar</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {AVATARS.map(avatar => (
              <button 
                key={avatar}
                onClick={() => handleUpdate({ avatar })}
                className={`text-3xl rounded-full aspect-square flex items-center justify-center transition-transform duration-150 hover:scale-110 ${user.avatar === avatar ? 'bg-brand-secondary ring-2 ring-brand' : 'bg-input-bg'}`}
                aria-label={`Chọn avatar ${avatar}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
        
        {/* Font Selection */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Chọn Font Chữ</h3>
            <div className="flex items-center gap-2 flex-wrap">
                {FONTS.map(font => (
                    <button
                        key={font.name}
                        onClick={() => handleUpdate({ fontPreference: font.value })}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ (user.fontPreference || DEFAULT_FONT) === font.value ? 'bg-brand text-white font-semibold' : 'bg-input-bg hover:bg-border' }`}
                        style={{ fontFamily: font.value }}
                    >
                       {font.name}
                    </button>
                ))}
            </div>
        </div>

        {/* AI Personalization */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">🎓 Vai trò AI</h3>
            <div className="flex items-center gap-2 flex-wrap">
                {ROLES.map(p => (
                    <button
                        key={p.value}
                        onClick={() => handleUpdate({ aiRole: p.value })}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ (user.aiRole || DEFAULT_ROLE) === p.value ? 'bg-brand text-white font-semibold' : 'bg-input-bg hover:bg-border' }`}
                    >
                       {p.name}
                    </button>
                ))}
            </div>
        </div>
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">🎨 Giọng văn AI</h3>
            <div className="flex items-center gap-2 flex-wrap">
                {TONES.map(p => (
                    <button
                        key={p.value}
                        onClick={() => handleUpdate({ aiTone: p.value })}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${ (user.aiTone || DEFAULT_TONE) === p.value ? 'bg-brand text-white font-semibold' : 'bg-input-bg hover:bg-border' }`}
                    >
                       {p.name}
                    </button>
                ))}
            </div>
        </div>


        {/* Password Change */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-t border-border pt-6">Đổi Mật khẩu</h3>
          {error && <p className="bg-red-500/10 text-red-500 text-sm text-center p-3 rounded-lg mb-4">{error}</p>}
          {successMessage && <p className="bg-green-500/10 text-green-600 text-sm text-center p-3 rounded-lg mb-4">{successMessage}</p>}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
                <label htmlFor="currentPassword"className="block text-sm font-medium text-text-secondary mb-1"> Mật khẩu hiện tại </label>
                <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none" placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div>
                <label htmlFor="newPassword"className="block text-sm font-medium text-text-secondary mb-1"> Mật khẩu mới </label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none" placeholder="••••••••" autoComplete="new-password" />
            </div>
             <div>
                <label htmlFor="confirmNewPassword"className="block text-sm font-medium text-text-secondary mb-1"> Xác nhận mật khẩu mới </label>
                <input id="confirmNewPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-input-bg border border-border rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand focus:outline-none" placeholder="••••••••" autoComplete="new-password" />
            </div>
            <button
                type="submit"
                className="w-full bg-brand text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-brand transition-opacity duration-200"
            >
                Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;