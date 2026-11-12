  // ——— App des stores (2026-11-09, demande du porteur : « la version Android qui passera la validation » ; docs/23 §2) ———
  // Dans l'app Android (puis iOS), le même code que dropicards.fr tourne dans une coquille Capacitor (dossier mobile/),
  // qui ajoute « DropicardsApp/ » au nom du navigateur. Google Play et l'App Store imposent leur propre paiement pour
  // l'abonnement Premium et les PA, et interdisent de renvoyer vers un autre moyen de paiement : tant que leur achat
  // intégré n'est pas branché, l'app des stores n'affiche aucune offre payante (bannières Premium, « Découvrir
  // Premium », « Recharger mes PA »). Un compte déjà Premium garde ses avantages. Sur le site, rien ne change.
  // Pour l'essayer dans un navigateur : ?store=1 (gardé pour la session de l'onglet).
  const storeApp = (() => {
    try {
      if (/[?&]store=1\b/.test(location.search)) sessionStorage.setItem('pkm-store', '1');
      return /DropicardsApp\//.test(navigator.userAgent || '')
        || !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform())
        || sessionStorage.getItem('pkm-store') === '1';
    } catch (e) { return false; }
  })();
  if (storeApp) {
    try { document.documentElement.classList.add('pkm-store'); } catch (e) { /* page sans racine */ }
    const stProto = Component.prototype;
    // Toute entrée oubliée vers l'offre Premium reste sans effet.
    stProto.premOpen = function () { if (this.st().premOpen) this.setState({ premOpen: false }); };
    const stBase = stProto.renderVals;
    stProto.renderVals = function () {
      const r = stBase.call(this);
      // PK shop : seulement le Magasin (articles payés en PK gagnés gratuitement), jamais les packs de PA.
      if (r.pks && r.pks.isPa !== undefined) Object.assign(r.pks, { isStore: true, isPa: false, goPa: r.pks.goStore || (() => {}), ask: { open: false } });
      if (r.lockw && r.lockw.open) r.lockw.prem = false;
      if (r.prem) r.prem.open = false;
      return r;
    };
  }
  // ——— Achats réservés aux admins (2026-11-12, porteur : « je veux que tu me bloques dès à présent toutes les possibilités
  // d'achat des comptes utilisateur, donc impossible de prendre le Premium et les recharges de PA ; tu laisses ça
  // uniquement possible pour le mode admin ») ———
  // Pour un compte qui n'est pas admin : ni offre Premium (bannières, « Découvrir Premium », « Tout débloquer avec
  // Premium »), ni « Recharger mes PA ». Un abonné Premium garde « Gérer ou arrêter mon abonnement ». Le serveur refuse
  // aussi le paiement (fonction « stripe », variable PREMIUM_OPEN). Pour tout rouvrir : NOBUY_ON = false.
  const NOBUY_ON = true;
  const nobuyProto = Component.prototype;
  const nobuyAdmin = () => typeof Cloud !== 'undefined' && (Cloud.on() ? Cloud.isAdmin() : true);
  nobuyProto.buyLocked = function () { return NOBUY_ON && !storeApp && !nobuyAdmin(); };
  const nobuyBaseOpen = nobuyProto.premOpen;
  nobuyProto.premOpen = function () {
    if (this.buyLocked() && !(this.premOn && this.premOn())) { if (this.st().premOpen) this.setState({ premOpen: false }); this.setState({ toast: 'Le Premium arrive très bientôt !' }); return; }
    return nobuyBaseOpen.call(this);
  };
  const nobuyBase = nobuyProto.renderVals;
  nobuyProto.renderVals = function () {
    const r = nobuyBase.call(this), lock = this.buyLocked(), prem = !!(this.premOn && this.premOn());
    try { document.documentElement.classList.toggle('pkm-nobuy', lock && !prem); document.documentElement.classList.toggle('pkm-nobuy-pa', lock); } catch (e) { /* page sans racine */ }
    if (lock) {
      if (r.pks && r.pks.isPa !== undefined) Object.assign(r.pks, { isStore: true, isPa: false, goPa: r.pks.goStore || (() => {}), ask: { open: false } });
      if (!prem) {
        if (r.lockw && r.lockw.open) r.lockw.prem = false;
        if (r.prem) r.prem.open = false;
        if (r.av && r.av.lock) r.av.lock.showPrem = false;
      }
    }
    return r;
  };
