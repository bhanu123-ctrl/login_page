'use strict';

function $(id) { return document.getElementById(id); }
function $q(sel) { return document.querySelector(sel); }
function $qa(sel) { return document.querySelectorAll(sel); }

const bar         = $('loading-bar');
const pctEl       = $('load-pct');
const loadNode    = $('load-node');
const scrollFill  = $('scroll-fill');
const indicator   = $('scroll-indicator');
const loginCard   = $('login-card');
const loginForm   = $('login-form');
const accessBtn   = $('access-btn');
const loadSection = $('loading-section');
const navClock    = $('nav-clock');
const navStatus   = $('nav-status-text');
const cursorArrow = $('cursor-arrow');
const eyebrowText = $q('.eyebrow-text');
const uidInput    = $('uid');
const pwdInput    = $('pwd');
const togglePwd   = $('toggle-pwd');
const uidHint     = $q('#ig-uid .input-hint');
const pwdHint     = $q('#ig-pwd .input-hint');

function setCursorPos(x, y) {
  if (!cursorArrow) return;
  cursorArrow.style.left = x + 'px';
  cursorArrow.style.top = y + 'px';
}

const CREDENTIALS = {
  'bhanu':   'cyber2099',
  'admin':   'neural#99',
  'guest':   'access007',
};

document.addEventListener('pointermove', e => {
  if (e.pointerType && e.pointerType !== 'mouse') return;
  setCursorPos(e.clientX, e.clientY);
}, { passive: true });

document.addEventListener('mousedown', () => document.body.classList.add('cursor-active'));
document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-active'));

document.addEventListener('mouseleave', () => {
  if (cursorArrow) cursorArrow.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  if (cursorArrow) cursorArrow.style.opacity = '1';
});

(function initParticles() {
  const canvas = $('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = Math.min(70, Math.floor(window.innerWidth / 20));

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:  Math.random() * 2000,
      y:  Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.3,
      a:  Math.random()
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      p.a += 0.003;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,26,60,${(Math.sin(p.a) * 0.3 + 0.4).toFixed(2)})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,26,60,${((1 - d/120) * 0.15).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  drawParticles();
})();

function updateClock() {
  if (!navClock) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  navClock.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);


const nodes = ['NODE: NYC-7', 'NODE: LON-3', 'NODE: SGP-1', 'NODE: TKY-9'];

function animateLoadBar(onComplete) {
  let value    = 0;
  let rafId    = null;
  let lastTime = null;
  let nodeIdx  = 0;
  const RATE   = 1.4;

  const nodeInterval = setInterval(() => {
    if (loadNode) loadNode.textContent = nodes[nodeIdx++ % nodes.length];
  }, 600);

  function tick(now) {
    if (!lastTime) lastTime = now;
    const delta = now - lastTime;
    lastTime = now;
    const step = (delta / 16) * RATE * ((100 - value) / 100) * 2.8;
    value = Math.min(value + step, 99.9);

    if (bar)   bar.style.width    = value.toFixed(1) + '%';
    if (pctEl) pctEl.textContent  = Math.floor(value) + '%';

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return {
    complete() {
      clearInterval(nodeInterval);
      cancelAnimationFrame(rafId);
      value = 100;
      if (bar)   bar.style.width   = '100%';
      if (pctEl) pctEl.textContent = '100%';
      if (loadNode) setTimeout(() => { loadNode.textContent = 'NODE: SECURE'; }, 200);
      if (typeof onComplete === 'function') onComplete();
    },
    cancel() {
      clearInterval(nodeInterval);
      cancelAnimationFrame(rafId);
    }
  };
}

function setLoadProgress(value) {
  const v = Math.max(0, Math.min(100, value));
  if (bar) bar.style.width = v + '%';
  if (pctEl) pctEl.textContent = Math.floor(v) + '%';
  if (loadNode) loadNode.textContent = v >= 100 ? 'NODE: SECURE' : 'NODE: —';
}

setLoadProgress(0);

let ticking = false, scrollY = 0;

function processScroll() {
  ticking = false;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const ratio = Math.min(scrollY / maxScroll, 1);

  if (scrollFill) scrollFill.style.width = (ratio * 100) + '%';
  if (indicator)  indicator.style.opacity = scrollY > 60 ? '0' : '1';
}

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  if (!ticking) { requestAnimationFrame(processScroll); ticking = true; }
}, { passive: true });

let mouseX = 0.5, mouseY = 0.5;
let tiltEnabled = false;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

(function heroParallax() {
  if (loginCard && tiltEnabled && window.matchMedia('(hover: hover)').matches) {
    const tx = (mouseX - 0.5) * 8;
    const ty = (mouseY - 0.5) * 5;
    loginCard.style.transform = `perspective(800px) rotateY(${tx}deg) rotateX(${-ty}deg)`;
  } else if (loginCard && !tiltEnabled) {
    loginCard.style.transform = '';
  }
  requestAnimationFrame(heroParallax);
})();

if (loginCard) {
  loginCard.addEventListener('mouseenter', () => { tiltEnabled = true; });
  loginCard.addEventListener('mouseleave', () => { tiltEnabled = false; });
}

if (togglePwd && pwdInput) {
  togglePwd.addEventListener('click', () => {
    const visible = pwdInput.type === 'text';
    pwdInput.type = visible ? 'password' : 'text';
    togglePwd.querySelector('.eye-icon').textContent = visible ? '◎' : '◉';
    togglePwd.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  });
}

function showHint(hintEl, msg) {
  if (!hintEl) return;
  hintEl.textContent = msg;
  hintEl.classList.add('visible');
}
function clearHint(hintEl) {
  if (!hintEl) return;
  hintEl.classList.remove('visible');
}

if (uidInput) {
  uidInput.addEventListener('blur', () => {
    if (uidInput.value && uidInput.value.trim().length < 3) {
      showHint(uidHint, '⚠ IDENTIFIER TOO SHORT — MIN 3 CHARS');
    } else { clearHint(uidHint); }
  });
  uidInput.addEventListener('focus', () => clearHint(uidHint));
}

if (pwdInput) {
  pwdInput.addEventListener('blur', () => {
    if (pwdInput.value && pwdInput.value.length < 6) {
      showHint(pwdHint, '⚠ CIPHER KEY TOO SHORT — MIN 6 CHARS');
    } else { clearHint(pwdHint); }
  });
  pwdInput.addEventListener('focus', () => clearHint(pwdHint));
}

function shakeCard() {
  if (!loginCard) return;
  loginCard.classList.remove('shaking');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    loginCard.classList.add('shaking');
    loginCard.addEventListener('animationend', () => {
      loginCard.classList.remove('shaking');
    }, { once: true });
  }));
}

function sanitise(str) {
  return str.trim().replace(/[<>"'`]/g, '').slice(0, 128);
}

let loginLoader = null;

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    if (accessBtn && accessBtn.disabled) return;

    const username = sanitise(uidInput?.value ?? '');
    const password = sanitise(pwdInput?.value ?? '');

    let hasError = false;
    if (!username || username.length < 3) {
      showHint(uidHint, '⚠ VALID IDENTIFIER REQUIRED');
      hasError = true;
    }
    if (!password || password.length < 6) {
      showHint(pwdHint, '⚠ INVALID PASSWORD');
      hasError = true;
    }
    if (hasError) { shakeCard(); return; }

    if (accessBtn) {
      accessBtn.disabled = true;
      const btnText = accessBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'ACCESSING...';
    }

    if (bar)   bar.style.width   = '0%';
    if (pctEl) pctEl.textContent = '0%';
    if (loginLoader) loginLoader.cancel();

    loginLoader = animateLoadBar();

    setTimeout(() => {
      if (loginLoader) { loginLoader.complete(); loginLoader = null; }

      if (accessBtn) {
        accessBtn.classList.add('success');
        const btnText = accessBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = '✓  ACCESS GRANTED';
      }

      if (loadSection) {
        setTimeout(() => {
          loadSection.style.transition = 'opacity 0.8s';
          loadSection.style.opacity   = '0.35';
        }, 900);
      }

      setTimeout(() => {
        window.location.href = 'terminal.html';
      }, 900);

    }, 2400);
  });
}
window.addEventListener('beforeunload', () => {
  if (loginLoader) loginLoader.cancel();
});
