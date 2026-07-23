export function VideoProgress({ value, onChange, label, className = '' }) {
  return (
    <div className={`video-progress ${className}`}>
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={onChange}
        aria-label={label}
        style={{ '--video-progress': `${value}%` }}
      />
    </div>
  )
}
