---
title: Tausch
description: "Tauschpartner für eine Quest finden und Monster für Monster festlegen, was sie anbietet und sucht."
sidebar:
  order: 3
---

## Wie eine Quest tauscht

Für jedes Monster bietet eine Quest einige Exemplare an und sucht einige. Standardmäßig berechnet die Website beides aus dem, was Sie besitzen, und aus `parallel_quests`: Überzählige Exemplare werden angeboten, was fehlt, wird gesucht. Drei Einstellungen ändern diese Berechnung:

1. Der Tauschmodus der Quest. Im Expertenmodus sagen zwei Schwellen, ab welcher Menge ein Monster angeboten und bis zu welcher Menge es gesucht wird.
2. Die Filter nach Typ: Monster, Bosse oder Archimonster nie anbieten oder nie suchen.
3. Eine manuelle Einstellung für ein Monster, die über allem anderen steht.

Die ersten beiden ändern Sie mit [`quests.update()`](/resources/quests/#changing-settings), die dritte ist unten beschrieben. Das Ergebnis ist das, was andere Spieler sehen: `want` und `offer` bei jedem Monster.

## Partner finden

`quests.matches()` ordnet die Spieler, mit denen Sie tauschen könnten, wie die Sortierung nach bester Übereinstimmung auf der Community-Seite der Website: derselbe Server, derselbe Questtyp, aktiv in den letzten zwei Monaten. Ausgewogene Tausche, mit gleich vielen Monstern in beide Richtungen, kommen zuerst. Die API betrachtet höchstens die 500 zuletzt aktiven Spieler.

```ts
const best = await metamob.quests.matches(slug).take(10);

for (const match of best) {
  console.log(match.user.username, match.quest.character_name);
  console.log(`score ${match.match_score}, last seen ${match.user.last_active}`);
  console.log(urls.profile(match.user));
}
```

Jeder Treffer listet die Monster in beide Richtungen auf, mit den Mengen:

```ts
const match = await metamob.quests.matches(slug).first();

for (const monster of match?.matches.they_have_you_want ?? []) {
  console.log(monster.name.fr, `${monster.available} available`);
  console.log(`you need ${monster.needed}`, monster.covers_need ? "(covered)" : "");
}
```

Zwei Filter grenzen die Liste ein:

```ts
// Ein Tausch, der in beide Richtungen möglich ist.
await metamob.quests.matches(slug, { onlyPossibleTrades: true });

// Mindestens zwei parallel gemachte Quests.
await metamob.quests.matches(slug, { minParallelQuests: 2 });
```

Es ist eine [Liste](/basics/lists/) mit höchstens 50 Partnern pro Seite.

## Wer ein bestimmtes Monster hat

Für ein einzelnes Monster filtern Sie die Partner selbst:

```ts
const wanted = data.monster("Bouflet le Puéril");

for await (const match of metamob.quests.matches(slug)) {
  const offers = match.matches.they_have_you_want;
  if (offers.some((monster) => monster.id === wanted?.id)) {
    console.log(match.user.username);
  }
}
```

## Die Quest eines anderen ansehen

Die Quest eines Partners ist öffentlich. `status` grenzt sie auf das ein, was er anbietet oder was er sucht:

```ts
const offered = await metamob.users.quest(username, slug, { status: "offered" }).all();
const wanted = await metamob.users.quest(username, slug, { status: "wanted" }).all();
```

Siehe [Andere Spieler](/resources/users/).

## Ein Monster überschreiben

`setTrade` erzwingt die Anzahl der Exemplare eines Monsters, die die Quest anbietet, sucht, oder beides:

```ts
// Nur eines anbieten, egal wie viele überzählige Exemplare es gibt.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 1 });

// Keines anbieten: alle behalten.
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: 0 });

// Zwei suchen, egal was die Berechnung ergibt.
const result = await metamob.quests.setTrade(slug, "Bouftou Royal", { trade_want: 2 });
result.effective_want; // was die Quest jetzt sucht
```

`0` und `null` bedeuten nicht dasselbe: `0` erzwingt "keines", `null` entfernt die manuelle Einstellung und gibt den Wert an die Berechnung zurück.

```ts
await metamob.quests.setTrade(slug, "Tofu Maléfique", { trade_offer: null });

// Beides auf einmal.
await metamob.quests.resetTrade(slug, "Tofu Maléfique");
```

Ein Feld, das Sie weglassen, wird nicht angetastet.

## Ihre Überschreibungen ansehen

```ts
for await (const monster of metamob.quests.monsters(slug, { trade: "manual" })) {
  console.log(monster.name.fr, monster.trade_offer, monster.trade_want);
}
```

`trade_offer` und `trade_want` sind die manuellen Einstellungen, `null`, wenn es keine gibt. `offer` und `want` sind das Ergebnis.

## Vorschläge

Die gesendeten und empfangenen Vorschläge lesen Sie mit [`tradeProposals.list()`](/resources/trade-proposals/), und sie erscheinen auch in Ihren [Unterhaltungen](/resources/conversations/#trade-proposals). [`tradeProposals.create()`](/resources/trade-proposals/#making-a-proposal) sendet einen, wenn das Senden für das Konto freigeschaltet ist. `apply()` wendet Ihre Seite an, `unapply()` macht sie innerhalb von 2 Stunden rückgängig, und `cancel()` bricht den Vorschlag ab oder lehnt ihn ab.

## Grenzen und Fehler

- `trade_offer` geht von 0 bis zu der Menge, die Sie besitzen. Darüber antwortet die API `BAD_REQUEST`.
- `trade_want` beginnt bei 0. Halten Sie es innerhalb dessen, was eine Quest brauchen kann: Die API lehnt einen großen Wert nicht ab.
- `NOT_FOUND` für eine Quest, die nicht Ihnen gehört.
- Eine leere manuelle Einstellung, ohne eines der beiden Felder, wird vor dem Senden abgelehnt.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`MatchesParams`](/reference/matches-params/) | Filter von [`Quests.matches`](/reference/quests/). |
| [`MatchMonster`](/reference/match-monster/) | Ein Monster, das die eine Partei eines Treffers der anderen geben kann. |
| [`TradeMatch`](/reference/trade-match/) | Ein Tauschpartner für eine Ihrer Quests. |
| [`TradeOverride`](/reference/trade-override/) | Eine manuelle Tauschvorgabe. |
| [`TradeOverrideResult`](/reference/trade-override-result/) | Was `quests.setTrade()` antwortet. |
<!-- exports:end -->
