// Which page of the guide explains each export of the package. The reference
// links every export to it ("Explained in the guide") and groups the exports by
// the part of the guide it belongs to.

/** The entry point of the package, and the file that declares it. */
export const ENTRIES = [
  {
    specifier: "@ix-xs/metamob.api",
    file: "src/index.ts",
    intro: {
      en: "Everything comes from one entry point.",
      fr: "Tout vient d'un seul point d'entrée.",
      es: "Todo viene de un solo punto de entrada.",
    },
  },
];

/** Which page documents what a source file declares. */
const PAGES = {
  "client.ts": "/basics/configuration/",
  "version.ts": "/basics/configuration/",
  "rest.ts": "/basics/configuration/",
  "cache.ts": "/basics/caching/",
  "time.ts": "/basics/caching/",
  "errors.ts": "/basics/errors/",
  "limiter.ts": "/basics/rate-limit/",
  "pagination.ts": "/basics/lists/",
  "resource.ts": "/basics/lists/",
  "dataset.ts": "/basics/embedded-data/",
  "text.ts": "/basics/names-and-ids/",
  "names.ts": "/basics/names-and-ids/",
  "methods.ts": "/resources/methods/",
  "urls.ts": "/resources/monsters/",
  "conversations.ts": "/resources/conversations/",
  "kralove.ts": "/resources/kralove/",
  "monsters.ts": "/resources/monsters/",
  "quests.ts": "/resources/quests/",
  "reference.ts": "/resources/reference-data/",
  "users.ts": "/resources/users/",
  "trade-proposals.ts": "/resources/trade-proposals/",
  "zones.ts": "/resources/zones/",
};

/** Exports of a shared source file that belong to a page of their own. */
const BY_NAME = [
  [/^(MethodSpec)$/, "/resources/methods/"],
  [/Like$/, "/basics/names-and-ids/"],
  [/^(MatchesParams|TradeOverride|TradeOverrideResult|MatchMonster|TradeMatch)$/, "/resources/trading/"],
  [/^(Account|Avatar|UserSummary)$/, "/resources/account/"],
  [/^(Conversation|ConversationMessage|ConversationItem|MarkAsReadResult)$/, "/resources/conversations/"],
  [/^(Proposal|TradeProposal|ConversationProposal)/, "/resources/trade-proposals/"],
  [/^Kralove/, "/resources/kralove/"],
  [/^(Monster|MonsterDetail|MonsterReference|MonsterType|TemplateMonster)$/, "/resources/monsters/"],
  [/^(Zone|ZoneDetail|Subzone|SubzoneRef)$/, "/resources/zones/"],
  [/^(GameVersion|Server|QuestType|QuestTypeRef|QuestTemplate|QuestTemplateRef|LocalizedName|Language)$/, "/resources/reference-data/"],
  [/^(PublicQuest|PublicQuestSummary|UserProfile)$/, "/resources/users/"],
  [/^(QuestBase|QuestMonster|OwnQuest|OwnQuestMonster|TypeFilter|TypeFilters|QuestSettings|QuestUpdate|QuestUpdateResult|MonsterQuantityResult|MonstersUpdateResult|ZoneProgress|ZoneProgressMonster|SubzoneProgress)$/, "/resources/quests/"],
];

export function pageFor(name, file) {
  for (const [pattern, page] of BY_NAME) if (pattern.test(name)) return page;
  return PAGES[file];
}
