import React from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { NavSection } from '../types';

interface TopBarProps {
  activeSection: NavSection;
  onOpenMobileMenu: () => void;
  onQuickCreate: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const SECTION_LABELS: Record<NavSection, string> = {
  dashboard: 'Dashboard Monitoring Kecamatan',
  recipes: 'Kreasi Resep AI',
  packaging: 'Desain Kemasan & Logo AI',
  promo: 'Konten Promosi & Skrip Video',
  catalog: 'Katalog Produk Saya & Etalase',
  curation: 'Kurasi & Log Uji Coba Dapur',
  analytics: 'Analytics, Tren & Prioritas',
  reports: 'Laporan & Management Brief',
  settings: 'Pengaturan, Role & Audit Log',
};

export function TopBar({
  activeSection,
  onOpenMobileMenu,
  onQuickCreate,
  searchQuery,
  onSearchChange,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E7DFD3] no-print">
      <div className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Buka menu navigasi"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-[#1C1917] hover:bg-[#F4ECE1]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="hidden sm:inline font-semibold text-[#C2410C] whitespace-nowrap">
              KemasKini
            </span>
            <span className="hidden sm:inline text-[#C39B6B]" aria-hidden="true">
              /
            </span>
            <h1 className="font-display text-base sm:text-lg font-bold text-[#1C1917] truncate">
              {SECTION_LABELS[activeSection]}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-sm">
          <label htmlFor="global-search" className="sr-only">
            Cari produk atau UMKM Wonoayu
          </label>
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari produk, bahan lokal, atau desa..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#C2410C] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onQuickCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Buat Resep AI</span>
          </button>
        </div>
      </div>
    </header>
  );
}
