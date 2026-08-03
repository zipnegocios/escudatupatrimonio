import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Flujo vertical de datos — usada en S3A (aprobación sin examen) y S3B (MIB). */
export const dataStreamScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 4, -4, 0.1, 10);
  camera.position.z = 5;

  const count = 40;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds: number[] = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 1] = Math.random() * 8 - 4;
    positions[i * 3 + 2] = 0;
    speeds.push(0.02 + Math.random() * 0.04);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.05, transparent: true, opacity: 0.7 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function animate() {
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i];
      if (pos[i * 3 + 1] < -4) pos[i * 3 + 1] = 4;
    }
    geo.attributes.position.needsUpdate = true;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
  }

  return { scene, camera, animate, dispose };
};
