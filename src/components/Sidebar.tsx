import React from 'react';
import {
  BarChart3,
  BookOpenCheck,
  ChefHat,
  ClipboardCheck,
  FileSpreadsheet,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import { NavSection, UserAccount } from '../types';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  catalogCount: number;
  trialCount: number;
  currentUser: UserAccount;
  onOpenAuthModal: () => void;
}

interface NavGroup {
  label: string;
  items: {
    id: NavSection;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[];
}

export function Sidebar({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
  catalogCount,
  trialCount,
  currentUser,
  onOpenAuthModal,
}: SidebarProps) {
  const navGroups: NavGroup[] = [
    {
      label: 'Utama',
      items: [{ id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Studio AI KemasKini',
      items: [
        { id: 'recipes', title: 'Kreasi Resep AI', icon: ChefHat },
        { id: 'packaging', title: 'Desain Kemasan AI', icon: Package },
        { id: 'promo', title: 'Konten Promosi', icon: Megaphone },
      ],
    },
    {
      label: 'Produk & Pendampingan',
      items: [
        { id: 'catalog', title: 'Katalog Produk Saya', icon: BookOpenCheck, count: catalogCount },
        { id: 'curation', title: 'Kurasi & Trial', icon: ClipboardCheck, count: trialCount },
      ],
    },
    {
      label: 'Kecamatan & Sistem',
      items: [
        { id: 'analytics', title: 'Analytics & Tren', icon: BarChart3 },
        { id: 'reports', title: 'Laporan', icon: FileSpreadsheet },
        { id: 'settings', title: 'Pengaturan', icon: Settings },
      ],
    },
  ];

  const handleClick = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#1E3A5F] text-slate-100 select-none">
      {/* Brand Lockup */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <span className="font-display text-xl font-extrabold tracking-tight text-white block leading-none">
            KemasKini
          </span>
          <span className="text-xs text-orange-200/90 mt-1.5 block">
            UMKM Kuliner Wonoayu
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Tutup menu navigasi"
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-200 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Menu Utama">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-300/75 uppercase">
              {group.label}
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#C2410C] text-white font-semibold shadow-sm'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-orange-100' : 'text-slate-300/80'
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </span>
                      {typeof item.count === 'number' && (
                        <span
                          className={`font-mono tabular-nums text-xs ${
                            isActive ? 'text-orange-100' : 'text-slate-300/80'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Active Account & Daily AI Quota Box */}
      <div className="px-4 py-4 border-t border-white/10 bg-[#152B47] space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-emerald-300 font-medium truncate">
              {currentUser.role} · {currentUser.village}
            </div>
          </div>
          <UserCheck className="w-4 h-4 text-orange-300 shrink-0 mt-0.5" />
        </div>

        <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono tabular-nums">
          <span>Kuota AI Harian</span>
          <span>
            {currentUser.dailyQuotaUsed}/{currentUser.dailyQuotaLimit}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenAuthModal();
          }}
          className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
        >
          Ganti Akun / Daftar UMKM
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-[264px] lg:shrink-0 border-r border-[#1E3A5F]/15 no-print">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[275px] max-w-[84vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
