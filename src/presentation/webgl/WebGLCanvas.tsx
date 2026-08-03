"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface WebGLScene {
  scene: THREE.Scene;
  camera: THREE.Camera;
  animate: () => void;
  dispose: () => void;
}

export type SceneSetup = (width: number, height: number) => WebGLScene;

interface WebGLCanvasProps {
  sceneSetup: SceneSetup;
  className?: string;
}

/**
 * Wrapper de Three.js: fondo transparente, low-power, un solo canvas activo
 * a la vez (una pantalla de estimulación por vez). Libera renderer,
 * geometría y materiales al desmontar — riesgo #1 de fuga de memoria dado
 * que las pantallas de estimulación montan/desmontan rápido.
 */
export function WebGLCanvas({ sceneSetup, className = "" }: WebGLCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const { scene, camera, animate, dispose } = sceneSetup(width, height);

    let animId: number;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      animate();
      renderer.render(scene, camera);
    };
    loop();

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(w, h);
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [sceneSetup]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
