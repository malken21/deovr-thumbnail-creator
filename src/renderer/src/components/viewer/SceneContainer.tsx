import { Suspense, useRef, useEffect, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { useI18n } from '../../hooks/useI18n'
import { useVideoTexture } from '../../hooks/useVideoTexture'
import { VideoSphere } from './VideoSphere'
import { OverlayGuide } from './OverlayGuide'
import { TextOverlay } from './TextOverlay'
import { StampOverlay } from './StampOverlay'
import { FOV_MIN, FOV_MAX, TARGET_WIDTH, TARGET_HEIGHT } from '../../types/app'

/**
 * カメラの制御（マウス操作による回転、FOV調整、オートトラッキング）を担当するコンポーネント
 */
function CameraController() {
  const { yaw, pitch, fov, projection } = useStore()
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }, [fov, camera])

  // 毎フレームの更新処理
  useFrame(() => {
    if (controlsRef.current && projection !== 'FLAT') {
      const yawRad = THREE.MathUtils.degToRad(yaw)
      const pitchRad = THREE.MathUtils.degToRad(pitch)

      // 非常に小さい距離でカメラの注視点を設定し、回転を制御する
      const distance = 0.01
      const x = distance * Math.cos(pitchRad) * Math.sin(yawRad)
      const y = distance * Math.sin(pitchRad)
      const z = -distance * Math.cos(pitchRad) * Math.cos(yawRad)

      controlsRef.current.target.set(x, y, z)
      controlsRef.current.update()
    }
  })

  if (projection === 'FLAT') {
    return null
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      rotateSpeed={-0.5}
      target={[0, 0, -0.01]}
    />
  )
}

/**
 * 3Dシーン本体。VideoSphereを描画する
 */
function Scene() {
  const { texture, isReady } = useVideoTexture()
  const { videoPath } = useStore()

  if (!videoPath || !isReady || !texture) {
    return null
  }

  return <VideoSphere texture={texture} />
}

/**
 * ビューアーのキャンバス領域を管理するコンポーネント
 * キャンバス、オーバーレイ要素、ガイド線を 1200x720 の固定サイズの中で合成する
 */
export function SceneContainer() {
  const { t } = useI18n()
  const { fov, videoPath, setCanvasElement, setFov } = useStore()

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 5 : -5
      const newFov = Math.max(FOV_MIN, Math.min(FOV_MAX, fov + delta))
      setFov(newFov)
    },
    [fov, setFov]
  )

  return (
    <div className="absolute inset-0 bg-secondary overflow-auto flex items-center justify-center p-4">
      {/* Fixed size preview container - 1200x720 */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: TARGET_WIDTH,
          height: TARGET_HEIGHT
        }}
        onWheel={handleWheel}
      >
        <Canvas
          camera={{
            fov: fov,
            near: 0.1,
            far: 1000,
            position: [0, 0, 0]
          }}
          gl={{
            antialias: true,
            toneMapping: THREE.NoToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            preserveDrawingBuffer: true
          }}
          dpr={1}
          style={{ width: TARGET_WIDTH, height: TARGET_HEIGHT }}
          onCreated={({ gl }) => setCanvasElement(gl.domElement)}
        >
          <color attach="background" args={['#000000']} />
          <Suspense fallback={null}>
            <Scene />
            <CameraController />
          </Suspense>
        </Canvas>

        {/* Overlays - positioned absolutely within the 1200x720 space */}
        <div className="absolute inset-0 pointer-events-none">
          <StampOverlay />
          <TextOverlay />
          {videoPath && <OverlayGuide />}

          {!videoPath && (
            <div className="absolute inset-x-0 top-8 flex justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 mb-2">
                  {t('viewer.getStarted')}
                </p>
                <p className="text-sm text-white/60">{t('viewer.dropHint')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
