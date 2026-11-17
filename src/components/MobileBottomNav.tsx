import React from 'react';
import {
  BookOpenCheck,
  ChefHat,
  LayoutDashboard,
  Megaphone,
  Package,
} from 'lucide-react';
import { NavSection } from '../types';

interface MobileBottomNavProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

const MOBILE_TABS: {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
  { id: 'recipes', label: 'Resep AI', icon: ChefHat },
  { id: 'packaging', label: 'Kemasan', icon: Package },
  { id: 'promo', label: 'Promosi', icon: Megaphone },
  { id: 'catalog', label: 'Katalog', icon: BookOpenCheck },
];

export function MobileBottomNav({
  activeSection,
  onSelectSection,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Cepat Ponsel"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E7DFD3] h-16 px-2 flex items-center justify-around no-print"
    >
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectSection(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
              active
                ? 'text-[#C2410C] font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-none whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
