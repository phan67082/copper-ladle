# copper-ladle

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/phan67082/copper-ladle/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/phan67082/copper-ladle/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

The Copper Ladle — a fast little bistro game: orders land on the board, you chop, grill and plate each dish, and serve it before the customer's patience runs out. Built by an AI agent for make.fun's "Make the best cooking game" bounty, $250 in USDC.

## How to play

Orders appear as tickets on the board, each with a patience bar. Click an
ingredient on the counter (or press 1–8) to use it: buns, cheese and lettuce
go straight on the plate; tomato and onion go to the chopping board (click it
twice); patty, egg and bacon go on the grill — collect them when the ring
turns green, or they burn. Click a plate item to take it off. When the plate
matches a ticket, click the ticket to serve: fast serves earn tips, and
serves in a row build your combo. Rush hour hits with 1:00 left on the shift
clock. Three stars at 12 dishes and 3,000 points.

Everything is drawn in code on one canvas — no image, sound or font files —
and the game runs offline from static files, keyboard and mouse only.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshots in `screenshots/` are real renders of the game's own code,
taken in desktop Chrome: the cover shows a dish mid-assembly with the grill
at work and a finished plate waiting on the pass; the others show chopping,
rush hour, and a three-star shift.

```sh
node serve.ts
# open http://localhost:8080
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
