#!/usr/bin/env python3
"""Lokale, ressourcenschonende OCR-Vorbereitung für gescannte Prüfungs-PDFs.

Voraussetzung: OCRmyPDF sowie Tesseract mit deutscher Sprache sind lokal
installiert. Der Aufruf nutzt ausschließlich lokale Programme, keine Cloud.
Originale bleiben unverändert, ein neuer Dateiname wird vorgeschlagen.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import shutil
import subprocess
import sys


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Gescannte PDFs offline durchsuchbar machen (maximal 2 OCR-Prozesse)."
    )
    parser.add_argument("datei", type=Path, help="Original-PDF")
    parser.add_argument("--sprache", default="deu+eng", help="Tesseract-Sprachen")
    args = parser.parse_args()

    source = args.datei.expanduser().resolve()
    if not source.is_file() or source.suffix.lower() != ".pdf":
        parser.error("Bitte eine vorhandene PDF-Datei übergeben.")
    executable = shutil.which("ocrmypdf")
    if not executable:
        print(
            "OCRmyPDF fehlt. Auf macOS z. B. mit 'brew install ocrmypdf' installieren.",
            file=sys.stderr,
        )
        return 2

    output = source.with_name(f"{source.stem}.durchsuchbar.pdf")
    if output.exists():
        print(f"Ziel existiert bereits; nichts überschrieben: {output}", file=sys.stderr)
        return 2

    # --skip-text erhält vorhandene digitale PDF-Textseiten.
    # --jobs 2 begrenzt die CPU-/RAM-Last auf kleinen Systemen.
    cmd = [
        executable,
        "--skip-text",
        "--rotate-pages",
        "--deskew",
        "--jobs", "2",
        "-l", args.sprache,
        str(source),
        str(output),
    ]
    print(f"Lokale OCR: {source.name} -> {output.name}")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        print(f"OCR fehlgeschlagen (Exitcode {exc.returncode}).", file=sys.stderr)
        return exc.returncode or 1

    print(f"Fertig: {output}")
    print("Nun dieses durchsuchbare PDF in Learning-by-Doing importieren.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
