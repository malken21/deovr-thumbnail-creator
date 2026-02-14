import { useRef, useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

interface VideoSphereProps {
  texture: THREE.VideoTexture
}

export function VideoSphere({ texture }: VideoSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { projection, eye, fov } = useStore()
  const { camera } = useThree()

  // Configure texture settings for optimal quality
  useEffect(() => {
    // Linear filter is critical for smooth interpolation in shader
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }, [texture])

  // Shader Uniforms
  const uniforms = useMemo(() => ({
    map: { value: texture },
    projectionType: { value: 0 }, // Will be updated
    eye: { value: 0 } // Will be updated
  }), [texture])

  // Update uniforms when state changes
  useEffect(() => {
    let pType = 0
    if (projection === 'VR180_SBS') pType = 1
    else if (projection === 'VR360_EQUI') pType = 2

    uniforms.projectionType.value = pType
    uniforms.eye.value = eye === 'left' ? 0 : 1
  }, [projection, eye, uniforms])

  // Reset camera for FLAT mode
  useEffect(() => {
    if (projection === 'FLAT' && camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0, 0)
      camera.rotation.set(0, 0, 0)
      camera.lookAt(0, 0, -1)
    }
  }, [projection, camera])

  // Geometry management
  const geometry = useMemo(() => {
    if (projection === 'FLAT') {
      // Logic for FLAT plane size
      // Default fallback size
      let width = 16
      let height = 9
      const distance = 5

      const video = texture.image as HTMLVideoElement
      if (video && video.videoWidth && video.videoHeight) {
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
      // For VR modes, use a standard Sphere. 
      // Low segment count (60, 40) is sufficient because projection is handled in fragment shader.
      // We render on BackSide, so we are inside the sphere.
      return new THREE.SphereGeometry(500, 60, 40)
    }
  }, [projection, texture, fov]) // Re-create on projection change

  // Calculate position/rotation based on projection
  // For FLAT, push back. For VR, center at 0.
  const position: [number, number, number] = projection === 'FLAT' ? [0, 0, -5] : [0, 0, 0]

  // No special rotation needed for VR sphere as we handle orientation in shader/camera.
  // But usually VR180 is viewed looking forward.
  // We might need to rotate the sphere if the texture mapping assumes different alignment.
  // Our shader assumes -Z is forward (u=0.5).
  // If camera is at 0 looking at -Z, it matches.

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      scale={[1, 1, 1]} // Normal scale. Shader handles mapping.
    >
      {/* Use ShaderMaterial for all modes (including FLAT, it handles it) */}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={projection === 'FLAT' ? THREE.FrontSide : THREE.BackSide}
      />
    </mesh>
  )
}
