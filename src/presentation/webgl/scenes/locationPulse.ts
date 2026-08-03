import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Ping de ubicación — usada en S4 (verificando agentes en el estado). */
export const locationPulseScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 3, -3, 0.1, 10);
  camera.position.z = 5;

  const rings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phase: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.RingGeometry(0.3 + i * 0.4, 0.32 + i * 0.4, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.6 - i * 0.12,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    rings.push({ mesh, mat, phase: i * 0.4 });
  }

  const pinGeo = new THREE.CircleGeometry(0.18, 32);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c });
  const pin = new THREE.Mesh(pinGeo, pinMat);
  scene.add(pin);

  let t = 0;

  function animate() {
    t += 0.025;
    rings.forEach(({ mesh, mat, phase }, i) => {
      const scale = 1 + 0.15 * Math.sin(t + phase);
      mesh.scale.set(scale, scale, 1);
      mat.opacity = (0.5 - i * 0.1) * (0.8 + 0.2 * Math.sin(t * 1.5 + phase));
    });
  }

  function dispose() {
    rings.forEach(({ mesh, mat }) => {
      mesh.geometry.dispose();
      mat.dispose();
    });
    pinGeo.dispose();
    pinMat.dispose();
  }

  return { scene, camera, animate, dispose };
};
