import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Cruz médica pulsando — usada en S2C (gastos médicos). */
export const medicalCrossScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 3, -3, 0.1, 10);
  camera.position.z = 5;

  const shape = new THREE.Shape();
  const w = 0.35;
  const l = 1.1;
  shape.moveTo(-w / 2, -l / 2);
  shape.lineTo(w / 2, -l / 2);
  shape.lineTo(w / 2, -w / 2);
  shape.lineTo(l / 2, -w / 2);
  shape.lineTo(l / 2, w / 2);
  shape.lineTo(w / 2, w / 2);
  shape.lineTo(w / 2, l / 2);
  shape.lineTo(-w / 2, l / 2);
  shape.lineTo(-w / 2, w / 2);
  shape.lineTo(-l / 2, w / 2);
  shape.lineTo(-l / 2, -w / 2);
  shape.lineTo(-w / 2, -w / 2);
  shape.lineTo(-w / 2, -l / 2);

  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: 0x4a9fd4, transparent: true, opacity: 0.85 });
  const cross = new THREE.Mesh(geo, mat);
  scene.add(cross);

  let t = 0;

  function animate() {
    t += 0.03;
    const scale = 1 + 0.08 * Math.sin(t * 2);
    cross.scale.set(scale, scale, 1);
    mat.opacity = 0.6 + 0.25 * Math.sin(t * 2);
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
  }

  return { scene, camera, animate, dispose };
};
