type Props = { className?: string }

export default function BrandMark({ className = '' }: Props) {
  return <svg className={`brand-mark ${className}`.trim()} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="20" width="24" height="24" rx="6" />
      <path d="M20 27H10V16M20 38H9M32 20V11M44 32h10v14" />
      <circle cx="10" cy="12" r="3.5" /><circle cx="5" cy="38" r="3.5" />
      <circle cx="32" cy="7" r="3.5" /><circle cx="54" cy="50" r="3.5" />
    </g>
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
}
