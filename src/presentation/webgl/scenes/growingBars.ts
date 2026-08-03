import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Barras de crecimiento — usada en S2A (proyecciones de ahorro). */
export const growingBarsScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 10);
  camera.position.z = 5;

  const count = 8;
  const bars: THREE.Mesh[] = [];
  const targetHeights: number[] = [];

  for (let i = 0; i < count; i++) {
    const target = 0.5 + (i / count) * 3.5;
    targetHeights.push(target);
    const geo = new THREE.BoxGeometry(0.35, 0.01, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = -2.8 + i * (5.6 / (count - 1));
    mesh.position.y = -2;
    scene.add(mesh);
    bars.push(mesh);
  }

  let t = 0;

  function animate() {
    t += 0.012;
    bars.forEach((bar, i) => {
      const progress = Math.min(1, t - i * 0.08);
      if (progress <= 0) return;
      const h = targetHeights[i] * Math.min(1, progress);
      bar.scale.y = Math.max(0.01, h) / 0.01;
      bar.position.y = -2 + (h / 0.01) * 0.005;
    });
  }

  function dispose() {
    bars.forEach((bar) => {
      bar.geometry.dispose();
      (bar.material as THREE.Material).dispose();
    });
  }

  return { scene, camera, animate, dispose };
};
