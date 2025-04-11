const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const canvasContainer = document.getElementById('canvas-container');
const bioContainer = document.getElementById('bio-container');
const toggleButton = document.getElementById('toggle-button');

let width, height, centerX, centerY;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

let audioCtx = null;
let audioContextResumed = false;

let lastTime = 0;
const targetFPS = 60;
let lastFrameTime = 0;

let animationFrameId = null;
let isBioVisible = false;

let phaseStartTime = 0;
const phaseDuration = 10000;
const transitionDuration = 5000;
const totalCycleDuration = phaseDuration * 2 + transitionDuration * 2;
let currentPhase = 0;

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
  pointsMaxValue: 20,
  pointsMinValue: 100,
  pointsTransitionDownDuration: 5000,
  pointsHoldDuration: 5000,
  pointsTransitionUpDuration: 5000,
  pointsTotalCycleDuration: 15000,
  baseRadius: 100,
  radiusVariation: 5000,
  basePulseAmplitude: 100,
  waveAmplitudeX: 10,
  waveAmplitudeY: 0,
  waveFrequencyZ: 12.5,
};

const ringSpacing = 3;
const tunnelSpeed = 7;
const fov = 15;
const followSpeed = 0.5;
const targetInfluence = 1.5;
const lineWidth = 1;
const basePulseSpeed = 0.003;
const waveSpeedT = 0.101;
const nearClipDistance = 1;

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

const colorWhite = { h: 0, s: 0, l: 100 };
const colorBlue = { h: 240, s: 100, l: 50 };
const colorGreen = { h: 120, s: 100, l: 50 };
const midPointDepthFactor = 0.1;
const segmentHueShift = 1;

const soundBaseFreq = 55;
const soundFreqVariation = 1;
const soundDuration = 0.9;
const soundVolume = 0.7;
const organVolumes = [0.1, 0.2, 0.3, 0.4];
const positionFreqShiftRange = 100;
const filterQ = 1;
const delayTime = 0.15;
const delayFeedback = 0.3;
const delayWetLevel = 0.35;

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
  const pointsCount = Math.max(3, Math.round(numPoints));
  if (radius <= 0 || pointsCount <= 0) return;
  for (let j = 0; j < pointsCount; j++) {
    const angle = (j / pointsCount) * Math.PI * 2;
    ring.originalPoints.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
}

function initializeAudio() {
  if (audioContextResumed) return;
  console.log("Initializing AudioContext");
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) {
        console.error("AudioContext not supported");
        return;
      }
    } catch (e) {
      console.error("Error creating AudioContext:", e);
      return;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      console.log("AudioContext resumed");
      unlockAudio();
      audioContextResumed = true;
    }).catch(e => {
      console.error("Error resuming AudioContext:", e);
    });
  } else if (audioCtx.state === 'running') {
    console.log("AudioContext already running");
    unlockAudio();
    audioContextResumed = true;
  }
}

function unlockAudio() {
  if (!audioCtx || audioCtx.state !== 'running') return;
  console.log("Unlocking audio with silent buffer");
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
  source.onended = () => { source.disconnect(); };
}

function playSound(triggerRing, phaseProgress) {
  if (!audioCtx) {
    initializeAudio();
    if (!audioCtx) {
      console.error("Failed to initialize AudioContext in playSound");
      return;
    }
  }

  if (audioCtx.state === 'suspended') {
    console.log("AudioContext is suspended, attempting to resume");
    audioCtx.resume().then(() => {
      console.log("AudioContext resumed in playSound");
      audioContextResumed = true;
      playSoundInternal(triggerRing, phaseProgress);
    }).catch(e => {
      console.error("Failed to resume AudioContext in playSound:", e);
    });
    return;
  }

  if (audioCtx.state !== 'running') {
    console.log("AudioContext not running, skipping sound");
    return;
  }

  playSoundInternal(triggerRing, phaseProgress);
}

function playSoundInternal(triggerRing, phaseProgress) {
  console.log("Playing sound");
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
  maxZ = currentNumRings * ringSpacing;
  cameraZ = maxZ / 3;
  const numRingsToCreate = Math.round(currentNumRings);
  for (let i = 0; i < numRingsToCreate; i++) {
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
  currentPhase = 0;
  currentNumRings = phase1Settings.numRings;
  currentPointsPerRing = phase1Settings.pointsPerRing;
  framePointsPerRing = phase1Settings.pointsPerRing;
  currentBaseRadius = phase1Settings.baseRadius;
  currentRadiusVariation = phase1Settings.radiusVariation;
  currentPulseAmplitude = phase1Settings.basePulseAmplitude;
  currentWaveAmplitudeX = phase1Settings.waveAmplitudeX;
  currentWaveAmplitudeY = phase1Settings.waveAmplitudeY;
  currentWaveFrequencyZ = phase1Settings.waveFrequencyZ;
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
  animationFrameId = requestAnimationFrame(animate);
  if (currentTime - lastFrameTime < 1000 / targetFPS) return;
  lastFrameTime = currentTime;
  let deltaTime = (currentTime - lastTime) / 1000;
  if (deltaTime <= 0 || deltaTime > 0.1) deltaTime = 1 / targetFPS;
  lastTime = currentTime;
  currentX = lerp(currentX, targetX, followSpeed * deltaTime * 60);
  currentY = lerp(currentY, targetY, followSpeed * deltaTime * 60);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  const elapsedTime = (currentTime - phaseStartTime) % totalCycleDuration;
  let phaseProgress = 0;
  let needsRingReinit = false;

  if (elapsedTime < phaseDuration) {
    if (currentPhase !== 0) needsRingReinit = true;
    currentPhase = 0;
    phaseProgress = 0;
    currentNumRings = phase1Settings.numRings;
    currentPointsPerRing = phase1Settings.pointsPerRing;
    currentBaseRadius = phase1Settings.baseRadius;
    currentRadiusVariation = phase1Settings.radiusVariation;
    currentPulseAmplitude = phase1Settings.basePulseAmplitude;
    currentWaveAmplitudeX = phase1Settings.waveAmplitudeX;
    currentWaveAmplitudeY = phase1Settings.waveAmplitudeY;
    currentWaveFrequencyZ = phase1Settings.waveFrequencyZ;
  } else if (elapsedTime < phaseDuration + transitionDuration) {
    if (currentPhase !== 1) needsRingReinit = true;
    currentPhase = 1;
    phaseProgress = (elapsedTime - phaseDuration) / transitionDuration;
    currentNumRings = lerp(phase1Settings.numRings, phase2Settings.numRings, phaseProgress);
    currentPointsPerRing = lerp(phase1Settings.pointsPerRing, phase2Settings.pointsMinValue, phaseProgress);
    currentBaseRadius = lerp(phase1Settings.baseRadius, phase2Settings.baseRadius, phaseProgress);
    currentRadiusVariation = lerp(phase1Settings.radiusVariation, phase2Settings.radiusVariation, phaseProgress);
    currentPulseAmplitude = lerp(phase1Settings.basePulseAmplitude, phase2Settings.basePulseAmplitude, phaseProgress);
    currentWaveAmplitudeX = lerp(phase1Settings.waveAmplitudeX, phase2Settings.waveAmplitudeX, phaseProgress);
    currentWaveAmplitudeY = lerp(phase1Settings.waveAmplitudeY, phase2Settings.waveAmplitudeY, phaseProgress);
    currentWaveFrequencyZ = lerp(phase1Settings.waveFrequencyZ, phase2Settings.waveFrequencyZ, phaseProgress);
  } else if (elapsedTime < phaseDuration * 2 + transitionDuration) {
    if (currentPhase !== 2) { needsRingReinit = true; pointsCycleStartTime = currentTime; }
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
  } else {
    if (currentPhase !== 3) needsRingReinit = true;
    currentPhase = 3;
    phaseProgress = 1 - ((elapsedTime - (phaseDuration * 2 + transitionDuration)) / transitionDuration);
    currentNumRings = lerp(phase1Settings.numRings, phase2Settings.numRings, phaseProgress);
    currentPointsPerRing = lerp(phase1Settings.pointsPerRing, phase2Settings.pointsMinValue, phaseProgress);
    currentBaseRadius = lerp(phase1Settings.baseRadius, phase2Settings.baseRadius, phaseProgress);
    currentRadiusVariation = lerp(phase1Settings.radiusVariation, phase2Settings.radiusVariation, phaseProgress);
    currentPulseAmplitude = lerp(phase1Settings.basePulseAmplitude, phase2Settings.basePulseAmplitude, phaseProgress);
    currentWaveAmplitudeX = lerp(phase1Settings.waveAmplitudeX, phase2Settings.waveAmplitudeX, phaseProgress);
    currentWaveAmplitudeY = lerp(phase1Settings.waveAmplitudeY, phase2Settings.waveAmplitudeY, phaseProgress);
    currentWaveFrequencyZ = lerp(phase1Settings.waveFrequencyZ, phase2Settings.waveFrequencyZ, phaseProgress);
  }
  framePointsPerRing = Math.max(3, Math.round(currentPointsPerRing));
  if (needsRingReinit || rings.length !== Math.round(currentNumRings)) {
    initRings();
  }

  updateStars(deltaTime);
  drawStars();

  const timeFactorForWave = currentTime * waveSpeedT;
  const currentRenderMaxZ = Math.round(currentNumRings) * ringSpacing;

  rings.forEach((ring, i) => {
    ring.z -= tunnelSpeed * deltaTime;
    const relativeZ = ring.z - cameraZ;
    if (relativeZ < nearClipDistance) {
      const oldRingCenterX = ring.ringCenterX;
      setupRingData(ring, cameraZ + currentRenderMaxZ);
      ring.ringCenterX = oldRingCenterX;
      playSound(ring, currentPhase === 0 || currentPhase === 3 ? 0 : 1);
    } else if (!ring.originalPoints || ring.originalPoints.length !== framePointsPerRing) {
      calculateOriginalPoints(ring, framePointsPerRing);
    }

    const interpolationFactor = Math.max(0, Math.min(1, relativeZ / currentRenderMaxZ));
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
  const currentMaxZForDrawing = currentRenderMaxZ;
  const numRingsToDraw = Math.max(0, rings.length - 1);

  for (let i = 0; i < numRingsToDraw; i++) {
    const ring1 = rings[i];
    const ring2 = rings[i + 1];
    if (!ring1 || !ring2 || !ring1.points || !ring2.points || ring1.points.length < 3 || ring2.points.length < 3) continue;
    if (ring1.points.length !== ring2.points.length) continue;
    if (!ring1.points[0] || ring1.points[0].scale <= 0) continue;

    const ring1RelativeZ = ring1.z - cameraZ;
    const pointsCount = ring1.points.length;
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

    for (let j = 0; j < pointsCount; j++) {
      const p1 = ring1.points[j];
      const p2_idx = (j + 1) % pointsCount;
      const p2 = ring1.points[p2_idx];
      const p3_target = ring2.points[j];
      if (!p1 || !p2 || p1.scale <= 0 || p2.scale <= 0) continue;

      const hueOffset = (j / pointsCount) * segmentHueShift;
      const finalHue = (baseH + hueOffset) % 360;
      ctx.strokeStyle = `hsla(${finalHue}, ${baseS}%, ${baseL}%, ${baseAlpha})`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      if (p3_target && p3_target.scale > 0) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p3_target.x, p3_target.y);
        ctx.stroke();
      }
    }
  }
}

function startAnimation() {
  if (!canvasContainer || !bioContainer || !toggleButton) {
    console.error("Cannot start animation: Required elements not found.");
    return;
  }
  if (!animationFrameId) {
    console.log("Animation starting / restarting");
    lastTime = performance.now();
    lastFrameTime = performance.now();
    phaseStartTime = performance.now();
    pointsCycleStartTime = performance.now();
    isBioVisible = false;
    bioContainer.classList.remove('visible');
    canvasContainer.classList.remove('hidden');
    toggleButton.classList.remove('black-button');
    animate(performance.now());
  }
}

function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    console.log("Animation stopped");
  }
}

function toggleBio() {
  if (!bioContainer || !canvasContainer || !toggleButton) {
    console.error("Cannot toggle bio: Required elements not found!");
    return;
  }
  isBioVisible = !isBioVisible;
  if (isBioVisible) {
    bioContainer.classList.add('visible');
    canvasContainer.classList.add('hidden');
    toggleButton.classList.add('black-button');
    stopAnimation();
  } else {
    bioContainer.classList.remove('visible');
    canvasContainer.classList.remove('hidden');
    toggleButton.classList.remove('black-button');
    startAnimation();
  }
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('click', initializeAudio);
window.addEventListener('touchstart', initializeAudio);
window.addEventListener('touchend', initializeAudio);

window.onload = () => {
  const canvasContainerOnload = document.getElementById('canvas-container');
  const bioContainerOnload = document.getElementById('bio-container');
  const toggleButtonOnload = document.getElementById('toggle-button');
  if (!canvasContainerOnload) console.error("Canvas container (#canvas-container) not found!");
  if (!bioContainerOnload) console.error("Bio container (#bio-container) not found!");
  if (toggleButtonOnload) {
    toggleButtonOnload.addEventListener('click', toggleBio);
    toggleButtonOnload.addEventListener('click', initializeAudio);
    toggleButtonOnload.addEventListener('touchstart', initializeAudio);
    toggleButtonOnload.addEventListener('touchend', initializeAudio);
    console.log("Event listeners added to toggle button.");
  } else {
    console.error("Toggle button (#toggle-button) not found on window.onload!");
  }
  resize();
  startAnimation();
};