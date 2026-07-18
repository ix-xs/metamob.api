/**
 * Génère `index.d.ts` à partir du cache local.
 *
 * Produit des unions littérales (noms de monstres, ids, zones, sous-zones, serveurs…) pour
 * l'autocomplétion des VALEURS dans l'éditeur, tout en gardant une structure propre et légère
 * (contrairement au `.d.ts` inféré par `tsc` qui pesait > 1 Mo et était élidé).
 *
 * Régénérer après toute mise à jour du cache :
 *   node scripts/generate-types.js
 */
const fs = require("fs");
const path = require("path");
const cache = require("../src/cache/$.js");

const strLit = v => JSON.stringify(String(v));
const uniq = arr => [...new Set(arr)];

/** Union de littéraux, repliée sur plusieurs lignes pour rester lisible. */
function union(values, { string = true } = {}) {
  const members = uniq(values).map(v => (string ? strLit(v) : String(v)));
  if (members.length === 0) return "never";
  const lines = [];
  let cur = "";
  for (const m of members) {
    const add = (cur ? " | " : "") + m;
    if (cur && cur.length + add.length > 100) { lines.push(cur); cur = m; }
    else cur += add;
  }
  if (cur) lines.push(cur);
  return lines.join("\n    | ");
}

const M = cache.monsters, Z = cache.zones, SZ = cache.subzones, SV = cache.servers;
const GV = cache.game_versions, MT = cache.monster_types, QT = cache.quest_types, TPL = cache.quest_templates;

const U = {
  MonsterId: union(M.map(x => x.id), { string: false }),
  MonsterNameFr: union(M.map(x => x.name.fr)),
  MonsterNameEn: union(M.map(x => x.name.en)),
  MonsterNameEs: union(M.map(x => x.name.es)),
  MonsterImage: union(M.map(x => x.image)),
  ZoneId: union(Z.map(x => x.id), { string: false }),
  ZoneNameFr: union(Z.map(x => x.name.fr)),
  ZoneNameEn: union(Z.map(x => x.name.en)),
  ZoneNameEs: union(Z.map(x => x.name.es)),
  SubZoneId: union(SZ.map(x => x.id), { string: false }),
  SubZoneNameFr: union(SZ.map(x => x.name.fr)),
  SubZoneNameEn: union(SZ.map(x => x.name.en)),
  SubZoneNameEs: union(SZ.map(x => x.name.es)),
  ServerId: union(SV.map(x => x.id), { string: false }),
  ServerName: union(SV.map(x => x.name)),
  GameVersionId: union(GV.map(x => x.id), { string: false }),
  GameVersionName: union(GV.map(x => x.name)),
  MonsterTypeId: union(MT.map(x => x.id), { string: false }),
  MonsterTypeNameFr: union(MT.map(x => x.name.fr)),
  MonsterTypeNameEn: union(MT.map(x => x.name.en)),
  MonsterTypeNameEs: union(MT.map(x => x.name.es)),
  QuestTypeId: union(QT.map(x => x.id), { string: false }),
  QuestTypeSlug: union(QT.map(x => x.slug)),
  QuestTypeNameFr: union(QT.map(x => x.name.fr)),
  QuestTypeNameEn: union(QT.map(x => x.name.en)),
  QuestTypeNameEs: union(QT.map(x => x.name.es)),
  QuestTemplateId: union(TPL.map(x => x.id), { string: false }),
};

const literalTypes = Object.entries(U)
  .map(([name, body]) => `  type ${name} =\n    | ${body};`)
  .join("\n\n");

const out = `/**
 * Déclarations de types pour \`@ix-xs/metamob.api\`.
 *
 * ⚠️ FICHIER GÉNÉRÉ — ne pas éditer à la main. Régénérer avec :
 *   node scripts/generate-types.js
 *
 * Les unions littérales (noms/ids de monstres, zones, sous-zones, serveurs…) donnent
 * l'autocomplétion des valeurs dans l'éditeur, tout en restant permissives (une chaîne ou un
 * nombre quelconque est accepté — pratique pour les valeurs dynamiques).
 *
 * @see {@link https://www.metamob.fr/help/api|Documentation API Metamob}
 */
export = MetamobAPI;

declare class MetamobAPI {
  /**
   * @param options Options du client.
   * @example
   * const MetamobAPI = require("@ix-xs/metamob.api");
   * const client = new MetamobAPI({ api_key: process.env.METAMOB_API_KEY });
   */
  constructor(options: MetamobAPI.ClientOptions);

  /** Cache local embarqué (données de référence, relations résolues). Aucun appel réseau. */
  readonly cache: MetamobAPI.Cache;

  /**
   * ### Versions du jeu
   * @example
   * const { data } = await client.getGameVersions();
   * const unity = await client.getGameVersions({ idOrName: "Dofus (Unity)" });
   */
  getGameVersions(): MetamobAPI.Response<MetamobAPI.GameVersion[]>;
  getGameVersions(options: Omit<MetamobAPI.GameVersionsOptions, "idOrName"> & { idOrName: MetamobAPI.GameVersionInput }): MetamobAPI.Response<MetamobAPI.GameVersion>;
  getGameVersions(options?: MetamobAPI.GameVersionsOptions): MetamobAPI.Response<MetamobAPI.GameVersion[] | MetamobAPI.GameVersion>;

  /**
   * ### Types de monstres
   * @example
   * const boss = await client.getMonsterTypes({ idOrName: "boss" });
   */
  getMonsterTypes(): MetamobAPI.Response<MetamobAPI.MonsterType[]>;
  getMonsterTypes(options: Omit<MetamobAPI.MonsterTypesOptions, "idOrName"> & { idOrName: MetamobAPI.MonsterTypeInput }): MetamobAPI.Response<MetamobAPI.MonsterType>;
  getMonsterTypes(options?: MetamobAPI.MonsterTypesOptions): MetamobAPI.Response<MetamobAPI.MonsterType[] | MetamobAPI.MonsterType>;

  /**
   * ### Zones
   * @example
   * const amakna = await client.getZones({ idOrName: "Amakna" });
   * const found = await client.getZones({ query: "ama" });
   */
  getZones(): MetamobAPI.Response<MetamobAPI.Zone[]>;
  getZones(options: Omit<MetamobAPI.ZonesOptions, "idOrName"> & { idOrName: MetamobAPI.ZoneInput }): MetamobAPI.Response<MetamobAPI.Zone>;
  getZones(options: Omit<MetamobAPI.ZonesOptions, "query"> & { query: string }): MetamobAPI.Response<MetamobAPI.Zone[]>;
  getZones(options?: MetamobAPI.ZonesOptions): MetamobAPI.Response<MetamobAPI.Zone[] | MetamobAPI.Zone>;

  /**
   * ### Sous-zones
   * @example
   * const subs = await client.getSubZones({ zoneIdOrName: "Amakna" });
   * const one = await client.getSubZones({ idOrName: "Cimetière" });
   */
  getSubZones(options: Omit<MetamobAPI.SubZonesOptions, "idOrName"> & { idOrName: MetamobAPI.SubZoneInput }): MetamobAPI.Response<MetamobAPI.SubZone>;
  getSubZones(options: Omit<MetamobAPI.SubZonesOptions, "zoneIdOrName"> & { zoneIdOrName: MetamobAPI.ZoneInput }): MetamobAPI.Response<MetamobAPI.SubZone[]>;
  getSubZones(options?: MetamobAPI.SubZonesOptions): MetamobAPI.Response<MetamobAPI.SubZone[] | MetamobAPI.SubZone>;

  /**
   * ### Monstres d'une sous-zone
   * @example
   * const monsters = await client.getSubZoneMonsters("Cimetière");
   */
  getSubZoneMonsters(subzoneIdOrName: MetamobAPI.SubZoneInput, options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.BaseMonster[]>;

  /**
   * ### Monstres
   * @example
   * const tofu = await client.getMonsters({ idOrName: "Tofu" });
   * const archis = await client.getMonsters({ query: "tofu", typeIdOrName: "archimonstre", limit: 20 });
   */
  getMonsters(): MetamobAPI.PaginatedResponse<MetamobAPI.BaseMonster[]>;
  getMonsters(options: Omit<MetamobAPI.MonstersOptions, "idOrName"> & { idOrName: MetamobAPI.MonsterInput }): MetamobAPI.Response<MetamobAPI.MonsterDetail>;
  getMonsters(options?: MetamobAPI.MonstersOptions): MetamobAPI.PaginatedResponse<MetamobAPI.BaseMonster[]>;

  /**
   * ### Modèles de quête
   * @example
   * const step15 = await client.getQuestTemplates({ id: 1, step: 15 });
   */
  getQuestTemplates(): MetamobAPI.Response<MetamobAPI.QuestTemplate[]>;
  getQuestTemplates(options: Omit<MetamobAPI.QuestTemplatesOptions, "id"> & { id: MetamobAPI.QuestTemplateId }): MetamobAPI.Response<MetamobAPI.QuestTemplateDetail>;
  getQuestTemplates(options?: MetamobAPI.QuestTemplatesOptions): MetamobAPI.Response<MetamobAPI.QuestTemplate[] | MetamobAPI.QuestTemplateDetail>;

  /**
   * ### Serveurs
   * @example
   * const draconiros = await client.getServers({ idOrName: "Draconiros" });
   */
  getServers(): MetamobAPI.Response<MetamobAPI.Server[]>;
  getServers(options: Omit<MetamobAPI.ServersOptions, "idOrName"> & { idOrName: MetamobAPI.ServerInput }): MetamobAPI.Response<MetamobAPI.Server>;
  getServers(options?: MetamobAPI.ServersOptions): MetamobAPI.Response<MetamobAPI.Server[] | MetamobAPI.Server>;

  /**
   * ### Événements Kralamoure
   * @example
   * const events = await client.getKraloves({ serverIdOrName: "Draconiros", from: "2026-07-01" });
   * const detail = await client.getKraloves({ id: 42 });
   */
  getKraloves(): MetamobAPI.Response<MetamobAPI.Kralove[]>;
  getKraloves(options: Omit<MetamobAPI.KralovesOptions, "id"> & { id: string | number }): MetamobAPI.Response<MetamobAPI.KraloveDetail>;
  getKraloves(options?: MetamobAPI.KralovesOptions): MetamobAPI.Response<MetamobAPI.Kralove[] | MetamobAPI.KraloveDetail>;

  /**
   * ### Utilisateurs (recherche)
   * @example
   * const { data, pagination } = await client.searchUsers("player", { serverIdOrName: "Draconiros" });
   */
  searchUsers(query: string, options?: MetamobAPI.SearchUsersOptions): MetamobAPI.PaginatedResponse<MetamobAPI.BaseUser[]>;

  /**
   * ### Utilisateur
   * @example
   * const profile = await client.getUser("player1");
   */
  getUser(username: string, options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.UserDetail>;

  /**
   * ### Quêtes utilisateur
   * @example
   * const quests = await client.getUserQuests("player1");
   * const detail = await client.getUserQuests("player1", { slug: "a1b2c3d4", status: "wanted" });
   */
  getUserQuests(username: string): MetamobAPI.Response<MetamobAPI.UserQuestListItem[]>;
  getUserQuests(username: string, options: Omit<MetamobAPI.UserQuestsOptions, "slug"> & { slug: string }): MetamobAPI.Response<MetamobAPI.UserQuestDetail>;
  getUserQuests(username: string, options?: MetamobAPI.UserQuestsOptions): MetamobAPI.Response<MetamobAPI.UserQuestListItem[] | MetamobAPI.UserQuestDetail>;

  /**
   * ### Conversations
   * @example
   * const convos = await client.getConversations({ status: "active" });
   */
  getConversations(options?: MetamobAPI.ConversationsOptions): MetamobAPI.PaginatedResponse<MetamobAPI.Conversation[]>;

  /**
   * ### Messages d'une conversation (pagination par curseur)
   * @example
   * const first = await client.getMessages("player1", { limit: 30 });
   * const next = await client.getMessages("player1", { before_id: first.pagination.next_before_id });
   */
  getMessages(username: string, options?: MetamobAPI.MessagesOptions): Promise<MetamobAPI.BaseResult & { data: MetamobAPI.ConversationItem[]; pagination: MetamobAPI.CursorPagination }>;

  /**
   * ### Lire les réglages d'une quête (réservé à vos propres quêtes)
   *
   * Retourne les réglages complets (\`trade_mode\`, seuils, \`type_filters\`, \`show_trades\`,
   * \`is_favorite\`) que les endpoints publics n'exposent pas. Le slug d'un autre utilisateur renvoie 404.
   * @example
   * const settings = await client.getQuest("a1b2c3d4");
   * if (settings.ok) console.log(settings.data.trade_mode, settings.data.type_filters);
   */
  getQuest(slug: string, options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.QuestSettings>;

  /**
   * ### Modifier les paramètres d'une quête
   * @example
   * await client.updateQuest("a1b2c3d4", { current_step: 12, show_trades: true, trade_mode: 1 });
   */
  updateQuest(slug: string, changes: MetamobAPI.QuestUpdate, options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.QuestUpdateResult>;

  /**
   * ### Modifier la quantité d'un monstre dans une quête
   * @example
   * await client.updateQuestMonster("a1b2c3d4", "Bouftou", 5);
   */
  updateQuestMonster(slug: string, monsterIdOrName: MetamobAPI.MonsterInput, quantity: number, options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.QuestMonsterQuantityResult>;

  /**
   * ### Modifier plusieurs monstres d'une quête (max 200)
   * @example
   * await client.updateQuestMonsters("a1b2c3d4", [{ monster: "Tofu", quantity: 3 }]);
   */
  updateQuestMonsters(slug: string, monsters: MetamobAPI.QuestMonsterQuantityInput[], options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.QuestMonstersBatchResult>;

  /**
   * ### Paramètres de trade manuels d'un monstre
   * @example
   * await client.setQuestMonsterTrade("a1b2c3d4", 123, { trade_offer: 1, trade_want: null });
   */
  setQuestMonsterTrade(slug: string, monsterIdOrName: MetamobAPI.MonsterInput, trade: MetamobAPI.MonsterTradeOptions, options?: MetamobAPI.RequestOptions): MetamobAPI.Response<MetamobAPI.QuestMonsterTradeResult>;

  /**
   * ### Partenaires d'échange potentiels
   * @example
   * const { data } = await client.getQuestMatches("a1b2c3d4", { limit: 10, only_possible_trades: true });
   */
  getQuestMatches(slug: string, options?: MetamobAPI.QuestMatchesOptions): MetamobAPI.PaginatedResponse<MetamobAPI.QuestMatch[]>;

  /**
   * ### Progression d'une quête par zones
   * @example
   * const progress = await client.getQuestZones("a1b2c3d4", { monsterTypeIdOrName: "archimonstre" });
   */
  getQuestZones(slug: string, options?: MetamobAPI.QuestZonesOptions): MetamobAPI.Response<MetamobAPI.QuestZoneProgress[]>;
}

declare namespace MetamobAPI {
  // ---- Unions littérales générées depuis le cache (autocomplétion des valeurs) ----

${literalTypes}

  // ---- Alias d'entrée : union littérale + valeurs dynamiques (string/number) ----

  type MonsterName = MonsterNameFr | MonsterNameEn | MonsterNameEs;
  type ZoneName = ZoneNameFr | ZoneNameEn | ZoneNameEs;
  type SubZoneName = SubZoneNameFr | SubZoneNameEn | SubZoneNameEs;
  type MonsterTypeName = MonsterTypeNameFr | MonsterTypeNameEn | MonsterTypeNameEs;
  type QuestTypeName = QuestTypeNameFr | QuestTypeNameEn | QuestTypeNameEs;

  type MonsterInput = MonsterId | MonsterName | (string & {}) | (number & {});
  type ZoneInput = ZoneId | ZoneName | (string & {}) | (number & {});
  type SubZoneInput = SubZoneId | SubZoneName | (string & {}) | (number & {});
  type ServerInput = ServerId | ServerName | (string & {}) | (number & {});
  type MonsterTypeInput = MonsterTypeId | MonsterTypeName | (string & {}) | (number & {});
  type GameVersionInput = GameVersionId | GameVersionName | (string & {}) | (number & {});

  /** Nom localisé (fr/en/es). */
  interface LocalizedName { fr: string; en: string; es: string; }

  interface ClientOptions {
    /** Clé API Metamob (obligatoire). */
    api_key: string;
  }

  /** Options communes : clé API alternative pour une requête (multi-utilisateurs). */
  interface RequestOptions {
    /** Clé API à utiliser pour cette requête, à la place de celle du client. */
    api_key?: string;
  }

  interface BaseResult {
    ok: boolean;
    status: number;
    statusText: string;
    /** Présent uniquement en cas d'échec. */
    error?: string;
    /** Secondes à attendre en cas de 429. */
    retryAfter?: number;
  }

  interface Pagination { total: number; limit: number; offset: number; }
  interface CursorPagination { has_more: boolean; next_before_id?: number | null; }

  type Response<T> = Promise<BaseResult & { data: T }>;
  type PaginatedResponse<T> = Promise<BaseResult & { data: T; pagination: Pagination }>;

  // ---- Entités ----

  interface GameVersion { id: GameVersionId; name: GameVersionName; }
  interface MonsterType { id: MonsterTypeId; name: LocalizedName; }
  interface QuestType { id: QuestTypeId; slug: QuestTypeSlug; name: LocalizedName; }
  interface MonsterReference { id: MonsterId; name: LocalizedName; }

  interface BaseMonster {
    id: MonsterId;
    name: LocalizedName;
    image: MonsterImage;
    level_min: number;
    level_max: number;
    type: MonsterType | null;
    /** Présent uniquement pour les archimonstres. */
    reference?: MonsterReference | null;
  }

  interface MonsterDetail extends BaseMonster {
    reference?: MonsterReference | null;
    zones?: Zone[];
  }

  interface Zone { id: ZoneId; name: LocalizedName; subzones?: SubZone[]; }
  interface SubZone { id: SubZoneId; name: LocalizedName; zone?: Zone | null; monsters?: BaseMonster[]; }

  interface QuestTemplate {
    id: QuestTemplateId;
    quest_type: QuestType | null;
    game_version: GameVersion | null;
    monster_count: number;
    step_count: number;
  }

  interface QuestTemplateMonster {
    id: MonsterId;
    name: LocalizedName;
    image: MonsterImage;
    level_min: number;
    level_max: number;
    type: MonsterType | null;
    step: number;
  }

  interface QuestTemplateDetail {
    id: QuestTemplateId;
    quest_type: QuestType | null;
    game_version: GameVersion | null;
    monsters: QuestTemplateMonster[];
    pagination: Pagination;
  }

  interface Server {
    id: ServerId;
    name: ServerName;
    community: "World" | "France";
    game_version: GameVersion | null;
  }

  interface Kralove {
    id: string | number;
    event_datetime: string;
    description: string;
    creator: string;
    participants_count: number;
    character_count: number;
    messages_count: number;
    server: Server | null;
  }

  interface Participant { username: string; character_count: number; }
  interface KraloveMessage { username: string; content: string; created_at: string; }

  interface KraloveDetail {
    id: string | number;
    event_datetime: string;
    description: string;
    creator: string;
    server: Server | null;
    participants: Participant[];
    messages: KraloveMessage[];
  }

  interface AvatarMonster { id: MonsterId; name: LocalizedName; image: string; }
  interface BaseUser { username: string; avatar: AvatarMonster | null; last_active: string; }
  interface QuestTemplateRef { id: QuestTemplateId; monster_count: number; step_count: number; }

  interface BaseQuest {
    slug: string;
    character_name: string;
    current_step: number;
    parallel_quests: number;
    server: Server | null;
    quest_template: QuestTemplateRef;
  }

  interface UserDetail {
    username: string;
    bio: string;
    avatar: AvatarMonster | null;
    last_active: string;
    quests: BaseQuest[];
  }

  interface UserQuestListItem {
    slug: string;
    character_name: string;
    current_step: number;
    parallel_quests: number;
    wanted_count: number;
    offered_count: number;
    server: Server | null;
    quest_template: QuestTemplateRef;
  }

  interface UserQuestMonster {
    id: MonsterId;
    name: LocalizedName;
    image: MonsterImage;
    level_min: number;
    level_max: number;
    type: MonsterType | null;
    step: number;
    /** Quantité possédée par l'utilisateur. */
    quantity: number;
    /** Quantité réellement proposée à l'échange. */
    offer: number;
    /** Quantité réellement recherchée à l'échange. */
    want: number;
  }

  interface UserQuestDetail {
    slug: string;
    character_name: string;
    current_step: number;
    parallel_quests: number;
    server: Server | null;
    quest_template: QuestTemplateRef;
    monsters: UserQuestMonster[];
    pagination: Pagination;
  }

  interface Conversation { username: string; message_count: number; last_message_at: string; }

  interface ConversationTextMessage {
    kind: "message";
    id: number;
    content: string;
    sender: string;
    created_at: string;
    read_at: string | null;
  }

  interface ProposalMonsterItem { monster_id: MonsterId; quantity: number; }
  interface ProposalApplication { username: string; created_at: string; }

  interface ConversationProposal {
    kind: "proposal";
    id: number;
    sender: string;
    recipient: string;
    status: "pending" | "half_applied" | "completed" | "cancelled";
    server_id: ServerId;
    quest_type: { id: QuestTypeId; slug: QuestTypeSlug } | null;
    monsters_given: ProposalMonsterItem[];
    monsters_received: ProposalMonsterItem[];
    applications: ProposalApplication[];
    cancelled_at: string | null;
    created_at: string;
  }

  type ConversationItem = ConversationTextMessage | ConversationProposal;

  // ---- Gestion de quêtes ----

  interface QuestUpdate {
    character_name?: string;
    parallel_quests?: number;
    /** Étape courante (1-34). */
    current_step?: number;
    show_trades?: boolean;
    /** 0 = Automatique, 1 = Mode expert. */
    trade_mode?: 0 | 1;
    trade_offer_threshold?: number | null;
    trade_want_threshold?: number | null;
    never_offer_normal?: boolean | 0 | 1;
    never_want_normal?: boolean | 0 | 1;
    never_offer_boss?: boolean | 0 | 1;
    never_want_boss?: boolean | 0 | 1;
    never_offer_arch?: boolean | 0 | 1;
    never_want_arch?: boolean | 0 | 1;
    /** Alternative aux flags \`never_*\` à plat : objet indexé par id de type (entrées partielles OK). */
    type_filters?: TypeFiltersInput;
  }

  interface TypeFilterEntry { never_offer: boolean; never_want: boolean; }
  /** Filtres par type, indexés par id de type ("1" monstre, "2" boss, "3" archimonstre). */
  type TypeFilters = Record<string, TypeFilterEntry>;
  /** Forme d'entrée : les clés et les deux flags sont optionnels (ex. \`{ "3": { never_want: true } }\`). */
  type TypeFiltersInput = Record<string, Partial<TypeFilterEntry>>;

  /** Réponse de \`updateQuest\` : n'écho que les champs modifiés (+ \`slug\`). */
  interface QuestUpdateResult {
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

  /** Réglages complets d'une quête, renvoyés par \`getQuest\` (réservé à vos propres quêtes). */
  interface QuestSettings {
    slug: string;
    character_name: string;
    current_step: number;
    parallel_quests: number;
    show_trades: boolean;
    is_favorite: boolean;
    /** 0 = Automatique, 1 = Mode expert. */
    trade_mode: 0 | 1;
    /** \`null\` en mode automatique. */
    trade_offer_threshold: number | null;
    /** \`null\` en mode automatique. */
    trade_want_threshold: number | null;
    type_filters: TypeFilters;
    server: Server | null;
    quest_template: QuestTemplateRef;
  }

  interface QuestMonsterQuantityInput {
    /** Id ou nom du monstre. */
    monster: MonsterInput;
    /** Quantité possédée (0 à 30). */
    quantity: number;
  }

  interface QuestMonsterQuantityResult {
    monster_id: MonsterId;
    quantity: number;
    owned: number;
    /** \`owned - parallel_quests\` : négatif = recherché, positif = proposé, 0 = neutre. */
    status: number;
    effective_offer: number;
    effective_want: number;
  }

  interface QuestMonstersBatchResult { updated_count: number; monsters: QuestMonsterQuantityResult[]; }

  interface MonsterTradeOptions {
    /** Quantité à proposer (0 à \`owned\`). \`null\` = calcul automatique. */
    trade_offer?: number | null;
    /** Quantité recherchée (0 à 30). \`null\` = calcul automatique. */
    trade_want?: number | null;
  }

  interface QuestMonsterTradeResult {
    monster_id: MonsterId;
    trade_offer: number | null;
    trade_want: number | null;
    effective_offer: number;
    effective_want: number;
  }

  interface MatchMonster {
    id: MonsterId;
    name: LocalizedName;
    available: number;
    needed: number;
    covers_need: boolean;
  }

  interface QuestMatch {
    user: BaseUser;
    quest: { slug: string; character_name: string; parallel_quests: number };
    matches: { they_have_you_want: MatchMonster[]; you_have_they_want: MatchMonster[] };
    match_score: number;
  }

  interface QuestZoneMonster {
    id: MonsterId;
    name: LocalizedName;
    image: MonsterImage;
    type: MonsterType | null;
    step: number;
    owned: number;
    required: number;
    status: "validated" | "completed" | "incomplete";
    offer: number;
    want: number;
  }

  interface QuestZoneSubZoneProgress {
    id: SubZoneId;
    name: LocalizedName;
    completed: number;
    total: number;
    monsters: QuestZoneMonster[];
  }

  interface QuestZoneProgress {
    id: ZoneId;
    name: LocalizedName;
    completed: number;
    total: number;
    subzones: QuestZoneSubZoneProgress[];
  }

  // ---- Options ----

  interface GameVersionsOptions extends RequestOptions { idOrName?: GameVersionInput; }
  interface MonsterTypesOptions extends RequestOptions { idOrName?: MonsterTypeInput; }

  interface ZonesOptions extends RequestOptions {
    idOrName?: ZoneInput;
    /** Recherche par nom (≥ 3 caractères). */
    query?: string;
  }

  interface SubZonesOptions extends RequestOptions {
    idOrName?: SubZoneInput;
    /** Recherche par nom (nécessite \`zoneIdOrName\`, ≥ 3 caractères). */
    query?: string;
    zoneIdOrName?: ZoneInput;
  }

  interface MonstersOptions extends RequestOptions {
    idOrName?: MonsterInput;
    /** Recherche par nom (≥ 3 caractères). */
    query?: string;
    typeIdOrName?: MonsterTypeInput;
    /** Défaut : 50, max : 200. */
    limit?: number;
    /** Défaut : 0. */
    offset?: number;
  }

  interface QuestTemplatesOptions extends RequestOptions {
    /** Id du modèle (1 = Ocre Unity, 2 = Ocre Rétro, 3 = Ocre Touch, 4 = Dokille Unity). */
    id?: QuestTemplateId;
    step?: number;
    limit?: number;
    offset?: number;
  }

  interface ServersOptions extends RequestOptions { idOrName?: ServerInput; }

  interface KralovesOptions extends RequestOptions {
    id?: string | number;
    serverIdOrName?: ServerInput;
    /** Date de début \`YYYY-MM-DD\` (défaut : aujourd'hui). */
    from?: string;
  }

  interface SearchUsersOptions extends RequestOptions {
    serverIdOrName?: ServerInput;
    /** Défaut : 90, max : 365. */
    active_within_days?: number;
    /** Défaut : 20, max : 50. */
    limit?: number;
    offset?: number;
  }

  interface UserQuestsOptions extends RequestOptions {
    slug?: string;
    monsterTypeIdOrName?: MonsterTypeInput;
    /** \`wanted\` = recherchés, \`offered\` = proposés. */
    status?: "wanted" | "offered";
    step?: number;
    /** Défaut : 50, max : 200. */
    limit?: number;
    offset?: number;
  }

  interface ConversationsOptions extends RequestOptions {
    status?: "active" | "archived";
    /** Max 50 (défaut 50). */
    limit?: number;
    offset?: number;
  }

  interface MessagesOptions extends RequestOptions {
    /** Défaut 30, max 50. */
    limit?: number;
    /** Curseur : valeur de \`next_before_id\` de la page précédente. */
    before_id?: number;
  }

  interface QuestMatchesOptions extends RequestOptions {
    /** Défaut : 20, max : 50. */
    limit?: number;
    offset?: number;
    /** Nombre minimum de quêtes en parallèle chez le partenaire (défaut : 1). */
    min_parallel_quests?: number;
    /** Exclut les partenaires avec un seul sens d'échange possible (défaut : false). */
    only_possible_trades?: boolean | 0 | 1;
  }

  interface QuestZonesOptions extends RequestOptions {
    zoneIdOrName?: ZoneInput;
    subzoneIdOrName?: SubZoneInput;
    monsterTypeIdOrName?: MonsterTypeInput;
  }

  // ---- Cache ----

  interface Cache {
    readonly game_versions: GameVersion[];
    readonly monster_types: MonsterType[];
    readonly quest_types: QuestType[];
    readonly monsters: BaseMonster[];
    readonly quest_templates: Array<QuestTemplate & { monsters: BaseMonster[] }>;
    readonly servers: Server[];
    readonly subzones: SubZone[];
    readonly zones: Zone[];
  }
}
`;

fs.writeFileSync(path.join(__dirname, "..", "index.d.ts"), out);
console.log(`index.d.ts généré (${(out.length / 1024).toFixed(1)} kB) avec ${Object.keys(U).length} unions littérales.`);
