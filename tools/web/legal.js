  // ——— Informations légales (H1, H4 ; 2026-10-09) ———
  // Panneau ouvert depuis Réglages › À propos (« Informations légales ») et depuis « Mes PK » (« Règles des PK ») :
  // mentions légales, confidentialité, conditions d'utilisation, règles des PK. Les champs de l'éditeur restent
  // « à compléter » : ils dépendent du porteur (nom ou société, adresse, contact) et ne sont jamais inventés.
  // Textes à faire relire avant toute sortie publique (docs/14-verifications-avant-publication.md).
  // Ce module partage la portée des autres : ses noms commencent par LEGAL_ ou legal.
  const LEGAL_TODO = '[à compléter par l’éditeur avant publication]';
  const LEGAL = {
    mentions: { label: 'Mentions légales', blocks: [
      ['Éditeur', 'Nom ou raison sociale : ' + LEGAL_TODO + '. Adresse : ' + LEGAL_TODO + '. Contact : ' + LEGAL_TODO + '.'],
      ['Directeur de la publication', LEGAL_TODO],
      ['Hébergeur', 'Cloudflare, Inc. (service Cloudflare Pages), 101 Townsend Street, San Francisco, CA 94107, États-Unis.'],
      ['Indépendance', 'Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. Pokémon et les noms, images et marques associés appartiennent à leurs propriétaires respectifs ; ils sont affichés pour identifier les cartes et produits de ta collection.'],
      ['Sources', 'Catalogue, visuels et prix des cartes : TCGdex (et pokemontcg.io en dernier recours pour certains visuels). Cote du scellé : Cardmarket. Boutiques : © les contributeurs d’OpenStreetMap (licence ODbL). Compagnons : sprites de Pokémon Noir et Blanc via PokeAPI. Lecture du scan : Tesseract.js (licence Apache 2.0).'],
      ['Version', 'Démonstration en cours de développement : les cotes sont indicatives et peuvent contenir des erreurs.']
    ] },
    privacy: { label: 'Confidentialité', blocks: [
      ['En bref', 'Dropicards n’a pas de compte ni de serveur pour tes données : ta collection, tes ventes, tes réglages et tes PK restent dans ce navigateur, sur ton appareil. Personne d’autre, pas même l’éditeur, n’y a accès.'],
      ['Position', 'Ta position n’est demandée que si tu touches « Me localiser ». Elle est arrondie à environ 100 m, utilisée sur l’appareil pour trouver les boutiques proches, et n’est ni enregistrée ni envoyée.'],
      ['Appareil photo', 'Le scan lit le numéro et le nom de la carte directement sur ton téléphone. Aucune image n’est envoyée ni gardée.'],
      ['Services contactés', 'Pour afficher l’app, ton navigateur télécharge des fichiers depuis : Cloudflare (l’app elle-même), assets.tcgdex.net et images.pokemontcg.io (visuels des cartes), tiles.openfreemap.org (fond de carte du Radar). Les polices sont hébergées avec l’app. Comme toute page web, ces services voient l’adresse IP de ton appareil ; Dropicards ne leur transmet aucune donnée de ta collection.'],
      ['Liens et partage', 'Les liens vers Amazon, eBay, Fnac, Cultura, Micromania, WhatsApp, Facebook ou X ouvrent ces sites, qui appliquent leurs propres règles. Dropicards ne touche aucune commission.'],
      ['Mesure d’audience', 'Aucun cookie et aucune mesure d’audience pour l’instant. Si une mesure est ajoutée, elle sera sans cookie et indiquée ici.'],
      ['Tes droits', 'Tu peux effacer tes données à tout moment : Réglages › « Vider ma collection », ou en effaçant les données du site dans ton navigateur. Pense à faire une sauvegarde avant. Pour toute question : ' + LEGAL_TODO + '.']
    ] },
    terms: { label: 'Conditions', blocks: [
      ['Objet', 'Dropicards t’aide à suivre la valeur de tes cartes et produits Pokémon TCG. Ce n’est pas une plateforme de vente : l’app ne vend rien et ne sert pas d’intermédiaire.'],
      ['Cotes', 'Les cotes sont calculées à partir de prix publics de plusieurs sources, avec leur date. Ce sont des estimations, pas des offres d’achat ni des conseils financiers ou fiscaux. L’éditeur ne garantit ni leur exactitude ni leur disponibilité.'],
      ['Tes données', 'Elles restent sur ton appareil. Tu es responsable de leur sauvegarde (Réglages › « Sauvegarder ou restaurer »).'],
      ['Démonstration', 'L’app est en cours de développement : fonctions et règles peuvent changer. Les boutiques « partenaires » de l’encadré Démo de Territoire sont fictives ; aucune vraie boutique n’a d’accord avec Dropicards.'],
      ['Contact', LEGAL_TODO]
    ] },
    pk: { label: 'Règles des PK', blocks: [
      ['Ce que sont les PK', 'Les PK sont une monnaie virtuelle de l’app. Ils servent seulement à débloquer des compagnons et des thèmes.'],
      ['Sans valeur', 'Les PK ne s’achètent pas, ne se vendent pas, ne s’échangent pas et ne se convertissent pas en argent ni en biens. Ils n’ont aucune valeur en euros. Il n’y a ni tirage au sort ni jeu d’argent.'],
      ['Gains', '+10 par nouvelle carte ou nouveau produit scellé ajouté (une seule fois par article) ; +10 par jour où tu ouvres l’app ; +100 de bienvenue ; +300 une fois pour un partage de l’app.'],
      ['Sur ton appareil', 'Ton solde est enregistré avec ta collection, sur cet appareil. Il est inclus dans la sauvegarde. Il peut être perdu si les données du site sont effacées.'],
      ['Évolution', 'Les montants, les prix des compagnons et ces règles peuvent évoluer, et les PK peuvent être remis à zéro pendant la démonstration.']
    ] }
  };
  const LEGAL_TABS = ['mentions', 'privacy', 'terms', 'pk'];

  proto.legalOpen = function (tab) { this.setState({ legal: LEGAL[tab] ? tab : 'mentions' }); };
  const legalBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = legalBaseRender.call(this), s = this.st(), cur = LEGAL[s.legal] ? s.legal : '';
    r.legal = {
      open: !!cur, close: () => this.setState({ legal: '' }),
      title: cur ? LEGAL[cur].label : '',
      tabs: LEGAL_TABS.map(k => Object.assign({ label: LEGAL[k].label, on: k === cur, pick: () => this.setState({ legal: k }) }, this.chip(k === cur))),
      blocks: cur ? LEGAL[cur].blocks.map(([t, p]) => ({ title: t, text: p, todo: p.indexOf(LEGAL_TODO) >= 0 })) : [],
      openMentions: () => this.legalOpen('mentions'), openPk: () => this.legalOpen('pk')
    };
    return r;
  };
