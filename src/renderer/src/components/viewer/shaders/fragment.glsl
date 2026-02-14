uniform sampler2D map;
uniform int projectionType; // 0: FLAT, 1: VR180, 2: VR360
uniform int eye; // 0: Left, 1: Right

varying vec3 vDirection;
varying vec2 vUv;

const float PI = 3.14159265359;

void main() {
  // FLAT Projection uses standard UVs
  if (projectionType == 0) {
    gl_FragColor = texture2D(map, vUv);
    return;
  }

  // Spherical Projections (VR180 / VR360)
  vec3 dir = normalize(vDirection);
  
  // Calculate Equirectangular UV coordinates from direction vector
  // Mapping 3D direction to 2D texture coordinates
  // standard mapping: u = 0.5 + atan(dir.z, dir.x) / (2.0 * PI); v = acos(-dir.y) / PI;
  // We align so forward (-Z) maps to center u=0.5
  float u = atan(dir.x, -dir.z) / (2.0 * PI) + 0.5;
  float v = acos(-dir.y) / PI;
  
  vec2 uv = vec2(u, v);
  
  // VR180 SBS Logic
  if (projectionType == 1) {
    // The sphere covers 360 degrees, but VR180 content covers only the front 180 (-90 to +90).
    // In our UV space (u), 0.25 corresponds to -90, 0.75 corresponds to +90.
    // Anything outside [0.25, 0.75] is outside the FOV of the content.
    if (u < 0.25 || u > 0.75) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black out back hemisphere
      return;
    }
    
    // Remap [0.25, 0.75] to [0, 1] for the 180-degree content
    float u_180 = (u - 0.25) * 2.0;
    
    // Select correct eye from SBS texture (Left: 0.0-0.5, Right: 0.5-1.0)
    if (eye == 0) { // Left
      uv.x = u_180 * 0.5;
    } else { // Right
      uv.x = u_180 * 0.5 + 0.5;
    }
    uv.y = v; // v is full height
  }
  // VR360 Logic (Mono) - standardized to full 360
  else if (projectionType == 2) {
    uv = vec2(u, v); // Use full 360 mapping
  }
  
  gl_FragColor = texture2D(map, uv);
}
