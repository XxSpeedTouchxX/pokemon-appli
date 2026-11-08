  // ——— Face ID, Touch ID et empreinte (clés d'accès) — 2026-11-06, « go » du porteur (docs/26) ———
  // Connexion : page « Connecte-toi » (start.js, « Me connecter avec Face ID / mon empreinte »).
  // Activation : proposée une fois sur cet appareil, à l'accueil, quand le compte est connecté et le didacticiel fini ;
  // et à tout moment dans Mon profil › Informations du dresseur (appareils enregistrés, « Retirer »).
  // Sans serveur (tests automatiques) ou sur un téléphone qui ne sait pas faire : rien n'est affiché.
  // Ce module partage la portée des autres : ses noms commencent par PKY_ ou pky.
  const pkyProto = Component.prototype;
  const PKY_ASKED = 'pkm-pky-asked';
  const pkyAsked = () => { try { return localStorage.getItem(PKY_ASKED) === '1'; } catch (e) { return true; } };
  const pkySetAsked = () => { try { localStorage.setItem(PKY_ASKED, '1'); } catch (e) { /* stockage indisponible */ } };
  const pkyAvail = () => Cloud.on() && Cloud.signedIn() && Cloud.passkeyOk();
  // Nom du déverrouillage selon le téléphone (2026-11-08, porteur : « Touch ID ou Face ID selon le téléphone ») ; un
  // site web ne peut pas savoir si un iPhone a Face ID ou Touch ID : les deux sont nommés.
  const PKY_NAME = (() => { try { const u = navigator.userAgent || ''; return /iPhone|iPad|iPod|Macintosh/.test(u) ? 'Face ID / Touch ID' : /Android/.test(u) ? 'mon empreinte' : 'Face ID, Touch ID ou mon empreinte'; } catch (e) { return 'Face ID ou mon empreinte'; } })();
  // Clé d'accès créée sur cet appareil : à la page de connexion, Face ID / l'empreinte est demandé tout de suite.
  const PKY_HAS = 'pkm-pky-has';
  const pkyHas = () => { try { return localStorage.getItem(PKY_HAS) === '1'; } catch (e) { return false; } };
  const pkySetHas = () => { try { localStorage.setItem(PKY_HAS, '1'); } catch (e) { /* stockage indisponible */ } };
  // Déconnexion volontaire (Mon profil) : pas de connexion automatique ensuite, jusqu'à la prochaine connexion.
  const pkyOut = () => { try { return localStorage.getItem('pkm-pky-out') === '1'; } catch (e) { return false; } };
  const pkyIn = () => { try { localStorage.removeItem('pkm-pky-out'); } catch (e) { /* stockage indisponible */ } };
  // Proposition juste après la création du compte (2026-11-08, porteur).
  pkyProto.pkyOfferNow = function () { if (pkyAvail() && !pkyAsked()) setTimeout(() => this.setState({ pkyOffer: true, pkyFromSignup: true, pkyMsg: '' }), 450); };
  const pkyDate = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };

  // Liste des appareils enregistrés (relue à l'ouverture de Mon profil et après chaque changement).
  pkyProto.pkyLoad = function () {
    if (!pkyAvail()) return;
    Cloud.passkeyList().then(l => this.setState({ pkyList: l, pkyLoaded: true }), e => this.setState({ pkyLoaded: true, pkyList: [], pkyOff: e && e.code === 'passkey_disabled' }));
  };
  pkyProto.pkyAdd = function (fromOffer) {
    if (this.st().pkyBusy) return;
    this.setState({ pkyBusy: true, pkyMsg: '' });
    Cloud.passkeyRegister().then(() => {
      pkySetAsked(); pkySetHas();
      this.setState({ pkyBusy: false, pkyOffer: false, pkyFromSignup: false, toast: PKY_NAME.replace(/^mon /, 'Ton ') + ' activé : tu te connecteras sans mot de passe' });
      this.flash(); this.pkyLoad();
    }, e => {
      this.setState({ pkyBusy: false, pkyMsg: (e && e.message) || CLOUD_ERR.other });
      if (!fromOffer) { this.setState({ toast: (e && e.message) || CLOUD_ERR.other }); this.flash(); }
      if (e && e.code === 'passkey_disabled') { pkySetAsked(); this.setState({ pkyOffer: false, pkyOff: true }); }
    });
  };

  // Proposition unique à l'accueil.
  let pkyChecked = false;
  const pkyBaseRender = pkyProto.renderVals;
  pkyProto.renderVals = function () {
    const r = pkyBaseRender.call(this), s = this.st();
    if (!pkyChecked && pkyAvail() && s.screen === 'home' && s.tuto === 'done' && !s.onb && !pkyAsked()) {
      pkyChecked = true;
      // Seulement si aucun appareil n'est encore enregistré sur ce compte.
      setTimeout(() => Cloud.passkeyList().then(l => { if (!l.length) this.setState({ pkyOffer: true }); else pkySetAsked(); }, () => {}), 2500);
    }
    const nm = PKY_NAME.replace(/^mon /, 'ton ');
    r.pky = {
      offer: !!s.pkyOffer, busy: s.pkyBusy ? 'true' : 'false', goLabel: s.pkyBusy ? 'Un instant…' : 'Oui, utiliser ' + nm,
      title: s.pkyFromSignup ? 'Compte créé ! Utiliser ' + nm + ' ?' : 'Connexion avec ' + nm,
      text: 'Tu te connecteras ensuite automatiquement avec ' + nm + ', sans taper ton mot de passe. C’est aussi plus sûr : rien ne peut être deviné ni volé par un faux site.',
      laterLabel: 'Non, plus tard',
      hasMsg: !!s.pkyMsg && !!s.pkyOffer, msg: s.pkyMsg || '',
      go: () => this.pkyAdd(true),
      later: () => { pkySetAsked(); this.setState({ pkyOffer: false, pkyFromSignup: false, pkyMsg: '', toast: 'Tu pourras l’activer à tout moment dans Mon profil' }); }
    };
    return r;
  };

  // Mon profil › Informations du dresseur.
  const pkyBaseProfile = pkyProto.vProfile;
  pkyProto.vProfile = function (x) {
    const r = pkyBaseProfile.call(this, x), s = x.s;
    if (!r.trainer) return r;
    if (!pkyAvail() || s.pkyOff) { r.trainer.pkyOn = false; r.trainer.pkyList = []; return r; }
    if (!s.pkyLoaded && !this._pkyLoading) { this._pkyLoading = true; setTimeout(() => { this._pkyLoading = false; this.pkyLoad(); }, 0); }
    const list = Array.isArray(s.pkyList) ? s.pkyList : [];
    r.trainer.pkyOn = true;
    r.trainer.pkyName = PKY_NAME.replace(/^mon /, 'Empreinte').replace(/^Empreinte.*$/, 'Empreinte');
    r.trainer.pkyState = !s.pkyLoaded ? '…' : list.length ? 'Activé (' + list.length + (list.length > 1 ? ' appareils)' : ' appareil)') : 'Non activé';
    r.trainer.pkyList = list.map(p => {
      const name = (p.friendly_name || 'Appareil') + (p.created_at ? ' · ' + pkyDate(p.created_at) : '');
      return {
        name: name, aria: 'Retirer ' + name,
        remove: () => Cloud.passkeyDelete(p.id).then(() => { this.setState({ toast: 'Appareil retiré : il ne peut plus te connecter avec Face ID / empreinte' }); this.flash(); this.pkyLoad(); },
          e => { this.setState({ toast: (e && e.message) || CLOUD_ERR.other }); this.flash(); })
      };
    });
    r.trainer.pkyAddLabel = s.pkyBusy ? 'Un instant…' : list.length ? 'Ajouter ce téléphone' : 'Activer ' + PKY_NAME;
    r.trainer.pkyAdd = () => this.pkyAdd(false);
    return r;
  };
