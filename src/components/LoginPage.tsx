import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthInstance } from '../lib/firebase';
const auth = getAuthInstance();
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <form 
        onSubmit={handleLogin} 
        className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl shadow-blue-500/10 w-full max-w-md border border-gray-100 dark:border-gray-700 transition-transform duration-300 hover:shadow-3xl"
      >
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">LeadFlow</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium uppercase tracking-widest">Acesse sua conta</p>
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                {error}
            </div>
        )}

        <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all dark:text-white"
                    placeholder="voce@exemplo.com"
                    required
                  />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Senha</label>
              <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all dark:text-white"
                    placeholder="••••••••"
                    required
                  />
              </div>
            </div>
        </div>

        <button 
            type="submit" 
            className="w-full mt-10 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
