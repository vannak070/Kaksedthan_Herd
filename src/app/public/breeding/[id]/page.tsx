import React from 'react';
import PublicVerifyPage from '@/app/public/verify/[token]/page';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicBreedingPage({ params }: PageProps) {
  const { id } = await params;
  return <PublicVerifyPage params={Promise.resolve({ token: id })} />;
}
