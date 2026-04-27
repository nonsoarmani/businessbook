"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Jotter Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold text-green-700 hidden sm:inline-block">My Business Jotter</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-green-700 hover:text-green-800 hover:bg-green-50">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link to="/login">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;