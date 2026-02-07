import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import type { ProjectionType } from '../types/app'

// Detect video projection type based on aspect ratio and filename hints
function detectProjectionType(width: number, height: number, filename?: string): ProjectionType {
  const aspectRatio = width / height

  // Check filename for VR360 hints (case insensitive)
  const lowerFilename = filename?.toLowerCase() || ''

  // Use regex for more precise matching to avoid false positives like "1080p" matching "180"
  // Pattern: 360 surrounded by non-digit characters or at start/end
  const is360Hint =
    /(?:^|[^0-9])360(?:[^0-9]|$)/.test(lowerFilename) ||
    lowerFilename.includes('equi') ||
    lowerFilename.includes('equirectangular')

  // Match VR180 specifically, not resolution like 1080p
  // Pattern: 180 surrounded by non-digit characters or at start/end
  const is180Hint =
    /(?:^|[^0-9])180(?:[^0-9]|$)/.test(lowerFilename) ||
    lowerFilename.includes('sbs') ||
    lowerFilename.includes('side_by_side') ||
    lowerFilename.includes('sidebyside')

  // Debug logging
  console.log('Filename detection:', { filename: lowerFilename, is360Hint, is180Hint, aspectRatio })

  // VR180 SBS: typically 2:1 (two 1:1 squares side by side)
  // VR360: typically 2:1 (equirectangular)
  if (aspectRatio >= 1.9 && aspectRatio <= 2.1) {
    // If filename has 360 hint but no 180 hint, use VR360
    if (is360Hint && !is180Hint) {
      return 'VR360_EQUI'
    }
    // Default to VR180_SBS for 2:1 since it's more common for DeoVR
    return 'VR180_SBS'
  }

  // Flat video: 16:9, 4:3, 21:9, etc.
  return 'FLAT'
}

export function useVideoTexture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const textureRef = useRef<THREE.VideoTexture | null>(null)
  const [isReady, setIsReady] = useState(false)

  const { videoPath, videoFileName, isPlaying, setIsPlaying, setDuration, currentTime, setCurrentTime, setProjection } = useStore()

  useEffect(() => {
    if (!videoPath) {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
      }
      if (textureRef.current) {
        textureRef.current.dispose()
        textureRef.current = null
      }
      setIsReady(false)
      return
    }

    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = videoPath

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      video.currentTime = 0

      // Auto-detect projection type based on video dimensions and filename
      // Use stored filename (original file name from user selection)
      const detectedType = detectProjectionType(video.videoWidth, video.videoHeight, videoFileName || undefined)
      setProjection(detectedType)
    }

    const handleCanPlay = () => {
      const texture = new THREE.VideoTexture(video)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = false

      textureRef.current = texture
      videoRef.current = video
      setIsReady(true)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    video.load()

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.pause()
      video.src = ''
      if (textureRef.current) {
        textureRef.current.dispose()
      }
    }
  }, [videoPath, videoFileName, setDuration, setCurrentTime, setIsPlaying, setProjection])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false)
        })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, setIsPlaying])

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      seekTo(currentTime)
    }
  }, [currentTime, seekTo])

  return {
    texture: textureRef.current,
    video: videoRef.current,
    isReady,
    seekTo
  }
}
