import clsx from 'clsx'
import type { ReactNode } from 'react'

import type { IllustrationName } from '@/lib/content/schemas'

/*
 * Flat illustrations from the Phase 1 page designs, drawn as inline SVG so
 * they stay crisp at any size and weigh a few hundred bytes each. Every one
 * paints its own background and uses `slice`, so it fills whatever box the
 * CSS gives it (cards, banners, heroes) like an object-fit: cover image.
 * They are decorative: hidden from assistive tech.
 */

const SKIN = { light: '#ecb48e', mid: '#dca07a', tan: '#bf7b55', deep: '#a86a45' }
const HAIR = '#2a1f1c'
const INK = '#14302b'

type Fit = 'slice' | 'meet'

function Svg({
  viewBox,
  children,
  className,
  align = 'xMidYMid',
  fit = 'slice',
}: {
  viewBox: string
  children: ReactNode
  className?: string
  align?: string
  fit?: Fit
}) {
  return (
    <svg
      className={clsx('illus', className)}
      viewBox={viewBox}
      preserveAspectRatio={`${align} ${fit}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** Doctor in a white coat with a stethoscope, centred on (cx, top). */
function Doctor({
  cx,
  top,
  scale = 1,
  skin = SKIN.mid,
  shirt = '#2a7a66',
  hair = 'short',
}: {
  cx: number
  top: number
  scale?: number
  skin?: string
  shirt?: string
  hair?: 'short' | 'bald' | 'hijab' | 'bun'
}) {
  return (
    <g transform={`translate(${cx} ${top}) scale(${scale})`}>
      {hair === 'hijab' && (
        <path d="M-30 6 Q-32 -34 0 -36 Q32 -34 30 6 L34 48 L-34 48 Z" fill={HAIR} />
      )}
      <rect x="-9" y="22" width="18" height="22" rx="6" fill={skin} />
      <path d="M-46 118 Q-46 48 0 44 Q46 48 46 118 Z" fill="#fff" />
      <path d="M-12 46 L0 66 L12 46 Z" fill={shirt} />
      <path
        d="M-20 52 Q-24 88 -6 92 M20 52 Q24 88 6 92"
        stroke={INK}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="0" cy="94" r="5" fill={INK} />
      <ellipse cx="0" cy="4" rx="22" ry="26" fill={skin} />
      {hair === 'short' && (
        <path d="M-23 2 Q-25 -24 0 -24 Q25 -24 23 2 Q14 -10 0 -10 Q-14 -10 -23 2 Z" fill={HAIR} />
      )}
      {hair === 'bald' && (
        <>
          <rect x="-24" y="-2" width="5" height="10" rx="2" fill="#b9b9b9" />
          <rect x="19" y="-2" width="5" height="10" rx="2" fill="#b9b9b9" />
        </>
      )}
      {hair === 'bun' && (
        <>
          <circle cx="0" cy="-26" r="9" fill={HAIR} />
          <path d="M-23 4 Q-24 -22 0 -22 Q24 -22 23 4 Q12 -8 0 -8 Q-12 -8 -23 4 Z" fill={HAIR} />
        </>
      )}
      {hair === 'hijab' && (
        <path d="M-22 8 Q-22 -22 0 -22 Q22 -22 22 8 Q22 -6 0 -8 Q-22 -6 -22 8 Z" fill={HAIR} />
      )}
    </g>
  )
}

/** Seated person (patient / visitor) with a rounded body. */
function Person({
  cx,
  top,
  scale = 1,
  skin = SKIN.light,
  body = '#f0a85a',
  hair = 'bun',
}: {
  cx: number
  top: number
  scale?: number
  skin?: string
  body?: string
  hair?: 'bun' | 'short' | 'hijab'
}) {
  return (
    <g transform={`translate(${cx} ${top}) scale(${scale})`}>
      {hair === 'hijab' && (
        <path d="M-26 4 Q-28 -30 0 -32 Q28 -30 26 4 L30 40 L-30 40 Z" fill={HAIR} />
      )}
      <rect x="-34" y="34" width="68" height="70" rx="20" fill={body} />
      <rect x="-7" y="22" width="14" height="16" rx="5" fill={skin} />
      <ellipse cx="0" cy="6" rx="20" ry="23" fill={skin} />
      {hair === 'bun' && (
        <>
          <circle cx="0" cy="-24" r="9" fill={HAIR} />
          <path d="M-21 6 Q-22 -18 0 -18 Q22 -18 21 6 Q12 -6 0 -6 Q-12 -6 -21 6 Z" fill={HAIR} />
        </>
      )}
      {hair === 'short' && (
        <path d="M-21 4 Q-22 -19 0 -19 Q22 -19 21 4 Q12 -6 0 -6 Q-12 -6 -21 4 Z" fill={HAIR} />
      )}
      {hair === 'hijab' && (
        <path d="M-20 8 Q-20 -18 0 -18 Q20 -18 20 8 Q20 -4 0 -6 Q-20 -4 -20 8 Z" fill={HAIR} />
      )}
    </g>
  )
}

function Heart({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 250" fit={fit}>
      <rect width="480" height="250" fill="#f4d9d4" />
      <circle cx="390" cy="60" r="110" fill="#efc4bc" />
      <rect y="206" width="480" height="44" fill="#eec3bb" />
      <rect x="60" y="62" width="170" height="122" rx="14" fill="#0f2622" />
      <rect x="70" y="72" width="150" height="102" rx="8" fill="#16332d" />
      <text
        x="82"
        y="96"
        fill="#6fe0b2"
        fontSize="16"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        72
      </text>
      <polyline
        points="76,138 110,138 122,112 136,160 150,124 160,138 214,138"
        fill="none"
        stroke="#6fe0b2"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M340 212 C 290 176 262 150 262 118 C 262 94 280 78 302 78 C 318 78 332 88 340 102 C 348 88 362 78 378 78 C 400 78 418 94 418 118 C 418 150 390 176 340 212 Z"
        fill="#e2574c"
      />
      <path
        d="M290 104 Q284 118 290 134"
        stroke="#f4a49b"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  )
}

function Ambulance({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 250" fit={fit}>
      <rect width="480" height="250" fill="#f6e2dc" />
      <rect y="178" width="480" height="72" fill="#ebcdc4" />
      <text
        x="306"
        y="70"
        fill="#e0473f"
        fontSize="30"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        5G
      </text>
      <rect x="160" y="74" width="34" height="14" rx="4" fill="#3f6fa8" />
      <path
        d="M104 92 H292 Q306 92 314 104 L346 140 Q356 150 356 162 V186 Q356 194 348 194 H112 Q104 194 104 186 Z"
        fill="#fff"
      />
      <path d="M296 104 H316 L340 138 H296 Z" fill="#a9cbe0" />
      <rect x="104" y="150" width="252" height="10" fill="#e0473f" />
      <rect x="160" y="112" width="12" height="34" fill="#e0473f" />
      <rect x="149" y="123" width="34" height="12" fill="#e0473f" />
      <circle cx="152" cy="196" r="22" fill="#242424" />
      <circle cx="152" cy="196" r="9" fill="#9a9a9a" />
      <circle cx="306" cy="196" r="22" fill="#242424" />
      <circle cx="306" cy="196" r="9" fill="#9a9a9a" />
    </Svg>
  )
}

function Building({ fit }: { fit?: Fit }) {
  const windows = []
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 8; col++) {
      if (row === 3 && (col === 3 || col === 4)) continue
      windows.push(
        <rect
          key={`${row}-${col}`}
          x={98 + col * 38}
          y={92 + row * 36}
          width="26"
          height="22"
          rx="5"
          fill="#cfe1ea"
        />,
      )
    }
  return (
    <Svg viewBox="0 0 480 300" fit={fit}>
      <rect width="480" height="300" fill="#d5e6ee" />
      <circle cx="470" cy="60" r="34" fill="#f8efb2" />
      <circle cx="12" cy="214" r="26" fill="#7fae8f" />
      <rect y="232" width="480" height="68" fill="#b8cfc5" />
      <rect x="84" y="70" width="312" height="172" fill="#fff" />
      <rect x="76" y="62" width="328" height="18" rx="4" fill="#0e6e58" />
      {windows}
      <rect x="208" y="180" width="64" height="62" rx="4" fill="#9cc9d8" />
      <rect x="194" y="172" width="92" height="12" rx="4" fill="#0e6e58" />
      <path d="M212 242 H268 L292 300 H188 Z" fill="#e8d9c5" />
      <rect x="221" y="22" width="38" height="38" rx="8" fill="#d9332b" />
      <rect x="236" y="30" width="8" height="22" fill="#fff" />
      <rect x="229" y="37" width="22" height="8" fill="#fff" />
    </Svg>
  )
}

function Family({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 420 300" fit={fit}>
      <rect width="420" height="300" fill="#f4e5d6" />
      <circle cx="210" cy="152" r="122" fill="#ead6bb" />
      <path
        d="M210 58 C 186 40 178 28 178 18 C 178 8 186 2 194 2 C 202 2 207 7 210 13 C 213 7 218 2 226 2 C 234 2 242 8 242 18 C 242 28 234 40 210 58 Z"
        fill="#e2574c"
        transform="translate(0 6)"
      />
      <Person cx={128} top={128} skin={SKIN.tan} body="#2f7a66" hair="short" />
      <Person cx={292} top={128} skin={SKIN.deep} body="#3f6fa8" hair="short" />
      <Person cx={210} top={100} scale={1.12} skin={SKIN.light} body="#e2735a" hair="short" />
      <Person cx={160} top={180} skin="#f2c6a6" body="#f2b23a" hair="short" />
      <Person cx={258} top={180} skin={SKIN.light} body="#8a5fb0" hair="bun" />
    </Svg>
  )
}

function Consult({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 300" fit={fit}>
      <rect width="480" height="300" fill="#cfe0d8" />
      <rect x="40" y="30" width="150" height="150" rx="6" fill="#eef5f1" />
      <rect x="112" y="30" width="6" height="150" fill="#cfe0d8" />
      <rect x="40" y="102" width="150" height="6" fill="#cfe0d8" />
      <rect y="222" width="480" height="78" fill="#b8d0c5" />
      <Doctor cx={160} top={118} skin={SKIN.tan} shirt="#2a7a66" />
      <rect x="236" y="168" width="200" height="12" rx="4" fill="#7f9a8f" />
      <rect x="252" y="180" width="8" height="60" fill="#7f9a8f" />
      <rect x="412" y="180" width="8" height="60" fill="#7f9a8f" />
      <Person cx={316} top={150} skin={SKIN.light} body="#f0a85a" hair="bun" />
      <path
        d="M440 168 Q426 140 432 122 Q446 140 440 168 Z M440 168 Q452 136 468 128 Q462 152 440 168 Z"
        fill="#5e9a75"
      />
      <rect x="430" y="164" width="20" height="18" rx="3" fill="#c5774f" />
    </Svg>
  )
}

function Oncology({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 280" fit={fit}>
      <rect width="480" height="280" fill="#e4dff3" />
      {[
        [70, 70, 34],
        [160, 40, 18],
        [360, 60, 30],
        [420, 150, 22],
        [96, 200, 26],
        [400, 236, 18],
        [300, 30, 14],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#f1eefa" />
      ))}
      <Doctor cx={190} top={90} skin={SKIN.mid} shirt="#5b3fa0" hair="bald" />
      <Person cx={292} top={134} skin={SKIN.light} body="#a08cd8" hair="hijab" />
    </Svg>
  )
}

function Paediatric({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 280" fit={fit}>
      <rect width="480" height="280" fill="#fdf1cd" />
      <circle cx="360" cy="110" r="130" fill="#fcd97a" />
      {[
        [300, 34, '#7fae8f'],
        [372, 18, '#7f6fd0'],
        [410, 40, '#e2473f'],
        [446, 90, '#1f9aa5'],
      ].map(([x, y, c]) => (
        <g key={String(c)}>
          <line
            x1={Number(x)}
            y1={Number(y) + 14}
            x2="300"
            y2="200"
            stroke="#8a8a8a"
            strokeWidth="1.5"
          />
          <circle cx={Number(x)} cy={Number(y)} r="15" fill={String(c)} />
        </g>
      ))}
      <Doctor cx={150} top={82} skin={SKIN.mid} shirt="#2a7a66" hair="hijab" />
      <Person cx={300} top={196} scale={0.8} skin={SKIN.tan} body="#f0a85a" hair="short" />
    </Svg>
  )
}

function Kidney({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 250" fit={fit}>
      <rect width="480" height="250" fill="#dbe9ef" />
      <circle cx="130" cy="230" r="90" fill="#c5dce5" />
      <path
        d="M150 70 C 104 60 82 100 92 140 C 100 172 132 182 152 166 C 164 156 150 140 152 120 C 154 100 176 92 168 78 Z"
        fill="#cc6352"
      />
      <path
        d="M208 70 C 254 60 276 100 266 140 C 258 172 226 182 206 166 C 194 156 208 140 206 120 C 204 100 182 92 190 78 Z"
        fill="#b8503f"
      />
      <rect x="300" y="40" width="110" height="168" rx="12" fill="#fff" />
      <rect x="316" y="56" width="78" height="46" rx="6" fill="#16332d" />
      <polyline
        points="324,80 344,80 352,66 362,94 370,80 388,80"
        fill="none"
        stroke="#6fd0e0"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[330, 355, 380].map((x) => (
        <circle key={x} cx={x} cy="124" r="7" fill="#9cc4d6" />
      ))}
      <path d="M410 140 Q440 150 440 210" stroke="#d6584a" strokeWidth="4" fill="none" />
      <path d="M410 156 Q428 164 428 210" stroke="#4b78b8" strokeWidth="4" fill="none" />
    </Svg>
  )
}

function Pacemaker({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 220" fit={fit}>
      <rect width="480" height="220" fill="#d9e8e1" />
      <circle cx="240" cy="96" r="104" fill="#c8ddd3" />
      <rect x="160" y="64" width="110" height="60" rx="30" fill="#5d6568" />
      <ellipse cx="196" cy="94" rx="22" ry="20" fill="#9ca6a6" />
      <line x1="270" y1="94" x2="320" y2="94" stroke="#5d6568" strokeWidth="5" />
      <polyline
        points="306,80 320,94 306,108"
        fill="none"
        stroke="#5d6568"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <text
        x="240"
        y="204"
        textAnchor="middle"
        fill="#3c4a47"
        fontSize="14"
        fontFamily="system-ui, sans-serif"
      >
        actual size ≈ a vitamin capsule
      </text>
    </Svg>
  )
}

function Nurses({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 240" fit={fit}>
      <rect width="480" height="240" fill="#e5eef6" />
      <rect x="360" y="0" width="90" height="100" fill="#f4f8fb" />
      <rect x="402" y="0" width="5" height="100" fill="#e5eef6" />
      <rect x="360" y="48" width="90" height="5" fill="#e5eef6" />
      <rect y="206" width="480" height="34" fill="#d2dde7" />
      <Doctor cx={150} top={92} skin={SKIN.mid} shirt="#4f86c6" hair="hijab" />
      <Doctor cx={240} top={84} skin={SKIN.tan} shirt="#4f86c6" />
      <Doctor cx={330} top={96} skin={SKIN.light} shirt="#4f86c6" hair="hijab" />
    </Svg>
  )
}

function Support({ fit }: { fit?: Fit }) {
  return (
    <Svg viewBox="0 0 480 250" fit={fit}>
      <rect width="480" height="250" fill="#d8e7ee" />
      <ellipse cx="240" cy="22" rx="120" ry="26" fill="#fff" />
      <ellipse cx="240" cy="22" rx="76" ry="14" fill="#fdf1c4" />
      <Person cx={186} top={98} skin={SKIN.tan} body="#5fa594" hair="short" />
      <Person cx={296} top={98} skin={SKIN.light} body="#5fa594" hair="bun" />
      <rect x="120" y="182" width="240" height="16" rx="8" fill="#5f9bb0" />
    </Svg>
  )
}

const AVATAR_TONES = ['#dde8e2', '#e6e2f3', '#f3e5d9', '#dfe9f0'] as const
const AVATARS = [
  { skin: SKIN.mid, shirt: '#2a7a66', hair: 'bald' },
  { skin: SKIN.tan, shirt: '#3f52a0', hair: 'short' },
  { skin: SKIN.light, shirt: '#8a3e28', hair: 'short' },
  { skin: SKIN.deep, shirt: '#2a7a66', hair: 'short' },
] as const

/** Placeholder portrait for doctor cards that have no photo yet. */
export function DoctorAvatar({ index = 0, className }: { index?: number; className?: string }) {
  const tone = AVATAR_TONES[index % AVATAR_TONES.length]
  const look = AVATARS[index % AVATARS.length]!
  return (
    <Svg viewBox="0 0 300 300" className={className}>
      <rect width="300" height="300" fill={tone} />
      <circle cx="250" cy="40" r="90" fill="#fff" opacity=".35" />
      <Doctor cx={150} top={128} scale={1.65} {...look} />
    </Svg>
  )
}

const ILLUSTRATIONS: Record<IllustrationName, (props: { fit?: Fit }) => ReactNode> = {
  heart: Heart,
  ambulance: Ambulance,
  building: Building,
  family: Family,
  consult: Consult,
  oncology: Oncology,
  paediatric: Paediatric,
  kidney: Kidney,
  pacemaker: Pacemaker,
  nurses: Nurses,
  support: Support,
}

/**
 * `fit="meet"` shows the whole drawing (letterboxed) instead of cropping it;
 * give the container the drawing's background colour when using it.
 */
export function Illustration({ name, fit }: { name: IllustrationName; fit?: Fit }) {
  const Art = ILLUSTRATIONS[name]
  return <Art fit={fit} />
}
