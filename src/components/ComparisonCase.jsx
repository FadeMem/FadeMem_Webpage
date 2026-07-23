import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { LazyVideo } from './LazyVideo'
import { VideoProgress } from './VideoProgress'

export function ComparisonCase({ item, caseIndex, playbackRate = 1 }) {
  const refs = useRef([])
  const [progress, setProgress] = useState(0)

  const videos = () => refs.current.filter(Boolean)
  const playAll = () => videos().forEach((video) => video.play().catch(() => {}))
  const pauseAll = () => videos().forEach((video) => video.pause())
  const resetAll = () => {
    videos().forEach((video) => {
      video.currentTime = 0
      video.play().catch(() => {})
    })
    setProgress(0)
  }
  const seekAll = (event) => {
    const next = Number(event.target.value)
    videos().forEach((video) => {
      if (Number.isFinite(video.duration)) video.currentTime = video.duration * next / 100
    })
    setProgress(next)
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const primary = refs.current[0]
      if (primary && Number.isFinite(primary.duration) && primary.duration > 0) {
        setProgress(primary.currentTime / primary.duration * 100)
        refs.current.slice(1).filter(Boolean).forEach((video) => {
          if (!primary.paused && Math.abs(video.currentTime - primary.currentTime) > 0.35) {
            video.currentTime = primary.currentTime
          }
        })
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <article className="comparison-case">
      <div className="comparison-case__bar">
        <div className="comparison-case__copy">
          <span className="eyebrow">Case {String(caseIndex).padStart(2, '0')}</span>
          <p className="comparison-case__summary">{item.summary}</p>
        </div>
        <div className="sync-bar sync-bar--compact">
          <button type="button" onClick={playAll} aria-label="Play all videos" title="Play all"><Play size={17} fill="currentColor" /></button>
          <button type="button" onClick={pauseAll} aria-label="Pause all videos" title="Pause all"><Pause size={17} fill="currentColor" /></button>
          <button type="button" onClick={resetAll} aria-label="Restart all videos" title="Restart all"><RotateCcw size={17} /></button>
        </div>
      </div>
      <div className="comparison-grid">
        {item.videos.map((video, index) => {
          const promptId = `comparison-prompt-${item.case_id}-${index}`
          return (
            <div className={`comparison-video ${video.display_name === 'Ours' ? 'comparison-video--ours' : ''}`} key={`${video.method_family}-${video.method_variant || ''}`} tabIndex={0} aria-describedby={promptId}>
              <div className="comparison-video__label">
                <span>{video.display_name}</span>
                {video.display_name === 'Ours' && <span className="ours-mark">FadeMem</span>}
              </div>
              <div className="comparison-video__media">
                <LazyVideo ref={(node) => { refs.current[index] = node }} src={video.file} poster={video.poster} playbackRate={playbackRate} autoPlay showControls={false} />
                <div className="comparison-video__prompt-overlay">
                  <p id={promptId}>{item.prompt}</p>
                </div>
              </div>
              <VideoProgress className="comparison-video__progress" value={progress} onChange={seekAll} label={`Seek all videos in ${item.duration}-second comparison`} />
            </div>
          )
        })}
      </div>
    </article>
  )
}
