import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`

export const LazyVideo = forwardRef(function LazyVideo(
  { src, poster, eager = false, autoPlay = false, background = false, className = '', onError, playbackRate = 1, showControls = true },
  forwardedRef,
) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(eager)
  const [failed, setFailed] = useState(false)

  useImperativeHandle(forwardedRef, () => videoRef.current)

  useEffect(() => {
    if (eager || shouldLoad || !containerRef.current) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '480px 0px' },
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [eager, shouldLoad])

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.defaultPlaybackRate = playbackRate
    videoRef.current.playbackRate = playbackRate
  }, [playbackRate, shouldLoad])

  const handleError = () => {
    setFailed(true)
    onError?.()
  }

  return (
    <div ref={containerRef} className={`video-shell ${background ? 'video-shell--background' : ''} ${className}`}>
      <video
        ref={videoRef}
        poster={assetUrl(poster)}
        src={shouldLoad ? assetUrl(src) : undefined}
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        autoPlay={autoPlay}
        controls={!background && showControls}
        onLoadedMetadata={(event) => {
          event.currentTarget.defaultPlaybackRate = playbackRate
          event.currentTarget.playbackRate = playbackRate
        }}
        onError={handleError}
      />
      {failed && <div className="video-error" role="status">Video unavailable</div>}
    </div>
  )
})
