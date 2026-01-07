import React from 'react';
import BusinessInfoForm from '@/components/settings/BusinessInfoForm';
import ResetDataCard from '@/components/settings/ResetDataCard';
import ExportDataCard from '@/components/settings/ExportDataCard'; // Import new component
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-gray-600">Manage your business information and application preferences.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BusinessInfoForm />
        <div className="space-y-8"> {/* Grouping related cards */}
          <ExportDataCard /> {/* Add the new ExportDataCard here */}
          <ResetDataCard />
        </div>
      </div>
    </div>
  );
};

export default Settings;