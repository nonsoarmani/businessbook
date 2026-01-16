"use client";

import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to BusinessBook! Your business overview will appear here.</p>
      {/* Placeholder for quick stats and recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Today's Sales</h2>
          <p className="text-2xl font-bold text-primary">₦0.00</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Today's Expenses</h2>
          <p className="text-2xl font-bold text-destructive">₦0.00</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Today's Profit/Loss</h2>
          <p className="text-2xl font-bold text-success">₦0.00</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Outstanding Debts</h2>
          <p className="text-2xl font-bold text-warning">₦0.00</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {/* Quick action buttons will go here */}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <p className="text-muted-foreground">No recent activity.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;