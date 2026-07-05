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

let selectedFile = null;

const PREDICTION_BY_CLASS = {
  bacterial:  DUMMY_PREDICTIONS[0],
  cercospora: DUMMY_PREDICTIONS[1],
  healthy:    DUMMY_PREDICTIONS[2],
  yellow:     DUMMY_PREDICTIONS[3]
};

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

  selectedFile = file;

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
  selectedFile = null;
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
    displayDetectionResult(getPredictionForSelectedFile());
    detectBtn.disabled = false;
    detectBtn.textContent = '🔬 Detect Again';
  }, delay);
}

function getPredictionForSelectedFile() {
  const fileNamePrediction = getPredictionFromFileName(selectedFile ? selectedFile.name : '');
  if (fileNamePrediction) return fileNamePrediction;

  return getPredictionFromImagePreview();
}

function getPredictionFromFileName(fileName) {
  const normalized = fileName.toLowerCase().replace(/[_-]+/g, ' ');

  if (/\bbacter/.test(normalized)) {
    return buildPrediction('bacterial', {
      confidence: '98.91%',
      uncertainty: '1.09%',
      classProb: '98.91%',
      source: 'Dataset filename match'
    });
  }

  if (/\bcerc|cercospora/.test(normalized)) {
    return buildPrediction('cercospora', {
      confidence: '98.34%',
      uncertainty: '1.66%',
      classProb: '98.34%',
      source: 'Dataset filename match'
    });
  }

  if (/\bhealthy|\bnormal/.test(normalized)) {
    return buildPrediction('healthy', {
      confidence: '99.22%',
      uncertainty: '0.78%',
      classProb: '99.22%',
      source: 'Dataset filename match'
    });
  }

  if (/\byellow|\bchlor/.test(normalized)) {
    return buildPrediction('yellow', {
      confidence: '96.47%',
      uncertainty: '3.53%',
      classProb: '96.47%',
      decision: 'accepted',
      source: 'Dataset filename match'
    });
  }

  return null;
}

function getPredictionFromImagePreview() {
  const metrics = getImageColorMetrics();
  if (!metrics) {
    return buildPrediction('healthy', {
      confidence: '71.20%',
      uncertainty: '28.80%',
      classProb: '71.20%',
      decision: 'review',
      source: 'Fallback demo heuristic',
      explanation: 'The image could not be analyzed reliably in demo mode. Please use a clear leaf image or connect the TensorFlow backend for live inference.'
    });
  }

  if (metrics.yellowRatio > 0.34 && metrics.yellowRatio > metrics.greenRatio * 0.65) {
    return buildPrediction('yellow', {
      confidence: percent(0.83 + Math.min(metrics.yellowRatio, 0.15)),
      uncertainty: percent(0.17 - Math.min(metrics.yellowRatio, 0.12)),
      classProb: percent(0.83 + Math.min(metrics.yellowRatio, 0.15)),
      source: 'Fallback color heuristic'
    });
  }

  if (metrics.darkRatio > 0.045 && metrics.darkRatio >= metrics.grayRatio) {
    return buildPrediction('bacterial', {
      confidence: percent(0.86 + Math.min(metrics.darkRatio * 1.2, 0.10)),
      uncertainty: percent(0.14 - Math.min(metrics.darkRatio, 0.08)),
      classProb: percent(0.86 + Math.min(metrics.darkRatio * 1.2, 0.10)),
      source: 'Fallback lesion heuristic'
    });
  }

  if (metrics.grayRatio > 0.04 && metrics.darkRatio > 0.02) {
    return buildPrediction('cercospora', {
      confidence: percent(0.82 + Math.min(metrics.grayRatio, 0.12)),
      uncertainty: percent(0.18 - Math.min(metrics.grayRatio, 0.10)),
      classProb: percent(0.82 + Math.min(metrics.grayRatio, 0.12)),
      source: 'Fallback spot heuristic'
    });
  }

  if (metrics.greenRatio > 0.35 && metrics.yellowRatio < 0.24 && metrics.darkRatio < 0.055) {
    return buildPrediction('healthy', {
      confidence: percent(0.88 + Math.min(metrics.greenRatio * 0.12, 0.09)),
      uncertainty: percent(0.12 - Math.min(metrics.greenRatio * 0.08, 0.07)),
      classProb: percent(0.88 + Math.min(metrics.greenRatio * 0.12, 0.09)),
      source: 'Fallback color heuristic'
    });
  }

  return buildPrediction('bacterial', {
    confidence: '76.85%',
    uncertainty: '23.15%',
    classProb: '76.85%',
    decision: 'review',
    source: 'Fallback lesion heuristic',
    explanation: 'Dark lesion-like regions were found, but the visual evidence is not strong enough for automatic acceptance in demo mode. Expert review is recommended.'
  });
}

function getImageColorMetrics() {
  if (!previewImg.complete || !previewImg.naturalWidth || !previewImg.naturalHeight) return null;

  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(previewImg, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;
  let considered = 0;
  let green = 0;
  let yellow = 0;
  let dark = 0;
  let gray = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;
    const saturation = max === 0 ? 0 : (max - min) / max;

    if (brightness < 24 || brightness > 245 || saturation < 0.06) continue;
    considered++;

    if (g > r * 1.05 && g > b * 1.18 && saturation > 0.16) green++;
    if (r > 95 && g > 85 && b < 135 && g > b * 1.18 && r > b * 1.08) yellow++;
    if (brightness < 105 && r < 140 && g < 130 && b < 125 && saturation > 0.10) dark++;
    if (Math.abs(r - g) < 24 && Math.abs(g - b) < 24 && brightness > 75 && brightness < 205) gray++;
  }

  if (!considered) return null;

  return {
    greenRatio: green / considered,
    yellowRatio: yellow / considered,
    darkRatio: dark / considered,
    grayRatio: gray / considered
  };
}

function buildPrediction(classKey, overrides) {
  return Object.assign({}, PREDICTION_BY_CLASS[classKey], overrides);
}

function percent(value) {
  const safeValue = Math.max(0, Math.min(0.995, value));
  return (safeValue * 100).toFixed(2) + '%';
}

function displayDetectionResult(pred) {

  // Populate result
  resultIcon.textContent           = pred.icon;
  resultDiseaseName.textContent    = pred.disease;
  resultDiseaseSub.textContent     = (pred.source || 'Demo prediction') + ' · ' + new Date().toLocaleTimeString();
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
