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

## 🔗 Ressources

- 🌐 [Site Metamob](https://beta.metamob.fr)
- 📖 [Documentation API Officielle](https://beta.metamob.fr/help/api)
- 📦 [Package NPM](https://www.npmjs.com/package/@ix-xs/metamob.api)
- 🔧 [GitHub Repository](https://github.com/ix-xs/metamob.api)
- 💬 [Discord Community](https://discord.gg/SadWCNf2pk)

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
