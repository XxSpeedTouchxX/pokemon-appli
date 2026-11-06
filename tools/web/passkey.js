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
      pkySetAsked();
      this.setState({ pkyBusy: false, pkyOffer: false, toast: 'Face ID / empreinte activé : la prochaine fois, connecte-toi sans mot de passe' });
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
    r.pky = {
      offer: !!s.pkyOffer, busy: s.pkyBusy ? 'true' : 'false', goLabel: s.pkyBusy ? 'Un instant…' : 'Activer Face ID / mon empreinte',
      hasMsg: !!s.pkyMsg && !!s.pkyOffer, msg: s.pkyMsg || '',
      go: () => this.pkyAdd(true),
      later: () => { pkySetAsked(); this.setState({ pkyOffer: false, pkyMsg: '', toast: 'Tu pourras l’activer à tout moment dans Mon profil' }); }
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
    r.trainer.pkyState = !s.pkyLoaded ? '…' : list.length ? 'Activé (' + list.length + (list.length > 1 ? ' appareils)' : ' appareil)') : 'Non activé';
    r.trainer.pkyList = list.map(p => {
      const name = (p.friendly_name || 'Appareil') + (p.created_at ? ' · ' + pkyDate(p.created_at) : '');
      return {
        name: name, aria: 'Retirer ' + name,
        remove: () => Cloud.passkeyDelete(p.id).then(() => { this.setState({ toast: 'Appareil retiré : il ne peut plus te connecter avec Face ID / empreinte' }); this.flash(); this.pkyLoad(); },
          e => { this.setState({ toast: (e && e.message) || CLOUD_ERR.other }); this.flash(); })
      };
    });
    r.trainer.pkyAddLabel = s.pkyBusy ? 'Un instant…' : list.length ? 'Ajouter ce téléphone' : 'Activer Face ID / mon empreinte';
    r.trainer.pkyAdd = () => this.pkyAdd(false);
    return r;
  };
