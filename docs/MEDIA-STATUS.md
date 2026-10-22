# Media status (received 21 Oct 2026)

## Voice-overs ✅ (ElevenLabs, voice "David – Documentary")
| Track | File | Measured | Spoken phrases | Captions |
|---|---|---|---|---|
| t0 Queen (her beauty) | `vo-0-queen.mp3` | 22.99s | 7 | ✅ timed: `content/captions/queen.timing.txt` (phrases match the script 1:1) |
| t1 Friendship → Love | `vo-1.mp3` | 45.09s | 17 | ⏳ phrase times known (`vo-1.phrases.txt`), **script text missing** |
| t2 Long distance → Apology | `vo-2.mp3` | 43.31s | 17 | ⏳ phrase times known (`vo-2.phrases.txt`), **script text missing** |

**Needed from Heet:** paste the ElevenLabs script text of vo-1 into `content/scripts/track-1.md` and vo-2 into `track-2.md`, with `[[chapter:love]]` where the love part starts and `[[chapter:apology]]` where the apology starts (or tell us if vo-2 has no apology part).
**If the scripts never arrive:** LANE‑04 transcribes with Whisper and uses that text as captions (flagged `needsReview: true`), splitting chapters at the longest pause.

## Photos ✅ 28 sorted (originals renamed, order = filename prefix)
| Chapter | Count | Notes |
|---|---|---|
| Queen | 8 | each anchored to a spoken phrase via `meta.json → at`; red under fairy lights on "the moon envied her glow", flower-in-hair on "the roses", close portrait on "time paused", red outfit for the finale "Queen Tanisha" |
| Friendship | 7 | includes the uni seoul photobooth strip (show whole, `fit: contain`) and the "All my heart" collage as the hand-off into Love |
| Love | 6 | cheek kisses, café date; 4 have overlay lines |
| Distance | 6 | video-call screenshot opens the chapter; the rest are her side only |
| Apology | 1 | holding hands — last photo before the Question |

## Nice to add (optional, makes it better)
1. **Heet's side for the Distance chapter** (3–5): his photos from that time, call/chat screenshots → `phase-3-distance/his-side-*.jpg`. The split "her side / his side" layout currently has only her side.
2. **1–2 more for the Apology**: the photos that matter most to you both.
3. **5 "Heetu version" photos** for the planner (11th, 1st sem, March, bestfriend, current) → `photos/heetu-versions/`.
4. Music: `bed.mp3`, `yes.mp3`, `planner.mp3`.

## Privacy
WhatsApp exports have no GPS data, and the image pipeline strips all metadata anyway.
