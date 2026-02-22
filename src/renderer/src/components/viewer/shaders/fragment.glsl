uniform sampler2D map;
uniform int projectionType; // 0: FLAT (平面), 1: VR180, 2: VR360
uniform int eye; // 0: 左目, 1: 右目

varying vec3 vDirection;
varying vec2 vUv;

const float PI = 3.14159265359;

void main() {
  // FLAT投影（普通の動画表示）: 標準的なUV座標を使用
  if (projectionType == 0) {
    gl_FragColor = texture2D(map, vUv);
    return;
  }

  // 球体投影 (VR180 / VR360)
  vec3 dir = normalize(vDirection);
  
  // 3D方向ベクトルから正距円筒図法（Equirectangular）のUV座標を算出
  // 標準的なマッピング: u = 0.5 + atan(dir.z, dir.x) / (2.0 * PI); v = acos(-dir.y) / PI;
  // 前方（-Z方向）が中心(u=0.5)に来るように調整
  float u = atan(dir.x, -dir.z) / (2.0 * PI) + 0.5;
  float v = acos(-dir.y) / PI;
  
  vec2 uv = vec2(u, v);
  
  // VR180 SBS（サイドバイサイド）ロジック
  if (projectionType == 1) {
    // 3D空間の球体は360度をカバーしているが、VR180コンテンツは前方180度（-90度〜+90度）のみ。
    // 計算したu座標において、[0.25, 0.75] の範囲が前方180度に相当する。
    // 範囲外（後方半球）は黒く塗りつぶす。
    if (u < 0.25 || u > 0.75) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    
    // 前方180度の座標範囲 [0.25, 0.75] をテクスチャ参照用の [0, 1] に正規化
    float u_180 = (u - 0.25) * 2.0;
    
    // SBSテクスチャから指定された目の映像を選択 (左: 0.0-0.5, 右: 0.5-1.0)
    if (eye == 0) { // 左目
      uv.x = u_180 * 0.5;
    } else { // 右目
      uv.x = u_180 * 0.5 + 0.5;
    }
    uv.y = v; // 垂直方向はそのまま
  }
  // VR360ロジック (モノスコープ) - 全天周
  else if (projectionType == 2) {
    uv = vec2(u, v); // 全周囲マッピングを使用
  }
  
  gl_FragColor = texture2D(map, uv);
}
