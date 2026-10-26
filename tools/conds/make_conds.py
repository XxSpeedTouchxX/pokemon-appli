"""Icônes des 6 états des cartes (2026-10-25, demande du porteur) : une bulle par état, de la plus brillante (Mint,
étoiles qui scintillent) à la plus usée (Poor, fissurée et entamée). Écrit web/img/conds/*.svg ; aucune dépendance."""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'web', 'img', 'conds')
STAR = lambda x, y, r: f'M{x} {y-r}Q{x+r*0.18} {y-r*0.18} {x+r} {y}Q{x+r*0.18} {y+r*0.18} {x} {y+r}Q{x-r*0.18} {y+r*0.18} {x-r} {y}Q{x-r*0.18} {y-r*0.18} {x} {y-r}Z'
STILL = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }'

def bubble(c1, c2, c3, gloss, extra_defs='', bubble_path=None):
    grad = (f'<radialGradient id="b" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="{c1}"/>'
            f'<stop offset="0.55" stop-color="{c2}"/><stop offset="1" stop-color="{c3}"/></radialGradient>')
    shape = bubble_path or '<circle cx="32" cy="32" r="25"/>'
    return grad + extra_defs, shape, gloss

def card(fill='#FFFFFF', stroke='#111111', inner=''):
    return (f'<rect x="23" y="18" width="18" height="26" rx="3" fill="{fill}" stroke="{stroke}" stroke-width="1.8"/>' + inner)

def svg(name, defs, shape, body, gloss, outside='', style=''):
    gl = {
        'strong': '<ellipse cx="23" cy="19" rx="10" ry="6" fill="#FFFFFF" opacity="0.75" transform="rotate(-28 23 19)"/><circle cx="43" cy="44" r="2.2" fill="#FFFFFF" opacity="0.55"/>',
        'medium': '<ellipse cx="23" cy="19" rx="8" ry="4.6" fill="#FFFFFF" opacity="0.55" transform="rotate(-28 23 19)"/>',
        'light': '<ellipse cx="23" cy="19" rx="6" ry="3.2" fill="#FFFFFF" opacity="0.3" transform="rotate(-28 23 19)"/>',
        'none': ''}[gloss]
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
         f'<style>{style}{STILL}</style><defs>{defs}<clipPath id="k">{shape}</clipPath></defs>'
         f'{outside}<g clip-path="url(#k)"><g fill="url(#b)">{shape}</g>{body}{gl}</g>'
         f'<g fill="none" stroke="#111111" stroke-width="2.4" stroke-linejoin="round">{shape}</g></svg>')
    open(os.path.join(OUT, name + '.svg'), 'w').write(s)

# Mint : or holographique, reflet qui passe, étoiles qui scintillent autour.
defs, shape, g = bubble('#FFFBD6', '#FFD60A', '#E89A00', 'strong',
    '<linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FE7FF" stop-opacity="0.45"/>'
    '<stop offset="0.5" stop-color="#FF8AF0" stop-opacity="0.3"/><stop offset="1" stop-color="#9BFF8A" stop-opacity="0.4"/></linearGradient>'
    '<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>'
    '<stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>')
mint_card = card('#FFFFFF', '#111111', f'<rect x="25.5" y="20.5" width="13" height="10" rx="1.5" fill="#BFE9FF"/><path d="{STAR(32, 37.5, 4.2)}" fill="#FFD60A" stroke="#111111" stroke-width="1"/>')
svg('mt', defs, shape,
    '<circle cx="32" cy="32" r="25" fill="url(#h)"/>' + mint_card + '<rect class="sw" x="-30" y="0" width="22" height="64" fill="url(#sw)" transform="skewX(-20)"/>', g,
    outside=''.join(f'<path class="st s{i}" d="{STAR(x, y, r)}" fill="#FFF7B0" stroke="#111111" stroke-width="1"/>'
                    for i, (x, y, r) in enumerate([(7.5, 9, 7), (56.5, 10.5, 5.5), (57.5, 54, 6.2), (6.5, 52.5, 5)])),
    style='.sw{animation:sw 2.4s ease-in-out infinite}@keyframes sw{0%,35%{transform:translateX(0) skewX(-20deg)}75%,100%{transform:translateX(110px) skewX(-20deg)}}'
          '.st{transform-box:fill-box;transform-origin:center;animation:tw 1.6s ease-in-out infinite}.s1{animation-delay:-.4s}.s2{animation-delay:-.8s}.s3{animation-delay:-1.2s}'
          '@keyframes tw{0%,100%{transform:scale(.55) rotate(0);opacity:.55}50%{transform:scale(1.1) rotate(20deg);opacity:1}}')
# Near Mint : argent bleuté, brillant, une étoile.
defs, shape, g = bubble('#F4FAFF', '#A8C8FF', '#5F7FD6', 'strong')
svg('nm', defs, shape, card('#FFFFFF', '#111111', '<rect x="25.5" y="20.5" width="13" height="10" rx="1.5" fill="#D6E6FF"/><path d="M26 35H38 M26 39H35" stroke="#111111" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>'), g,
    outside=f'<path d="{STAR(55, 10, 4.2)}" fill="#E6F0FF" stroke="#111111" stroke-width="1"/>')
# Excellent : vert, reflet léger, coins à peine blanchis.
defs, shape, g = bubble('#DDFBE8', '#3DDC84', '#1C8F52', 'medium')
svg('ex', defs, shape, card('#FFFFFF', '#111111', '<rect x="25.5" y="20.5" width="13" height="10" rx="1.5" fill="#CFF5DD"/><path d="M26 35H38 M26 39H35" stroke="#111111" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>'
    '<circle cx="24.4" cy="19.4" r="1.1" fill="#C9C9C9"/><circle cx="39.6" cy="42.6" r="1.1" fill="#C9C9C9"/>'), g)
# Good : ambre mat, rayures.
defs, shape, g = bubble('#FFEFC2', '#F5B14C', '#B8701A', 'light')
svg('gd', defs, shape, card('#F7F3EA', '#111111', '<rect x="25.5" y="20.5" width="13" height="10" rx="1.5" fill="#F3DFB4"/><path d="M26 35H38 M26 39H35" stroke="#111111" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>'
    '<path d="M27 23L35 29 M30 33L37 37" stroke="#FFFFFF" stroke-width="1" opacity="0.9"/>')
    + '<path d="M12 26L20 22 M44 46L52 41 M46 15L50 20" stroke="#7A4A10" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>', g)
# Played : orange terne, ébréchée, carte pliée.
pl_shape = '<path d="M32 7A25 25 0 1 1 9.5 21.5L14 22.5L12.8 17.6Z"/>'
defs, shape, g = bubble('#F7C9AE', '#E07A45', '#9A4520', 'none', bubble_path=pl_shape)
svg('pl', defs, shape, '<path d="M23 18H41V41L37 44H23Z" fill="#EDE5D6" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>'
    '<path d="M41 41L37 40.5L37 44" fill="#C9BFAE" stroke="#111111" stroke-width="1.4" stroke-linejoin="round"/>'
    '<path d="M24 34L40 24" stroke="#9A8B74" stroke-width="1.6"/><rect x="25.5" y="20.5" width="13" height="10" rx="1.5" fill="#E6CDB4" opacity="0.8"/>'
    '<path d="M13 30L22 27 M42 49L51 44 M45 14L49 19 M15 42L21 46" stroke="#5A2A10" stroke-width="1.3" stroke-linecap="round" opacity="0.75"/>', g)
# Poor : gris-brun délavé, fissures, morceau manquant, carte déchirée et tachée.
po_shape = '<path d="M32 7A25 25 0 0 1 57 32A25 25 0 0 1 47 52L44 47L40 51L37 46L33 50L31 57A25 25 0 0 1 7 32A25 25 0 0 1 32 7Z"/>'
defs, shape, g = bubble('#D9D0C4', '#8E7D6C', '#54473B', 'none', bubble_path=po_shape)
svg('po', defs, shape, '<circle cx="18" cy="40" r="5" fill="#4A3E33" opacity="0.35"/><circle cx="45" cy="20" r="4" fill="#4A3E33" opacity="0.3"/>'
    '<path d="M23 19H41V31L38 33L41 36L37 39L39 43H23Z" fill="#D8CDBA" stroke="#111111" stroke-width="1.8" stroke-linejoin="round"/>'
    '<ellipse cx="30" cy="36" rx="5" ry="3.4" fill="#A8946F" opacity="0.7"/><path d="M24 26L33 31L28 41 M33 19L31 26" stroke="#6B5A45" stroke-width="1.4" fill="none"/>'
    '<path d="M10 22L17 27L14 33 M50 30L44 33L47 39 M24 8L27 13" stroke="#2E241B" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', g)
print('ok')
