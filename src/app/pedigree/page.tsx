'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { fetchCalvesAction, fetchSiresAction, fetchDamsAction } from '@/app/actions';
import { Sparkles, Beef, Baby, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PedigreeTreePage() {
  const [calves, setCalves] = useState<any[]>([]);
  const [sires, setSires] = useState<any[]>([]);
  const [dams, setDams] = useState<any[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCalvesAction(), fetchSiresAction(), fetchDamsAction()])
      .then(([c, s, d]) => {
        setCalves(c);
        setSires(s);
        setDams(d);
        if (c.length > 0) setSelectedAnimalId(c[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedCalf = calves.find(c => c.id === selectedAnimalId) || calves[0];
  const sire = selectedCalf ? sires.find(s => s.id === selectedCalf.sireId) : null;
  const dam = selectedCalf ? dams.find(d => d.id === selectedCalf.damId) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Multi-Generation Pedigree Lineage Tree"
        subtitle="Visual genetic family tree connecting Sires, Dams, and Offspring with parentage verification."
        breadcrumbs={[{ label: 'Pedigree Tree' }]}
      >
        <select
          value={selectedAnimalId}
          onChange={(e) => setSelectedAnimalId(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500"
        >
          <option value="" disabled>Select Animal to Inspect Tree</option>
          {calves.map((c) => (
            <option key={c.id} value={c.id}>Calf: {c.name || c.id} ({c.breed})</option>
          ))}
        </select>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : !selectedCalf ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Pedigree Tree Found</h3>
          <p className="text-xs text-slate-500 mt-1">Register a calf with Sire & Dam to view its lineage tree.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          {/* Level 1: Target Animal */}
          <div className="text-center max-w-sm mx-auto p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Target Subject (Generation 1)</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">{selectedCalf.name || selectedCalf.id}</h3>
            <p className="text-xs font-bold text-slate-600">{selectedCalf.breed} • {selectedCalf.sex}</p>
            <Link href={`/calves/${selectedCalf.id}`} className="inline-block text-xs font-extrabold text-[#dc5c15] mt-2 hover:underline">
              View Full Profile →
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-300" />
          </div>

          {/* Level 2: Parents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Sire Card */}
            <div className="p-5 bg-orange-50/60 border-2 border-orange-300 rounded-2xl">
              <span className="text-[10px] font-black text-[#dc5c15] uppercase tracking-widest flex items-center gap-1">
                <Beef className="h-3.5 w-3.5" /> Sire (Father)
              </span>
              <h4 className="text-base font-black text-slate-900 mt-1">{sire?.name || selectedCalf.sireId}</h4>
              <p className="text-xs font-bold text-slate-600">{sire?.breed || 'Wagyu'} • {sire?.bloodline || 'Fullblood'}</p>
              <p className="text-xs text-slate-400 mt-2">Owner: {sire?.ownerName || 'Kaksedthan Sire Bank'}</p>
              {sire && (
                <Link href={`/sires/${sire.id}`} className="inline-block text-xs font-extrabold text-[#dc5c15] mt-2 hover:underline">
                  View Sire Profile →
                </Link>
              )}
            </div>

            {/* Dam Card */}
            <div className="p-5 bg-purple-50/60 border-2 border-purple-300 rounded-2xl">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1">
                <Beef className="h-3.5 w-3.5" /> Dam (Mother)
              </span>
              <h4 className="text-base font-black text-slate-900 mt-1">{dam?.name || selectedCalf.damId}</h4>
              <p className="text-xs font-bold text-slate-600">{dam?.breed || 'Angus Cross'}</p>
              <p className="text-xs text-slate-400 mt-2">Owner: {dam?.ownerName || 'SNR Farm Owner'}</p>
              {dam && (
                <Link href={`/dams/${dam.id}`} className="inline-block text-xs font-extrabold text-purple-600 mt-2 hover:underline">
                  View Dam Profile →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
