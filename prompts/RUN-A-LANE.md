# Prompt to paste in a lane's Claude Code session
(Replace XX and the file name.)

> You are working on lane XX of "The Atlas of Us".
> 1. Read CLAUDE.md, docs/03-ARCHITECTURE.md, docs/07-FILE-OWNERSHIP.md and lanes/LANE-XX-<name>.md. Read docs/04-TIMING-MATH.md if this lane touches audio, scroll or media timing.
> 2. Use the installed skills (frontend-design, framer-motion, awwwards-animations, and any others in SKILLS.md) where relevant.
> 3. Plan first: list the files you will create, confirm they are all owned by this lane, and show me the plan before coding.
> 4. Build with placeholders if real assets are missing. Do not edit files owned by other lanes; write contract change requests into docs/CONTRACT-REQUESTS.md instead.
> 5. Finish by running `npm run typecheck && npm run build`, taking screenshots at 390×844 and 1440×900 (if UI), ticking the acceptance list in the lane file, and committing on this branch with message "lane XX: <summary>".

## Prompt for adding real assets later (any session)
> I added new files to assets-drop/ and content/scripts/. Run `bash scripts/check-env.sh`, then `npm run media`. Report each phase's voice length, photo count vs recommended count (docs/04-TIMING-MATH.md), and any caption alignment problems.
