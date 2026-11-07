  // ——— Compte Dropicards sur le serveur (2026-11-06, « go » du porteur) ———
  // Supabase installé par Coolify sur le serveur du porteur (api.dropicards.fr, tools/supabase/). L'app parle
  // directement à son service de comptes (GoTrue) et à sa base (PostgREST), sans bibliothèque : inscription avec un code
  // à 6 chiffres reçu par e-mail, connexion, mot de passe oublié, profil de dresseur, déconnexion.
  // La clé « anon » est publique par nature (elle est dans chaque navigateur) : la sécurité vient des règles de la base
  // (tools/supabase/001_comptes.sql). La clé « service_role » ne doit jamais se trouver ici.
  // Sans clé (CLOUD_KEY vide) ou sans réseau, l'app garde le compte sur l'appareil comme avant.
  // La collection reste sur l'appareil pour l'instant (étape suivante de docs/24 §8).
  const CLOUD_URL = 'https://api.dropicards.fr';
  // Clé « anon » de Supabase (SERVICE_SUPABASEANON_KEY dans Coolify, rôle « anon », donnée par le porteur le 2026-11-06).
  const CLOUD_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc5Mzk1OTI2MCwiZXhwIjo0OTQ5NjMyODYwLCJyb2xlIjoiYW5vbiJ9.MHlBLPLkoVqE9-SnparqMbxnkG7cQpRngeSHC5HmZss';
  let cloudRefreshing = null;
  const CLOUD_LS = 'pkm-cloud-session';
  const CLOUD_ERR = {
    network: 'Impossible de joindre Dropicards. Vérifie ta connexion, puis réessaie.',
    invalid_credentials: 'Adresse ou mot de passe incorrect.',
    email_not_confirmed: 'Ton adresse n’est pas encore confirmée : entre le code reçu par e-mail.',
    otp_expired: 'Ce code n’est plus valable ou il est faux. Demande un nouveau code.',
    weak_password: 'Ce mot de passe est trop simple : choisis-en un plus long, avec des lettres et des chiffres.',
    over_email_send_rate_limit: 'Trop d’e-mails envoyés : attends quelques minutes avant de redemander un code.',
    over_request_rate_limit: 'Trop d’essais : attends quelques minutes, puis réessaie.',
    email_address_invalid: 'Cette adresse e-mail n’est pas acceptée (les adresses jetables sont refusées) : utilise ton adresse habituelle.',
    signup_disabled: 'Les inscriptions sont fermées pour le moment.',
    passkey_disabled: 'La connexion avec Face ID ou l’empreinte n’est pas encore activée sur le serveur de Dropicards.',
    webauthn_verification_failed: 'Face ID ou l’empreinte n’a pas pu être vérifié. Réessaie, ou connecte-toi avec ton mot de passe.',
    webauthn_challenge_expired: 'Trop de temps s’est écoulé : réessaie.',
    webauthn_challenge_not_found: 'Trop de temps s’est écoulé : réessaie.',
    too_many_passkeys: 'Tu as déjà enregistré 10 appareils : retires-en un dans Mon profil.',
    webauthn_credential_not_found: 'Aucun Face ID ni empreinte enregistré pour ce compte : connecte-toi avec ton mot de passe, puis active-le dans Mon profil.',
    user_banned: 'Ce compte est suspendu. Écris-nous à contact@dropicards.fr.',
    same_password: 'Choisis un mot de passe différent de l’ancien.',
    other: 'Une erreur est survenue. Réessaie dans un instant.'
  };
  const cloudLs = {
    get() { try { const v = JSON.parse(localStorage.getItem(CLOUD_LS) || 'null'); return v && v.refresh_token ? v : null; } catch (e) { return null; } },
    set(v) { try { if (v) localStorage.setItem(CLOUD_LS, JSON.stringify(v)); else localStorage.removeItem(CLOUD_LS); } catch (e) { /* stockage indisponible */ } }
  };
  // Code d'erreur de GoTrue ou de PostgREST → message en français.
  const cloudErr = (status, j) => {
    const code = (j && (j.error_code || j.code || j.error)) || '';
    const msg = String((j && (j.msg || j.message || j.error_description)) || '');
    let k = CLOUD_ERR[code] ? code : '';
    if (!k && /invalid login credentials|invalid_grant/i.test(msg + code)) k = 'invalid_credentials';
    if (!k && /not confirmed/i.test(msg)) k = 'email_not_confirmed';
    if (!k && /expired|invalid.*(otp|token)|token.*(invalid|expired)/i.test(msg)) k = 'otp_expired';
    if (!k && status === 429) k = 'over_request_rate_limit';
    // Adresse jetable refusée par la base (tools/supabase/005_jetables.sql) : GoTrue répond « Database error ».
    if (!k && /database error saving new user|jetable/i.test(msg)) k = 'email_address_invalid';
    // Règles du jeu (tools/supabase/004_jeu.sql) : leur message, déjà en français, est montré tel quel.
    if (!k && /^(P0001|42501|53400|28000)$/.test(String(code)) && msg && !/^permission denied/i.test(msg)) {
      const g = new Error(msg); g.code = 'game'; g.status = status; return g;
    }
    const e = new Error(CLOUD_ERR[k || 'other']);
    e.code = k || 'other'; e.status = status;
    return e;
  };
  // Clés d'accès : conversions base64url ↔ octets, et demande au téléphone (Face ID, empreinte) avec ses refus.
  const pkyBuf = b => { const s = atob(String(b || '').replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(b || '').length + 3) % 4)); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };
  const pkyB64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const pkyAsk = async f => {
    try { const c = await f(); if (!c) throw new Error('vide'); return c; } catch (e) {
      const n = new Error(e && e.name === 'NotAllowedError' ? 'Face ID ou l’empreinte n’a pas été validé (annulé ou délai dépassé). Réessaie.'
        : e && e.name === 'InvalidStateError' ? 'Ce téléphone est déjà enregistré pour Face ID ou l’empreinte.'
        : 'Ce téléphone ne permet pas d’utiliser Face ID ou l’empreinte ici.');
      n.code = 'passkey_device'; throw n;
    }
  };
  const Cloud = {
    // Adresse du serveur modifiable pour les tests (?cloud=http://127.0.0.1:…, avec ?cloudkey=…).
    url: CLOUD_URL, key: CLOUD_KEY,
    on() { return !!this.key; },
    session() { return cloudLs.get(); },
    signedIn() { return !!cloudLs.get(); },
    // Rôle lu dans la table profiles (jamais choisi par l'app) : seul un compte « admin » ouvre le mode Admin.
    isAdmin() { const s = cloudLs.get(); return !!(s && s.role === 'admin'); },
    // (Double authentification des admins retirée le 2026-11-06, porteur : remplacée par le mot de passe des admins, 007.)
    async req(path, o) {
      o = o || {};
      const h = { apikey: this.key, 'Content-Type': 'application/json' };
      h.Authorization = 'Bearer ' + (o.token || this.key);
      Object.assign(h, o.headers || {});
      const ctl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = ctl ? setTimeout(() => ctl.abort(), 15000) : 0;
      let res;
      try {
        res = await fetch(this.url + path, { method: o.method || 'GET', headers: h, body: o.body ? JSON.stringify(o.body) : undefined, signal: ctl ? ctl.signal : undefined, cache: 'no-store' });
      } catch (e) {
        const n = new Error(CLOUD_ERR.network); n.code = 'network'; throw n;
      } finally { if (timer) clearTimeout(timer); }
      let j = null;
      const txt = await res.text();
      try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = null; }
      if (!res.ok) throw cloudErr(res.status, j);
      return j;
    },
    keep(j) {
      if (!j || !j.access_token || !j.refresh_token) return null;
      const u = j.user || {};
      const prev = cloudLs.get();
      const v = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (Number(j.expires_in) || 3600) * 1000, uid: u.id || '', email: u.email || '' };
      if (prev && prev.uid && prev.uid === v.uid && prev.role) v.role = prev.role;
      cloudLs.set(v);
      return v;
    },
    // Jeton valable (renouvelé une minute avant la fin) ; null si déconnecté.
    async token() {
      const s = cloudLs.get();
      if (!s) return null;
      if (s.expires_at - Date.now() > 60000) return s.access_token;
      // Un seul renouvellement à la fois (2026-11-07) : à l'ouverture, plusieurs appels (jeu, profil, Premium) partaient
      // ensemble avec le même jeton de renouvellement ; le serveur n'en accepte qu'un, et l'échec des autres
      // déconnectait le compte. Si un autre onglet a déjà renouvelé la session, sa session est gardée.
      if (!cloudRefreshing) cloudRefreshing = (async () => {
        try {
          const j = await this.req('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh_token } });
          const v = this.keep(j);
          return v ? v.access_token : null;
        } catch (e) {
          const now = cloudLs.get();
          if (now && now.refresh_token !== s.refresh_token && now.expires_at - Date.now() > 60000) return now.access_token;
          if (e.code !== 'network') cloudLs.set(null);
          throw e;
        } finally { cloudRefreshing = null; }
      })();
      return cloudRefreshing;
    },
    // Inscription : le profil (pseudo, âge, starter, nouveautés) part avec le compte ; tools/supabase/003_inscription.sql
    // le vérifie et le range. Réponse sans « identities » : l'adresse a déjà un compte.
    async signUp(email, password, data) {
      const j = await this.req('/auth/v1/signup', { method: 'POST', body: { email: email, password: password, data: data || {} } });
      if (j && j.access_token) return { session: this.keep(j), exists: false };
      const u = j && (j.user || j);
      return { session: null, exists: !!(u && Array.isArray(u.identities) && u.identities.length === 0) };
    },
    async verify(email, code, type) {
      const j = await this.req('/auth/v1/verify', { method: 'POST', body: { type: type || 'signup', email: email, token: String(code || '').replace(/\D/g, '') } });
      const v = this.keep(j);
      if (!v) throw cloudErr(400, { error_code: 'otp_expired' });
      return v;
    },
    resend(email) { return this.req('/auth/v1/resend', { method: 'POST', body: { type: 'signup', email: email } }); },
    async signIn(email, password) {
      const v = this.keep(await this.req('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: email, password: password } }));
      if (!v) throw cloudErr(400, {});
      return v;
    },
    recover(email) { return this.req('/auth/v1/recover', { method: 'POST', body: { email: email } }); },
    async setPassword(password) {
      return this.req('/auth/v1/user', { method: 'PUT', token: await this.token(), body: { password: password } });
    },
    async profile() {
      const s = cloudLs.get(), tk = await this.token();
      if (!s || !tk) return null;
      const rows = await this.req('/rest/v1/profiles?select=pseudo,age_range,starter,buddy,news_optin,role,status,created_at&id=eq.' + encodeURIComponent(s.uid), { token: tk });
      const pr = Array.isArray(rows) ? rows[0] || null : null;
      const cur = cloudLs.get();
      if (cur && cur.uid === s.uid) { cur.role = pr && pr.role === 'admin' && pr.status !== 'suspended' ? 'admin' : 'user'; cloudLs.set(cur); }
      return pr;
    },
    // Règle du jeu sur le serveur (tools/supabase/004_jeu.sql) : PA du jour, booster, pièce, partage, Pokédex, PK shop.
    async rpc(fn, args) {
      const tk = await this.token();
      if (!tk) { const e = new Error('Connecte-toi à ton compte Dropicards pour jouer.'); e.code = 'login'; throw e; }
      return this.req('/rest/v1/rpc/' + fn, { method: 'POST', token: tk, body: args || {} });
    },
    reqId() {
      try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (e) { /* ancien navigateur */ }
      const b = new Uint8Array(16); crypto.getRandomValues(b); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
      return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
    },
    // Clés d'accès (Face ID, Touch ID, empreinte) : Supabase Auth 2.197 et plus, GOTRUE_PASSKEY_ENABLED
    // (docs/26). La clé reste dans le téléphone (trousseau iCloud, gestionnaire de mots de passe Google) ; le serveur ne
    // garde que sa partie publique. Connexion sans adresse ni mot de passe ; le mot de passe reste en secours.
    // Mis de côté le 2026-11-06, remis pour tout le monde le 2026-11-07 (porteur) : visible dès que le téléphone sait le faire.
    passkeyOk() {
      try { return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create && navigator.credentials.get); } catch (e) { return false; }
    },
    async passkeyRegister() {
      const tk = await this.token();
      const o = await this.req('/auth/v1/passkeys/registration/options', { method: 'POST', token: tk, body: {} });
      const pk = Object.assign({}, o.options, { challenge: pkyBuf(o.options.challenge), user: Object.assign({}, o.options.user, { id: pkyBuf(o.options.user.id) }) });
      if (Array.isArray(pk.excludeCredentials)) pk.excludeCredentials = pk.excludeCredentials.map(c => Object.assign({}, c, { id: pkyBuf(c.id) }));
      const cred = await pkyAsk(() => navigator.credentials.create({ publicKey: pk }));
      const r = cred.response;
      return this.req('/auth/v1/passkeys/registration/verify', { method: 'POST', token: await this.token(), body: { challenge_id: o.challenge_id, credential: {
        id: cred.id, rawId: pkyB64(cred.rawId), type: cred.type, authenticatorAttachment: cred.authenticatorAttachment || undefined,
        clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
        response: { clientDataJSON: pkyB64(r.clientDataJSON), attestationObject: pkyB64(r.attestationObject), transports: r.getTransports ? r.getTransports() : undefined } } } });
    },
    async passkeyLogin() {
      const o = await this.req('/auth/v1/passkeys/authentication/options', { method: 'POST', body: {} });
      const pk = Object.assign({}, o.options, { challenge: pkyBuf(o.options.challenge) });
      if (Array.isArray(pk.allowCredentials)) pk.allowCredentials = pk.allowCredentials.map(c => Object.assign({}, c, { id: pkyBuf(c.id) }));
      const cred = await pkyAsk(() => navigator.credentials.get({ publicKey: pk }));
      const r = cred.response;
      const j = await this.req('/auth/v1/passkeys/authentication/verify', { method: 'POST', body: { challenge_id: o.challenge_id, credential: {
        id: cred.id, rawId: pkyB64(cred.rawId), type: cred.type, authenticatorAttachment: cred.authenticatorAttachment || undefined,
        clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
        response: { clientDataJSON: pkyB64(r.clientDataJSON), authenticatorData: pkyB64(r.authenticatorData), signature: pkyB64(r.signature), userHandle: r.userHandle ? pkyB64(r.userHandle) : undefined } } } });
      const v = this.keep(j);
      if (!v) throw cloudErr(400, { error_code: 'webauthn_verification_failed' });
      return v;
    },
    async passkeyList() { const l = await this.req('/auth/v1/passkeys', { token: await this.token() }); return Array.isArray(l) ? l : (l && Array.isArray(l.passkeys) ? l.passkeys : []); },
    async passkeyDelete(id) { return this.req('/auth/v1/passkeys/' + encodeURIComponent(id), { method: 'DELETE', token: await this.token() }); },
    async saveProfile(f) {
      const s = cloudLs.get(), tk = await this.token();
      if (!s || !tk) return null;
      return this.req('/rest/v1/profiles?id=eq.' + encodeURIComponent(s.uid), { method: 'PATCH', token: tk, headers: { Prefer: 'return=minimal' }, body: f });
    },
    async signOut() {
      const s = cloudLs.get();
      cloudLs.set(null);
      if (s) { try { await this.req('/auth/v1/logout', { method: 'POST', token: s.access_token }); } catch (e) { /* déjà déconnecté */ } }
    },
    // Lien d'un e-mail ouvert dans le navigateur (…#access_token=…&type=signup) : la session est gardée, l'adresse nettoyée.
    fromLink() {
      try {
        const h = String(location.hash || '');
        if (!/access_token=|error_description=/.test(h)) return null;
        const q = new URLSearchParams(h.slice(1));
        history.replaceState(null, '', location.pathname + location.search);
        if (!q.get('access_token')) return { error: q.get('error_description') || 'Lien expiré' };
        const v = { access_token: q.get('access_token'), refresh_token: q.get('refresh_token'), expires_in: q.get('expires_in'), user: {} };
        try { const p = JSON.parse(atob(v.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); v.user = { id: p.sub, email: p.email }; } catch (e) { /* jeton illisible */ }
        return { session: this.keep(v), type: q.get('type') || '' };
      } catch (e) { return null; }
    }
  };
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('cloud') && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(q.get('cloud'))) { Cloud.url = q.get('cloud'); Cloud.key = q.get('cloudkey') || 'test'; }
    // Navigateur piloté par les tests (navigator.webdriver) : jamais le vrai serveur, aucun compte créé par erreur.
    else if (navigator.webdriver) Cloud.key = '';
  } catch (e) { /* hors navigateur */ }
  // Mode Admin (admin.js) : avec le serveur, réservé aux comptes dont le rôle est « admin » dans la base (2026-11-06,
  // porteur : « même avec une nouvelle adresse, j'ai accès au panneau admin, ce n'est pas normal ») ; sans serveur
  // (tests automatiques), comme avant.
  const admAllowed = () => !Cloud.on() || Cloud.isAdmin();
