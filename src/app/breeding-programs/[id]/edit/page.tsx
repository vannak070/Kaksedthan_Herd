'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import { fetchBreedingProgramsAction, updateBreedingStatusAction } from '@/app/actions';
import { Save, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBreedingProgramPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('Breeding');
  const [notes, setNotes] = useState('');
  const [programNumber, setProgramNumber] = useState('');

  useEffect(() => {
    fetchBreedingProgramsAction()
      .then((programs) => {
        const found = programs.find((p) => p.id === id);
        if (found) {
          setStatus(found.status);
          setNotes(found.notes || '');
          setProgramNumber(found.programNumber);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateBreedingStatusAction(id, status, notes);
      router.push(`/breeding-programs/${id}`);
    } catch (err: any) {
      alert(`Error updating program: ${err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-[#dc5c15] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={`Update Status: ${programNumber || id}`}
        subtitle="Transition program status across breeding, pregnancy check, calving, or completion."
        breadcrumbs={[
          { label: 'Breeding Program', href: '/breeding-programs' },
          { label: programNumber || id, href: `/breeding-programs/${id}` },
          { label: 'Update Status' },
        ]}
        backHref={`/breeding-programs/${id}`}
        backLabel="Back to Program Details"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Program Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#dc5c15]"
          >
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Breeding">Breeding (Inseminated)</option>
            <option value="Pregnancy Check">Pregnancy Check</option>
            <option value="Pregnant">Pregnant (Confirmed)</option>
            <option value="Expected Calving">Expected Calving</option>
            <option value="Calved">Calved (Calf Born)</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed / Not Pregnant</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Veterinary / Breeder Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add notes about insemination straw, vet inspection, pregnancy ultrasound result..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push(`/breeding-programs/${id}`)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#c44f0e] shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Updating...' : 'Save Program Status'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
