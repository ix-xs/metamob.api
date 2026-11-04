---
title: Vos quêtes
description: "Lire et modifier les quêtes du compte, enregistrer les monstres possédés et suivre la progression par zone."
sidebar:
  order: 2
---

Toutes les méthodes de `metamob.quests` agissent sur les quêtes du compte de la clé, et seulement sur elles. Pour les quêtes des autres joueurs, voir [Autres joueurs](/resources/users/).

## Lister vos quêtes

`quests.list()` renvoie toutes les quêtes du compte, les favorites en premier, y compris celles qui sont masquées sur le profil public. Les autres méthodes prennent le slug d'une de ces quêtes.

```ts
for (const quest of await metamob.quests.list()) {
  console.log(quest.slug); // "21b0a742"
  console.log(quest.character_name, quest.server?.name);
  console.log(quest.quest_template.quest_type.name.fr); // "Ocre"
  console.log(`step ${quest.current_step} of ${quest.quest_template.step_count}`);
  console.log(quest.parallel_quests); // exemplaires à réunir de chaque monstre
}
```

Un slug est aussi la dernière partie de l'adresse d'une quête sur metamob.fr.

## Lire les réglages d'une quête

`quests.get()` ajoute ce que seul le propriétaire voit : le mode d'échange, ses seuils et les filtres par type de monstre :

```ts
const quest = await metamob.quests.get(slug);

quest.show_trades; // affichée sur le profil public
quest.trade_mode; // 0 automatique, 1 expert
quest.trade_offer_threshold; // mode expert : proposer à partir de cette quantité
quest.type_filters["3"]?.never_want; // ne jamais rechercher d'archimonstres
```

Les clés de `type_filters` sont les identifiants des types de monstres : `"1"` pour les monstres, `"2"` pour les boss, `"3"` pour les archimonstres.

## Modifier les réglages

`quests.update()` prend seulement ce qui change. La réponse contient le slug et les champs modifiés :

```ts
await metamob.quests.update(slug, { current_step: 12, parallel_quests: 2 });
await metamob.quests.update(slug, { character_name: "Ix", show_trades: false });

// Mode d'échange expert, avec ses seuils.
await metamob.quests.update(slug, {
  trade_mode: 1,
  trade_offer_threshold: 3,
  trade_want_threshold: 1,
});

// Ne jamais proposer d'archimonstres, de deux façons.
await metamob.quests.update(slug, { never_offer_arch: true });
await metamob.quests.update(slug, { type_filters: { "3": { never_offer: true } } });
```

## Les monstres d'une quête

`quests.monsters()` liste ce que la quête demande, avec ce que vous possédez. C'est une [liste](/basics/lists/) : `await` donne une page, `for await` parcourt tout.

```ts
for await (const monster of metamob.quests.monsters(slug, { step: 4 })) {
  console.log(monster.name.fr, `${monster.quantity} owned`);
  console.log(`looking for ${monster.want}, offering ${monster.offer}`);
}
```

`status` pose deux questions différentes :

| `status` | Question | Signification |
| --- | --- | --- |
| `needed` | Progression | Vous en possédez moins que la quête n'en demande |
| `ok` | Progression | Vous en possédez exactement assez |
| `excess` | Progression | Vous possédez des exemplaires en trop |
| `wanted` | Échange | La quête le recherche, une fois vos réglages d'échange appliqués |
| `offered` | Échange | La quête le propose, une fois vos réglages d'échange appliqués |

Un monstre en `excess` n'est pas toujours `offered` : un filtre ou un seuil peut le retenir.

Ce `status` est un filtre. Plus bas, deux réponses ont aussi un champ `status`, avec un autre sens : un nombre après une écriture, et l'un de trois mots dans la progression par zone.

```ts
const archmonsters = { type: "archimonstre", status: "needed" } as const;

const toCatch = await metamob.quests.monsters(slug, archmonsters).all();
const spares = await metamob.quests.monsters(slug, { status: "excess" }).all();
const manual = await metamob.quests.monsters(slug, { trade: "manual" }).all();
```

## Enregistrer un monstre

`setMonster` fixe le nombre d'exemplaires d'un monstre que vous possédez. Ce n'est pas un ajout : pour en ajouter un, lisez d'abord la quantité actuelle.

```ts
const result = await metamob.quests.setMonster(slug, "Tofu Maléfique", 2);

result.owned; // 2
result.status; // possédés moins quêtes en parallèle, négatif s'il en manque
result.effective_offer; // ce que la quête propose désormais
result.effective_want; // ce que la quête recherche désormais
```

Le monstre est un nom, un identifiant ou un objet, voir [Noms et identifiants](/basics/names-and-ids/). Un nom inconnu lève `UNKNOWN_NAME`, et rien n'est écrit.

## Enregistrer plusieurs monstres

`setMonsters` prend un lot, sous la forme qui vous arrange :

```ts
// Un objet indexé par nom.
await metamob.quests.setMonsters(slug, { "Tofu Maléfique": 2, "Bouftou Royal": 0 });

// Une liste, avec des noms, des identifiants ou des objets.
await metamob.quests.setMonsters(slug, [
  { monster: 397, quantity: 1 },
  { monster: "Bouflet le Puéril", quantity: 3 },
]);

// Une Map.
const caught = new Map<string, number>([["Tofu Maléfique", 1]]);
const result = await metamob.quests.setMonsters(slug, caught);
result.updated_count;
```

L'API accepte 200 monstres par requête : un lot plus long est envoyé en plusieurs requêtes, dont les réponses sont réunies. Tous les noms sont vérifiés avant la première : s'il y a une faute de frappe, rien n'est écrit.

Quand le même monstre apparaît deux fois, la dernière quantité l'emporte.

## Progression par zone

`quests.zones()` range une quête selon l'endroit où vivent les monstres, les sous-zones les moins avancées en premier. Un monstre apparaît dans chaque sous-zone où il vit.

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

La réponse n'est pas paginée et peut être longue. `zone`, `subzone` et `type` la réduisent :

```ts
const amakna = await metamob.quests.zones(slug, { zone: "Amakna" });
```

Un monstre est `validated` quand son étape est déjà passée, `completed` quand vous en possédez assez, `incomplete` sinon.

## Limites et erreurs

- Toutes les méthodes répondent `NOT_FOUND` pour une quête qui n'est pas la vôtre, qu'elle existe ou non.
- Les quantités vont de 0 à 99. En dehors, l'API répond `BAD_REQUEST`.
- `current_step` va de 1 à `quest_template.step_count`, plus un pour une quête terminée : de 1 à 19 pour les 18 étapes de l'Ocre sur Dofus, de 1 à 35 sur Retro et Touch. En dehors, l'API répond `BAD_REQUEST`.
- Un seuil du mode expert va de 0 à 99. En dehors, il est refusé avant l'envoi.
- Après une écriture, la lecture suivante est à jour : le cache de votre clé est oublié.
- L'API ne crée ni ne supprime de quête : cela se fait sur le site.

## Référence

| Méthode | Renvoie |
| --- | --- |
| `quests.list(options?)` | `OwnQuest[]` |
| `quests.get(slug, options?)` | `QuestSettings` |
| `quests.update(slug, changes, options?)` | `QuestUpdateResult` |
| `quests.monsters(slug, { type, status, trade, step, limit, offset }, options?)` | une liste de `OwnQuestMonster` |
| `quests.setMonster(slug, monster, quantity, options?)` | `MonsterQuantityResult` |
| `quests.setMonsters(slug, quantities, options?)` | `MonstersUpdateResult` |
| `quests.zones(slug, { zone, subzone, type }, options?)` | `ZoneProgress[]` |

Ce que `update` accepte :

| Champ | Type | Signification |
| --- | --- | --- |
| `character_name` | `string` | 200 caractères au plus |
| `parallel_quests` | `number` | À partir de 1 |
| `current_step` | `number` | De 1 à `step_count`, `step_count + 1` une fois la quête terminée |
| `show_trades` | `boolean` | Affichée sur le profil public |
| `trade_mode` | `0 \| 1` | Automatique ou expert |
| `trade_offer_threshold`, `trade_want_threshold` | `number \| null` | Mode expert, de 0 à 99 |
| `never_offer_normal`, `never_want_normal` | `boolean` | Monstres |
| `never_offer_boss`, `never_want_boss` | `boolean` | Boss |
| `never_offer_arch`, `never_want_arch` | `boolean` | Archimonstres |
| `type_filters` | `{ "1" \| "2" \| "3": { never_offer, never_want } }` | Les mêmes filtres, par type |

Le côté échange d'une quête, `setTrade`, `resetTrade` et `matches`, est décrit dans [Échanges](/resources/trading/).
