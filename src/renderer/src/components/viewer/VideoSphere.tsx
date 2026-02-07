import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import type { ProjectionType } from '../../types/app'

interface VideoSphereProps {
  texture: THREE.VideoTexture
}

export function VideoSphere({ texture }: VideoSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { projection, eye, fov } = useStore()
  const { camera } = useThree()

  const clonedTexture = useMemo(() => {
    const clone = texture.clone()
    clone.needsUpdate = true
    // Set wrapping for proper equirectangular mapping
    clone.wrapS = THREE.RepeatWrapping
    clone.wrapT = THREE.ClampToEdgeWrapping
    return clone
  }, [texture])

  useMemo(() => {
    if (projection === 'VR180_SBS') {
      clonedTexture.repeat.set(0.5, 1)
      clonedTexture.offset.set(eye === 'left' ? 0 : 0.5, 0)
    } else if (projection === 'VR360_EQUI') {
      clonedTexture.repeat.set(1, 1)
      clonedTexture.offset.set(0, 0)
    } else {
      clonedTexture.repeat.set(1, 1)
      clonedTexture.offset.set(0, 0)
    }
  }, [projection, eye, clonedTexture])

  useFrame(() => {
    if (clonedTexture) {
      clonedTexture.needsUpdate = true
    }
  })

  // Reset camera for FLAT mode
  useEffect(() => {
    if (projection === 'FLAT' && camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0, 0)
      camera.rotation.set(0, 0, 0)
      camera.lookAt(0, 0, -1)
    }
  }, [projection, camera])

  const geometry = useMemo(() => {
    return createGeometry(projection)
  }, [projection])

  // Calculate plane size to fit viewport for FLAT mode
  const flatPlaneSize = useMemo(() => {
    if (projection !== 'FLAT') return { width: 16, height: 9, distance: 5 }

    const video = texture.image as HTMLVideoElement
    if (!video.videoWidth || !video.videoHeight) {
      return { width: 16, height: 9, distance: 5 }
    }

    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = 1200 / 720

    const distance = 5
    const vFov = THREE.MathUtils.degToRad(fov)
    const visibleHeight = 2 * Math.tan(vFov / 2) * distance
    const visibleWidth = visibleHeight * canvasAspect

    let width: number, height: number
    if (videoAspect > canvasAspect) {
      width = visibleWidth * 0.95
      height = width / videoAspect
    } else {
      height = visibleHeight * 0.95
      width = height * videoAspect
    }

    return { width, height, distance }
  }, [projection, texture, fov])

  if (projection === 'FLAT') {
    return (
      <mesh ref={meshRef} position={[0, 0, -flatPlaneSize.distance]}>
        <planeGeometry args={[flatPlaneSize.width, flatPlaneSize.height]} />
        <meshBasicMaterial map={clonedTexture} side={THREE.FrontSide} />
      </mesh>
    )
  }

  // VR180: half-sphere needs rotation to face forward
  // VR360: full sphere, rotate to align texture center with camera view
  const getMeshRotation = (): [number, number, number] => {
    if (projection === 'VR180_SBS') {
      return [0, -Math.PI / 2, 0]
    } else if (projection === 'VR360_EQUI') {
      // Rotate 180 degrees so the center of equirectangular image faces the camera
      return [0, Math.PI, 0]
    }
    return [0, 0, 0]
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={[-1, 1, 1]}
      rotation={getMeshRotation()}
    >
      <meshBasicMaterial map={clonedTexture} side={THREE.BackSide} />
    </mesh>
  )
}

function createGeometry(projection: ProjectionType): THREE.BufferGeometry {
  if (projection === 'VR180_SBS') {
    return new THREE.SphereGeometry(500, 60, 40, Math.PI / 2, Math.PI, 0, Math.PI)
  } else if (projection === 'VR360_EQUI') {
    return new THREE.SphereGeometry(500, 60, 40)
  } else {
    return new THREE.PlaneGeometry(16, 9)
  }
}
