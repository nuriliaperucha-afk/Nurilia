import React from 'react';
import { PackagingAssetTab, PackagingDesignSpec } from '../types';

interface PackagingPreviewCanvasProps {
  spec: PackagingDesignSpec;
  activeTab: PackagingAssetTab;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

export function PackagingPreviewCanvas({
  spec,
  activeTab,
  svgRef,
}: PackagingPreviewCanvasProps) {
  const {
    productName,
    brandName,
    flavorVariant,
    tagline,
    netWeight,
    pirtNumber,
    contactWhatsapp,
    ingredientsSummary,
    calloutBadge,
    format,
    primaryColor,
    secondaryColor,
    accentColor,
    kraftTexture,
    showCutLine,
    emblemPaths,
    emblemCaption,
  } = spec;

  const kraftBase = kraftTexture ? '#D4B387' : '#F6F3EC';
  const kraftShade = kraftTexture ? '#B99262' : '#E5DEC9';
  const kraftDark = kraftTexture ? '#8D6239' : '#B8AC96';

  const safeEmblemPaths =
    emblemPaths && emblemPaths.length > 0
      ? emblemPaths
      : [
          'M60 22 C44 34 40 58 52 76 C58 84 62 84 68 76 C80 58 76 34 60 22 Z',
          'M60 32 L60 76',
          'M46 52 Q60 60 74 52',
        ];

  if (activeTab === 'logo') {
    return (
      <svg
        ref={svgRef}
        viewBox="0 0 600 460"
        className="w-full h-auto rounded-xl border border-[#E5E0D8] bg-white"
        role="img"
        aria-label={`Logo Brand ${brandName}`}
      >
        <defs>
          <pattern id="kraftDotsLogo" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="#593B1F" fillOpacity="0.09" />
            <circle cx="8" cy="9" r="0.7" fill="#FFFFFF" fillOpacity="0.2" />
          </pattern>
        </defs>

        {/* Split showcase background: Clean White & Natural Kraft */}
        <rect x="0" y="0" width="300" height="460" fill="#FAF8F4" />
        <rect x="300" y="0" width="300" height="460" fill="#D4B387" />
        <rect x="300" y="0" width="300" height="460" fill="url(#kraftDotsLogo)" />

        {/* Left Logo Lockup (On Light Paper) */}
        <g transform="translate(150, 170)">
          <circle cx="0" cy="0" r="78" fill={primaryColor} />
          <circle cx="0" cy="0" r="69" fill="none" stroke={secondaryColor} strokeWidth="2" strokeDasharray="4 3" />
          <g transform="translate(-48, -50) scale(0.8)">
            {safeEmblemPaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx === 0 ? accentColor : 'none'}
                fillOpacity={idx === 0 ? 0.25 : 0}
                stroke={secondaryColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
          <text
            x="0"
            y="108"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="22"
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {truncateText(brandName.toUpperCase(), 20)}
          </text>
          <text
            x="0"
            y="132"
            textAnchor="middle"
            fill="#593B1F"
            fontSize="11"
            fontWeight="600"
            fontFamily="DM Sans, sans-serif"
          >
            {truncateText(tagline, 34)}
          </text>
          <text
            x="0"
            y="156"
            textAnchor="middle"
            fill="#647068"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            VERSI KERTAS PUTIH
          </text>
        </g>

        {/* Right Logo Lockup (On Kraft Stamp) */}
        <g transform="translate(450, 170)">
          <rect
            x="-84"
            y="-84"
            width="168"
            height="168"
            rx="28"
            fill="#FAF6F0"
            stroke={primaryColor}
            strokeWidth="3"
          />
          <rect
            x="-76"
            y="-76"
            width="152"
            height="152"
            rx="22"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
          />
          <g transform="translate(-48, -50) scale(0.8)">
            {safeEmblemPaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx === 0 ? primaryColor : 'none'}
                fillOpacity={idx === 0 ? 0.16 : 0}
                stroke={primaryColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
          <text
            x="0"
            y="108"
            textAnchor="middle"
            fill="#2B1C0E"
            fontSize="22"
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {truncateText(brandName.toUpperCase(), 20)}
          </text>
          <text
            x="0"
            y="132"
            textAnchor="middle"
            fill="#442C16"
            fontSize="11"
            fontWeight="600"
            fontFamily="DM Sans, sans-serif"
          >
            {truncateText(emblemCaption || 'Kuliner Khas Wonoayu', 32)}
          </text>
          <text
            x="0"
            y="156"
            textAnchor="middle"
            fill="#442C16"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            VERSI STEMPEL KRAFT
          </text>
        </g>
      </svg>
    );
  }

  if (activeTab === 'sticker') {
    return (
      <svg
        ref={svgRef}
        viewBox="0 0 600 460"
        className="w-full h-auto rounded-xl border border-[#E5E0D8] bg-[#F7F5F0]"
        role="img"
        aria-label={`Stiker Label ${productName}`}
      >
        <defs>
          <filter id="stickerShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1A241E" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* Cutting mat grid backdrop */}
        <rect x="0" y="0" width="600" height="460" fill="#F2EFE9" />
        <g stroke="#E2DDD3" strokeWidth="1">
          <line x1="0" y1="92" x2="600" y2="92" />
          <line x1="0" y1="184" x2="600" y2="184" />
          <line x1="0" y1="276" x2="600" y2="276" />
          <line x1="0" y1="368" x2="600" y2="368" />
          <line x1="150" y1="0" x2="150" y2="460" />
          <line x1="300" y1="0" x2="300" y2="460" />
          <line x1="450" y1="0" x2="450" y2="460" />
        </g>

        {/* Main Die-Cut Circular Label Sticker */}
        <g transform="translate(215, 230)" filter="url(#stickerShadow)">
          {showCutLine && (
            <circle
              cx="0"
              cy="0"
              r="168"
              fill="none"
              stroke="#E11D48"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
          )}
          <circle cx="0" cy="0" r="156" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="148" fill={primaryColor} />
          <circle cx="0" cy="0" r="138" fill="none" stroke={secondaryColor} strokeWidth="2" />

          {/* Top Band */}
          <text
            x="0"
            y="-98"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="12"
            fontWeight="700"
            letterSpacing="2"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {truncateText(brandName.toUpperCase(), 24)}
          </text>

          {/* Center Emblem */}
          <g transform="translate(-42, -92) scale(0.7)">
            {safeEmblemPaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx === 0 ? accentColor : 'none'}
                fillOpacity={idx === 0 ? 0.35 : 0}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Main Product Title */}
          <rect x="-118" y="-12" width="236" height="58" rx="10" fill="#FAF6F0" />
          <text
            x="0"
            y="14"
            textAnchor="middle"
            fill="#1A241E"
            fontSize="16"
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {truncateText(productName, 24)}
          </text>
          <text
            x="0"
            y="34"
            textAnchor="middle"
            fill={accentColor}
            fontSize="11"
            fontWeight="700"
            fontFamily="DM Sans, sans-serif"
          >
            {truncateText(flavorVariant, 28)}
          </text>

          {/* Tagline & Metadata */}
          <text
            x="0"
            y="68"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10.5"
            fontFamily="DM Sans, sans-serif"
          >
            {truncateText(tagline, 36)}
          </text>

          {/* Bottom Netto & P-IRT */}
          <rect x="-86" y="84" width="172" height="24" rx="12" fill={accentColor} />
          <text
            x="0"
            y="100"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
          >
            NETTO {netWeight} · HALAL
          </text>
          <text
            x="0"
            y="125"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {truncateText(pirtNumber, 28)}
          </text>
        </g>

        {/* Secondary Back-of-Pack Info & Seal Sticker */}
        <g transform="translate(475, 230)" filter="url(#stickerShadow)">
          {showCutLine && (
            <rect
              x="-96"
              y="-156"
              width="192"
              height="312"
              rx="16"
              fill="none"
              stroke="#E11D48"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
          )}
          <rect x="-86" y="-146" width="172" height="292" rx="12" fill="#FFFFFF" stroke="#E5E0D8" strokeWidth="1" />
          <rect x="-86" y="-146" width="172" height="44" rx="12" fill={primaryColor} />
          <rect x="-86" y="-114" width="172" height="12" fill={primaryColor} />

          <text
            x="0"
            y="-120"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="700"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            INFO PRODUK
          </text>

          <text x="-70" y="-82" fill="#1A241E" fontSize="10" fontWeight="700" fontFamily="DM Sans, sans-serif">
            Komposisi:
          </text>
          <text x="-70" y="-66" fill="#4B5563" fontSize="9" fontFamily="DM Sans, sans-serif">
            {truncateText(ingredientsSummary, 28)}
          </text>
          <text x="-70" y="-52" fill="#4B5563" fontSize="9" fontFamily="DM Sans, sans-serif">
            {ingredientsSummary.length > 28 ? truncateText(ingredientsSummary.slice(28), 28) : 'Diproduksi higienis harian.'}
          </text>

          <line x1="-70" y1="-34" x2="70" y2="-34" stroke="#E5E0D8" strokeWidth="1" />

          <text x="-70" y="-16" fill="#1A241E" fontSize="10" fontWeight="700" fontFamily="DM Sans, sans-serif">
            Diproduksi Oleh:
          </text>
          <text x="-70" y="0" fill="#4B5563" fontSize="9.5" fontFamily="DM Sans, sans-serif">
            {truncateText(brandName, 24)}
          </text>
          <text x="-70" y="14" fill="#4B5563" fontSize="9" fontFamily="DM Sans, sans-serif">
            Kec. Wonoayu, Sidoarjo
          </text>
          <text x="-70" y="29" fill={primaryColor} fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            WA: {contactWhatsapp}
          </text>

          {/* Stylized Order QR Block */}
          <rect x="-42" y="48" width="84" height="62" rx="6" fill="#FAF6F0" stroke={kraftDark} strokeWidth="1" />
          <g transform="translate(-20, 56)" fill="#1A241E">
            <rect x="0" y="0" width="12" height="12" />
            <rect x="28" y="0" width="12" height="12" />
            <rect x="0" y="28" width="12" height="12" />
            <rect x="16" y="4" width="6" height="6" />
            <rect x="16" y="16" width="10" height="10" />
            <rect x="30" y="18" width="8" height="8" />
            <rect x="20" y="30" width="18" height="8" />
          </g>
          <text x="0" y="128" textAnchor="middle" fill="#647068" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
            SCAN ORDER ULANG
          </text>
        </g>
      </svg>
    );
  }

  // Default: Mockup Kemasan Produk (Standing Pouch, Lunch Box, Cup Bowl, or Glass Jar)
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 460"
      className="w-full h-auto rounded-xl border border-[#E5E0D8] bg-[#FAF8F4]"
      role="img"
      aria-label={`Mockup Kemasan ${format} untuk ${productName}`}
    >
      <defs>
        <pattern id="kraftGrain" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="0.9" fill="#593B1F" fillOpacity="0.09" />
          <circle cx="11" cy="12" r="0.7" fill="#FFFFFF" fillOpacity="0.16" />
        </pattern>
        <linearGradient id="stageFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F2EB" />
          <stop offset="100%" stopColor="#EAE3D5" />
        </linearGradient>
        <filter id="packShadow" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#2B1C0E" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Studio backdrop */}
      <rect x="0" y="0" width="600" height="330" fill="#F9F7F3" />
      <rect x="0" y="330" width="600" height="130" fill="url(#stageFloor)" />
      <ellipse cx="300" cy="396" rx="165" ry="18" fill="#593B1F" fillOpacity="0.12" />

      {/* Format Specific Packaging Silhouette */}
      {format === 'Standing Pouch Kraft' && (
        <g transform="translate(175, 42)" filter="url(#packShadow)">
          {/* Pouch body */}
          <path
            d="M18 0 L232 0 L248 334 C248 346 238 354 226 354 L24 354 C12 354 2 346 2 334 Z"
            fill={kraftBase}
            stroke={kraftDark}
            strokeWidth="1.5"
          />
          {kraftTexture && (
            <path
              d="M18 0 L232 0 L248 334 C248 346 238 354 226 354 L24 354 C12 354 2 346 2 334 Z"
              fill="url(#kraftGrain)"
            />
          )}
          {/* Ziplock & Tear notch */}
          <line x1="16" y1="30" x2="234" y2="30" stroke={kraftDark} strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="15" y1="36" x2="235" y2="36" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.45" />
          {/* Transparent Snack Window */}
          <rect x="34" y="242" width="182" height="58" rx="8" fill="#E3A857" fillOpacity="0.35" stroke={kraftDark} strokeWidth="1" />
          <circle cx="72" cy="272" r="14" fill="#D97706" fillOpacity="0.45" />
          <circle cx="115" cy="268" r="16" fill="#B45309" fillOpacity="0.4" />
          <circle cx="158" cy="274" r="13" fill="#D97706" fillOpacity="0.45" />
          <circle cx="185" cy="264" r="11" fill="#F59E0B" fillOpacity="0.45" />

          {/* Main Printed Label Sticker on Pouch */}
          <rect x="28" y="60" width="194" height="202" rx="12" fill={primaryColor} />
          <rect x="36" y="68" width="178" height="186" rx="8" fill="none" stroke={secondaryColor} strokeWidth="1.5" />

          {/* Brand & Callout */}
          <text x="125" y="90" textAnchor="middle" fill={secondaryColor} fontSize="11" fontWeight="700" letterSpacing="1.6" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(brandName.toUpperCase(), 20)}
          </text>
          <rect x="58" y="98" width="134" height="20" rx="4" fill={accentColor} />
          <text x="125" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="DM Sans, sans-serif">
            {truncateText(calloutBadge, 22)}
          </text>

          {/* Emblem */}
          <g transform="translate(86, 122) scale(0.65)">
            {safeEmblemPaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx === 0 ? accentColor : 'none'}
                fillOpacity={idx === 0 ? 0.35 : 0}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Product Name */}
          <text x="125" y="206" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(productName, 21)}
          </text>
          <text x="125" y="223" textAnchor="middle" fill={secondaryColor} fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">
            {truncateText(flavorVariant, 25)}
          </text>
          <text x="125" y="244" textAnchor="middle" fill="#E5E7EB" fontSize="9" fontFamily="JetBrains Mono, monospace">
            NETTO {netWeight} · {truncateText(pirtNumber, 18)}
          </text>
        </g>
      )}

      {format === 'Lunch Box Kraft' && (
        <g transform="translate(120, 82)" filter="url(#packShadow)">
          {/* Open Lid */}
          <path d="M40 16 L320 16 L345 104 L15 104 Z" fill={kraftShade} stroke={kraftDark} strokeWidth="1.5" />
          {/* Box Inner & Outer Tray */}
          <path d="M15 104 L345 104 L322 252 L38 252 Z" fill={kraftBase} stroke={kraftDark} strokeWidth="1.5" />
          {kraftTexture && (
            <path d="M15 104 L345 104 L322 252 L38 252 Z" fill="url(#kraftGrain)" />
          )}
          <path d="M40 104 L320 104 L305 162 L55 162 Z" fill="#F2DEC1" />

          {/* Belly Band Sleeve */}
          <rect x="115" y="104" width="130" height="148" fill={primaryColor} />
          <rect x="123" y="112" width="114" height="132" fill="none" stroke={secondaryColor} strokeWidth="1.5" />

          <g transform="translate(141, 118) scale(0.62)">
            {safeEmblemPaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx === 0 ? accentColor : 'none'}
                fillOpacity={idx === 0 ? 0.35 : 0}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
          <text x="180" y="196" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(productName, 17)}
          </text>
          <text x="180" y="212" textAnchor="middle" fill={secondaryColor} fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">
            {truncateText(brandName, 20)}
          </text>
          <text x="180" y="232" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
            {netWeight} · {truncateText(calloutBadge, 15)}
          </text>
        </g>
      )}

      {format === 'Cup Bowl Kraft' && (
        <g transform="translate(168, 72)" filter="url(#packShadow)">
          {/* Bowl Rim */}
          <ellipse cx="132" cy="40" rx="118" ry="26" fill={kraftShade} stroke={kraftDark} strokeWidth="2" />
          <ellipse cx="132" cy="40" rx="106" ry="20" fill="#593B1F" fillOpacity="0.15" />
          {/* Tapered Cup Body */}
          <path d="M16 44 L248 44 L214 294 C214 312 50 312 50 294 Z" fill={kraftBase} stroke={kraftDark} strokeWidth="1.5" />
          {kraftTexture && (
            <path d="M16 44 L248 44 L214 294 C214 312 50 312 50 294 Z" fill="url(#kraftGrain)" />
          )}
          {/* Wrap-around Emerald Band Sleeve */}
          <path d="M26 116 L238 116 L224 238 L40 238 Z" fill={primaryColor} />
          <text x="132" y="142" textAnchor="middle" fill={secondaryColor} fontSize="10" fontWeight="700" letterSpacing="1.8" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(brandName.toUpperCase(), 20)}
          </text>
          <text x="132" y="168" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(productName, 20)}
          </text>
          <text x="132" y="188" textAnchor="middle" fill="#FDE68A" fontSize="10.5" fontWeight="600" fontFamily="DM Sans, sans-serif">
            {truncateText(flavorVariant, 24)}
          </text>
          <rect x="74" y="202" width="116" height="22" rx="4" fill={accentColor} />
          <text x="132" y="217" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            {netWeight} · {truncateText(calloutBadge, 14)}
          </text>
        </g>
      )}

      {format === 'Jar Kaca Label' && (
        <g transform="translate(185, 58)" filter="url(#packShadow)">
          {/* Matte Dark Lid */}
          <rect x="44" y="0" width="142" height="36" rx="8" fill="#1F2937" />
          <rect x="52" y="34" width="126" height="10" fill="#374151" />
          {/* Clear Glass Jar Body */}
          <rect x="20" y="44" width="190" height="278" rx="28" fill="#F3EFE6" stroke="#CBD5E1" strokeWidth="2.5" />
          {/* Snack Fill Hint */}
          <rect x="30" y="58" width="170" height="252" rx="20" fill="#D99B4E" fillOpacity="0.32" />
          {/* Die-Cut Arch Label */}
          <path d="M36 122 C36 96 194 96 194 122 L194 268 L36 268 Z" fill={primaryColor} />
          <rect x="36" y="232" width="158" height="36" fill={kraftBase} />
          <text x="115" y="138" textAnchor="middle" fill={secondaryColor} fontSize="11" fontWeight="700" letterSpacing="1.6" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(brandName.toUpperCase(), 18)}
          </text>
          <g transform="translate(80, 140) scale(0.58)">
            {safeEmblemPaths.map((d, idx) => (
              <path
                key={idx}
                d={d}
                fill={idx === 0 ? accentColor : 'none'}
                fillOpacity={idx === 0 ? 0.35 : 0}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
          <text x="115" y="214" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
            {truncateText(productName, 19)}
          </text>
          <text x="115" y="248" textAnchor="middle" fill="#2B1C0E" fontSize="9.5" fontWeight="700" fontFamily="DM Sans, sans-serif">
            {truncateText(flavorVariant, 22)}
          </text>
          <text x="115" y="261" textAnchor="middle" fill="#593B1F" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
            NETTO {netWeight} · HALAL
          </text>
        </g>
      )}

      {/* Clean Spec Caption at Bottom of Stage */}
      <text
        x="300"
        y="436"
        textAnchor="middle"
        fill="#593B1F"
        fontSize="11"
        fontWeight="600"
        fontFamily="DM Sans, sans-serif"
      >
        {format} · {truncateText(tagline, 46)}
      </text>
    </svg>
  );
}
