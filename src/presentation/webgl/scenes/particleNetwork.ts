import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Red de partículas doradas conectadas — usada en S1. */
export const particleNetworkScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 5;

  const count = 60;
  const particles = Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 12,
    z: (Math.random() - 0.5) * 3,
    vx: (Math.random() - 0.5) * 0.005,
    vy: (Math.random() - 0.5) * 0.005,
  }));

  const geo = new THREE.BufferGeometry();
  const posArr = new Float32Array(count * 3);
  particles.forEach((p, i) => {
    posArr[i * 3] = p.x;
    posArr[i * 3 + 1] = p.y;
    posArr[i * 3 + 2] = p.z;
  });
  geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));

  const mat = new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.06, transparent: true, opacity: 0.7 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const lineMat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.15 });
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(count * count * 6);
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const DIST = 2.5;

  function animate() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (Math.abs(p.x) > 4) p.vx *= -1;
      if (Math.abs(p.y) > 6) p.vy *= -1;
    });
    const pos = geo.attributes.position.array as Float32Array;
    particles.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });
    geo.attributes.position.needsUpdate = true;

    let li = 0;
    const lp = lineGeo.attributes.position.array as Float32Array;
    for (let a = 0; a < count; a++) {
      for (let b = a + 1; b < count; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < DIST) {
          lp[li++] = particles[a].x;
          lp[li++] = particles[a].y;
          lp[li++] = particles[a].z;
          lp[li++] = particles[b].x;
          lp[li++] = particles[b].y;
          lp[li++] = particles[b].z;
        } else {
          lp[li++] = 0;
          lp[li++] = 0;
          lp[li++] = 0;
          lp[li++] = 0;
          lp[li++] = 0;
          lp[li++] = 0;
        }
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    points.rotation.y += 0.001;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
  }

  return { scene, camera, animate, dispose };
};
