import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  // form fields ka state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // auth context se login function lo
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  // login form submit karo
  const handleSubmit = async (e) => {
    e.preventDefault();

    // check karo email aur password diya hai ya nahi
    if (!email || !password) {
      toast.error('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      // Error is toasted in context
    } finally {
      setLoading(false);
    }
  };

  // demo account se login karo
  const handleDemoSignIn = async () => {
    try {
      setDemoLoading(true);
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      // Error toasted in context
    } finally {
      setDemoLoading(false);
    }
  };

  // forgot password ka toast dikhao
  const handleForgotPassword = () => {
    toast('Password reset feature is active. Please contact support or register a new account.', {
      icon: 'ℹ️',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-lavender-100 to-lavender-50">
      <div className="w-full max-w-md">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl shadow-md mb-3">
            ₹$
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Tax<span className="text-brand-600">Pal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal Finance & Tax Estimator for Freelancers
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your credentials to access your financial dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Remember me aur forgot password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-brand-600 hover:text-brand-700 font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Divider - demo access ke liye */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Instant Demo Access
            </span>
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={demoLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-50 text-brand-700 font-bold text-xs transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            {demoLoading ? 'Signing in...' : 'Explore Demo Account (Pre-populated Data)'}
          </button>

          {/* Register page ka link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
