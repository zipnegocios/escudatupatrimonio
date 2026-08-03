import * as THREE from "three";
import type { SceneSetup } from "@/presentation/webgl/WebGLCanvas";

/** Escudo expandiéndose — usada en S2B (beneficios familiares). */
export const shieldBuildScene: SceneSetup = (width, height) => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 3, -3, 0.1, 10);
  camera.position.z = 5;

  const shape = new THREE.Shape();
  shape.moveTo(0, 1.4);
  shape.bezierCurveTo(0.9, 1.1, 1.1, 0.7, 1.1, 0.1);
  shape.bezierCurveTo(1.1, -0.7, 0.6, -1.2, 0, -1.5);
  shape.bezierCurveTo(-0.6, -1.2, -1.1, -0.7, -1.1, 0.1);
  shape.bezierCurveTo(-1.1, 0.7, -0.9, 1.1, 0, 1.4);

  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: 0x4a9fd4, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
  const shield = new THREE.Mesh(geo, mat);
  shield.scale.set(0.01, 0.01, 0.01);
  scene.add(shield);

  const edges = new THREE.EdgesGeometry(geo);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4a9fd4, transparent: true, opacity: 0.6 });
  const outline = new THREE.LineSegments(edges, lineMat);
  outline.scale.set(0.01, 0.01, 0.01);
  scene.add(outline);

  let t = 0;

  function animate() {
    t += 0.02;
    const scale = Math.min(1, t) * (1 + 0.03 * Math.sin(t * 3));
    shield.scale.set(scale, scale, scale);
    outline.scale.set(scale, scale, scale);
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
    edges.dispose();
    lineMat.dispose();
  }

  return { scene, camera, animate, dispose };
};
