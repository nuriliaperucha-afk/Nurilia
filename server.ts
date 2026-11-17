import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, '.data');
const DB_FILE = path.join(DATA_DIR, 'kemaskini-state.json');

app.use(express.json({ limit: '10mb' }));

// Simple server-side daily quota counter per userId (NFR-06 Cost Control)
const quotaUsageByDate: Record<string, Record<string, number>> = {};

function checkAndIncrementQuota(userId: string, limit = 30): { used: number; limit: number } {
  const today = new Date().toISOString().slice(0, 10);
  if (!quotaUsageByDate[today]) {
    quotaUsageByDate[today] = {};
  }
  const current = quotaUsageByDate[today][userId] ?? 0;
  if (current >= limit) {
    throw new Error(
      `Kuota generasi AI harian (${limit} permintaan/hari) telah tercapai untuk akun ini.`
    );
  }
  quotaUsageByDate[today][userId] = current + 1;
  return { used: current + 1, limit };
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY belum tersedia. Silakan atur melalui panel Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleAiError(res: express.Response, err: unknown, fallbackContext: string) {
  const message = err instanceof Error ? err.message : String(err);
  const status = message.includes('Kuota')
    ? 429
    : message.includes('API_KEY') || message.includes('PERMISSION_DENIED')
      ? 401
      : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
        ? 429
        : 500;
  res.status(status).json({
    error: `${fallbackContext}: ${message}`,
  });
}

// Persistent local JSON store
app.get('/api/state', (_req, res) => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return res.json({ exists: false });
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return res.json({ exists: true, data: JSON.parse(raw) });
  } catch {
    return res.status(500).json({ error: 'Gagal membaca data tersimpan.' });
  }
});

app.post('/api/state', (req, res) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Gagal menyimpan data ke server.' });
  }
});

// 1. AI Recipe & Flavor Generator (PRD FR-03: 3 fusion food menus + HPP + kitchen tools + serving + promo)
app.post('/api/ai/recipe', async (req, res) => {
  try {
    const {
      userId = 'default-user',
      quotaLimit = 30,
      ingredients = [],
      targetConsumer = 'Pelajar & Gen Z',
      flavorTrend = 'Mentai Creamy',
      kitchenTools = ['Wajan & Kompor Rumahan'],
      budgetPerPortion = 10000,
      brandName = 'UMKM Kuliner Wonoayu',
    } = req.body ?? {};

    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();
    const ingredientList = Array.isArray(ingredients)
      ? ingredients.join(', ')
      : String(ingredients);
    const toolsList = Array.isArray(kitchenTools)
      ? kitchenTools.join(', ')
      : String(kitchenTools);

    const prompt = `Anda adalah konsultan inovasi kuliner dan pengembangan produk UMKM di Kecamatan Wonoayu, Kabupaten Sidoarjo, Jawa Timur.
Buatlah TEPAT 3 rekomendasi menu FUSION FOOD MODERN yang kreatif, realistis diproduksi dengan peralatan dapur rumahan, dan menggunakan bahan baku lokal berikut:
- Bahan utama tradisional: ${ingredientList || 'Singkong, Ketan Putih'}
- Target konsumen: ${targetConsumer}
- Preferensi tren rasa modern: ${flavorTrend}
- Alat dapur yang dimiliki pelaku UMKM: ${toolsList}
- Target modal HPP maksimal per porsi: Rp${budgetPerPortion}
- Nama brand UMKM: ${brandName}

Untuk masing-masing dari 3 menu:
1. Pastikan takaran gramasi praktis dan langkah pembuatan mudah diikuti pemula.
2. Sertakan saran penyajian menarik (servingSuggestion).
3. Rinci estimasi HPP (ingredientsCost, packagingCost, operationalCost) sehingga total = hppEstimate, serta suggestedPrice (eceran) dan wholesalePrice (grosir/reseller).
4. Pilih packagingSuggestion tepat salah satu dari: "Standing Pouch Kraft", "Lunch Box Kraft", "Cup Bowl Kraft", "Jar Kaca Label".
5. Sertakan copywriting lengkap (instagramCaption, tiktokHook, tiktokScript30s dengan pembagian 0-3s/4-20s/21-30s, whatsappBroadcast, dan hashtags).`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              menuName: { type: Type.STRING },
              conceptSummary: { type: Type.STRING },
              servingSuggestion: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    amount: { type: Type.STRING },
                  },
                  required: ['item', 'amount'],
                },
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              hppBreakdown: {
                type: Type.OBJECT,
                properties: {
                  ingredientsCost: { type: Type.INTEGER },
                  packagingCost: { type: Type.INTEGER },
                  operationalCost: { type: Type.INTEGER },
                },
                required: ['ingredientsCost', 'packagingCost', 'operationalCost'],
              },
              hppEstimate: { type: Type.INTEGER },
              suggestedPrice: { type: Type.INTEGER },
              wholesalePrice: { type: Type.INTEGER },
              marginPercent: { type: Type.INTEGER },
              shelfLife: { type: Type.STRING },
              packagingSuggestion: { type: Type.STRING },
              copywriting: {
                type: Type.OBJECT,
                properties: {
                  instagramCaption: { type: Type.STRING },
                  tiktokHook: { type: Type.STRING },
                  tiktokScript30s: { type: Type.STRING },
                  whatsappBroadcast: { type: Type.STRING },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'instagramCaption',
                  'tiktokHook',
                  'tiktokScript30s',
                  'whatsappBroadcast',
                  'hashtags',
                ],
              },
            },
            required: [
              'menuName',
              'conceptSummary',
              'servingSuggestion',
              'ingredients',
              'steps',
              'hppBreakdown',
              'hppEstimate',
              'suggestedPrice',
              'wholesalePrice',
              'marginPercent',
              'shelfLife',
              'packagingSuggestion',
              'copywriting',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '[]').trim());
    res.json({ recipes: parsed, quota });
  } catch (err) {
    handleAiError(res, err, 'Gagal membuat rekomendasi resep AI');
  }
});

// 2. AI Visual & Packaging Designer (PRD FR-04)
app.post('/api/ai/packaging', async (req, res) => {
  try {
    const {
      userId = 'default-user',
      quotaLimit = 30,
      productName,
      brandName,
      flavorVariant,
      style = 'Kraft Natural',
      format = 'Standing Pouch Kraft',
      netWeight = '150 g',
    } = req.body ?? {};

    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();
    const prompt = `Anda adalah desainer kemasan dan branding profesional untuk produk UMKM kuliner Kecamatan Wonoayu, Sidoarjo.
Buat konsep identitas visual kemasan untuk produk:
- Nama Produk: ${productName}
- Nama Brand: ${brandName}
- Varian Rasa: ${flavorVariant}
- Gaya Visual: ${style}
- Bentuk Kemasan: ${format}
- Berat Bersih: ${netWeight}

Hasilkan:
1. tagline singkat (maks 7 kata, menarik untuk konsumen Indonesia)
2. calloutBadge (maks 3 kata, misal "Produksi Wonoayu", "100% Bahan Lokal", "Pedas Nampol")
3. ingredientsSummary (daftar komposisi singkat & rapi dalam Bahasa Indonesia)
4. primaryColor, secondaryColor, accentColor dalam format Hex (#RRGGBB) dengan kontras tinggi bernuansa kuliner (terakota/oranye hangat, hijau zamrud, krem kraft, biru tua).
5. emblemPaths: array berisi 3 hingga 5 string SVG path data ("d" attribute valid untuk viewBox 0 0 120 120) yang membentuk ikon kuliner/botani minimalis yang menggambarkan produk tersebut.
6. emblemCaption: teks pendek 2-3 kata di bawah ikon emblem.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tagline: { type: Type.STRING },
            calloutBadge: { type: Type.STRING },
            ingredientsSummary: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            emblemPaths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            emblemCaption: { type: Type.STRING },
          },
          required: [
            'tagline',
            'calloutBadge',
            'ingredientsSummary',
            'primaryColor',
            'secondaryColor',
            'accentColor',
            'emblemPaths',
            'emblemCaption',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ design: parsed, quota });
  } catch (err) {
    handleAiError(res, err, 'Gagal merancang konsep desain kemasan AI');
  }
});

// 3. AI Promotional Copywriting & 30s Video Script Generator (PRD FR-05)
app.post('/api/ai/copywriting', async (req, res) => {
  try {
    const {
      userId = 'default-user',
      quotaLimit = 30,
      productName,
      brandName,
      flavorVariant,
      targetConsumer,
      price,
      tone = 'Ramah, Hangat & Menggugah Selera',
    } = req.body ?? {};

    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();
    const prompt = `Buat paket teks copywriting promosi pemasaran digital untuk produk UMKM kuliner Kecamatan Wonoayu berikut:
- Produk: ${productName} (${flavorVariant})
- Brand: ${brandName}
- Target Konsumen: ${targetConsumer}
- Harga Jual: Rp${price}
- Gaya Bahasa: ${tone}

Berikan:
1. instagramCaption (siap salin untuk IG/TikTok)
2. tiktokHook (kalimat hook 3 detik pertama)
3. tiktokScript30s (skrip video pendek 30 detik lengkap dibagi: [0-3s Hook], [4-20s Isi], [21-30s CTA])
4. whatsappBroadcast (pesan penawaran WhatsApp hangat dengan ajakan order)
5. hashtags (5 hashtag lokal relevan).`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instagramCaption: { type: Type.STRING },
            tiktokHook: { type: Type.STRING },
            tiktokScript30s: { type: Type.STRING },
            whatsappBroadcast: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'instagramCaption',
            'tiktokHook',
            'tiktokScript30s',
            'whatsappBroadcast',
            'hashtags',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ copywriting: parsed, quota });
  } catch (err) {
    handleAiError(res, err, 'Gagal membuat copywriting promosi AI');
  }
});

// 4. AI Local Market Trend Analysis
app.post('/api/ai/market-analysis', async (req, res) => {
  try {
    const {
      userId = 'default-user',
      quotaLimit = 30,
      keyword = 'Singkong Keju Lumer',
      targetArea = 'Wonoayu & Sidoarjo Barat',
    } = req.body ?? {};

    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();
    const prompt = `Analisis potensi pasar lokal di ${targetArea} untuk produk kuliner UMKM: "${keyword}".
Berikan analisis objektif untuk pelaku usaha pemula mencakup level permintaan, indeks permintaan (0-100), rentang harga jual optimal di pasar lokal Jawa Timur, jam penjualan paling ramai, profil target pembeli, celah kompetitor saat ini, 3 ide diferensiasi produk/kemasan, dan strategi kanal penjualan lokal terbaik.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            demandLevel: { type: Type.STRING },
            demandIndex: { type: Type.INTEGER },
            recommendedPriceRange: { type: Type.STRING },
            peakHours: { type: Type.STRING },
            targetAudienceProfile: { type: Type.STRING },
            competitorGap: { type: Type.STRING },
            differentiationIdeas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            localChannelStrategy: { type: Type.STRING },
          },
          required: [
            'keyword',
            'demandLevel',
            'demandIndex',
            'recommendedPriceRange',
            'peakHours',
            'targetAudienceProfile',
            'competitorGap',
            'differentiationIdeas',
            'localChannelStrategy',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ analysis: parsed, quota });
  } catch (err) {
    handleAiError(res, err, 'Gagal menganalisis tren pasar lokal');
  }
});

// 5. AI Automated Insights & Prioritization Logic (PRD Section 8.3)
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { userId = 'default-user', quotaLimit = 30, catalogSummary, umkmSummary } = req.body ?? {};
    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();

    const prompt = `Anda adalah sistem penasihat bisnis program "KemasKini — UMKM Kuliner Wonoayu Naik Kelas".
Berdasarkan data operasional terkini:
- Katalog Produk: ${JSON.stringify(catalogSummary ?? [])}
- Data UMKM Binaan: ${JSON.stringify(umkmSummary ?? [])}

Hasilkan 4 temuan otomatis dan rekomendasi prioritas menggunakan logika PRD:
1. "Komoditas Dominan" (bahan paling banyak diolah untuk pelatihan tematik)
2. "Kesiapan Kemasan" (UMKM dengan kemasan masih polos sebagai target cetak stiker/pouch)
3. "Kesenjangan Legalitas" (UMKM yang belum lengkap NIB/PIRT/Halal)
4. "Desa Partisipasi Rendah" (rekomendasi lokasi sosialisasi desa di Wonoayu).`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              title: { type: Type.STRING },
              finding: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              expectedImpact: { type: Type.STRING },
              priority: { type: Type.STRING },
            },
            required: ['category', 'title', 'finding', 'recommendation', 'expectedImpact', 'priority'],
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '[]').trim());
    res.json({ insights: parsed, quota });
  } catch (err) {
    handleAiError(res, err, 'Gagal memperbarui insight prioritisasi');
  }
});

// 6. AI Management Brief Generator (PRD Lampiran D - 9 Bagian Lengkap)
app.post('/api/ai/brief', async (req, res) => {
  try {
    const {
      userId = 'default-user',
      quotaLimit = 30,
      statsSummary,
      period = 'November 2026',
    } = req.body ?? {};
    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();

    const prompt = `Susun Management Brief resmi untuk pimpinan Kecamatan Wonoayu (Camat / Kasi Ekbang / Dinas Koperasi Sidoarjo) periode ${period} berdasarkan statistik riil berikut:
${JSON.stringify(statsSummary ?? {})}

Buat tepat sesuai struktur 9 bagian laporan formal dalam Bahasa Indonesia yang ringkas, faktual, dan siap dibaca pimpinan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            kpiHighlights: { type: Type.STRING },
            regionalSpread: { type: Type.STRING },
            commodityAndFlavorTrends: { type: Type.STRING },
            packagingAdoption: { type: Type.STRING },
            legalityReadiness: { type: Type.STRING },
            keyInsights: { type: Type.STRING },
            actionRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            closingNote: { type: Type.STRING },
          },
          required: [
            'executiveSummary',
            'kpiHighlights',
            'regionalSpread',
            'commodityAndFlavorTrends',
            'packagingAdoption',
            'legalityReadiness',
            'keyInsights',
            'actionRecommendations',
            'closingNote',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({
      brief: {
        ...parsed,
        period,
        generatedAt: new Date().toISOString().slice(0, 10),
      },
      quota,
    });
  } catch (err) {
    handleAiError(res, err, 'Gagal menyusun Management Brief otomatis');
  }
});

// 7. Interactive Business & Licensing AI Assistant (PRD Section 10.3 Fase 3)
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { userId = 'default-user', quotaLimit = 30, question, context } = req.body ?? {};
    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
    }
    const quota = checkAndIncrementQuota(String(userId), Number(quotaLimit) || 30);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Konteks UMKM Wonoayu saat ini: ${JSON.stringify(context ?? {})}\n\nPertanyaan pelaku UMKM / pendamping: ${question}`,
      config: {
        systemInstruction:
          'Anda adalah Asisten Pendamping Bisnis UMKM Kecamatan Wonoayu (KemasKini). Jawab dengan bahasa Indonesia yang hangat, membumi, praktis, dan terstruktur langkah demi langkah terkait inovasi menu, desain kemasan, kalkulasi HPP, pemasaran digital, maupun pengurusan izin NIB (OSS), P-IRT, dan sertifikasi Halal bagi usaha mikro.',
      },
    });

    res.json({ answer: response.text ?? '', quota });
  } catch (err) {
    handleAiError(res, err, 'Gagal menjawab konsultasi AI');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KemasKini server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
