import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StandardAnimalImage from '@/components/common/StandardAnimalImage';
import { fetchSourcingCompanyByIdAction, fetchSourcingCompanySiresAction } from '@/app/actions';
import {
  Building2,
  ArrowLeft,
  Edit,
  MapPin,
  Users,
  Beef,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Dna,
  Tag,
  DollarSign,
  FileText
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const FLAG_MAP: Record<string, string> = {
  'USA': '🇺🇸', 'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Netherlands': '🇳🇱',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'Cambodia': '🇰🇭',
  'France': '🇫🇷',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'New Zealand': '🇳🇿',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
};

export default async function SourcingCompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await fetchSourcingCompanyByIdAction(id);
  const siresRes = await fetchSourcingCompanySiresAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-xl mx-auto">
        <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Sourcing Company Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No company record found for ID: {id}</p>
        <Link href="/sourcing-companies" className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-bold px-4 py-2 rounded-xl mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sourcing Companies</span>
        </Link>
      </div>
    );
  }

  const company = res.data;
  const companySires = siresRes.data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* PageHeader (Farm Station UI Standard) */}
      <PageHeader
        title={company.name}
        subtitle={`Supplier Code: ${company.code} • Country: ${FLAG_MAP[company.country] || '🌏'} ${company.country || 'Global'} • Contact: ${company.contactName || 'N/A'}`}
        breadcrumbs={[
          { label: 'Account Management' },
          { label: 'Sourcing Companies', href: '/sourcing-companies' },
          { label: company.name },
        ]}
        backHref="/sourcing-companies"
        backLabel="Back to Sourcing Companies"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/sourcing-companies"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Company Profile</span>
          </Link>
        </div>
      </PageHeader>

      {/* Top Section Grid (Farm Station UI Standard: 1/3 Image Card + 2/3 Profile Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width): Logo / Image Card + Country Flag & Status Badge */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div className="relative">
            <StandardAnimalImage
              src={company.imageUrl}
              alt={company.name}
              fallbackText={company.name}
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs border border-white/20 flex items-center gap-1">
              <span>{FLAG_MAP[company.country] || '🌏'}</span>
              <span>{company.country || 'Global'}</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className={`inline-block text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider ${
              company.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              ● {company.status} Partner
            </span>
          </div>
        </div>

        {/* Right Column (2/3 width): Profile & Specification Details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#dc5c15]" />
            <span>Sourcing Company Profile & Specifications</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Supplier Code</p>
              <p className="font-mono font-bold text-purple-700 mt-0.5">{company.code}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Company Name</p>
              <p className="font-extrabold text-slate-900 mt-0.5">{company.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Country of Origin</p>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                <span>{FLAG_MAP[company.country] || '🌏'}</span>
                <span>{company.country || 'Unspecified'}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Contact Person</p>
              <p className="font-bold text-slate-800 mt-0.5">{company.contactName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Direct Phone</p>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {company.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Official Email</p>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 text-slate-400" />
                {company.email || 'N/A'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Physical Station Address</p>
              <p className="font-medium text-slate-700 mt-0.5 flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{company.address || 'Address not specified'}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Official Website</p>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#dc5c15] hover:underline flex items-center gap-1 mt-0.5 break-all"
                >
                  <Globe className="h-3.5 w-3.5 text-[#dc5c15] shrink-0" />
                  <span>{company.website}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <p className="font-medium text-slate-400 italic mt-0.5">Website not specified</p>
              )}
            </div>
          </div>

          {company.notes && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-slate-400 font-medium text-xs">Notes & Specialization</p>
              <p className="text-xs text-slate-700 mt-0.5 font-medium">{company.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Counters (Farm Station Standard) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Dna className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Sires</p>
            <p className="text-lg font-black text-slate-900">{companySires.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Partner Status</p>
            <p className="text-lg font-black text-emerald-700">{company.status}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-[#dc5c15] rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Genetics Catalog</p>
            <p className="text-lg font-black text-slate-900">{company.country || 'Global'} Origin</p>
          </div>
        </div>
      </div>

      {/* Registered Sires Table (Farm Station Housed Livestock Standard) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Beef className="h-4 w-4 text-[#dc5c15]" />
              <span>Registered Sires & Imported Semen Stock ({companySires.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sire bulls and genetic straw material imported from {company.name}.
            </p>
          </div>
          <Link
            href="/sires/new"
            className="inline-flex items-center gap-1.5 bg-[#dc5c15] hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs"
          >
            <span>+ Register New Sire</span>
          </Link>
        </div>

        {companySires.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Dna className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No Registered Sires Found</p>
            <p className="text-slate-400 mt-0.5">No sire bull records are currently linked to this sourcing company.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sire Code</th>
                  <th className="py-3 px-4">Sire Bull Name</th>
                  <th className="py-3 px-4">Breed</th>
                  <th className="py-3 px-4">Unit Price (USD)</th>
                  <th className="py-3 px-4">Pedigree Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {companySires.map((sire: any) => (
                  <tr key={sire.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-purple-700">{sire.code || sire.id}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{sire.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <Tag className="h-3 w-3" />
                        {sire.breed || 'Brahman'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-[#dc5c15]">
                      {sire.price_usd ? `$${sire.price_usd}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Certified Lineage
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/sires/${sire.id}`}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                      >
                        <span>View Sire Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
