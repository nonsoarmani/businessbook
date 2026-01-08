"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);

        if (_event === 'SIGNED_OUT') {
          toast.info('You have been signed out.');
          navigate('/auth');
        } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          toast.success('Welcome back!');
          navigate('/'); // Redirect to dashboard after sign-in
        } else if (_event === 'INITIAL_SESSION' && !session) {
          navigate('/auth'); // Redirect to auth if no initial session
        }
      }
    );

    // Fetch initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        toast.error(error.message);
      }
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      if (!session) {
        navigate('/auth');
      }
    };

    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setSession(null);
      setUser(null);
      toast.success('Successfully signed out.');
      navigate('/auth');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading user session...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};