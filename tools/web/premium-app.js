  // ——— Premium dans l'app iOS et Android (2026-11-07, décision du porteur ; remplace premium.js au build DROPI_APP=1) ———
  // Aucune offre, aucun prix, aucun paiement, aucune mention du site (règles d'Apple 3.1.1 et 3.1.3(b), de Google Play).
  // Seul reste l'effet d'un compte déjà Premium (état donné par le serveur, game_state › premium) : scans et classeur
  // illimités, Radar ouvert ; les PA doublés sont donnés par le serveur. Rien n'en parle à l'écran.
  // Ce module partage la portée des autres : ses noms commencent par PREM_ ou prem.
  const premProto = Component.prototype;
  const premInfo = s => (s && s.cloudGame && s.cloudGame.premium) || null;
  premProto.premOn = function () { const p = premInfo(this.st()); return !!(p && p.on); };
  premProto.premOpen = premProto.premClose = premProto.premGo = premProto.premReturn = function () {};
  const premBaseQuota = premProto.scanQuota;
  premProto.scanQuota = function () {
    if (!this.premOn()) return premBaseQuota.apply(this, arguments);
    const s = this.st(), used = s.scanDay === realToday() ? Number(s.scanN) || 0 : 0;
    return { max: Infinity, used: used, left: Infinity, text: 'Scans illimités', over: '' };
  };
  const premBaseRoom = premProto.binderRoom;
  premProto.binderRoom = function (s, pid, qty) { return this.premOn() ? null : premBaseRoom.call(this, s, pid, qty); };
  const premBaseRadar = premProto.radarLocked;
  premProto.radarLocked = function () { return this.premOn() ? false : premBaseRadar.call(this); };
