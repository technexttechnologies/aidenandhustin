// Three.js 3D interlocking watch gear loading screen

function initLoader(onCompleteCallback) {
  const container = document.querySelector('.loader-composition');
  const canvas = document.getElementById('loader-canvas');
  const percentEl = document.getElementById('loader-percentage');
  const overlayEl = document.getElementById('loader-overlay');
  
  if (!canvas || !container) {
    // Fail-safe if webgl canvas is not loaded
    simulateLoading(onCompleteCallback);
    return;
  }

  // 1. Setup Three.js Scene
  const rect = container.getBoundingClientRect();
  const width = rect.width || 300;
  const height = rect.height || 300;

  const scene = new THREE.Scene();
  scene.background = null; // transparent

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 22;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Add Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xfff3d1, 1.8); // warm light
  dirLight1.position.set(5, 5, 10);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6); // cool highlight
  dirLight2.position.set(-5, -5, 5);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(0xc9a96e, 2, 50); // gold point glow
  pointLight.position.set(0, 0, 2);
  scene.add(pointLight);

  // 3. Procedural Gear Generation Function
  function createGearGeometry(innerRadius, outerRadius, thickness, toothCount) {
    const shape = new THREE.Shape();
    const toothDepth = outerRadius - innerRadius;
    const steps = toothCount * 2;
    const angleStep = (Math.PI * 2) / steps;

    for (let i = 0; i <= steps; i++) {
      const angle = i * angleStep;
      // Alternate between outer teeth and inner valley
      const radius = (i % 2 === 0) ? outerRadius : innerRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    // Add center shaft hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius * 0.35, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    // Extrude 2D shape into 3D mesh
    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.15,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  // 4. Create Metallic Materials
  const goldMaterial = new THREE.MeshPhongMaterial({
    color: 0xC9A96E,
    specular: 0xffffff,
    shininess: 90,
    flatShading: false
  });

  const silverMaterial = new THREE.MeshPhongMaterial({
    color: 0x8A8A8A,
    specular: 0xffffff,
    shininess: 120,
    flatShading: false
  });

  const bronzeMaterial = new THREE.MeshPhongMaterial({
    color: 0x966042,
    specular: 0xaaaaaa,
    shininess: 70,
    flatShading: false
  });

  // 5. Build Interlocking Gears (Center, Left-Bottom, Right-Top)
  const gearGroup = new THREE.Group();

  // Gear 1: Center Gold Gear
  const geo1 = createGearGeometry(4.0, 4.6, 0.8, 18);
  geo1.center();
  const gearCenter = new THREE.Mesh(geo1, goldMaterial);
  gearCenter.position.set(0, 0, 0);
  gearGroup.add(gearCenter);

  // Gear 2: Left-Bottom Silver Gear (Interlocks with center)
  const geo2 = createGearGeometry(2.0, 2.4, 0.6, 10);
  geo2.center();
  const gearLeft = new THREE.Mesh(geo2, silverMaterial);
  // Position to touch main gear: sum of average radii minus tooth overlap
  gearLeft.position.set(-5.6, -3.2, -0.4);
  gearGroup.add(gearLeft);

  // Gear 3: Right-Top Bronze Gear (Interlocks with center)
  const geo3 = createGearGeometry(2.5, 2.9, 0.6, 12);
  geo3.center();
  const gearRight = new THREE.Mesh(geo3, bronzeMaterial);
  gearRight.position.set(5.1, 4.2, -0.2);
  gearGroup.add(gearRight);

  scene.add(gearGroup);

  // Tilt the entire gear assembly slightly for dynamic isometric feel
  gearGroup.rotation.x = 0.55;
  gearGroup.rotation.y = -0.45;

  // 6. Animation and Frame Loop
  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Rotate gears (interlocking direction swaps) - slower, premium speed
    gearCenter.rotation.z += 0.003;
    gearLeft.rotation.z -= 0.0054;
    gearRight.rotation.z -= 0.0045;
    
    renderer.render(scene, camera);
  }

  // Set initial states
  gsap.set(canvas, { opacity: 0, scale: 0.85 });
  gsap.set('.loader-logo-wrap', { opacity: 0, scale: 0.85 });
  gsap.set('.loader-logo-img', { filter: 'drop-shadow(0 0 0px rgba(201, 169, 110, 0))' });
  gsap.set('.loader-brand-name', { opacity: 0, y: 15 });
  gsap.set(percentEl, { opacity: 0 });

  animate();

  // Create entrance timeline
  const entryTl = gsap.timeline({
    onComplete: startLoading
  });

  // 1. Premium logo reveal with luxury fade-in
  entryTl.to('.loader-logo-wrap', {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: 'power3.out'
  });

  // 2. Luxury glow effect on logo
  entryTl.to('.loader-logo-img', {
    filter: 'drop-shadow(0 0 15px rgba(201, 169, 110, 0.5))',
    duration: 1.0,
    ease: 'power2.out'
  }, '-=0.5');

  // 3. Animated watch gear rotation fade-in
  entryTl.to(canvas, {
    opacity: 0.8,
    scale: 1,
    duration: 1.5,
    ease: 'power3.out'
  }, '-=0.8');

  // 4. Fade in progress indicator
  entryTl.to(percentEl, {
    opacity: 0.7,
    duration: 0.8
  }, '-=0.8');

  // Start progress sequence after entrance completes
  function startLoading() {
    // Add pulsing gold hover/loop glow effect
    gsap.to('.loader-logo-img', {
      filter: 'drop-shadow(0 0 25px rgba(201, 169, 110, 0.65))',
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });

    let progress = 0;
    const loadInterval = setInterval(() => {
      let increment = Math.floor(Math.random() * 8) + 2;
      if (progress > 80) increment = Math.floor(Math.random() * 3) + 1;
      
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadInterval);
        percentEl.textContent = "100%";
        
        // Play final text reveal and fade out transition
        dismissLoader();
      } else {
        percentEl.textContent = progress.toString().padStart(2, '0') + "%";
      }
    }, 80);
  }

  function dismissLoader() {
    const exitTl = gsap.timeline({
      onComplete: () => {
        cancelAnimationFrame(animationFrameId);
        overlayEl.remove();
        if (typeof onCompleteCallback === 'function') onCompleteCallback();
      }
    });

    // 5. Elegant text reveal for brand name
    exitTl.to('.loader-brand-name', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out'
    });

    // Pause slightly on complete state
    exitTl.to({}, { duration: 0.6 });

    // 6. Smooth fade transition into hero section
    exitTl.to(overlayEl, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut'
    });
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    const r = container.getBoundingClientRect();
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height);
  });
}

// Fail-safe simple loader fallback
function simulateLoading(callback) {
  const percentEl = document.getElementById('loader-percentage');
  const overlayEl = document.getElementById('loader-overlay');
  let progress = 0;
  
  gsap.set('.loader-logo-wrap', { opacity: 0, scale: 0.85 });
  gsap.set('.loader-brand-name', { opacity: 0, y: 15 });
  gsap.set(percentEl, { opacity: 0 });

  const entryTl = gsap.timeline({
    onComplete: () => {
      const interval = setInterval(() => {
        progress += 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          percentEl.textContent = "100%";
          
          const exitTl = gsap.timeline({
            onComplete: () => {
              overlayEl.remove();
              if (callback) callback();
            }
          });

          exitTl.to('.loader-brand-name', { opacity: 1, y: 0, duration: 0.8 });
          exitTl.to({}, { duration: 0.4 });
          exitTl.to(overlayEl, {
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut'
          });
        } else {
          percentEl.textContent = progress.toString().padStart(2, '0') + "%";
        }
      }, 50);
    }
  });

  entryTl.to('.loader-logo-wrap', { opacity: 1, scale: 1, duration: 1.0 });
  entryTl.to(percentEl, { opacity: 0.7, duration: 0.6 }, '-=0.4');
}

// Export / Make globally available
window.initLoader = initLoader;
