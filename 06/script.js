const canvas = document.getElementById('c');

const ctx = canvas.getContext('2d');



let width, height, centerX, centerY;

let targetX = 0, targetY = 0;

let currentX = 0, currentY = 0;



// --- Web Audio API ---

let audioCtx = null;

let audioContextResumed = false;

// ---------------------



// --- Переменные для Delta Time ---

let lastTime = 0;

// ---------------------------------



// --- Параметры ---

const numRings = 3;

const pointsPerRing = 100;

const ringSpacing = 3;

const baseRadius = 100;

const radiusVariation = 5000; // <<<=== УВЕЛИЧЕНО (было 30)

const tunnelSpeed = 7;

const fov = 15;

const followSpeed = 0.5;

const targetInfluence = 1.5;

const lineWidth = 1;

let maxZ = numRings * ringSpacing;



// --- Параметры СЛУЧАЙНОЙ ПУЛЬСАЦИИ ---

const basePulseAmplitude = 100; // <<<=== УВЕЛИЧЕНО (было 40)

const basePulseSpeed = 0.003;

// ------------------------------------



// Параметры "змеиной" волны

const waveAmplitudeX = 10; 
const waveAmplitudeY = 000; 
const waveFrequencyZ = 12.5; 
const waveSpeedT = 0.101;

// Управление Камерой

let cameraZ; const nearClipDistance = 1;

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
const soundVolume = 0.9; 
const organVolumes = [0.5, 0.25, 0.1, 0.5]; 
const positionFreqShiftRange = 100; 
const filterStartFreq = 6000; 
const filterEndFreq = 10; 
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

function playSound(triggerRing) { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (!audioCtx) { return; } } catch (e) { return; } } if (audioCtx.state === 'suspended') { audioCtx.resume().catch(e => {}); } if (audioCtx.state !== 'running') { return; } const now = audioCtx.currentTime; let freqShift = 0; if (triggerRing && typeof triggerRing.ringCenterX === 'number' && width > 0) { const normX = Math.max(-1, Math.min(1, triggerRing.ringCenterX / (width / 2))); freqShift = normX * (positionFreqShiftRange / 2); } const baseFreq = soundBaseFreq + freqShift + Math.random() * soundFreqVariation - soundFreqVariation / 2; const mainGain = audioCtx.createGain(); const filter = audioCtx.createBiquadFilter(); const delay = audioCtx.createDelay(1.0); const feedback = audioCtx.createGain(); const wetLevel = audioCtx.createGain(); filter.type = 'lowpass'; filter.Q.setValueAtTime(filterQ, now); filter.frequency.setValueAtTime(filterStartFreq, now); filter.frequency.linearRampToValueAtTime(filterEndFreq, now + soundDuration * 0.8); delay.delayTime.setValueAtTime(delayTime, now); feedback.gain.setValueAtTime(delayFeedback, now); wetLevel.gain.setValueAtTime(delayWetLevel, now); const oscillators = []; const frequencies = [baseFreq, baseFreq * 2, baseFreq * 3, baseFreq * 4]; frequencies.forEach((freq, index) => { if (index >= organVolumes.length) return; const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now); const gain = audioCtx.createGain(); gain.gain.setValueAtTime(organVolumes[index], now); osc.connect(gain).connect(mainGain); oscillators.push(osc); osc.start(now); osc.stop(now + soundDuration); }); mainGain.connect(filter); filter.connect(audioCtx.destination); filter.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wetLevel); wetLevel.connect(audioCtx.destination); mainGain.gain.setValueAtTime(0, now); mainGain.gain.linearRampToValueAtTime(soundVolume, now + 0.01); mainGain.gain.linearRampToValueAtTime(0, now + soundDuration); }

function lerp(start, end, amount) { return start + (end - start) * amount; }

function lerpColor(color1, color2, amount) { const h = lerp(color1.h, color2.h, amount); const s = lerp(color1.s, color2.s, amount); const l = lerp(color1.l, color2.l, amount); return { h, s, l }; }

function project(x, y, z) { const relativeZ = z - cameraZ; if (relativeZ < nearClipDistance) { return { x: centerX, y: centerY, scale: 0 }; } const scale = fov / (fov + relativeZ); return { x: centerX + x * scale, y: centerY + y * scale, scale: scale }; }

function calculateOriginalPoints(ring) { ring.originalPoints = []; const radius = ring.specificBaseRadius; if (radius <= 0) return; for (let j = 0; j < pointsPerRing; j++) { const angle = (j / pointsPerRing) * Math.PI * 2; ring.originalPoints.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }); } }



// Функция создания/обновления данных кольца (с параметрами пульсации)

function setupRingData(ring, zIndex) {

    ring.z = zIndex;

    ring.specificBaseRadius = Math.max(1, baseRadius + (Math.random() - 0.5) * 2 * radiusVariation); // Используем увеличенный radiusVariation

    ring.radiusOscillationSpeed = basePulseSpeed * (0.7 + Math.random() * 0.6);

    ring.radiusOscillationPhase = Math.random() * Math.PI * 2;

    ring.radiusOscillationAmplitude = basePulseAmplitude * (0.5 + Math.random()); // Используем увеличенный basePulseAmplitude

    ring.points = [];

    ring.originalPoints = [];

    ring.ringCenterX = 0;

    ring.ringCenterY = 0;

    calculateOriginalPoints(ring);

}



function initRings() { rings = []; const currentMaxZ = numRings * ringSpacing; cameraZ = currentMaxZ / 3; for (let i = 0; i < numRings; i++) { const ring = {}; setupRingData(ring, cameraZ + i * ringSpacing); rings.push(ring); } }

function initStars() { stars = []; maxStarZ = Math.max(width, height, 500); for (let i = 0; i < numStars; i++) { stars.push({ x: Math.random() * width, y: Math.random() * height, z: Math.random() * maxStarZ }); } }

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; centerX = width / 2; centerY = height / 2; targetX = 0; targetY = 0; currentX = 0; currentY = 0; maxZ = numRings * ringSpacing; cameraZ = maxZ / 3; lastTime = performance.now(); initRings(); initStars(); }



// --- ОБРАБОТЧИКИ ВВОДА ---

function handleMouseMove(event) { targetX = (event.clientX - centerX) * targetInfluence; targetY = (event.clientY - centerY) * targetInfluence; }

function handleTouchMove(event) { event.preventDefault(); if (event.touches.length > 0) { const touchX = event.touches[0].clientX; const touchY = event.touches[0].clientY; targetX = (touchX - centerX) * targetInfluence; targetY = (touchY - centerY) * targetInfluence; } }

// --- Функции Активации/Разблокировки Звука ---

function unlockAudio() { if (!audioCtx || audioCtx.state !== 'running') { return; } const buffer = audioCtx.createBuffer(1, 1, 22050); const source = audioCtx.createBufferSource(); source.buffer = buffer; source.connect(audioCtx.destination); source.start(); source.onended = () => { source.disconnect(); }; }

function initializeAudio() { if (audioContextResumed) return; audioContextResumed = true; if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (!audioCtx) { return; } } catch (e) { return; } } if (audioCtx.state === 'suspended') { audioCtx.resume().then(() => { unlockAudio(); }).catch(e => {}); } else if (audioCtx.state === 'running') { unlockAudio(); } }

// --- Функции обновления и отрисовки звезд ---

function updateStars(dt) { if (dt <= 0) return; stars.forEach(star => { const vecX = star.x - centerX; const vecY = star.y - centerY; const moveSpeed = starSpeedFactor / (star.z + 1); star.x += vecX * moveSpeed * dt; star.y += vecY * moveSpeed * dt; if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) { star.x = Math.random() * width; star.y = Math.random() * height; star.z = Math.random() * maxStarZ; } }); }

function drawStars() { ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, width, height); stars.forEach(star => { const depthFactor = star.z / maxStarZ; const radius = lerp(maxStarRadius, minStarRadius, depthFactor); let alpha = lerp(maxStarAlpha, minStarAlpha, depthFactor); if (Math.random() < twinkleChance) { alpha *= (1.0 - twinkleAmount + Math.random() * twinkleAmount * 2); } alpha = Math.max(0, Math.min(1, alpha)); if (radius <= 0 || alpha <= 0) return; const parallaxFactor = 5 / (star.z + 10); const displayX = star.x - currentX * parallaxFactor; const displayY = star.y - currentY * parallaxFactor; ctx.beginPath(); ctx.arc(displayX, displayY, radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; ctx.fill(); }); }



function animate() {

  requestAnimationFrame(animate);

  const currentTime = performance.now(); let deltaTime = (currentTime - lastTime) / 1000; if (deltaTime <= 0 || deltaTime > 0.1) { deltaTime = 1 / 60; } lastTime = currentTime;

  currentX = lerp(currentX, targetX, followSpeed); currentY = lerp(currentY, targetY, followSpeed);

  updateStars(deltaTime); drawStars();

  const timeFactorForWave = currentTime * waveSpeedT; const currentMaxZ = numRings * ringSpacing;



  // Обновление колец (с пульсацией)

  rings.forEach((ring, i) => {

    ring.z -= tunnelSpeed * deltaTime; const relativeZ = ring.z - cameraZ;

    if (relativeZ < nearClipDistance) { const oldRingCenterX = ring.ringCenterX; setupRingData(ring, cameraZ + currentMaxZ); ring.ringCenterX = oldRingCenterX; playSound(ring); } // Используем setupRingData для пересоздания

    const interpolationFactor = Math.max(0, relativeZ / currentMaxZ); const baseCenterX = currentX * interpolationFactor; const baseCenterY = currentY * interpolationFactor; const angleZ = ring.z * waveFrequencyZ; const waveOffsetX = waveAmplitudeX * Math.sin(angleZ + timeFactorForWave); const waveOffsetY = waveAmplitudeY * Math.cos(angleZ + timeFactorForWave); ring.ringCenterX = baseCenterX + waveOffsetX; ring.ringCenterY = baseCenterY + waveOffsetY;

    // Расчет случайной пульсации

    const currentPulseOffset = Math.sin(currentTime * ring.radiusOscillationSpeed + ring.radiusOscillationPhase) * ring.radiusOscillationAmplitude; // Используем увеличенную амплитуду

    const effectiveRadius = Math.max(1, ring.specificBaseRadius + currentPulseOffset);

    const radiusScale = ring.specificBaseRadius > 0 ? effectiveRadius / ring.specificBaseRadius : 1;

    // Проекция точек с масштабом

    ring.points = []; if (ring.originalPoints && ring.originalPoints.length > 0) { for (let j = 0; j < pointsPerRing; j++) { const basePoint = ring.originalPoints[j]; const currentXPoint = basePoint.x * radiusScale; const currentYPoint = basePoint.y * radiusScale; const worldX = ring.ringCenterX + currentXPoint; const worldY = ring.ringCenterY + currentYPoint; ring.points.push(project(worldX, worldY, ring.z)); } } });

  rings.sort((a, b) => b.z - a.z);



  // Отрисовка колец

  ctx.lineWidth = lineWidth; const currentMaxZForDrawing = numRings * ringSpacing; for (let i = 0; i < numRings - 1; i++) { const ring1 = rings[i]; const ring2 = rings[i + 1]; if (!ring1.points || !ring2.points || !ring1.points.length || !ring2.points.length || ring1.points[0].scale <= 0 ) continue; if (!ring2.points[0] || ring2.points[0].scale <= 0) { continue; } const ring1RelativeZ = ring1.z - cameraZ; let baseH, baseS, baseL; const midPointZ = currentMaxZForDrawing * midPointDepthFactor; if (ring1RelativeZ >= midPointZ) { const segmentLength = currentMaxZForDrawing - midPointZ; const normZ1 = segmentLength > 0 ? Math.max(0, Math.min(1, (currentMaxZForDrawing - ring1RelativeZ) / segmentLength)) : 1; const color = lerpColor(colorWhite, colorBlue, normZ1); baseH = color.h; baseS = color.s; baseL = color.l; } else { const segmentLength = midPointZ - nearClipDistance; const normZ2 = segmentLength > 0 ? Math.max(0, Math.min(1, (midPointZ - ring1RelativeZ) / segmentLength)) : 1; const color = lerpColor(colorBlue, colorGreen, normZ2); baseH = color.h; baseS = color.s; baseL = color.l; } const baseAlpha = Math.max(0, 1 - ring1RelativeZ / (currentMaxZForDrawing * 0.7));

    for (let j = 0; j < pointsPerRing; j++) { const p1 = ring1.points[j]; const p2 = ring1.points[(j + 1) % pointsPerRing]; if (!p1 || !p2 || p1.scale <= 0 || p2.scale <= 0) continue; const hueOffset = (j / pointsPerRing) * segmentHueShift; const finalHue = (baseH + hueOffset) % 360; ctx.strokeStyle = `hsla(${finalHue}, ${baseS}%, ${baseL}%, ${baseAlpha})`; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); if (ring2.points.length > j) { const p3_target = ring2.points[j]; if (p3_target && p3_target.scale > 0) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p3_target.x, p3_target.y); ctx.stroke(); } } }

  }

}



// --- СЛУШАТЕЛИ СОБЫТИЙ ---

window.addEventListener('resize', resize);

window.addEventListener('mousemove', handleMouseMove);

window.addEventListener('touchmove', handleTouchMove, { passive: false });

window.addEventListener('click', initializeAudio, { once: true });

window.addEventListener('touchstart', initializeAudio, { once: true });

// -------------------------



resize();

lastTime = performance.now();

animate();