"use client";

import React from 'react';

const ReportsPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Business Reports</h1>
      <p className="text-muted-foreground">View daily, weekly, and monthly summaries of your business performance.</p>
      {/* Summary Tabs/Sections */}
      <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Summaries</h2>
        {/* Tabs for Daily, Weekly, Monthly summaries will go here */}
        <p>Reports coming soon...</p>
      </div>
    </div>
  );
};

export default ReportsPage;