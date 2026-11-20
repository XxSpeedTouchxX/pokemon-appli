  // ——— Application toujours à la verticale (2026-11-16, porteur : « je veux que l'appli reste dans le sens vertical
  // bloquée même si l'utilisateur tourne son téléphone ») ———
  //   - App Android (Capacitor) : verrou natif (android:screenOrientation="portrait", mobile/android).
  //   - App installée depuis le navigateur (Android) : manifest « portrait » et screen.orientation.lock().
  //   - iPhone et navigateurs : un site ne peut pas bloquer la rotation (Apple ne le permet pas). Téléphone tourné à
  //     l'horizontale : l'app se cache derrière « Remets ton téléphone droit », puis revient telle quelle.
  // Seulement sur téléphone (écran tactile, petit côté de moins de 600 px) ; d'après le sens de l'appareil, jamais
  // d'après la taille de la fenêtre (le clavier d'Android rétrécit la fenêtre sans tourner le téléphone).
  if (typeof document !== 'undefined' && typeof window !== 'undefined' && !window.__pkmOrient) {
    window.__pkmOrient = true;
    const orPhone = () => {
      try {
        const w = Number(screen.width) || 0, h = Number(screen.height) || 0;
        return w > 0 && h > 0 && Math.min(w, h) < 600 && !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
      } catch (e) { return false; }
    };
    const orLand = () => {
      try {
        const o = screen.orientation;
        if (o && typeof o.type === 'string' && o.type) return /landscape/.test(o.type);
        if (typeof window.orientation === 'number') return Math.abs(window.orientation) === 90;
      } catch (e) { /* ancien navigateur */ }
      return false;
    };
    const orLock = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(() => {}); } catch (e) { /* pas permis */ } };
    const orBox = () => {
      if (document.querySelector('.pkm-rotlock') || !document.body) return;
      const el = document.createElement('div');
      el.className = 'pkm-rotlock';
      // Rôle de fenêtre d'alerte seulement quand le téléphone est tourné (orSet) : caché, le message n'existe pas pour
      // les lecteurs d'écran ni pour les autres fenêtres de l'app.
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('aria-live', 'assertive');
      el.setAttribute('aria-label', 'Dropicards s’utilise à la verticale. Remets ton téléphone droit.');
      el.innerHTML = '<div class="pkm-rotlock-in"><svg class="pkm-rotlock-ph" viewBox="0 0 124 120" aria-hidden="true">'
        + '<g class="pkm-rotlock-g"><rect x="42" y="20" width="36" height="80" rx="8" fill="#121C33" stroke="#FFD60A" stroke-width="4"/>'
        + '<rect x="47" y="29" width="26" height="58" rx="3" fill="#1C2C57"/><circle cx="60" cy="93" r="3" fill="#FFD60A"/>'
        + '<path d="M53 56 l7 -7 l7 7" fill="none" stroke="#FFE680" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>'
        + '<path class="pkm-rotlock-arrow" d="M112 36 A54 54 0 0 1 108 92" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>'
        + '<path class="pkm-rotlock-arrow" d="M100 86 l8 7 l5 -9" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        + '<b>Dropicards s’utilise à la verticale</b><span>Remets ton téléphone droit : tu retrouves l’app là où tu l’as laissée.</span></div>';
      document.body.appendChild(el);
    };
    const orSet = () => {
      const on = orPhone() && orLand();
      document.documentElement.classList.toggle('pkm-landscape', on);
      if (on) orBox();
      const el = document.querySelector('.pkm-rotlock');
      if (el) {
        if (on) { el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-hidden', 'false'); }
        else { el.removeAttribute('role'); el.setAttribute('aria-hidden', 'true'); }
      }
    };
    const orStart = () => { orBox(); orSet(); orLock(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', orStart); else orStart();
    try { if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', orSet); } catch (e) { /* rien */ }
    window.addEventListener('orientationchange', () => { orSet(); setTimeout(orSet, 250); });
    window.addEventListener('resize', orSet);
    // Verrou natif seulement après un geste (plein écran, app installée) : réessayé au premier toucher.
    document.addEventListener('touchend', function orOnce() { orLock(); document.removeEventListener('touchend', orOnce); }, { passive: true });
  }
