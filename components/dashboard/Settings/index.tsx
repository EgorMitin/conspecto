import React from 'react';
import CustomDialogTrigger from '@/components/CustomDialogTrigger';
import SettingsForm from './SettingsForm';

interface SettingsProps {
  children: React.ReactNode;
}

export default function Settings ({ children }: SettingsProps) {
  return (
    <CustomDialogTrigger
      header="Settings"
      content={<SettingsForm />}
    >
      {children}
    </CustomDialogTrigger>
  );
};
