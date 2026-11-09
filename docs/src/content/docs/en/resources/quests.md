---
title: Your quests
description: "Read and change the quests of the account, record the monsters you own and follow progress zone by zone."
sidebar:
  order: 2
---

Every method of `metamob.quests` acts on the quests of the account of the key, and on them only. For the quests of other players, see [Other players](/resources/users/).

## Listing your quests

`quests.list()` returns every quest of the account, favourites first, including the ones hidden from the public profile. The other methods take the slug of one of these quests.

```ts
for (const quest of await metamob.quests.list()) {
  console.log(quest.slug); // "21b0a742"
  console.log(quest.character_name, quest.server?.name);
  console.log(quest.quest_template.quest_type.name.fr); // "Ocre"
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
  console.log(quest.parallel_quests); // copies of each monster to gather
}
```

A slug is also the last part of the address of a quest on metamob.fr.

## Reading the settings of a quest

`quests.get()` adds what only the owner sees: the trade mode, its thresholds and the filters by kind of monster:

```ts
const quest = await metamob.quests.get(slug);

quest.show_trades; // shown on the public profile
quest.trade_mode; // 0 automatic, 1 expert
quest.trade_offer_threshold; // expert mode: offer from this quantity up
quest.type_filters["3"]?.never_want; // never look for archmonsters
```

The keys of `type_filters` are the ids of the kinds of monsters: `"1"` for monsters, `"2"` for bosses, `"3"` for archmonsters.

## Changing settings

`quests.update()` takes only what changes. The answer holds the slug and the fields that changed:

```ts
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { character_name: "Ix", show_trades: false });

// Expert trade mode, with its thresholds.
await metamob.quests.update(slug, {
  trade_mode: 1,
  trade_offer_threshold: 3,
  trade_want_threshold: 1,
});

// Never offer archmonsters, in two ways.
await metamob.quests.update(slug, { never_offer_arch: true });
await metamob.quests.update(slug, { type_filters: { "3": { never_offer: true } } });
```

## The monsters of a quest

`quests.monsters()` lists what the quest asks for, with what you own. It is a [list](/basics/lists/): `await` gives a page, `for await` walks everything.

```ts
for await (const monster of metamob.quests.monsters(slug, { step: 4 })) {
  console.log(monster.name.fr, `${monster.quantity} owned`);
  console.log(`looking for ${monster.want}, offering ${monster.offer}`);
}
```

`status` asks two different questions:

| `status` | Question | Meaning |
| --- | --- | --- |
| `needed` | Progress | You own fewer than the quest asks for |
| `ok` | Progress | You own exactly enough |
| `excess` | Progress | You own spare copies |
| `wanted` | Trade | The quest looks for it, once your trade settings are applied |
| `offered` | Trade | The quest offers it, once your trade settings are applied |

A monster in `excess` is not always `offered`: a filter or a threshold can keep it back.

This `status` is a filter. Further down, two answers also have a `status` field, with another meaning: a number after a write, and one of three words in the progress by zone.

```ts
const archmonsters = { type: "archimonstre", status: "needed" } as const;

const toCatch = await metamob.quests.monsters(slug, archmonsters).all();
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();
const manual = await metamob.quests.monsters(slug, { trade: "manual" }).all();
```

## Recording a monster

`setMonster` sets the number of copies of a monster you own. It is not an addition: to add one, read the current quantity first.

```ts
const result = await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);

result.owned; // 2
result.status; // owned minus parallel quests, negative if some are missing
result.effective_offer; // what the quest now offers
result.effective_want; // what the quest now looks for
```

The monster is a name, an id or an object, see [Names and ids](/basics/names-and-ids/). An unknown name throws `UNKNOWN_NAME`, and nothing is written.

## Recording many monsters

`setMonsters` takes a batch, in whichever shape suits you:

```ts
// An object keyed by name.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// A list, with names, ids or objects.
await metamob.quests.setMonsters(slug, [
  { monster: 397, quantity: 1 },
  { monster: "Bouflet le Puéril", quantity: 3 },
]);

// A Map.
const caught = new Map<string, number>([["Tofu Maléfique", 1]]);
const result = await metamob.quests.setMonsters(slug, caught);
result.updated_count;
```

The API accepts 200 monsters per request: a longer batch is sent in several requests, whose answers are merged. Every name is checked before the first one: if there is a typo, nothing is written.

When the same monster appears twice, the last quantity wins.

## Progress by zone

`quests.zones()` arranges a quest by where the monsters live, the least advanced subzones first. A monster shows up in each subzone it lives in.

```ts
for (const zone of await metamob.quests.zones(slug, { type: "archimonstre" })) {
  console.log(`${zone.name.fr}: ${zone.completed}/${zone.total}`);

  for (const subzone of zone.subzones) {
    const missing = subzone.monsters
      .filter((monster) => monster.status === "incomplete")
      .map((monster) => monster.name.fr);
    if (missing.length) console.log(`  ${subzone.name.fr}: ${missing.join(", ")}`);
  }
}
```

The answer is not paginated and can be long. `zone`, `subzone` and `type` narrow it:

```ts
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

A monster is `validated` when its step is already passed, `completed` when you own enough, `incomplete` otherwise.

## Limits and errors

- Every method answers `NOT_FOUND` for a quest that is not yours, whether it exists or not.
- Quantities go from 0 to 99. Outside, the API answers `BAD_REQUEST`.
- `current_step` goes from 1 to `quest_template.step_count`, plus one for a finished quest: from 1 to 19 for the 18 steps of the Ochre on Dofus, from 1 to 35 on Retro and Touch. Outside, the API answers `BAD_REQUEST`.
- A threshold of the expert mode goes from 0 to 99. Outside, it is refused before sending. Thresholds are only saved in expert mode: in automatic mode, a valid value is accepted but not kept.
- After a write, the next read is up to date: the cache of your key is dropped.
- The API neither creates nor deletes quests: that is done on the site.

<!-- exports:start -->
## Reference

Each export has its page in the [reference](/reference/):

| Export | What it is for |
| --- | --- |
| [`Quests`](/reference/quests/) | Your own quests: the ones of the account the API key belongs to. |
| [`MonsterQuantityResult`](/reference/monster-quantity-result/) | What setting a quantity answers, for each monster. |
| [`MonstersUpdateResult`](/reference/monsters-update-result/) | What `quests.setMonsters()` answers. |
| [`OwnQuest`](/reference/own-quest/) | One of your quests, as `quests.list()` returns it. |
| [`OwnQuestMonster`](/reference/own-quest-monster/) | A monster of one of your quests, with its manual trade overrides. |
| [`OwnQuestMonstersParams`](/reference/own-quest-monsters-params/) | Filters of [`Quests.monsters`](/reference/quests/). |
| [`QuestBase`](/reference/quest-base/) | What every quest carries, whoever looks at it. |
| [`QuestMonster`](/reference/quest-monster/) | A monster of a quest, as anyone can see it. |
| [`QuestSettings`](/reference/quest-settings/) | The full settings of one of your quests. |
| [`QuestUpdate`](/reference/quest-update/) | What `quests.update()` can change. |
| [`QuestUpdateResult`](/reference/quest-update-result/) | What `quests.update()` answers: the slug and only the fields you changed. |
| [`QuestZonesParams`](/reference/quest-zones-params/) | Filters of [`Quests.zones`](/reference/quests/). |
| [`SubzoneProgress`](/reference/subzone-progress/) | The progress of a quest in one subzone. |
| [`TypeFilter`](/reference/type-filter/) | Trade filters of one kind of monster. |
| [`ZoneProgress`](/reference/zone-progress/) | The progress of a quest in one zone. |
| [`ZoneProgressMonster`](/reference/zone-progress-monster/) | A monster in the progress of a quest by zone. |
| [`MonsterQuantities`](/reference/monster-quantities/) | Quantities to set, in any of three shapes: a list of `{ monster, quantity }`, an object keyed by monster name, or a `Map`. |
| [`TypeFilters`](/reference/type-filters/) | Trade filters by kind of monster, keyed by the id of the kind as a string: `"1"` monsters, `"2"` bosses, `"3"` archmonsters. |
<!-- exports:end -->
