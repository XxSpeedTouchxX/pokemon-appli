  // ——— Scan : lecture des bandes avec Tesseract.js, chargé à la première ouverture du scan ———
  // Tesseract.js 7 (Apache 2.0), son cœur WebAssembly et le modèle français « best_int » sont servis avec le site
  // (web/vendor/tesseract/7.0.0/, copiés par build.mjs depuis npm). Un seul worker, réutilisé. La lecture se fait
  // sur l'appareil : aucune image n'est envoyée.
  const ScanOcr = (function () {
    const DIR = 'vendor/tesseract/7.0.0/';
    // Test du SIMD de WebAssembly (le même que wasm-feature-detect) : cœur plus rapide s'il est pris en charge.
    const SIMD = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
    // Réglages par bande : numéro (texte épars, chiffres, majuscules et « / »), nom (bloc de texte).
    const PARAMS = {
      num: { tessedit_pageseg_mode: '11', tessedit_char_whitelist: '0123456789/ABCDEFGHIJKLMNOPQRSTUVWXYZ', user_defined_dpi: '300', preserve_interword_spaces: '1' },
      name: { tessedit_pageseg_mode: '6', tessedit_char_whitelist: '', user_defined_dpi: '300', preserve_interword_spaces: '1' }
    };
    const st = { ready: null, worker: null, mode: null, simd: null };
    const url = f => new URL(DIR + f, document.baseURI).href;
    // Taille d'une source d'image (vidéo, image, canevas, ImageBitmap).
    const dims = src => ({ w: src.videoWidth || src.naturalWidth || src.width || 0, h: src.videoHeight || src.naturalHeight || src.height || 0 });
    const script = src => new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = () => ok();
      s.onerror = () => ko(new Error('Chargement impossible : ' + src));
      document.head.appendChild(s);
    });
    const simd = () => { try { return typeof WebAssembly === 'object' && WebAssembly.validate(SIMD); } catch (e) { return false; } };
    // Worker prêt (une seule fois ; nouvel essai possible après un échec). progress(étape, 0 à 1).
    function start(progress) {
      if (st.ready) return st.ready;
      if (st.simd === null) st.simd = simd();
      const logger = m => { if (progress && m && typeof m.progress === 'number') progress(m.status, m.progress); };
      st.ready = (window.Tesseract ? Promise.resolve() : script(url('tesseract.min.js')))
        .then(() => window.Tesseract.createWorker('fra', 1, {
          workerPath: url('worker.min.js'),
          corePath: url(st.simd ? 'tesseract-core-simd-lstm.wasm.js' : 'tesseract-core-lstm.wasm.js'),
          langPath: url('lang'), gzip: true, cachePath: 'dropicards-ocr-fra-7', logger: logger
        }))
        .then(w => { st.worker = w; st.mode = null; return w; })
        .catch(e => { st.ready = null; st.worker = null; throw e; });
      return st.ready;
    }
    // Bande d'une carte découpée dans src (vidéo, image, canevas) ; rect : la carte en pixels de src.
    // Agrandie (~36 px par caractère), préparée (ScanCore.prep), entourée de blanc pour Tesseract. La découpe reste
    // dans l'image (Safari ne dessine rien si le rectangle source déborde) ; le reste de la bande est blanc.
    function band(src, rect, kind, opts) {
      const o = opts || {}, b = ScanCore.bandRect(rect, kind), k = b.scale * (o.zoom || 1), pad = 12, d = dims(src);
      const w = Math.max(8, Math.round(b.w * k)), h = Math.max(8, Math.round(b.h * k));
      const x0 = Math.max(0, b.x), y0 = Math.max(0, b.y), x1 = Math.min(d.w, b.x + b.w), y1 = Math.min(d.h, b.y + b.h);
      const c = document.createElement('canvas');
      c.width = w + 2 * pad; c.height = h + 2 * pad;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, c.width, c.height);
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      if (x1 - x0 >= 1 && y1 - y0 >= 1) g.drawImage(src, x0, y0, x1 - x0, y1 - y0, pad + (x0 - b.x) * k, pad + (y0 - b.y) * k, (x1 - x0) * k, (y1 - y0) * k);
      const p = ScanCore.prep(g.getImageData(pad, pad, w, h), { invert: o.invert });
      g.putImageData(new ImageData(p.data, w, h), pad, pad);
      return { canvas: c, inverted: p.inverted, dark: p.dark };
    }
    async function recognize(kind, canvas, psm) {
      const w = st.worker, mode = kind + (psm || '');
      if (st.mode !== mode) { await w.setParameters(Object.assign({}, PARAMS[kind], psm ? { tessedit_pageseg_mode: psm } : {})); st.mode = mode; }
      const r = await w.recognize(canvas);
      return { text: (r.data && r.data.text) || '', conf: (r.data && r.data.confidence) || 0 };
    }
    // Lecture d'une carte : le numéro, puis le nom. opts.invert : polarité forcée pour le numéro ;
    // opts.fine : seconde lecture du numéro dans l'autre polarité s'il manque ; opts.debug : bandes rendues.
    // Les lectures passent une par une (un seul worker) : la suivante attend la fin de la précédente.
    let queue = Promise.resolve();
    function read(src, rect, opts) {
      const job = queue.then(() => readNow(src, rect, opts));
      queue = job.catch(() => {});
      return job;
    }
    async function readNow(src, rect, opts) {
      const o = opts || {}, t0 = performance.now();
      await start();
      const nb = band(src, rect, 'num', { invert: o.invert });
      let num = await recognize('num', nb.canvas, o.psmNum), alt = null;
      if (o.fine && !/\d\s*\/\s*\d/.test(num.text)) {
        alt = band(src, rect, 'num', { invert: !nb.inverted });
        const r = await recognize('num', alt.canvas, o.psmNum);
        num = { text: num.text + '\n' + r.text, conf: Math.max(num.conf, r.conf) };
      }
      const t1 = performance.now(), nm = band(src, rect, 'name', {});
      const name = await recognize('name', nm.canvas, o.psmName);
      return {
        num: num.text, name: name.text, inverted: nb.inverted,
        ms: { num: Math.round(t1 - t0), name: Math.round(performance.now() - t1) },
        bands: o.debug ? [nb.canvas, alt && alt.canvas, nm.canvas].filter(Boolean) : null
      };
    }
    // Arrêt du worker (mémoire rendue) ; le prochain scan le relance.
    function stop() {
      const w = st.worker;
      st.worker = null; st.ready = null; st.mode = null;
      if (w) w.terminate().catch(() => {});
    }
    return { start: start, read: read, band: band, stop: stop, simd: () => (st.simd === null ? (st.simd = simd()) : st.simd) };
  })();
