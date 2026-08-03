import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Tarjeta de perfil construyéndose campo a campo — usada en S5 (cierre). */
export const profileBuildScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2.5, 2.5, 3, -3, 0.1, 10);
  camera.position.z = 5;

  const cardGeo = new THREE.PlaneGeometry(2.6, 1.6);
  const cardEdges = new THREE.EdgesGeometry(cardGeo);
  const cardMat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.5 });
  const cardOutline = new THREE.LineSegments(cardEdges, cardMat);
  scene.add(cardOutline);

  const lineCount = 5;
  const lines: THREE.Mesh[] = [];
  for (let i = 0; i < lineCount; i++) {
    const geo = new THREE.PlaneGeometry(1.8, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color: 0x2db87a, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-0.3, 0.55 - i * 0.28, 0);
    mesh.scale.x = 0;
    scene.add(mesh);
    lines.push(mesh);
  }

  let t = 0;

  function animate() {
    t += 0.016;
    lines.forEach((line, i) => {
      const start = i * 0.6;
      const progress = Math.max(0, Math.min(1, (t - start) / 0.5));
      line.scale.x = progress;
      (line.material as THREE.MeshBasicMaterial).opacity = progress * 0.8;
    });
  }

  function dispose() {
    cardGeo.dispose();
    cardEdges.dispose();
    cardMat.dispose();
    lines.forEach((line) => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
  }

  return { scene, camera, animate, dispose };
};
