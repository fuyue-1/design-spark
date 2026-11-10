# -*- coding: utf-8 -*-
"""生成应用图标与启动图（毕设选题参谋）。"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "store")
os.makedirs(OUT, exist_ok=True)

FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
FONT_REG = r"C:\Windows\Fonts\msyh.ttc"
FONT_LATIN = r"C:\Windows\Fonts\segoeuib.ttf"

INK_1 = (8, 10, 18)
INK_2 = (22, 27, 48)
INDIGO = (43, 70, 217)
VIOLET = (109, 94, 240)
MINT = (143, 240, 226)


def font(path, size):
    return ImageFont.truetype(path, size)


def diagonal_gradient(w, h, c1, c2):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    t = (0.62 * x / max(w - 1, 1) + 0.38 * y / max(h - 1, 1))
    t = np.clip(t, 0, 1)[..., None]
    a = np.array(c1, dtype=np.float32)
    b = np.array(c2, dtype=np.float32)
    arr = (a + (b - a) * t).astype(np.uint8)
    return Image.fromarray(arr, "RGB").convert("RGBA")


def add_glow(base, cx, cy, r, color, alpha):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(r * 0.52))
    return Image.alpha_composite(base, layer)


def add_grid(base, step, alpha):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = base.size
    for x in range(0, w, step):
        d.line([(x, 0), (x, h)], fill=(255, 255, 255, alpha), width=1)
    for y in range(0, h, step):
        d.line([(0, y), (w, y)], fill=(255, 255, 255, alpha), width=1)
    return Image.alpha_composite(base, layer)


def star(draw, cx, cy, r, color, waist=0.30):
    pts = [
        (cx, cy - r),
        (cx + r * waist, cy - r * waist),
        (cx + r, cy),
        (cx + r * waist, cy + r * waist),
        (cx, cy + r),
        (cx - r * waist, cy + r * waist),
        (cx - r, cy),
        (cx - r * waist, cy - r * waist),
    ]
    draw.polygon(pts, fill=color)


def tracked(draw, text, fnt, cx, cy, fill, tracking, anchor="lm"):
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, cy), ch, font=fnt, fill=fill, anchor=anchor)
        x += w + tracking


def gradient_text(base, text, fnt, cx, cy, tracking, c1, c2):
    w, h = base.size
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    widths = [md.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, cw in zip(text, widths):
        md.text((x, cy), ch, font=fnt, fill=255, anchor="lm")
        x += cw + tracking
    grad = diagonal_gradient(w, h, c1, c2)
    base.paste(grad, (0, 0), mask)


def rounded_gradient(size, radius, c1, c2, angle_shift=0):
    w, h = size
    grad = diagonal_gradient(w, h, c1, c2)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def book_mark(size):
    """圆角方块 + 白色书页 + 薄荷色星。"""
    s = size
    im = rounded_gradient((s, s), int(s * 0.27), INDIGO, VIOLET)
    d = ImageDraw.Draw(im)

    bx0, by0 = s * 0.30, s * 0.25
    bx1, by1 = s * 0.66, s * 0.75
    d.rounded_rectangle([bx0, by0, bx1, by1], radius=s * 0.035, fill=(255, 255, 255, 255))
    # 书脊
    d.rectangle([bx0 + s * 0.052, by0, bx0 + s * 0.074, by1], fill=INDIGO + (255,))
    # 两条文字线
    lx = bx0 + s * 0.115
    for i, wfrac in enumerate((0.30, 0.21)):
        y = by0 + s * 0.12 + i * s * 0.085
        d.rounded_rectangle([lx, y, lx + s * wfrac, y + s * 0.026], radius=s * 0.013, fill=INDIGO + (255,))
    star(d, s * 0.73, s * 0.215, s * 0.105, MINT + (255,))
    return im


def text_tile(size):
    """与图标一致的方形标识：渐变底 + 选题 + 星。"""
    s = size
    im = rounded_gradient((s, s), int(s * 0.27), INDIGO, VIOLET)
    tf = font(FONT_BOLD, int(s * 0.35))
    gradient_text(im, "选题", tf, s / 2, s * 0.485, int(s * 0.010),
                  (255, 255, 255), (208, 216, 255))
    d = ImageDraw.Draw(im)
    bar_w, bar_h = int(s * 0.36), int(s * 0.024)
    bar = rounded_gradient((bar_w, bar_h), bar_h // 2, MINT, (255, 255, 255))
    im.alpha_composite(bar, (int(s / 2 - bar_w / 2), int(s * 0.775)))
    star(d, s * 0.795, s * 0.235, s * 0.068, MINT + (255,))
    return im


def base_canvas(w, h, grid_step):
    im = diagonal_gradient(w, h, INK_1, INK_2)
    im = add_glow(im, w * 0.84, h * 0.10, w * 0.52, VIOLET, 105)
    im = add_glow(im, w * 0.06, h * 0.94, w * 0.46, (14, 139, 128), 62)
    im = add_grid(im, grid_step, 7)
    return im


def make_icon(px=2048):
    f = px / 1024.0
    im = base_canvas(px, px, int(64 * f))
    d = ImageDraw.Draw(im)

    tf = font(FONT_BOLD, int(340 * f))
    gradient_text(im, "选题", tf, px / 2, px * 0.485, int(10 * f),
                  (255, 255, 255), (198, 208, 255))

    # 渐变下划线
    bar_w, bar_h = int(196 * f), int(10 * f)
    bar = rounded_gradient((bar_w, bar_h), bar_h // 2, INDIGO, MINT)
    im.alpha_composite(bar, (int(px / 2 - bar_w / 2), int(px * 0.695)))

    # 星星
    d = ImageDraw.Draw(im)
    star(d, px * 0.800, px * 0.268, 43 * f, MINT + (255,))
    star(d, px * 0.858, px * 0.338, 18 * f, MINT + (210,))

    return im.resize((1024, 1024), Image.LANCZOS).convert("RGB")


def make_splash(w=2160, h=3840):
    f = w / 1080.0
    im = base_canvas(w, h, int(72 * f))
    d = ImageDraw.Draw(im)

    # 中心光晕
    im = add_glow(im, w * 0.5, h * 0.315, w * 0.46, (91, 91, 214), 55)
    d = ImageDraw.Draw(im)

    # 顶部图标
    mark = text_tile(int(188 * f))
    mx = int((w - mark.width) / 2)
    my = int(h * 0.245)
    halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse(
        [w * 0.5 - 170 * f, my + mark.height / 2 - 170 * f,
         w * 0.5 + 170 * f, my + mark.height / 2 + 170 * f],
        fill=(143, 240, 226, 30))
    halo = halo.filter(ImageFilter.GaussianBlur(60 * f))
    im = Image.alpha_composite(im, halo)
    im.alpha_composite(mark, (mx, my))
    d = ImageDraw.Draw(im)

    # 品牌名
    title_f = font(FONT_BOLD, int(92 * f))
    tracked(d, "毕设选题参谋", title_f, w / 2, h * 0.405, (255, 255, 255), 8 * f)

    # 副标题
    sub_f = font(FONT_REG, int(33 * f))
    tracked(d, "计算机类本科毕业设计选题工具", sub_f, w / 2, h * 0.452,
            (255, 255, 255, 150), 2 * f)

    # 分隔线
    d.line([(w * 0.22, h * 0.492), (w * 0.78, h * 0.492)], fill=(255, 255, 255, 34), width=max(1, int(1.5 * f)))

    # 三个数据胶囊
    pills = ["100 道题目", "8 个方向", "18 个往届比对"]
    pf = font(FONT_REG, int(27 * f))
    gap = 14 * f
    widths = [d.textlength(t, font=pf) + 42 * f for t in pills]
    total = sum(widths) + gap * (len(pills) - 1)
    x = w / 2 - total / 2
    py = h * 0.522
    ph = 54 * f
    for text, pw in zip(pills, widths):
        d.rounded_rectangle([x, py, x + pw, py + ph], radius=ph / 2,
                            outline=(255, 255, 255, 52), width=max(1, int(1.4 * f)))
        d.text((x + pw / 2, py + ph / 2), text, font=pf, fill=(255, 255, 255, 205), anchor="mm")
        x += pw + gap

    # 标语
    tag_f = font(FONT_BOLD, int(40 * f))
    d.text((w / 2, h * 0.655), "选题之前，先把问题想清楚", font=tag_f,
           fill=(255, 255, 255, 210), anchor="mm")

    # 能力关键词
    feat_f = font(FONT_REG, int(25 * f))
    tracked(d, "测评匹配 · 题目自检 · 方案导出", feat_f, w / 2, h * 0.715,
            (255, 255, 255, 132), 2 * f)

    # 底部信息
    bf = font(FONT_REG, int(24 * f))
    d.text((w / 2, h * 0.885), "本地运行 · 数据仅保存在本机", font=bf,
           fill=(255, 255, 255, 96), anchor="mm")
    lf = font(FONT_LATIN, int(16 * f))
    tracked(d, "THESIS TOPIC ADVISOR", lf, w / 2, h * 0.922, (255, 255, 255, 62), 8 * f)
    return im.resize((1080, 1920), Image.LANCZOS).convert("RGB")


def main():
    icon = make_icon()
    icon_path = os.path.join(OUT, "icon-1024.png")
    icon.save(icon_path, optimize=True)

    for s in (512, 192, 180):
        icon.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, "icon-%d.png" % s), optimize=True)

    splash = make_splash()
    splash_path = os.path.join(OUT, "splash-1080x1920.png")
    splash.save(splash_path, optimize=True)

    for p in (icon_path, splash_path):
        print(p, os.path.getsize(p))


if __name__ == "__main__":
    main()
