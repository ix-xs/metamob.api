const SITE = "https://www.metamob.fr";

/**
 * Addresses on metamob.fr, built from what the API returns. Nothing is
 * fetched.
 *
 * @example
 * import { urls } from "@ix-xs/metamob.api";
 *
 * urls.monsterImage(monster);       // "https://www.metamob.fr/img/monsters/tofu.png"
 * urls.profile("Ix-xs");            // "https://www.metamob.fr/profile/Ix-xs"
 */
export const urls = {
  /** The site itself. */
  site: SITE,

  /**
   * The picture of a monster, from the monster (or anything with its
   * `image`, an avatar for instance) or from the file name.
   */
  monsterImage(monster: { readonly image: string } | string): string {
    return `${SITE}/img/monsters/${encodeURIComponent(typeof monster === "string" ? monster : monster.image)}`;
  },

  /** The picture of a kind of quest, from the quest type or from the file name. */
  questTypeImage(questType: { readonly image: string } | string): string {
    return `${SITE}/img/quest-types/${encodeURIComponent(typeof questType === "string" ? questType : questType.image)}`;
  },

  /** The public profile page of a user, from the user or from the username. */
  profile(user: { readonly username: string } | string): string {
    return `${SITE}/profile/${encodeURIComponent(typeof user === "string" ? user : user.username)}`;
  },
} as const;
