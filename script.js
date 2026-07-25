const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const canvasContainer = document.getElementById('canvas-container');
const bioContainer = document.getElementById('bio-container');
const toggleButton = document.getElementById('toggle-button');
const muteButton = document.getElementById('mute-button');
const cursorEl = document.getElementById('cursor');

let width, height, centerX, centerY;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

let cursorRawX = -100;
let cursorRawY = -100;
let cursorX = -100;
let cursorY = -100;
let cursorVisible = false;
let cursorRaf = null;
const preferFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

let audioCtx = null;
let audioContextResumed = false;
let audioGraphReady = false;
let masterGain = null;
let dryBus = null;
let spaceSend = null;
let isMuted = localStorage.getItem('elnurio-muted') === '1';
let activeVoices = [];
let lastNoteTime = 0;
let padNodes = null;
let lastPadBucket = -1;
let noteStep = 0;

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

// Mid-register D major pentatonic — no sub-bass (avoids headphone "knock")
// D3 E3 F#3 A3 B3 D4 E4 F#4 A4
const SCALE_FREQS = [
  146.83, 164.81, 185.00, 220.00, 246.94,
  293.66, 329.63, 369.99, 440.00,
];
const PARTIAL_GAINS = [1, 0.28, 0.1];
const MASTER_GAIN = 0.55;
const NOTE_GAIN = 0.18;
const PAD_GAIN = 0.028;
const MAX_VOICES = 4;
const NOTE_ATTACK = 0.14;
const NOTE_HOLD = 0.45;
const NOTE_RELEASE = 1.1;
const NOTE_TOTAL = NOTE_ATTACK + NOTE_HOLD + NOTE_RELEASE;
const NOTE_PROBABILITY = 0.38;
const NOTE_COOLDOWN_MS = 280;
const MUTE_STORAGE_KEY = 'elnurio-muted';

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

function applyMasterMute() {
  if (!masterGain || !audioCtx) return;
  const now = audioCtx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setTargetAtTime(isMuted ? 0 : MASTER_GAIN, now, 0.08);
}

function updateMuteButton() {
  if (!muteButton) return;
  muteButton.classList.toggle('muted', isMuted);
  muteButton.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
  muteButton.title = isMuted ? 'Unmute' : 'Mute';
}

function setMuted(muted) {
  isMuted = muted;
  localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
  applyMasterMute();
  updateMuteButton();
}

function createSharedSpace(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  output.gain.value = 0.4;

  // Kill bass in the feedback path — this was causing the headphone knock
  const sendHP = ctx.createBiquadFilter();
  sendHP.type = 'highpass';
  sendHP.frequency.value = 220;
  sendHP.Q.value = 0.7;

  const sendLP = ctx.createBiquadFilter();
  sendLP.type = 'lowpass';
  sendLP.frequency.value = 3200;
  sendLP.Q.value = 0.5;

  const delayL = ctx.createDelay(1.5);
  const delayR = ctx.createDelay(1.5);
  delayL.delayTime.value = 0.32;
  delayR.delayTime.value = 0.43;

  const fbL = ctx.createGain();
  const fbR = ctx.createGain();
  fbL.gain.value = 0.22;
  fbR.gain.value = 0.18;

  const wetL = ctx.createGain();
  const wetR = ctx.createGain();
  wetL.gain.value = 0.55;
  wetR.gain.value = 0.5;

  const panL = ctx.createStereoPanner();
  const panR = ctx.createStereoPanner();
  panL.pan.value = -0.7;
  panR.pan.value = 0.7;

  input.connect(sendHP);
  sendHP.connect(sendLP);
  sendLP.connect(delayL);
  sendLP.connect(delayR);

  delayL.connect(fbL);
  fbL.connect(sendHP);
  delayR.connect(fbR);
  fbR.connect(sendHP);

  delayL.connect(wetL).connect(panL).connect(output);
  delayR.connect(wetR).connect(panR).connect(output);

  return { input, output };
}

function setupAudioGraph() {
  if (!audioCtx || audioGraphReady) return;

  // Master chain: bus → HP (no sub) → soft compressor → out
  masterGain = audioCtx.createGain();
  masterGain.gain.value = isMuted ? 0 : MASTER_GAIN;

  const masterHP = audioCtx.createBiquadFilter();
  masterHP.type = 'highpass';
  masterHP.frequency.value = 110;
  masterHP.Q.value = 0.7;

  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.3;

  dryBus = audioCtx.createGain();
  dryBus.gain.value = 1;

  const space = createSharedSpace(audioCtx);
  spaceSend = space.input;

  dryBus.connect(masterHP);
  space.output.connect(masterHP);
  masterHP.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(audioCtx.destination);

  audioGraphReady = true;
  startPad();
  updatePadForPhase(0);
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
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return;
    }
  }

  if (!audioGraphReady) {
    setupAudioGraph();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      unlockAudio();
      audioContextResumed = true;
      applyMasterMute();
    }).catch(() => {});
  } else if (audioCtx.state === 'running') {
    unlockAudio();
    audioContextResumed = true;
    applyMasterMute();
  }
}

function startPad() {
  if (!audioCtx || !dryBus || padNodes) return;

  const now = audioCtx.currentTime;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.4;

  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 140;
  hp.Q.value = 0.7;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(PAD_GAIN, now + 3);

  // Soft fifth dyad in mid register (D3 + A3)
  const root = audioCtx.createOscillator();
  const fifth = audioCtx.createOscillator();
  root.type = 'sine';
  fifth.type = 'sine';
  root.frequency.value = 146.83;
  fifth.frequency.value = 220;

  const g1 = audioCtx.createGain();
  const g2 = audioCtx.createGain();
  g1.gain.value = 0.7;
  g2.gain.value = 0.4;

  root.connect(g1).connect(filter);
  fifth.connect(g2).connect(filter);
  filter.connect(hp);
  hp.connect(gain);
  gain.connect(dryBus);

  if (spaceSend) {
    const send = audioCtx.createGain();
    send.gain.value = 0.25;
    gain.connect(send);
    send.connect(spaceSend);
  }

  root.start(now);
  fifth.start(now);
  padNodes = { root, fifth, filter, gain };
}

function updatePadForPhase(phaseProgress) {
  if (!padNodes || !audioCtx) return;
  const bucket = phaseProgress < 0.33 ? 0 : phaseProgress < 0.66 ? 1 : 2;
  if (lastPadBucket === bucket) return;
  lastPadBucket = bucket;

  const now = audioCtx.currentTime;
  const roots = [146.83, 164.81, 185.0];
  const fifths = [220.0, 246.94, 277.18];
  const filters = [800, 1100, 1400];

  padNodes.root.frequency.setTargetAtTime(roots[bucket], now, 1.8);
  padNodes.fifth.frequency.setTargetAtTime(fifths[bucket], now, 1.8);
  padNodes.filter.frequency.setTargetAtTime(filters[bucket], now, 1.5);
}

function pickNoteFreq(normX, phaseProgress) {
  // Walk gently through the scale; position biases register
  const registerBias = phaseProgress > 0.5 ? 3 : 0;
  const posBias = Math.round((normX + 1) * 1.5);
  noteStep = (noteStep + 1 + (Math.random() < 0.35 ? 1 : 0)) % 5;
  const idx = Math.max(0, Math.min(
    SCALE_FREQS.length - 1,
    noteStep + registerBias + posBias
  ));
  return SCALE_FREQS[idx];
}

function stealOldestVoice(now) {
  while (activeVoices.length >= MAX_VOICES) {
    const oldest = activeVoices.shift();
    if (!oldest) break;
    try {
      oldest.gain.gain.cancelScheduledValues(now);
      oldest.gain.gain.setTargetAtTime(0.0001, now, 0.04);
      oldest.oscillators.forEach((osc) => {
        try { osc.stop(now + 0.12); } catch (_) {}
      });
    } catch (_) {}
  }
}

function pruneVoices(now) {
  activeVoices = activeVoices.filter((voice) => voice.endTime > now);
}

function playSound(triggerRing, phaseProgress) {
  if (!audioCtx) {
    initializeAudio();
    if (!audioCtx) return;
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      audioContextResumed = true;
      playNote(triggerRing, phaseProgress);
    }).catch(() => {});
    return;
  }

  if (audioCtx.state !== 'running' || !audioGraphReady || isMuted) return;
  playNote(triggerRing, phaseProgress);
}

function playNote(triggerRing, phaseProgress) {
  const nowMs = performance.now();
  if (nowMs - lastNoteTime < NOTE_COOLDOWN_MS) return;
  if (Math.random() > NOTE_PROBABILITY) return;
  lastNoteTime = nowMs;

  const now = audioCtx.currentTime;
  pruneVoices(now);
  stealOldestVoice(now);

  let normX = 0;
  if (triggerRing && typeof triggerRing.ringCenterX === 'number' && width > 0) {
    normX = Math.max(-1, Math.min(1, triggerRing.ringCenterX / (width / 2)));
  }

  const baseFreq = pickNoteFreq(normX, phaseProgress);
  const panValue = normX * 0.55;
  const peak = NOTE_GAIN * (phaseProgress > 0.5 ? 0.9 : 1);

  const noteGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const hp = audioCtx.createBiquadFilter();
  const panner = audioCtx.createStereoPanner();
  panner.pan.setValueAtTime(panValue, now);

  // Soft open/close — never harsh, never subby
  const filterPeak = lerp(1400, 2200, phaseProgress);
  filter.type = 'lowpass';
  filter.Q.setValueAtTime(0.6, now);
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.linearRampToValueAtTime(filterPeak, now + NOTE_ATTACK + NOTE_HOLD * 0.4);
  filter.frequency.exponentialRampToValueAtTime(500, now + NOTE_TOTAL);

  hp.type = 'highpass';
  hp.frequency.setValueAtTime(120, now);
  hp.Q.setValueAtTime(0.7, now);

  const oscillators = [];
  PARTIAL_GAINS.forEach((partialGain, index) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * (index + 1), now);
    osc.detune.setValueAtTime(index === 1 ? 3 : index === 2 ? -4 : 0, now);
    g.gain.setValueAtTime(partialGain, now);
    osc.connect(g).connect(noteGain);
    osc.start(now);
    osc.stop(now + NOTE_TOTAL + 0.05);
    oscillators.push(osc);
  });

  noteGain.gain.setValueAtTime(0.0001, now);
  noteGain.gain.exponentialRampToValueAtTime(peak, now + NOTE_ATTACK);
  noteGain.gain.exponentialRampToValueAtTime(peak * 0.5, now + NOTE_ATTACK + NOTE_HOLD);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + NOTE_TOTAL);

  noteGain.connect(hp);
  hp.connect(filter);
  filter.connect(panner);
  panner.connect(dryBus);

  if (spaceSend) {
    const send = audioCtx.createGain();
    send.gain.value = 0.35;
    panner.connect(send);
    send.connect(spaceSend);
  }

  activeVoices.push({ oscillators, gain: noteGain, endTime: now + NOTE_TOTAL });
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

  updatePadForPhase(phaseProgress);

  updateStars(deltaTime);
  drawStars();

  const timeFactorForWave = currentTime * waveSpeedT;
  const currentRenderMaxZ = Math.round(currentNumRings) * ringSpacing;

  rings.forEach((ring) => {
    ring.z -= tunnelSpeed * deltaTime;
    const relativeZ = ring.z - cameraZ;
    if (relativeZ < nearClipDistance) {
      const oldRingCenterX = ring.ringCenterX;
      setupRingData(ring, cameraZ + currentRenderMaxZ);
      ring.ringCenterX = oldRingCenterX;
      playSound(ring, phaseProgress);
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
    return;
  }
  if (!animationFrameId) {
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
  }
}

function toggleBio() {
  if (!bioContainer || !canvasContainer || !toggleButton) {
    return;
  }
  isBioVisible = !isBioVisible;
  if (isBioVisible) {
    bioContainer.classList.add('visible');
    canvasContainer.classList.add('hidden');
    toggleButton.classList.add('black-button');
    setBioCursorMode(true);
    stopAnimation();
  } else {
    bioContainer.classList.remove('visible');
    canvasContainer.classList.remove('hidden');
    toggleButton.classList.remove('black-button');
    setBioCursorMode(false);
    startAnimation();
  }
}

function handleMuteClick(event) {
  event.stopPropagation();
  initializeAudio();
  setMuted(!isMuted);
}

function isInteractiveTarget(target) {
  if (!target || !target.closest) return false;
  return Boolean(target.closest('a, button, [role="button"], input, textarea, select, label'));
}

function tickCursor() {
  cursorRaf = null;
  if (!cursorEl || !preferFinePointer.matches) return;

  // Match atpc smoothing feel
  cursorX += (cursorRawX - cursorX) * 0.35;
  cursorY += (cursorRawY - cursorY) * 0.35;
  cursorEl.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

  if (Math.abs(cursorRawX - cursorX) > 0.1 || Math.abs(cursorRawY - cursorY) > 0.1) {
    cursorRaf = requestAnimationFrame(tickCursor);
  }
}

function onPointerMove(event) {
  if (!preferFinePointer.matches || !cursorEl) return;
  cursorRawX = event.clientX;
  cursorRawY = event.clientY;

  if (!cursorVisible) {
    cursorVisible = true;
    cursorX = cursorRawX;
    cursorY = cursorRawY;
    cursorEl.classList.add('is-visible');
  }

  cursorEl.classList.toggle('is-hover', isInteractiveTarget(event.target));

  if (!cursorRaf) {
    cursorRaf = requestAnimationFrame(tickCursor);
  }
}

function onPointerLeave() {
  if (!cursorEl) return;
  cursorVisible = false;
  cursorEl.classList.remove('is-visible', 'is-hover');
}

function setBioCursorMode(on) {
  document.body.classList.toggle('is-bio', on);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('pointermove', onPointerMove, { passive: true });
window.addEventListener('pointerleave', onPointerLeave);
document.addEventListener('mouseleave', onPointerLeave);
window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('click', initializeAudio);
window.addEventListener('touchstart', initializeAudio);
window.addEventListener('touchend', initializeAudio);

window.onload = () => {
  updateMuteButton();

  if (toggleButton) {
    toggleButton.addEventListener('click', toggleBio);
    toggleButton.addEventListener('click', initializeAudio);
    toggleButton.addEventListener('touchstart', initializeAudio);
    toggleButton.addEventListener('touchend', initializeAudio);
  }

  if (muteButton) {
    muteButton.addEventListener('click', handleMuteClick);
  }

  resize();
  startAnimation();
};
