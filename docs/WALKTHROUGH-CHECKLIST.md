# Final walkthrough checklist (for Heet, on his own phone and laptop)

## Needs your input before this is final
- [x] **Scripts for tracks 1 and 2: not needed** (Heet decided). Captions stay as the voice-matched transcript; the one obvious error ("Quarles" -> "Quarrels") is fixed in `src/data/story.generated.json` and `content/captions/`. Re-reading the other captions once while listening is still worthwhile.
- [ ] **Two Love overlay lines.** Photos `03-cheek-kiss` and `05-cafe-kiss-1` have no overlay line (4 of 6 do). `meta.json` / the OVERLAY LINES section only contain four lines, so nothing to use; write two lines (or tell me to leave those photos bare).
- [ ] Approve or reject the **"punish your man" planner step** (4 options you asked for). It is built on branch `lane/12b-punish` but is NOT in this branch: porting it edits `content/config/planner.config.json` and the frozen `src/contracts`.
- [ ] Decide on the mobile LCP: 2.7 s vs the 2.5 s target under worst-case throttling (see QA-REPORT).

## Walk it (laptop first, then phone)
1. Open the site: passcode screen (if enabled) -> map unfolds on tap; sound unlocks.
2. Scroll once: the Queen voice starts by itself; text and photos follow the voice.
3. Scroll through the interlude: Friendship, then Love begins at ~24 s of the second voice; theme turns rose.
4. Interlude again: Distance, then Apology (theme turns to dawn at ~15 s).
5. Voice ends -> 1.5 s of quiet -> "Will you be mine again?" rises.
6. Try **No** 6 times (it runs, shrinks, changes words, finally becomes Yes); then **Yes -> Promise?** -> hearts -> planner appears.
7. Planner: every step, edit/remove items, leave and come back (it remembers), pick a date and slot, Confirm.
8. Receipt: order number, items, her wishes, seal; **Send to Heetu** opens WhatsApp with the summary (check the number is yours), **Save receipt** gives a PNG, **Edit order** returns to the planner.
9. Closing screen: line, photo collage, "Watch our story again".
10. Touch the screen / scroll during narration: it should hand control to you ("Resume voice"), and **Skip** should jump ahead.
11. Reload mid-way and with phone silent/muted; turn on "Reduce motion" in the OS and check it still reads.

## Device checks only you can do
- [ ] iPhone Safari: sound plays after the first tap, receipt PNG saves, WhatsApp opens.
- [ ] Android Chrome: same.
- [ ] Laptop Chrome/Safari/Edge at 1440x900 and 1366x768.

## Deploy plan (NOT started; needs your yes)
1. You say go. I will NOT run `vercel login` or deploy before that.
2. `VITE_WHATSAPP_NUMBER` must exist in Vercel: Project -> Settings -> Environment Variables (Preview + Production), value `918758131533`. It is read at build time and compiled into the JS, so it is visible to anyone who opens devtools; `.env.local` stays git-ignored and is never uploaded.
3. Choose a non-guessable project name (suggest something random like `atlas-xxxxxx`).
4. Preview deploy first (`vercel` without `--prod`), you review the link on your phone, then production.
5. Confirm the live response header `X-Robots-Tag: noindex, nofollow` (set in `vercel.json`).
6. Media budget: `public/media` is ~10 MB here; confirm real photos stay within the 120 MB target.
