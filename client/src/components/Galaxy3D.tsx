import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Photo {
  id: number;
  url: string;
  title: string;
  quote: string;
}

interface Galaxy3DProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

export default function Galaxy3D({ photos, onSelectPhoto }: Galaxy3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectPhotoRef = useRef(onSelectPhoto);

  // Mantener la referencia actualizada de la función callback para evitar recrear el efecto de Three.js
  useEffect(() => {
    selectPhotoRef.current = onSelectPhoto;
  }, [onSelectPhoto]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Configuración Básica
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050515, 0.01);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Partículas de Fondo (Polvo de Estrellas Cósmico)
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Distribución en espiral galáctica
      const r = Math.random() * 40;
      const theta = Math.random() * Math.PI * 2 + (r * 0.1); // Espiral
      const y = (Math.random() - 0.5) * (4 - r * 0.08); // Espesor decreciente hacia los bordes

      starPositions[i * 3] = Math.cos(theta) * r;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = Math.sin(theta) * r;

      // Colores de estrellas: azul cósmico, rosa, violeta, blanco
      const rand = Math.random();
      if (rand < 0.3) {
        // Azul
        starColors[i * 3] = 0.5;
        starColors[i * 3 + 1] = 0.7;
        starColors[i * 3 + 2] = 1.0;
      } else if (rand < 0.6) {
        // Rosa / Magenta
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.4;
        starColors[i * 3 + 2] = 0.8;
      } else {
        // Blanco / Amarillo
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.9;
      }
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    // Textura circular suave para las estrellas
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const starTexture = new THREE.CanvasTexture(canvas);

    const starMaterial = new THREE.PointsMaterial({
      size: 0.25,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Crear los "Nodos de Fotos" flotando en órbita
    const textureLoader = new THREE.TextureLoader();
    const photoNodes: THREE.Group[] = [];
    const photoDataList: { mesh: THREE.Mesh; photo: Photo }[] = [];

    // Crear un marco circular para las imágenes
    const createCircularTexture = (texture: THREE.Texture) => {
      // Para hacer que la foto sea circular dentro de Three.js, podemos aplicar una máscara o simplemente usar un shader
      // Para mantenerlo altamente compatible y de excelente rendimiento, crearemos un Mesh circular plano y mapearemos la textura directamente.
      return texture;
    };

    photos.forEach((photo, index) => {
      const angle = (index / photos.length) * Math.PI * 2;
      const radius = 12 + Math.random() * 3; // Distribuir en un cinturón orbital
      const heightOffset = (Math.random() - 0.5) * 3;

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(
        Math.cos(angle) * radius,
        heightOffset,
        Math.sin(angle) * radius
      );

      // Cargar la textura de la foto de Unsplash
      textureLoader.load(photo.url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        
        // Geometría de círculo plano
        const circleGeo = new THREE.CircleGeometry(1.8, 32);
        
        // Material con la textura de la foto
        const circleMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true
        });

        const photoMesh = new THREE.Mesh(circleGeo, circleMat);
        nodeGroup.add(photoMesh);

        // Añadir un borde de neón brillante detrás de la foto
        const ringGeo = new THREE.RingGeometry(1.8, 1.95, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.9, 1.0, 0.6), // Tono rosa/rojo brillante
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.z = -0.01; // Colocar ligeramente detrás
        nodeGroup.add(ringMesh);

        // Añadir un pequeño aura de luz detrás
        const glowGeo = new THREE.CircleGeometry(2.3, 32);
        const glowCanvas = document.createElement("canvas");
        glowCanvas.width = 64;
        glowCanvas.height = 64;
        const glowCtx = glowCanvas.getContext("2d");
        if (glowCtx) {
          const grad = glowCtx.createRadialGradient(32, 32, 10, 32, 32, 32);
          grad.addColorStop(0, "rgba(236,72,153,0.4)"); // Rosa
          grad.addColorStop(1, "rgba(0,0,0,0)");
          glowCtx.fillStyle = grad;
          glowCtx.fillRect(0, 0, 64, 64);
        }
        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        const glowMat = new THREE.MeshBasicMaterial({
          map: glowTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.z = -0.05;
        nodeGroup.add(glowMesh);

        // Guardar referencia del mesh principal para la detección de clics
        photoDataList.push({ mesh: photoMesh, photo });
      });

      // Datos personalizados de órbita
      nodeGroup.userData = {
        angle: angle,
        radius: radius,
        speed: 0.05 + Math.random() * 0.03, // Velocidad de órbita
        heightOffset: heightOffset,
        bobSpeed: 1 + Math.random() * 2, // Velocidad de flotación vertical
        bobHeight: 0.3 + Math.random() * 0.4
      };

      scene.add(nodeGroup);
      photoNodes.push(nodeGroup);
    });

    // 4. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const centerLight = new THREE.PointLight(0xff33aa, 5, 30);
    centerLight.position.set(0, 0, 0);
    scene.add(centerLight);

    // 5. Interacción del Mouse (Raycasting para hacer clic en las fotos)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      // Calcular la posición del mouse en coordenadas normalizadas de dispositivo (-1 a +1)
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      // Obtener los meshes que son candidatos a clics
      const meshesToIntersect = photoDataList.map(item => item.mesh);
      const intersects = raycaster.intersectObjects(meshesToIntersect);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const matched = photoDataList.find(item => item.mesh === clickedMesh);
        if (matched) {
          // Vibración táctil si es soportada
          if (navigator.vibrate) navigator.vibrate(50);
          selectPhotoRef.current(matched.photo);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // 6. Efecto Parallax sutil con el movimiento del mouse
    let targetCameraX = 0;
    let targetCameraY = 15;
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      
      targetCameraX = x * 10;
      targetCameraY = 15 - y * 10;
    };

    window.addEventListener("mousemove", onMouseMove);

    // 7. Bucle de Animación
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotar la galaxia de fondo de forma lenta
      starField.rotation.y = time * 0.02;

      // Suavizar el movimiento de la cámara (parallax)
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Actualizar la órbita de las fotos
      photoNodes.forEach((node) => {
        // Incrementar el ángulo de órbita
        node.userData.angle += node.userData.speed * delta;
        
        // Movimiento circular de órbita
        const px = Math.cos(node.userData.angle) * node.userData.radius;
        const pz = Math.sin(node.userData.angle) * node.userData.radius;
        
        // Movimiento de flotación vertical sutil (bobbing)
        const py = node.userData.heightOffset + Math.sin(time * node.userData.bobSpeed) * node.userData.bobHeight;

        node.position.set(px, py, pz);

        // Hacer que el plano de la foto siempre mire directamente a la cámara (billboarding)
        node.lookAt(camera.position);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Redimensionamiento
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
      window.removeEventListener("mousemove", onMouseMove);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      
      // Limpieza profunda de memoria
      starGeometry.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      renderer.dispose();
    };
  }, [photos]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full bg-[#050515]"
    />
  );
}
