"use client";

import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <AuthForm />
    </div>
  );
};

export default AuthPage;