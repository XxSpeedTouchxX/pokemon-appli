"""Logo des PL (points de loyauté) : 5 propositions (2026-11-14, porteur : « propose-moi différents visuels et design de
PL, un visuel qui se rapproche de points liés à la fidélité, à la confiance de l'utilisateur »).

Même famille que la gemme des PK (web/img/brand/pk.svg) : 64 × 64, contour noir épais, facettes plates claires et
sombres, petite étincelle blanche en haut à droite. Couleurs propres aux PL (turquoise, bleu roi, émeraude) pour ne
jamais les confondre avec les PK (jaune) ni les PA (prune).

Usage : python3 tools/brand/make_pl_proposals.py → tools/brand/pl/pl-1.svg … pl-5.svg
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent / "pl"
INK = "#111111"
SPARK = ('<path d="M51 4Q52.7 8.6 57.3 10.3Q52.7 12 51 16.6Q49.3 12 44.7 10.3Q49.3 8.6 51 4Z" fill="#FFFFFF" '
         f'stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>')


def svg(name, title, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="PL"><title>PL · {title}</title>'
            f'{body}</svg>\n')


def heart(cx, cy, s):
    """Cœur centré en (cx, cy), largeur ≈ 2s."""
    return (f"M{cx} {cy + s * 0.95}"
            f"C{cx - s * 0.2} {cy + s * 0.78} {cx - s} {cy + s * 0.25} {cx - s} {cy - s * 0.22}"
            f"C{cx - s} {cy - s * 0.72} {cx - s * 0.52} {cy - s * 0.95} {cx - s * 0.1} {cy - s * 0.6}"
            f"Q{cx} {cy - s * 0.5} {cx + s * 0.1} {cy - s * 0.6}"
            f"C{cx + s * 0.52} {cy - s * 0.95} {cx + s} {cy - s * 0.72} {cx + s} {cy - s * 0.22}"
            f"C{cx + s} {cy + s * 0.25} {cx + s * 0.2} {cy + s * 0.78} {cx} {cy + s * 0.95}Z")


def star(cx, cy, r1, r2, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + i * 180 / n)
        pts.append(f"{cx + r * math.cos(a):.2f} {cy + r * math.sin(a):.2f}")
    return "M" + "L".join(pts) + "Z"


def pl1():
    # Bouclier-cœur : bouclier turquoise à facettes (confiance), cœur blanc au centre (fidélité).
    sh = "M32 3L56 11.5L56 30C56 45 45.5 55.5 32 61C18.5 55.5 8 45 8 30L8 11.5Z"
    body = (f'<path d="{sh}" fill="{INK}" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>'
            '<path d="M32 7L52 14L52 30C52 42.6 43.6 51.6 32 56.6Z" fill="#12B5A6"/>'
            '<path d="M32 7L12 14L12 30C12 42.6 20.4 51.6 32 56.6Z" fill="#3FE0CF"/>'
            '<path d="M32 7L52 14L32 31Z" fill="#7BF1E4"/><path d="M32 7L12 14L32 31Z" fill="#B5FFF6"/>'
            f'<path d="{heart(32, 32, 11)}" fill="#FFFFFF" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>'
            + SPARK)
    return svg("pl-1", "Bouclier-cœur", body)


def pl2():
    # Sceau de confiance : médaillon dentelé bleu roi (comme un badge « vérifié »), cœur et coche.
    n, R, r = 16, 29, 25.5
    pts = []
    for i in range(n * 2):
        rr = R if i % 2 == 0 else r
        a = math.radians(-90 + i * 180 / n)
        pts.append(f"{32 + rr * math.cos(a):.2f} {32 + rr * math.sin(a):.2f}")
    seal = "M" + "L".join(pts) + "Z"
    body = (f'<path d="{seal}" fill="#2E6BFF" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>'
            f'<circle cx="32" cy="32" r="19" fill="#5C8DFF" stroke="{INK}" stroke-width="2.4"/>'
            '<path d="M18.5 25A15 15 0 0 1 32 15.5" fill="none" stroke="#B9CEFF" stroke-width="3" stroke-linecap="round"/>'
            f'<path d="{heart(32, 31, 10.5)}" fill="#FFFFFF" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
            f'<path d="M26.5 31.5L30.5 35.5L38 27.5" fill="none" stroke="#2E6BFF" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'
            + SPARK)
    return svg("pl-2", "Sceau de confiance", body)


def pl3():
    # Médaille de fidélité : médaille dorée à l'étoile, deux rubans bleus (récompense, classement).
    body = ('<path d="M21 34L13 58L20.5 54L25 61L32 40Z" fill="#2E6BFF" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>'
            '<path d="M43 34L51 58L43.5 54L39 61L32 40Z" fill="#1F4FD0" stroke="#111111" stroke-width="2.6" stroke-linejoin="round"/>'
            f'<circle cx="32" cy="27" r="21" fill="#FFD60A" stroke="{INK}" stroke-width="3.2"/>'
            f'<circle cx="32" cy="27" r="15.5" fill="#E8A000" stroke="{INK}" stroke-width="2"/>'
            '<path d="M19.5 21A13 13 0 0 1 30 13.6" fill="none" stroke="#FFE680" stroke-width="2.6" stroke-linecap="round"/>'
            f'<path d="{star(32, 27.5, 11, 4.8)}" fill="#FFF1A0" stroke="{INK}" stroke-width="2.4" stroke-linejoin="round"/>'
            + SPARK)
    return svg("pl-3", "Médaille de fidélité", body)


def pl4():
    # Cœur de cristal : cœur taillé comme une gemme (cousin de la gemme des PK), émeraude.
    h = heart(32, 31, 26)
    body = (f'<path d="{h}" fill="{INK}" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>'
            f'<clipPath id="hc"><path d="{heart(32, 31, 23.5)}"/></clipPath>'
            '<g clip-path="url(#hc)">'
            '<rect x="0" y="0" width="64" height="64" fill="#0FA36B"/>'
            '<path d="M32 22L6 4L4 30Z" fill="#7DF2BF"/><path d="M32 22L4 30L32 58Z" fill="#2FD192"/>'
            '<path d="M32 22L58 4L60 30Z" fill="#3FE0A3"/><path d="M32 22L60 30L32 58Z" fill="#0FA36B"/>'
            '<path d="M32 22L6 4L58 4Z" fill="#B8FFE0"/>'
            '</g>'
            f'<path d="M32 22L32 56M32 22L12 13M32 22L52 13M32 22L9 30M32 22L55 30" stroke="{INK}" stroke-width="1.2" opacity="0.35"/>'
            + SPARK)
    return svg("pl-4", "Cœur de cristal", body)


def leaf(cx, cy, ang, L=7.5, W=3.2):
    a = math.radians(ang)
    ux, uy = math.cos(a), math.sin(a)
    px, py = -uy, ux
    tip = (cx + ux * L, cy + uy * L)
    return (f"M{cx:.2f} {cy:.2f}Q{cx + ux * L / 2 + px * W:.2f} {cy + uy * L / 2 + py * W:.2f} {tip[0]:.2f} {tip[1]:.2f}"
            f"Q{cx + ux * L / 2 - px * W:.2f} {cy + uy * L / 2 - py * W:.2f} {cx:.2f} {cy:.2f}Z")


def pl5():
    # Laurier étoilé : couronne de laurier (mérite, classement de saison) autour d'une étoile dorée, ruban rouge.
    body = ''
    for side in (-1, 1):
        for k in range(7):
            # Feuilles posées sur un arc, du bas (110°) vers le haut (-20°) de chaque côté, pointées vers le haut.
            t = math.radians(112 - k * 20)
            cx, cy = 32 + side * 24 * math.cos(t), 33 + 24 * math.sin(t)
            tang = math.degrees(t) + (-90 if side > 0 else 90)
            ang = (180 - tang) if side < 0 else tang
            ang = -90 - side * (90 - (112 - k * 20)) + side * 35
            body += f'<path d="{leaf(cx, cy, ang, 11, 4.4)}" fill="{"#2FB65A" if k % 2 else "#43D16E"}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'
    body = ('<path d="M22 54Q32 61 42 54" fill="none" stroke="#111111" stroke-width="6" stroke-linecap="round"/>'
            '<path d="M22 54Q32 61 42 54" fill="none" stroke="#E5484D" stroke-width="3.4" stroke-linecap="round"/>'
            + body
            + f'<path d="{star(32, 32, 14.5, 6.4)}" fill="#FFD60A" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
            '<path d="M32 17.5L35.7 26.9L32 32Z" fill="#FFF1A0"/>'
            + SPARK)
    return svg("pl-5", "Laurier étoilé", body)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for i, f in enumerate([pl1, pl2, pl3, pl4, pl5], 1):
        (OUT / f"pl-{i}.svg").write_text(f(), "utf-8")
    print("5 propositions écrites dans", OUT)
    # Choix du porteur (2026-11-14, « ok pour le visuel bouclier coeur ») : pl-1 copié en web/img/brand/pl.svg.
