import math
from PIL import Image, ImageDraw

def ball(size):
    S = size * 4
    im = Image.new('RGB', (S, S), '#14532d')
    d = ImageDraw.Draw(im)
    # team-color corner stripe
    d.polygon([(0, S), (0, S * .78), (S * .22, S)], fill='#d62828')
    d.polygon([(S, 0), (S * .78, 0), (S, S * .22)], fill='#fcbf49')
    c = S / 2; R = S * .34
    d.ellipse([c - R - S*.02, c - R + S*.02, c + R + S*.02, c + R + S*.06], fill='#0b3a1f')
    d.ellipse([c - R, c - R, c + R, c + R], fill='white', outline='#111', width=int(S*.012))
    def pent(cx, cy, r, rot=-90):
        return [(cx + r*math.cos(math.radians(rot + 72*i)), cy + r*math.sin(math.radians(rot + 72*i))) for i in range(5)]
    r0 = R * .36
    inner = pent(c, c, r0)
    d.polygon(inner, fill='#111')
    for i in range(5):
        ang = -90 + 72*i
        x1, y1 = c + r0*math.cos(math.radians(ang)), c + r0*math.sin(math.radians(ang))
        x2, y2 = c + R*.68*math.cos(math.radians(ang)), c + R*.68*math.sin(math.radians(ang))
        d.line([(x1, y1), (x2, y2)], fill='#111', width=int(S*.012))
        px, py = c + R*.86*math.cos(math.radians(ang)), c + R*.86*math.sin(math.radians(ang))
        # edge patches (clipped to ball via mask below)
        d.polygon(pent(px, py, R*.2, ang + 180), fill='#111')
    # mask outside the ball back to background
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).ellipse([c - R, c - R, c + R, c + R], fill=255)
    bg = Image.new('RGB', (S, S), '#14532d')
    d2 = ImageDraw.Draw(bg)
    d2.polygon([(0, S), (0, S * .78), (S * .22, S)], fill='#d62828')
    d2.polygon([(S, 0), (S * .78, 0), (S, S * .22)], fill='#fcbf49')
    d2.ellipse([c - R - S*.02, c - R + S*.02, c + R + S*.02, c + R + S*.06], fill='#0b3a1f')
    bg.paste(im, (0, 0), mask)
    ImageDraw.Draw(bg).ellipse([c - R, c - R, c + R, c + R], outline='#111', width=int(S*.014))
    return bg.resize((size, size), Image.LANCZOS)

for s in (192, 512):
    ball(s).save('icon-%d.png' % s)
