const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

// --- Web Audio API ---
let audioCtx = null;
let audioContextResumed = false;

// --- Переменные для Delta Time и FPS ---
let lastTime = 0;
const targetFPS = 60;
let lastFrameTime = 0;

// --- Параметры фаз и перехода ---
let phaseStartTime = 0;
const phaseDuration = 10000; // 10 секунд в каждой фазе
const transitionDuration = 5000; // 5 секунд перехода
const totalCycleDuration = phaseDuration * 2 + transitionDuration * 2;
let currentPhase = 0; // 0: Фаза 1, 1: Переход к Фазе 2, 2: Фаза 2, 3: Переход к Фазе 1

// --- Параметры для обеих сцен ---
const phase1Settings = {
  numRings: 3,
  pointsPerRing: 400,
  baseRadius: 10,
  radiusVariation: 2000,
  basePulseAmplitude: 10,
  waveAmplitudeX: 1,
  waveAmplitudeY: 0,
  waveFrequencyZ: 0.5,
};

const phase2Settings = {
  numRings: 5,
  pointsMaxValue: 20, // Увеличиваем минимальное значение с 4 до 20 для видимости
  pointsMinValue: 100,
  pointsTransitionDownDuration: 5000,
  pointsHoldDuration: 5000,
  pointsTransitionUpDuration: 5000,
  pointsTotalCycleDuration: 15000, // Обновлено для соответствия сумме
  baseRadius: 100,
  radiusVariation: 5000,
  basePulseAmplitude: 100,
  waveAmplitudeX: 10,
  waveAmplitudeY: 0,
  waveFrequencyZ: 12.5,
};

// Общие параметры
const ringSpacing = 3;
const tunnelSpeed = 7;
const fov = 15;
const followSpeed = 0.5;
const targetInfluence = 1.5;
const lineWidth = 1;
const basePulseSpeed = 0.003;
const waveSpeedT = 0.101;
const nearClipDistance = 1;

// Текущие значения
let currentNumRings = phase1Settings.numRings;
let currentPointsPerRing = phase1Settings.pointsPerRing;
let framePointsPerRing = phase1Settings.pointsPerRing;
let currentBaseRadius = phase1Settings.baseRadius;
let currentRadiusVariation = phase1Settings.radiusVariation;
let currentPulseAmplitude = phase1Settings.basePulseAmplitude;
let currentWaveAmplitudeX = phase1Settings.waveAmplitudeX;
let currentWaveAmplitudeY = phase1Settings.waveAmplitudeY;
let currentWaveFrequencyZ = phase1Settings.waveFrequencyZ;
let pointsCycleStartTime = 0;
let maxZ, cameraZ;

// Цвета
const colorWhite = { h: 0, s: 0, l: 100 };
const colorBlue = { h: 240, s: 100, l: 50 };
const colorGreen = { h: 120, s: 100, l: 50 };
const midPointDepthFactor = 0.1;
const segmentHueShift = 1;

// Звук
const soundBaseFreq = 55;
const soundFreqVariation = 1;
const soundDuration = 0.9;
const soundVolume = 0.7;
const organVolumes = [0.1, 0.2, 0.3, 0.4];
const positionFreqShiftRange = 100;
const filterStartFreq = 6000;
const filterEndFreq = 200;
const filterQ = 1;
const delayTime = 0.15;
const delayFeedback = 0.3;
const delayWetLevel = 0.35;

// Звезды
const numStars = 200;
let maxStarZ = 1;
const maxStarRadius = 1.5;
const minStarRadius = 0.1;
const maxStarAlpha = 1.0;
const minStarAlpha = 0.1;
const twinkleChance = 0.01;
const twinkleAmount = 0.4;
const starSpeedFactor = 40;

let rings = [];
let stars = [];

// --- Функции ---
function playSound(triggerRing, phaseProgress) {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) return;
    } catch (e) {
      return;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => {});
  }
  if (audioCtx.state !== 'running') return;

  const now = audioCtx.currentTime;
  let freqShift = 0;
  if (triggerRing && typeof triggerRing.ringCenterX === 'number' && width > 0) {
    const normX = Math.max(-1, Math.min(1, triggerRing.ringCenterX / (width / 2)));
    freqShift = normX * (positionFreqShiftRange / 2);
  }

  const baseFreq = soundBaseFreq + freqShift + Math.random() * soundFreqVariation - soundFreqVariation / 2;

  const mainGain = audioCtx.createGain();
  const lowpassFilter = audioCtx.createBiquadFilter();
  const highpassFilter = audioCtx.createBiquadFilter();
  const delay = audioCtx.createDelay(1.0);
  const feedback = audioCtx.createGain();
  const wetLevel = audioCtx.createGain();

  const filterPeakFreq = lerp(2000, 4000, phaseProgress);
  lowpassFilter.type = 'lowpass';
  lowpassFilter.Q.setValueAtTime(filterQ, now);
  lowpassFilter.frequency.setValueAtTime(200, now);
  lowpassFilter.frequency.linearRampToValueAtTime(filterPeakFreq, now + soundDuration * 0.4);
  lowpassFilter.frequency.linearRampToValueAtTime(200, now + soundDuration);

  highpassFilter.type = 'highpass';
  highpassFilter.frequency.setValueAtTime(50, now);
  highpassFilter.Q.setValueAtTime(1, now);

  delay.delayTime.setValueAtTime(delayTime * (1 + phaseProgress * 0.5), now);
  feedback.gain.setValueAtTime(delayFeedback, now);
  wetLevel.gain.setValueAtTime(delayWetLevel, now);

  const oscillators = [];
  const frequencies = [baseFreq, baseFreq * 2, baseFreq * 3, baseFreq * 4];
  frequencies.forEach((freq, index) => {
    if (index >= organVolumes.length) return;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * (1 + phaseProgress * 0.1), now);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(organVolumes[index], now);
    osc.connect(gain).connect(mainGain);
    oscillators.push(osc);
    osc.start(now);
    osc.stop(now + soundDuration);
  });

  mainGain.connect(highpassFilter);
  highpassFilter.connect(lowpassFilter);
  lowpassFilter.connect(audioCtx.destination);
  lowpassFilter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetLevel);
  wetLevel.connect(audioCtx.destination);

  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(soundVolume, now + 0.01);
  mainGain.gain.linearRampToValueAtTime(0, now + soundDuration);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function lerpColor(color1, color2, amount) {
  const h = lerp(color1.h, color2.h, amount);
  const s = lerp(color1.s, color2.s, amount);
  const l = lerp(color1.l, color2.l, amount);
  return { h, s, l };
}

function project(x, y, z) {
  const relativeZ = z - cameraZ;
  if (relativeZ < nearClipDistance) {
    return { x: centerX, y: centerY, scale: 0 };
  }
  const scale = fov / (fov + relativeZ);
  return { x: centerX + x * scale, y: centerY + y * scale, scale: scale };
}

function calculateOriginalPoints(ring, numPoints) {
  ring.originalPoints = [];
  const radius = ring.specificBaseRadius;
  const pointsCount = Math.max(1, Math.round(numPoints));
  if (radius <= 0 || pointsCount <= 0) return;
  for (let j = 0; j < pointsCount; j++) {
    const angle = (j / pointsCount) * Math.PI * 2;
    ring.originalPoints.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
}

function setupRingData(ring, zIndex) {
  ring.z = zIndex;
  ring.specificBaseRadius = Math.max(1, currentBaseRadius + (Math.random() - 0.5) * 2 * currentRadiusVariation);
  ring.radiusOscillationSpeed = basePulseSpeed * (0.7 + Math.random() * 0.6);
  ring.radiusOscillationPhase = Math.random() * Math.PI * 2;
  ring.radiusOscillationAmplitude = currentPulseAmplitude * (0.5 + Math.random());
  ring.points = [];
  ring.originalPoints = [];
  ring.ringCenterX = 0;
  ring.ringCenterY = 0;
  calculateOriginalPoints(ring, framePointsPerRing);
}

function initRings() {
  rings = [];
  maxZ = Math.round(currentNumRings) * ringSpacing;
  cameraZ = maxZ / 3;
  for (let i = 0; i < Math.round(currentNumRings); i++) {
    const ring = {};
    setupRingData(ring, cameraZ + i * ringSpacing);
    rings.push(ring);
  }
}

function initStars() {
  stars = [];
  maxStarZ = Math.max(width, height, 500);
  for (let i = 0; i < numStars; i++) {
    stars.push({ x: Math.random() * width, y: Math.random() * height, z: Math.random() * maxStarZ });
  }
}

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
  targetX = 0;
  targetY = 0;
  currentX = 0;
  currentY = 0;
  lastTime = performance.now();
  phaseStartTime = performance.now();
  pointsCycleStartTime = performance.now();
  initRings();
  initStars();
}

function handleMouseMove(event) {
  targetX = (event.clientX - centerX) * targetInfluence;
  targetY = (event.clientY - centerY) * targetInfluence;
}

function handleTouchMove(event) {
  event.preventDefault();
  if (event.touches.length > 0) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    targetX = (touchX - centerX) * targetInfluence;
    targetY = (touchY - centerY) * targetInfluence;
  }
}

function unlockAudio() {
  if (!audioCtx || audioCtx.state !== 'running') return;
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
  source.onended = () => { source.disconnect(); };
}

function initializeAudio() {
  if (audioContextResumed) return;
  audioContextResumed = true;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) return;
    } catch (e) {
      return;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => { unlockAudio(); }).catch(e => {});
  } else if (audioCtx.state === 'running') {
    unlockAudio();
  }
}

function updateStars(dt) {
  if (dt <= 0) return;
  stars.forEach(star => {
    const vecX = star.x - centerX;
    const vecY = star.y - centerY;
    const moveSpeed = starSpeedFactor / (star.z + 1);
    star.x += vecX * moveSpeed * dt;
    star.y += vecY * moveSpeed * dt;
    if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
      star.z = Math.random() * maxStarZ;
    }
  });
}

function drawStars() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  stars.forEach(star => {
    const depthFactor = star.z / maxStarZ;
    const radius = lerp(maxStarRadius, minStarRadius, depthFactor);
    let alpha = lerp(maxStarAlpha, minStarAlpha, depthFactor);
    if (Math.random() < twinkleChance) {
      alpha *= (1.0 - twinkleAmount + Math.random() * twinkleAmount * 2);
    }
    alpha = Math.max(0, Math.min(1, alpha));
    if (radius <= 0 || alpha <= 0) return;
    const parallaxFactor = 1 / (star.z + 10);
    const displayX = star.x - currentX * parallaxFactor;
    const displayY = star.y - currentY * parallaxFactor;
    ctx.beginPath();
    ctx.arc(displayX, displayY, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  });
}

function animate(currentTime) {
  if (currentTime - lastFrameTime < 1000 / targetFPS) {
    requestAnimationFrame(animate);
    return;
  }
  lastFrameTime = currentTime;

  let deltaTime = (currentTime - lastTime) / 1000;
  if (deltaTime <= 0 || deltaTime > 0.1) deltaTime = 1 / 60;
  lastTime = currentTime;

  currentX = lerp(currentX, targetX, followSpeed);
  currentY = lerp(currentY, targetY, followSpeed);

  // --- Управление фазами ---
  const elapsedTime = (currentTime - phaseStartTime) % totalCycleDuration;
  let phaseProgress = 0;

  if (elapsedTime < phaseDuration) {
    currentPhase = 0;
    phaseProgress = 0;
    currentNumRings = phase1Settings.numRings;
    currentPointsPerRing = phase1Settings.pointsPerRing;
    framePointsPerRing = phase1Settings.pointsPerRing;
    currentBaseRadius = phase1Settings.baseRadius;
    currentRadiusVariation = phase1Settings.radiusVariation;
    currentPulseAmplitude = phase1Settings.basePulseAmplitude;
    currentWaveAmplitudeX = phase1Settings.waveAmplitudeX;
    currentWaveAmplitudeY = phase1Settings.waveAmplitudeY;
    currentWaveFrequencyZ = phase1Settings.waveFrequencyZ;
  } else if (elapsedTime < phaseDuration + transitionDuration) {
    currentPhase = 1;
    phaseProgress = (elapsedTime - phaseDuration) / transitionDuration;
    currentNumRings = lerp(phase1Settings.numRings, phase2Settings.numRings, phaseProgress);
    currentPointsPerRing = lerp(phase1Settings.pointsPerRing, phase2Settings.pointsMinValue, phaseProgress);
    framePointsPerRing = Math.max(20, Math.round(currentPointsPerRing)); // Минимум 20 точек
    currentBaseRadius = lerp(phase1Settings.baseRadius, phase2Settings.baseRadius, phaseProgress);
    currentRadiusVariation = lerp(phase1Settings.radiusVariation, phase2Settings.radiusVariation, phaseProgress);
    currentPulseAmplitude = lerp(phase1Settings.basePulseAmplitude, phase2Settings.basePulseAmplitude, phaseProgress);
    currentWaveAmplitudeX = lerp(phase1Settings.waveAmplitudeX, phase2Settings.waveAmplitudeX, phaseProgress);
    currentWaveAmplitudeY = lerp(phase1Settings.waveAmplitudeY, phase2Settings.waveAmplitudeY, phaseProgress);
    currentWaveFrequencyZ = lerp(phase1Settings.waveFrequencyZ, phase2Settings.waveFrequencyZ, phaseProgress);
  } else if (elapsedTime < phaseDuration * 2 + transitionDuration) {
    currentPhase = 2;
    phaseProgress = 1;
    currentNumRings = phase2Settings.numRings;
    currentBaseRadius = phase2Settings.baseRadius;
    currentRadiusVariation = phase2Settings.radiusVariation;
    currentPulseAmplitude = phase2Settings.basePulseAmplitude;
    currentWaveAmplitudeX = phase2Settings.waveAmplitudeX;
    currentWaveAmplitudeY = phase2Settings.waveAmplitudeY;
    currentWaveFrequencyZ = phase2Settings.waveFrequencyZ;

    const pointsElapsed = (currentTime - pointsCycleStartTime) % phase2Settings.pointsTotalCycleDuration;
    if (pointsElapsed < phase2Settings.pointsTransitionDownDuration) {
      const progress = pointsElapsed / phase2Settings.pointsTransitionDownDuration;
      currentPointsPerRing = phase2Settings.pointsMaxValue + (phase2Settings.pointsMinValue - phase2Settings.pointsMaxValue) * progress;
    } else if (pointsElapsed < phase2Settings.pointsTransitionDownDuration + phase2Settings.pointsHoldDuration) {
      currentPointsPerRing = phase2Settings.pointsMinValue;
    } else {
      const timeInUp = pointsElapsed - (phase2Settings.pointsTransitionDownDuration + phase2Settings.pointsHoldDuration);
      const progress = timeInUp / phase2Settings.pointsTransitionUpDuration;
      currentPointsPerRing = phase2Settings.pointsMinValue + (phase2Settings.pointsMaxValue - phase2Settings.pointsMinValue) * progress;
    }
    framePointsPerRing = Math.max(20, Math.round(currentPointsPerRing)); // Минимум 20 точек
  } else {
    currentPhase = 3;
    phaseProgress = 1 - ((elapsedTime - (phaseDuration * 2 + transitionDuration)) / transitionDuration);
    currentNumRings = lerp(phase1Settings.numRings, phase2Settings.numRings, phaseProgress);
    currentPointsPerRing = lerp(phase1Settings.pointsPerRing, phase2Settings.pointsMinValue, phaseProgress);
    framePointsPerRing = Math.max(20, Math.round(currentPointsPerRing)); // Минимум 20 точек
    currentBaseRadius = lerp(phase1Settings.baseRadius, phase2Settings.baseRadius, phaseProgress);
    currentRadiusVariation = lerp(phase1Settings.radiusVariation, phase2Settings.radiusVariation, phaseProgress);
    currentPulseAmplitude = lerp(phase1Settings.basePulseAmplitude, phase2Settings.basePulseAmplitude, phaseProgress);
    currentWaveAmplitudeX = lerp(phase1Settings.waveAmplitudeX, phase2Settings.waveAmplitudeX, phaseProgress);
    currentWaveAmplitudeY = lerp(phase1Settings.waveAmplitudeY, phase2Settings.waveAmplitudeY, phaseProgress);
    currentWaveFrequencyZ = lerp(phase1Settings.waveFrequencyZ, phase2Settings.waveFrequencyZ, phaseProgress);
  }

  if (rings.length !== Math.round(currentNumRings)) {
    initRings();
  }

  updateStars(deltaTime);
  drawStars();

  const timeFactorForWave = currentTime * waveSpeedT;
  const currentMaxZ = Math.round(currentNumRings) * ringSpacing;

  rings.forEach((ring, i) => {
    ring.z -= tunnelSpeed * deltaTime;
    const relativeZ = ring.z - cameraZ;

    if (relativeZ < nearClipDistance) {
      const oldRingCenterX = ring.ringCenterX;
      setupRingData(ring, cameraZ + currentMaxZ);
      ring.ringCenterX = oldRingCenterX;
      playSound(ring, currentPhase === 0 || currentPhase === 3 ? 0 : 1);
    } else if (!ring.originalPoints || ring.originalPoints.length !== framePointsPerRing) {
      calculateOriginalPoints(ring, framePointsPerRing);
    }

    const interpolationFactor = Math.max(0, relativeZ / currentMaxZ);
    const baseCenterX = currentX * interpolationFactor;
    const baseCenterY = currentY * interpolationFactor;
    const angleZ = ring.z * currentWaveFrequencyZ;
    const waveOffsetX = currentWaveAmplitudeX * Math.sin(angleZ + timeFactorForWave);
    const waveOffsetY = currentWaveAmplitudeY * Math.cos(angleZ + timeFactorForWave);
    ring.ringCenterX = baseCenterX + waveOffsetX;
    ring.ringCenterY = baseCenterY + waveOffsetY;

    const currentPulseOffset = Math.sin(currentTime * ring.radiusOscillationSpeed + ring.radiusOscillationPhase) * ring.radiusOscillationAmplitude;
    const effectiveRadius = Math.max(1, ring.specificBaseRadius + currentPulseOffset);
    const radiusScale = ring.specificBaseRadius > 0 ? effectiveRadius / ring.specificBaseRadius : 1;

    ring.points = [];
    if (ring.originalPoints && ring.originalPoints.length > 0) {
      const pointsCount = ring.originalPoints.length;
      for (let j = 0; j < pointsCount; j++) {
        const basePoint = ring.originalPoints[j];
        const currentXPoint = basePoint.x * radiusScale;
        const currentYPoint = basePoint.y * radiusScale;
        const worldX = ring.ringCenterX + currentXPoint;
        const worldY = ring.ringCenterY + currentYPoint;
        ring.points.push(project(worldX, worldY, ring.z));
      }
    }
  });

  rings.sort((a, b) => b.z - a.z);

  ctx.lineWidth = lineWidth;
  const currentMaxZForDrawing = Math.round(currentNumRings) * ringSpacing;
  for (let i = 0; i < Math.round(currentNumRings) - 1; i++) {
    const ring1 = rings[i];
    const ring2 = rings[i + 1];

    if (!ring1 || !ring2 || !ring1.points || !ring2.points || !ring1.points.length || !ring2.points.length || ring1.points.length < 3 || ring2.points.length < 3) continue;
    if (!ring1.points[0] || ring1.points[0].scale <= 0 || !ring2.points[0] || ring2.points[0].scale <= 0) continue;

    const ring1RelativeZ = ring1.z - cameraZ;
    let baseH, baseS, baseL;
    const midPointZ = currentMaxZForDrawing * midPointDepthFactor;

    if (ring1RelativeZ >= midPointZ) {
      const segmentLength = currentMaxZForDrawing - midPointZ;
      const normZ1 = segmentLength > 0 ? Math.max(0, Math.min(1, (currentMaxZForDrawing - ring1RelativeZ) / segmentLength)) : 1;
      const color = lerpColor(colorWhite, colorBlue, normZ1);
      baseH = color.h; baseS = color.s; baseL = color.l;
    } else {
      const segmentLength = midPointZ - nearClipDistance;
      const normZ2 = segmentLength > 0 ? Math.max(0, Math.min(1, (midPointZ - ring1RelativeZ) / segmentLength)) : 1;
      const color = lerpColor(colorBlue, colorGreen, normZ2);
      baseH = color.h; baseS = color.s; baseL = color.l;
    }
    const baseAlpha = Math.max(0, 1 - ring1RelativeZ / (currentMaxZForDrawing * 0.9));

    const pointsCount = Math.min(ring1.points.length, ring2.points.length);
    for (let j = 0; j < pointsCount; j++) {
      const p1 = ring1.points[j];
      const p2 = ring1.points[(j + 1) % pointsCount];
      if (!p1 || !p2 || p1.scale <= 0 || p2.scale <= 0) continue;

      const hueOffset = (j / pointsCount) * segmentHueShift;
      const finalHue = (baseH + hueOffset) % 360;
      ctx.strokeStyle = `hsla(${finalHue}, ${baseS}%, ${baseL}%, ${baseAlpha})`;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      if (ring2.points.length > j) {
        const p3_target = ring2.points[j];
        if (p3_target && p3_target.scale > 0) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3_target.x, p3_target.y);
          ctx.stroke();
        }
      }
    }
  }

  requestAnimationFrame(animate);
}

// --- Слушатели событий ---
window.addEventListener('resize', resize);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('click', initializeAudio, { once: true });
window.addEventListener('touchstart', initializeAudio, { once: true });

// --- Инициализация ---
resize();
lastTime = performance.now();
lastFrameTime = performance.now();
animate(performance.now());