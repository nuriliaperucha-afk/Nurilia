import React, { useState } from 'react';
import {
  Check,
  Database,
  Download,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  Trash2,
} from 'lucide-react';
import {
  AppSettings,
  AuditLogEntry,
  UmkmPartner,
  UserAccount,
} from '../../types';
import { formatRp } from '../../utils/format';

interface SettingsViewProps {
  settings: AppSettings;
  currentUser: UserAccount;
  umkmPartners: UmkmPartner[];
  auditLogs: AuditLogEntry[];
  onSaveSettings: (next: AppSettings) => void;
  onAddUmkm: (partner: Omit<UmkmPartner, 'id'>) => void;
  onToggleReadiness: (id: string, key: keyof UmkmPartner['readiness']) => void;
  onExportBackup: () => void;
  onResetDefaults: () => void;
}

export function SettingsView({
  settings,
  currentUser,
  umkmPartners,
  auditLogs,
  onSaveSettings,
  onAddUmkm,
  onToggleReadiness,
  onExportBackup,
  onResetDefaults,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'umkm' | 'master' | 'audit'>('umkm');
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  // Add raw material / village inputs
  const [newMaterial, setNewMaterial] = useState('');
  const [newVillage, setNewVillage] = useState('');

  // Add UMKM inputs
  const [bizName, setBizName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [village, setVillage] = useState(settings.masterVillages[0] ?? 'Desa Wonoayu');
  const [commodity, setCommodity] = useState('');
  const [phone, setPhone] = useState('');

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleAddUmkmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !ownerName.trim()) return;
    onAddUmkm({
      businessName: bizName.trim(),
      ownerName: ownerName.trim(),
      village,
      mainCommodity: commodity.trim() || 'Olahan Pangan Lokal',
      status: 'Baru Bergabung',
      phone: phone.trim() || '0812-0000-0000',
      instagramHandle: `@${bizName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      monthlyRevenueRp: 6500000,
      readiness: {
        nib: false,
        pirt: false,
        halal: false,
        modernPackaging: false,
        digitalCatalog: false,
      },
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    setBizName('');
    setOwnerName('');
    setCommodity('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap p-1 bg-white border border-[#E7DFD3] rounded-lg">
        {(
          [
            { id: 'umkm', label: `Profil UMKM Binaan (${umkmPartners.length})`, icon: Store },
            { id: 'master', label: 'Master Data, Kuota & Sistem', icon: Database },
            { id: 'audit', label: `Audit Log Aktivitas (${auditLogs.length})`, icon: ShieldCheck },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === tab.id ? 'bg-[#1E3A5F] text-white' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Manajemen Profil & Legalitas UMKM (FR-02) */}
      {activeTab === 'umkm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleAddUmkmSubmit}
            className="lg:col-span-4 bg-white border border-[#E7DFD3] rounded-xl p-5 space-y-3.5"
          >
            <h3 className="font-display text-base font-bold text-[#1C1917]">
              Tambah Profil UMKM Wonoayu
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Nama Usaha</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="Mis. Keripik Ubi Bu Lilik"
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Nama Pemilik</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Desa</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              >
                {settings.masterVillages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Komoditas Utama</label>
              <input
                type="text"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="Mis. Ubi Ungu & Singkong"
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan UMKM</span>
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3">
            {umkmPartners.map((u) => (
              <div
                key={u.id}
                className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-[#78716C]">
                    {u.village} · {u.status} · Omzet {formatRp(u.monthlyRevenueRp)}/bln
                  </div>
                  <div className="font-display text-base font-bold text-[#1C1917] mt-0.5">
                    {u.businessName} <span className="font-normal text-xs text-[#57534E]">({u.ownerName})</span>
                  </div>
                  <div className="text-xs text-[#78716C] mt-0.5">
                    {u.mainCommodity} · WA: {u.phone}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { k: 'nib', l: 'NIB' },
                      { k: 'pirt', l: 'P-IRT' },
                      { k: 'halal', l: 'Halal' },
                      { k: 'modernPackaging', l: 'Kemasan' },
                    ] as const
                  ).map((item) => {
                    const active = u.readiness[item.k];
                    return (
                      <button
                        key={item.k}
                        type="button"
                        onClick={() => onToggleReadiness(u.id, item.k)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border cursor-pointer ${
                          active
                            ? 'bg-emerald-50 border-emerald-300 text-[#047857]'
                            : 'bg-[#FAF7F2] border-[#E7DFD3] text-[#78716C]'
                        }`}
                      >
                        {active ? '✓ ' : ''}
                        {item.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Master Data Desa/Bahan & Kuota Sistem (FR-02, NFR-06, NFR-09) */}
      {activeTab === 'master' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleSaveSystem}
            className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-[#1C1917]">
              Konfigurasi Wilayah & Batas Kuota AI
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Wilayah Layanan</label>
              <input
                type="text"
                value={draft.regionName}
                onChange={(e) => setDraft({ ...draft, regionName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Koordinator Program</label>
              <input
                type="text"
                value={draft.coordinatorName}
                onChange={(e) => setDraft({ ...draft, coordinatorName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Kuota Generasi AI Harian per Akun (NFR-06)
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={draft.dailyAiQuotaLimit}
                onChange={(e) =>
                  setDraft({ ...draft, dailyAiQuotaLimit: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
              <p className="text-[11px] text-[#78716C] mt-1">
                Akun aktif ({currentUser.name}): terpakai {currentUser.dailyQuotaUsed}/
                {currentUser.dailyQuotaLimit} hari ini.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? 'Tersimpan' : 'Simpan Konfigurasi'}</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup JSON</span>
                </button>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </form>

          {/* Master Bahan Baku & Daftar Desa Wonoayu */}
          <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-5">
            <div>
              <h3 className="font-display text-sm font-bold text-[#1C1917] mb-2">
                Master Bahan Baku Lokal Wonoayu
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {draft.masterRawMaterials.map((mat) => (
                  <span
                    key={mat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-md"
                  >
                    <span>{mat}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...draft,
                          masterRawMaterials: draft.masterRawMaterials.filter((m) => m !== mat),
                        };
                        setDraft(updated);
                        onSaveSettings(updated);
                      }}
                      className="text-[#78716C] hover:text-rose-600 cursor-pointer"
                      aria-label={`Hapus ${mat}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Tambah master bahan lokal..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMaterial.trim()) return;
                    const updated = {
                      ...draft,
                      masterRawMaterials: [...draft.masterRawMaterials, newMaterial.trim()],
                    };
                    setDraft(updated);
                    onSaveSettings(updated);
                    setNewMaterial('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#047857] rounded-lg cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7DFD3]">
              <h3 className="font-display text-sm font-bold text-[#1C1917] mb-2">
                Master Desa di Kecamatan Wonoayu ({draft.masterVillages.length})
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {draft.masterVillages.map((vil) => (
                  <span
                    key={vil}
                    className="px-2.5 py-1 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-md text-[#57534E]"
                  >
                    {vil}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVillage}
                  onChange={(e) => setNewVillage(e.target.value)}
                  placeholder="Tambah desa baru..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newVillage.trim()) return;
                    const updated = {
                      ...draft,
                      masterVillages: [...draft.masterVillages, newVillage.trim()],
                    };
                    setDraft(updated);
                    onSaveSettings(updated);
                    setNewVillage('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A5F] rounded-lg cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Log Aktivitas (NFR-07) */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 overflow-x-auto">
          <h3 className="font-display text-base font-bold text-[#1C1917] mb-4">
            Audit Log Aktivitas Sistem & Generasi AI
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFD3] text-[#78716C]">
                <th className="py-2.5 pr-4 font-semibold">Waktu</th>
                <th className="py-2.5 px-3 font-semibold">Pengguna & Role</th>
                <th className="py-2.5 px-3 font-semibold">Aksi</th>
                <th className="py-2.5 pl-3 font-semibold">Detail Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DFD3]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-[#78716C] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#1C1917]">{log.userName}</div>
                    <div className="text-[#78716C]">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#1E3A5F]">
                    {log.action}
                  </td>
                  <td className="py-2.5 pl-3 text-[#57534E]">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
