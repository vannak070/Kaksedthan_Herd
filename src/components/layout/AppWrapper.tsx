'use client';

import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import SidebarLayout from './SidebarLayout';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </LanguageProvider>
  );
}
