// Every endpoint of the Metamob API, as the library exposes it.
//
// This file is the single description the rest is derived from:
// `scripts/generate.mjs` turns it into `src/generated/methods.ts`, the tests
// check that each entry has a matching method on the client, and the docs
// site builds its "Every method" page from it.
//
// Fields:
//   id       stable name of the method, also the key of cache settings and events
//   verb     HTTP verb
//   path     path under https://www.metamob.fr/api/v1, with {placeholders}
//   scope    "public": the answer is the same for every API key, so it can be
//            cached and shared. "account": the answer depends on the key.
//   call     how the method is written with the client
//   summary  one sentence for the reference page
//   guide    the docs page that explains it
//   paged    for lists the API paginates: the largest page it accepts

/** @typedef {{ id: string, verb: "GET" | "PATCH" | "POST", path: string, scope: "public" | "account", call: string, summary: string, guide: string, paged?: { max: number, cursor?: boolean } }} MethodConfig */

/** @type {MethodConfig[]} */
export const methods = [
  // Account
  {
    id: "me.get",
    verb: "GET",
    path: "/me",
    scope: "account",
    call: "metamob.me()",
    summary: "The account an API key belongs to: username, bio, avatar and last activity.",
    guide: "/resources/account/",
  },

  // Reference data
  {
    id: "gameVersions.list",
    verb: "GET",
    path: "/game-versions",
    scope: "public",
    call: "metamob.gameVersions.list()",
    summary: "The versions of the game: Dofus (Unity), Dofus Retro and Dofus Touch.",
    guide: "/resources/reference-data/",
  },
  {
    id: "gameVersions.get",
    verb: "GET",
    path: "/game-versions/{id}",
    scope: "public",
    call: "metamob.gameVersions.get(version)",
    summary: "One version of the game, from its id or its name.",
    guide: "/resources/reference-data/",
  },
  {
    id: "servers.list",
    verb: "GET",
    path: "/servers",
    scope: "public",
    call: "metamob.servers.list()",
    summary: "Every game server, with its community and its game version.",
    guide: "/resources/reference-data/",
  },
  {
    id: "servers.get",
    verb: "GET",
    path: "/servers/{id}",
    scope: "public",
    call: "metamob.servers.get(server)",
    summary: "One server, from its id or its name.",
    guide: "/resources/reference-data/",
  },
  {
    id: "monsterTypes.list",
    verb: "GET",
    path: "/monster-types",
    scope: "public",
    call: "metamob.monsterTypes.list()",
    summary: "The three kinds of monsters: monster, boss and archmonster.",
    guide: "/resources/reference-data/",
  },
  {
    id: "monsterTypes.get",
    verb: "GET",
    path: "/monster-types/{id}",
    scope: "public",
    call: "metamob.monsterTypes.get(type)",
    summary: "One kind of monster, from its id or its name.",
    guide: "/resources/reference-data/",
  },
  {
    id: "questTypes.list",
    verb: "GET",
    path: "/quest-types",
    scope: "public",
    call: "metamob.questTypes.list()",
    summary: "The kinds of quests: Ochre and Grofus (Dokille), each with its image.",
    guide: "/resources/reference-data/",
  },
  {
    id: "questTypes.get",
    verb: "GET",
    path: "/quest-types/{id}",
    scope: "public",
    call: "metamob.questTypes.get(type)",
    summary: "One kind of quest, from its id, its slug or its name.",
    guide: "/resources/reference-data/",
  },
  {
    id: "questTemplates.list",
    verb: "GET",
    path: "/quest-templates",
    scope: "public",
    call: "metamob.questTemplates.list()",
    summary: "The quest templates: one per kind of quest and game version, with its number of monsters and steps.",
    guide: "/resources/reference-data/",
  },
  {
    id: "questTemplates.monsters",
    verb: "GET",
    path: "/quest-templates/{id}",
    scope: "public",
    call: "metamob.questTemplates.monsters(template, { step })",
    summary: "The monsters a quest template asks for, with the step each one belongs to.",
    guide: "/resources/reference-data/",
    paged: { max: 200 },
  },

  // Monsters
  {
    id: "monsters.list",
    verb: "GET",
    path: "/monsters",
    scope: "public",
    call: "metamob.monsters.list({ query, type })",
    summary: "The monsters, searched by name in French, English or Spanish and filtered by kind.",
    guide: "/resources/monsters/",
    paged: { max: 200 },
  },
  {
    id: "monsters.get",
    verb: "GET",
    path: "/monsters/{id}",
    scope: "public",
    call: "metamob.monsters.get(monster)",
    summary: "One monster with the zones and subzones where it lives, and its base monster for an archmonster.",
    guide: "/resources/monsters/",
  },

  // Zones
  {
    id: "zones.list",
    verb: "GET",
    path: "/zones",
    scope: "public",
    call: "metamob.zones.list({ query })",
    summary: "The zones of the game, optionally searched by name.",
    guide: "/resources/zones/",
  },
  {
    id: "zones.get",
    verb: "GET",
    path: "/zones/{id}",
    scope: "public",
    call: "metamob.zones.get(zone)",
    summary: "One zone with the list of its subzones.",
    guide: "/resources/zones/",
  },
  {
    id: "zones.subzones",
    verb: "GET",
    path: "/zones/{id}/subzones",
    scope: "public",
    call: "metamob.zones.subzones(zone, { query })",
    summary: "The subzones of a zone, optionally searched by name.",
    guide: "/resources/zones/",
  },
  {
    id: "zones.subzone",
    verb: "GET",
    path: "/zones/{id}/subzones/{subzoneId}",
    scope: "public",
    call: "metamob.zones.subzone(subzone)",
    summary: "One subzone with the zone it belongs to.",
    guide: "/resources/zones/",
  },
  {
    id: "zones.monsters",
    verb: "GET",
    path: "/zones/{id}/subzones/{subzoneId}/monsters",
    scope: "public",
    call: "metamob.zones.monsters(subzone)",
    summary: "The monsters that can be found in a subzone.",
    guide: "/resources/zones/",
  },

  // Kralamoure events
  {
    id: "kralove.list",
    verb: "GET",
    path: "/kralove",
    scope: "account",
    call: "metamob.kralove.list({ server, from })",
    summary: "The Kralamoure events from a date on, optionally for one server.",
    guide: "/resources/kralove/",
  },
  {
    id: "kralove.get",
    verb: "GET",
    path: "/kralove/{id}",
    scope: "account",
    call: "metamob.kralove.get(id)",
    summary: "One Kralamoure event with its participants and its messages.",
    guide: "/resources/kralove/",
  },

  // Users
  {
    id: "users.search",
    verb: "GET",
    path: "/users/search",
    scope: "account",
    call: "metamob.users.search(query, { server, activeWithinDays })",
    summary: "The users with public quests whose name matches a search of 3 characters or more.",
    guide: "/resources/users/",
    paged: { max: 50 },
  },
  {
    id: "users.get",
    verb: "GET",
    path: "/users/{username}",
    scope: "account",
    call: "metamob.users.get(username)",
    summary: "The public profile of a user, with their public quests.",
    guide: "/resources/users/",
  },
  {
    id: "users.quests",
    verb: "GET",
    path: "/users/{username}/quests",
    scope: "account",
    call: "metamob.users.quests(username)",
    summary: "The public quests of a user, with how many monsters each one wants and offers.",
    guide: "/resources/users/",
  },
  {
    id: "users.quest",
    verb: "GET",
    path: "/users/{username}/quests/{slug}",
    scope: "account",
    call: "metamob.users.quest(username, slug, { type, status, step })",
    summary: "The monsters of a public quest, with what its owner wants and offers for each.",
    guide: "/resources/users/",
    paged: { max: 200 },
  },

  // Messages
  {
    id: "conversations.list",
    verb: "GET",
    path: "/conversations",
    scope: "account",
    call: "metamob.conversations.list({ status })",
    summary: "The conversations of the account, one per correspondent, most recent first.",
    guide: "/resources/conversations/",
    paged: { max: 50 },
  },
  {
    id: "conversations.messages",
    verb: "GET",
    path: "/conversations/{username}",
    scope: "account",
    call: "metamob.conversations.messages(username)",
    summary: "The messages and trade proposals exchanged with a user, most recent first.",
    guide: "/resources/conversations/",
    paged: { max: 50, cursor: true },
  },
  {
    id: "conversations.markAsRead",
    verb: "POST",
    path: "/conversations/{username}/read",
    scope: "account",
    call: "metamob.conversations.markAsRead(username)",
    summary: "Marks as read every message received from a user, and says how many were.",
    guide: "/resources/conversations/",
  },

  // Trade proposals
  {
    id: "tradeProposals.list",
    verb: "GET",
    path: "/trade-proposals",
    scope: "account",
    call: "metamob.tradeProposals.list({ direction, status, quest, since })",
    summary: "The trade proposals the account sent and received, most recent first, filtered by direction, status, quest or date.",
    guide: "/resources/trade-proposals/",
    paged: { max: 50, cursor: true },
  },
  {
    id: "tradeProposals.get",
    verb: "GET",
    path: "/trade-proposals/{id}",
    scope: "account",
    call: "metamob.tradeProposals.get(id)",
    summary: "One trade proposal, with how many of each monster you own now.",
    guide: "/resources/trade-proposals/",
  },

  // Your own quests
  {
    id: "quests.list",
    verb: "GET",
    path: "/quests",
    scope: "account",
    call: "metamob.quests.list()",
    summary: "Every quest of the account, hidden ones included. This is where slugs come from.",
    guide: "/resources/quests/",
  },
  {
    id: "quests.get",
    verb: "GET",
    path: "/quests/{slug}",
    scope: "account",
    call: "metamob.quests.get(slug)",
    summary: "The full settings of one of your quests, trade configuration included.",
    guide: "/resources/quests/",
  },
  {
    id: "quests.update",
    verb: "PATCH",
    path: "/quests/{slug}",
    scope: "account",
    call: "metamob.quests.update(slug, changes)",
    summary: "Changes settings of one of your quests: character, step, visibility, trade mode and filters.",
    guide: "/resources/quests/",
  },
  {
    id: "quests.monsters",
    verb: "GET",
    path: "/quests/{slug}/monsters",
    scope: "account",
    call: "metamob.quests.monsters(slug, { type, status, trade, step })",
    summary: "The monsters of one of your quests, with quantities and manual trade overrides.",
    guide: "/resources/quests/",
    paged: { max: 200 },
  },
  {
    id: "quests.setMonster",
    verb: "PATCH",
    path: "/quests/{slug}/monsters/{monsterId}",
    scope: "account",
    call: "metamob.quests.setMonster(slug, monster, quantity)",
    summary: "Sets how many of a monster you own in a quest.",
    guide: "/resources/quests/",
  },
  {
    id: "quests.setMonsters",
    verb: "PATCH",
    path: "/quests/{slug}/monsters",
    scope: "account",
    call: "metamob.quests.setMonsters(slug, quantities)",
    summary: "Sets the quantities of many monsters at once. More than 200 are split across calls.",
    guide: "/resources/quests/",
  },
  {
    id: "quests.setTrade",
    verb: "PATCH",
    path: "/quests/{slug}/monsters/{monsterId}/trade",
    scope: "account",
    call: "metamob.quests.setTrade(slug, monster, { trade_offer, trade_want })",
    summary: "Forces how many of a monster a quest offers and wants, or hands it back to the automatic calculation.",
    guide: "/resources/quests/",
  },
  {
    id: "quests.matches",
    verb: "GET",
    path: "/quests/{slug}/matches",
    scope: "account",
    call: "metamob.quests.matches(slug, { minParallelQuests, onlyPossibleTrades })",
    summary: "The best trade partners for one of your quests, ranked like the Community page.",
    guide: "/resources/trading/",
    paged: { max: 50 },
  },
  {
    id: "quests.zones",
    verb: "GET",
    path: "/quests/{slug}/zones",
    scope: "account",
    call: "metamob.quests.zones(slug, { zone, subzone, type })",
    summary: "The progress of one of your quests, organised by zone and subzone.",
    guide: "/resources/quests/",
  },
];
