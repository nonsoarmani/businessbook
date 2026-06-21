"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate, useLocation } from 'react-router-dom';

const SubscriptionGuard = () => {
  const { user, profile, isSubscriptionActive, loading } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAppPath = location.pathname.startsWith('/app');
    const isNotAdmin = profile?.role !== 'admin';

    if (!loading && user && isNotAdmin && isAppPath && !isSubscriptionActive && location.pathname !== '/app/subscription') {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [user, profile, isSubscriptionActive, loading, location.pathname]);

  const handleGoToSubscription = () => {
    setShowDialog(false);
    navigate('/app/subscription');
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Subscription Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription has expired. Please make a payment to continue using the service.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowDialog(false)}>
            Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleGoToSubscription}>
            Renew Subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubscriptionGuard;
