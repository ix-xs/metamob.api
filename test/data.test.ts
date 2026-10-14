import { describe, expect, it } from "vitest";
import { Dataset, data, normalizeName, urls } from "../src/index.js";

describe("the embedded data", () => {
  it("holds every collection, and says when it was fetched", () => {
    expect(data).toBeInstanceOf(Dataset);
    expect(data.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.monsters.length).toBeGreaterThan(800);
    expect(data.zones.length).toBeGreaterThan(20);
    expect(data.subzones.length).toBeGreaterThan(40);
    expect(data.servers.length).toBeGreaterThan(15);
    expect(data.gameVersions.map((version) => version.name)).toEqual(["Dofus (Unity)", "Dofus Retro (1.29)", "Dofus Touch"]);
    expect(data.monsterTypes.map((type) => type.name.fr)).toEqual(["monstre", "boss", "archimonstre"]);
    expect(data.questTypes.map((type) => type.slug)).toEqual(["ocre", "dokille"]);
    expect(data.questTemplates.length).toBeGreaterThanOrEqual(4);
  });

  it("gives records the shape the API gives them", () => {
    expect(data.monster(472)).toEqual({
      id: 472,
      name: { fr: "Aboudbra le Porteur", en: "Abounteous the Generous", es: "Abubanero el Naranja" },
      image: expect.stringMatching(/\.png$/),
      level_min: expect.any(Number),
      level_max: expect.any(Number),
      type: { id: 3, name: { fr: "archimonstre", en: "archmonster", es: "archimonstruo" } },
      reference: { id: 121, name: { fr: "Aboub", en: "Aboub", es: "Abub" } },
    });
    expect(data.monster("Aboub")?.reference).toBeUndefined();
    expect(data.server("Draconiros")).toEqual({ id: 12, name: "Draconiros", community: "World", game_version: { id: 1, name: "Dofus (Unity)" } });
    expect(data.questType("ocre")).toEqual({ id: 1, slug: "ocre", name: { fr: "Ocre", en: "Ochre", es: "Ocre" }, image: "ocre.png" });
    expect(data.subzone(48)).toEqual({ id: 48, name: { fr: "Akadémie des Gobs", en: "Gob Akademy", es: "Akademia de los Goblins" }, zone: { id: 1, name: { fr: "Amakna", en: "Amakna", es: "Amakna" } } });
    // Nothing is circular: it all survives JSON.
    expect(() => JSON.stringify([data.zones, data.subzones, data.monsters, data.questTemplates])).not.toThrow();
  });

  it("finds by id, by name in three languages, by numeric string and by object", () => {
    const tofu = data.monster("Tofu");
    expect(tofu?.id).toBe(20);
    expect(data.monster("  tofu  ")).toBe(tofu);
    expect(data.monster("TOFU")).toBe(tofu);
    expect(data.monster(20)).toBe(tofu);
    expect(data.monster("20")).toBe(tofu);
    expect(data.monster({ id: 20 })).toBe(tofu);
    expect(data.monster("Tofu Maléfique")?.id).toBe(data.monster("tofu malefique")?.id);
    expect(data.monster("Evil Tofu")?.id).toBe(data.monster("Tofu Maléfique")?.id);
    expect(data.monster("Abounteous the Generous")?.id).toBe(472);
    expect(data.monster("Abubanero el Naranja")?.id).toBe(472);
    expect(data.monster("no such monster")).toBeUndefined();
    expect(data.monster(999_999)).toBeUndefined();

    expect(data.zone("amakna")?.id).toBe(1);
    expect(data.zone(1)?.subzones.length).toBeGreaterThan(5);
    expect(data.subzone("Gob Akademy")?.id).toBe(48);
    expect(data.gameVersion("dofus touch")?.id).toBe(3);
    expect(data.monsterType("boss")?.id).toBe(2);
    expect(data.monsterType("Archmonster")?.id).toBe(3);
    expect(data.questType("Grofus")?.slug).toBe("dokille");
    expect(data.questType("Dosaurio")?.id).toBe(2);
  });

  it("tells apart the archmonsters that share a name across versions of the game", () => {
    const named = data.monstersNamed("Crognan le Barbare");
    expect(named.map((monster) => monster.id)).toEqual([416, 725]);
    // Dofus (Unity) first when nothing says otherwise.
    expect(data.monster("Crognan le Barbare")?.id).toBe(416);
    expect(data.monster("Crognan le Barbare", { gameVersion: "Dofus Retro (1.29)" })?.id).toBe(725);
    expect(data.monster("Crognan le Barbare", { gameVersion: "Dofus Touch" })?.id).toBe(725);
    expect(data.monster("Crognan le Barbare", { template: 1 })?.id).toBe(416);
    expect(data.monster("Crognan le Barbare", { template: { questType: "ocre", gameVersion: "Dofus Touch" } })?.id).toBe(725);
    // A hint that matches nothing falls back on the default.
    expect(data.monster("Crognan le Barbare", { template: 4 })?.id).toBe(416);
    expect(data.monstersNamed("Tofu")).toHaveLength(1);
    expect(data.monstersNamed("nope")).toEqual([]);
  });

  it("searches names, best match first", () => {
    const results = data.searchMonsters("tofu");
    expect(results[0]?.name.fr).toBe("Tofu");
    expect(results.every((monster) => Object.values(monster.name).some((name) => normalizeName(name).includes("tofu")))).toBe(true);
    expect(data.searchMonsters("tofu", { limit: 2 })).toHaveLength(2);
    expect(data.searchMonsters("bouf", { type: "archimonstre" }).every((monster) => monster.type?.id === 3)).toBe(true);
    expect(data.searchMonsters("bouf", { type: "unknown kind" })).toEqual([]);
    expect(data.searchMonsters("crognan", { gameVersion: "Dofus Touch" }).map((monster) => monster.id)).toEqual([725]);
    expect(data.searchMonsters("crognan", { template: 1 }).map((monster) => monster.id)).toEqual([416]);
    expect(data.searchMonsters("   ")).toEqual([]);
    expect(data.searchMonsters("zzzzzz")).toEqual([]);
  });

  it("links monsters, subzones, zones and quest templates", () => {
    expect(data.monstersInSubzone(48).map((monster) => monster.name.fr).sort()).toEqual(["Gob-trotteur", "Gobet"]);
    expect(data.monstersInSubzone("nowhere")).toEqual([]);
    expect(data.subzonesOf("Gobet").map((subzone) => subzone.id)).toContain(48);
    expect(data.zonesOf("Gobet").map((zone) => zone.name.fr)).toContain("Amakna");
    expect(data.monstersInZone("Amakna").some((monster) => monster.name.fr === "Gobet")).toBe(true);
    expect(data.monstersInZone("nowhere")).toEqual([]);
    expect(data.subzonesOf("nobody")).toEqual([]);

    expect(data.archmonstersOf("Aboub").map((monster) => monster.id)).toEqual([472]);
    expect(data.archmonstersOf(472)).toEqual([]);
    expect(data.archmonstersOf("nobody")).toEqual([]);

    expect(data.templatesOf(416).map((template) => template.id)).toEqual([1]);
    expect(data.templatesOf(725).map((template) => template.id)).toEqual([2, 3]);
    expect(data.templatesOf("nobody")).toEqual([]);

    const touch = data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" });
    expect(touch).toMatchObject({ id: 3, quest_type: { slug: "ocre" }, game_version: { name: "Dofus Touch" } });
    expect(data.questTemplate(3)).toBe(touch);
    expect(data.questTemplate({ id: 3 })).toBe(touch);
    expect(data.questTemplate({ questType: "dokille", gameVersion: "Dofus Retro (1.29)" })).toBeUndefined();
    expect(data.questTemplate({ questType: "nope", gameVersion: "Dofus Touch" })).toBeUndefined();

    const asked = data.templateMonsters(touch!);
    expect(asked).toHaveLength(touch!.monster_count);
    expect(asked[0]).toHaveProperty("step");
    expect(data.templateMonsters(999)).toEqual([]);
    expect(data.stepOf("nobody", 1)).toBeUndefined();
    expect(data.stepOf(416, 3)).toBeUndefined();
  });

  it("suggests the closest names for a typo", () => {
    expect(data.suggest("monster", "Tofu Malefik")).toContain("Tofu Maléfique");
    expect(data.suggest("server", "Draconiro")).toEqual(["Draconiros"]);
    expect(data.suggest("zone", "amakn")).toEqual(["Amakna"]);
    expect(data.suggest("monster", "tof", 2)).toHaveLength(2);
    expect(data.suggest("monster", "")).toEqual([]);
    expect(data.suggest("monster", "qqqqqqqqqqqqqqqq")).toEqual([]);
    // A monster is suggested once, not once per language.
    const suggestions = data.suggest("monster", "Aboudbra", 5);
    expect(suggestions.filter((name) => data.monster(name)?.id === 472)).toHaveLength(1);
  });
});

describe("normalizeName", () => {
  it("ignores accents, case, spacing and the kind of apostrophe", () => {
    expect(normalizeName("  Tofu   MALÉFIQUE ")).toBe("tofu malefique");
    expect(normalizeName(`Abrakanette l${String.fromCharCode(0x2019)}Encapsulé`)).toBe("abrakanette l'encapsule");
    expect(normalizeName("Île de Pandala")).toBe("ile de pandala");
  });

  it("finds a name written with a long dash from the same name typed with a hyphen", () => {
    // As the API writes it: a non-breaking space, then an en dash.
    const written = `Expedition${String.fromCharCode(0xa0, 0x2013)} Scaraleaf Dungeon`;
    expect(normalizeName(written)).toBe("expedition - scaraleaf dungeon");
    expect(data.subzone("Expedition - Scaraleaf Dungeon")?.id).toBe(201);
    // The record keeps the name exactly as the API gives it.
    expect(data.subzone(201)?.name.en).toBe(written);
    expect(data.subzone(written)?.id).toBe(201);
  });
});

describe("urls", () => {
  it("builds addresses of the site from what the API returns", () => {
    expect(urls.monsterImage({ image: "tofu.png" })).toBe("https://www.metamob.fr/img/monsters/tofu.png");
    expect(urls.monsterImage("tofu malefique.png")).toBe("https://www.metamob.fr/img/monsters/tofu%20malefique.png");
    expect(urls.questTypeImage({ image: "ocre.png" })).toBe("https://www.metamob.fr/img/quest-types/ocre.png");
    expect(urls.questTypeImage("dokille.png")).toBe("https://www.metamob.fr/img/quest-types/dokille.png");
    expect(urls.profile("Ix-xs")).toBe("https://www.metamob.fr/profile/Ix-xs");
    expect(urls.profile({ username: "a b" })).toBe("https://www.metamob.fr/profile/a%20b");
    expect(urls.site).toBe("https://www.metamob.fr");
  });
});
