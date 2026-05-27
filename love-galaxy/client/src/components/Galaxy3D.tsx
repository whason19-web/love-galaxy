import { useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

// Frases pequeñas dispersas en la galaxia
const GALAXY_PHRASES = [
  "te quiero", "mi amor", "para siempre", "infinito ∞", "eres mi mundo",
  "nuestros sueños", "contigo todo", "alma gemela", "mi universo",
  "latido a latido", "siempre juntos", "te extraño", "mi estrella",
  "amor eterno", "cada instante", "tu sonrisa", "corazón mío",
  "te necesito", "mi hogar eres tú", "brillas en mí",
];

export default function Galaxy3D({ photos, onSelectPhoto }: Galaxy3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef   = useRef(onSelectPhoto);
  useEffect(() => { onSelectRef.current = onSelectPhoto; }, [onSelectPhoto]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Escena ──────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.4;
    camera.position.set(20, 18, 20);
    camera.lookAt(0, 0, 0);

    const clock = new THREE.Clock();

    // ── Textura de partícula ────────────────────────────────
    const particleTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(32,32,0,32,32,32);
      g.addColorStop(0,"rgba(255,255,255,1)");
      g.addColorStop(0.3,"rgba(255,255,255,0.6)");
      g.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0,0,64,64);
      return new THREE.CanvasTexture(c);
    })();

    // ── Galaxia espiral ─────────────────────────────────────
    const gCount = 50000;
    const gGeo   = new THREE.BufferGeometry();
    const gPos   = new Float32Array(gCount * 3);
    const gCol   = new Float32Array(gCount * 3);
    const cIn    = new THREE.Color("#ff69b4");
    const cOut   = new THREE.Color("#4b0082");
    for (let i = 0; i < gCount; i++) {
      const i3 = i * 3, r = Math.random() * 20;
      const branch = (i % 3) / 3 * Math.PI * 2, spin = r;
      const rx = Math.pow(Math.random(),3)*(Math.random()<.5?1:-1)*.2*r;
      const ry = Math.pow(Math.random(),3)*(Math.random()<.5?1:-1)*.2*r;
      const rz = Math.pow(Math.random(),3)*(Math.random()<.5?1:-1)*.2*r;
      gPos[i3]   = Math.cos(branch+spin)*r + rx;
      gPos[i3+1] = ry;
      gPos[i3+2] = Math.sin(branch+spin)*r + rz;
      const mc = cIn.clone().lerp(cOut, r/20);
      gCol[i3]=mc.r; gCol[i3+1]=mc.g; gCol[i3+2]=mc.b;
    }
    gGeo.setAttribute("position", new THREE.BufferAttribute(gPos,3));
    gGeo.setAttribute("color",    new THREE.BufferAttribute(gCol,3));
    const galaxyPoints = new THREE.Points(gGeo, new THREE.PointsMaterial({
      size:.1, sizeAttenuation:true, depthWrite:false,
      blending:THREE.AdditiveBlending, vertexColors:true, transparent:true, map:particleTex
    }));
    scene.add(galaxyPoints);

    // Núcleo
    const core = new THREE.Mesh(new THREE.SphereGeometry(.8,32,32),
      new THREE.MeshBasicMaterial({color:0xffaa00,transparent:true,opacity:.8}));
    scene.add(core);
    const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(1.5,32,32),
      new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:.3,blending:THREE.AdditiveBlending}));
    scene.add(coreGlow);

    // ── Corazón de partículas ───────────────────────────────
    const heartYOffset = 15;
    const hCount = 10000;
    const hGeo   = new THREE.BufferGeometry();
    const hPos   = new Float32Array(hCount*3);
    const hCol   = new Float32Array(hCount*3);
    for (let i = 0; i < hCount; i++) {
      const i3=i*3, t=Math.random()*Math.PI*2, rr=.5+Math.random()*.5;
      const x=16*Math.pow(Math.sin(t),3);
      const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
      hPos[i3]=x*.3*rr; hPos[i3+1]=y*.3*rr+heartYOffset; hPos[i3+2]=(Math.random()-.5)*2;
      hCol[i3]=1; hCol[i3+1]=.07; hCol[i3+2]=.6;
    }
    hGeo.setAttribute("position", new THREE.BufferAttribute(hPos,3));
    hGeo.setAttribute("color",    new THREE.BufferAttribute(hCol,3));
    const heartPoints = new THREE.Points(hGeo, new THREE.PointsMaterial({
      size:.15, sizeAttenuation:true, depthWrite:false,
      blending:THREE.AdditiveBlending, vertexColors:true, transparent:true, map:particleTex
    }));
    scene.add(heartPoints);

    // ── Túnel energético ────────────────────────────────────
    const tCount = 2000;
    const tGeo   = new THREE.BufferGeometry();
    const tPos   = new Float32Array(tCount*3);
    const tSpd   = new Float32Array(tCount);
    for (let i = 0; i < tCount; i++) {
      const i3=i*3, a=Math.random()*Math.PI*2, r=Math.random()*.5;
      tPos[i3]=Math.cos(a)*r; tPos[i3+1]=Math.random()*heartYOffset; tPos[i3+2]=Math.sin(a)*r;
      tSpd[i]=.05+Math.random()*.1;
    }
    tGeo.setAttribute("position", new THREE.BufferAttribute(tPos,3));
    const tunnelPoints = new THREE.Points(tGeo, new THREE.PointsMaterial({
      size:.05, color:0xff69b4, transparent:true, opacity:.6,
      blending:THREE.AdditiveBlending, map:particleTex
    }));
    scene.add(tunnelPoints);

    // ── Frases pequeñas esparcidas ──────────────────────────
    const makeTextSprite = (text: string, color: string) => {
      const c = document.createElement("canvas"); c.width=512; c.height=80;
      const ctx = c.getContext("2d")!;
      ctx.font = "italic 22px Georgia";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowBlur = 12; ctx.shadowColor = color;
      ctx.fillStyle = color; ctx.globalAlpha = 0.75;
      ctx.fillText(text, 256, 40);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), transparent:true, depthWrite:false
      }));
      sp.scale.set(6,1,1);
      return sp;
    };

    const scatteredPhrases: THREE.Sprite[] = [];
    GALAXY_PHRASES.forEach((phrase, i) => {
      const sp = makeTextSprite(phrase, i%2===0 ? "#ff69b4" : "#c084fc");
      const angle  = (i/GALAXY_PHRASES.length)*Math.PI*2 + Math.random()*1.5;
      const radius = 5 + Math.random()*17;
      const height = (Math.random()-.5)*14;
      sp.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius);
      sp.userData = { angle, radius, height, speed:(0.05+Math.random()*.15)*(Math.random()<.5?1:-1) };
      scene.add(sp);
      scatteredPhrases.push(sp);
    });

    // ── Burbujas con fotos ──────────────────────────────────
    const makePlaceholder = () => {
      const c = document.createElement("canvas"); c.width=c.height=256;
      const ctx = c.getContext("2d")!;
      ctx.beginPath(); ctx.arc(128,128,124,0,Math.PI*2); ctx.clip();
      const g = ctx.createRadialGradient(128,128,0,128,128,128);
      g.addColorStop(0,"#ff1493"); g.addColorStop(1,"#800080");
      ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
      ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.font="bold 90px Arial";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("🩷",128,140);
      return c;
    };

    const bubbles: THREE.Group[]  = [];
    const hitMeshes: THREE.Mesh[] = [];

    photos.forEach((photo, i) => {
      const group = new THREE.Group();

      // Sprite placeholder → foto real
      const phTex  = new THREE.CanvasTexture(makePlaceholder());
      const spMat  = new THREE.SpriteMaterial({map:phTex, transparent:true, depthWrite:false});
      const sprite = new THREE.Sprite(spMat);
      sprite.scale.set(3.2,3.2,1);
      group.add(sprite);

      if (photo.url && !photo.url.includes("unsplash") === false || photo.url) {
        const img = new Image(); img.crossOrigin="anonymous";
        img.onload = () => {
          const c=document.createElement("canvas"); c.width=c.height=256;
          const ctx=c.getContext("2d")!;
          ctx.beginPath(); ctx.arc(128,128,124,0,Math.PI*2); ctx.clip();
          const s=Math.min(img.width,img.height);
          ctx.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,256,256);
          ctx.strokeStyle="rgba(255,105,180,0.9)"; ctx.lineWidth=8;
          ctx.beginPath(); ctx.arc(128,128,120,0,Math.PI*2); ctx.stroke();
          const gl=ctx.createRadialGradient(128,128,80,128,128,124);
          gl.addColorStop(0,"rgba(255,255,255,0)");
          gl.addColorStop(1,"rgba(255,182,193,0.25)");
          ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(128,128,124,0,Math.PI*2); ctx.fill();
          spMat.map = new THREE.CanvasTexture(c); spMat.needsUpdate=true;
        };
        img.src = photo.url;
      }

      // Anillos decorativos
      ([[ 1.7, .05, 0xff69b4, .7 ],
        [ 2.05, .03, 0xffffff, .25],
        [ 2.35, .02, 0xcc44ff, .2 ]] as [number,number,number,number][])
      .forEach(([r,tube,color,op]) => {
        group.add(new THREE.Mesh(
          new THREE.TorusGeometry(r,tube,16,100),
          new THREE.MeshBasicMaterial({color,transparent:true,opacity:op})
        ));
      });

      // Esfera invisible para raycasting
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(1.8,12,12),
        new THREE.MeshBasicMaterial({transparent:true,opacity:0})
      );
      hit.userData = { photoIndex: i };
      group.add(hit);
      hitMeshes.push(hit);

      const angle  = (i/photos.length)*Math.PI*2;
      const radius = 11 + Math.random()*6;
      const height = (Math.random()-.5)*10;
      group.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius);
      group.userData = { angle, radius, height, speed:.2+Math.random()*.3 };

      scene.add(group);
      bubbles.push(group);
    });

    // ── Raycasting ──────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer   = new THREE.Vector2();

    const checkClick = (cx: number, cy: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((cx-rect.left)/rect.width)*2-1, -((cy-rect.top)/rect.height)*2+1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitMeshes);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.photoIndex as number;
        onSelectRef.current(photos[idx]);
        controls.autoRotate = false;
        setTimeout(() => { controls.autoRotate = true; }, 4000);
      }
    };

    renderer.domElement.addEventListener("click",   e => checkClick(e.clientX, e.clientY));
    renderer.domElement.addEventListener("touchend", e => {
      e.preventDefault();
      checkClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }, { passive: false });

    // ── Loop de animación ───────────────────────────────────
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      galaxyPoints.rotation.y = t * .05;

      const hs = 1+Math.sin(t*4)*.1;
      heartPoints.scale.set(hs,hs,hs);

      const tp = tunnelPoints.geometry.attributes.position.array as Float32Array;
      for (let i=0; i<tCount; i++) {
        tp[i*3+1] += tSpd[i];
        if (tp[i*3+1] > heartYOffset-2) tp[i*3+1] = 0;
      }
      tunnelPoints.geometry.attributes.position.needsUpdate = true;

      bubbles.forEach(b => {
        b.userData.angle += b.userData.speed * .01;
        b.position.x = Math.cos(b.userData.angle)*b.userData.radius;
        b.position.z = Math.sin(b.userData.angle)*b.userData.radius;
        b.position.y = b.userData.height + Math.sin(t+b.userData.angle)*.6;
        b.children.forEach((c:any) => {
          if (c.isMesh && c.geometry?.type === "TorusGeometry") c.rotation.x = t*.5;
        });
      });

      scatteredPhrases.forEach(sp => {
        sp.userData.angle += sp.userData.speed * .01;
        sp.position.x = Math.cos(sp.userData.angle)*sp.userData.radius;
        sp.position.z = Math.sin(sp.userData.angle)*sp.userData.radius;
        sp.position.y = sp.userData.height + Math.sin(t*.4+sp.userData.angle)*.8;
      });

      coreGlow.scale.setScalar(1+Math.sin(t*2)*.2);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──────────────────────────────────────────────
    const onResize = () => {
      const w=container.clientWidth, h=container.clientHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [photos]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black" />;
}
