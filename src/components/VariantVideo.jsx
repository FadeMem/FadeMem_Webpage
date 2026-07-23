import { useEffect, useRef, useState } from 'react'
import { LazyVideo } from './LazyVideo'
import { VideoProgress } from './VideoProgress'

export function VariantVideo({ video, playbackRate }) {
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
    <div className="variant-video" tabIndex={0} aria-label={video.display_name}>
      <span>{video.display_name}</span>
      <LazyVideo ref={videoRef} src={video.file} poster={video.poster} playbackRate={playbackRate} autoPlay showControls={false} />
      <VideoProgress value={progress} onChange={seekVideo} label={`Seek ${video.display_name} video`} />
    </div>
  )
}
