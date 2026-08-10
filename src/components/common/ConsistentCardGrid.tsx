'use client';

import React from 'react';
import { Tag, MapPin, User, ChevronRight, Syringe, Heart, Beef, Baby, Award } from 'lucide-react';

export interface CardGridItem {
  id: string;
  title: string;
  subtitle?: string;
  breed?: string;
  imageUrl?: string;
  status: string;
  statusColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate';
  ownerName?: string;
  farmLocation?: string;
  priceTag?: string;
  details?: { label: string; value: string }[];
  onClick?: () => void;
}

interface ConsistentCardGridProps {
  items: CardGridItem[];
  emptyMessage?: string;
}

export default function ConsistentCardGrid({ items, emptyMessage = 'No records found.' }: ConsistentCardGridProps) {
  const statusBadgeColors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={item.onClick}
          className="group bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#dc5c15]/40 transition-all duration-250 cursor-pointer flex flex-col justify-between"
        >
          <div>
            {/* Aspect-Ratio Preserved Image Box */}
            <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                  <Beef className="h-12 w-12" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${statusBadgeColors[item.statusColor || 'slate']}`}>
                  {item.status}
                </span>
              </div>

              {/* Breed Pill (Hide product type overlay on image as per requirement #6) */}
              {item.breed && (
                <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white shadow-xs">
                  {item.breed}
                </div>
              )}

              {/* Price Tag if present */}
              {item.priceTag && (
                <div className="absolute bottom-3 right-3 bg-[#dc5c15] text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md">
                  {item.priceTag}
                </div>
              )}
            </div>

            {/* Card Content Body */}
            <div className="p-4 space-y-2.5">
              <div>
                <h4 className="text-base font-black text-slate-900 leading-tight group-hover:text-[#dc5c15] transition-colors">
                  {item.title}
                </h4>
                {item.subtitle && <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.subtitle}</p>}
              </div>

              {/* Key Livestock Details */}
              {item.details && item.details.length > 0 && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  {item.details.map((d, i) => (
                    <div key={i}>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">{d.label}</span>
                      <span className="font-bold text-slate-800 truncate block">{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card Footer Action */}
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:bg-[#dc5c15]/5 transition-colors">
            <span className="flex items-center gap-1.5 truncate">
              {item.farmLocation && <span className="truncate flex items-center gap-1 text-[11px] font-semibold text-slate-500"><MapPin className="h-3 w-3 text-[#dc5c15]" />{item.farmLocation}</span>}
            </span>
            <span className="flex items-center gap-1 text-[#dc5c15] font-black group-hover:translate-x-1 transition-transform">
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
