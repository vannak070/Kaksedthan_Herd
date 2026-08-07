import React from 'react';
import { DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { BreedingRecord } from '@/types/breeding.types';

interface FinancialsSubTabProps {
  breedingRecords: BreedingRecord[];
  expenses?: any[];
}

export default function FinancialsSubTab({
  breedingRecords,
  expenses = []
}: FinancialsSubTabProps) {
  // Aggregate Financial metrics
  const totalBreedingRecords = breedingRecords.length;
  const totalServiceCostUSD = breedingRecords.reduce((acc, r) => acc + (r.breedingServiceCost || 50), 0);
  const totalStrawCostUSD = breedingRecords.reduce((acc, r) => acc + (r.breedingInseminationCost || 85), 0);
  const totalInvestmentUSD = totalServiceCostUSD + totalStrawCostUSD;

  const confirmedPregnantCount = breedingRecords.filter(r => r.pregnancyStatus === 'Confirmed Pregnant').length;
  const calvedCount = breedingRecords.filter(r => r.pregnancyStatus === 'Calved').length;
  const successRate = totalBreedingRecords > 0
    ? (((confirmedPregnantCount + calvedCount) / totalBreedingRecords) * 100).toFixed(1)
    : '0.0';

  const averageCostPerConception = (confirmedPregnantCount + calvedCount) > 0
    ? (totalInvestmentUSD / (confirmedPregnantCount + calvedCount)).toFixed(2)
    : totalInvestmentUSD.toFixed(2);

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Investment</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign className="h-4 w-4 text-[#16a34a]" />
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '8px 0 2px' }}>
            ${totalInvestmentUSD.toLocaleString()} USD
          </p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Across {totalBreedingRecords} breeding cycles</p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Conception Success Rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp className="h-4 w-4 text-[#1D4ED8]" />
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: 800, color: '#1D4ED8', margin: '8px 0 2px' }}>
            {successRate}%
          </p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>{confirmedPregnantCount + calvedCount} / {totalBreedingRecords} successful pregnancies</p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Cost Per Pregnant Dam</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 className="h-4 w-4 text-[#7E22CE]" />
            </div>
          </div>
          <p style={{ fontSize: '22px', fontWeight: 800, color: '#7E22CE', margin: '8px 0 2px' }}>
            ${averageCostPerConception} USD
          </p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Insemination + Service fee average</p>
        </div>
      </div>

      {/* Financial Breakdown Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart className="h-4 w-4 text-[#16a34a]" />
          Breeding Program Financial Cost Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Record ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Dam ID & Breed</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Sire Bull & Method</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Vet Service Fee</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Semen Straw Cost</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {breedingRecords.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 800, color: '#16a34a' }}>#{rec.id}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A' }}>
                    {rec.damName || rec.damId} ({rec.targetBreed || 'Cross'})
                  </td>
                  <td style={{ padding: '12px', color: '#475569' }}>
                    {rec.bullName || rec.sireName || 'Sire Bull'} ({rec.serviceType || 'AI'})
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                      background: rec.pregnancyStatus === 'Confirmed Pregnant' ? '#DCFCE7' : '#FEF3C7',
                      color: rec.pregnancyStatus === 'Confirmed Pregnant' ? '#15803D' : '#92400E'
                    }}>
                      {rec.pregnancyStatus || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#334155', fontWeight: 600 }}>
                    ${(rec.breedingServiceCost || 50).toLocaleString()} USD
                  </td>
                  <td style={{ padding: '12px', color: '#334155', fontWeight: 600 }}>
                    ${(rec.breedingInseminationCost || 85).toLocaleString()} USD
                  </td>
                  <td style={{ padding: '12px', fontWeight: 800, color: '#16a34a' }}>
                    ${((rec.breedingServiceCost || 50) + (rec.breedingInseminationCost || 85)).toLocaleString()} USD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
