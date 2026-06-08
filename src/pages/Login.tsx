import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, GraduationCap, ChevronDown, Check } from 'lucide-react';

const GRADES = ['G10', 'G11', 'G12', 'G13'];

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState('G10');
  const [isGradeOpen, setIsGradeOpen] = useState(false);

  const initUserDoc = async (user: any, email: string) => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
         await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: email,
            role: 'student',
            grade: grade,
            createdAt: Date.now(),
            updatedAt: Date.now()
         });
      }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      await initUserDoc(res.user, res.user.email || 'user@google.com');
      navigate('/app');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Login cancelled by user.');
      } else {
        alert('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      const res = await signInAnonymously(auth);
      await initUserDoc(res.user, 'guest@example.com');
      navigate('/app');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/admin-restricted-operation') {
        alert('无法登录访客/跳过登录：\n\n您需要在 Firebase 控制台中启用【匿名身份验证 (Anonymous Authentication)】。');
      } else {
        alert('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-mono text-white relative overflow-hidden">
      {/* Subtle cinematic radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-white/10 via-white/5 to-transparent blur-[120px] opacity-30 rounded-full pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-8 shadow-none border border-white/10 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700" />
               <Sparkles className="w-10 h-10 text-white relative z-10 opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>
            <h1 className="text-5xl font-semibold tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30 mb-3 text-center leading-tight">
              Pro 开始。
            </h1>
            <p className="text-[#86868b] text-lg font-medium tracking-wide text-center">
              无界学术，登峰造极。
            </p>
          </div>

          <div className="w-full space-y-6">
            <div className="bg-[#1c1c1e]/80 backdrop-blur-3xl rounded-[32px] p-8 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            <div className="mb-8">
               <label className="block text-sm font-semibold text-[#a1a1a6] mb-3 flex items-center gap-2 tracking-wide">
                  <GraduationCap className="w-4 h-4" /> 选择您的当前年级
               </label>
               <div className="relative">
                  <button 
                    onClick={() => setIsGradeOpen(!isGradeOpen)}
                    className="w-full bg-black/40 hover:bg-black/60 transition-colors border border-white/5 rounded-2xl py-4 px-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-md"
                    aria-label="Select Grade"
                    aria-expanded={isGradeOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="text-[#f5f5f7] font-medium">{grade}</span>
                    <ChevronDown className="w-4 h-4 text-[#86868b]" />
                  </button>

                  <AnimatePresence>
                    {isGradeOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        role="listbox"
                        className="absolute top-full left-0 w-full mt-2 bg-[#2c2c2e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                      >
                         {GRADES.map((g) => (
                           <button 
                             key={g}
                             onClick={() => { setGrade(g); setIsGradeOpen(false); }}
                             role="option"
                             aria-selected={grade === g}
                             className={`w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-white/10 transition-colors focus:outline-none focus:bg-white/10 ${grade === g ? 'bg-white/5' : ''}`}
                           >
                             <span className={`font-medium ${grade === g ? 'text-white' : 'text-[#a1a1a6]'}`}>{g}</span>
                             {grade === g && <Check className="w-4 h-4 text-white" />}
                           </button>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={loading}
                aria-label="Login with Google"
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-4 rounded-full hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(255,255,255,0.15)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                登录 / 切换 Google 账号
              </button>
              
              <button 
                onClick={handleGuestLogin}
                disabled={loading}
                aria-label="Continue as Guest"
                className="w-full flex items-center justify-center gap-3 bg-white/5 text-[#f5f5f7] font-semibold py-4 px-4 rounded-full border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                访客免密登录
              </button>
            </div>
            </div>
          </div>
          
          <p className="text-center text-[#86868b] text-xs font-medium px-8 leading-relaxed mt-8">
            轻点以上按钮即表示您同意我们的服务条款与隐私政策。
          </p>
        </motion.div>
      </div>
    </div>
  );
}
