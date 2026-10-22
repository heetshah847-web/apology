#!/usr/bin/env python3
"""LANE-04: transcribe each voice track with Whisper -> content/captions/<voice>.words.json

Usage: python scripts/make-captions.py [--lang en] [--model small] [--force]
Uses faster-whisper (pip install faster-whisper) or openai-whisper. If neither is installed it exits 0 with a
warning and the pipeline falls back to the measured phrase files (content/captions/*.phrases.txt, queen.timing.txt).
Hindi / Gujarati / Hinglish voice-overs: run with --lang hi (or gu) and tell Heet the captions need review.
"""
import argparse, glob, json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HINT = "Heet, Heetu, Tanisha, Queen Tanisha, Ahmedabad."  # helps with the names


def load_transcriber(model_name):
    reasons = []
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel(model_name, device="cpu", compute_type="int8")

        def run(path, lang):
            segs, info = model.transcribe(path, language=lang, word_timestamps=True, initial_prompt=HINT,
                                          vad_filter=False, condition_on_previous_text=False)
            words = [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
                     for s in segs for w in (s.words or []) if w.word.strip()]
            return words, info.language
        return run
    except Exception as e:  # ImportError, or a DLL blocked by Windows Application Control
        reasons.append(f"faster-whisper: {type(e).__name__}: {str(e).splitlines()[-1] if str(e) else ''}")
    try:
        import whisper
        model = whisper.load_model(model_name)

        def run(path, lang):
            res = model.transcribe(path, language=lang, word_timestamps=True, initial_prompt=HINT)
            words = [{"w": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)}
                     for s in res["segments"] for w in s.get("words", []) if w["word"].strip()]
            return words, res.get("language", lang)
        return run
    except Exception as e:
        reasons.append(f"openai-whisper: {type(e).__name__}: {str(e).splitlines()[-1] if str(e) else ''}")
    for r in reasons:
        print("  !", r)
    return None


def find_audio(voice):
    for p in [os.path.join(ROOT, "public/media/voice", voice + ".mp3")] + sorted(glob.glob(os.path.join(ROOT, "assets-drop/voice", voice + ".*"))):
        if os.path.exists(p):
            return p
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="en")
    ap.add_argument("--model", default="small")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    cfg = json.load(open(os.path.join(ROOT, "content/config/story.config.json"), encoding="utf8"))
    transcribe = load_transcriber(args.model)
    if transcribe is None:
        print("! Whisper unavailable (pip install faster-whisper). Falling back to content/captions/*.phrases.txt timings.")
        return 0

    out_dir = os.path.join(ROOT, "content/captions")
    os.makedirs(out_dir, exist_ok=True)
    for t in cfg["tracks"]:
        audio = find_audio(t["voice"])
        out = os.path.join(out_dir, t["voice"] + ".words.json")
        if not audio:
            print(f"! {t['id']}: no audio for {t['voice']} (run npm run media:audio first)")
            continue
        if os.path.exists(out) and not args.force and os.path.getmtime(out) > os.path.getmtime(audio):
            print(f"= {t['id']}: {os.path.basename(out)} is up to date (use --force to redo)")
            continue
        words, lang = transcribe(audio, args.lang)
        json.dump({"track": t["id"], "voice": t["voice"], "language": lang, "model": args.model, "words": words},
                  open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print(f"+ {t['id']}: {len(words)} words ({lang}) -> {os.path.relpath(out, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
