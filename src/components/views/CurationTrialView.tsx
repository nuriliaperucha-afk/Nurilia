import React, { useState } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  ChefHat,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import {
  CurationRecord,
  KitchenTrial,
  ProductCatalogItem,
  UserAccount,
} from '../../types';
import { formatRp } from '../../utils/format';

interface CurationTrialViewProps {
  catalog: ProductCatalogItem[];
  trials: KitchenTrial[];
  curations: CurationRecord[];
  currentUser: UserAccount;
  preselectedProductId?: string;
  onAddTrial: (trial: Omit<KitchenTrial, 'id'>) => void;
  onAddCuration: (curation: Omit<CurationRecord, 'id'>) => void;
}

export function CurationTrialView({
  catalog,
  trials,
  curations,
  currentUser,
  preselectedProductId,
  onAddTrial,
  onAddCuration,
}: CurationTrialViewProps) {
  const [activeTab, setActiveTab] = useState<'trials' | 'curation'>('trials');

  // Kitchen Trial Form
  const [trialProdId, setTrialProdId] = useState(
    preselectedProductId || catalog[0]?.id || ''
  );
  const [trialDate, setTrialDate] = useState(new Date().toISOString().slice(0, 10));
  const [finalPrice, setFinalPrice] = useState(16000);
  const [tasteAdjustment, setTasteAdjustment] = useState('');
  const [kitchenStatus, setKitchenStatus] =
    useState<KitchenTrial['kitchenStatus']>('Siap Diajukan Kurasi');
  const [notes, setNotes] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');

  // Curation Form
  const [curTrialId, setCurTrialId] = useState(trials[0]?.id ?? '');
  const [packagingScore, setPackagingScore] = useState(88);
  const [innovationScore, setInnovationScore] = useState(90);
  const [decision, setDecision] =
    useState<CurationRecord['decision']>('Terkurasi');
  const [feedbackNote, setFeedbackNote] = useState('');

  const canCurate =
    currentUser.role === 'Pendamping UMKM' ||
    currentUser.role === 'Koordinator / Manager' ||
    currentUser.role === 'Admin Sistem';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setUploadedPhotoUrl(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitTrial = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = catalog.find((p) => p.id === trialProdId) ?? catalog[0];
    if (!prod) return;
    onAddTrial({
      productId: prod.id,
      umkmId: prod.umkmId,
      productName: prod.name,
      brandName: prod.brandName,
      trialDate,
      actualPhotoUrl: uploadedPhotoUrl || prod.imageUrl,
      finalSellingPrice: Number(finalPrice) || prod.sellingPrice,
      tasteAdjustment: tasteAdjustment.trim() || 'Sesuai resep standar AI.',
      kitchenStatus,
      notes: notes.trim(),
    });
    setTasteAdjustment('');
    setNotes('');
    setUploadedPhotoUrl('');
  };

  const handleSubmitCuration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCurate) return;
    const trial = trials.find((t) => t.id === curTrialId) ?? trials[0];
    if (!trial) return;
    onAddCuration({
      trialId: trial.id,
      productId: trial.productId,
      productName: trial.productName,
      brandName: trial.brandName,
      curatorName: currentUser.name,
      packagingScore,
      innovationScore,
      decision,
      feedbackNote:
        feedbackNote.trim() || 'Memenuhi standar kurasi produk unggulan Kecamatan Wonoayu.',
      curatedAt: new Date().toISOString().slice(0, 10),
    });
    setFeedbackNote('');
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs */}
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#1C1917]">
            Log Uji Coba Dapur & Kurasi Produk Kecamatan
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Catat realisasi praktik resep, unggah foto produk nyata, dan lakukan kurasi kelayakan bazar.
          </p>
        </div>

        <div className="inline-flex p-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'trials'
                ? 'bg-white text-[#C2410C] shadow-sm'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Log Uji Coba Dapur ({trials.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curation')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'curation'
                ? 'bg-white text-[#047857] shadow-sm'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Kurasi & Feedback ({curations.length})
          </button>
        </div>
      </div>

      {activeTab === 'trials' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Log Uji Coba Dapur */}
          <form
            onSubmit={handleSubmitTrial}
            className="lg:col-span-5 bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#1C1917]">
                Catat Praktik Dapur Baru
              </h3>
              <ChefHat className="w-4 h-4 text-[#C2410C]" />
            </div>

            <div>
              <label htmlFor="tr-prod" className="block text-xs font-semibold text-[#1C1917] mb-1">
                Pilih Produk dari Katalog
              </label>
              <select
                id="tr-prod"
                value={trialProdId}
                onChange={(e) => {
                  setTrialProdId(e.target.value);
                  const found = catalog.find((p) => p.id === e.target.value);
                  if (found) setFinalPrice(found.sellingPrice);
                }}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              >
                {catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.brandName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tr-date" className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Tanggal Praktik
                </label>
                <input
                  id="tr-date"
                  type="date"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="tr-price" className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Harga Jual Final (Rp)
                </label>
                <input
                  id="tr-price"
                  type="number"
                  min={1000}
                  step={500}
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tr-taste" className="block text-xs font-semibold text-[#1C1917] mb-1">
                Catatan Penyesuaian Rasa / Takaran
              </label>
              <input
                id="tr-taste"
                type="text"
                value={tasteAdjustment}
                onChange={(e) => setTasteAdjustment(e.target.value)}
                placeholder="Mis. Tingkat pedas dikurangi 10% untuk pasar keluarga"
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="tr-status" className="block text-xs font-semibold text-[#1C1917] mb-1">
                Status Hasil Uji Coba
              </label>
              <select
                id="tr-status"
                value={kitchenStatus}
                onChange={(e) =>
                  setKitchenStatus(e.target.value as KitchenTrial['kitchenStatus'])
                }
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              >
                <option value="Siap Diajukan Kurasi">Siap Diajukan Kurasi</option>
                <option value="Berhasil">Berhasil (Perlu Finalisasi Kemasan)</option>
                <option value="Perlu Penyesuaian">Perlu Penyesuaian Resep</option>
              </select>
            </div>

            <div>
              <label htmlFor="tr-photo" className="block text-xs font-semibold text-[#1C1917] mb-1">
                Unggah Foto Produk Nyata
              </label>
              <label
                htmlFor="tr-photo"
                className="flex items-center justify-center gap-2 px-3 py-3 border border-dashed border-[#C2410C]/50 bg-[#FAF7F2] rounded-lg text-xs font-medium text-[#C2410C] cursor-pointer hover:bg-orange-50/50"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {uploadedPhotoUrl ? 'Foto siap disimpan (Klik untuk ganti)' : 'Pilih Foto dari Perangkat'}
                </span>
                <input
                  id="tr-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label htmlFor="tr-notes" className="block text-xs font-semibold text-[#1C1917] mb-1">
                Catatan Tambahan
              </label>
              <textarea
                id="tr-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mis. Respon tester di desa sangat positif"
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Log Uji Coba</span>
            </button>
          </form>

          {/* List of Trials */}
          <div className="lg:col-span-7 space-y-4">
            {trials.map((t) => (
              <article
                key={t.id}
                className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-[#F4ECE1] shrink-0 border border-[#E7DFD3]">
                  {t.actualPhotoUrl ? (
                    <img
                      src={t.actualPhotoUrl}
                      alt={t.productName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#78716C] text-xs">
                      Belum ada foto
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-[#78716C]">{t.trialDate}</span>
                    <span className="font-semibold text-[#047857]">{t.kitchenStatus}</span>
                  </div>
                  <h4 className="font-display text-base font-bold text-[#1C1917]">
                    {t.productName}
                  </h4>
                  <div className="text-xs text-[#57534E]">
                    {t.brandName} · Harga Final:{' '}
                    <strong className="font-mono text-[#1C1917]">
                      {formatRp(t.finalSellingPrice)}
                    </strong>
                  </div>
                  <p className="text-xs text-[#1C1917] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E7DFD3]">
                    <strong>Penyesuaian Rasa:</strong> {t.tasteAdjustment}
                  </p>
                  {t.notes && <p className="text-xs text-[#78716C]">{t.notes}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Curation Form (Role-Gated per PRD Section 2.1) */}
          <div className="lg:col-span-5 bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#1C1917]">
                Form Penilaian Kurasi Pembina
              </h3>
              <Award className="w-4 h-4 text-[#047857]" />
            </div>

            {!canCurate ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Akses Terbatas ({currentUser.role})</span>
                </div>
                <p>
                  Persetujuan kurasi hanya dapat dilakukan oleh <strong>Pendamping UMKM</strong>, <strong>Koordinator / Manager</strong>, atau <strong>Admin Sistem</strong>. Silakan ganti peran melalui tombol "Ganti Akun" di sidebar jika ingin menguji fitur kurasi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCuration} className="space-y-4">
                <div>
                  <label htmlFor="cur-trial" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Pilih Produk Hasil Uji Dapur
                  </label>
                  <select
                    id="cur-trial"
                    value={curTrialId}
                    onChange={(e) => setCurTrialId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                  >
                    {trials.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.productName} — {t.brandName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cur-pkg" className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Skor Kemasan (0–100)
                    </label>
                    <input
                      id="cur-pkg"
                      type="number"
                      min={0}
                      max={100}
                      value={packagingScore}
                      onChange={(e) => setPackagingScore(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="cur-inn" className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Skor Rasa/Inovasi (0–100)
                    </label>
                    <input
                      id="cur-inn"
                      type="number"
                      min={0}
                      max={100}
                      value={innovationScore}
                      onChange={(e) => setInnovationScore(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cur-dec" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Keputusan Kurasi
                  </label>
                  <select
                    id="cur-dec"
                    value={decision}
                    onChange={(e) =>
                      setDecision(e.target.value as CurationRecord['decision'])
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                  >
                    <option value="Terkurasi">Terkurasi (Masuk Etalase Unggulan)</option>
                    <option value="Siap Bazar">Siap Bazar Kecamatan Wonoayu</option>
                    <option value="Perlu Revisi">Perlu Revisi Kemasan / Rasa</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cur-note" className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Catatan Evaluasi Pendamping
                  </label>
                  <textarea
                    id="cur-note"
                    rows={3}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Berikan masukan label, rasa, atau kelayakan harga..."
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Keputusan Kurasi</span>
                </button>
              </form>
            )}
          </div>

          {/* Curation History */}
          <div className="lg:col-span-7 space-y-4">
            {curations.map((c) => (
              <article
                key={c.id}
                className="bg-white border border-[#E7DFD3] rounded-xl p-5 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono text-[#78716C]">
                    {c.curatedAt} · Kurator: {c.curatorName}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      c.decision === 'Perlu Revisi'
                        ? 'text-rose-700'
                        : 'text-[#047857]'
                    }`}
                  >
                    {c.decision}
                  </span>
                </div>

                <h4 className="font-display text-base font-bold text-[#1C1917]">
                  {c.productName} <span className="font-normal text-[#78716C]">({c.brandName})</span>
                </h4>

                <div className="flex gap-6 font-mono tabular-nums text-xs">
                  <span>
                    Skor Kemasan: <strong className="text-[#1E3A5F]">{c.packagingScore}/100</strong>
                  </span>
                  <span>
                    Skor Inovasi: <strong className="text-[#C2410C]">{c.innovationScore}/100</strong>
                  </span>
                </div>

                <p className="text-xs text-[#57534E] bg-[#FAF7F2] p-3 rounded-lg border border-[#E7DFD3]">
                  {c.feedbackNote}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
