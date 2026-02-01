export function MetallicFolder({ className, size = 160 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 160 160'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <defs>
        {/* Metallic gradient for folder body */}
        <linearGradient id='metalGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stopColor='#6B6B6B' />
          <stop offset='20%' stopColor='#5A5A5A' />
          <stop offset='50%' stopColor='#4A4A4A' />
          <stop offset='80%' stopColor='#3D3D3D' />
          <stop offset='100%' stopColor='#333333' />
        </linearGradient>

        {/* Back panel gradient */}
        <linearGradient id='backPanelGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stopColor='#555555' />
          <stop offset='100%' stopColor='#3A3A3A' />
        </linearGradient>

        {/* Subtle highlight */}
        <linearGradient id='highlightGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor='#888888' stopOpacity='0.3' />
          <stop offset='50%' stopColor='#AAAAAA' stopOpacity='0.1' />
          <stop offset='100%' stopColor='#888888' stopOpacity='0.3' />
        </linearGradient>
      </defs>

      {/* Back panel with tab */}
      <path
        d='M20 45 L20 35 Q20 30 25 30 L55 30 Q60 30 63 35 L68 42 Q71 47 76 47 L135 47 Q140 47 140 52 L140 55 L20 55 Z'
        fill='url(#backPanelGradient)'
      />

      {/* Papers sticking out - no gaps, grayer tones */}
      <rect x='26' y='40' width='108' height='15' rx='2' fill='#D0D0D0' />
      <rect x='26' y='43' width='108' height='12' rx='2' fill='#E0E0E0' />
      <rect x='26' y='46' width='108' height='9' rx='2' fill='#F5F5F5' />

      {/* Main folder body - straight left, slight curve right (office folder style) */}
      <path
        d='M20 55 L20 130 Q20 135 25 135 L135 135 Q140 135 140 130 L140 55 Q140 52 137 52 L20 52 Z'
        fill='url(#metalGradient)'
      />

      {/* Brushed metal texture lines */}
      <g opacity='0.05'>
        <line x1='22' y1='60' x2='138' y2='60' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='67' x2='138' y2='67' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='74' x2='138' y2='74' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='81' x2='138' y2='81' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='88' x2='138' y2='88' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='95' x2='138' y2='95' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='102' x2='138' y2='102' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='109' x2='138' y2='109' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='116' x2='138' y2='116' stroke='#000' strokeWidth='0.5' />
        <line x1='22' y1='123' x2='138' y2='123' stroke='#000' strokeWidth='0.5' />
      </g>

      {/* Top edge highlight */}
      <rect x='20' y='52' width='120' height='2' fill='url(#highlightGradient)' />

      {/* Left edge shine */}
      <rect x='20' y='52' width='2' height='78' fill='#666666' opacity='0.4' />

      {/* Right edge subtle curve highlight */}
      <path
        d='M138 55 L138 130 Q138 133 137 133'
        stroke='#555555'
        strokeWidth='1'
        fill='none'
        opacity='0.3'
      />
    </svg>
  );
}
