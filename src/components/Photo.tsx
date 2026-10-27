import type { PortfolioPhoto } from '../photos'
import './Photo.css'

export default function Photo({ photo, className = '', loading = 'lazy' }: { photo: PortfolioPhoto; className?: string; loading?: 'eager' | 'lazy' }) {
  return <div className={`photo-slot portfolio-photo ${className}`.trim()} data-photo-slot="" data-photo={photo.id} data-photo-subject={photo.subject}>
    <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading={loading} decoding="async" />
  </div>
}
