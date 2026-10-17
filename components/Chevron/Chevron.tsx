type Props = {
  direction: 'left' | 'right';
  className?: string;
};

export default function Chevron({ direction, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 8 14"
      fill="none"
      aria-hidden="true"
      className={`h-[0.5em] w-[0.29em] shrink-0 ${className}`}
    >
      <path
        d={direction === 'right' ? 'M1 1l6 6-6 6' : 'M7 1 1 7l6 6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
