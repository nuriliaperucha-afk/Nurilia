import React, { useState } from 'react';
import {
  Calculator,
  ClipboardCheck,
  Package,
  Share2,
  Store,
  X,
} from 'lucide-react';
import {
  ProductCatalogItem,
  ProductLifecycleStatus,
  UmkmPartner,
} from '../../types';
import { formatRp } from '../../utils/format';

interface CatalogViewProps {
  catalog: ProductCatalogItem[];
  umkmPartners: UmkmPartner[];
  onOpenPackaging: (product: ProductCatalogItem) => void;
  onOpenTrial: (product: ProductCatalogItem) => void;
  onUpdatePricing: (
    productId: string,
    hppBreakdown: ProductCatalogItem['hppBreakdown'],
    sellingPrice: number,
    wholesalePrice: number
  ) => void;
  onUpdateStatus: (productId: string, status: ProductLifecycleStatus) => void;
}

const LIFECYCLE_FILTERS: ('Semua' | ProductLifecycleStatus)[] = [
  'Semua',
  'Draf Ide',
  'Uji Coba Dapur',
  'Kemasan Siap',
  'Terkurasi',
  'Siap Bazar',
];

export function CatalogView({
  catalog,
  umkmPartners,
  onOpenPackaging,
  onOpenTrial,
  onUpdatePricing,
  onUpdateStatus,
}: CatalogViewProps) {
  const [viewMode, setViewMode] = useState<'my-catalog' | 'public-showcase'>(
    'my-catalog'
  );
  const [statusFilter, setStatusFilter] =
    useState<'Semua' | ProductLifecycleStatus>('Semua');
  const [calcProduct, setCalcProduct] = useState<ProductCatalogItem | null>(null);

  // HPP Calculator draft state
  const [ingCost, setIngCost] = useState(5000);
  const [pkgCost, setPkgCost] = useState(1800);
  const [opsCost, setOpsCost] = useState(1000);
  const [targetMargin, setTargetMargin] = useState(45);

  const openCalculator = (p: ProductCatalogItem) => {
    setCalcProduct(p);
    setIngCost(p.hppBreakdown?.ingredientsCost ?? Math.round(p.hpp * 0.65));
    setPkgCost(p.hppBreakdown?.packagingCost ?? Math.round(p.hpp * 0.2));
    setOpsCost(p.hppBreakdown?.operationalCost ?? Math.round(p.hpp * 0.15));
    setTargetMargin(p.marginPercent || 45);
  };

  const calcTotalHpp = ingCost + pkgCost + opsCost;
  const calcRetailPrice = Math.ceil(
    calcTotalHpp / Math.max(0.15, 1 - targetMargin / 100) / 500
  ) * 500;
  const calcWholesalePrice = Math.ceil((calcTotalHpp * 1.35) / 500) * 500;

  const filteredCatalog = catalog.filter((p) =>
    statusFilter === 'Semua' ? true : p.lifecycleStatus === statusFilter
  );

  const curatedShowcase = catalog.filter(
    (p) =>
      p.lifecycleStatus === 'Terkurasi' || p.lifecycleStatus === 'Siap Bazar'
  );

  return (
    <div className="space-y-6">
      {/* Mode Switcher: Katalog Saya vs Etalase Publik Wonoayu (FR-16) */}
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setViewMode('my-catalog')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'my-catalog'
                ? 'bg-white text-[#C2410C] shadow-sm'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Katalog Produk Saya ({catalog.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('public-showcase')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'public-showcase'
                ? 'bg-white text-[#047857] shadow-sm'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Etalase Publik Produk Unggulan ({curatedShowcase.length})
          </button>
        </div>

        {viewMode === 'my-catalog' && (
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg">
            {LIFECYCLE_FILTERS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#1E3A5F] shadow-sm font-semibold'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* HPP Calculator Drawer/Modal (FR-15) */}
      {calcProduct && (
        <div className="bg-white border-2 border-[#C2410C]/40 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#1C1917]">
                Kalkulator HPP & Harga Jual — {calcProduct.name}
              </h3>
              <p className="text-xs text-[#78716C]">
                Sesuaikan biaya produksi untuk melihat rekomendasi harga eceran dan harga grosir reseller.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCalcProduct(null)}
              className="p-2 rounded-lg hover:bg-[#FAF7F2]"
              aria-label="Tutup kalkulator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Biaya Bahan (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={200}
                value={ingCost}
                onChange={(e) => setIngCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Biaya Kemasan & Stiker (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={pkgCost}
                onChange={(e) => setPkgCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Gas, Minyak & Tenaga (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={opsCost}
                onChange={(e) => setOpsCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Target Margin ({targetMargin}%)
              </label>
              <input
                type="range"
                min={20}
                max={70}
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full accent-[#C2410C] mt-2"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E7DFD3]">
            <div className="flex flex-wrap gap-6 font-mono tabular-nums text-xs">
              <div>
                <span className="text-[#78716C] block">Total HPP</span>
                <strong className="text-base text-[#1C1917]">{formatRp(calcTotalHpp)}</strong>
              </div>
              <div>
                <span className="text-[#78716C] block">Saran Harga Eceran</span>
                <strong className="text-base text-[#C2410C]">{formatRp(calcRetailPrice)}</strong>
              </div>
              <div>
                <span className="text-[#78716C] block">Saran Harga Grosir</span>
                <strong className="text-base text-[#1E3A5F]">{formatRp(calcWholesalePrice)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdatePricing(
                  calcProduct.id,
                  {
                    ingredientsCost: ingCost,
                    packagingCost: pkgCost,
                    operationalCost: opsCost,
                  },
                  calcRetailPrice,
                  calcWholesalePrice
                );
                setCalcProduct(null);
              }}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
            >
              Terapkan ke Produk
            </button>
          </div>
        </div>
      )}

      {/* View Mode 1: My Catalog */}
      {viewMode === 'my-catalog' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCatalog.map((item) => {
            const owner = umkmPartners.find((u) => u.id === item.umkmId);
            return (
              <article
                key={item.id}
                className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#F4ECE1] shrink-0 border border-[#E7DFD3]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-7 h-7 text-[#C2410C]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[#78716C] truncate">
                      {item.brandName} · {owner?.village ?? 'Wonoayu'}
                    </div>
                    <h3 className="font-display text-base font-bold text-[#1C1917] leading-snug mt-0.5">
                      {item.name}
                    </h3>
                    <div className="text-xs text-[#57534E] mt-1">
                      {item.baseIngredient} · {item.flavorTrend} · {item.packagingFormat}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 font-mono tabular-nums text-xs">
                      <span>HPP: {formatRp(item.hpp)}</span>
                      <span className="font-bold text-[#C2410C]">
                        Jual: {formatRp(item.sellingPrice)}
                      </span>
                      <span className="text-[#047857] font-semibold">
                        Margin {item.marginPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7DFD3] flex flex-wrap items-center justify-between gap-2">
                  <select
                    aria-label={`Status siklus ${item.name}`}
                    value={item.lifecycleStatus}
                    onChange={(e) =>
                      onUpdateStatus(item.id, e.target.value as ProductLifecycleStatus)
                    }
                    className="px-2.5 py-1.5 text-xs font-semibold bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                  >
                    {LIFECYCLE_FILTERS.filter((f) => f !== 'Semua').map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openCalculator(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Hitung HPP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenTrial(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#047857] bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>Uji Dapur</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPackaging(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Kemasan</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Public Showcase "Produk Unggulan Wonoayu" (FR-16) */
        <div className="space-y-4">
          <div className="bg-[#1E3A5F] text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-orange-300">
                Etalase Digital Resmi Kecamatan Wonoayu
              </span>
              <h2 className="font-display text-xl font-bold mt-1">
                Produk Unggulan Terkurasi & Siap Bazar
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Produk kuliner lokal dengan standar kemasan modern dan siap dipesan langsung melalui WhatsApp UMKM.
              </p>
            </div>
            <Store className="w-8 h-8 text-orange-300 shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {curatedShowcase.map((item) => {
              const owner = umkmPartners.find((u) => u.id === item.umkmId);
              const waPhone = (owner?.phone || item.designSpec.contactWhatsapp).replace(
                /[^0-9]/g,
                ''
              );
              const normalizedWa = waPhone.startsWith('0')
                ? `62${waPhone.slice(1)}`
                : waPhone;
              const orderMsg = encodeURIComponent(
                `Halo ${item.brandName}, saya tertarik memesan produk unggulan "${item.name}" (${formatRp(
                  item.sellingPrice
                )}) dari Etalase KemasKini Wonoayu.`
              );

              return (
                <article
                  key={item.id}
                  className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-[#F4ECE1] overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-[#C2410C]" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#047857]">
                        {item.lifecycleStatus} · {owner?.village ?? 'Kec. Wonoayu'}
                      </div>
                      <h3 className="font-display text-base font-bold text-[#1C1917] mt-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#57534E] mt-1">
                        {item.brandName} · {item.packagingFormat} · {item.designSpec.netWeight}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#E7DFD3] flex items-center justify-between">
                      <span className="font-mono tabular-nums text-base font-bold text-[#1C1917]">
                        {formatRp(item.sellingPrice)}
                      </span>
                      <a
                        href={`https://wa.me/${normalizedWa}?text=${orderMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Pesan WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
