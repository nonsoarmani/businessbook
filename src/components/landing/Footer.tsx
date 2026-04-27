"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const logoUrl = 'https://kugxbisasbylnnzpvrzw.supabase.co/storage/v1/object/public/user_uploads/Jotter%20Logo%203_2.png';

  return (
    <footer className="bg-gray-50 border-t py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt="Jotter Logo" className="h-8 w-auto object-contain" />
              <span className="text-xl font-bold text-green-700">My Business Jotter</span>
            </div>
            <p className="text-gray-600 max-w-sm">
              Empowering Nigerian small business owners with simple, digital tools to manage their finances and grow their dreams.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/login" className="hover:text-green-600">Features</Link></li>
              <li><Link to="/login" className="hover:text-green-600">Pricing</Link></li>
              <li><Link to="/login" className="hover:text-green-600">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/login" className="hover:text-green-600">About Us</Link></li>
              <li><Link to="/login" className="hover:text-green-600">Contact</Link></li>
              <li><Link to="/login" className="hover:text-green-600">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} My Business Jotter. All rights reserved. Made in Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;