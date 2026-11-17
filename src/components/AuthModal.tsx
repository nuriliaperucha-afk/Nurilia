import React, { useState } from 'react';
import { Check, LogIn, UserPlus, X } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount;
  villages: string[];
  onSwitchUser: (user: UserAccount) => void;
  onRegisterUser: (payload: {
    name: string;
    phoneWhatsapp: string;
    email: string;
    role: UserRole;
    village: string;
    businessName?: string;
    mainCommodity?: string;
  }) => void;
}

const ROLES: UserRole[] = [
  'Pelaku UMKM',
  'Pendamping UMKM',
  'Koordinator / Manager',
  'Viewer / Pimpinan',
  'Admin Sistem',
];

export function AuthModal({
  open,
  onClose,
  users,
  currentUser,
  villages,
  onSwitchUser,
  onRegisterUser,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Pelaku UMKM');
  const [village, setVillage] = useState(villages[0] ?? 'Desa Wonoayu');
  const [businessName, setBusinessName] = useState('');
  const [mainCommodity, setMainCommodity] = useState('Singkong');

  if (!open) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneWhatsapp.trim()) return;
    onRegisterUser({
      name: name.trim(),
      phoneWhatsapp: phoneWhatsapp.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@umkm.wonoayu.id`,
      role,
      village,
      businessName: businessName.trim() || undefined,
      mainCommodity: mainCommodity.trim() || undefined,
    });
    setName('');
    setPhoneWhatsapp('');
    setEmail('');
    setBusinessName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-lg bg-white border border-[#E7DFD3] rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
          <div>
            <h2 id="auth-modal-title" className="font-display text-base font-bold">
              Akun & Hak Akses Pengguna KemasKini
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Pilih peran aktif atau daftarkan akun UMKM baru di Kecamatan Wonoayu.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-slate-200 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="inline-flex p-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg w-full">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                tab === 'login' ? 'bg-white text-[#C2410C] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk / Ganti Peran</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                tab === 'register' ? 'bg-white text-[#C2410C] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {tab === 'login' ? (
            <div className="space-y-2.5">
              {users.map((u) => {
                const active = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(u);
                      onClose();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      active
                        ? 'border-[#C2410C] bg-orange-50/50'
                        : 'border-[#E7DFD3] hover:border-[#C2410C]/50 bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#1C1917] truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-[#78716C] mt-0.5">
                        {u.role} · {u.village} · Kuota AI {u.dailyQuotaUsed}/{u.dailyQuotaLimit}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#C2410C] shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mis. Siti Munawaroh"
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                  />
                </div>
                <div>
                  <label htmlFor="reg-wa" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    id="reg-wa"
                    type="text"
                    required
                    value={phoneWhatsapp}
                    onChange={(e) => setPhoneWhatsapp(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                  />
                </div>
                <div>
                  <label htmlFor="reg-role" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Peran (Role)
                  </label>
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-village" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Desa di Wonoayu
                  </label>
                  <select
                    id="reg-village"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                  >
                    {villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {role === 'Pelaku UMKM' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label htmlFor="reg-biz" className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Nama Usaha UMKM
                    </label>
                    <input
                      id="reg-biz"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Mis. Kedai Tape Bu Siti"
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-comm" className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Bahan Baku Utama
                    </label>
                    <input
                      id="reg-comm"
                      type="text"
                      value={mainCommodity}
                      onChange={(e) => setMainCommodity(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Email (Opsional)
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@umkm.id"
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg transition-colors cursor-pointer"
              >
                Daftarkan & Masuk Sekarang
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
