export function DocumentIcon({ className, size = 120 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox='0 0 100 130'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      {/* Paper background with shadow */}
      <rect x='8' y='8' width='84' height='114' rx='8' fill='#E8E8E8' />

      {/* Main paper */}
      <rect
        x='4'
        y='4'
        width='84'
        height='114'
        rx='8'
        fill='#F8F8F8'
        stroke='#E0E0E0'
        strokeWidth='1'
      />

      {/* Circle avatar placeholder */}
      <circle cx='24' cy='28' r='10' fill='#D8D8D8' />

      {/* Text lines */}
      <rect x='42' y='22' width='36' height='5' rx='2.5' fill='#D0D0D0' />
      <rect x='42' y='32' width='24' height='5' rx='2.5' fill='#E0E0E0' />

      {/* Body text lines */}
      <rect x='16' y='52' width='60' height='4' rx='2' fill='#E0E0E0' />
      <rect x='16' y='62' width='50' height='4' rx='2' fill='#E0E0E0' />
      <rect x='16' y='72' width='55' height='4' rx='2' fill='#E0E0E0' />
      <rect x='16' y='82' width='40' height='4' rx='2' fill='#E0E0E0' />

      {/* Signature icon */}
      <g transform='translate(62, 96)'>
        <path
          d='M2 12 Q6 4 10 8 Q14 12 18 6'
          stroke='#888888'
          strokeWidth='2'
          strokeLinecap='round'
          fill='none'
        />
        <line x1='0' y1='16' x2='20' y2='16' stroke='#888888' strokeWidth='1.5' />
      </g>
    </svg>
  );
}
