document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});


// ---------- PDF reader (PDF.js) ----------
(function () {
  const container = document.getElementById('pdfPages');
  const reader    = document.getElementById('pdfReader');
  if (!container || !reader) return;

  const PDF_URL = 'assets/schedule.pdf';
  let pdfDoc = null, scale = 1.5;

  function renderAll() {
    if (!pdfDoc) return;
    container.innerHTML = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      pdfDoc.getPage(i).then(page => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = viewport.width  * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = viewport.width + 'px';
        page.render({ canvasContext: ctx, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
        container.appendChild(canvas);
        if (i === 1) updateInfo();
      });
    }
  }

  function updateInfo() {
    const el = document.getElementById('pdfPageInfo');
    const page = Math.max(1, Math.round(reader.scrollTop / reader.scrollHeight * pdfDoc.numPages) + 1);
    el.textContent = `Page ${page} / ${pdfDoc.numPages}`;
  }

  function fallback() {
    reader.innerHTML =
      `<iframe class="pdf-fallback" src="${PDF_URL}" title="Programme schedule PDF"></iframe>`;
    document.querySelector('.pdf-toolbar .btn-sm:not([download])') // hide nav buttons
      ?.closest('.pdf-toolbar')?.querySelectorAll('button').forEach(b => b.hidden = true);
  }

  document.getElementById('pdfPrev')?.addEventListener('click', () =>
    reader.scrollBy({ top: -reader.clientHeight * 0.9, behavior: 'smooth' }));
  document.getElementById('pdfNext')?.addEventListener('click', () =>
    reader.scrollBy({ top:  reader.clientHeight * 0.9, behavior: 'smooth' }));
  document.getElementById('pdfZoomIn')?.addEventListener('click', () => { scale = Math.min(scale * 1.2, 3); renderAll(); });
  document.getElementById('pdfZoomOut')?.addEventListener('click', () => { scale = Math.max(scale / 1.2, 0.6); renderAll(); });
  reader.addEventListener('scroll', () => pdfDoc && updateInfo());

  // Load PDF.js from CDN, then the document
  const lib = document.createElement('script');
  lib.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  lib.onload = () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfjsLib.getDocument(PDF_URL).promise
      .then(doc => { pdfDoc = doc; renderAll(); })
      .catch(fallback);
  };
  lib.onerror = fallback;
  document.head.appendChild(lib);
})();
