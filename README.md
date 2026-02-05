# ![Metamob](https://beta.metamob.fr/img/pierre_dame_small.png) [Metamob](https://beta.metamob.fr)

<img align=right src="https://beta.metamob.fr/img/ocre.png">
<div>
    <div>
        <h3>Complétez votre quête du Dofus Ocre</h3>
        <p>Suivez votre progression dans la quête de l'Ocre, gérez votre inventaire de monstres et échangez avec la communauté pour compléter votre collection.</p>
        <p>Compatible avec Dofus Unity, Dofus Retro et Dofus Touch</p>
    </div>
</div>

<br>
<br>

# @ix-xs/metamob.api

<div align="center">

![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

[![npm version](https://badge.fury.io/js/%40ix-xs%2Fmetamob.api.svg)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![Downloads](https://img.shields.io/npm/dm/@ix-xs/metamob.api.svg)](https://www.npmjs.com/package/@ix-xs/metamob.api)
[![License](https://img.shields.io/npm/l/@ix-xs/metamob.api.svg)](https://github.com/ix-xs/metamob.api/blob/main/LICENSE)

</div>
<br>

## 📖 Table des matières

- [✨ Présentation](#-présentation)
- [🚀 Installation](#-installation)
- [🔐 Authentification](#-authentification)
- [⚙️ Limites de l'API](#️-limites-de-lapi)
- [📦 Structure des réponses](#-structure-des-réponses)
- [💾 Cache de données](#-cache-de-données)
- [📚 Documentation API](#-documentation-api)
  - [Versions du jeu](#versions-du-jeu)
  - [Serveurs](#serveurs)
  - [Types de monstres](#types-de-monstres)
  - [Modèles de quête](#modèles-de-quête)
  - [Recherche d'utilisateurs](#recherche-dutilisateurs)
  - [Profils utilisateurs](#profils-utilisateurs)
  - [Quêtes utilisateurs](#quêtes-utilisateurs)
  - [Détails d'une quête utilisateur](#détails-dune-quête-utilisateur)
  - [Partenaires d'échange](#partenaires-déchange)
  - [Modifier les paramètres d'une quête utilisateur](#modifier-les-paramètres-dune-quête-utilisateur)
  - [Modifier plusieurs monstres d'une quête utilisateur](#modifier-plusieurs-monstres-dune-quête-utilisateur)
  - [Paramètres de trade manuels d'une quête utilisateur](#paramètres-de-trade-manuels-dune-quête-utilisateur)

## ✨ Présentation

**@ix-xs/metamob.api** est un client Node.js complet pour accéder programmatiquement à l'[API Metamob](https://beta.metamob.fr/help/api). Metamob est une plateforme communautaire dédiée au **suivi de la quête de l'Ocre** dans l'univers Dofus, permettant aux joueurs de gérer leur inventaire de monstres et d'échanger avec d'autres collectionneurs.

### 🎮 Compatible avec

- **Dofus Unity** - Version moderne du jeu
- **Dofus Retro (1.29)** - Version rétro/classique
- **Dofus Touch** - Version mobile

### 🎯 Cas d'usage

- 📊 **Bots Discord** - Créer des commandes pour consulter les données Metamob
- 🔧 **Outils personnalisés** - Développer des applications pour gérer votre progression
- 📈 **Intégrations** - Combiner Metamob avec d'autres services (webhooks, monitoring, etc.)

## 🚀 Installation

### NPM

```bash
npm install @ix-xs/metamob.api
```

## 🔐 Authentification

### Créer une clé API

1. ✅ Connectez-vous à votre compte sur [Metamob](https://beta.metamob.fr)
2. ⚙️ Accédez à vos **Paramètres**
3. 🔑 Naviguez vers la section **Clé API**
4. ✨ Cliquez sur **Générer une clé**
5. 📋 **Copiez** votre clé (elle ne sera plus affichée après cette étape)

## ⚙️ Limites de l'API

L'API Metamob applique des **rate limits** pour garantir la stabilité du service :

### Rate Limiting

| Limite                  | Valeur                   |
| ----------------------- | ------------------------ |
| **Requêtes par minute** | 60 par clé API           |
| **Code de dépassement** | `429 Too Many Requests`  |
| **En-tête de retry**    | `Retry-After` (secondes) |

## 📦 Structure des réponses

Toutes les requêtes retournent un objet JSON **normalisé** avec une structure cohérente :

### Format standard

```javascript
{
  ok: boolean,              // Indique le succès de la requête
  status: number,           // Code HTTP (200, 404, 429, 500, etc.)
  statusText: string,       // Libellé HTTP ("OK", "Not Found", etc.)
  data?: Object|Object[],   // Données retournées (absent si ok = false)
  pagination?: {            // Présent uniquement pour les listes paginées
    total: number,          // Nombre total d'éléments
    limit: number,          // Nombre d'éléments par page
    offset: number,         // Index du premier élément
  },
  error?: string,           // Message d'erreur (si ok = false)
  retryAfter?: number,      // Délai avant nouvelle tentative (si status = 429)
}
```

### Exemple : succès

```javascript
{
  ok: true,
  status: 200,
  statusText: "OK",
  data: [
    { id: 1, name: "Brial", community: "France", ... },
    { id: 2, name: "Rafal", community: "France", ... },
  ],
  pagination: {
    total: 20,
    limit: 20,
    offset: 0
  }
}
```

### Exemple : erreur

```javascript
{
  ok: false,
  status: 404,
  statusText: "Not Found",
  error: "Utilisateur 'xyz' non trouvé"
}
```

### Exemple : rate limit

```javascript
{
  ok: false,
  status: 429,
  statusText: "Too Many Requests",
  retryAfter: 45,
  error: "Trop de requêtes. Veuillez réessayer après 45 secondes"
}
```

## 💾 Cache de données

### 🎯 Concept

Ce package intègre un **cache de données statiques** embarqué sous forme de fichiers JSON. Ces données correspondent à des informations quasi-permanentes côté Metamob (serveurs, types de monstres, catalogues, etc.).

### ✅ Avantages du cache

| Avantage                   | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| **🚀 Performance**         | Pas de requête API pour les données statiques                |
| **📉 Réduction API**       | Économise vos appels API pour les vraies données             |
| **🎯 Recherche intuitive** | Rechercher par nom au lieu de chercher par ID                |
| **↔️ Conversion**          | Convertir facilement ID ↔ Nom                                |
| **⚡ Offline**             | Données disponibles même sans réseau (après première charge) |

### 📊 Données en cache

| Clé            | Contenu                                         | Utilité                             |
| -------------- | ----------------------------------------------- | ----------------------------------- |
| `gameVersions` | Versions du jeu (Unity, Retro, Touch)           | Identifier les versions disponibles |
| `servers`      | Liste des serveurs par communauté               | Chercher un serveur par nom         |
| `monsterTypes` | Types de monstres (monstre, archimonstre, boss) | Filtrer par type                    |
| `monsters`     | Catalogue complet des monstres multilingues     | Rechercher un monstre par nom       |

### 🔍 Utilisation du cache

```javascript
// Au lieu de faire :
client.getMonsters(); // requête GET /monsters -> paginé

// Vous pouvez faire :
client.cache.monsters; // cache, complet
```

### 🔄 Mise à jour du cache

Le cache n'est **pas mis à jour automatiquement** depuis l'API en temps réel. Les mises à jour sont gérées via de **nouvelles versions du package** NPM.

**Pour obtenir les dernières données :**

```bash
npm update @ix-xs/metamob.api
```

Les données en cache reflètent les informations les plus récentes de Metamob à chaque nouvelle version du package.

### ⚠️ Limitations

- Le cache est **read-only** (lecture seule)
- Les données statiques changent rarement, mais peuvent être obsolètes entre versions
- Pour les données **dynamiques** (profils, quêtes), utiliser les endpoints API appropriés

## 📚 Documentation API

### Initialisation

```javascript
const MetamobAPI = require("@ix-xs/metamob.api");
const client = new MetamobAPI(process.env.METAMOB_API_KEY);
```

---

### Versions du jeu

Récupérer la liste des versions du jeu disponibles sur Metamob.

#### Signature

```javascript
getGameVersions(options?: { game_name?: string })
```

#### Types

```javascript
/**
 * @typedef {object} GameVersion
 * @property {number} id - Identifiant unique
 * @property {string} name - Nom de la version ("Dofus (Unity)", "Dofus Retro (1.29)", "Dofus Touch")
 */
```

#### Exemples

**Lister toutes les versions**

```javascript
const response = await client.getGameVersions();

if (!response.ok) {
  return console.error(response.error ?? response.statusText);
}

response.data.forEach((version) => {
  console.log(`${version.id}: ${version.name}`);
});
// Output:
// 1: Dofus (Unity)
// 2: Dofus Retro (1.29)
// 3: Dofus Touch
```

**Récupérer une version spécifique**

```javascript
const response = await client.getGameVersions({
  game_name: "Dofus (Unity)",
});

if (response.ok) {
  console.log(response.data);
  // { id: 1, name: "Dofus (Unity)" }
}
```

---

### Serveurs

Récupérer la liste des serveurs de jeu disponibles.

#### Signature

```javascript
getServers(options?: { server_name?: string })
```

#### Types

```javascript
/**
 * @typedef {object} Server
 * @property {number} id - Identifiant unique
 * @property {string} name - Nom du serveur
 * @property {string} community - Communauté ("World" ou "France")
 * @property {GameVersion} game_version - Version du jeu du serveur
 */
```

#### Serveurs disponibles

| France     | World      |
| ---------- | ---------- |
| Brial      | Brial      |
| Rafal      | Rafal      |
| Salar      | Salar      |
| Kourial    | Kourial    |
| Dakal      | Dakal      |
| Mikhal     | Mikhal     |
| Imagiro    | Imagiro    |
| Hell Mina  | Hell Mina  |
| Tylezia    | Tylezia    |
| Orukam     | Orukam     |
| Tal Kasha  | Tal Kasha  |
| Draconiros | Draconiros |
| Ombre      | Ombre      |
| Fallanster | Fallanster |
| Boune      | Boune      |
| Allisteria | Allisteria |
| Blair      | Blair      |
| Kelerog    | Kelerog    |
| Talok      | Talok      |
| Tiliwan    | Tiliwan    |

#### Exemples

**Lister tous les serveurs**

```javascript
const response = await client.getServers();

if (response.ok) {
  response.data.forEach((server) => {
    console.log(
      `${server.name} (${server.community}) - ${server.game_version.name}`,
    );
  });
}
```

**Récupérer un serveur spécifique**

```javascript
const response = await client.getServers({
  server_name: "Brial",
});

if (response.ok) {
  console.log(response.data);
  // {
  //   id: 1,
  //   name: "Brial",
  //   community: "France",
  //   game_version: { id: 1, name: "Dofus (Unity)" }
  // }
}
```

**Grouper par communauté**

```javascript
const response = await client.getServers();

if (response.ok) {
  const byRegion = response.data.reduce((acc, server) => {
    if (!acc[server.community]) acc[server.community] = [];
    acc[server.community].push(server.name);
    return acc;
  }, {});

  console.log(byRegion);
  // {
  //   France: ["Brial", "Rafal", ...],
  //   World: ["Brial", "Rafal", ...]
  // }
}
```

---

### Types de monstres

Récupérer les catégories de monstres.

#### Signature

```javascript
getMonsterTypes(options?: { type_name?: string })
```

#### Types

```javascript
/**
 * @typedef {object} MonsterType
 * @property {number} id - Identifiant unique
 * @property {object} name - Nom multilingue
 * @property {string} name.fr - Nom en français
 * @property {string} name.en - Nom en anglais
 * @property {string} name.es - Nom en espagnol
 */
```

#### Types disponibles

| Français     | Anglais     | Espagnol      |
| ------------ | ----------- | ------------- |
| Monstre      | Monster     | Monstruo      |
| Archimonstre | Archmonster | Archimonstruo |
| Boss         | Boss        | Boss          |

#### Exemples

**Lister tous les types**

```javascript
const response = await client.getMonsterTypes();

if (response.ok) {
  response.data.forEach((type) => {
    console.log(
      `FR: ${type.name.fr}, EN: ${type.name.en}, ES: ${type.name.es}`,
    );
  });
}
```

**Récupérer un type spécifique**

```javascript
const response = await client.getMonsterTypes({
  type_name: "boss",
});

if (response.ok) {
  console.log(response.data);
  // {
  //   id: 3,
  //   name: { fr: "Boss", en: "Boss", es: "Boss" }
  // }
}
```

---

### Modèles de quête

Récupérer les modèles de quête avec la liste des monstres à capturer par étape.

#### Signature

```javascript
getQuestTemplates(options?: {
  game_name?: string,
  step?: number,
  limit?: number,
  offset?: number
})
```

#### Types

```javascript
/**
 * @typedef {object} QuestTemplate
 * @property {number} id - Identifiant
 * @property {GameVersion} game_version - Version du jeu
 * @property {number} monster_count - Nombre total de monstres
 * @property {number} step_count - Nombre d'étapes
 *
 * @typedef {object} QuestTemplateDetail
 * @property {number} id - Identifiant
 * @property {GameVersion} game_version - Version du jeu
 * @property {Array} monsters - Monstres avec leur étape
 * @property {Pagination} pagination - Infos de pagination
 */
```

#### Exemples

**Lister les modèles de quête**

```javascript
const response = await client.getQuestTemplates();

if (response.ok) {
  console.log(`Modèles trouvés: ${response.pagination.total}`);
  response.data.forEach((template) => {
    console.log(
      `${template.game_version.name}: ${template.monster_count} monstres en ${template.step_count} étapes`,
    );
  });
}
```

**Récupérer les monstres d'une étape spécifique**

```javascript
const response = await client.getQuestTemplates({
  game_name: "Dofus (Unity)",
  step: 1,
  limit: 50,
});

if (response.ok) {
  console.log(`Étape 1 - Monstres à capturer:`);
  response.data.monsters.forEach((monster) => {
    console.log(`- ${monster.name.fr} (étape ${monster.step})`);
  });
}
```

**Pagination**

```javascript
const response = await client.getQuestTemplates({
  game_name: "Dofus (Unity)",
  step: 1,
  limit: 10,
  offset: 20, // Sauter les 20 premiers résultats
});

if (response.ok) {
  console.log(`Résultats 21-30 sur ${response.pagination.total}`);
}
```

---

### Recherche d'utilisateurs

Rechercher des utilisateurs ayant des quêtes publiques.

#### Signature

```javascript
searchUsers(
  query: string,
  options?: {
    server_name?: string,
    active_within_days?: number,
    limit?: number,
    offset?: number
  }
)
```

#### Paramètres

| Paramètre            | Requis | Type   | Description                                             |
| -------------------- | ------ | ------ | ------------------------------------------------------- |
| `query`              | ✅     | string | Terme de recherche (min. 3 caractères)                  |
| `server_name`        | ❌     | string | Filtrer par serveur                                     |
| `active_within_days` | ❌     | number | Actifs dans les N derniers jours (défaut: 90, max: 365) |
| `limit`              | ❌     | number | Nombre de résultats (défaut: 20, max: 50)               |
| `offset`             | ❌     | number | Décalage pour pagination (défaut: 0)                    |

#### Types

```javascript
/**
 * @typedef {object} UserAvatar
 * @property {number} id - Identifiant de l'avatar
 * @property {object} name - Nom multilingue
 * @property {string} image - URL de l'image
 *
 * @typedef {object} Search
 * @property {string} username - Nom d'utilisateur
 * @property {UserAvatar} avatar - Avatar utilisateur
 * @property {string} last_active - Dernière activité (ISO 8601)
 */
```

#### Exemples

**Recherche basique**

```javascript
const response = await client.searchUsers("jean");

if (!response.ok) {
  return console.error(response.error);
}

response.data.forEach((user) => {
  console.log(`${user.username} (${user.avatar.name.fr})`);
});
```

**Filtrer par serveur et activité**

```javascript
const response = await client.searchUsers("jean", {
  server_name: "Brial",
  active_within_days: 30, // Actifs dans les 30 derniers jours
  limit: 10,
});

if (response.ok) {
  console.log(`${response.pagination.total} utilisateurs trouvés`);
  response.data.forEach((user) => {
    console.log(`- ${user.username} (dernière activité: ${user.last_active})`);
  });
}
```

**Pagination avancée**

```javascript
async function searchAllUsers(query, pageSize = 50) {
  let allResults = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await client.searchUsers(query, {
      limit: pageSize,
      offset,
    });

    if (!response.ok) break;

    allResults.push(...response.data);
    hasMore =
      response.pagination.offset + response.pagination.limit <
      response.pagination.total;
    offset += pageSize;
  }

  return allResults;
}
```

---

### Profils utilisateurs

Récupérer le profil détaillé d'un utilisateur.

#### Signature

```javascript
getUser(username: string)
```

#### Types

```javascript
/**
 * @typedef {object} User
 * @property {string} username - Nom d'utilisateur
 * @property {string} bio - Biographie de l'utilisateur
 * @property {UserAvatar} avatar - Avatar utilisateur
 * @property {string} created_at - Date de création du compte (ISO 8601)
 * @property {string} last_active - Dernière activité (ISO 8601)
 */
```

#### Exemples

**Récupérer un profil**

```javascript
const response = await client.getUser("ix-xs");

if (!response.ok) {
  return console.error(`Utilisateur non trouvé: ${response.error}`);
}

const user = response.data;
console.log(`
${user.username}
Avatar: ${user.avatar.name.fr}
Bio: ${user.bio || "Pas de bio"}
Compte créé: ${new Date(user.created_at).toLocaleDateString("fr-FR")}
Dernière activité: ${new Date(user.last_active).toLocaleDateString("fr-FR")}
`);
```

**Vérifier l'activité d'un utilisateur**

```javascript
const response = await client.getUser("jean");

if (response.ok) {
  const user = response.data;
  const daysSinceActive = Math.floor(
    (Date.now() - new Date(user.last_active)) / (1000 * 60 * 60 * 24),
  );

  console.log(`${user.username} a été actif il y a ${daysSinceActive} jours`);
}
```

---

### Quêtes utilisateurs

Récupérer la liste des quêtes publiques d'un utilisateur.

#### Signature

```javascript
getUserQuests(username: string)
```

#### Types

```javascript
/**
 * @typedef {object} Quest
 * @property {string} slug - Identifiant unique de la quête
 * @property {string} character_name - Nom du personnage Dofus
 * @property {number} current_step - Étape actuelle de la quête
 * @property {number} parallel_quests - Nombre de quêtes parallèles
 * @property {number} wanted_count - Nombre de monstres recherchés
 * @property {number} offered_count - Nombre de monstres proposés
 * @property {Server} server - Serveur du personnage
 * @property {QuestTemplate} quest_template - Modèle de quête
 */
```

#### Exemples

**Lister les quêtes d'un utilisateur**

```javascript
const response = await client.getUserQuests("ix-xs");

if (!response.ok) {
  return console.error(response.error);
}

response.data.forEach((quest) => {
  console.log(`
Personnage: ${quest.character_name}
Serveur: ${quest.server.name}
Étape: ${quest.current_step}/${quest.quest_template.step_count}
Recherche: ${quest.wanted_count} / Proposé: ${quest.offered_count}
`);
});
```

**Analyser la progression de quête**

```javascript
const response = await client.getUserQuests("jean");

if (response.ok) {
  response.data.forEach((quest) => {
    const progression = Math.floor(
      (quest.current_step / quest.quest_template.step_count) * 100,
    );

    console.log(`
${quest.character_name}: ${progression}% complété
Étape ${quest.current_step}/${quest.quest_template.step_count}
Progression: ${"█".repeat(Math.floor(progression / 5))}${"░".repeat(20 - Math.floor(progression / 5))}
`);
  });
}
```

**Trouver des fournisseurs de monstres**

```javascript
const response = await client.getUserQuests("jean");

if (response.ok) {
  const providers = response.data.filter((quest) => quest.offered_count > 0);

  console.log(
    `${quest.character_name} propose ${quest.offered_count} monstres`,
  );
}
```

---

### Détails d'une quête utilisateur

Récupérer les monstres d'une quête spécifique avec filtres et pagination.

#### Signature

```javascript
getUserQuestMonsters(
  username: string,
  quest_slug: string,
  options?: {
    status?: "wanted" | "offered",
    step?: number,
    limit?: number,
    offset?: number
  }
)
```

#### Paramètres

| Paramètre    | Requis | Type   | Description                                   |
| ------------ | ------ | ------ | --------------------------------------------- |
| `username`   | ✅     | string | Nom d'utilisateur                             |
| `quest_slug` | ✅     | string | Identifiant (slug) de la quête                |
| `status`     | ❌     | string | "wanted" (recherchés) ou "offered" (proposés) |
| `step`       | ❌     | number | Filtrer par numéro d'étape                    |
| `limit`      | ❌     | number | Nombre de résultats (défaut: 50, max: 200)    |
| `offset`     | ❌     | number | Décalage pour pagination (défaut: 0)          |

#### Types

```javascript
/**
 * @typedef {Monster & { step: number, owned: number, status: number }} QuestMonster
 * @property {number} step - Numéro d'étape du monstre
 * @property {number} owned - Quantité possédée
 * @property {number} status - Statut (0=neutre, 1=recherché, 2=proposé)
 */
```

#### Exemples

**Lister tous les monstres d'une quête**

```javascript
const response = await client.getUserQuestMonsters("ix-xs", "abcdef");

if (response.ok) {
  console.log(`${response.pagination.total} monstres dans la quête`);
  response.data.forEach((monster) => {
    console.log(
      `${monster.name.fr} - Étape ${monster.step} - Possédé: ${monster.owned}`,
    );
  });
}
```

**Filtrer par statut**

```javascript
// Monstres proposés uniquement
const response = await client.getUserQuestMonsters("ix-xs", "abcdef", {
  status: "offered",
});

if (response.ok) {
  console.log("Monstres proposés à l'échange:");
  response.data.forEach((m) => console.log(`- ${m.name.fr} (x${m.owned})`));
}
```

**Filtrer par étape**

```javascript
// Monstres de l'étape 5
const response = await client.getUserQuestMonsters("ix-xs", "abcdef", {
  step: 5,
});

if (response.ok) {
  console.log(`Monstres de l'étape 5: ${response.pagination.total}`);
}
```

---

### Partenaires d'échange

Trouve des utilisateurs avec qui échanger des monstres en analysant les compatibilités entre quêtes.

#### Signature

```javascript
matchUserQuest(
  user_api_key: string,
  quest_slug: string,
  options?: {
    direction?: "they_have" | "they_want" | "both",
    active_within_days?: number,
    min_parallel_quests?: number,
    limit?: number,
    offset?: number
  }
)
```

#### Paramètres

| Paramètre             | Requis | Type   | Description                                             |
| --------------------- | ------ | ------ | ------------------------------------------------------- |
| `user_api_key`        | ✅     | string | Clé API de l'utilisateur                                |
| `quest_slug`          | ✅     | string | Identifiant (slug) de la quête                          |
| `direction`           | ❌     | string | Type de match (défaut: "both")                          |
| `active_within_days`  | ❌     | number | Actifs dans les N derniers jours (défaut: 30, max: 365) |
| `min_parallel_quests` | ❌     | number | Nombre min de quêtes parallèles (défaut: 1, max: 20)    |
| `limit`               | ❌     | number | Nombre de résultats (défaut: 20, max: 50)               |
| `offset`              | ❌     | number | Décalage pour pagination (défaut: 0)                    |

#### Types

```javascript
/**
 * @typedef {Monster & { available: number, needed: number, covers_need: boolean }} Wanted
 * @property {number} available - Quantité disponible à l'échange
 * @property {number} needed - Quantité nécessaire
 * @property {boolean} covers_need - Si l'offre couvre entièrement le besoin
 *
 * @typedef {object} Match
 * @property {Search} user - Utilisateur correspondant
 * @property {object} quest - Quête du partenaire
 * @property {string} quest.slug - Identifiant de la quête
 * @property {string} quest.character_name - Nom du personnage
 * @property {number} quest.parallel_quests - Nombre de quêtes parallèles
 * @property {object} matches - Monstres en commun
 * @property {Array<Wanted>} matches.they_have_you_want - Ils ont, vous cherchez
 * @property {Array<Wanted>} matches.you_have_they_want - Vous avez, ils cherchent
 * @property {number} match_score - Score de compatibilité (total de monstres en commun)
 */
```

#### Exemples

**Trouver tous les partenaires**

```javascript
const response = await client.matchUserQuest("jean_api_key", "abcdef");

if (response.ok) {
  console.log(`${response.pagination.total} partenaires trouvés`);

  response.data.forEach((match) => {
    console.log(`\n${match.user.username} (${match.quest.character_name})`);
    console.log(`Score: ${match.match_score} monstres en commun`);
    console.log(`Ils ont: ${match.matches.they_have_you_want.length}`);
    console.log(`Ils cherchent: ${match.matches.you_have_they_want.length}`);
  });
}
```

**Trouver des fournisseurs**

```javascript
// Utilisateurs proposant des monstres que vous recherchez
const response = await client.matchUserQuest("jean_api_key", "abcdef", {
  direction: "they_have",
});

if (response.ok) {
  response.data.forEach((match) => {
    console.log(`\n${match.user.username} peut vous fournir:`);
    match.matches.they_have_you_want.forEach((m) => {
      console.log(`- ${m.name.fr} x${m.available} ${m.covers_need ? "✓" : ""}`);
    });
  });
}
```

**Filtrer les joueurs actifs**

```javascript
// Utilisateurs actifs dans les 7 derniers jours avec au moins 3 quêtes parallèles
const response = await client.matchUserQuest("jean_api_key", "abcdef", {
  active_within_days: 7,
  min_parallel_quests: 3,
});

if (response.ok) {
  console.log(`${response.data.length} joueurs actifs trouvés`);
}
```

---

### Modifier les paramètres d'une quête utilisateur

Met à jour la configuration d'une quête (personnage, progression, paramètres d'échange).

#### Signature

```javascript
updateUserQuest(
  user_api_key: string,
  quest_slug: string,
  options: {
    character_name?: string,
    parallel_quests?: number,
    current_step?: number,
    show_trades?: boolean,
    trade_mode?: number,
    trade_offer_threshold?: number | null,
    trade_want_threshold?: number | null,
    never_offer_normal?: boolean,
    never_want_normal?: boolean,
    never_offer_boss?: boolean,
    never_want_boss?: boolean,
    never_offer_archi?: boolean,
    never_want_archi?: boolean
  }
)
```

#### Paramètres

| Paramètre               | Type         | Description                                             |
| ----------------------- | ------------ | ------------------------------------------------------- |
| `character_name`        | string       | Nom du personnage (max 200 caractères)                  |
| `parallel_quests`       | number       | Nombre de quêtes en parallèle (1-20)                    |
| `current_step`          | number       | Étape courante (1-34)                                   |
| `show_trades`           | boolean      | Visibilité de la quête dans la communauté               |
| `trade_mode`            | number       | 0 = Automatique, 1 = Mode expert                        |
| `trade_offer_threshold` | number\|null | Seuil minimal pour proposer en mode expert (0-30)       |
| `trade_want_threshold`  | number\|null | Seuil maximal pour rechercher en mode expert (0-30)     |
| `never_offer_normal`    | boolean      | Ne jamais proposer les monstres normaux (étapes 1-16)   |
| `never_want_normal`     | boolean      | Ne jamais rechercher les monstres normaux (étapes 1-16) |
| `never_offer_boss`      | boolean      | Ne jamais proposer les boss (étapes 17-19)              |
| `never_want_boss`       | boolean      | Ne jamais rechercher les boss (étapes 17-19)            |
| `never_offer_archi`     | boolean      | Ne jamais proposer les archimonstres (étapes 20+)       |
| `never_want_archi`      | boolean      | Ne jamais rechercher les archimonstres (étapes 20+)     |

#### Exemples

**Mettre à jour les infos de base**

```javascript
const response = await client.updateUserQuest("jean_api_key", "abcdef", {
  character_name: "Mon personnage",
  parallel_quests: 5,
  current_step: 12,
  show_trades: true,
});

if (response.ok) {
  console.log("Quête mise à jour:", response.data);
}
```

**Configurer le mode expert**

```javascript
const response = await client.updateUserQuest("jean_api_key", "abcdef", {
  trade_mode: 1,
  trade_offer_threshold: 6, // Ne proposer que les monstres avec 6+ exemplaires
  trade_want_threshold: 1, // Rechercher jusqu'à l'étape 1
});

if (response.ok) {
  console.log("Mode expert configuré");
}
```

**Exclure certains types de monstres**

```javascript
const response = await client.updateUserQuest("jean_api_key", "abcdef", {
  never_offer_archi: true, // Ne jamais proposer d'archimonstres
  never_want_normal: true, // Ne pas rechercher les monstres normaux
});

if (response.ok) {
  console.log("Filtres appliqués");
}
```

---

### Modifier plusieurs monstres d'une quête utilisateur

Met à jour les quantités possédées pour plusieurs monstres en une seule requête.

#### Signature

```javascript
updateUserQuestMonsters(
  user_api_key: string,
  quest_slug: string,
  monsters: Array<{ monster_name: MonsterName, quantity: number }>
)
```

#### Paramètres

| Paramètre      | Requis | Type   | Description                             |
| -------------- | ------ | ------ | --------------------------------------- |
| `user_api_key` | ✅     | string | Clé API de l'utilisateur                |
| `quest_slug`   | ✅     | string | Identifiant (slug) de la quête          |
| `monsters`     | ✅     | Array  | Liste des monstres à modifier (max 200) |

#### Contraintes

- `quantity` : entre 0 et 30
- Maximum 200 monstres par requête

#### Types

```javascript
/**
 * @typedef {object} UpdatedMonsters
 * @property {number} updated_count - Nombre de monstres mis à jour
 * @property {Array<Monster>} monsters - Monstres mis à jour avec leurs nouvelles valeurs
 */
```

#### Exemples

**Mettre à jour plusieurs monstres**

```javascript
const response = await client.updateUserQuestMonsters(
  "jean_api_key",
  "abcdef",
  [
    { monster_name: "Aboub", quantity: 5 },
    { monster_name: "Bouftou", quantity: 3 },
    { monster_name: "Tofu", quantity: 10 },
  ],
);

if (response.ok) {
  console.log(`${response.data.updated_count} monstres mis à jour`);
  response.data.monsters.forEach((m) => {
    console.log(`${m.name.fr}: ${m.quantity} possédés`);
  });
}
```

**Réinitialiser des quantités**

```javascript
const response = await client.updateUserQuestMonsters(
  "jean_api_key",
  "abcdef",
  [
    { monster_name: "Aboub", quantity: 0 },
    { monster_name: "Bouftou", quantity: 0 },
  ],
);

if (response.ok) {
  console.log("Quantités réinitialisées");
}
```

---

### Paramètres de trade manuels d'une quête utilisateur

Force les quantités proposées/recherchées pour un monstre spécifique, remplaçant le calcul automatique.

#### Signature

```javascript
updateUserQuestMonsterTrade(
  user_api_key: string,
  quest_slug: string,
  monster_name: MonsterName,
  options: {
    trade_offer?: number | null,
    trade_want?: number | null
  }
)
```

#### Paramètres

| Paramètre      | Requis | Type         | Description                                                |
| -------------- | ------ | ------------ | ---------------------------------------------------------- |
| `user_api_key` | ✅     | string       | Clé API de l'utilisateur                                   |
| `quest_slug`   | ✅     | string       | Identifiant (slug) de la quête                             |
| `monster_name` | ✅     | MonsterName  | Nom du monstre                                             |
| `trade_offer`  | ❌     | number\|null | Quantité à proposer (0 à owned). null = calcul automatique |
| `trade_want`   | ❌     | number\|null | Quantité recherchée (0 à 30). null = calcul automatique    |

#### Exemples

**Forcer les quantités d'échange**

```javascript
const response = await client.updateUserQuestMonsterTrade(
  "jean_api_key",
  "abcdef",
  "Aboub",
  {
    trade_offer: 1, // Proposer 1 Aboub
    trade_want: 5, // Rechercher 5 Aboub
  },
);

if (response.ok) {
  console.log(`${response.data.name.fr}:`);
  console.log(`- Proposé: ${response.data.trade_offer}`);
  console.log(`- Recherché: ${response.data.trade_want}`);
}
```

**Réactiver le calcul automatique**

```javascript
const response = await client.updateUserQuestMonsterTrade(
  "jean_api_key",
  "abcdef",
  "Aboub",
  {
    trade_offer: null, // Calcul automatique
    trade_want: null, // Calcul automatique
  },
);

if (response.ok) {
  console.log("Calcul automatique réactivé pour Aboub");
}
```

**Mode hybride**

```javascript
// Proposer automatiquement, mais rechercher manuellement
const response = await client.updateUserQuestMonsterTrade(
  "jean_api_key",
  "abcdef",
  "Bouftou",
  {
    trade_offer: null, // Auto
    trade_want: 2, // Fixe à 2
  },
);
```

<br>

## 🔗 Ressources

- 🌐 [Site Metamob](https://beta.metamob.fr)
- 📖 [Documentation API Officielle](https://beta.metamob.fr/help/api)
- 📦 [Package NPM](https://www.npmjs.com/package/@ix-xs/metamob.api)
- 🔧 [GitHub Repository](https://github.com/ix-xs/metamob.api)
- 💬 [Discord Metamob](https://discord.gg/SadWCNf2pk)

## 🐛 Signaler un bug

Avez-vous trouvé un bug ? Créez une issue sur GitHub :

👉 [GitHub Issues](https://github.com/ix-xs/metamob.api/issues)

## 👨‍💼 Auteur

![ix-xs](https://cdn.discordapp.com/avatars/782307250751406091/a_3f71f1ac5e1664038fdf33c2c408482e.gif?size=48) **ix-xs**

---

<div align="center">

**Fait avec ❤️ pour la communauté Dofus**

⭐ N'oubliez pas de mettre une star si ce projet vous a aidé !

[GitHub](https://github.com/ix-xs/metamob.api) • [NPM](https://www.npmjs.com/package/@ix-xs/metamob.api) • [Site Metamob](https://beta.metamob.fr)

</div>
