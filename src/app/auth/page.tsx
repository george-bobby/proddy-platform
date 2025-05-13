'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

const AuthPage = () => {
  useEffect(() => {
    redirect('/signin');
  }, []);

  return null;
};

export default AuthPage;
