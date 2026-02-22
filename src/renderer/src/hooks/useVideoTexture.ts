import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import type { ProjectionType } from '../types/app'

/**
 * アスペクト比とファイル名のヒントから動画の投影方式を判別する
 * @param width 動画の幅
 * @param height 動画の高さ
 * @param filename ファイル名（ヒント用）
 * @returns 判別された投影方式
 */
function detectProjectionType(width: number, height: number, filename?: string): ProjectionType {
  const aspectRatio = width / height

  // ファイル名からVR360のヒントを探す（大文字小文字を区別しない）
  const lowerFilename = filename?.toLowerCase() || ''

  // "1080p" などの解像度表記を "180" と誤認しないよう、数字の境界を確認
  // パターン: 数字以外の文字に囲まれた、あるいは開始/終了位置にある "360"
  const is360Hint =
    /(?:^|[^0-9])360(?:[^0-9]|$)/.test(lowerFilename) ||
    lowerFilename.includes('equi') ||
    lowerFilename.includes('equirectangular')

  // VR180のヒントを探す
  const is180Hint =
    /(?:^|[^0-9])180(?:[^0-9]|$)/.test(lowerFilename) ||
    lowerFilename.includes('sbs') ||
    lowerFilename.includes('side_by_side') ||
    lowerFilename.includes('sidebyside')

  // デバッグ用ログ
  console.log('投影方式の自動判別:', { filename: lowerFilename, is360Hint, is180Hint, aspectRatio })

  // VR180 SBS: 一般的に 2:1 (1:1の正方形が横に2枚)
  // VR360: 一般的に 2:1 (Equirectangular)
  if (aspectRatio >= 1.9 && aspectRatio <= 2.1) {
    // 360のヒントがあり、かつ180のヒントがない場合はVR360と判断
    if (is360Hint && !is180Hint) {
      return 'VR360_EQUI'
    }
    // DeoVRでは2:1はVR180_SBSであることが多いため、デフォルトをVR180にする
    return 'VR180_SBS'
  }

  // 平面動画: 16:9, 4:3, 21:9 等
  return 'FLAT'
}

/**
 * 動画ファイルを Three.js のテクスチャとして管理するためのカスタムフック
 */
export function useVideoTexture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const textureRef = useRef<THREE.VideoTexture | null>(null)
  const [isReady, setIsReady] = useState(false)

  const { videoPath, videoFileName, isPlaying, setIsPlaying, setDuration, currentTime, setCurrentTime, setProjection } = useStore()

  // 動画ファイルの読み込みとテクスチャの生成
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

    // メタデータの読み込み完了時
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      video.currentTime = 0

      // 解像度とファイル名から投影方式を自動判別
      const detectedType = detectProjectionType(video.videoWidth, video.videoHeight, videoFileName || undefined)
      setProjection(detectedType)
    }

    // 再生可能な状態になった時
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

    // 再生時間の更新時
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    // 再生終了時
    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    video.load()

    // クリーンアップ処理
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

  // 再生/一時停止の状態同期
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

  /** 指定した時間へシークする */
  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  // 外部からの現在の再生時間（currentTime）の変更に追従
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      seekTo(currentTime)
    }
  }, [currentTime, seekTo])

  return {
    /** Three.js用ビデオテクスチャ */
    texture: textureRef.current,
    /** HTMLVideoElement本体 */
    video: videoRef.current,
    /** 準備完了フラグ */
    isReady,
    /** シーク用関数 */
    seekTo
  }
}
