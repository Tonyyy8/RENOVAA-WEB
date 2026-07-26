const DEMO_EMAIL = 'hello@renovaa.net';
let billingMode = 'monthly';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

document.body.style.transition = 'opacity .45s ease';
document.body.style.opacity = '0';
setTimeout(() => { document.body.style.opacity = '1'; }, 10);
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;
  if (/^https?:\/\//i.test(href)) return;
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 450);
  });
});

const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.playsInline = true;
  heroVideo.setAttribute('playsinline', '');
  heroVideo.setAttribute('webkit-playsinline', '');
  heroVideo.loop = false;
  let reversing = false;
  const playForward = () => {
    if (reversing) return;
    heroVideo.playbackRate = 1;
    const p = heroVideo.play();
    if (p && p.catch) p.catch(() => {});
  };
  const stepReverse = () => {
    if (!reversing) return;
    const dt = 1 / 30;
    const t = heroVideo.currentTime - dt;
    if (t <= 0) {
      heroVideo.currentTime = 0;
      reversing = false;
      playForward();
      return;
    }
    heroVideo.currentTime = t;
    requestAnimationFrame(stepReverse);
  };
  const playReverse = () => {
    heroVideo.pause();
    reversing = true;
    requestAnimationFrame(stepReverse);
  };
  playForward();
  heroVideo.addEventListener('canplay', playForward);
  heroVideo.addEventListener('loadeddata', playForward);
  heroVideo.addEventListener('ended', playReverse);
  let retries = 0;
  const retryTimer = setInterval(() => {
    retries += 1;
    if (!reversing && heroVideo.paused && heroVideo.readyState >= 2) playForward();
    if ((!heroVideo.paused || retries > 20) ) clearInterval(retryTimer);
  }, 300);
  document.addEventListener('touchstart', () => { if (heroVideo.paused && !reversing) playForward(); }, { once: true, passive: true });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.reveal').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('visible');
  else observer.observe(el);
});

const billingSwitch = document.getElementById('billing-switch');
function updatePricing() {
  document.querySelectorAll('.price-row strong[data-monthly]').forEach(el => {
    el.textContent = el.dataset[billingMode];
  });
  document.querySelectorAll('.old-price,.old-year').forEach(el => {
    el.textContent = el.dataset[billingMode];
  });
  document.querySelectorAll('.billing-note[data-monthly]').forEach(el => {
    el.textContent = el.dataset[billingMode];
  });
  document.querySelector('.monthly-label')?.classList.toggle('active', billingMode === 'monthly');
  document.querySelector('.annual-label')?.classList.toggle('active', billingMode === 'annual');
}
billingSwitch?.addEventListener('change', () => {
  billingMode = billingSwitch.checked ? 'annual' : 'monthly';
  updatePricing();
});
updatePricing();


const form = document.getElementById('demo-form');
const status = document.getElementById('form-status');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const subject = encodeURIComponent(`RENOVAA Get Started${data.plan ? ' — ' + data.plan : ''}`);
  const body = encodeURIComponent(`First name: ${data.demoFirstName}\nLast name: ${data.demoLastName}\nCompany name: ${data.company}\nCompany email: ${data.email}\nWebsite: ${data.website || ''}${data.plan ? `\nPlan: ${data.plan}` : ''}`);
  status.textContent = 'Opening your email client to complete the request.';
  window.location.href = `mailto:${DEMO_EMAIL}?subject=${subject}&body=${body}`;
});
