import { redirect } from 'next/navigation';

export default async function UserLevelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/user-levels/${id}`);
}

