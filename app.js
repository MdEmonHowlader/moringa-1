/* ============================================================
   app.js — Moringa Leaf Disease Detection System
   ============================================================ */

'use strict';

// ── Dummy Prediction Database ────────────────────────────────
const DUMMY_PREDICTIONS = [
  {
    disease:     'Bacterial Leaf Spot',
    icon:        '🔴',
    confidence:  '94.38%',
    uncertainty: '3.21%',
    classProb:   '94.38%',
    decision:    'accepted',
    explanation: 'The model detected dark angular lesions with yellow halos typical of bacterial infections. ' +
                 'High activation was found near lesion boundaries and chlorotic zones. Confidence exceeds the ' +
                 'acceptance threshold; prediction is accepted as reliable.'
  },
  {
    disease:     'Cercospora Leaf Spot',
    icon:        '🟡',
    confidence:  '91.74%',
    uncertainty: '4.85%',
    classProb:   '91.74%',
    decision:    'accepted',
    explanation: 'Circular grayish-white spots with dark purple-brown borders were identified. ' +
                 'Integrated Gradients highlight the spot periphery and surrounding tissue discoloration ' +
                 'as the most influential features. Prediction confidence is high and uncertainty is within acceptable range.'
  },
  {
    disease:     'Healthy Leaf',
    icon:        '🌿',
    confidence:  '99.12%',
    uncertainty: '0.88%',
    classProb:   '99.12%',
    decision:    'accepted',
    explanation: 'No lesions, discoloration, or abnormal texture patterns were detected. ' +
                 'The model attributes the classification to uniform green pigmentation and intact leaf structure. ' +
                 'Extremely high confidence with negligible uncertainty confirms a healthy leaf specimen.'
  },
  {
    disease:     'Yellow Leaf',
    icon:        '🍂',
    confidence:  '87.56%',
    uncertainty: '8.42%',
    classProb:   '87.56%',
    decision:    'review',
    explanation: 'Widespread yellowing (chlorosis) was detected across the leaf surface. ' +
                 'However, uncertainty is elevated — the model cannot fully distinguish between ' +
                 'nutrient deficiency, fungal chlorosis, and natural senescence. ' +
                 'Expert review is recommended before finalizing the diagnosis.'
  }
];

// ── DOM Element Selectors ────────────────────────────────────
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
const backTop     = document.getElementById('back-top');
const navLinks    = document.querySelectorAll('.nav-link');

// Detection Elements
const uploadZone    = document.getElementById('upload-zone');
const fileInput     = document.getElementById('file-input');
const previewArea   = document.getElementById('preview-area');
const previewImg    = document.getElementById('preview-img');
const removeBtn     = document.getElementById('remove-btn');
const detectBtn     = document.getElementById('detect-btn');
const spinner       = document.getElementById('detecting-spinner');
const resultPanel   = document.getElementById('result-panel');

// Result display elements
const resultIcon            = document.getElementById('result-icon');
const resultDiseaseName     = document.getElementById('result-disease-name');
const resultDiseaseSub      = document.getElementById('result-disease-sub');
const resultConfidence      = document.getElementById('result-confidence');
const resultUncertainty     = document.getElementById('result-uncertainty');
const resultClassProb       = document.getElementById('result-class-prob');
const decisionIndicator     = document.getElementById('decision-indicator');
const decisionLabel         = document.getElementById('decision-label');
const decisionText          = document.getElementById('decision-text');
const resultExplanationText = document.getElementById('result-explanation-text');
const resultHeader          = document.getElementById('result-header');

// ── Navbar Scroll Behaviour ──────────────────────────────────
function onScroll() {
  // Navbar shadow
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top button
  if (window.scrollY > 400) {
    backTop.classList.add('visible');
  } else {
    backTop.classList.remove('visible');
  }

  // Active nav link highlighting
  updateActiveNavLink();

  // Scroll reveal
  revealOnScroll();
}

window.addEventListener('scroll', onScroll, { passive: true });

// ── Active Nav Link ──────────────────────────────────────────
const sections = ['hero', 'about', 'detection', 'diseases', 'model', 'trustworthy', 'workflow', 'performance', 'team'];

function updateActiveNavLink() {
  let currentSection = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 90) currentSection = id;
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === '#' + currentSection) {
      link.classList.add('active');
    }
  });
}

// ── Mobile Menu ──────────────────────────────────────────────
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen.toString());
});

// Close mobile menu on nav link click
document.querySelectorAll('#mobile-menu .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ── Smooth Scroll for all anchor links ──────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Back To Top ──────────────────────────────────────────────
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Scroll Reveal ────────────────────────────────────────────
function revealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

// Run on page load
revealOnScroll();

// ── Upload Zone ──────────────────────────────────────────────

// Drag & drop
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleFileSelected(file);
  } else {
    showUploadError('Please drop a valid image file (JPG, PNG, WEBP).');
  }
});

// Click to browse
uploadZone.addEventListener('click', e => {
  // Don't trigger if clicking the label (which already triggers file input)
  if (e.target.id === 'browse-label' || e.target.tagName === 'LABEL') return;
  fileInput.click();
});

// Keyboard accessibility for upload zone
uploadZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFileSelected(file);
});

function handleFileSelected(file) {
  // Validate size (10 MB)
  if (file.size > 10 * 1024 * 1024) {
    showUploadError('File size exceeds 10 MB. Please choose a smaller image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    previewArea.classList.add('visible');
    uploadZone.style.display = 'none';

    // Reset previous results
    resultPanel.classList.remove('visible');
    spinner.classList.remove('visible');
  };
  reader.readAsDataURL(file);
}

function showUploadError(msg) {
  const zone = uploadZone;
  const original = zone.style.border;
  zone.style.border = '2.5px dashed #ef4444';
  zone.style.background = '#fff5f5';

  const errEl = document.createElement('p');
  errEl.style.cssText = 'color:#ef4444;font-size:0.82rem;font-weight:600;margin-top:8px;';
  errEl.textContent = '⚠️ ' + msg;
  zone.appendChild(errEl);

  setTimeout(() => {
    zone.style.border = original;
    zone.style.background = '';
    if (errEl.parentNode) errEl.remove();
  }, 3500);
}

// Remove image
removeBtn.addEventListener('click', () => {
  resetUpload();
});

function resetUpload() {
  previewImg.src = '';
  previewArea.classList.remove('visible');
  uploadZone.style.display = '';
  resultPanel.classList.remove('visible');
  spinner.classList.remove('visible');
  fileInput.value = '';
}

// ── Disease Detection ────────────────────────────────────────
detectBtn.addEventListener('click', () => {
  if (!previewImg.src || previewImg.src === window.location.href) return;
  runDetection();
});

function runDetection() {
  // Disable button, show spinner
  detectBtn.disabled = true;
  detectBtn.textContent = '⏳ Analyzing…';
  spinner.classList.add('visible');
  resultPanel.classList.remove('visible');

  // Simulate model inference delay (1.8 – 3.2 seconds)
  const delay = 1800 + Math.random() * 1400;

  setTimeout(() => {
    spinner.classList.remove('visible');
    displayDummyResult();
    detectBtn.disabled = false;
    detectBtn.textContent = '🔬 Detect Again';
  }, delay);
}

function displayDummyResult() {
  // Randomly pick one of the 4 dummy predictions
  const pred = DUMMY_PREDICTIONS[Math.floor(Math.random() * DUMMY_PREDICTIONS.length)];

  // Populate result
  resultIcon.textContent           = pred.icon;
  resultDiseaseName.textContent    = pred.disease;
  resultDiseaseSub.textContent     = 'MoringaTriFusionNet_AU Prediction · ' + new Date().toLocaleTimeString();
  resultConfidence.textContent     = pred.confidence;
  resultUncertainty.textContent    = pred.uncertainty;
  resultClassProb.textContent      = pred.classProb;
  resultExplanationText.textContent = pred.explanation;

  if (pred.decision === 'accepted') {
    decisionIndicator.className   = 'decision-indicator decision-accepted';
    decisionLabel.textContent     = '✅ Accepted';
    decisionText.textContent      = 'Prediction confidence and uncertainty are within acceptable thresholds. The result is reliable.';
    resultHeader.style.background = 'linear-gradient(135deg, #1b4332, #2d6a4f)';
  } else {
    decisionIndicator.className   = 'decision-indicator decision-review';
    decisionLabel.textContent     = '⚠️ Review Needed';
    decisionText.textContent      = 'Uncertainty exceeds the safe threshold. An expert agronomist review is recommended before action.';
    resultHeader.style.background = 'linear-gradient(135deg, #92400e, #b45309)';
  }

  resultPanel.classList.add('visible');

  // Smooth scroll to result
  setTimeout(() => {
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
}

// ── Counter Animation (Performance Section) ──────────────────
function animateCounters() {
  const counters = document.querySelectorAll('.perf-value');
  counters.forEach(counter => {
    const text = counter.textContent.trim();
    const hasPercent = text.includes('%');
    const hasComma   = text.includes(',');
    const numStr     = text.replace(/[^0-9.]/g, '');
    const target     = parseFloat(numStr);

    if (isNaN(target)) return;

    let start = 0;
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = start + (target - start) * eased;

      let displayVal;
      if (target < 10) {
        displayVal = current.toFixed(0);
      } else if (hasPercent) {
        displayVal = current.toFixed(2) + '%';
      } else if (hasComma) {
        displayVal = Math.round(current).toLocaleString();
      } else {
        displayVal = Math.round(current).toString();
      }

      counter.textContent = displayVal;

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

// Trigger counter animation when performance section enters viewport
const perfSection = document.getElementById('performance');
let countersAnimated = false;

const perfObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersAnimated) {
      countersAnimated = true;
      animateCounters();
      perfObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

if (perfSection) perfObserver.observe(perfSection);

// ── Handle invalid routes ────────────────────────────────────
// (route-based 404 for SPA — handled via 404.html for file-based navigation)
// If the current page is not index.html and not 404.html, redirect to 404
(function handleSPARouting() {
  const path = window.location.pathname;
  const validPaths = ['/', '/index.html', '/index', ''];
  const is404Path  = path.includes('404');

  // If running from filesystem (file://) allow any path without redirect
  if (window.location.protocol === 'file:') return;

  // For server deployments — redirect unknown paths to 404 page
  if (!validPaths.some(v => path.endsWith(v)) && !is404Path) {
    window.location.replace('404.html');
  }
})();

// ── Keyboard: Escape closes mobile menu ─────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// ── Init ─────────────────────────────────────────────────────
onScroll(); // Run once on load
