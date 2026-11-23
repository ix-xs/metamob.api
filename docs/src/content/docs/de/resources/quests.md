---
title: Ihre Quests
description: "Die Quests des Kontos lesen und ändern, die besessenen Monster eintragen und den Fortschritt Zone für Zone verfolgen."
sidebar:
  order: 2
---

Jede Methode von `metamob.quests` wirkt auf die Quests des Kontos des Schlüssels, und nur auf diese. Für die Quests anderer Spieler siehe [Andere Spieler](/resources/users/).

## Ihre Quests auflisten

`quests.list()` gibt jede Quest des Kontos zurück, Favoriten zuerst, einschließlich derer, die im öffentlichen Profil versteckt sind. Die anderen Methoden nehmen den Slug einer dieser Quests.

```ts
for (const quest of await metamob.quests.list()) {
  console.log(quest.slug); // "21b0a742"
  console.log(quest.character_name, quest.server?.name);
  console.log(quest.quest_template.quest_type.name.fr); // "Ocre"
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
  console.log(quest.parallel_quests); // zu sammelnde Exemplare jedes Monsters
}
```

Ein Slug ist auch der letzte Teil der Adresse einer Quest auf metamob.fr.

## Die Einstellungen einer Quest lesen

`quests.get()` fügt hinzu, was nur der Besitzer sieht: den Tauschmodus, seine Schwellen und die Filter nach Monstertyp:

```ts
const quest = await metamob.quests.get(slug);

quest.show_trades; // im öffentlichen Profil angezeigt
quest.trade_mode; // 0 automatisch, 1 Experte
quest.trade_offer_threshold; // Expertenmodus: ab dieser Menge anbieten
quest.type_filters["3"]?.never_want; // nie nach Archimonstern suchen
```

Die Schlüssel von `type_filters` sind die IDs der Monstertypen: `"1"` für Monster, `"2"` für Bosse, `"3"` für Archimonster.

## Einstellungen ändern

`quests.update()` nimmt nur, was sich ändert. Die Antwort enthält den Slug und die geänderten Felder:

```ts
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { character_name: "Ix", show_trades: false });

// Experten-Tauschmodus, mit seinen Schwellen.
await metamob.quests.update(slug, {
  trade_mode: 1,
  trade_offer_threshold: 3,
  trade_want_threshold: 1,
});

// Nie Archimonster anbieten, auf zwei Arten.
await metamob.quests.update(slug, { never_offer_arch: true });
await metamob.quests.update(slug, { type_filters: { "3": { never_offer: true } } });
```

## Die Monster einer Quest

`quests.monsters()` listet auf, was die Quest verlangt, mit dem, was Sie besitzen. Es ist eine [Liste](/basics/lists/): `await` liefert eine Seite, `for await` durchläuft alles.

```ts
for await (const monster of metamob.quests.monsters(slug, { step: 4 })) {
  console.log(monster.name.fr, `${monster.quantity} owned`);
  console.log(`looking for ${monster.want}, offering ${monster.offer}`);
}
```

`status` stellt zwei verschiedene Fragen:

| `status` | Frage | Bedeutung |
| --- | --- | --- |
| `needed` | Fortschritt | Sie besitzen weniger, als die Quest verlangt |
| `unowned` | Fortschritt | Sie besitzen keines |
| `insufficient` | Fortschritt | Sie besitzen mindestens eines, aber weniger als nötig. Leer für eine Quest, die einmal gemacht wird |
| `ok` | Fortschritt | Sie besitzen genau genug |
| `excess` | Fortschritt | Sie besitzen überzählige Exemplare |
| `wanted` | Tausch | Die Quest sucht es, nach Anwendung Ihrer Tauscheinstellungen |
| `offered` | Tausch | Die Quest bietet es an, nach Anwendung Ihrer Tauscheinstellungen |

Ein Monster in `excess` ist nicht immer `offered`: Ein Filter oder eine Schwelle kann es zurückhalten.

Dieses `status` ist ein Filter. Weiter unten haben auch zwei Antworten ein Feld `status`, mit einer anderen Bedeutung: eine Zahl nach einem Schreibzugriff und eines von drei Wörtern im Fortschritt nach Zone.

```ts
const archmonsters = { type: "archimonstre", status: "needed" } as const;

const toCatch = await metamob.quests.monsters(slug, archmonsters).all();
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();
const manual = await metamob.quests.monsters(slug, { trade: "manual" }).all();
```

## Ein Monster eintragen

`setMonster` setzt die Anzahl der Exemplare eines Monsters, die Sie besitzen. Es ist keine Addition: Um eins hinzuzufügen, lesen Sie zuerst die aktuelle Menge.

```ts
const result = await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);

result.owned; // 2
result.status; // Besitz minus parallele Quests, negativ, wenn welche fehlen
result.effective_offer; // was die Quest jetzt anbietet
result.effective_want; // was die Quest jetzt sucht
```

Das Monster ist ein Name, eine ID oder ein Objekt, siehe [Namen und IDs](/basics/names-and-ids/). Ein unbekannter Name wirft `UNKNOWN_NAME`, und nichts wird geschrieben.

## Viele Monster eintragen

`setMonsters` nimmt einen Stapel, in der Form, die Ihnen passt:

```ts
// Ein Objekt mit Namen als Schlüsseln.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// Eine Liste, mit Namen, IDs oder Objekten.
await metamob.quests.setMonsters(slug, [
  { monster: 397, quantity: 1 },
  { monster: "Bouflet le Puéril", quantity: 3 },
]);

// Eine Map.
const caught = new Map<string, number>([["Tofu Maléfique", 1]]);
const result = await metamob.quests.setMonsters(slug, caught);
result.updated_count;
```

Die API akzeptiert 200 Monster pro Anfrage: Ein längerer Stapel wird in mehreren Anfragen gesendet, deren Antworten zusammengeführt werden. Jeder Name wird vor der ersten geprüft: Bei einem Tippfehler wird nichts geschrieben.

Wenn dasselbe Monster zweimal vorkommt, gewinnt die letzte Menge.

## Fortschritt nach Zone

`quests.zones()` ordnet eine Quest danach, wo die Monster leben, die am wenigsten fortgeschrittenen Unterzonen zuerst. Ein Monster erscheint in jeder Unterzone, in der es lebt.

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

Die Antwort ist nicht paginiert und kann lang sein. `zone`, `subzone` und `type` grenzen sie ein:

```ts
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

Ein Monster ist `validated`, wenn seine Stufe bereits abgeschlossen ist, `completed`, wenn Sie genug besitzen, sonst `incomplete`.

## Grenzen und Fehler

- Jede Methode antwortet `NOT_FOUND` für eine Quest, die nicht Ihnen gehört, ob sie existiert oder nicht.
- Mengen gehen von 0 bis 99. Außerhalb antwortet die API `BAD_REQUEST`.
- `current_step` geht von 1 bis `quest_template.step_count`, plus eins für eine abgeschlossene Quest: von 1 bis 19 für die 18 Stufen der Ocker-Quest auf Dofus, von 1 bis 35 auf Retro und Touch. Außerhalb antwortet die API `BAD_REQUEST`.
- Eine Schwelle des Expertenmodus geht von 0 bis 99. Außerhalb wird sie vor dem Senden abgelehnt. Schwellen werden nur im Expertenmodus gespeichert: Im automatischen Modus wird ein gültiger Wert akzeptiert, aber nicht behalten.
- Nach einem Schreibzugriff ist der nächste Lesezugriff aktuell: Der Cache Ihres Schlüssels wird verworfen.
- Die API erstellt und löscht keine Quests: Das geschieht auf der Website.

<!-- exports:start -->
## Referenz

Jeder Export hat seine Seite in der [Referenz](/reference/):

| Export | Wofür er dient |
| --- | --- |
| [`Quests`](/reference/quests/) | Ihre eigenen Quests: die des Kontos, zu dem der API-Schlüssel gehört. |
| [`MonsterQuantityResult`](/reference/monster-quantity-result/) | Was das Festlegen einer Menge für jedes Monster antwortet. |
| [`MonstersUpdateResult`](/reference/monsters-update-result/) | Was `quests.setMonsters()` antwortet. |
| [`OwnQuest`](/reference/own-quest/) | Eine Ihrer Quests, wie `quests.list()` sie zurückgibt. |
| [`OwnQuestMonster`](/reference/own-quest-monster/) | Ein Monster einer Ihrer Quests, mit seinen manuellen Tauschvorgaben. |
| [`OwnQuestMonstersParams`](/reference/own-quest-monsters-params/) | Filter von [`Quests.monsters`](/reference/quests/). |
| [`QuestBase`](/reference/quest-base/) | Was jede Quest enthält, egal wer sie ansieht. |
| [`QuestMonster`](/reference/quest-monster/) | Ein Monster einer Quest, wie jeder es sehen kann. |
| [`QuestSettings`](/reference/quest-settings/) | Die vollständigen Einstellungen einer Ihrer Quests. |
| [`QuestUpdate`](/reference/quest-update/) | Was `quests.update()` ändern kann. |
| [`QuestUpdateResult`](/reference/quest-update-result/) | Was `quests.update()` antwortet: den Slug und nur die Felder, die Sie geändert haben. |
| [`QuestZonesParams`](/reference/quest-zones-params/) | Filter von [`Quests.zones`](/reference/quests/). |
| [`SubzoneProgress`](/reference/subzone-progress/) | Der Fortschritt einer Quest in einer Unterzone. |
| [`TypeFilter`](/reference/type-filter/) | Tauschfilter einer Monsterart. |
| [`ZoneProgress`](/reference/zone-progress/) | Der Fortschritt einer Quest in einer Zone. |
| [`ZoneProgressMonster`](/reference/zone-progress-monster/) | Ein Monster im Fortschritt einer Quest nach Zone. |
| [`MonsterQuantities`](/reference/monster-quantities/) | Zu setzende Mengen, in einer von drei Formen: eine Liste von `{ monster, quantity }`, ein nach Monsternamen geordnetes Objekt oder eine `Map`. |
| [`TypeFilters`](/reference/type-filters/) | Tauschfilter nach Monsterart, geordnet nach der ID der Art als String: `"1"` Monster, `"2"` Bosse, `"3"` Archimonster. |
<!-- exports:end -->
