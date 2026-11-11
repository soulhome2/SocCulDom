#!/usr/bin/env python3
"""Собирает prorotypes/index.html — один самодостаточный файл без внешних запросов.

Состав:
- vendor/one-psim/kit.css — скомпилированный слой ONE PSIM Prototype Kit (Tailwind 4: словарь --one-*,
  светлая и тёмная темы, компоненты). Ссылки на шрифты кита (/src/fonts/...) заменяются на Inter в base64;
  курсив кита не встраивается (+380 КБ), браузер наклоняет прямое начертание сам.
- vendor/one-psim/kit.js — рантайм кита (тема, меню, поповеры, подсказки data-tip, бегунок .seg).
- vendor/octicons/octicons-16.json — иконки, в файл попадают только используемые.
- src/app.css, src/body.html, src/i18n-en.js (каталог строк English), src/js/*.js по порядку имён
  (склеиваются в одну функцию), src/selftest.js.
Иконка в коде — ic('имя') в js или {{ic:имя}} в body.html; имя — из octicons-16.json без суффикса -16.

    python tools/build_prototype.py           собрать
    python tools/build_prototype.py --check   проверить, что index.html собран из текущих исходников
"""
import base64
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "prorotypes")
SRC, VENDOR, OUT = os.path.join(P, "src"), os.path.join(P, "vendor"), os.path.join(P, "index.html")


def read(*parts, mode="r"):
    with open(os.path.join(*parts), mode, **({} if "b" in mode else {"encoding": "utf-8"})) as f:
        return f.read()


def kit_css():
    css = read(VENDOR, "one-psim", "kit.css")
    css = re.sub(r"@font-face\{[^}]*\}", "", css)          # шрифты кита ссылаются на /src/fonts/… — заменяем своим
    font = base64.b64encode(read(VENDOR, "one-psim", "InterVariable.woff2", mode="rb")).decode()
    face = (f"@font-face{{font-family:Inter;font-style:normal;font-weight:100 900;font-display:swap;"
            f"src:url(data:font/woff2;base64,{font}) format('woff2')}}")
    return face + css


def app_js():
    parts = sorted(f for f in os.listdir(os.path.join(SRC, "js")) if f.endswith(".js"))
    body = "\n".join(f"/* ===== src/js/{f} ===== */\n" + read(SRC, "js", f) for f in parts)
    return "(function(){\n'use strict';\n" + body + "\n})();"


def build():
    js, body, selftest, i18n = app_js(), read(SRC, "body.html"), read(SRC, "selftest.js"), read(SRC, "i18n-en.js")
    catalog = json.loads(read(VENDOR, "octicons", "octicons-16.json"))
    used = set(re.findall(r"ic\('([a-z0-9-]+)'", js)) | set(re.findall(r"\{\{ic:([a-z0-9-]+)\}\}", body))
    missing = sorted(n for n in used if n not in catalog)
    if missing:
        sys.exit("нет иконок в octicons-16.json: " + ", ".join(missing))
    icons = {n: catalog[n] for n in sorted(used)}
    body = re.sub(r"\{\{ic:([a-z0-9-]+)\}\}",
                  lambda m: f'<svg class="ic" viewBox="0 0 16 16" aria-hidden="true">{catalog[m.group(1)]}</svg>', body)
    return f"""<!doctype html>
<html lang="ru" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Безопасное образование · прототип интерфейса — Интеллект X</title>
<!-- Прототип по ТЗ «SafeEducation_Specification.md» и «Корректировка дашборда». Собран tools/build_prototype.py — руками не править. -->
<style>{kit_css()}</style>
<style>{read(SRC, "app.css")}</style>
</head>
<body class="bg-canvas text-fg font-ui">
{body}
<script>{read(VENDOR, "one-psim", "kit.js")}</script>
<script>const ICONS={json.dumps(icons, ensure_ascii=False)};</script>
<script>{i18n}</script>
<script>{js}</script>
<script>{selftest}</script>
</body>
</html>
"""


if __name__ == "__main__":
    html = build()
    if "--check" in sys.argv:
        current = read(OUT) if os.path.exists(OUT) else ""
        sys.exit(0 if current == html else "index.html устарел — запустите tools/build_prototype.py")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"prorotypes/index.html — {len(html.encode()) // 1024} КБ")
