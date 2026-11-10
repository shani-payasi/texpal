import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  // form fields ka state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [incomeBracket, setIncomeBracket] = useState('medium');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // registration form submit karo
  const handleSubmit = async (e) => {
    e.preventDefault();

    // required fields check karo
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // password length check karo
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // password match check karo
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        country,
        incomeBracket,
        currency,
      });
      navigate('/dashboard');
    } catch (err) {
      // Error handled by context toast
    } finally {
      setLoading(false);
    }
  };

  // country change hone pe currency bhi set karo
  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);

    if (selectedCountry === 'India') {
      setCurrency('INR');
    } else {
      setCurrency('USD');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-lavender-100 to-lavender-50">
      <div className="w-full max-w-lg">

        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl shadow-md mb-2">
            ₹$
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Tax<span className="text-brand-600">Pal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create your account to start managing finances & taxes
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Create Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized tax slabs and multi-currency tracking
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Name aur Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Full Name"
                placeholder="e.g. Maya Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FormInput
                label="Username"
                placeholder="e.g. mayadev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Country, Currency aur Income Bracket */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Country dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <select
                  value={country}
                  onChange={handleCountryChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>

              {/* Currency dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                </select>
              </div>

              {/* Income Bracket dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Income Bracket
                </label>
                <select
                  value={incomeBracket}
                  onChange={(e) => setIncomeBracket(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="low">&lt; $30k / ₹5L</option>
                  <option value="medium">$30k - $100k / ₹5L - ₹15L</option>
                  <option value="high">&gt; $100k / ₹15L+</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-3"
              loading={loading}
              icon={ArrowRight}
            >
              Complete Registration
            </Button>
          </form>

          {/* Login page ka link */}
          <p className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
