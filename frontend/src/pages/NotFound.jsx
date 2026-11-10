import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home } from 'lucide-react';

// 404 page - jab koi galat URL pe jaaye
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-lavender-50 text-center">
      <div className="max-w-md">
        <h1 className="text-7xl font-black text-brand-600 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The page or resource you requested could not be located. It might have been moved or doesn't exist.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
