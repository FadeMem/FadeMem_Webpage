import { useEffect, useRef, useState } from 'react'
import { LazyVideo } from './LazyVideo'
import { VideoProgress } from './VideoProgress'

export function ResultCard({ item, playbackRate = 1 }) {
  const video = item.videos.find((entry) => entry.method_family === 'FadeMem') || item.videos[0]
  const promptId = `prompt-${item.case_id}`
  const videoRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const element = videoRef.current
    if (!element) return undefined

    const updateProgress = () => {
      if (Number.isFinite(element.duration) && element.duration > 0) {
        setProgress(element.currentTime / element.duration * 100)
      }
    }

    element.addEventListener('timeupdate', updateProgress)
    element.addEventListener('loadedmetadata', updateProgress)
    element.addEventListener('durationchange', updateProgress)
    return () => {
      element.removeEventListener('timeupdate', updateProgress)
      element.removeEventListener('loadedmetadata', updateProgress)
      element.removeEventListener('durationchange', updateProgress)
    }
  }, [])

  const seekVideo = (event) => {
    const element = videoRef.current
    const next = Number(event.target.value)
    if (element && Number.isFinite(element.duration) && element.duration > 0) {
      element.currentTime = element.duration * next / 100
      setProgress(next)
    }
  }

  return (
    <article className="result-card" tabIndex={0} aria-describedby={promptId}>
      <div className="result-card__media">
        <LazyVideo ref={videoRef} src={video.file} poster={video.poster} playbackRate={playbackRate} autoPlay showControls={false} />
        <div className="result-card__prompt-overlay">
          <p id={promptId}>{item.prompt}</p>
        </div>
        <span className="result-card__duration">{item.duration}s</span>
      </div>
      <VideoProgress className="result-card__progress" value={progress} onChange={seekVideo} label={`Seek ${item.duration}-second video`} />
    </article>
  )
}
