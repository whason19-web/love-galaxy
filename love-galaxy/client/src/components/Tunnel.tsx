import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Tunnel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Escena, Cámara y Renderizador
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Crear un túnel cilíndrico para el Agujero de Gusano
    // Usaremos una curva spline para que el túnel tenga curvas románticas y dinámicas
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      points.push(
        new THREE.Vector3(
          Math.sin(i * 0.4) * 1.5,
          Math.cos(i * 0.4) * 1.5,
          -i * 4
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Geometría del tubo
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 2.5, 18, false);

    // 3. Crear partículas de Corazones y Rosas flotando a lo largo del túnel
    // Generaremos partículas individuales con formas de corazones y rosas simplificadas
    const particleCount = 250;
    const particles: THREE.Group[] = [];

    // Función para crear un corazón en 3D plano
    const createHeartMesh = () => {
      const x = 0, y = 0;
      const heartShape = new THREE.Shape();
      heartShape.moveTo(x + 0.25, y + 0.25);
      heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
      heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
      heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
      heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
      heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
      heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

      const extrudeSettings = {
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };

      const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      geometry.center();
      
      // Color rojo/rosa romántico con brillo
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.95, 0.9, 0.5),
        shininess: 100,
        emissive: new THREE.Color(0x3a000d),
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      // Rotar para orientarlo
      mesh.scale.set(0.4, 0.4, 0.4);
      return mesh;
    };

    // Función para simular una rosa en 3D (esferas concéntricas o espirales rojas)
    const createRoseMesh = () => {
      const roseGroup = new THREE.Group();
      
      // Pétalos de rosa representados por múltiples planos circulares curvados
      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        const petalGeo = new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const petalMat = new THREE.MeshPhongMaterial({
          color: 0x8b0000, // Rojo carmesí profundo
          shininess: 30,
          side: THREE.DoubleSide
        });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.rotation.x = Math.PI / 2 + Math.random() * 0.5;
        petal.rotation.y = (i / petalCount) * Math.PI * 2;
        petal.position.set(
          Math.sin((i / petalCount) * Math.PI * 2) * 0.08,
          Math.cos((i / petalCount) * Math.PI * 2) * 0.08,
          Math.random() * 0.05
        );
        roseGroup.add(petal);
      }

      // Tallo verde pequeño
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
      const stemMat = new THREE.MeshPhongMaterial({ color: 0x228b22 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.z = -0.15;
      stem.rotation.x = Math.PI / 2;
      roseGroup.add(stem);

      roseGroup.scale.set(0.8, 0.8, 0.8);
      return roseGroup;
    };

    // Distribuir las partículas a lo largo del camino de la curva
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random(); // Posición a lo largo del tubo
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      
      // Crear una base perpendicular a la tangente para orbitar el tubo
      const normal = new THREE.Vector3(1, 0, 0).cross(tangent).normalize();
      const binormal = tangent.clone().cross(normal).normalize();
      
      // Ángulo aleatorio alrededor del tubo
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.5; // Distancia desde el centro del tubo

      const particleGroup = new THREE.Group();
      const isHeart = Math.random() > 0.4;
      const mesh = isHeart ? createHeartMesh() : createRoseMesh();
      
      particleGroup.add(mesh);

      // Posición final
      const posX = point.x + normal.x * Math.cos(angle) * radius + binormal.x * Math.sin(angle) * radius;
      const posY = point.y + normal.y * Math.cos(angle) * radius + binormal.y * Math.sin(angle) * radius;
      const posZ = point.z + normal.z * Math.cos(angle) * radius + binormal.z * Math.sin(angle) * radius;
      
      particleGroup.position.set(posX, posY, posZ);
      
      // Rotación aleatoria inicial
      particleGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // Guardar datos personalizados para la animación
      particleGroup.userData = {
        t: t,
        speed: 0.005 + Math.random() * 0.008, // Velocidad de viaje
        rotSpeedX: (Math.random() - 0.5) * 0.05,
        rotSpeedY: (Math.random() - 0.5) * 0.05,
        angle: angle,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
        radius: radius,
        point: point,
        normal: normal,
        binormal: binormal
      };

      scene.add(particleGroup);
      particles.push(particleGroup);
    }

    // 4. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff0055, 2, 50);
    pointLight1.position.set(0, 0, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xaa00ff, 2, 50);
    pointLight2.position.set(0, 0, -10);
    scene.add(pointLight2);

    // 5. Animación de bucle
    let cameraT = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      
      // Mover la cámara a lo largo del tubo de forma continua e hiper-veloz
      cameraT += 0.06 * delta; // Velocidad del viaje de la cámara
      if (cameraT > 1) cameraT = 0;

      const camPos = curve.getPointAt(cameraT);
      const camTarget = curve.getPointAt((cameraT + 0.02) % 1);
      
      camera.position.copy(camPos);
      camera.lookAt(camTarget);
      // Rotación sutil de la cámara para simular un vórtice
      camera.rotation.z += delta * 0.2;

      // Actualizar partículas
      particles.forEach((p) => {
        // Rotación de la partícula sobre sí misma
        p.rotation.x += p.userData.rotSpeedX;
        p.rotation.y += p.userData.rotSpeedY;

        // Hacer que las partículas viajen lentamente o floten hacia el espectador
        p.userData.t -= p.userData.speed * delta * 15;
        if (p.userData.t < 0) p.userData.t = 1;

        // Recalcular posición basándose en el nuevo t
        const pt = curve.getPointAt(p.userData.t);
        const tan = curve.getTangentAt(p.userData.t);
        const norm = new THREE.Vector3(1, 0, 0).cross(tan).normalize();
        const binorm = tan.clone().cross(norm).normalize();

        // Órbita alrededor del tubo
        p.userData.angle += p.userData.orbitSpeed;
        
        const px = pt.x + norm.x * Math.cos(p.userData.angle) * p.userData.radius + binorm.x * Math.sin(p.userData.angle) * p.userData.radius;
        const py = pt.y + norm.y * Math.cos(p.userData.angle) * p.userData.radius + binorm.y * Math.sin(p.userData.angle) * p.userData.radius;
        const pz = pt.z + norm.z * Math.cos(p.userData.angle) * p.userData.radius + binorm.z * Math.sin(p.userData.angle) * p.userData.radius;

        p.position.set(px, py, pz);

        // Escalar la partícula según la cercanía a la cámara para un efecto inmersivo
        const distToCamera = p.position.distanceTo(camera.position);
        if (distToCamera < 1) {
          // Desvanecer o achicar si está extremadamente cerca de la lente para evitar recortes bruscos
          p.scale.setScalar(distToCamera);
        } else {
          p.scale.setScalar(1);
        }
      });

      // Mover luces ligeramente
      pointLight1.position.z = camera.position.z - 2;
      pointLight2.position.z = camera.position.z - 8;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Redimensionamiento
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Limpieza de Three.js
      tubeGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full bg-black z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
