# Face ID, Touch ID et empreinte : clés d'accès (PKM-App, vivant)

*Créé le 2026-11-06 · « go » du porteur le même jour (« on passe uniquement sur le Face ID et les empreintes »).*

## 1. Ce que ça fait

- Après la création du compte, l'accueil propose une fois « **Activer Face ID / mon empreinte** ». C'est aussi possible à tout moment dans Mon profil › Informations du dresseur.
- La fois suivante, sur « Connecte-toi », le bouton « **Face ID / empreinte** » connecte sans adresse ni mot de passe.
- Le mot de passe reste toujours possible en secours.
- Mon profil liste les appareils enregistrés. « Retirer » supprime l'un d'eux, par exemple un téléphone perdu.
- La clé reste dans le téléphone : trousseau iCloud sur iPhone, gestionnaire de mots de passe Google sur Android. Elle suit l'utilisateur sur ses autres appareils du même compte Apple ou Google.
- Le serveur ne garde que la partie publique de la clé. Elle ne peut pas être devinée, et un faux site ne peut pas la voler.
- Comptes admin : le code à 6 chiffres reste demandé pour ouvrir le mode Admin (`docs/25`, D1). Pour enregistrer Face ID sur un compte admin, il faut d'abord ouvrir le mode Admin.

## 2. Ce qu'il faut sur le serveur

- **Supabase Auth 2.188 ou plus récent.** Le serveur avait la 2.186 (version de Coolify). On passe à la **2.197.0**, dernière version stable (septembre 2026), vérifiée dans le code officiel de Supabase.
- **4 réglages** dans le service `supabase-auth`, noms relevés dans le code de Supabase Auth 2.197.0 :

```yaml
      - GOTRUE_PASSKEY_ENABLED=true
      - GOTRUE_WEBAUTHN_RP_ID=dropicards.fr
      - GOTRUE_WEBAUTHN_RP_DISPLAY_NAME=Dropicards
      - GOTRUE_WEBAUTHN_RP_ORIGINS=https://dropicards.fr
```

## 3. Étapes pour le porteur (≈ 15 min)

0. **Sauvegarde avant de toucher au serveur** : Coolify › service Supabase › Backups, une sauvegarde manuelle (« Backup Now »).
1. Coolify › service Supabase › **Edit Compose File** :
   - dans le bloc `supabase-auth:`, remplacer `image: supabase/gotrue:v2.186.0` par `image: supabase/gotrue:v2.197.0` ;
   - sous `environment:`, ajouter les 4 lignes ci-dessus, avec le même retrait que les lignes voisines ;
   - Save.
2. **Restart** du service. Attendre que tout redevienne vert.
3. Vérifier dans **Logs** du conteneur `supabase-auth` : pas de ligne « WebAuthn configuration is invalid ».
4. Sur le téléphone : ouvrir l'app (cache v137), se connecter, accepter « Activer Face ID / mon empreinte ». Puis Mon profil › Me déconnecter › Me reconnecter › « Face ID / empreinte ».

**Retour en arrière** : remettre `v2.186.0` et retirer les 4 lignes, Save, Restart. Les comptes et les mots de passe ne changent pas.

## 4. Côté app

- `tools/web/cloud.js` :
  - `passkeyOk`, `passkeyRegister`, `passkeyLogin`, `passkeyList`, `passkeyDelete` ;
  - adresses `/auth/v1/passkeys/registration/…`, `/authentication/…`, `/passkeys` ;
  - messages en français pour chaque refus.
- `tools/web/start.js` : bouton de connexion.
- `tools/web/passkey.js` : proposition unique (clé `pkm-pky-asked` sur l'appareil) et Mon profil.
- Test : `tools/web/e2e/t-passkey.mjs`, avec un lecteur d'empreinte imité par Chrome et un serveur imité (10 vérifications).
- Sans serveur, ou sur un téléphone qui ne sait pas faire : rien n'est affiché. Si le serveur n'est pas encore réglé, la proposition explique que la fonction n'est pas encore activée.

## 5. Plus tard

- App installée depuis l'App Store ou le Play Store (Capacitor, `docs/23`) : déclarer le domaine `dropicards.fr` dans l'app (fichiers d'association Apple et Android) pour que les mêmes clés y marchent.
- Coût : 0 €.
