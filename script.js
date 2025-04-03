const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let mouseX = 0, mouseY = 0; // Координаты для управления изгибом (мышь/тач)
let targetX = 0, targetY = 0; // Целевые значения для изгиба
let currentX = 0, currentY = 0; // Текущие значения для плавного изгиба

// --- Web Audio API ---
let audioCtx = null;
let audioContextResumed = false;
// ---------------------

// --- Переменные для Delta Time ---
let lastTime = 0;
// ---------------------------------

// --- Параметры ---
const numRings = 50;       // Как в вашем последнем коде
const pointsPerRing = 10;  // Как в вашем последнем коде
const ringSpacing = 3;     // Как в вашем последнем коде
const baseRadius = 400;    // Как в вашем последнем коде
const radiusVariation = 30;
const tunnelSpeed = 30;    // Скорость туннеля (для deltaTime)
const fov = 300;
const followSpeed = 0.05;  // Плавность изгиба
const targetInfluence = 1.5; // Сила влияния мыши/тач на изгиб
const lineWidth = 1;
let maxZ = numRings * ringSpacing;

// Параметры пульсации
const pulseAmplitude = 0; // Пульсация отключена
const pulseSpeed = 0.002;

// Параметры "змеиной" волны
const waveAmplitudeX = 60;
const waveAmplitudeY = 40;
const waveFrequencyZ = 0.02;
const waveSpeedT = 0.001;

// Управление Камерой
let cameraZ; // Позиция камеры (устанавливается в resize, НЕ МЕНЯЕТСЯ вводом)
const nearClipDistance = 1; // Точка срабатывания звука/пересоздания

// --- Цветовые константы (HSL) ---
const colorWhite = { h: 0, s: 0, l: 100 }; const colorBlue = { h: 240, s: 100, l: 50 }; const colorGreen = { h: 120, s: 100, l: 50 }; const midPointDepthFactor = 0.5;
// --- Звуковые параметры ---
const soundBaseFreq = 105; const soundFreqVariation = 22; const soundDuration = 0.2; const soundVolume = 0.4; const organVolumes = [0.6, 0.3, 0.15, 0.1];

// --- Параметры ЗВЕЗДНОГО ФОНА ---
const numStars = 500; let maxStarZ = 1; const maxStarRadius = 1.5; const minStarRadius = 0.1; const maxStarAlpha = 1.0; const minStarAlpha = 0.1; const twinkleChance = 0.01; const twinkleAmount = 0.4; const starSpeedFactor = 40;
// ----------------------------------

let rings = [];
let stars = [];

// --- Функции ---
function playSound() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (!audioCtx) { return; } } catch (e) { return; } } if (audioCtx.state === 'suspended') { audioCtx.resume().catch(e => {}); } if (audioCtx.state !== 'running') { return; } const now = audioCtx.currentTime; const baseFreq = soundBaseFreq + Math.random() * soundFreqVariation - soundFreqVariation / 2; const mainGain = audioCtx.createGain(); mainGain.connect(audioCtx.destination); mainGain.gain.setValueAtTime(0, now); mainGain.gain.linearRampToValueAtTime(soundVolume, now + 0.01); mainGain.gain.linearRampToValueAtTime(0, now + soundDuration); const oscillators = []; const frequencies = [baseFreq, baseFreq * 2, baseFreq * 3, baseFreq * 4]; frequencies.forEach((freq, index) => { if (index >= organVolumes.length) return; const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now); const gain = audioCtx.createGain(); gain.gain.setValueAtTime(organVolumes[index], now); osc.connect(gain).connect(mainGain); oscillators.push(osc); osc.start(now); osc.stop(now + soundDuration); }); }
function lerp(start, end, amount) { return start + (end - start) * amount; }
function lerpColor(color1, color2, amount) { const h = lerp(color1.h, color2.h, amount); const s = lerp(color1.s, color2.s, amount); const l = lerp(color1.l, color2.l, amount); return { h, s, l }; }
function project(x, y, z) { const relativeZ = z - cameraZ; if (relativeZ < nearClipDistance) { return { x: centerX, y: centerY, scale: 0 }; } const scale = fov / (fov + relativeZ); return { x: centerX + x * scale, y: centerY + y * scale, scale: scale }; }
function calculateOriginalPoints(ring) { ring.originalPoints = []; const radius = ring.specificBaseRadius; if (radius <= 0) return; for (let j = 0; j < pointsPerRing; j++) { const angle = (j / pointsPerRing) * Math.PI * 2; ring.originalPoints.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }); } }

function initRings() { rings = []; const currentMaxZ = numRings * ringSpacing; for (let i = 0; i < numRings; i++) { const ring = { z: cameraZ + i * ringSpacing, specificBaseRadius: Math.max(1, baseRadius + (Math.random() - 0.5) * 2 * radiusVariation), points: [], originalPoints: [], ringCenterX: 0, ringCenterY: 0 }; calculateOriginalPoints(ring); rings.push(ring); } }
function initStars() { stars = []; maxStarZ = Math.max(width, height, 500); for (let i = 0; i < numStars; i++) { stars.push({ x: Math.random() * width, y: Math.random() * height, z: Math.random() * maxStarZ }); } }

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; centerX = width / 2; centerY = height / 2; targetX = 0; targetY = 0; currentX = 0; currentY = 0; maxZ = numRings * ringSpacing; cameraZ = maxZ / 3; lastTime = performance.now(); initRings(); initStars(); }

// --- ОБРАБОТЧИКИ ВВОДА ---
// Мышь управляет изгибом
function handleMouseMove(event) {
    targetX = (event.clientX - centerX) * targetInfluence;
    targetY = (event.clientY - centerY) * targetInfluence;
}

// Касание управляет изгибом
function handleTouchMove(event) {
    event.preventDefault(); // Предотвращаем скролл страницы
    if (event.touches.length > 0) { // Используем первое касание
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        // Обновляем targetX/Y для изгиба
        targetX = (touchX - centerX) * targetInfluence;
        targetY = (touchY - centerY) * targetInfluence;
    }
}
// Функции handleOrientation, handleMouseWheel, handleTouchStart, handleTouchEnd УДАЛЕНЫ

// --- Функции Активации/Разблокировки Звука ---
function unlockAudio() { if (!audioCtx || audioCtx.state !== 'running') { return; } const buffer = audioCtx.createBuffer(1, 1, 22050); const source = audioCtx.createBufferSource(); source.buffer = buffer; source.connect(audioCtx.destination); source.start(); source.onended = () => { source.disconnect(); }; }
function initializeAudio() { if (audioContextResumed) return; audioContextResumed = true; if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (!audioCtx) { return; } } catch (e) { return; } } if (audioCtx.state === 'suspended') { audioCtx.resume().then(() => { unlockAudio(); }).catch(e => {}); } else if (audioCtx.state === 'running') { unlockAudio(); } }
// --- Конец функций звука ---

// --- Функции обновления и отрисовки звезд ---
function updateStars(dt) { if (dt <= 0) return; stars.forEach(star => { const vecX = star.x - centerX; const vecY = star.y - centerY; const moveSpeed = starSpeedFactor / (star.z + 1); star.x += vecX * moveSpeed * dt; star.y += vecY * moveSpeed * dt; if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) { star.x = Math.random() * width; star.y = Math.random() * height; star.z = Math.random() * maxStarZ; } }); }
function drawStars() { ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, width, height); stars.forEach(star => { const depthFactor = star.z / maxStarZ; const radius = lerp(maxStarRadius, minStarRadius, depthFactor); let alpha = lerp(maxStarAlpha, minStarAlpha, depthFactor); if (Math.random() < twinkleChance) { alpha *= (1.0 - twinkleAmount + Math.random() * twinkleAmount * 2); } alpha = Math.max(0, Math.min(1, alpha)); if (radius <= 0 || alpha <= 0) return; const parallaxFactor = 5 / (star.z + 10); const displayX = star.x - currentX * parallaxFactor; const displayY = star.y - currentY * parallaxFactor; ctx.beginPath(); ctx.arc(displayX, displayY, radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; ctx.fill(); }); }
// --- Конец функций звезд ---


function animate() {
  requestAnimationFrame(animate);
  // Расчет Delta Time
  const currentTime = performance.now(); let deltaTime = (currentTime - lastTime) / 1000; if (deltaTime <= 0 || deltaTime > 0.1) { deltaTime = 1 / 60; } lastTime = currentTime;

  // Обновляем плавный изгиб (targetX/Y меняются в handleMouseMove/handleTouchMove)
  currentX = lerp(currentX, targetX, followSpeed);
  currentY = lerp(currentY, targetY, followSpeed);

  updateStars(deltaTime); // Обновляем звезды
  drawStars();          // Рисуем фон со звездами

  const timeFactorForWave = currentTime * waveSpeedT;
  const currentMaxZ = numRings * ringSpacing;

  // Обновление колец
  rings.forEach((ring, i) => {
    ring.z -= tunnelSpeed * deltaTime; // Движение с учетом deltaTime
    const relativeZ = ring.z - cameraZ; // cameraZ статична

    if (relativeZ < nearClipDistance) {
      ring.z = cameraZ + currentMaxZ;
      ring.specificBaseRadius = Math.max(1, baseRadius + (Math.random() - 0.5) * 2 * radiusVariation);
      calculateOriginalPoints(ring);
      playSound();
    }

    // Расчет центра кольца (изгиб + волна)
    const interpolationFactor = Math.max(0, relativeZ / currentMaxZ);
    const baseCenterX = currentX * interpolationFactor; // Управляется мышью/касанием
    const baseCenterY = currentY * interpolationFactor; // Управляется мышью/касанием
    const angleZ = ring.z * waveFrequencyZ;
    const waveOffsetX = waveAmplitudeX * Math.sin(angleZ + timeFactorForWave);
    const waveOffsetY = waveAmplitudeY * Math.cos(angleZ + timeFactorForWave);
    ring.ringCenterX = baseCenterX + waveOffsetX;
    ring.ringCenterY = baseCenterY + waveOffsetY;

    // Проекция точек формы кольца
    ring.points = [];
    if (ring.originalPoints && ring.originalPoints.length > 0) {
        for (let j = 0; j < pointsPerRing; j++) {
            const currentXPoint = ring.originalPoints[j].x;
            const currentYPoint = ring.originalPoints[j].y;
            const worldX = ring.ringCenterX + currentXPoint;
            const worldY = ring.ringCenterY + currentYPoint;
            ring.points.push(project(worldX, worldY, ring.z));
        }
    }
  });
  rings.sort((a, b) => b.z - a.z);

  // Отрисовка колец
  ctx.lineWidth = lineWidth;
  const currentMaxZForDrawing = numRings * ringSpacing;
  for (let i = 0; i < numRings - 1; i++) { const ring1 = rings[i]; const ring2 = rings[i + 1]; if (!ring1.points || !ring2.points || !ring1.points.length || !ring2.points.length || ring1.points[0].scale <= 0 ) continue; if (!ring2.points[0] || ring2.points[0].scale <= 0) { continue; } const ring1RelativeZ = ring1.z - cameraZ; let H, S, L; const midPointZ = currentMaxZForDrawing * midPointDepthFactor; if (ring1RelativeZ >= midPointZ) { const segmentLength = currentMaxZForDrawing - midPointZ; const normZ1 = segmentLength > 0 ? Math.max(0, Math.min(1, (currentMaxZForDrawing - ring1RelativeZ) / segmentLength)) : 1; const color = lerpColor(colorWhite, colorBlue, normZ1); H = color.h; S = color.s; L = color.l; } else { const segmentLength = midPointZ - nearClipDistance; const normZ2 = segmentLength > 0 ? Math.max(0, Math.min(1, (midPointZ - ring1RelativeZ) / segmentLength)) : 1; const color = lerpColor(colorBlue, colorGreen, normZ2); H = color.h; S = color.s; L = color.l; } const alpha = Math.max(0, 1 - ring1RelativeZ / (currentMaxZForDrawing * 0.7)); ctx.strokeStyle = `hsla(${H}, ${S}%, ${L}%, ${alpha})`;
    for (let j = 0; j < pointsPerRing; j++) { const p1 = ring1.points[j]; const p2 = ring1.points[(j + 1) % pointsPerRing]; if (!p1 || !p2 || p1.scale <= 0 || p2.scale <= 0) continue; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); if (ring2.points.length > j) { const p3_target = ring2.points[j]; if (p3_target && p3_target.scale > 0) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p3_target.x, p3_target.y); ctx.stroke(); } } }
  }
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---
window.addEventListener('resize', resize);
window.addEventListener('mousemove', handleMouseMove);         // Мышь -> Изгиб
window.addEventListener('touchmove', handleTouchMove, { passive: false }); // Касание -> Изгиб
// Слушатели для wheel, touchstart, touchend, touchcancel удалены
// Слушатели для активации звука
window.addEventListener('click', initializeAudio, { once: true });
window.addEventListener('touchstart', initializeAudio, { once: true });
// -------------------------

resize();
lastTime = performance.now();
animate();