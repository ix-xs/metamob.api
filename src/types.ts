// The shapes the API answers with. Field names are the API's own, so what
// you read here is what the official documentation describes. Dates are
// ISO 8601 strings in UTC ("2026-01-27T20:00:00Z"): pass them to `new Date()`.

/** A name in the three languages of the site. */
export interface LocalizedName {
  fr: string;
  en: string;
  es: string;
}

/** A language the site is translated in. */
export type Language = "fr" | "en" | "es";

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

/** A version of the game: Dofus (Unity), Dofus Retro (1.29) or Dofus Touch. */
export interface GameVersion {
  id: number;
  name: string;
}

/** A game server. */
export interface Server {
  id: number;
  name: string;
  /** Community of the server. */
  community: "World" | "France" | (string & {});
  game_version: GameVersion | null;
}

/** A kind of monster: 1 is a monster, 2 a boss, 3 an archmonster. */
export interface MonsterType {
  id: number;
  /** Lower-case names: `monstre`, `boss`, `archimonstre`. */
  name: LocalizedName;
}

/** A kind of quest as it appears inside a quest: Ochre (`ocre`) or Grofus (`dokille`). */
export interface QuestTypeRef {
  id: number;
  slug: string;
  name: LocalizedName;
}

/** A kind of quest as `questTypes` returns it, with its image. */
export interface QuestType extends QuestTypeRef {
  /** File name of the image. `urls.questTypeImage()` turns it into a URL. */
  image: string;
}

/**
 * A quest template: the list of monsters to capture for one kind of quest in
 * one version of the game.
 */
export interface QuestTemplate {
  id: number;
  quest_type: QuestTypeRef | null;
  game_version: GameVersion | null;
  /** Monsters the quest asks for. */
  monster_count: number;
  /** Steps of the quest. */
  step_count: number;
}

/** The template a quest follows, as it appears inside a quest. */
export interface QuestTemplateRef {
  id: number;
  /**
   * Kind of the quest. Two quests can trade only when they share it, on the
   * same server.
   */
  quest_type: QuestTypeRef;
  monster_count: number;
  step_count: number;
}

// ---------------------------------------------------------------------------
// Monsters and zones
// ---------------------------------------------------------------------------

/** The base monster of an archmonster. */
export interface MonsterReference {
  id: number;
  name: LocalizedName;
}

/** A monster. */
export interface Monster {
  id: number;
  name: LocalizedName;
  /** File name of the image. `urls.monsterImage()` turns it into a URL. */
  image: string;
  level_min: number;
  level_max: number;
  type: MonsterType | null;
  /** For an archmonster, the monster it is the rare version of. */
  reference?: MonsterReference | undefined;
}

/** A zone of the game. */
export interface Zone {
  id: number;
  name: LocalizedName;
}

/** A subzone as it appears in a list: its id and name. */
export interface SubzoneRef {
  id: number;
  name: LocalizedName;
}

/** A zone with its subzones. */
export interface ZoneDetail extends Zone {
  subzones: SubzoneRef[];
}

/** A subzone with the zone it belongs to. */
export interface Subzone extends SubzoneRef {
  zone: Zone;
}

/** A monster with the places it lives in. */
export interface MonsterDetail extends Monster {
  /** Zones where the monster can be found, each with the subzones concerned. */
  zones: ZoneDetail[];
}

/** A monster of a quest template, with the step it belongs to. */
export interface TemplateMonster extends Monster {
  step: number;
}

// ---------------------------------------------------------------------------
// Kralamoure events
// ---------------------------------------------------------------------------

/** A Kralamoure event, as the list returns it. */
export interface KraloveEvent {
  id: number;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  event_datetime: string;
  description: string;
  /** `null` when the account was deleted for good, or when you and that user blocked each other. */
  creator: string | null;
  participants_count: number;
  character_count: number;
  messages_count: number;
  server: Server | null;
}

/** Someone taking part in a Kralamoure event. */
export interface KraloveParticipant {
  /** `null` when the account was deleted for good, or when you and that user blocked each other. */
  username: string | null;
  character_count: number;
}

/** A message posted on a Kralamoure event. */
export interface KraloveMessage {
  /** `null` when the account was deleted for good, or when you and that user blocked each other. */
  username: string | null;
  content: string;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  created_at: string;
}

/** A Kralamoure event with its participants and its messages. */
export interface KraloveEventDetail {
  id: number;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  event_datetime: string;
  description: string;
  /** `null` when the account was deleted for good, or when you and that user blocked each other. */
  creator: string | null;
  server: Server | null;
  participants: KraloveParticipant[];
  messages: KraloveMessage[];
}

// ---------------------------------------------------------------------------
// Accounts and public quests
// ---------------------------------------------------------------------------

/** The monster a user picked as their avatar. */
export interface Avatar {
  id: number;
  name: LocalizedName;
  image: string;
}

/** A user as a search or a trade match returns them. */
export interface UserSummary {
  username: string;
  avatar: Avatar | null;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  last_active: string;
}

/** The account an API key belongs to. */
export interface Account extends UserSummary {
  bio: string;
}

/** What every quest carries, whoever looks at it. */
export interface QuestBase {
  /** Identifier of the quest, the one in the URL of its page. */
  slug: string;
  character_name: string;
  /** Step the character is at, from 1 to 34. */
  current_step: number;
  /** How many times the quest is being done in parallel: the number of each monster to own. */
  parallel_quests: number;
  server: Server | null;
  quest_template: QuestTemplateRef;
}

/** A public quest in a profile. */
export interface PublicQuest extends QuestBase {}

/** A public quest in the list of a user's quests. */
export interface PublicQuestSummary extends QuestBase {
  /** Monsters the quest is looking for. */
  wanted_count: number;
  /** Monsters the quest offers. */
  offered_count: number;
}

/** The public profile of a user. */
export interface UserProfile extends Account {
  quests: PublicQuest[];
}

/** A monster of a quest, as anyone can see it. */
export interface QuestMonster extends Monster {
  /** Step of the quest the monster belongs to. */
  step: number;
  /** How many the player owns. */
  quantity: number;
  /** How many the quest is really looking for in trades, after the player's trade settings. */
  want: number;
  /** How many the quest really offers in trades. Can be 0 even when the player owns spares. */
  offer: number;
}

// ---------------------------------------------------------------------------
// Your own quests
// ---------------------------------------------------------------------------

/** One of your quests, as `quests.list()` returns it. */
export interface OwnQuest extends QuestBase {
  /** The "Show on my public profile" setting. A hidden quest still answers to your own key. */
  show_trades: boolean;
  is_favorite: boolean;
}

/** Trade filters of one kind of monster. */
export interface TypeFilter {
  /** Never offer this kind of monster. */
  never_offer: boolean;
  /** Never look for this kind of monster. */
  never_want: boolean;
}

/**
 * Trade filters by kind of monster, keyed by the id of the kind as a string:
 * `"1"` monsters, `"2"` bosses, `"3"` archmonsters.
 */
export type TypeFilters = Record<string, TypeFilter>;

/** The full settings of one of your quests. */
export interface QuestSettings extends OwnQuest {
  /** 0 is automatic, 1 is expert mode. */
  trade_mode: 0 | 1;
  /** Expert mode: offer a monster from this quantity up. `null` in automatic mode. */
  trade_offer_threshold: number | null;
  /** Expert mode: look for a monster up to this quantity. `null` in automatic mode. */
  trade_want_threshold: number | null;
  type_filters: TypeFilters;
}

/** What `quests.update()` can change. Every field is optional. */
export interface QuestUpdate {
  /** Name of the character, 200 characters at most. */
  character_name?: string | undefined;
  /** Quests done in parallel, from 1. The site sets the upper bound. */
  parallel_quests?: number | undefined;
  /** Step the character is at, from 1 to 34. */
  current_step?: number | undefined;
  /** The "Show on my public profile" setting. */
  show_trades?: boolean | undefined;
  /** 0 is automatic, 1 is expert mode. */
  trade_mode?: 0 | 1 | undefined;
  /** Expert mode: offer a monster from this quantity up, 0 to 30. */
  trade_offer_threshold?: number | null | undefined;
  /** Expert mode: look for a monster up to this quantity, 0 to 30. */
  trade_want_threshold?: number | null | undefined;
  /** Never offer monsters (steps 1 to 16). */
  never_offer_normal?: boolean | undefined;
  /** Never look for monsters (steps 1 to 16). */
  never_want_normal?: boolean | undefined;
  /** Never offer bosses (steps 17 to 19). */
  never_offer_boss?: boolean | undefined;
  /** Never look for bosses (steps 17 to 19). */
  never_want_boss?: boolean | undefined;
  /** Never offer archmonsters (steps 20 and up). */
  never_offer_arch?: boolean | undefined;
  /** Never look for archmonsters (steps 20 and up). */
  never_want_arch?: boolean | undefined;
  /**
   * The same filters in the shape the API reads them back in. Only the kinds
   * and flags you list change: `{ "3": { never_want: true } }`.
   */
  type_filters?: Record<string, Partial<TypeFilter>> | undefined;
}

/**
 * What `quests.update()` answers: the slug and only the fields you changed.
 * The `never_*` flags come back grouped in `type_filters`.
 */
export interface QuestUpdateResult {
  slug: string;
  character_name?: string;
  parallel_quests?: number;
  current_step?: number;
  show_trades?: boolean;
  trade_mode?: 0 | 1;
  trade_offer_threshold?: number | null;
  trade_want_threshold?: number | null;
  type_filters?: TypeFilters;
}

/** A monster of one of your quests, with its manual trade overrides. */
export interface OwnQuestMonster extends QuestMonster {
  /**
   * Manual override of the quantity offered. `null` means none: the value is
   * calculated. It is not the same as 0, which forces "offer nothing".
   */
  trade_offer: number | null;
  /** Manual override of the quantity wanted. `null` means none: the value is calculated. */
  trade_want: number | null;
}

/** What setting a quantity answers, for each monster. */
export interface MonsterQuantityResult {
  monster_id: number;
  quantity: number;
  owned: number;
  /** `owned - parallel_quests`: negative when some are missing, positive when there are spares. */
  status: number;
  /** How many the quest really offers after the trade mode, thresholds and overrides. */
  effective_offer: number;
  /** How many the quest really looks for after the trade mode, thresholds and overrides. */
  effective_want: number;
}

/** What `quests.setMonsters()` answers. */
export interface MonstersUpdateResult {
  updated_count: number;
  monsters: MonsterQuantityResult[];
}

/** A manual trade override. `null` hands a value back to the automatic calculation. */
export interface TradeOverride {
  /** Quantity to offer, from 0 to the quantity owned. */
  trade_offer?: number | null | undefined;
  /** Quantity to look for, from 0 to 30. */
  trade_want?: number | null | undefined;
}

/** What `quests.setTrade()` answers. */
export interface TradeOverrideResult {
  monster_id: number;
  trade_offer: number | null;
  trade_want: number | null;
  effective_offer: number;
  effective_want: number;
}

/** A monster one side of a match can give the other. */
export interface MatchMonster {
  id: number;
  name: LocalizedName;
  /** Quantity available for the trade. */
  available: number;
  /** Quantity needed. */
  needed: number;
  /** Whether what is available covers the whole need. */
  covers_need: boolean;
}

/** A trade partner for one of your quests. */
export interface TradeMatch {
  user: UserSummary;
  quest: { slug: string; character_name: string; parallel_quests: number };
  matches: {
    /** What they can give you. */
    they_have_you_want: MatchMonster[];
    /** What you can give them. */
    you_have_they_want: MatchMonster[];
  };
  /** How many different monsters you can give, plus how many you can receive. */
  match_score: number;
}

/** A monster in the progress of a quest by zone. */
export interface ZoneProgressMonster {
  id: number;
  name: LocalizedName;
  image: string;
  type: MonsterType | null;
  step: number;
  owned: number;
  required: number;
  /**
   * `validated`: a step already passed. `completed`: enough of them.
   * `incomplete`: some are missing.
   */
  status: "validated" | "completed" | "incomplete";
  offer: number;
  want: number;
}

/** The progress of a quest in one subzone. */
export interface SubzoneProgress {
  id: number;
  name: LocalizedName;
  completed: number;
  total: number;
  monsters: ZoneProgressMonster[];
}

/** The progress of a quest in one zone. */
export interface ZoneProgress {
  id: number;
  name: LocalizedName;
  completed: number;
  total: number;
  /** Least advanced first, complete ones last. */
  subzones: SubzoneProgress[];
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/** A conversation: one per correspondent. */
export interface Conversation {
  /**
   * The correspondent. Their profile may be gone: a deleted account keeps
   * its conversations readable for 30 days while `users.get()` answers 404.
   */
  username: string;
  /** Visible messages, trade proposals included. */
  message_count: number;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  last_message_at: string;
}

/** A text message of a conversation. */
export interface ConversationMessage {
  kind: "message";
  id: number;
  content: string;
  sender: string;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  created_at: string;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`, or `null`. */
  read_at: string | null;
}

/** A quantity of a monster in a trade proposal. `monsters.get()` gives the monster. */
export interface ProposalMonster {
  monster_id: number;
  quantity: number;
}

/** A trade proposal in a conversation. */
export interface TradeProposal {
  kind: "proposal";
  id: number;
  sender: string;
  recipient: string;
  status: "pending" | "half_applied" | "completed" | "cancelled";
  server_id: number;
  /** `null` when the quest concerned was deleted. */
  quest_type: { id: number; slug: string } | null;
  monsters_given: ProposalMonster[];
  monsters_received: ProposalMonster[];
  /** Who confirmed their side. */
  applications: { username: string; created_at: string }[];
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`, or `null`. */
  cancelled_at: string | null;
  /** ISO 8601 date in UTC, such as `2026-01-27T14:22:00Z`. */
  created_at: string;
}

/** What a conversation is made of. `kind` tells the two apart. */
export type ConversationItem = ConversationMessage | TradeProposal;
