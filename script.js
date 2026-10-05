/* =========================================================
   3D 360° PARTICLE HEART & METEOR SHOWER - MỸ HẰNG
   Passion Ruby-Red Palette, Fast 360° Spin, Radiant Meteors
   ========================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');
  const heartName = document.getElementById('heartName');

  let width = 0;
  let height = 0;
  let heartScale = 16;
  let dpr = 1;

  // Particle systems
  const INNER_CORE_COUNT = 4500;
  const DENSE_RIBBON_COUNT = 14000;
  const OUTER_GLITTER_COUNT = 4000;
  const AMBIENT_DUST_COUNT = 500;

  let allParticles = [];
  const sparks = [];
  const ripples = [];
  const shootingStars = [];

  // Gentle breathing state
  let time = 0;
  let beatScale = 1;

  // Faster 3D Rotation Speed & Physics
  const AUTO_SPIN_SPEED = 0.020;
  const rotation = {
    x: 0,
    y: 0,
    vx: 0,
    vy: AUTO_SPIN_SPEED,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    hasMoved: false
  };

  // Pointer state
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false
  };

  /* =========================================================
     AUDIO SYNTHESIZER: SOFT CRYSTAL CHIMES
     ========================================================= */
  let audioCtx = null;
  const chimeChords = [
    [523.25, 659.25, 783.99, 1046.50],
    [587.33, 739.99, 880.00, 1174.66],
    [659.25, 830.61, 987.77, 1318.51],
    [698.46, 880.00, 1046.50, 1396.91]
  ];
  let soundIndex = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSoftChime(xRatio = 0.5) {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const chord = chimeChords[soundIndex % chimeChords.length];
    soundIndex++;

    chord.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * (0.98 + xRatio * 0.04), now + i * 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now + i * 0.05);

      gain.gain.setValueAtTime(0.0001, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 1.15);
    });
  }

  /* =========================================================
     3D MATHEMATICAL HEART MODEL & PARTICLES
     ========================================================= */

  function heartEquation(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x, y };
  }

  function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const minDim = Math.min(width, height);
    if (width < 600) {
      heartScale = minDim / 48; // Scaled to fit screen neatly
    } else {
      heartScale = minDim / 50; // Scaled to fit screen neatly
    }

    pointer.x = width / 2;
    pointer.y = height / 2;
    pointer.targetX = width / 2;
    pointer.targetY = height / 2;
  }

  // PASSIONATE LUXURY RUBY-RED COLOR PALETTES
  const COLOR_PALETTES = [
    { name: 'diamond-white', fill: '#ffffff', alpha: 0.95 },
    { name: 'warm-rose', fill: '#ff4d73', alpha: 0.85 },
    { name: 'vivid-ruby', fill: '#ff0038', alpha: 0.88 },
    { name: 'pure-crimson', fill: '#e60033', alpha: 0.85 },
    { name: 'scarlet-velvet', fill: '#cc0029', alpha: 0.82 },
    { name: 'deep-bordeaux', fill: '#990022', alpha: 0.78 },
    { name: 'inner-crimson', fill: '#ff1a4a', alpha: 0.62 },
    { name: 'inner-warm-red', fill: '#ff3366', alpha: 0.52 }
  ];

  function initDenseParticles() {
    allParticles = [];

    // 1. INNER CORE 3D STARDUST (4,500 particles in soft crimson/ruby red)
    for (let i = 0; i < INNER_CORE_COUNT; i++) {
      const t = Math.PI * 2 * Math.random();
      const pos = heartEquation(t);
      const r = Math.pow(Math.random(), 0.6) * 0.70 + 0.04;
      const zDepth = (Math.random() - 0.5) * 12 * (1 - r * 0.5);

      let colorIndex;
      const rand = Math.random();
      if (rand < 0.18) colorIndex = 0;      // White glitter
      else if (rand < 0.50) colorIndex = 7; // Inner warm red
      else colorIndex = 6;                  // Inner crimson

      allParticles.push({
        baseX: pos.x * r,
        baseY: pos.y * r,
        baseZ: zDepth,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        projSize: 1,
        size: Math.random() * 1.3 + 0.4,
        colorIndex: colorIndex,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
        drift: Math.random() * 1.8 + 0.4,
        type: 'inner'
      });
    }

    // 2. DENSE 3D RIBBON BAND (14,000 particles in intense Ruby/Crimson Red)
    for (let i = 0; i < DENSE_RIBBON_COUNT; i++) {
      const t = Math.PI * 2 * Math.random();
      const pos = heartEquation(t);

      let r = gaussianRandom(0.88, 0.09);
      if (r < 0.65) r = 0.65 + Math.random() * 0.05;
      if (r > 1.25) r = 1.25 - Math.random() * 0.05;

      const crossAngle = Math.random() * Math.PI * 2;
      const zDepth = Math.sin(crossAngle) * 7.5 * (Math.abs(Math.sin(t)) * 0.7 + 0.3);

      let colorIndex;
      const rand = Math.random();
      if (rand < 0.20) {
        colorIndex = 0; // Pure white diamond sparkle
      } else if (rand < 0.38) {
        colorIndex = 1; // Warm rose red
      } else if (rand < 0.68) {
        colorIndex = 2; // Vivid ruby red (#ff0038)
      } else if (rand < 0.86) {
        colorIndex = 3; // Pure crimson (#e60033)
      } else if (rand < 0.95) {
        colorIndex = 4; // Scarlet velvet (#cc0029)
      } else {
        colorIndex = 5; // Deep bordeaux (#990022)
      }

      allParticles.push({
        baseX: pos.x * r,
        baseY: pos.y * r,
        baseZ: zDepth,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        projSize: 1,
        size: Math.random() * 1.6 + 0.6,
        colorIndex: colorIndex,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.018 + 0.008,
        drift: Math.random() * 2.2 + 0.5,
        type: 'ribbon'
      });
    }

    // 3. 3D OUTER CLOUD & HALO (4,000 particles in Ruby Red glow)
    for (let i = 0; i < OUTER_GLITTER_COUNT; i++) {
      const t = Math.PI * 2 * Math.random();
      const pos = heartEquation(t);
      const spread = Math.random() * 85 + 10;
      const angle = Math.random() * Math.PI * 2;
      const zDepth = (Math.random() - 0.5) * 45;

      let colorIndex = Math.random() > 0.4 ? 2 : (Math.random() > 0.5 ? 1 : 0);

      allParticles.push({
        origX: pos.x * 0.95 + Math.cos(angle) * spread,
        origY: pos.y * 0.95 + Math.sin(angle) * spread,
        origZ: zDepth,
        x: 0,
        y: 0,
        z: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2 - 0.06,
        size: Math.random() * 1.4 + 0.4,
        projSize: 1,
        colorIndex: colorIndex,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.025 + 0.01,
        type: 'halo'
      });
    }

    // 4. AMBIENT BACKGROUND STARDUST (500 particles)
    for (let i = 0; i < AMBIENT_DUST_COUNT; i++) {
      allParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.3,
        colorIndex: Math.random() > 0.5 ? 0 : 1,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        type: 'dust'
      });
    }
  }

  // CONTINUOUS METEOR SHOWER GENERATOR
  function spawnShootingStars() {
    if (shootingStars.length < 7 && Math.random() < 0.14) {
      const startOnTop = Math.random() > 0.4;
      const startX = startOnTop ? Math.random() * width * 0.85 : 0;
      const startY = startOnTop ? 0 : Math.random() * height * 0.5;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35;
      const speed = Math.random() * 12 + 10;

      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 140 + 90,
        speed: speed,
        angle: angle,
        alpha: 1,
        fade: Math.random() * 0.018 + 0.012,
        thickness: Math.random() * 2.2 + 1.2,
        color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#ff4d73' : '#ffd9e0')
      });
    }
  }

  function getGentleBreath(t) {
    const freq = t * 0.022;
    const pulse = Math.sin(freq) * 0.028 + Math.sin(freq * 2) * 0.012;
    return 1 + pulse;
  }

  function createSoftBurst(x, y, count = 45) {
    const colors = ['#ffffff', '#ff0038', '#ff1a4a', '#e60033', '#ff4d73'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.2 + 0.8,
        alpha: 1,
        decay: Math.random() * 0.022 + 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        isHeart: Math.random() > 0.65,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08
      });
    }

    ripples.push({
      x: x,
      y: y,
      radius: 4,
      maxRadius: Math.min(width, height) * 0.45,
      opacity: 0.7,
      speed: 7
    });
  }

  function drawMiniHeart(c, x, y, size, color, alpha, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(size / 10, size / 10);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-5, -5, -10, 2, 0, 10);
    c.bezierCurveTo(10, 2, 5, -5, 0, 0);
    c.fillStyle = color;
    c.globalAlpha = alpha;
    c.fill();
    c.restore();
  }

  /* =========================================================
     3D RENDERING & ANIMATION PIPELINE
     ========================================================= */

  function update() {
    time += 1;
    beatScale = getGentleBreath(time);

    spawnShootingStars();

    if (!rotation.isDragging) {
      rotation.y += rotation.vy;
      rotation.x += rotation.vx;
      rotation.vx *= 0.94;
      rotation.vy = rotation.vy * 0.96 + AUTO_SPIN_SPEED * 0.04;
    }

    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);

    if (heartName) {
      const textScale = (beatScale - 1) * 0.45 + 1;
      const tiltX = -rotation.x * 22;
      const tiltY = Math.sin(rotation.y) * 16;
      heartName.style.transform = `scale(${textScale}) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;

    const centerX = width / 2;
    const centerY = height / 2;
    const curScale = heartScale * beatScale;
    const cameraFov = 750;

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= s.fade;
      if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
        shootingStars.splice(i, 1);
      }
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.opacity = 1 - (r.radius / r.maxRadius);
      if (r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    for (let i = 0; i < allParticles.length; i++) {
      const p = allParticles[i];

      if (p.type === 'ribbon' || p.type === 'inner') {
        p.angle += p.speed;
        const driftX = Math.sin(p.angle) * p.drift;
        const driftY = Math.cos(p.angle) * p.drift;

        const x0 = (p.baseX + driftX) * curScale;
        const y0 = (p.baseY + driftY) * curScale;
        const z0 = p.baseZ * curScale;

        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;
        const y1 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        const fovScale = cameraFov / (cameraFov + z2);
        const targetScreenX = centerX + x1 * fovScale;
        const targetScreenY = centerY + y1 * fovScale;

        const dx = targetScreenX - pointer.x;
        const dy = targetScreenY - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 115 && pointer.isHovered && !rotation.isDragging) {
          const force = (1 - dist / 115) * 2.2;
          const angle = Math.atan2(dy, dx) + Math.PI / 2.2;
          p.vx += Math.cos(angle) * force * 1.2;
          p.vy += Math.sin(angle) * force * 1.2;
        }

        for (let j = 0; j < ripples.length; j++) {
          const rp = ripples[j];
          const rdx = targetScreenX - rp.x;
          const rdy = targetScreenY - rp.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const diff = Math.abs(rdist - rp.radius);

          if (diff < 35) {
            const rForce = (1 - diff / 35) * 8 * rp.opacity;
            const rAngle = Math.atan2(rdy, rdx);
            p.vx += Math.cos(rAngle) * rForce;
            p.vy += Math.sin(rAngle) * rForce;
          }
        }

        p.vx *= 0.90;
        p.vy *= 0.90;

        p.x = targetScreenX + p.vx;
        p.y = targetScreenY + p.vy;
        p.z = z2;
        p.projSize = Math.max(0.3, p.size * fovScale);
      } else if (p.type === 'halo') {
        p.phase += p.twinkleSpeed;
        p.origX += p.vx;
        p.origY += p.vy;

        const x0 = p.origX;
        const y0 = p.origY;
        const z0 = p.origZ;

        const x1 = x0 * cosY - z0 * sinY;
        const z1 = x0 * sinY + z0 * cosY;
        const y1 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        const fovScale = cameraFov / (cameraFov + z2);
        p.x = centerX + x1 * fovScale;
        p.y = centerY + y1 * fovScale;
        p.z = z2;
        p.projSize = Math.max(0.2, p.size * fovScale);
      } else if (p.type === 'dust') {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.twinkleSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        p.projSize = p.size;
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.04;
      s.vx *= 0.96;
      s.vy *= 0.96;
      s.rot += s.vRot;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        sparks.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter';

    // 1. Draw Shooting Stars / Meteors
    for (let i = 0; i < shootingStars.length; i++) {
      const s = shootingStars[i];
      const tailX = s.x - Math.cos(s.angle) * s.length;
      const tailY = s.y - Math.sin(s.angle) * s.length;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, `rgba(255, 120, 150, ${s.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.thickness;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.thickness * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.fill();
    }

    // 2. Soft & Subtle Inner Crimson Aura
    const centerX = width / 2;
    const centerY = height / 2;
    const curScale = heartScale * beatScale;

    const coreGrad = ctx.createRadialGradient(centerX, centerY - 6 * curScale, 2, centerX, centerY, 15 * curScale);
    coreGrad.addColorStop(0, 'rgba(255, 20, 60, 0.08)');
    coreGrad.addColorStop(0.6, 'rgba(200, 0, 40, 0.02)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Draw Shockwave Ripples
    for (let i = 0; i < ripples.length; i++) {
      const rp = ripples[i];
      const grad = ctx.createRadialGradient(rp.x, rp.y, Math.max(0, rp.radius - 15), rp.x, rp.y, rp.radius);
      grad.addColorStop(0, 'rgba(255, 0, 56, 0)');
      grad.addColorStop(0.7, `rgba(255, 0, 56, ${rp.opacity * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 4. Batch Render 3D Particles (Ruby-Red Velvet Palette)
    for (let c = 0; c < COLOR_PALETTES.length; c++) {
      const palette = COLOR_PALETTES[c];
      ctx.fillStyle = palette.fill;
      ctx.globalAlpha = palette.alpha;

      ctx.beginPath();
      for (let i = 0; i < allParticles.length; i++) {
        const p = allParticles[i];
        if (p.colorIndex === c) {
          ctx.moveTo(p.x + p.projSize, p.y);
          ctx.arc(p.x, p.y, p.projSize, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }

    // 5. Draw Sparks & Mini Hearts
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      if (s.isHeart) {
        drawMiniHeart(ctx, s.x, s.y, s.size * 3.2, s.color, s.alpha, s.rot);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  /* =========================================================
     360° DRAG & TOUCH ROTATION HANDLERS
     ========================================================= */

  let lastSparkX = 0;
  let lastSparkY = 0;

  function spawnCursorSparks(x, y) {
    const dist = Math.hypot(x - lastSparkX, y - lastSparkY);
    if (dist > 14) {
      const count = Math.min(2, Math.floor(dist / 10));
      for (let i = 0; i < count; i++) {
        sparks.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4,
          size: Math.random() * 1.8 + 0.8,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          color: Math.random() > 0.5 ? '#ff0038' : '#ffffff',
          isHeart: Math.random() > 0.7,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08
        });
      }
      lastSparkX = x;
      lastSparkY = y;
    }
  }

  function onPointerDown(e) {
    const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : width / 2);
    const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : height / 2);

    rotation.isDragging = true;
    rotation.startX = x;
    rotation.startY = y;
    rotation.lastX = x;
    rotation.lastY = y;
    rotation.hasMoved = false;

    pointer.targetX = x;
    pointer.targetY = y;
    pointer.isHovered = true;
  }

  function onPointerMove(e) {
    const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : width / 2);
    const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : height / 2);

    pointer.targetX = x;
    pointer.targetY = y;
    pointer.isHovered = true;

    if (rotation.isDragging) {
      const dx = x - rotation.lastX;
      const dy = y - rotation.lastY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        rotation.hasMoved = true;
      }

      const sensitivity = 0.012;
      rotation.y += dx * sensitivity;
      rotation.x += dy * sensitivity;

      rotation.vy = dx * sensitivity * 0.8;
      rotation.vx = dy * sensitivity * 0.8;

      rotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, rotation.x));

      rotation.lastX = x;
      rotation.lastY = y;
    }

    spawnCursorSparks(x, y);
  }

  function onPointerUp(e) {
    if (!rotation.hasMoved) {
      const x = rotation.startX || width / 2;
      const y = rotation.startY || height / 2;
      playSoftChime(x / width);
      createSoftBurst(x, y, 45);
    }

    rotation.isDragging = false;
  }

  window.addEventListener('resize', () => {
    resize();
    initDenseParticles();
  });

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('mouseleave', () => {
    rotation.isDragging = false;
    pointer.isHovered = false;
  });

  window.addEventListener('touchstart', (e) => {
    onPointerDown(e);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    onPointerMove(e);
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    onPointerUp(e);
  }, { passive: false });

  window.addEventListener('contextmenu', (e) => e.preventDefault());

  // Launch
  resize();
  initDenseParticles();
  loop();
})();
