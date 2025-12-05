let GRID_SIZE = 200
let canvas, ctx
let cellSize = 4
let probe = { x: -1, y: -1 }
let sub = { x: 0, y: 0 }
let started = false
let turnCount = 0
let autoRadiusBase = 5
let radiusIncreaseEvery = 50
let manualRadius = 0
let moveSubEvery = 3
let winDistance = 2
let timerStart = 0
let timerId = null
let leaderboardKey = 'subhunt-leaderboard'
let probeImg = new Image()
let subImg = new Image()
let assetsReady = false
probeImg.src = 'probe.png'
subImg.src = 'submarine.png'
Promise.all([new Promise(r => probeImg.onload = r), new Promise(r => subImg.onload = r)]).then(() => { assetsReady = true; if (window._initCalled) render() })
function qs(id) { return document.getElementById(id) }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function distance(a, b) { let dx = a.x - b.x; let dy = a.y - b.y; return Math.hypot(dx, dy) }
function placeRandomSub() { sub.x = randInt(0, GRID_SIZE - 1); sub.y = randInt(0, GRID_SIZE - 1) }
function startTimer() { if (timerId) clearInterval(timerId); timerStart = performance.now(); timerId = setInterval(() => { qs('timer').textContent = ((performance.now() - timerStart) / 1000).toFixed(2) + 's' }, 100) }
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null } }

let lastProbePrevDistance = null
let lastProbeCurrDistance = null

function effectiveRadius() {
	let auto = autoRadiusBase + Math.floor(turnCount / radiusIncreaseEvery)
	if (manualRadius > 0) return clamp(manualRadius, 1, auto)
	if (probe.x < 0) return auto
	let prev = (lastProbePrevDistance === null || lastProbePrevDistance === undefined) ? null : lastProbePrevDistance
	let curr = (lastProbeCurrDistance === null || lastProbeCurrDistance === undefined) ? distance(probe, sub) : lastProbeCurrDistance
	if (curr <= 8) auto = Math.max(1, auto - 2)
	else if (curr <= 20) auto = Math.max(1, auto - 1)
	if (prev !== null && curr < prev) auto = Math.max(1, auto - 1)
	return clamp(auto, 1, Math.max(auto, 1))
}

function compassDir(from, to) { let dx = to.x - from.x; let dy = to.y - from.y; if (Math.hypot(dx, dy) < 1e-9) return 'here'; let ang = Math.atan2(-dy, dx); let deg = (ang * 180 / Math.PI + 360) % 360; if (deg >= 337.5 || deg < 22.5) return 'E'; if (deg < 67.5) return 'NE'; if (deg < 112.5) return 'N'; if (deg < 157.5) return 'NW'; if (deg < 202.5) return 'W'; if (deg < 247.5) return 'SW'; if (deg < 292.5) return 'S'; return 'SE' }
function computeSizes() { let desired = 800; canvas.width = desired; canvas.height = desired; cellSize = Math.max(1, Math.floor(canvas.width / GRID_SIZE)) }

function renderGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	if (GRID_SIZE <= 300 || (GRID_SIZE * GRID_SIZE) <= 200000) {
		for (let gx = 0; gx < GRID_SIZE; gx++) {
			for (let gy = 0; gy < GRID_SIZE; gy++) {
				let sx = gx * cellSize, sy = gy * cellSize
				ctx.fillStyle = ((gx + gy) % 2 === 0) ? '#042033' : '#032634'
				ctx.fillRect(sx, sy, cellSize, cellSize)
			}
		}
	} else {
		ctx.fillStyle = '#042033'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.beginPath()
		ctx.strokeStyle = 'rgba(0,0,0,0.18)'
		ctx.lineWidth = 1
		let step = Math.max(1, Math.floor(GRID_SIZE / 200))
		for (let gx = 0; gx < GRID_SIZE; gx += step) {
			let sx = gx * cellSize + 0.5
			ctx.moveTo(sx, 0.5); ctx.lineTo(sx, canvas.height + 0.5)
		}
		for (let gy = 0; gy < GRID_SIZE; gy += step) {
			let sy = gy * cellSize + 0.5
			ctx.moveTo(0.5, sy); ctx.lineTo(canvas.width + 0.5, sy)
		}
		ctx.stroke()
	}
	if (probe.x >= 0) {
		let px = probe.x * cellSize + cellSize * 0.5
		let py = probe.y * cellSize + cellSize * 0.5
		let eff = effectiveRadius() * cellSize
		let g = ctx.createRadialGradient(px, py, Math.max(4, cellSize * 0.5), px, py, eff)
		g.addColorStop(0, 'rgba(125,211,252,0.18)'); g.addColorStop(0.6, 'rgba(125,211,252,0.06)'); g.addColorStop(1, 'rgba(125,211,252,0)')
		ctx.beginPath(); ctx.fillStyle = g; ctx.arc(px, py, eff, 0, Math.PI * 2); ctx.fill()
		ctx.beginPath(); ctx.lineWidth = Math.max(1, Math.floor(cellSize / 2)); ctx.strokeStyle = 'rgba(125,211,252,0.28)'; ctx.arc(px, py, eff, 0, Math.PI * 2); ctx.stroke()
		if (assetsReady) {
			let w = Math.max(6, Math.floor(cellSize * 2.2))
			let h = w
			let prevSmoothing = ctx.imageSmoothingEnabled
			ctx.imageSmoothingEnabled = false
			ctx.save()
			ctx.translate(px - w / 2, py - h / 2)
			ctx.drawImage(probeImg, 0, 0, probeImg.width, probeImg.height, 0, 0, w, h)
			ctx.restore()
			ctx.imageSmoothingEnabled = prevSmoothing
		} else {
			ctx.save(); ctx.beginPath(); ctx.shadowColor = 'rgba(125,211,252,0.55)'; ctx.shadowBlur = Math.max(6, cellSize * 1.5); ctx.fillStyle = '#7dd3fc'; ctx.arc(px, py, Math.max(1, cellSize * 0.9), 0, Math.PI * 2); ctx.fill(); ctx.restore()
		}
		if (distance(probe, sub) <= effectiveRadius()) {
			ctx.beginPath(); ctx.fillStyle = 'rgba(255,235,120,0.06)'; ctx.arc(px, py, Math.max(12, eff), 0, Math.PI * 2); ctx.fill()
			qs('detectionMsg').textContent = compassDir(probe, sub)
			ctx.beginPath(); ctx.strokeStyle = 'rgba(255,235,120,0.18)'; ctx.lineWidth = Math.max(1, Math.floor(cellSize / 1.5)); ctx.arc(px, py, Math.max(12, eff) * 0.6, 0, Math.PI * 2); ctx.stroke()
		} else { qs('detectionMsg').textContent = 'none' }
		ctx.beginPath(); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1; ctx.arc(px, py, Math.max(1, cellSize * 0.9) + 0.5, 0, Math.PI * 2); ctx.stroke()
	} else { qs('detectionMsg').textContent = 'none' }
	qs('effectiveRadius').textContent = effectiveRadius()
	qs('turnCount').textContent = turnCount
}

function render() { computeSizes(); renderGrid() }

function moveProbe(dir) {
	if (!started) return
	let prev = (probe.x >= 0) ? distance(probe, sub) : null
	let nx = probe.x, ny = probe.y
	if (dir === 'N') ny -= 1
	if (dir === 'S') ny += 1
	if (dir === 'E') nx += 1
	if (dir === 'W') nx -= 1
	nx = clamp(nx, 0, GRID_SIZE - 1); ny = clamp(ny, 0, GRID_SIZE - 1)
	if (nx === probe.x && ny === probe.y) return
	probe.x = nx; probe.y = ny; turnCount += 1
	lastProbePrevDistance = prev
	lastProbeCurrDistance = distance(probe, sub)
	if (moveSubEvery > 0 && turnCount % moveSubEvery === 0) moveSub()
	checkWin(); render()
	lastProbePrevDistance = lastProbeCurrDistance
}

function moveSub() { let choices = [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }]; let c = choices[randInt(0, choices.length - 1)]; sub.x = clamp(sub.x + c.dx, 0, GRID_SIZE - 1); sub.y = clamp(sub.y + c.dy, 0, GRID_SIZE - 1) }

let foundAnimating = false

function animateFoundVisual(done) {
	if (foundAnimating) return
	foundAnimating = true
	let start = performance.now()
	let duration = 1400
	let px = sub.x * cellSize + cellSize * 0.5
	let py = sub.y * cellSize + cellSize * 0.5
	let maxR = Math.max(80, effectiveRadius() * cellSize * 2.5)
	let particles = []
	for (let i = 0; i < 50; i++) {
		let ang = Math.random() * Math.PI * 2
		let sp = 1 + Math.random() * 3
		particles.push({ x: px, y: py, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, dec: 0.02 + Math.random() * 0.02, size: 1 + Math.random() * 2 })
	}
	function frame(now) {
		let elapsed = now - start
		let t = elapsed / duration
		if (t > 1) t = 1
		renderGrid()
		let ringCount = 3
		for (let k = 0; k < ringCount; k++) {
			let kT = Math.max(0, (t - k * 0.12) / (1 - k * 0.12))
			if (kT > 0) {
				ctx.beginPath()
				ctx.lineWidth = Math.max(1, Math.floor(cellSize * 0.6 * (1 - k * 0.12)))
				ctx.strokeStyle = `rgba(255,235,120,${(1 - kT) * 0.25})`
				ctx.arc(px, py, kT * (maxR * (1 + k * 0.35)), 0, Math.PI * 2)
				ctx.stroke()
			}
		}
		if (assetsReady) {
			let scale = 1 + 0.35 * Math.sin(t * Math.PI)
			let w = Math.max(12, Math.floor(subImg.width * (cellSize / 16) * scale))
			let h = Math.max(8, Math.floor(subImg.height * (cellSize / 16) * scale))
			let prevSmoothing = ctx.imageSmoothingEnabled
			ctx.imageSmoothingEnabled = false
			ctx.save()
			ctx.translate(px - w / 2, py - h / 2)
			ctx.globalAlpha = 0.95
			ctx.drawImage(subImg, 0, 0, subImg.width, subImg.height, 0, 0, w, h)
			ctx.restore()
			ctx.imageSmoothingEnabled = prevSmoothing
		} else {
			ctx.beginPath(); ctx.fillStyle = '#fff9e0'; ctx.arc(px, py, Math.max(6, cellSize * 1.5), 0, Math.PI * 2); ctx.fill()
		}
		for (let p of particles) {
			p.x += p.vx * (1 + (Math.random() - 0.5) * 0.2)
			p.y += p.vy * (1 + (Math.random() - 0.5) * 0.2)
			p.vy += 0.02
			p.life -= p.dec
			if (p.life > 0) {
				ctx.beginPath()
				ctx.globalAlpha = Math.max(0, p.life)
				ctx.fillStyle = 'rgba(255,200,80,0.9)'
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
				ctx.fill()
				ctx.globalAlpha = 1
			}
		}
		if (t < 1) {
			requestAnimationFrame(frame)
		} else {
			foundAnimating = false
			done()
		}
	}
	requestAnimationFrame(frame)
}

function checkWin() { if (distance(probe, sub) <= winDistance) { stopTimer(); render(); setTimeout(() => onWin(), 50) } }

function onWin() { stopTimer(); animateFoundVisual(function() { let elapsed = (performance.now() - timerStart) / 1000; let name = prompt('You found the submarine in ' + elapsed.toFixed(2) + 's. Enter name for leaderboard:', 'Player'); if (name) { let b = JSON.parse(localStorage.getItem(leaderboardKey) || '[]'); b.push({ name: name, time: elapsed, date: (new Date()).toISOString(), grid: GRID_SIZE }); b.sort((a, b) => a.time - b.time); b = b.slice(0, 50); localStorage.setItem(leaderboardKey, JSON.stringify(b)); updateLeaderboard() } }) }

function updateLeaderboard() { let board = JSON.parse(localStorage.getItem(leaderboardKey) || '[]'); let ol = qs('leaderboardList'); ol.innerHTML = ''; for (let i = 0; i < Math.min(10, board.length); i++) { let li = document.createElement('li'); li.textContent = `${board[i].name} — ${board[i].time.toFixed(2)}s (${board[i].grid}×${board[i].grid})`; ol.appendChild(li) } }

function resetTimerDisplay() { stopTimer(); timerStart = 0; qs('timer').textContent = '0.00s' }

function newGame() {
	GRID_SIZE = parseInt(qs('gridSizeSelect').value, 10)
	radiusIncreaseEvery = parseInt(qs('radiusIncreaseEvery').value, 10)
	moveSubEvery = parseInt(qs('moveSubEvery').value, 10)
	winDistance = parseInt(qs('winDistance').value, 10)
	placeRandomSub()
	probe.x = -1; probe.y = -1; started = false; turnCount = 0; manualRadius = 0
	qs('manualRadius').max = Math.max(10, Math.floor(Math.sqrt(GRID_SIZE) / 2))
	qs('manualRadius').value = 0; qs('manualRadiusLabel').textContent = 'auto'
	qs('detectionMsg').textContent = 'none'; qs('effectiveRadius').textContent = autoRadiusBase; qs('turnCount').textContent = '0'
	lastProbePrevDistance = null; lastProbeCurrDistance = null
	resetTimerDisplay(); updateLeaderboard(); render()
}

function showInstructions() {
	qs('instructionsModal').classList.remove('hidden')
	qs('instr_gridSize').value = qs('gridSizeSelect').value
	qs('instr_radiusIncreaseEvery').value = qs('radiusIncreaseEvery').value
	qs('instr_moveSubEvery').value = qs('moveSubEvery').value
	qs('instr_winDistance').value = qs('winDistance').value
	qs('instr_startMode').value = 'place'
}

function hideInstructions() {
	qs('instructionsModal').classList.add('hidden')
}

function applyInstructionsAndStart() {
	let g = parseInt(qs('instr_gridSize').value, 10)
	let r = parseInt(qs('instr_radiusIncreaseEvery').value, 10)
	let m = parseInt(qs('instr_moveSubEvery').value, 10)
	let w = parseInt(qs('instr_winDistance').value, 10)
	let startMode = qs('instr_startMode').value
	qs('gridSizeSelect').value = g
	qs('radiusIncreaseEvery').value = r
	qs('moveSubEvery').value = m
	qs('winDistance').value = w
	GRID_SIZE = g
	radiusIncreaseEvery = r
	moveSubEvery = m
	winDistance = w
	hideInstructions()
	placeRandomSub()
	probe.x = -1; probe.y = -1; started = false; turnCount = 0; manualRadius = 0
	qs('manualRadius').max = Math.max(10, Math.floor(Math.sqrt(GRID_SIZE) / 2))
	qs('manualRadius').value = 0; qs('manualRadiusLabel').textContent = 'auto'
	qs('detectionMsg').textContent = 'none'; qs('effectiveRadius').textContent = autoRadiusBase; qs('turnCount').textContent = '0'
	lastProbePrevDistance = null; lastProbeCurrDistance = null
	resetTimerDisplay(); updateLeaderboard()
	if (startMode === 'center') {
		computeSizes()
		probe.x = Math.floor(GRID_SIZE / 2)
		probe.y = Math.floor(GRID_SIZE / 2)
		started = true
		startTimer()
	}
	render()
}

function init() {
	canvas = qs('gameCanvas'); ctx = canvas.getContext('2d')
	window._initCalled = true
	window.addEventListener('resize', () => render())
	canvas.addEventListener('click', function(e) {
		let rect = canvas.getBoundingClientRect()
		let mx = e.clientX - rect.left
		let my = e.clientY - rect.top
		let gx = Math.floor(mx / cellSize)
		let gy = Math.floor(my / cellSize)
		gx = clamp(gx, 0, GRID_SIZE - 1); gy = clamp(gy, 0, GRID_SIZE - 1)
		if (probe.x < 0) { probe.x = gx; probe.y = gy; started = true; startTimer(); lastProbePrevDistance = null; lastProbeCurrDistance = distance(probe, sub); render(); return }
		let prev = distance(probe, sub)
		probe.x = gx; probe.y = gy; turnCount += 1
		lastProbePrevDistance = prev
		lastProbeCurrDistance = distance(probe, sub)
		if (moveSubEvery > 0 && turnCount % moveSubEvery === 0) moveSub()
		checkWin(); render()
		lastProbePrevDistance = lastProbeCurrDistance
	})
	window.addEventListener('keydown', function(e) { if (!started) return; if (e.key === 'ArrowUp') { moveProbe('N'); e.preventDefault() } if (e.key === 'ArrowDown') { moveProbe('S'); e.preventDefault() } if (e.key === 'ArrowLeft') { moveProbe('W'); e.preventDefault() } if (e.key === 'ArrowRight') { moveProbe('E'); e.preventDefault() } })
	qs('placeProbeBtn').addEventListener('click', function() { computeSizes(); probe.x = Math.floor(GRID_SIZE / 2); probe.y = Math.floor(GRID_SIZE / 2); started = true; startTimer(); lastProbePrevDistance = null; lastProbeCurrDistance = distance(probe, sub); render() })
	document.querySelectorAll('.move-buttons button').forEach(b => { b.addEventListener('click', () => { moveProbe(b.dataset.dir) }) })
	qs('manualRadius').addEventListener('input', function() { let v = parseInt(this.value, 10); if (v <= 0) { manualRadius = 0; qs('manualRadiusLabel').textContent = 'auto' } else { manualRadius = v; qs('manualRadiusLabel').textContent = v } render() })
	qs('resetRadius').addEventListener('click', function() { manualRadius = 0; qs('manualRadius').value = 0; qs('manualRadiusLabel').textContent = 'auto'; render() })
	qs('newGame').addEventListener('click', showInstructions)
	qs('instrStartBtn').addEventListener('click', applyInstructionsAndStart)
	qs('instrCancelBtn').addEventListener('click', hideInstructions)
	qs('gridSizeSelect').addEventListener('change', newGame)
	qs('moveSubEvery').addEventListener('change', function() { moveSubEvery = parseInt(this.value, 10) })
	qs('radiusIncreaseEvery').addEventListener('change', function() { radiusIncreaseEvery = parseInt(this.value, 10) })
	qs('winDistance').addEventListener('change', function() { winDistance = parseInt(this.value, 10) })
	updateLeaderboard()
	showInstructions()
}
window.addEventListener('load', init)

