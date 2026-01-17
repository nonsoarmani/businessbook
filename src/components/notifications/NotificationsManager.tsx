"use client";
import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/state/businessStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Calendar, AlertCircle } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

interface Notification {
  id: string;
  type: 'debt' | 'inventory' | 'reminder';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationsManager = () => {
  const { state } = useBusiness();
  const { debts, inventory } = state;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Generate notifications based on business data
  useEffect(() => {
    const newNotifications: Notification[] = [];
    
    // Debt notifications
    debts.forEach(debt => {
      const dueDate = parseISO(debt.dueDate);
      
      if (debt.status !== 'paid') {
        if (isToday(dueDate)) {
          newNotifications.push({
            id: `debt-today-${debt.id}`,
            type: 'debt',
            title: 'Debt Due Today',
            message: `Payment of ₦${debt.amountOwed.toLocaleString()} from ${debt.customerName} is due today`,
            date: debt.dueDate,
            read: false,
            priority: 'high'
          });
        } else if (isTomorrow(dueDate)) {
          newNotifications.push({
            id: `debt-tomorrow-${debt.id}`,
            type: 'debt',
            title: 'Debt Due Tomorrow',
            message: `Payment of ₦${debt.amountOwed.toLocaleString()} from ${debt.customerName} is due tomorrow`,
            date: debt.dueDate,
            read: false,
            priority: 'medium'
          });
        } else if (isPast(dueDate)) {
          newNotifications.push({
            id: `debt-overdue-${debt.id}`,
            type: 'debt',
            title: 'Overdue Debt',
            message: `Payment of ₦${debt.amountOwed.toLocaleString()} from ${debt.customerName} is overdue`,
            date: debt.dueDate,
            read: false,
            priority: 'high'
          });
        }
      }
    });
    
    // Inventory notifications
    inventory.forEach(item => {
      if (item.quantity <= (item.lowStockThreshold || 0)) {
        newNotifications.push({
          id: `inventory-low-${item.id}`,
          type: 'inventory',
          title: 'Low Stock Alert',
          message: `Item "${item.name}" is running low. Only ${item.quantity} ${item.unit} left in stock`,
          date: item.lastUpdated,
          read: false,
          priority: 'high'
        });
      }
    });
    
    setNotifications(newNotifications);
  }, [debts, inventory]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Notifications & Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="notifications">Enable Notifications</Label>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold">
            {notifications.length > 0 
              ? `Notifications (${unreadCount} unread)` 
              : 'No notifications'}
          </h3>
          
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read 
                      ? 'bg-muted/40' 
                      : 'bg-background border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {notification.type === 'debt' && (
                        <AlertCircle className={`h-5 w-5 mt-0.5 ${
                          notification.priority === 'high' ? 'text-destructive' : 'text-warning'
                        }`} />
                      )}
                      {notification.type === 'inventory' && (
                        <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive" />
                      )}
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(parseISO(notification.date), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications at this time.</p>
              <p className="text-sm mt-2">Notifications will appear when you have upcoming debts or low inventory.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsManager;