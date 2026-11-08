// Modèles des e-mails de Supabase en français, aux couleurs de Dropicards (2026-11-06).
// node tools/supabase/emails.mjs → web/email/*.html, publiés sur https://dropicards.fr/email/…
// Supabase (GoTrue) lit chaque modèle à l'adresse donnée par MAILER_TEMPLATES_* (variables du service dans Coolify).
// Variables remplacées par Supabase : {{ .Token }} (code à 6 chiffres), {{ .ConfirmationURL }} (lien), {{ .Email }},
// {{ .Data.pseudo }} (pseudo donné à l'inscription, données du compte).
// HTML d'e-mail : tableaux et styles en ligne seulement (Gmail, Outlook), aucune police ni script extérieurs.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'web', 'email');
const LOGO = 'https://dropicards.fr/img/brand/dropicards-header.png';
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const code = () => `
<p style="margin:0 0 8px;font-size:15px;color:#3A4560;">Ton code&nbsp;:</p>
<p style="margin:0 0 20px;"><span style="display:inline-block;padding:14px 22px;background:#0B1120;color:#FFD84D;border-radius:12px;font-size:32px;font-weight:800;letter-spacing:8px;font-family:Menlo,Consolas,monospace;">{{ .Token }}</span></p>`;
const button = label => `
<p style="margin:0 0 20px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:13px 22px;background:#FFD60A;color:#0B1120;border:2px solid #0B1120;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">${label}</a></p>`;

const page = (title, body) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F4F1E6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1E6;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E6DFC8;">
<tr><td align="center" style="background:#FFD60A;padding:22px 16px;"><img src="${LOGO}" width="240" alt="Dropicards" style="display:block;width:240px;max-width:80%;height:auto;border:0;"></td></tr>
<tr><td style="padding:28px 26px 8px;font-family:${FONT};color:#0B1120;">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:8px 26px 26px;font-family:${FONT};font-size:12px;line-height:1.5;color:#6B7590;">
Si tu n’es pas à l’origine de cette demande, ignore simplement cet e-mail : rien ne changera sur ton compte.<br>
Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.
</td></tr>
</table></td></tr></table>
</body></html>
`;
const p = t => `<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3A4560;">${t}</p>`;

const MAILS = {
  // Bienvenue (2026-11-08, texte du porteur, adapté le même jour : la validation n'est plus obligatoire pour l'app) : pseudo choisi dans l'app ({{ .Data.pseudo }}, gardé par
  // Supabase avec le compte), bouton de validation, avantages du grade Recrue ; code en secours (app sans le réglage
  // « connexion avant vérification », docs/31 A).
  confirmation: page('Bienvenue sur Dropicards !',
    p('Merci {{ if .Data.pseudo }}<b>{{ .Data.pseudo }}</b>{{ else }}à toi{{ end }} d’avoir créé ton compte sur Dropicards&nbsp;!') +
    p('Dernière petite étape&nbsp;: valide ton adresse e-mail en touchant ce bouton.') +
    button('Valider mon adresse e-mail') +
    p('Tu peux déjà utiliser l’app sans attendre&nbsp;: tu commences au grade <b>Recrue</b>, avec 5 scans par jour, un Booster PK toutes les 24&nbsp;h et un classeur de 36 cartes et 9 produits scellés. Ton adresse validée te permettra aussi de participer aux tirages du PK shop et de recevoir tes lots.') +
    `<p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#6B7590;">Le bouton ne marche pas&nbsp;? Tape ce code dans l’app&nbsp;:</p>
<p style="margin:0 0 20px;"><span style="display:inline-block;padding:8px 14px;background:#0B1120;color:#FFD84D;border-radius:10px;font-size:20px;font-weight:800;letter-spacing:5px;font-family:Menlo,Consolas,monospace;">{{ .Token }}</span></p>`),
  recovery: page('Ton nouveau mot de passe',
    p('Tu as demandé à changer le mot de passe de ton compte Dropicards ({{ .Email }}). Entre ce code dans l’app, puis choisis ton nouveau mot de passe.') + code()),
  magic_link: page('Ton code de connexion',
    p('Entre ce code dans l’app Dropicards pour te connecter.') + code() +
    p('Ou touche ce bouton depuis ton téléphone&nbsp;:') + button('Me connecter')),
  email_change: page('Confirme ta nouvelle adresse',
    p('Tu as demandé à utiliser cette adresse pour ton compte Dropicards. Touche ce bouton pour confirmer.') + button('Confirmer cette adresse')),
  invite: page('Tu es invité sur Dropicards',
    p('Un membre de l’équipe Dropicards t’a invité à créer ton compte. Touche ce bouton pour choisir ton mot de passe.') + button('Créer mon compte'))
};

mkdirSync(OUT, { recursive: true });
for (const [name, html] of Object.entries(MAILS)) writeFileSync(join(OUT, name + '.html'), html);
console.log('web/email : ' + Object.keys(MAILS).join(', '));
