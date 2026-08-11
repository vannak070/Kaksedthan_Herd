'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ImageUploadContainer from '@/components/common/ImageUploadContainer';
import { fetchCalvesAction, updateCalfAction } from '@/app/actions';
import { Save, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCalfPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: id,
    name: '',
    sex: 'Male' as const,
    breed: '',
    birthWeight: 25,
    ownerName: '',
    farmLocation: '',
    imageUrl: '',
    status: 'Registered to Herdbook',
  });

  useEffect(() => {
    fetchCalvesAction()
      .then((calves) => {
        const found = calves.find((c) => c.id === id);
        if (found) {
          setFormData({
            id: found.id,
            name: found.name || '',
            sex: found.sex as any,
            breed: found.breed,
            birthWeight: found.birthWeight || 25,
            ownerName: found.ownerName || '',
            farmLocation: found.farmLocation || '',
            imageUrl: found.imageUrl || '',
            status: found.status || 'Registered to Herdbook',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateCalfAction(id, formData as any);
      router.push(`/calves/${id}`);
    } catch (err: any) {
      alert(`Error updating Calf: ${err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={`Edit Calf: ${formData.name || id}`}
        subtitle="Update biological profile, birth weight, owner, and photo."
        breadcrumbs={[
          { label: 'Calf Register', href: '/calves' },
          { label: formData.name || id, href: `/calves/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/calves/${id}`}
        backLabel="Back to Calf Profile"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-2">Calf Photo</label>
            <ImageUploadContainer
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              aspectRatio="1:1"
              placeholder="Upload or Update Calf Photo"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Calf ID</label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Calf Name / Tag</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Birth Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.birthWeight}
                onChange={(e) => setFormData({ ...formData, birthWeight: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push(`/calves/${id}`)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Updating...' : 'Update Calf Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
