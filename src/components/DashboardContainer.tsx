'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLivestockDataAction } from '@/app/actions';
import DashboardHome from './DashboardHome';
import { ERPLivestockData } from '@/lib/types';

interface DashboardContainerProps {
  initialData: ERPLivestockData;
}

export default function DashboardContainer({ initialData }: DashboardContainerProps) {
  const { data: dbData } = useQuery<ERPLivestockData>({
    queryKey: ['livestock'],
    queryFn: async () => {
      const res = await getLivestockDataAction();
      if (res.success && res.data) {
        return res.data;
      }
      return initialData;
    },
    initialData: initialData,
    refetchOnWindowFocus: true,
  });

  return <DashboardHome data={dbData || initialData} />;
}
