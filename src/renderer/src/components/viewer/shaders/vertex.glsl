varying vec3 vDirection;
varying vec2 vUv;

void main() {
  vDirection = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
