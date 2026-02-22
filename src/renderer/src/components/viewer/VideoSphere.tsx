import { useRef, useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

interface VideoSphereProps {
  /** 動画テクスチャ */
  texture: THREE.VideoTexture
}

/**
 * VR動画（VR180/VR360）または平面動画をレンダリングするためのコンポーネント
 */
export function VideoSphere({ texture }: VideoSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { projection, eye, fov } = useStore()
  const { camera } = useThree()

  // テクスチャの設定（品質と補間の最適化）
  useEffect(() => {
    // シェーダーでの滑らかな補間のために線形フィルタを使用
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }, [texture])

  // シェーダー用のUniform変数
  const uniforms = useMemo(() => ({
    map: { value: texture },
    projectionType: { value: 0 }, // 投影方式 (0:FLAT, 1:VR180, 2:VR360)
    eye: { value: 0 } // 目 (0:Left, 1:Right)
  }), [texture])

  // 状態が変更されたときにUniform変数を更新
  useEffect(() => {
    let pType = 0
    if (projection === 'VR180_SBS') pType = 1
    else if (projection === 'VR360_EQUI') pType = 2

    uniforms.projectionType.value = pType
    uniforms.eye.value = eye === 'left' ? 0 : 1
  }, [projection, eye, uniforms])

  // FLAT（平面）モードの場合、カメラを正面（0, 0, 0）にリセット
  useEffect(() => {
    if (projection === 'FLAT' && camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0, 0)
      camera.rotation.set(0, 0, 0)
      camera.lookAt(0, 0, -1)
    }
  }, [projection, camera])

  // ジオメトリの管理
  const geometry = useMemo(() => {
    if (projection === 'FLAT') {
      // 平面モード時のサイズ計算
      let width = 16
      let height = 9
      const distance = 5

      const video = texture.image as HTMLVideoElement
      if (video && video.videoWidth && video.videoHeight) {
        // 動画のアスペクト比に合わせて平面のサイズを調整
        const videoAspect = video.videoWidth / video.videoHeight
        const canvasAspect = 1200 / 720
        const vFov = THREE.MathUtils.degToRad(fov)
        const visibleHeight = 2 * Math.tan(vFov / 2) * distance
        const visibleWidth = visibleHeight * canvasAspect

        if (videoAspect > canvasAspect) {
          width = visibleWidth * 0.95
          height = width / videoAspect
        } else {
          height = visibleHeight * 0.95
          width = height * videoAspect
        }
      }
      return new THREE.PlaneGeometry(width, height)
    } else {
      // VRモード時は球体（Sphere）を使用
      // 投影処理はフラグメントシェーダー側で行うため、分割数は標準的(60, 40)で十分。
      // 内側から見るため、BackSide（裏面）にレンダリングする。
      return new THREE.SphereGeometry(500, 60, 40)
    }
  }, [projection, texture, fov])

  /**
   * 投影方式に基づいた位置の算出
   * 平面（FLAT）の場合は前方に配置、VRの場合は中央（0, 0, 0）に配置
   */
  const position: [number, number, number] = projection === 'FLAT' ? [0, 0, -5] : [0, 0, 0]

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      scale={[1, 1, 1]}
    >
      {/* すべてのモード（FLATを含む）でShaderMaterialを使用してレンダリング */}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={projection === 'FLAT' ? THREE.FrontSide : THREE.BackSide}
      />
    </mesh>
  )
}
