const nodeComfort = require("@ix-xs/node-comfort");
const base = "https://beta.metamob.fr/api/v1";
const cache = require("./.cache/$");

function convertIds(data) {
	if (nodeComfort.isArray(data)) {
		return data.map(convertIds);
	}
	if (nodeComfort.isObject(data)) {
		const result = {};

		for (const key in data) {
			if (key === "id" && nodeComfort.isString(data[key])) {
				result[key] = Number(data[key]);
			} else {
				result[key] = convertIds(data[key]);
			}
		}

		return result;
	}

	return data;
}
function gameByName(game_name) {
	return cache.gameVersions.find(
		(g) => g.name.toLowerCase() === game_name.toLowerCase(),
	);
}
function serverByName(server_name) {
	return cache.servers.find(
		(s) => s.name.toLowerCase() === server_name.toLowerCase(),
	);
}
function monsterTypeByName(type_name) {
	return cache.monsterTypes.find(
		(t) =>
			t.name.en.toLowerCase() === type_name.toLowerCase() ||
			t.name.es.toLowerCase() === type_name.toLowerCase() ||
			t.name.fr.toLowerCase() === type_name.toLowerCase(),
	);
}
function monsterByName(monster_name) {
	return cache.monsters.find(
		(m) =>
			m.name.en.toLowerCase() === monster_name.toLowerCase() ||
			m.name.es.toLowerCase() === monster_name.toLowerCase() ||
			m.name.fr.toLowerCase() === monster_name.toLowerCase(),
	);
}

/**
 * **@ix-xs/metamob.api**
 *
 * L'[API Metamob](https://beta.metamob.fr/help/api) vous permet d'accéder à vos données de manière programmatique. Vous pouvez l'utiliser pour créer des outils personnalisés, des bots Discord, ou intégrer Metamob à d'autres applications.
 * ___
 * ## 🔐 Créer une clé API
 * 1. Connectez-vous à votre compte
 * 2. Accédez aux Paramètres
 * 3. Dans la section Clé API, cliquez sur Générer une clé
 * 4. Copiez et conservez précieusement votre clé (elle ne sera plus affichée)
 * ___
 * ## ⚙ Limites d'utilisation
 * Pour garantir la disponibilité du service, l'API est soumise à des limites :
 * * 60 requêtes par minute par clé API
 * * Les requêtes au-delà de cette limite recevront une erreur 429 Too Many Requests
 * * L'en-tête Retry-After indique le temps d'attente avant de pouvoir refaire une requête
 * ___
 * ## 📦 Structure de réponse
 * Toutes les requêtes renvoient un objet JSON normalisé :
 * ```js
 * {
 *   ok: boolean,                // Indique si la requête a réussi
 *   status: number,             // Code HTTP (ex: 200, 404, 429)
 *   statusText: string,         // Libellé du statut HTTP
 *   retryAfter?: number,        // Présent uniquement si status = 429
 *   error?: string,	      // Présent si une erreur se produit lors de la récupération des données
 *   data?: Object|Object[],     // Contenu retourné (absent si ok = false)
 *   pagination?: {	      // Informations de pagination (si applicables)
 * 		total: number,			 // Nombre total d’éléments correspondants
 * 		limit: number,			 // Nombre d’éléments renvoyés dans cette page
 * 		offset: number,			 // Index du premier élément dans cette page
 * 	 },
 * }
 * ```
 * ___
 * ## Données en cache (Disk)
 * Ce package intègre un **cache de données statiques** sous forme de fichiers JSON embarqués dans le module. Ces données correspondent à des informations qui changent rarement côté Metamob (par exemple listes de serveurs, types d’objets, etc.).
 * ### Avantages du cache :
 * * **Réduit les requêtes API** : Les données quasi-statiques sont disponibles immédiatement sans appel API
 * * **Améliore les performances** : Recherche par nom directe sans passer par l'API
 * * **Conversion ID ↔ Nom** : Permet de convertir les identifiants numériques en noms lisibles
 * 
 * ✏️ Exemple : Au lieu de faire `GET /monsters/123`, vous pouvez rechercher `getMonsters({ monster_name: "Arakne" })` 
 * Le cache convertit automatiquement le nom en ID pour l'appel API  
 * 
 * Cela facilite grandement la gestion et rend les requêtes plus intuitives  
 * 
 * Vous pouvez aussi inverser : récupérer le nom à partir d'un ID via le cache

### Données disponibles en cache :
* * `gameVersions` - Versions du jeu disponibles (Dofus Unity, Retro, Touch)  
* * `servers` - Liste complète des serveurs par communauté  
* * `monsterTypes` - Types de monstres (monstre, archimonstre, boss...)  
* * `monsters` - Catalogue complet des monstres avec noms multilingues

### Mise à jour du cache :
* Les données sont stockées localement dans des fichiers JSON, chargés au démarrage du module
* Le cache n'est **pas mis à jour automatiquement** depuis l'API
* Les mises à jour du cache sont gérées via des **nouvelles versions du package**, publiées régulièrement pour refléter les changements côté Metamob
 * ___
 * Exemple d'utilisation :
 * ```js
 * const metamobAPI = require("@ix-xs/metamob.api");
 * const client = new metamobAPI("MA_CLÉ_API");
 *
 * const response = await client.getServers();
 *
 * if (!response.ok) {
 * 	return console.error(response.retryAfter ?? response.error ?? response.statusText);
 * }
 * else {
 * 	console.log(response.data);
 * }
 * ```
 * ___
 * @module @ix-xs/metamob.api
 * @author ix-xs
 * @see {@link https://beta.metamob.fr/help/api Metamob API Documentation}
 */

module.exports = class MetamobAPI {
	#api_key;

	/**
	 * @param {string} api_key - Votre clé API
	 */
	constructor(api_key) {
		if (!api_key || !nodeComfort.isString(api_key)) {
			throw new Error(`\`api_key\` parameter must be a string`);
		}

		this.#api_key = api_key;
	}

	/**
	 * ### Versions du jeu

	 * @typedef {"Dofus (Unity)"|"Dofus Retro (1.29)"|"Dofus Touch"} GameName

	 * @typedef {object} GameVersion
	 * @property {number} id
	 * @property {GameName} name

	 * @param {object} [options]
	 * @param {GameName} [options.game_name]

	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<GameVersion>|GameVersion,
	 * }>}

	 * @example
	 * getGameVersions(); // Liste toutes les versions du jeu (Array)
	 * getGameVersions({ game_name: "Dofus (Unity)" }); // Détails d'une version spécifique (Object)
	 */
	async getGameVersions(options) {
		let path = `${base}/game-versions`;

		if (options?.game_name) {
			const game = gameByName(options.game_name);

			if (!game) {
				throw new Error(`game_name '${options.game_name}' doesn't exist`);
			}

			path += `/${game.id}`;
		}

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Serveurs

	 * @typedef {"Brial"|"Rafal"|"Salar"|"Kourial"|"Dakal"|"Mikhal"|"Imagiro"|"Hell Mina"|"Tylezia"|"Orukam"|"Tal Kasha"|"Draconiros"|"Ombre"|"Fallanster"|"Boune"|"Allisteria"|"Blair"|"Kelerog"|"Talok"|"Tiliwan"} ServerName

	 * @typedef {"World"|"France"} ServerCommunity

	 * @typedef {object} Server
	 * @property {number} id
	 * @property {ServerName} name
	 * @property {ServerCommunity} community
	 * @property {GameVersion} game_version

	 * @param {object} [options]
	 * @param {ServerName} [options.server_name]

	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<Server>|Server,
	 * }>}

	 * @example
	 * getServers(); // Liste tous les serveurs (Array)
	 * getServers({ server_name: "Brial" }); // Détails d'un serveur spécifique (Object)
	 */
	async getServers(options) {
		let path = `${base}/servers`;

		if (options?.server_name) {
			const server = serverByName(options.server_name);

			if (!server) {
				throw new Error(`server_name '${options.server_name}' doesn't exists`);
			}

			path += `/${server.id}`;
		}

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Types de monstres

	 * @typedef {"monstre"|"monster"|"monstruo"|"archimonstre"|"archmonster"|"archimonstruo"|"boss"} MonsterTypeName

	 * @typedef {object} MonsterType
	 * @property {number} id
	 * @property {Record<"fr"|"en"|"es", MonsterTypeName>} name

	 * @param {object} [options]
	 * @param {MonsterTypeName} [options.type_name]

	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<MonsterType>|MonsterType,
	 * }>}

	 * @example
	 * getMonsterTypes(); // Liste tous les types de monstres (Array)
	 * getMonsterTypes({ type_name: "monstre" }); // Détails d'un type spécifique (Object)
	 */
	async getMonsterTypes(options) {
		let path = `${base}/monster-types`;

		if (options?.type_name) {
			const monsterType = monsterTypeByName(options.type_name);

			if (!monsterType) {
				throw new Error(`type_name '${options.type_name}' doesn't exist`);
			}

			path += `/${monsterType.id}`;
		}

		let result = {
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * @typedef {"Aboub"|"Aboub"|"Abub"|"Aboudbra le Porteur"|"Abounteous the Generous"|"Abubanero el Naranja"|"Abrakadnuzar"|"Treeknidylus"|"Abrákneo el Elegido"|"Abrakanette l'Encapsulé"|"Treekonk the Stunned"|"Abrakeponerse el Optimista"|"Abrakildas le Vénérable"|"Treektamak the Loud"|"Abrakadabra el Pata de Kabra"|"Abrakine le Sombre"|"Treekness the Dark"|"Abrajinieves el Enanito"|"Abraklette le Fondant"|"Treekalack the Sad"|"Ábrakin el Oscuro"|"Abrakleur Clair"|"Light Treeckler"|"Abrajidor claro"|"Abrakleur Sombre"|"Dark Treeckler"|"Abrajidor oscuro"|"Abrakne"|"Treechnee"|"Abrakno"|"Abrakne Sombre"|"Dark Treechnee"|"Abrakno oscuro"|"Abraknyde"|"Treechnid"|"Abráknido"|"Abraknyde Ancestral"|"Ancestral Treechnid"|"Abráknido Ancestral"|"Abraknyde Sombre"|"Dark Treechnid"|"Abráknido oscuro"|"Abraknyde Vénérable"|"Venerable Treechnid"|"Abráknido venerable"|"Abrakroc l'édenté"|"Treekniddioo the Needy"|"Abrakíledo el Patas Ligeras"|"Abrinos le Clair"|"Treekstalbal the Psychic"|"Abroesidor el Navegante"|"Aerohouctor le guerrier"|"Aeroktor the Warrior"|"Aerohuctor, el Guerrero"|"Aerotrugobur le Malveillant"|"Aerogoburius the Malicious"|"Aerotrugobur, el Malvado"|"Akaka le Souillé"|"Akakaka the Dirty"|"Kakai el Ensuciado"|"Akakwa"|"Akakwa"|"Kuakai"|"Alhoui le Répondeur"|"Aftathabeep the Answerphone"|"Alhienado el Enajenado"|"Alhyène"|"Alyeena"|"Alhiena"|"Ameur la Laide"|"Amlullabeye the Dreamer"|"Amlobdovar el Movidista"|"Amlub"|"Amlub"|"Amlub"|"Aquabralak le guerrier"|"Aquabralak the Warrior"|"Aquabralak, el Guerrero"|"Aqualikros l'impitoyable"|"Aqualikros the Merciless"|"Aqualikros, el Despiadado"|"Arabord la Cruche"|"Arachma the Greek"|"Araklas Mausus el Encofiado"|"Arachitik la Souffreteuse"|"Arachnangel the Hopeful"|"Arkandinska la Lírica"|"Arakazam la Psychique"|"Arakazam the Psychic"|"Arakazam la Psíquica"|"Arakmutée"|"Arachmutated"|"Arakmutada"|"Araknawa"|"Araknawa"|"Araknawa"|"Araknay la Galopante"|"Arachnekros the Aggressive"|"Araknekros el Salvaje"|"Arakne"|"Arachnee"|"Arakna"|"Arakne Agressive"|"Aggressive Arachnee"|"Arakna Agresiva"|"Arakne des Égouts"|"Sewer Arachnee"|"Arakna de alcantarilla"|"Arakne Majeure"|"Major Arachnee"|"Arakna mayor"|"Arakne Malade"|"Sick Arachnee"|"Arakna enferma"|"Arakozette l'Intrépide"|"Arachnawar the Killinmachin"|"Araknosia el Olvidadizo"|"Arakule la Revancharde"|"Arakula the Carpature"|"Arakniry la Destripada"|"Arapex"|"Daddy Longlex"|"Arápex"|"Arapliké la Calligraphe"|"Arachiro the Calligrapher"|"Arafernalia la Calígrafa"|"Bakaglace le Congelé"|"Bakazicle the Icicle"|"Bakazhielo el Congelado"|"Bakazako"|"Bakazako"|"Bakazako"|"Bambono le Divin"|"Bambono the Holy"|"Bambono el Divino"|"Bambouské le Camouflé"|"Bambottinit the Quiet"|"Bambudín el Azteca"|"Bambouto"|"Bambooto"|"Bambuto"|"Bambouto Sacré"|"Holy Bambooto"|"Bambuto Sagrado"|"Bandapar l'Exclu"|"Bandirty the Messy"|"Banrí Mantís el Pigmentado"|"Bandit du clan des Roublards"|"Rogue Clan Bandit"|"Bandido del clan de los tymadores"|"Bandit Manchot"|"One-Armed Bandit"|"Bandido manco"|"Bandson le Tonitruant"|"Bandinamit the Explosive"|"Bandiras el zorro del clan Los Malagueños"|"Barbroussa"|"Barbrossa"|"Barbrusa"|"Barchwork le Multicolore"|"Blorko the Colourful"|"Barchwork el Multicolor"|"Barebourd le Comte"|"Barbrosskam the Chief"|"Barbrétzel el Salado"|"Bebetto l'Intellectuel"|"Bakaka the Intellectual"|"Kuapánfilo el Intelectual"|"Berger Porkass"|"Lousy Pig Shepherd"|"Pastor puerkazo"|"Betto"|"Baka"|"Kuapatán"|"Bi le Partageur"|"Biblokajin the Bald"|"Biblidiana la Controvertida"|"Biblop Coco"|"Coco Biblop"|"Biblop coco"|"Biblop Griotte"|"Morello Cherry Biblop"|"Biblop guinda"|"Biblop Indigo"|"Indigo Biblop"|"Biblop índigo"|"Biblop Reinette"|"Pippin Biblop"|"Biblop reineta"|"Bigbadaboum l'Élémentaire"|"Bigbadabooum the Elementary"|"Grambadabum el Elemental"|"Bilvoezé le Bonimenteur"|"Biblopopo the Organiser"|"Bibolsón el Anilloso"|"Bistou le Quêteur"|"Billbiblop the Great"|"Biblues el Ritmo"|"Bistou le Rieur"|"Bibloponey the Entertainer"|"Biblópera el Fantasma"|"Bitouf Aérien"|"Air Pikoko"|"Tufo aéreo"|"Bitouf des Plaines"|"Plain Pikoko"|"Tufo de las llanuras"|"Bitouf Sombre"|"Dark Pikoko"|"Tufo oscuro"|"Bitoven le Musicien"|"Pikhoven the Deaf"|"Tofofo el Blandito"|"Bizarbwork"|"Weirbwork"|"Eztrambwork"|"Black Tiwabbit"|"Black Tiwabbit"|"Black pekewabbit"|"Black Wabbit"|"Black Wabbit"|"Black wabbit"|"Blof l'Apathique"|"Blopal the Precious"|"Bloppy Reinarker la Primera Mitad"|"Blop Coco"|"Coco Blop"|"Blop coco"|"Blop Coco Royal"|"Royal Coco Blop"|"Blop Coco Real"|"Blop Griotte"|"Morello Cherry Blop"|"Blop guinda"|"Blop Griotte Royal"|"Royal Morello Cherry Blop"|"Blop Guinda Real"|"Blop Indigo"|"Indigo Blop"|"Blop índigo"|"Blop Indigo Royal"|"Royal Indigo Blop"|"Blop Índigo Real"|"Blop Multicolore Royal"|"Royal Rainbow Blop"|"Blop Multicolor Real"|"Blop Reinette"|"Pippin Blop"|"Blop reineta"|"Blop Reinette Royal"|"Royal Pippin Blop"|"Blop Reineta Real"|"Bloporte le Veule"|"Blopium the Delirious"|"Blop Inocho el Narizotas"|"Blordur l'Infect"|"Blorchid the Gorgeous"|"Blop Dylan el Ventoso"|"Blorie l'Assourdissante"|"Blopulent the Pretentious"|"Blómperman el Explosivo"|"Bonpake le Chavireur"|"Ishigood Pak the Mover"|"Paketeru el Impresionante"|"Boo"|"Mushd"|"Boo"|"Boomba"|"Boomba"|"Boomba"|"Boombata le Garde"|"Boombora the Dangerous"|"Doomba el Inimitable"|"Boostif l'Affamé"|"Mushdrill the Piercer"|"Bo'Callaghan el Trebol"|"Boudalf le Blanc"|"Gobbach the Contrapuntaler"|"Jalatintin el Reportero"|"Boudur le Raide"|"Bakeraider the Tomb"|"Paelladero Oscuro el Arrozoso"|"Boufdégou le Refoulant"|"Gobballad the Romantic"|"Jaleté el Extraterrestre"|"Bouflet le Puéril"|"Gobbalky the Stubborn"|"Jalatillo el Infantil"|"Boufton Blanc"|"White Gobbly"|"Jalatín blanco"|"Boufton Noir"|"Black Gobbly"|"Jalatín negro"|"Bouftou"|"Gobball"|"Jalató"|"Boulanger Sombre"|"Dark Baker"|"Panadero oscuro"|"Boulgourvil le Lointain"|"Gobballyhoo the Noisy"|"Jalatintanic el Hundido"|"Bouliver le Géant"|"Mopidyk the Mire"|"Lodontólogo el Sonriente"|"Boumbardier"|"Boombardier"|"Bumbardero"|"Bourbassingue"|"Miremop"|"Lodostropajo"|"Bourdard"|"Beaztinga"|"Zumbobo"|"Bourde le Maladroit"|"Blunder the Clumsy"|"Patón el Metido"|"Bourdilleu le Social"|"Buzzby the Social"|"Zumburdieu el Social"|"Braconnier"|"Poacher"|"Cazador de contrabando"|"Bramin le Bicéphale"|"Pocher the Kingponger"|"Cazafrán el Colorante"|"Brouste l'Humiliant"|"Floratio the Investigator"|"Esquenosé el Indeciso"|"Brouture"|"Rotaflor"|"Esquejika"|"Bulbambou"|"Bulbamboo"|"Bulbambú"|"Bulbiflore"|"Bulbiflor"|"Bulbiflor"|"Bulbig"|"Bulbig"|"Bulbig"|"Bulbuisson"|"Bulbush"|"Bulbomatorral"|"Buldeflore le Pénétrant"|"Bulbisonic the Penetrating"|"Bulbiftericia la Amarillenta"|"Bulgig le Danseur"|"Bulbigroov the Dancer"|"Bulbii la Creadora"|"Bulleur le Dormeur"|"Bulbamoon the Trumpeter"|"Buldamort el Serpiente"|"Bulsavon le Gonflé"|"Bulbushisu the Makisan"|"Bulbubunet la Única"|"Bwork"|"Bwork"|"Bwork"|"Bwork Archer"|"Bwork Archer"|"Bwork arquero"|"Bwork Mage"|"Bwork Magus"|"Bwork mago"|"Bworkasse le Dégoutant"|"Bworak the Bohemian"|"Bwarkgner el Magnificentista"|"Bworker"|"Bworker"|"Bworker"|"Bworkette"|"Bworkette"|"Bworka"|"Bwormage le Respectueux"|"Bworkoder the Mazter"|"Bwhork Mageneration el Precursor"|"Caboume l'Artilleur"|"Ganon the Dwarf"|"Cañón Dorzuelo el Doloroso"|"Canondorf"|"Cannon Dorf"|"Cañón dorf"|"Cavalier Porkass"|"Lousy Pig Knight"|"Caballero puerkazo"|"Cavordemal le Sorcier"|"Pygknightlion the Lousy"|"Caballagami Pueryukazo el Aburrido"|"Chafalfer l'Optimiste"|"Chafaldrag the Charming"|"Chafo el del Ocho"|"Chafemal le Bagarreur"|"Chaferanho the Essential"|"Cháferlie el Ángeles"|"Chafer"|"Chafer"|"Chafer"|"Chafer Archer"|"Chafer Archer"|"Chafer arquero"|"Chafer d'Élite"|"Elite Chafer"|"Chafer de élite"|"Chafer Draugr"|"Draugur Chafer"|"Chafer draugr"|"Chafer Fantassin"|"Chafer Foot Soldier"|"Chafer infante"|"Chafer Invisible"|"Invisible Chafer"|"Chafer invisible"|"Chafer Lancier"|"Chafer Lancer"|"Chafer lancero"|"Chaffoin le Sournois"|"Chafred the Fish"|"Chafíner Divarrio el Casposo"|"Chafmarcel le Fêtard"|"Chaferotix the Sixtininth"|"Chaferditos los Tres"|"Chafrit le Barbare"|"Chaferuption the Volcanic"|"Chafernan D'alonzo el Nano"|"Chalan le Commerçant"|"Chafermented the Drinker"|"Chagüer Langers los Coloridos"|"Chamane d'Egoutant"|"Grossewer Shaman"|"Chamán de Alcantarilla"|"Chamchie le Difficile"|"Matmushmush the Flasher"|"Champi Casso el Cúbico"|"Chamdblé le Cultivé"|"Spimushuaia the Traveller"|"Champán el Espumoso"|"Chamflay le Ballonné"|"Speedmush the Racer"|"Champlin el Cómico"|"Chamilero le Malchanceux"|"Nidsally the Mushtang"|"Champacné el Granitos"|"Chamitant le Dillettante"|"Shamassel the Off"|"Chamadkasas, las Desesperadas"|"Chamoute le Duveteux"|"Edvushmunch the Screamer"|"Champli el Sonoro"|"Champ à Gnons"|"Mush Rhume"|"Seta peleona"|"Champ Champ"|"Mush Mush"|"Champi champ"|"Champa Bleu"|"Blue Spimush"|"Champo azul"|"Champa Marron"|"Brown Spimush"|"Champo marrón"|"Champa Rouge"|"Red Spimush"|"Champo rojo"|"Champa Vert"|"Green Spimush"|"Champo verde"|"Champaknyde"|"Mushnid"|"Champáknido"|"Champayr le Disjoncté"|"Spimushtache the Hairy"|"Champolís el Astronauta"|"Champayt l'Odorant"|"Spimushty the Smelly"|"Champlomo el Soldadito"|"Champbis"|"Mush Tup"|"Champbis"|"Champmane"|"Mush Mish"|"Setador"|"Champmé le Méchant"|"Mushketeer the Loyal"|"Setal Slugdor el Exterminador"|"Champodonte"|"Mushmunch"|"Champidonte"|"Champolyon le Polyglotte"|"Mushuliet the Catapulet"|"Setsa'n Desiti la Amistosa"|"Champoul l'Illuminé"|"Romush the Montecchi"|"Chalbis el King"|"Chef Crocodaille"|"Crocodyl Chief"|"Jefe cocodrail"|"Chef de Guerre Bouftou"|"Gobball War Chief"|"Jefe de guerra jalató"|"Chêne Mou"|"Soft Oak"|"Roble Blando"|"Chevaucheur de Karne"|"Karne Rider"|"Cabalgador de Karne"|"Chevaucheur Koalak"|"Koalak Rider"|"Koalak cabalgador"|"Chevaustine le Reconstruit"|"Karnyona the Rider"|"Cabalista el Conspirador"|"Chiendanlémin l'Illusionniste"|"Warazpacho the Cherrilla"|"Merkxguerrita el Ogro"|"Chiendent"|"Warguerite"|"Marguerrita"|"Chonstip la Passagère"|"Pigoblet the Useful"|"Cochumájer el Rápido"|"Citassaté le Service"|"Jackellington the Lantewn"|"Calawino el Oriental"|"Citwouille"|"Pumpkwin"|"Calawaza"|"Cochon de Farle"|"Farle's Pig"|"Cerdo de Farle"|"Cochon de Lait"|"Piglet"|"Cochinillo"|"Codem"|"Codem"|"Codem"|"Codenlgaz le Problème"|"Codemonic the Mean"|"Codembolia el Obstructor"|"Cooleuvre"|"Grass Snake"|"Coolebra"|"Cooligane le Névrosé"|"Grasnakizanami the Ruler"|"Cooligan el Agresivo"|"Coquille Explosive"|"Explosive Shell"|"Cáscara Explosiva"|"Corailleur"|"Coralator"|"Coralador"|"Corailleur Magistral"|"Great Coralator"|"Coralador Magistral"|"Corbac"|"Crobak"|"Cuerbok"|"Corboyard l'Enigmatique"|"Kojaklator the Lollipoper"|"Cortazador el Inconformista"|"Corpat le Vampire"|"Crowmanion the Primitive"|"Cuergotismo el Febril"|"Crabe"|"Crab"|"Cangrejo"|"Crachefoux"|"Spitfoux"|"Escupefux"|"Crachefouxtre le Surpris"|"Spitfouxgolly the Surprised"|"Escupefistro el Torpedo"|"Crakmitaine le Faucheur"|"Jiminicrackler the Conscious"|"Crujaitor el Eurovisivo"|"Cramikaz le Suicidaire"|"Cracklerod the Old"|"Crujidilo Dundee el Australiano"|"Craqueboule"|"Crackrock"|"Crujibola"|"Craqueboule Poli"|"Polished Crackrock"|"Crujibola pulío"|"Craquecrac l'Endurant"|"Crickcrack the Crossfit"|"Cracrac el Resistente"|"Craqueleur"|"Crackler"|"Crujidor"|"Craqueleur des Plaines"|"Plain Crackler"|"Crujidor de las llanuras"|"Craqueleur Légendaire"|"Legendary Crackler"|"Crujidor Legendario"|"Craqueleur Poli"|"Polished Crackler"|"Crujidor pulío"|"Craquelourd"|"Cracklerge"|"Crujidolmen"|"Craquetou le Fissuré"|"Crackrodilrock the Helltune"|"Crujlieta la Veronesa"|"Craquetuss le Piquant"|"Crackrockisree the Tiger"|"Crojmeo el Veronés"|"Craraboss le Féérique"|"Krabaoly the Patient"|"Cangri-doo la Hadada"|"Crathdogue le Cruel"|"Crackedral the Majestic"|"Crujíbaro el Tzantza"|"Croc Gland"|"Whitish Fang"|"Colmillo blando"|"Croc Gland Enragé"|"Furious Whitish Fang"|"Colmillo blando rabioso"|"Crocabulia"|"Crocabulia"|"Cocabulia"|"Crocodaille"|"Crocodyl"|"Cocodrail"|"Crognan le Barbare"|"Lupisnockio the Woodwolf"|"Colmillazaqui, el Inagotable"|"Crognan le Barbare"|"Lupisnockio the Woodwolf"|"Colmillazaqui, el Inagotable"|"Crok le Beau"|"Crokdylann the Rebel"|"Jefe Cocolumbo el Detective"|"Crolnareff l'Exilé"|"Croccyx the Bummer"|"Cocodranel la perfumada"|"Cromikay le Néophyte"|"Snowhitisha the Pure"|"Colmillamoto el Omnipotente"|"Crowneille"|"Crovus"|"Crowrajo"|"Cruskof le Rustre"|"Crabaramis the One"|"Crustérix el Viajante"|"Crusmeyer le Pervers"|"Crabathos the For"|"Crusthórpal Passian el Submarino"|"Crustensyl le Pragmatique"|"Craborthos the All"|"Crustodralí el Bigotudo"|"Crustorail Kouraçao"|"Kurasso Craboral"|"Crustoral kuraçao"|"Crustorail Malibout"|"Mahlibuh Craboral"|"Crustoral malibut"|"Crustorail Morito"|"Mojeeto Craboral"|"Crustoral mohito"|"Crustorail Passaoh"|"Passaoh Craboral"|"Crustoral passaoh"|"Crustterus l'Organique"|"Crabartanian the Allforone"|"Crustoriyama el Boludo"|"Dardalaine"|"Venomica"|"Arapúas"|"Dardamel la Kidnappeuse"|"Gargamarak the Kidnapper"|"Dárdamel la Secuestradora"|"Dark Vlad"|"Dark Vlad"|"Dark Vlad"|"Déminoboule"|"Deminoball"|"Deminobola"|"Disciple Zoth"|"Zoth Disciple"|"Discípulo zoth"|"Diskord le Belliqueux"|"Ezothbeitor the Neighbour"|"Diszápulo Delzoih el Profeta"|"Dok Alako"|"Dok Alako"|"Dok alako"|"Doktopuss le Maléfique"|"Dokterwho the Tardisporter"|"DoK Ok el Gasterópodo"|"Don Dorgan"|"Dorgan Ation"|"Don dórgano"|"Don Duss Ang"|"Blodz Uker"|"Don dessangre"|"Don Kizoth l'Obstiné"|"Don Quizothe the Stubborn"|"Don Kizoth el Obstinado"|"Dragacé"|"Dragnnoyed"|"Draguirritado"|"Dragalgan l'Effervescent"|"Dragostino the Tiny"|"Dragosstinho, el Futboleiro"|"Dragdikal le Décisif"|"Dregguantico the Trainer"|"Drakójak el Piruletas"|"Drageaufol la Joyeuse"|"Dragossiper the Nag"|"Ledrag el Ognat"|"Dragioli le Succulent"|"Dragoskovit the Barefoot"|"Dragrogui el Ebrio"|"Dragioli le Succulent"|"Dragoskovit the Barefoot"|"Dragrogui, el Ebrio"|"Dragkouine la Déguisée"|"Dreggump the Shrimp"|"Dragkuín el Disfrazado"|"Draglida la Disparue"|"Dragotitis the Painful"|"Dragozart Almandreus el Prodigio"|"Dragma le Bouillant"|"Dreggooniz the Adventurous"|"Dragma, el Griego"|"Dragminster le Magicien"|"Dragorse the Wild"|"Dragoss&Dungeoss el Original"|"Dragmoclaiss le Fataliste"|"Dreggatón the Latino"|"Dragmocles el Fatalista"|"Dragnarok"|"Dragnarok"|"Dragnarok"|"Dragnostik le Sceptique"|"Dreggommomm the Chewer"|"Drajoanito el Rojo"|"Dragnoute l'Irascible"|"Drakokidoki the Volunteer"|"Dragamenón el Destructroyer"|"Dragobert le Monarque"|"Dragory the Violent"|"Dreghouse el Cínico"|"Dragodinde amande sauvage"|"Wild Almond Dragoturkey"|"Dragopavo almendrado salvaje"|"Dragodinde dorée sauvage"|"Wild Golden Dragoturkey"|"Dragopavo dorado salvaje"|"Dragodinde rousse sauvage"|"Wild Ginger Dragoturkey"|"Dragopavo pelirrojo salvaje"|"Dragoeth le Penseur"|"Dreggoog the Downunder"|"Drajorgito, el Verde"|"Dragoeuf Ardoise"|"Slate Dreggon"|"Dragohuevo pizarroso"|"Dragoeuf Argile"|"Clay Dreggon"|"Dragohuevo arcilloso"|"DragOeuf Blanc"|"White Dreggon"|"Dragohuevo Blanco"|"DragOeuf Blanc Éveillé"|"Alert White Dreggon"|"Dragohuevo Blanco Despierto"|"DragOeuf Blanc Immature"|"Immature White Dreggon"|"Dragohuevo Blanco Inmaduro"|"Dragoeuf Calcaire"|"Limestone Dreggon"|"Dragohuevo calizo"|"Dragoeuf Charbon"|"Coal Dreggon"|"Dragohuevo carbonoso"|"DragOeuf de Saphir"|"Sapphire Dreggon"|"Dragohuevo Zafiro"|"DragOeuf de Saphir Éveillé"|"Alert Sapphire Dreggon"|"Dragohuevo zafiro despierto"|"DragOeuf de Saphir Immature"|"Immature Sapphire Dreggon"|"Dragohuevo Zafiro Inmaduro"|"DragOeuf Doré"|"Golden Dreggon"|"Dragohuevo Dorado"|"DragOeuf Doré Éveillé"|"Alert Golden Dreggon"|"Dragohuevo dorado despierto"|"DragOeuf Doré Immature"|"Immature Golden Dreggon"|"Dragohuevo Dorado Inmaduro"|"Dragoeuf Guerrier"|"Dreggon Warrior"|"Dragohuevo guerrero"|"DragOeuf Noir"|"Black Dreggon"|"Dragohuevo Negro"|"DragOeuf Noir Éveillé"|"Alert Black Dreggon"|"Dragohuevo negro despierto"|"DragOeuf Noir Immature"|"Immature Black Dreggon"|"Dragohuevo Negro Inmaduro"|"Dragoeuf Volant"|"Flying Dreggon"|"Dragohuevo volador"|"Dragon Cochon"|"Dragon Pig"|"Dragocerdo"|"Dragonienne l'Econome"|"Dragangora the Softy"|"Mafaldragosa la Hermana Pequeña"|"Dragoo le Cramoisi"|"Dreggooliz the Macho"|"Drageagainst, el Máquina"|"Dragoss Ardoise"|"Slate Dragoss"|"Dragoss pizarroso"|"Dragoss Argile"|"Clay Dragoss"|"Dragoss arcilloso"|"Dragoss Blanc"|"White Dragoss"|"Dragoss Blanco"|"Dragoss Blanc Eveillé"|"Alert White Dragoss"|"Dragoss blanco despierto"|"Dragoss Calcaire"|"Limestone Dragoss"|"Dragoss calizo"|"Dragoss Charbon"|"Charcoal Dragoss"|"Dragoss carbonoso"|"Dragoss de Saphir"|"Sapphire Dragoss"|"Dragoss Zafiro"|"Dragoss de Saphir Eveillé"|"Alert Sapphire Dragoss"|"Dragoss zafiro despierto"|"Dragoss Doré"|"Golden Dragoss"|"Dragoss Dorado"|"Dragoss Doré Éveillé"|"Alert Golden Dragoss"|"Dragoss dorado despierto"|"Dragoss Noir"|"Black Dragoss"|"Dragoss Negro"|"Dragoss Noir Éveillé"|"Alert Black Dragoss"|"Dragoss negro despierto"|"Dragsta le Détendu"|"Dragoolash the Stewed"|"Drajoimito, el Azul"|"Dragstayr le Fonceur"|"Dragamemnon the Deadtroyer"|"Dreggeatón el Latino"|"Dragstik le Frustre"|"Dreggonzola the Cheesy"|"Drugmiente, la Bella"|"Dragstore le Généraliste"|"Drakween the Cross Dresser"|"Dragstor, el de la Esquina"|"Dragtarus le Bellâtre"|"Draigovsky the SocalledSwan"|"Dragoss To el Caluroso"|"Dragtonien le Malvoyant"|"Dreggrieg the Pianist"|"Draltóniko, el Ojo de Águila"|"Dragtopaile l'Excavateur"|"Dragaustin the Power"|"Dragump, el Oscarizado"|"Dragtula l'Ancien"|"Dreggershween the Tinpanalley"|"Drakaoly, la Violinista"|"Draguaindrop"|"Dragandrop"|"Dragandrop"|"Dragueuse"|"Dragostess"|"Dragosa"|"Dragybuss le Sucré"|"Dragospel the Black"|"Dragoss Pel, el Negro"|"Drakoalak"|"Drakoalak"|"Drakoalak"|"Drakolage le Tentateur"|"Drakoamax the Mad"|"Drakolakao el Sabroso"|"Draquetteur le Voleur"|"Draghouse the Cynical"|"Dragore el Sangriento"|"Ecorfé la Vive"|"Barkricrac the Unsteady"|"Dientetris el Inolvidable"|"Étoile de la Mer d'Asse"|"Starfish Trooper"|"Estrella del mar Rano"|"Étoilette la Bouchée"|"Stary the Strooper"|"Estroilette la Atascada"|"Fanburn le Viril"|"Tanuktonik the Doofdoof"|"Fantasmaik Táisunkui San el Pegador"|"Fandanleuil le Précis"|"Polterghaisk the Stray Soul"|"Fanthraks el Acomplejado"|"Fandouich l'Hautain"|"Tanukhuina the Drawer"|"Fanturo Pandez-Revértulo el Espadachín"|"Fanfancisco le Cosmopolite"|"Pandumonium the Joker"|"Fantasmeluze la Gentil"|"Fangshu"|"Fangshu"|"Fangshu"|"Fangshui la Dysorthographiée"|"Fangshui the Misspelled"|"Fangshui la Parónima"|"Fanhatur le Simple"|"TanuKiki the Deliveryghost"|"Fant-eagux el Germano"|"Fanhopruno le Gourmet"|"Satonuki the Plastikpaddy"|"Fantasmonroe el Deseo"|"Fanjipann le Sucré"|"Tanaked the Stalker"|"Fantasmator Soryonara el Baby"|"Fanjo le Pilote"|"Tanno the Dominator"|"Fredtásmer Tanukuín el Chanpion"|"Fanlabiz le Véloce"|"Aperobics the Dynamic"|"Fantasmarley el Rastafari"|"Fanlagoel le Comique"|"Miomaho the Siciliano"|"Fantasmarty Mac Flyrefux el Futurista"|"Fanlmyl l'Acuité"|"Pandoracle the Opposing Force"|"Fantasmily-Celly la Madre"|"Fansiss la Brêle"|"Tanukhiraru the Gifted"|"Fantasmanson el Familiar"|"Fansissla l'Âne"|"Leorio the Haunted"|"Fantaradona el Mágico"|"Fanstatik l'Etonnant"|"Pandipoopik the Wondrous"|"Fantarmantino el Visceral"|"Fantassein le Soldat"|"Yoksai the Spirited"|"Fantazmania el Diablo"|"Fantoch le Pantin"|"Arepotair the Bespectacled"|"Fantasma Arepopins la Niñera"|"Fantôme Apero"|"Apero Ghost"|"Fantasma de aperitubo"|"Fantôme Ardent"|"Burning Ghost"|"Fantasma ardiente"|"Fantôme Arepo"|"Arepo Ghost"|"Fantasma Arepo"|"Fantôme Aux Plates"|"Plated Ghost"|"Fantasma corazado"|"Fantôme Brave"|"Brave Ghost"|"Fantasma valiente"|"Fantôme Égérie"|"Ghost Ominjry"|"Fantasma nimado"|"Fantôme Hicide"|"Ghost Hicidal"|"Fantasma sesino"|"Fantôme Léopardo"|"Leopardo Ghost"|"Fantasma Leopardo"|"Fantôme Maho Firefoux"|"Maho Firefoux Ghost"|"Fantasma Maho Firefux"|"Fantôme Pandikaze"|"Pandikaze Ghost"|"Fantasma Pandikaze"|"Fantôme Pandore"|"Pandora Ghost"|"Fantasma Pandora"|"Fantôme Pandule"|"Pandulum Ghost"|"Fantasma Pandulo"|"Fantôme Soryo Firefoux"|"Soryo Firefoux Ghost"|"Fantasma Soryo Firefux"|"Fantôme Tanukouï San"|"Tanukouï San Ghost"|"Fantasma Tanukui San"|"Fantôme Yokai Firefoux"|"Yokai Firefoux Ghost"|"Fantasma Yokai Firefux"|"Fantrask la Rêveuse"|"Ghostabrava the Tourist"|"Fantastle Vániante la Matavampiros"|"Farlon l'Enfant"|"Pighatchoo the Electrical"|"Cerduodenitis el Abdominal"|"Fauchalak"|"Reapalak"|"Siegalak"|"Faufoll la Joyeuse"|"Ryukualak the Bored"|"Siegálaher los Chulos"|"Fécorce"|"Barkritter"|"Diente pe-león"|"Félygiène"|"Felygiene"|"Highiena"|"Félyssion la Gourmande"|"Felicity the Gormandiser"|"Highia la Golosa"|"Flammèche Air"|"Air Spark"|"Llamita aire"|"Flammèche Eau"|"Water Spark"|"Llamita agua"|"Flammèche Feu"|"Fire Spark"|"Llamita fuego"|"Flammèche Terre"|"Earth Spark"|"Llamita tierra"|"Floanna la Blonde"|"Floramodovar the Stoned"|"Florivera el Muralista"|"Floribonde"|"Floramor"|"Floribundo"|"Floriste la Cannibale"|"Floristil the Pistil"|"Florista la Caníbal"|"Floristile"|"Flowistil"|"Floristilo"|"Forboyar l'Enigmatique"|"Smitherz the Licker"|"Herranor el Pizzaiolo"|"Forgeron Sombre"|"Dark Smith"|"Herrero oscuro"|"Fossamoel le Juteux"|"Koalarchitect the Balancing Force"|"Sepaulturero Kleealak el Arquitecto"|"Fossoyeur Koalak"|"Koalak Gravedigger"|"Koalak sepulturero"|"Foufayteur"|"Foxfyter"|"Fuxfaigter"|"Fouflay le Retombé"|"Fouflay the Fallen"|"Fuflé el Definflado"|"Founamboul"|"Fouxnamballist"|"Funámbola"|"Fourapin le Chaud"|"Ambushapens the Unlucky"|"Mazomorra el Rolista"|"Fourbasse"|"Ambusher"|"Mazorral"|"Gamine Zoth"|"Zoth Girl"|"Chavala zoth"|"Gamino"|"Minokid"|"Minovillo"|"Gardienne des Égouts"|"Sewer Keeper"|"Guardiana de alcantarilla"|"Gargantua la Dévoreuse"|"Gargantua the Devourer"|"Gargantúa la Devoradora"|"Gargantûl"|"Gargantula"|"Gargántula"|"Gargrouille"|"Gargoyl"|"Gárgrola"|"Garsim le Mort"|"Gargoyla the Paranoiac"|"Pulgargrolito el Astuto"|"Gastroth la Contagieuse"|"Calipzoth the Icy"|"Chavala Zotaina la Castigadora"|"Gelanal le Huileux"|"Jellvis the King"|"Gelatiris el Arenero"|"Gelaviv le Glaçon"|"Jellyposukshion the Slim"|"Gelatina Turner la Best"|"Gelée Bleue"|"Blue Jelly"|"Gelatina Azul"|"Gelée Bleuet"|"Blueberry Jelly"|"Gelatina de Aciano"|"Gelée Fraise"|"Strawberry Jelly"|"Gelatina de fresa"|"Gelée Menthe"|"Mint Jelly"|"Gelatina de menta"|"Gelée Royale Bleue"|"Royal Blue Jelly"|"Gelatina Real Azul"|"Gelée Royale Bleuet"|"Royal Blueberry Jelly"|"Gelatina Real de Aciano"|"Gelée Royale Citron"|"Royal Lemon Jelly"|"Gelatina Real de Limón"|"Gelée Royale Fraise"|"Royal Strawberry Jelly"|"Gelatina Real de Fresa"|"Gelée Royale Menthe"|"Royal Mint Jelly"|"Gelatina Real de Menta"|"Geloliaine l'Aérien"|"Jelleno the Chinny"|"Gelazquina el Men"|"Germinol l'Indigent"|"Minoknok the Visitor"|"Minocontavan Konm'astuzia el Colorado"|"Gink"|"Gink"|"Gink"|"Ginsenk le Stimulant"|"Ginsync the Hyperactive"|"Gínsenk el Estimulante"|"Gloubibou le Gars"|"Greetdoff the Gentleman"|"Zampatávoro el Miliano"|"Gloutovore"|"Greedovore"|"Zampávoro"|"Gob-trotteur"|"Gob-Trotter"|"Gobletrotter"|"Gobelin"|"Goblin"|"Goblin"|"Gobet"|"Gobnoramus"|"Gobobo"|"Gobstiniais le Têtu"|"Goblimp the Bis Kit"|"Goyablín el Afrancesado"|"Gourlo le Terrible"|"Gourlo the Terrible"|"Gurlo el Terrible"|"Grand Pa Wabbit"|"Gwandpa Wabbit"|"Awelito wabbit"|"Grandilok le Clameur"|"Gwabbit the Wunner"|"Abustin Pawits el Bocasucia"|"Grenuche la Gentille"|"Ninnyfrog the Nice"|"Raninia la Buena"|"Grenufar"|"Nenufrog"|"Ranúfar"|"Grokosto le Bosco"|"Bignstrong the Quartermaster"|"Granfortote el Contramaestre"|"Guerrier Koalak"|"Koalak Warrior"|"Guerrero koalak"|"Guerrier Zoth"|"Zoth Warrior"|"Guerrero zoth"|"Guerrite le Veilleur"|"Chukoalak the Norris"|"Guerred-Fish el Cortés"|"Guerumoth le Collant"|"Zigzoth the Indecisive"|"Guerreynor Zothia la Superviviente"|"Hanshi"|"Hanshi"|"Hanshi"|"Haute Truche"|"Cross Strich"|"Thor Pestruz"|"Hell Mina"|"Hell Mina"|"Hell Mina"|"Ignelicrobur le Guerrier"|"Ignilicrobur the Warrior"|"Ignelicrobur, el Guerrero"|"Ignerkocropos l'Affamé"|"Ignirkocropos the Famished"|"Ignirkocropos, el Hambriento"|"Ino-Naru"|"Ino-Naru"|"Ino-naru"|"Inopenope le Négatif"|"Ino-Nope the Negative"|"Kenoikenó el Negativo"|"Ishigro Pake"|"Ishibig Pak"|"Mazaishi"|"Jiangshi-Nobi"|"Jiangshi-Nobi"|"Jiangshi-Nobi"|"Jiankor le Radoteur"|"Jianamble the Rambler"|"Samurrancyo el Senil"|"Kaenekfeu le volubile"|"Kaenekfire the Voluble"|"Kaenekfeu el Parlanchín"|"Kaeneko"|"Kaeneko"|"Kaeneko"|"Kanasukr le Mielleux"|"Kaniedoss the Giggling"|"Kánudalf el Kanoso"|"Kanibière l'Encordée"|"Kanabeer the Shaken"|"Kanubirra la Fuerte"|"Kaniblou"|"Kanazure"|"Kanublú"|"Kanigrou"|"Kaniger"|"Kanugro"|"Kannémik le Maigre"|"Kannemik the Skinny"|"Klaidíbola Cerbarrow la Otra Mitad"|"Kannibal le Lecteur"|"Kannimantha the Maneater"|"Kanníbal el Lector"|"Kanniboul Archer"|"Kanniball Archer"|"Kaníbola Arquero"|"Kanniboul Ark"|"Kanniballbo"|"Kaníbola arquero"|"Kanniboul Eth"|"Kanniball Thierry"|"Kaníbola Fipi"|"Kanniboul Jav"|"Kanniball Jav"|"Kaníbola jav"|"Kanniboul Sarbak"|"Kanniball Sarbak"|"Kaníbola cerbat"|"Kanniboul Thierry"|"Kanniball Thierry"|"Kaníbola Thierry"|"Kannisterik le Forcené"|"Kannarrie the Reckless"|"Kanibúlrich Lars el Metálico"|"Kaonashi"|"Kaonashi"|"Kaonashi"|"Kaonucléair l'Instable"|"Kaonuclear the Unstable"|"Kaonuclear el Inestable"|"Kapota la Fraise"|"Kanniranda the Maniac"|"Kanábolo el Rubio"|"Kaskapointhe la Couverte"|"Snailmetalika the Garagician"|"Kasrafantásol el Parapsicólogo"|"Kaskargo"|"Snailmet"|"Kasrakol"|"Kido"|"Kido"|"Kido"|"Kido l'Âtre"|"Kidodo the Extinct"|"Kidoloroso del Calmante"|"Kilibriss"|"Kilibriss"|"Kilibris"|"Kilimanj'haro le Grimpeur"|"Killua the Assassin"|"Kílibrill vol.2 el Vengativo"|"Kimbo"|"Kimbo"|"Kimbo"|"Kirevam"|"Kirevam"|"Kirevam"|"Kiroyal le Sirupeux"|"Kirevampiro the Wrestler"|"Kiravel el Artesano"|"Kitsou Nae"|"Kitsou Nae"|"Kitsu Nae"|"Kitsou Nakwa"|"Kitsou Nakw"|"Kitsu Nakwa"|"Kitsou Nere"|"Kitsou Nere"|"Kitsu Nere"|"Kitsou Nufeu"|"Kitsou Nufeu"|"Kitsu Fogoso"|"Kitsoudbra le Malodorant"|"Kitchy the Scratcher"|"Kitsa No el Violento"|"Kitsoufre l'Explosif"|"Kitsuey the Red"|"Kitsu Positoyo el Sanador"|"Kitsoupierre le Récipient"|"Kitsewey the Blue"|"Kitsiús el Estornudo"|"Kitsoupopulère le Généreux"|"Kitsouie the Green"|"Kitsean Cónere el Agente Secreto"|"Koakofrui le Confit"|"Koaly the Fiddler"|"Koalugok el Pato"|"Koalaboi le Calorifère"|"Koalsen the Similar"|"Koayak el Destripador"|"Koalak Coco"|"Coco Koalak"|"Koalak coco"|"Koalak Farouche"|"Wild Koalak"|"Koalak salvaje"|"Koalak Forestier"|"Koalak Forester"|"Koalak forestal"|"Koalak Griotte"|"Morello Cherry Koalak"|"Koalak guinda"|"Koalak Immature"|"Immature Koalak"|"Koalak inmaduro"|"Koalak Indigo"|"Indigo Koalak"|"Koalak índigo"|"Koalak Reinette"|"Pippin Koalak"|"Koalak reineta"|"Koalak Sanguin"|"Bloody Koalak"|"Koalak sanguíneo"|"Koalastrof la Naturelle"|"Koaldmen the Grumpy"|"Kokajín el Calvo"|"Koalvissie le Chauve"|"Koaldman the Garish"|"Koelloks el Cerealista"|"Koamaembair le Coulant"|"Jackoalak the Ripper"|"Koalalia el Mudo"|"Koamag'oel le Défiguré"|"Koelloggs the Creator"|"Botalak Cabalgator el Ingenioso"|"Koarmit la Batracienne"|"Snapoalak the Redhead"|"Koaluik el Pato"|"Koaskette la Chapelière"|"Crackoalak the Blonde"|"Koalako el Pato"|"Koasossyal le Psychopathe"|"Popoalak the Mousibrown"|"Koalúkyluk el Solitario"|"Koko la Violente"|"Komko the Vexatious"|"Kukumina la Violenta"|"Kokoko"|"Kokoko"|"Kokoko"|"Kokom"|"Kwakumber"|"Kukumi"|"Koktèle le Secoué"|"Misskokoko the Channel"|"Kokotel el Agitado"|"Kolérat"|"Kolerat"|"Kólerat"|"Kolforthe l'Indécollable"|"Koleraspootin the Anesthesialogist"|"Kolafuerte el Pegatodo"|"Koulosse"|"Koolich"|"Trankitronko"|"Krambwork"|"Burnabwork"|"Komanbwork"|"Kraméléhon"|"Khamelerost"|"Krameleón"|"Krapahut le Randonneur"|"Khameleltux the Tolerant"|"Kramelanoma el Ennegrecedor"|"Kurookin"|"Kurookin"|"Kurookin"|"Kwak de Flamme"|"Fire Kwak"|"Kwak de llamas"|"Kwak de Glace"|"Ice Kwak"|"Kwak de hielo"|"Kwak de Terre"|"Earth Kwak"|"Kwak de tierra"|"Kwak de Vent"|"Wind Kwak"|"Kwak de viento"|"Kwakamole l'Appétissant"|"Kwakamole the Appetising"|"Kwakamole el Apetitoso"|"Kwaké le Piraté"|"Kwaked the Pirated"|"Kwakeado el Pirateado"|"Kwakolak le Chocolaté"|"Kwadbury the Chocolaty"|"Kwakaolatt el Chocolateado"|"Kwakwatique le Trempé"|"Kwakwatic the Soaked"|"Kwakwático el Mojado"|"Kwoan"|"Kwoan"|"Kwoan"|"Kwoanneur le Frimeur"|"Kwoanium the Smart"|"Kwane el Ciudadano"|"La Ouassingue"|"Ouassingal"|"La stropajo"|"Larchimaide la Poussée"|"Larvadelaide the Ozie"|"Larvémming el Descerebrado"|"Larvaloeil l'Émue"|"Grubby the Tubby"|"Larvidriosa la Emocionada"|"Larvapstrè le Subjectif"|"Larvalencia the Orange"|"Larvangoj el Desorejado"|"Larve Bleue"|"Blue Larva"|"Larva azul"|"Larve Champêtre"|"Plains Larva"|"Larva campestre"|"Larve Jaune"|"Yellow Larva"|"Larva amarilla"|"Larve Orange"|"Orange Larva"|"Larva naranja"|"Larve Verte"|"Green Larva"|"Larva verde"|"Larvomatik le Propre"|"Larvamatic the Pragmatic"|"Larvado el Limpio"|"Larvonika l'Instrument"|"Larvalaska the Cold"|"Larvichuela Jack la Mágica"|"Le Flib"|"Ze Flib"|"Flib"|"Le Ouassingue"|"Ouassingue"|"El stropajo"|"Le Ouassingue Entourbé"|"Boggedown Ouassingue"|"Stropajo turbado"|"Léopardo"|"Leopardo"|"Loopardo"|"Léopolnor le Barde"|"Leopardon the Sorry"|"Looparpel el Dip"|"Let Emoliug"|"Let Emoliug"|"Let emoliug"|"Let le Rond"|"Lert Macraken the Used Emo"|"Led Empling el Ascensorista"|"Lichangora l'Immaculée"|"Lichangora the Immaculate"|"Lichangora la Inmaculada"|"Lichangoro"|"Lichangoro"|"Gorolichang"|"Lolojiki"|"Tatatojiki"|"Senojiki"|"Macien"|"Macian"|"Mata"|"Madgang le Docteur"|"Madgang the Doctor"|"Majarola el Doctor"|"Madura"|"Madura"|"Majaro"|"Maho Firefoux"|"Maho Firefoux"|"Maho Firefux"|"Mahoku le Botté"|"MoMaho the Modernist"|"Maho Firel-Tux el Paciente"|"Maître Amboat le Moqueur"|"Lord Lacedhat the Vampiric"|"Maéstrick Vaggerpiro el Canto Rodado"|"Maître Bolet"|"Fungi Master"|"Maestro boletus"|"Maître Champeur le Sabreur"|"Blackmush Master the Swordsman"|"Maestro Champavor el Espadachín"|"Maître Corbac"|"Lord Crow"|"Maestro Cuerbok"|"Maître Koalak"|"Koalak Master"|"Maestro koalak"|"Maître Koantik le Théoricien"|"Koalakropolis the King of the Hill"|"Maestro Peado la Cuenta"|"Maître Onom le Régulier"|"Fung Ku the Master"|"Maestrónomo, el Estrellado"|"Maître Pandore"|"Pandora Master"|"Maestro Pandora"|"Maître Vampire"|"Vampire Master"|"Vampiro jefe"|"Maître Zoth"|"Zoth Master"|"Maestro zoth"|"Malle Outillée"|"Equipped Chest"|"Cofre equipado"|"Mallopiée l'Épineuse"|"Quippy the Equippy Chest"|"Cofresno el Espinoso"|"Mama Koalak"|"Mama Koalak"|"Mamá koalak"|"Mamakomou l'Âge"|"Mamankalak the Bibliomaniac"|"Mamoon el Grande"|"Mandalo l'Aqueuse"|"Salamaa the Henpeck"|"Mandreinas las Nueve"|"Mandrine"|"Manderisha"|"Mandrina"|"Marude l'ensablé"|"Marude the Sandy"|"Marude la Enarenada"|"Médibwork"|"Mabwork"|"Medibwork"|"Mégabwork"|"Megabwork"|"Megabwork"|"Meulou"|"Moowolf"|"Maxilubo"|"Meupette"|"Moopet"|"Mopet"|"Meuroup le Prêtre"|"Moops the Bubbleboy"|"Mospetero el Triple"|"Milimulou"|"Miliboowolf"|"Minilubo"|"Milipatte la Griffe"|"Milivanilli the Mime"|"Mililupin el Tercero"|"Milipussien le Géant"|"Miliopold the Bloomer"|"Milirratatúi el Gastrónomo"|"Milirat d'Egoutant malade"|"Sick Grossewer Milirat"|"Milirata de alcantarillas enferma"|"Milirat Strubien"|"Strubian Milirat"|"Milirrata strubiense"|"Mineur Sombre"|"Dark Miner"|"Minero oscuro"|"Minoskito"|"Minoskito"|"Minoskito"|"Minoskour le Sauveur"|"Milikkybum the Informer"|"Mitoskorleone el Buen Padre"|"Minotoror"|"Minotoror"|"Minotauroro"|"Minotot"|"Minotot"|"Minotot"|"Minsinistre l'Elu"|"Minoskittle the Coloured"|"Minerón el Incendiario"|"Mob l'Éponge"|"Sponge Mob"|"Mob Lasponja"|"Momie Koalak"|"Koalak Mummy"|"Momia koalak"|"Momikonos la Bandelette"|"Jackoalak the Moonwalker"|"Momíller Frának el Umbrío"|"Mominotor"|"Mumminotor"|"Mominotauro"|"Moon"|"Moon"|"Moon"|"Mosketère le Dévoué"|"Moskoitus the Interruptor"|"Mashkira la Rubia de Bote"|"Moskito"|"Moskito"|"Moskito"|"Moumoule"|"Mumussel"|"Almejillón"|"Moumoute la Douce"|"Mastostroke the Strokable"|"Peluca la Suavita"|"Mufafah"|"Mufafah"|"Mufafah"|"Mufguedin le Suprême"|"Mufavabeenz the Cannibal"|"Munchfavard el Gritador"|"Mulou"|"Boowolf"|"Mediulubo"|"Muloufok l'Hilarant"|"Booty the Beast"|"Miluigi el Fontanero"|"Nakunbra"|"Hazwonarm"|"Notyebra"|"Nakuneuye le Borgne"|"Hazwonball the Hickler"|"Nakúmbat el Mortal"|"Nanashi le Virtuose"|"Nanashi the Virtuoso"|"Nanashi el Virtuoso"|"Nebgib"|"Nebgib"|"Nebgib"|"Nelvin le Boulet"|"Nebuchadnezzar the Conqueror"|"Nelgibson el Letal"|"Nerbe"|"Gwass"|"Nierba"|"Nerdeubeu le Flagellant"|"Supergwass the Free"|"Nieruba el Poeta"|"Neufedur le Flottant"|"Eyemi the Narcissist"|"Nujosawa el Emperador"|"Nipul"|"Nipul"|"Nipul"|"Nipulnislip l'Exhibitionniste"|"Niptuk the Plasticynic"|"Nipultay Dea el Poco Inspirado"|"Nodkoko"|"Kokonut"|"Nozdekoko"|"Nodkoku le Trahi"|"Kokonan the Talker"|"Nozdoku el Numérico"|"Noeul"|"Neye"|"Nujo"|"Onabu-Geisha"|"Onabu-Geisha"|"Onabu-Geisha"|"Onabuémangé la Rassasiée"|"Onabinge the Gulletfull"|"Melokomitó la Saciada"|"Oni"|"Oni"|"Oni"|"Onihylis le Destructeur"|"Oni'orses the Foolish"|"Onicienta la de Medianoche"|"Onirakam"|"Onirakam"|"Onirakam"|"Onistérique le déchainé"|"Onisterical the Unleashed"|"Onistérico el Desenfrenado"|"Orfélin"|"Orfan"|"Huerfelino"|"Orfélyre le Charmeur"|"Orfaniel the Charmer"|"Huerfeliz el Encantador"|"Osurc"|"Osurc"|"Osurc"|"Osuxion le Vampirique"|"Osurcus the Tamer"|"Osurce Kodes el Problemático"|"Ouashouash l'Exubérant"|"Ouassingiam the Tyrant"|"El Strópala Otravez el Sam"|"Ouassébo l'Esthète"|"Ouassup the Irritating"|"El Stronyjok el Pajarillo"|"Ouature la Mobile"|"Ougineemo the Lost"|"El Strat el Vampiro"|"Ougah"|"Ougaa"|"Ugah"|"Ougaould le Parasite"|"Ougathard the Fortunate"|"Uginukem, el Duque"|"Ougaould le Parasite"|"Ougathard the Fortunate"|"Uginukem el Duque"|"Ouginak"|"Ouginak"|"Uginak"|"Palmbytch la Bronzée"|"Palmella the Hefty"|"Palmiró el Tetradimensional"|"Palmiche le Serein"|"Palmoleaf the Greasy"|"Palmila la Vigilante"|"Palmiflette le Convivial"|"Naypalm the Herbivorous"|"Palmifred Passteroh el Bailarín"|"Palmifleur Kouraçao"|"Kurasso Palmflower"|"Palmiflor kuraçao"|"Palmifleur Malibout"|"Mahlibuh Palmflower"|"Palmiflor malibut"|"Palmifleur Morito"|"Mojeeto Palmflower"|"Palmiflor mohito"|"Palmifleur Passaoh"|"Passaoh Palmflower"|"Palmiflor passaoh"|"Palmito le Menteur"|"Palmpilot the Yuppie"|"Palmiscor Pions los Amantes"|"Pandalette Ivre"|"Drunk Pandalette"|"Pandita Borracha"|"Pandanlagl la Saoule"|"Pandarwin the Naturist"|"Panpítar el Niño"|"Pandawa Ivre"|"Drunken Pandawa"|"Pandawa Borracho"|"Pandikaze"|"Pandikaze"|"Pandikaze"|"Pandimaensh l'Animateur"|"Pandartmoore the Dogged"|"Pandiánayons el Aventurero"|"Pandimy le Contagieux"|"Pandaltry the Unknown"|"Pandarwin el Evolucionista"|"Pandit"|"Pandit"|"Pandido"|"Pandive le Végétarien"|"Pandahl the Rolled"|"Pan Dórrison el Hosco"|"Pandore"|"Pandora"|"Pandora"|"Pandouille le Titubant"|"Pandan the Desperate"|"Pandahl Borroaldcho el Cuentacuentos"|"Pandule"|"Pandulum"|"Pandulo"|"Pangraive le Militant"|"Pandali the Surreal"|"Pángdulo el Revienta-Bolas"|"Pantacour le Long"|"Heera Bighero"|"Tigredo el Rápido"|"Panthègros"|"Bigheera"|"Tigredón"|"Parapadkouï l'Émasculé"|"Paranotackle the Emasculated"|"Akujune el Capado"|"Parashukouï"|"Parashutackle"|"Kojonuki"|"Pékeualak"|"Fisheralak"|"Pekewalak"|"Pékeutar le Tireur"|"Fisheralf the Stewart"|"Peketchup el Hamburguesero"|"Péki Péki"|"Peki Peki"|"Peki Peki"|"Pétarfoutu le Mouillé"|"Bumbartifoux the Farty"|"Jopetas el Mojado"|"Pétartifoux"|"Bangartifoux"|"Petafux"|"Pichakoté le Dégoutant"|"Snappy the Fishfrier"|"Gazpischos el Refrescante"|"Pichdourse le Puissant"|"Snappu the Shopkeep"|"Pischurrasco el Braseado"|"Pichduitre le Totem"|"Snapple the Wise"|"Pischili Conkarne el Fuerte"|"Pichon Blanc"|"White Snapper"|"Pischis blanco"|"Pichon Bleu"|"Blue Snapper"|"Pischis azul"|"Pichon Kloune"|"Kloon Snapper"|"Pischis payaso"|"Pichon Orange"|"Brown Snapper"|"Pischis naranja"|"Pichon Vert"|"Green Snapper"|"Pischis verde"|"Picht le Brioché"|"Snappster the Sued"|"Pischto, el Tomatoso"|"Pichtoire l'Erudit"|"Snapp the Dragon"|"Pischistorra la Cárnica"|"Piou Bleu"|"Blue Piwi"|"Pío azul"|"Piou Jaune"|"Yellow Piwi"|"Pío amarillo"|"Piou Rose"|"Pink Piwi"|"Pío rosa"|"Piou Rouge"|"Red Piwi"|"Pío rojo"|"Piou Vert"|"Green Piwi"|"Pío verde"|"Piou Violet"|"Purple Piwi"|"Pío violeta"|"Pioufe la Maquillée"|"Piwi the Ermine"|"Pido el Greñas"|"Pioukas la Plante"|"Piwiliam the Brave"|"Spionter Vellde el Peligroso"|"Pioulbrineur le Mercenaire"|"Piwicker the Manly"|"Piokacho el Eléctrico"|"Pioulette la Coquine"|"Piwilde the Bossie"|"Capioricito Rojo el Forestal"|"Pioussokrim le Délétère"|"Piwinston the Churlish"|"Spío el Dragón"|"Pioustone le Problème"|"Piwiki the Witty"|"Pioch el Arenil"|"Piradain le Pingre"|"Piralhaka the Intimidator"|"Piralhaka el Maorí"|"Piralak"|"Piralak"|"Piralak"|"Pissdane l'Insipide"|"Dandel the Boy"|"Diente de Lennon el Universal"|"Pissenlit Diabolique"|"Evil Dandelion"|"Diente de león diabólico"|"Poolay"|"Cheeken"|"Pohoyo"|"Poolopo la Traditionnelle"|"Cheech the Pussycat"|"Pohozí el Jorobado"|"Porfavor le Quémandeur"|"Pigstol the Sexy"|"Pastortilla el Huevo"|"Porsalé le Râleur"|"Baconolia the Salty"|"Serranito el Montadito"|"Porsalu"|"Pignolia"|"Cerdo serrano"|"Preskapwal le Tendancieux"|"Prestreet the Fighter"|"Prestrit el Luchador"|"Prespic"|"Prespic"|"Prespic"|"Radoutable le Craint"|"Ratatouille the Stirrer"|"Ratokio de Alcontel la Despeinada"|"Ramane d'Égoutant"|"Grossewer Raeman"|"Ramán de alcantarilla"|"Ramitant le Dilettante"|"Ralftime the Dilettante"|"Charratos el Diletante"|"Rat Blanc"|"White Rat"|"Rata Blanca"|"Rat d'Égoutant"|"Grossewer Rat"|"Rata de alcantarilla"|"Rat d'Egoutant Malade"|"Sick Grossewer Rat"|"Rata de Alcantarilla Enferma"|"Rat d'Hyoactif"|"Hyoactive Rat"|"Rata hyoactiva"|"Rat Noir"|"Black Rat"|"Rata Negra"|"Ratéhaifaim le Professeur"|"Ratilla the Hun"|"Ratila el Huno"|"Ratlbol l'Aigri"|"Rattle the Hummer"|"Rafa de Alnadalillas el Canibal"|"Raul Mops"|"Raul Mops"|"Raúl mops"|"Rauligo le Sale"|"Raul Modrid the Chulo"|"Raúl Cera la Péptica"|"Rib"|"Rib"|"Rib"|"Ribibi le Cher"|"Rib the Torn"|"Arib Abá el de los 40"|"Robiolego l'Assemblé"|"Robiolego the Assembled"|"Robiolego el Ensamblado"|"Robionicle"|"Robionicle"|"Robionicle"|"Robocoop l'Échangé"|"Robocoop the Switched"|"Robocoop el Intercambiado"|"Robot Fléau"|"Robo Mace"|"Robot mangual"|"Robot Fléau"|"Robo Mace"|"Robot mangual"|"Roissingue"|"Mopy King"|"Rey stropajo"|"Rooroku l'Imposant"|"Rookin the Caped Kinster"|"Kurogordu el Imponente"|"Rose Démoniaque"|"Demonic Rose"|"Rosa demoníaca"|"Rose Obscure"|"Dark Rose"|"Rosa oscura"|"Rostensyl la Cuisinière"|"Zorrose the Messican"|"Rostetricia la Reproductiva"|"Rouquette"|"Gingerocket"|"Rojiva"|"Roy le Merlin"|"Roy the Rover"|"Reyuna el Dibujante"|"Roz la Magicienne"|"Roseanne the Yanker"|"Rochavo Democho el Chispotiado"|"Sakkado la transporteuse"|"Sakkado the Carrier"|"Sakkado la Transportista"|"Saltik"|"Jumparak"|"Araquesalta"|"Saltoavan la Gymnaste"|"Summersalt the Gymnast"|"Saltolante la Gimnasta"|"Sampi l'Eternel"|"Boarealis the Bright"|"Jabulio de la Llanesias el Portero"|"Sanglier"|"Boar"|"Jabalí"|"Sanglier des Plaines"|"Plain Boar"|"Jabalí de las llanuras"|"Sangria le Fruité"|"Boarnigen the Damasker"|"Jabachlí el Casto"|"Sarkapwane"|"Blokapwane"|"Kuanuto"|"Sarkastik l'Incompris"|"Snarkapwane the Snarky"|"Kuantista el Incomprendido"|"Scapé l'Epée"|"Scaratheef the Pincher"|"Escarumais los Siete"|"Scarabosse Doré"|"Golden Scarabugly"|"Escarajefe Dorado"|"Scarafeuille Blanc"|"White Scaraleaf"|"Escarahoja blanco"|"Scarafeuille Bleu"|"Blue Scaraleaf"|"Escarahoja azul"|"Scarafeuille Rouge"|"Red Scaraleaf"|"Escarahoja rojo"|"Scarafeuille Vert"|"Green Scaraleaf"|"Escarahoja verde"|"Scaramel le Fondant"|"Scaramel the Melty"|"Escaramelo el Derretido"|"Scaratos"|"Scaratos"|"Escarato"|"Scaratyn l'Huître"|"Scaraheath the Hanger"|"Escarálibur la Legendaria"|"Scarfayss le Balafré"|"Scarahazad the Storyteller"|"Estarausija Azul el del Danubio"|"Scarouarze l'Epopée"|"Scarabreef the Short"|"Escorobeitor el Malvado"|"Scélérat Strubien"|"Strubian Sickrat"|"Miserata strubiense"|"Scorbute"|"Scurvion"|"Scorbuto"|"Scorpitène l'Enflammé"|"Scorbison the Lonely"|"Scorbuthoveen el Sordo"|"Sergent Zoth"|"Zoth Sergeant"|"Sargento zoth"|"Seripoth l'Ennemi"|"Zouzoth the Cuddly"|"Sargende Michael el Narrador"|"Serpentin"|"Plissken"|"Culebrón"|"Serpiplume"|"Quetsnakiatl"|"Serpipluma"|"Serpistol l'Illustre"|"Serpico the Honest"|"Culebretty la Fea"|"Serpistule le Purulent"|"Quetnin the Fictional"|"Serpistol el Afónico"|"Shin Larve"|"Shin Larva"|"Shin Larva"|"Silf le Rasboul Majeur"|"Silf the Greater Bherb"|"Silf el Rasgabola Mayor"|"Skeunk"|"Skeunk"|"Skonk"|"Soryo Firefoux"|"Soryo Firefoux"|"Soryo Firefux"|"Soryonara le Poli"|"Sorgyo Quiretox the Chatterbox"|"Sairyó Hrdanfux el Volador"|"Souris Grise"|"Grey Mouse"|"Ratón Gris"|"Souris Verte"|"Green Mouse"|"Ratón verde"|"Souristiti l'Immortalisée"|"Cheesy the Immortalised"|"Patata la Inmortalizada"|"Sourizoto le Collant"|"Famouse the Little-Known"|"Ratom Raider, la Curvas"|"Sousouris Grise"|"Grey Moumouse"|"Raratón gris"|"Sousourizoto le Collant"|"Famoumouse the Little-Known"|"Raratom Raider la Curvas"|"Sparo"|"Sparo"|"Sparo"|"Sparoket le Lanceur"|"Sparodi the Python"|"Sparito el Feo"|"Sphincter Cell"|"Sphincter Cell"|"Sfinter Cell"|"Susbewl l'Hypocrite"|"Suzessman the Enthusiastic"|"Sushij el Makisan"|"Susej"|"Susej"|"Susej"|"Tambouille le Gastronome"|"Drumurosh the Nosher"|"Tambulé el Gastrónomo"|"Tambouraï"|"Drumurai"|"Tamburái"|"Tanukouï San"|"Tanukouï San"|"Tanukui San"|"Terraburkal le Perfide"|"Terraburkahl the Perfidious"|"Terraburkal, el Pérfido"|"Terrakoubiak le Guerrier"|"Terrakubiack the Warrior"|"Terrakubiack, el Guerrero"|"Tétonée la Plantureuse"|"Titinaynay the Swayer"|"Mamachichu la Exuberante"|"Tétonuki"|"Titinuki"|"Mamanuki"|"Tikoko"|"Tikokoko"|"Pekekoko"|"Tikosto le Mousse"|"Eskoko the Baron"|"Pekekokoitu el Interruptus"|"Tilolo la Bien Moulée"|"Tatatojiki the Squeaky"|"Jikitita la Moldeada"|"Tiwa'Missou le Gateux"|"Tiwana the Tokin'"|"Black Tegerwoddit el Swinguero"|"Tiwabbit"|"Tiwabbit"|"Pekewabbit"|"Tiwabbit Kiafin"|"Tiwabbit Wosungwee"|"Pekewabbit Hambriento"|"Tiwalpé le Dévêtu"|"Tiwaldo the Hidden"|"Pekewasqhabit el Juguetón"|"Tiwoflan le Lâche"|"Tiwascal the Wapper"|"Pekiwbyt Hambriento el Glotón"|"Tofu"|"Tofu"|"Tofu"|"Tofu Malade"|"Sick Tofu"|"Tofu enfermo"|"Tofu Maléfique"|"Evil Tofu"|"Tofu maléfico"|"Tofu Royal"|"Royal Tofu"|"Tofu Real"|"Tofuldebeu l'Explosif"|"Tofudd the Hunter"|"Satofu el PlasticPaddy"|"Tofumanchou l'Empereur"|"Tofulsom the Jailer"|"Tofumantxú el Mítico"|"Tofurapin le Pétri"|"Tofull the Optimist"|"Tofumado el Alucinado"|"Tortenssia la Fleurie"|"Turtan'ernie the Streetwise"|"Tortugadget el Inspector"|"Torthur la Lutte"|"Turture the Hooded"|"Tortugríssom el Doctor"|"Tortilleur le Coulé"|"Turtrenalds the Tragic"|"Tortruquini el Inspector"|"Tortorak le Cornu"|"Turticorn the Horned"|"Tortugo Projatt el Corto"|"Tortue Bleue"|"Blue Turtle"|"Tortuga azul"|"Tortue Jaune"|"Yellow Turtle"|"Tortuga amarilla"|"Tortue Rouge"|"Red Turtle"|"Tortuga roja"|"Tortue Verte"|"Green Turtle"|"Tortuga verde"|"Touchparak"|"Touchparak"|"Araknola"|"Toufou le Benêt"|"Prikoko the Witless"|"Tufóbico el Miedoso"|"Tour le Vice"|"Hunflower the Sinful"|"Gearsol Metalvaje el Espía"|"Tourbassingue"|"Mopeat"|"Barrostropajo"|"Tourbiket le Virevoletant"|"Mopfeet the Circular"|"Barrostroporosis el Frágil"|"Tournesol Affamé"|"Famished Sunflower"|"Girasol Hambriento"|"Tournesol Sauvage"|"Wild Sunflower"|"Girasol salvaje"|"Toutouf le Velu"|"Follikoko the Tufted"|"Tufaldo Aréneo el Marielito"|"Tromperelle"|"Trumperelle"|"Trompseta"|"Tromplamor le Survivant"|"Trumpaynor the Survivor"|"Trompsosis el Cardiaco"|"Tronknyde"|"Trunknid"|"Tronkónido"|"Tronkoneuz la Tranchante"|"Trunkbeard the Gentle"|"Trroncky III el Tigre"|"Tronquette la Réduite"|"Ginger the Clincher"|"Rojevita la Pequeña"|"Trooll"|"Trool"|"Trooll"|"Troollaraj"|"Troolaraj"|"Trooloko"|"Trooyé l'Oxydé"|"Trooligan the Bulldogg"|"Troolbin el de los Bolsquels"|"Trukikol"|"Glukoko"|"Kosakepega"|"Trukul le Lent"|"Glukoko the Slow"|"Kosakhiin el Lunítico"|"Tsucékoi la Colporteuse"|"Saywhatinochi the Gossipy"|"Sabeké la Vendedora"|"Tsukinochi"|"Tsukinochi"|"Tsukinoichi"|"Tsumani l'Inondeur"|"Tsumani the Flooder"|"Tsumani el Inundador"|"Tsume-bozu"|"Tsume-Bozu"|"Tsume-bozu"|"Tynril Ahuri"|"Stunned Tynril"|"Tynril Atónito"|"Tynril Consterné"|"Dismayed Tynril"|"Tynril Estupefacto"|"Tynril Déconcerté"|"Disconcerted Tynril"|"Tynril Absorto"|"Tynril Perfide"|"Perfidious Tynril"|"Tynril Pérfido"|"Vampire"|"Vampire"|"Vampiro"|"Vampunor le Glacial"|"Vamp the Impalest"|"Vamorespirros el Múltiple"|"Vétauran"|"Vetauran"|"Vetorano"|"Vétaurine l'Énergisé"|"Vetaurine the Energised"|"Vetaurino el Energizado"|"Wa Wabbit"|"Wa Wabbit"|"Wey Wabbit"|"Wabbit"|"Wabbit"|"Wabbit"|"Wabbit Gm"|"GM Wabbit"|"Wabbit GM"|"Wabbit Squelette"|"Skeleton Wabbit"|"Wabbit esqueleto"|"Wabbitud le Constant"|"McWhabbit the Diehard"|"Wogew Wabbit el Engañado"|"Wagnagnah le Sanglant"|"Wabbin the Wich"|"Blackowibbit el Imaginativo"|"Wara l'Amer"|"Worka the Willful"|"Warjamer el Miniaturista"|"Warko Marron"|"Brown Warko"|"Warko marrón"|"Warko Violet"|"Purple Warko"|"Warko violeta"|"Warkolad l'Etreinte"|"Warko the Inky"|"Warkamole el Apetitoso"|"Watdogue le Bien Nommé"|"Wabbitor the Apt"|"Waybbit Esquelite el Rebelde"|"Wo Wabbit"|"Wo Wabbit"|"Wabbit wodo"|"Wokènrôl le Danseur"|"Wowalker the Egyptian"|"Wabibip Woyote el Persistente"|"Yokai Firefoux"|"Yokai Firefoux"|"Yokai Firefux"|"YokaiKoral le Duel"|"Yokai the Choral"|"Yocái Ipehkaíto el Frito"|"Yukisamara"|"Yukisamara"|"Yukisamara"} MonsterName

	 * @typedef {"Amakna"|"Astrub"|"Baie de Sufokia"|"Sufokia Bay"|"Bahía de Sufokia"|"Bonta"|"Brâkmar"|"Brakmar"|"Foire du Trool"|"Trool Fair"|"Feria del Trool"|"Forêt des Abraknydes"|"Treechnid Forest"|"Bosque de los abráknidos"|"Forêt Maléfique"|"Evil Forest"|"Bosque Maléfico"|"Gelaxième Dimension"|"Jellith Dimension"|"Gelexta Dimensión"|"Île d'Otomaï"|"Otomai Island"|"Isla de Otomai"|"Île de Grobe"|"Nolifis Island"|"Isla de Grobe"|"Île de Moon"|"Moon Island"|"Isla de Moon"|"Île de Pandala"|"Pandala Island"|"Isla de Pandala"|"Île des Wabbits"|"Wabbit Islands"|"Archipiélago wabbit"|"Île du Minotoror"|"Minotoror Island"|"Isla del Minotauroro"|"Labyrinthe du Dragon Cochon"|"Dragon Pig's Maze"|"Laberinto del Dragocerdo"|"Landes de Sidimote"|"Sidimote Moors"|"Landas de Sidimote"|"Montagne des Koalaks"|"Koalak Mountain"|"Montaña de los koalaks"|"Plaines de Cania"|"Cania Plains"|"Llanuras de Cania"} ZoneName

	 * @typedef {"Akadémie des Gobs"|"Gob Akademy"|"Akademia de los Goblins"|"Antre de Crocabulia"|"Crocabulia's Lair"|"Antro de Cocabulia"|"Bord de la forêt maléfique"|"Edge of the Evil Forest"|"Linde del Bosque Maléfico"|"Campagne d'Amakna"|"Amakna Countryside"|"Campo de Amakna"|"Campement des Bworks"|"The Bwork Camp"|"Campamento de los bworks"|"Campement des Gobelins"|"The Goblin Camp"|"Campamento de los goblins"|"Champ des Ingalsse"|"Ingalsses' Fields"|"Campo de los Ingals"|"Cimetière"|"Cemetery"|"Cementerio"|"Clairière de Brouce Boulgoure"|"Brouce Boulgoure's Clearing"|"Claro de Brus Bulguro"|"Cloaque d'Amakna"|"Amakna Sewers"|"Cloaca de Amakna"|"Coin des Boos"|"Mushd Corner"|"Rincón de los Boos"|"Coin des Bouftous"|"Gobball Corner"|"Rincón de los Jalatós"|"Côte d'Asse"|"Asse Coast"|"Costa del Rano"|"Cryptes du cimetière"|"Cemetery Crypts"|"Criptas del cementerio"|"Donjon des Bworks"|"Bwork Dungeon"|"Mazmorra de los Bworks"|"Donjon des Forgerons"|"Blacksmith Dungeon"|"Mazmorra de los Herreros"|"Donjon des Larves"|"Larva Dungeon"|"Mazmorra de las Larvas"|"Donjon des Scarafeuilles"|"Scaraleaf Dungeon"|"Mazmorra de los Escarahojas"|"Donjon des Squelettes"|"Skeleton Dungeon"|"Mazmorra de los Esqueletos"|"Donjon des Tofus"|"Tofu House"|"Mazmorra de los Tofus"|"Épreuve de Draegnerys"|"Draegnerys's Trial"|"Prueba de Dragenerys"|"Forêt d'Amakna"|"Amakna Forest"|"Bosque de Amakna"|"La forêt maléfique"|"The Evil Forest"|"El Bosque Maléfico"|"Marécages d'Amakna"|"Amakna Swamps"|"Pantanos de Amakna"|"Milifutaie"|"Milicluster"|"Mililameda"|"Montagne basse des Craqueleurs"|"Low Crackler Mountain"|"Piedemonte de los crujidores"|"Montagne des Craqueleurs"|"Crackler Mountain"|"La montaña de los crujidores"|"Nid du Kwakwa"|"The Kwakwa's Nest"|"Nido de Kwoknan"|"Passage vers Brâkmar"|"Passage to Brakmar"|"Pasaje hacia Brakmar"|"Péninsule des gelées"|"Jelly Peninsula"|"Península de las gelatinas"|"Pitons Rocheux des Craqueleurs"|"Crackler's Rocky Peaks"|"Picos Rocosos de los Crujidores"|"Plaine des Scarafeuilles"|"Scaraleaf Plain"|"Llanura de los escarahojas"|"Port de Madrestam"|"Madrestam Harbour"|"Puerto de Madrestam"|"Presqu'île des Dragoeufs"|"Dreggon Peninsula"|"Península de los dragohuevos"|"Repaire de Sphincter Cell"|"Sphincter Cell's Lair"|"Guarida de Sfinter Cell"|"Repaire du Kharnozor"|"Kharnotaurus's Lair"|"Guarida de Karnozor"|"Rivière Kawaii"|"Kawaii River"|"Río Kawaii"|"Sanctuaire des Dragoeufs"|"The Dreggons' Sanctuary"|"Santuario de los dragohuevos"|"Souterrains"|"Tunnels"|"Subterráneos"|"Souterrains des Dragoeufs"|"Dreggon Tunnels"|"Subterráneos de los dragohuevos"|"Territoire des Bandits"|"Bandit Territory"|"Territorio de los bandidos"|"Territoire des Porcos"|"Porco Territory"|"Territorio de los porcos"|"Territoire souterrain des Porcos"|"Underground Porco Territory"|"Territorio subterráneo de los porcos"|"Tofulailler Royal"|"Royal Tofu House"|"Tofullinero Real"|"Village d'Amakna"|"Amakna Village"|"Pueblo de Amakna"|"Village des Bworks"|"Bwork Village"|"Pueblo de los bworks"|"Village des Dragoeufs"|"Dreggon Village"|"Pueblo de los dragohuevos"|"Calanques d'Astrub"|"Astrub Rocky Inlet"|"Calas de Astrub"|"Champs d'Astrub"|"Astrub Fields"|"Campos de Astrub"|"Château Ensablé"|"Sandy Castle"|"Castillo de Arena"|"Cimetière d'Astrub"|"Astrub Cemetery"|"Cementerio de Astrub"|"Cité d'Astrub"|"Astrub City"|"Ciudad de Astrub"|"Cour du Bouftou Royal"|"Royal Gobball's Court"|"Corte del Jalató Real"|"Égouts d'Astrub"|"Astrub Sewers"|"Alcantarillas de Astrub"|"Forêt d'Astrub"|"Astrub Forest"|"Bosque de Astrub"|"Grange du Tournesol Affamé"|"Famished Sunflower's Barn"|"Granero del Girasol Hambriento"|"Prairies d'Astrub"|"Astrub Meadow"|"Praderas de Astrub"|"Souterrains d'Astrub"|"Astrub Tunnels"|"Subterráneos de Astrub"|"Tainéla"|"Tainela"|"Rivage sufokien"|"Sufokian Shoreline"|"Ribera del golfo sufokeño"|"Sufokia"|"Canaux méphitiques"|"Foul-Smelling Canals"|"Canales mefíticos"|"Cimetière des Héros"|"Heroes' Cemetery"|"Cementerio de los héroes"|"Cœur immaculé"|"Immaculate Heart"|"Corazón Inmaculado"|"Faubourgs des artisans"|"Crafters' District"|"Arrabales de los artesanos"|"Garde-manger du Rat Blanc"|"White Rat's Pantry"|"Despensa de la Rata Blanca"|"Havres d'ivoire"|"Ivory Harbours"|"Puertos de marfil"|"Promontoire des cieux"|"Promontory of the Heavens"|"Promontorio de los cielos"|"Rives iridescentes"|"Iridescent Shores"|"Riberas iridiscentes"|"Bordure de Brâkmar"|"Brakmar City Walls"|"Afueras de Brakmar"|"Cimetière des Torturés"|"Cemetery of the Tortured"|"Cementerio de los Torturados"|"Entrailles de Brâkmar"|"Bowels of Brakmar"|"Entrañas de Brakmar"|"L'Ancre"|"The Anchor"|"Ancla"|"L'Enclume"|"The Anvil"|"Yunque"|"La Cuirasse"|"The Breastplate"|"Coraza"|"La Marmite"|"The Pot"|"Marmita"|"Sousouricière du Rat Noir"|"Black Rat's Moumousetrap"|"Raratonera de la Rata Negra"|"Maison Fantôme"|"Haunted House"|"Mansión Encantada"|"Bois des Arak-haï"|"Arak-hai Forest"|"Bosque de las arak-hais"|"Clairière du Chêne Mou"|"Soft Oak Clearing"|"Claro del Roble Blando"|"Domaine Ancestral"|"Ancestral Domain"|"Territorio Ancestral"|"Forêt Sombre"|"Dark Forest"|"Bosque Oscuro"|"Orée de la forêt des Abraknydes"|"Edge of the Treechnid Forest"|"Linde del bosque de los abráknidos"|"Tertre du long sommeil"|"Long Slumber's Barrow"|"Túmulo del Largo Sueño"|"Gelaxième dimension"|"Jellith Dimension"|"Gelexta Dimensión"|"Antre du Kralamoure Géant"|"Lair of the Giant Kralove"|"Antro del Kralamar Gigante"|"Arche d'Otomaï"|"Otomai's Ark"|"Arca de Otomai"|"Cale de l'arche d'Otomaï"|"Hold of Otomai's Ark"|"Cala del Arca de Otomai"|"Canopée du Kimbo"|"Kimbo's Canopy"|"Canopea del Kimbo"|"Feuillage de l'arbre Hakam"|"Tree Keeholo Foliage"|"Las ramas del árbol Hakam"|"Goulet du Rasboul"|"Bherb's Gully"|"Boca del Rasgabola"|"Grotte Hesque"|"Grotto Hesque"|"Gruta Grut'Hesqua"|"Île des naufragés"|"Castaway Island"|"Isla de los Náufragos"|"Jungle obscure"|"Dark Jungle"|"Oscura Jungla"|"Laboratoire du Tynril"|"Tynril Lab"|"Laboratorio del Tynril"|"Plage de Corail"|"Coral Beach"|"Playa de coral"|"Plaines herbeuses"|"Grassy Plains"|"Llanuras Herbosas"|"Tourbière nauséabonde"|"Putrid Peat Bog"|"Turbera nauseabunda"|"Tourbière sans fond"|"Bottomless Peat Bog"|"Turbera sin fondo"|"Tronc de l'arbre Hakam"|"Tree Keeholo Trunk"|"Tronco del árbol Hakam"|"Village de la Canopée"|"Canopy Village"|"Pueblo de la canopea"|"Village des Zoths"|"Zoth Village"|"Pueblo de los zoths"|"Cimetière de Grobe"|"Nolifis Cemetery"|"Cementerio de Grobe"|"Demeure des Esprits"|"Spirit Abode"|"Casa de los Espíritus"|"Île de Grobe"|"Nolifis Island"|"La Isla de Grobe"|"Mont des Tombeaux"|"Mount Tombs"|"Monte de las Tumbas"|"Plan Astral"|"Plan Matériel"|"Tombe du Shogun Tofugawa"|"Shogun Tofugawa's Tomb"|"Tumba del Shogun Tofugawa"|"Arbre de Moon"|"Moon's Tree"|"Árbol de Moon"|"Bateau du Chouque"|"LeChouque's Boat"|"Navío de Le Chuko"|"Chemin du Crâne"|"Skull Path"|"Camino de los cráneos"|"Forêt des Masques"|"The Forest of Masks"|"Bosque de las máscaras"|"Jungle Interdite"|"The Forbidden Jungle"|"Jungla Prohibida"|"La jungle profonde de Moon"|"The Deep Moon Jungle"|"La selva profunda de Moon"|"Le chemin vers Moon"|"The Road to Moon"|"El camino hacia Moon"|"Plage de la Tortue"|"Turtle Beach"|"Playa Tortuga"|"Village Kanniboul"|"Kanniball Village"|"Pueblo Kaníbola"|"Aerdala"|"Airedala"|"Akwadala"|"Atelier du Tanukouï San"|"Tanukouï San's Workshop"|"Taller de Tanukui San"|"Bambusaie de Damadrya"|"Damadrya's Bamboo Grove"|"Bambusería de Kodámade"|"Bordure d'Aerdala"|"Border of Aerdala"|"Alrededores de Airedala"|"Bordure d'Akwadala"|"Border of Akwadala"|"Alrededores de Akwadala"|"Bordure de Feudala"|"Border of Feudala"|"Alrededores de Fuegodala"|"Bordure de Terrdala"|"Border of Terrdala"|"Alrededores de Tierradala"|"Dojo du Vent"|"Wind Dojo"|"Dojo del Viento"|"Donjon des Firefoux"|"Firefoux Dungeon"|"Mazmorra de los Firefux"|"Fabrique de foux d'artifice"|"Fouxwork Factory"|"Fábrica de Fux Artificiales"|"Feudala"|"Fuegodala"|"Forêt de Pandala"|"Pandala Forest"|"Bosque de Pandala"|"Pandala Neutre"|"Neutral Pandala"|"Pandala Neutral"|"Plantala"|"Repaire des Pandikazes - Huitième plate-forme"|"Pandikazes' Hideout - Eighth Platform"|"Guarida de los Pandikazes - Octava plataforma"|"Terrdala"|"Tierradala"|"Vallée de la Dame des eaux"|"Valley of the Lady of the Water"|"Valle de la Dama del Agua"|"Village de Feudala"|"Feudala Village"|"Château du Wa Wabbit"|"Wa Wabbit's Castle"|"Castillo del Wey Wabbit"|"Île de la Cawotte"|"Cawwot Island"|"Isla Zanahowia"|"Îlot de la Couronne"|"Isle of the Cwown"|"Islote La Cowona"|"Îlot de Waldo"|"Gwimace Island"|"Islote Waldo Nald"|"Îlot des Tombeaux"|"Gwavestone Island"|"Islote Sepultuwa"|"Souterrains des Wabbits"|"Wabbit Tunnels"|"Subterráneos de los wabbits"|"Centre du labyrinthe du Minotoror"|"Inner Labyrinth of the Minotoror"|"Centro del Laberinto del Minotauroro"|"Île du Minotoror"|"Minotoror Island"|"Isla del Minotauroro"|"Labyrinthe du Minotoror"|"Labyrinth of the Minotoror"|"Laberinto del Minotauroro"|"Antre du Dragon Cochon"|"Dragon Pig Dungeon"|"Antro del Dragocerdo"|"Labyrinthe du Dragon Cochon"|"The Dragon Pig's Maze"|"El laberinto del Dragocerdo"|"Caverne des Fungus"|"Fungus Cavern"|"Caverna de los fongos"|"Désolation de Sidimote"|"Desolation of Sidimote"|"Tierras desoladas de Sidimote"|"Domaine des Fungus"|"Fungus Domain"|"Territorio de los fongos"|"Grotte du Bworker"|"Bworker's Cave"|"Cueva de Bworker"|"Hauts des Hurlements"|"Howling Heights"|"Altos de los Aullidos"|"Laboratoire de Brumen Tinctorias"|"Brumen Tinctorias's LaboRATory"|"Laboratorio de Brumen Tinctorias"|"Tanière du Meulou"|"Moowolf Lair"|"Guarida del Maxilubo"|"Temple du Grand Ougah"|"Temple of the Great Ougaa"|"Templo del Gran Ugah"|"Terres Désacrées"|"Desecrated Highlands"|"Tierras Desacralizadas"|"Antre du Koulosse"|"Koolich's Lair"|"Antro del Trankitronko"|"Canyon sauvage"|"Wild Canyon"|"Cañón Salvaje"|"Caverne du Koulosse"|"Koolich Cavern"|"Cueva del Trankitronko"|"Cimetière primitif"|"Primitive Cemetery"|"Cementerio primitivo"|"Forêt de Kaliptus"|"Kaliptus Forest"|"Bosque de kaliptos"|"Lacs enchantés"|"Enchanted Lakes"|"Lagos encantados"|"Marécages nauséabonds"|"Nauseating Swamps"|"Pantanos nauseabundos"|"Marécages sans fond"|"Bottomless Swamps"|"Pantanos sin fondo"|"Repaire de Skeunk"|"Skeunk's Hideout"|"Guarida de Skonk"|"Territoire des Dragodindes Sauvages"|"Wild Dragoturkey Territory"|"Territorio de los dragopavos salvajes"|"Vallée de la Morh'Kitu"|"Agony V'Helley"|"Valle de la Muertekemata"|"Antre du Blop Multicolore Royal"|"Royal Rainbow Blop Lair"|"Antro del Blop Multicolor Real"|"Baie de Cania"|"Cania Bay"|"Bahía de Cania"|"Bibliothèque du Maître Corbac"|"Lord Crow's Library"|"Biblioteca del Maestro Cuerbok"|"Bois de Litneg"|"Eltneg Wood"|"Bosque de Litneg"|"Champs de Cania"|"Cania Fields"|"Campos de Cania"|"Clos des Blops"|"Blop Fields"|"Enclave de los Blops"|"Dents de Pierre"|"Stontusk Desert"|"Dientes de Piedra"|"Grotte de Kanigroula"|"Kanigrula's Cave"|"Gruta de Kanígrula"|"Lac de Cania"|"Cania Lake"|"Lago de Cania"|"Massif de Cania"|"Cania Massif"|"Sierra de Cania"|"Mine des Dopeuls"|"Dopple Mine"|"Mina de los dopeuls"|"Pénates du Corbac"|"The Crow's Domain"|"Morada de cuerbok"|"Pics de Cania"|"Cania Peaks"|"Picos de Cania"|"Plaine des Porkass"|"Lousy Pig Plain"|"Llanura de los puerkazos"|"Plaines Rocheuses"|"Rocky Plains"|"Llanuras Rocosas"|"Routes Rocailleuses"|"Rocky Roads"|"Caminos rocosos"|"Salle de lecture du Maître Corbac"|"Lord Crow's Reading Room"|"Sala de lectura del Maestro Cuerbok"|"Village des Dopeuls"|"Dopple Village"|"Pueblo de los dopeuls"|"Village des Kanigs"|"Kanig Village"|"Pueblo de los kanigs"|"Volière de la Haute Truche"|"Cross Strich's Aviary"|"Pajarera de Thor Pestruz"} SubZoneName

	 * @typedef {object} SubZone
	 * @property {number} id
	 * @property {Record<"en"|"es"|"fr", SubZoneName>} name

	 * @typedef {object} Zone
	 * @property {number} id
	 * @property {Record<"fr"|"en"|"es", ZoneName>} name
	 * @property {Array<SubZone>} subzones

	 * @typedef {object} Monster
	 * @property {number} id
	 * @property {Record<"fr"|"en"|"es", MonsterName>} name
	 * @property {string} image
	 * @property {number} level_min
	 * @property {number} level_max
	 * @property {MonsterType} type
	 * @property {object} [reference]
	 * @property {number} [reference.id]
	 * @property {Record<"fr"|"en"|"es", MonsterName>} [reference.name]
	 * @property {Array<Zone>} zones

	 * @typedef {object} Pagination
	 * @property {number} total
	 * @property {number} limit
	 * @property {number} offset

	 * @param {object} [options]
	 * @param {MonsterName} [options.monster_name]
	 * @param {MonsterTypeName} [options.monster_type]
	 * @param {number} [options.limit]
	 * @param {number} [options.offset]

	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<Monster>|Monster,
	 * pagination?: Pagination,
	 * }>}

	 * @example
	 * getMonsters(); // Liste des monstres avec pagination et filtres (Array + pagination)
	 * getMonsters({ monster_name: "Aboub" }); // Recherche par nom (français, anglais ou espagnol) (Object)
	 * getMonsters({ type: "archimonstre" }) // Filtrer par type (Array + pagination)
	 * getMonsters({ limit: 200, offset: 200 }); // Renvoi les 200 monstres à offset 200 (Array + pagination)
	 */
	async getMonsters(options) {
		let path = `${base}/monsters`;
		const queries = [];

		if (options?.monster_name) {
			const monster = monsterByName(options.monster_name);

			if (!monster) {
				throw new Error(`monster_name '${options.monster_name}' doesn't exist`);
			}

			path += `/${monster.id}`;
		} else {
			if (options?.monster_type) {
				const monsterType = monsterTypeByName(options.monster_type);

				if (!monsterType) {
					throw new Error(
						`monster_type '${options.monster_type}' doesn't exist`,
					);
				}

				queries.push(`type=${monsterType.id}`);
			}
			if (options?.limit) {
				queries.push(`limit=${options.limit}`);
			}
			if (options?.offset) {
				queries.push(`offset=${options.offset}`);
			}

			path += `?${queries.join("&")}`;
		}

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				if (nodeComfort.isArray(data.data)) {
					for (const monster of data.data) {
						if (!monster.zones) {
							monster.zones = cache.monsters.find(
								(m) => m.id === monster.id,
							).zones;
						}
					}
				} else {
					if (!data.data.zones) {
						data.data.zones = cache.monsters.find(
							(m) => m.id === data.data.id,
						).zones;
					}
				}
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Événements Kralamoure

	 * @typedef {object} Kralove
	 * @property {number} id
	 * @property {string} event_datetime
	 * @property {string} description
	 * @property {string} creator
	 * @property {number} participants_count
	 * @property {number} character_count
	 * @property {number} messages_count
	 * @property {Server} server

	 * @typedef {object} Participant
	 * @property {string} username
	 * @property {number} character_count

	 * @typedef {object} Message
	 * @property {string} username
	 * @property {string} content
	 * @property {string} created_at

	 * @typedef {object} KraloveDetail
	 * @property {number} id
	 * @property {string} event_datetime
	 * @property {string} description
	 * @property {string} creator
	 * @property {Server} server
	 * @property {Array<Participant>} participants
	 * @property {Array<Message>} messages

	 * @param {object} [options]
	 * @param {number} [options.id] - Détails d'un événement avec participants et messages
	 * @param {ServerName} [options.server_name] - Filtrer par serveur
	 * @param {string} [options.start_date] - Date de début au format `YYYY-MM-DD`. Par défaut: aujourd'hui

	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<Kralove>|KraloveDetail
	 * }>}

	 * @example
	 * getKraloves(); // Liste tous les événements Kralamoure (Array)
	 * getKraloves({ server_name: "Brial" }); // Filtrer par serveur (Array)
	 * getKraloves({ start_date: "2026-01-27" }); // Date de début (Array)
	 * getKraloves({ id: 1 }); // Détails d'un événement avec participants et messages (Object)
	 */
	async getKraloves(options) {
		let path = `${base}/kralove`;
		const queries = [];

		if (options?.id) {
			path += `/${options.id}`;
		} else {
			if (options?.server_name) {
				const server = serverByName(options.server_name);

				if (!server) {
					throw new Error(`server_name '${options.server_name}' doesn't exist`);
				}

				queries.push(`server=${server.id}`);
			}

			if (options?.start_date) {
				queries.push(`from=${options.start_date}`);
			}

			path += `?${queries.join("&")}`;
		}

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Modèles de quête
	 * Les modèles de quête décrivent la liste des monstres à capturer pour chaque version du jeu.

	 * @typedef {object} QuestTemplate
	 * @property {number} id
	 * @property {GameVersion} game_version
	 * @property {number} monster_count
	 * @property {number} step_count

	 * @typedef {object} QuestTemplateDetail
	 * @property {number} id
	 * @property {GameVersion} game_version
	 * @property {Array<Monster & { step: number }>} monsters
	 * @property {Pagination} pagination

	 * @param {object} [options]
	 * @param {GameName} [options.game_name]
	 * @param {number} [options.step]
	 * @param {number} [options.limit]
	 * @param {number} [options.offset]

	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<QuestTemplate>|QuestTemplateDetail,
	 * }>}

	 * @example
	 * getQuestTemplates(); // (Array)
	 * getQuestTemplates({ game_name: "Dofus (Unity)" }); // Retourne un modèle avec la liste de ses monstres. Supporte la pagination et le filtre par étape.
	 */
	async getQuestTemplates(options) {
		let path = `${base}/quest-templates`;

		if (options?.game_name) {
			const game = gameByName(options.game_name);

			if (!game) {
				throw new Error(`game_name '${options.game_name}' doesn't exist`);
			}

			path += `/${game.id}`;
			const queries = [];

			if (options?.step) {
				queries.push(`step=${options.step}`);
			}
			if (options?.limit) {
				queries.push(`limit=${options.limit}`);
			}
			if (options?.offset) {
				queries.push(`offset=${options.offset}`);
			}

			path += `?${queries.join("&")}`;
		}

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				if (!nodeComfort.isArray(data.data)) {
					data.data.monsters = data.data.monsters.map((m) => ({
						...cache.monsters.find((x) => x.id === m.id),
						step: m.step,
					}));
				}
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Rechercher des utilisateurs
	 * Recherche des utilisateurs ayant des quêtes publiques. Nécessite un terme de recherche d'au moins 3 caractères.

	 * @typedef {object} UserAvatar
	 * @property {number} id
	 * @property {Record<"fr"|"en"|"es", string>} name
	 * @property {string} image

	 * @typedef {object} Search
	 * @property {string} username
	 * @property {UserAvatar} avatar
	 * @property {string} last_active

	 * @param {string} query - Terme de recherche (min 3 caractères)
	 * @param {object} [options]
	 * @param {ServerName} [options.server_name]
	 * @param {number} [options.active_within_days] - Utilisateurs actifs dans les N derniers jours (défaut : 90, max : 365)
	 * @param {number} [options.limit] - Nombre de résultats (défaut : 20, max : 50)
	 * @param {number} [options.offset] - Décalage pour la pagination (défaut : 0)

	 * @returns {Promise<{
	 * ok: boolean;
	 * status: number;
	 * statusText: string;
	 * retryAfter?: number;
	 * error?: string;
	 * data?: Array<Search>;
	 * pagination?: Pagination;
	 * }>}

	 * @example
	 * searchUser("jean"); // Recherche utilisateurs (Array)
	 * searchUser("jean", { server_name: "Brial" }); // Filtrer par ID de serveur (Array)
	 * searchUser("jean", { active_within_days: 365, limit:50, offset: 10 }); // 50 Utilisateurs actifs dans les 365 derniers jours, passe les 10 premiers (Array)
	 */
	async searchUsers(query, options) {
		let path = `${base}/users/search`;
		const queries = [];

		queries.push(`q=${query}`);

		if (options?.server_name) {
			const server = serverByName(options.server_name);

			if (!server) {
				throw new Error(`server_name '${options.server_name}' doesn't exist`);
			}

			queries.push(`server_id=${server.id}`);
		}
		if (options?.active_within_days) {
			queries.push(`active_within_days=${options.active_within_days}`);
		}
		if (options?.limit) {
			queries.push(`limit=${options.limit}`);
		}
		if (options?.offset) {
			queries.push(`offset=${options.offset}`);
		}

		path += `?${queries.join("&")}`;

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Profil utilisateur

	 * @typedef {object} User
	 * @property {string} username
	 * @property {string} bio
	 * @property {UserAvatar} avatar
	 * @property {string} created_at
	 * @property {string} last_active

	 * @param {string} username
 
	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: User,
	 * }>}

	 * @example
	 * getUser("ix-xs"); // Profil utilisateur (Object)
	 */
	async getUser(username) {
		let path = `${base}/users/${username}`;

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				delete data.data.quests;
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Liste des quêtes d'un utilisateur
	 * Retourne les quêtes publiques avec le nombre de monstres recherchés et proposés.

	 * @typedef {object} Quest
	 * @property {string} slug
	 * @property {string} character_name
	 * @property {number} current_step
	 * @property {number} parallel_quests
	 * @property {number} wanted_count
	 * @property {number} offered_count
	 * @property {Server} server
	 * @property {QuestTemplate} quest_template

	 * @param {string} username
 
	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: Array<Quest>,
	 * }>}

	 * @example
	 * getUserQuests("ix-xs"); // Liste des quêtes de l'utilisateur (Array)
	 */
	async getUserQuests(username) {
		let path = `${base}/users/${username}/quests`;

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Détail d'une quête
	 * Retourne une quête avec la liste de ses monstres. Supporte la pagination et les filtres.

	 * @param {string} username - Nom d'utilisateur
	 * @param {string} quest_slug - Id (slug) de la quête de l'utilisateur
	 * @param {object} [options]
	 * @param {"wanted"|"offered"} [options.status] - wanted (recherchés) ou offered (proposés). Par défaut : tous
	 * @param {number} [options.step] - Filtrer par numéro d'étape
	 * @param {number} [options.limit] - Nombre de résultats (défaut : 50, max : 200)
	 * @param {number} [options.offset] - Décalage pour la pagination (défaut : 0)
 
	 * @returns {Promise<{
	 * ok: boolean;
	 * status: number;
	 * statusText: string;
	 * error?: string,
	 * retryAfter?: number;
	 * data?: Array<Monster & { step: number, owned: number, status: number }>;
	 * pagination?: Pagination;
	 * }>}

	 * @example
	 * getUserQuestMonsters("ix-xs", "abcdef"); // Liste des quêtes de l'utilisateur
	 * getUserQuestMonsters("ix-xs", "abcdef", { status: "offered" }); // Filtrer par status
	 * getUserQuestMonsters("ix-xs", "abcdef", { step: 5 }); // Filtrer par numéro d'étape
	 * getUserQuestMonsters("ix-xs", "abcdef", { limit: 200, offset: 10 }); // 200 monstres, passe les 10 premiers
	 */
	async getUserQuestMonsters(username, quest_slug, options) {
		let path = `${base}/users/${username}/quests/${quest_slug}`;
		const queries = [];

		if (options?.status) {
			queries.push(`status=${options.status}`);
		}
		if (options?.step) {
			queries.push(`step=${options.step}`);
		}
		if (options?.limit) {
			queries.push(`limit=${options.limit}`);
		}
		if (options?.offset) {
			queries.push(`offset=${options.offset}`);
		}

		path += `?${queries.join("&")}`;

		let result = {};

		try {
			const _ = await fetch(path, {
				headers: {
					Authorization: `Bearer ${this.#api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				data.data.monsters = data.data.monsters.map((m) => ({
					...m,
					...cache.monsters.find((x) => x.id === m.id),
				}));

				data.pagination = data.data.pagination;
				data.data = data.data.monsters;
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Partenaires d'échange
	 * Trouve des utilisateurs avec qui échanger des monstres. Cet endpoint analyse votre quête et cherche d'autres joueurs sur le même serveur qui :
	 * * Proposent des monstres que vous recherchez
	 * * Recherchent des monstres que vous proposez


	 * **💡 Note :**
	 * Les résultats sont triés par match_score décroissant (nombre total de monstres en commun). Pour chaque monstre, available indique la quantité disponible à l'échange, needed le besoin, et covers_need si l'offre couvre entièrement le besoin.

	 * @typedef {object} MatchQuest
	 * @property {string} slug
	 * @property {string} character_name
	 * @property {number} parallel_quests

	 * @typedef {Monster & { available: number, needed: number, covers_need: boolean }} Wanted

	 * @typedef {object} MatchData
	 * @property {Array<Wanted>} they_have_you_want
	 * @property {Array<Wanted>} you_have_they_want

	 * @typedef {object} Match
	 * @property {Search} user
	 * @property {MatchQuest} quest
	 * @property {MatchData} matches
	 * @property {number} match_score

	 * @param {string} user_api_key - Clé API de l'utilisateur
	 * @param {string} quest_slug - Id (slug) de la quête de l'utilisateur
	 * @param {object} [options]
	 * @param {"they_have"|"they_want"|"both"} [options.direction] - Type de match à rechercher (défaut: both)
	 * @param {number} [options.active_within_days] - Utilisateurs actifs dans les N derniers jours (défaut : 30, max : 365)
	 * @param {number} [options.min_parallel_quests] - Nombre minimum de quêtes en parallèle du partenaire (défaut : 1, max : 20). Utile pour filtrer les joueurs "hardcore".
	 * @param {number} [options.limit] - Nombre de résultats (défaut : 20, max : 50)
	 * @param {number} [options.offset] - Décalage pour la pagination (défaut : 0)
 
	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * retryAfter?: number,
	 * error?: string;
	 * data?: Array<Match>,
	 * pagination?: Pagination,
	 * }>}

	 * @example
	 * matchUserQuest("jean_api_key", "acbdef"); // Liste des correspondances (Array)
	 * matchUserQuest("jean_api_key", "abcdef", { direction: "they_have" }); // Utilisateurs proposant les monstres que jean recherche
	 * matchUserQuest("jean_api_key", "abcdef", { direction: "they_want" }); // Utilisateurs recherchant les monstres que jean propose
	 * matchUserQuest("jean_api_key", "abcdef", { active_within_days: 365, limit: 50, offset: 10 }); // 50 Utilisateurs actifs dans les 365 derniers jours, passe les 10 premiers
	 */
	async matchUserQuest(user_api_key, quest_slug, options) {
		let path = `${base}/quests/${quest_slug}/matches`;
		const queries = [];

		if (options?.direction) {
			queries.push(`direction=${options.direction}`);
		}
		if (options?.active_within_days) {
			queries.push(`active_within_days=${options.active_within_days}`);
		}
		if (options?.min_parallel_quests) {
			queries.push(`min_parallel_quests=${options.min_parallel_quests}`);
		}
		if (options?.limit) {
			queries.push(`limit=${options.limit}`);
		}
		if (options?.offset) {
			queries.push(`offset=${options.offset}`);
		}

		path += `?${queries.join("&")}`;

		let result = {};

		try {
			const _ = await fetch(path.replace("?", ""), {
				headers: {
					Authorization: `Bearer ${user_api_key}`,
				},
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				data.data = data.data.map((m) => ({
					...m,
					matches: {
						they_have_you_want: m.matches.they_have_you_want.map((x) => ({
							...x,
							...cache.monsters.find((z) => z.id === x.id),
						})),
						you_have_they_want: m.matches.you_have_they_want.map((x) => ({
							...x,
							...cache.monsters.find((z) => z.id === x.id),
						})),
					},
				}));
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Modifier les paramètres d'une quête

	 * @typedef {object} QuestUpdated
	 * @property {string} slug
	 * @property {string} [character_name]
	 * @property {number} [parallel_quests]
	 * @property {number} [current_step]
	 * @property {boolean} [show_trades]
	 * @property {number} [trade_mode]
	 * @property {number|null} [trade_offer_threshold]
	 * @property {number|null} [trade_want_threshold]
	 * @property {boolean} [never_offer_normal]
	 * @property {boolean} [never_want_normal]
	 * @property {boolean} [never_offer_boss]
	 * @property {boolean} [never_want_boss]
	 * @property {boolean} [never_offer_archi]
	 * @property {boolean} [never_want_archi]

	 * @param {string} user_api_key - Clé API de l'utilisateur
	 * @param {string} quest_slug - Id (slug) de la quête de l'utilisateur
	 * @param {object} options
	 * @param {string} [options.character_name] - Nom du personnage (max 200 caractères)
	 * @param {number} [options.parallel_quests] - Nombre de quêtes en parallèle (1-20)
	 * @param {number} [options.current_step] - Étape courante (1-34)
	 * @param {boolean} [options.show_trades] - Visibilité de la quête dans la communauté
	 * @param {number} [options.trade_mode] - Mode de trading (0 = Automatique, 1 = Mode expert)
	 * @param {number|null} [options.trade_offer_threshold] - Seuil minimal pour proposer en mode expert (0-30)
	 * @param {number|null} [options.trade_want_threshold] - Seuil maximal pour rechercher en mode expert (0-30)
	 * @param {boolean} [options.never_offer_normal] - Ne jamais proposer les monstres normaux (étapes 1-16)
	 * @param {boolean} [options.never_want_normal] - Ne jamais rechercher les monstres normaux (étapes 1-16)
	 * @param {boolean} [options.never_offer_boss] - Ne jamais proposer les boss (étapes 17-19)
	 * @param {boolean} [options.never_want_boss] - Ne jamais rechercher les boss (étapes 17-19)
	 * @param {boolean} [options.never_offer_archi] - Ne jamais proposer les archimonstres (étapes 20+)
	 * @param {boolean} [options.never_want_archi] - Ne jamais rechercher les archimonstres (étapes 20+)
 
	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * error?: string,
	 * retryAfter?: number,
	 * data?: QuestUpdated,
	 * }>}

	 * @example
	 * updateUserQuest("jean_api_key", "abcdef", {
	 * 		 character_name: "Mon personnage",
  	 * 	parallel_quests: 5,
  	 * 	current_step: 12,
  	 * 	show_trades: true,
  	 * 	trade_mode: 1,
  	 * 	trade_offer_threshold: 6,
  	 * 	trade_want_threshold: 1
	 * }); // Met à jour la quête de l'utilisateur et renvoi le payload (Object)
	 */
	async updateUserQuest(user_api_key, quest_slug, options) {
		let path = `${base}/quests/${quest_slug}`;
		const _body = {};

		if (options?.character_name) {
			_body.character_name = options.character_name;
		}
		if (options?.parallel_quests) {
			_body.parallel_quests = options.parallel_quests;
		}
		if (options?.current_step) {
			_body.current_step = options.current_step;
		}
		if (options?.show_trades) {
			_body.show_trades = options.show_trades;
		}
		if (options?.trade_mode) {
			_body.trade_mode = options.trade_mode;
		}
		if (options?.trade_offer_threshold) {
			_body.trade_offer_threshold = options.trade_offer_threshold;
		}
		if (options?.trade_want_threshold) {
			_body.trade_want_threshold = options.trade_want_threshold;
		}
		if (options?.never_offer_normal) {
			_body.never_offer_normal = options.never_offer_normal;
		}
		if (options?.never_want_normal) {
			_body.never_want_normal = options.never_want_normal;
		}
		if (options?.never_offer_boss) {
			_body.never_offer_boss = options.never_offer_boss;
		}
		if (options?.never_want_boss) {
			_body.never_want_boss = options.never_want_boss;
		}
		if (options?.never_offer_archi) {
			_body.never_offer_archi = options.never_offer_archi;
		}
		if (options?.never_want_archi) {
			_body.never_want_archi = options.never_want_archi;
		}

		let result = {};

		try {
			const _ = await fetch(path, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user_api_key}`,
				},
				body: JSON.stringify(_body),
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Modifier plusieurs monstres d'un utilisateur
	 * > **Limites** : - `quantity` : entre 0 et 30 - Maximum 200 monstres

	 * @typedef {object} UpdatedMonsters
	 * @property {number} updated_count
	 * @property {Array<Monster & { quantity: number, owned: number, status: number, effective_offer: number, effective_want: number }>} monsters

	 * @typedef {object} MonsterInput
	 * @property {MonsterName} monster_name
	 * @property {number} quantity

	 * @param {string} user_api_key
	 * @param {string} quest_slug
	 * @param {Array<MonsterInput>} monsters
 
	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * retryAfter?: number,
	 * error?: string,
	 * data?: UpdatedMonsters,
	 * }>}

	 * @example
	 * updateUserQuestMonsters("jean_api_key", "abcdef", [
	 * { monster_name: "Aboub", quantity: 5 },
	 * // ...autres monstres
	 * ]); // Met à jour les monstres de l'utilisateur et renvoi le payload (Object)
	 */
	async updateUserQuestMonsters(user_api_key, quest_slug, monsters) {
		let path = `${base}/quests/${quest_slug}/monsters`;

		for (const monster of monsters) {
			const m = monsterByName(monster.monster_name);

			if (!m) {
				throw new Error(`monster_name '${monster.monster_name}' doesn't exist`);
			}
		}

		const _body = {
			monsters: monsters.map((m) => ({
				monster_id: monsterByName(m.monster_name).id,
				quantity: m.quantity,
			})),
		};

		let result = {};

		try {
			const _ = await fetch(path, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user_api_key}`,
				},
				body: JSON.stringify(_body),
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				data.data.monsters = data.data.monsters.map((m) => {
					const monster = cache.monsters.find((x) => x.id === m.monster_id);

					delete m.monster_id;

					return {
						...monster,
						...m,
					};
				});
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}

	/**
	 * ### Paramètres de trade manuels
	 * Permet de forcer les quantités proposées et recherchées pour un monstre, au lieu d'utiliser le calcul automatique basé sur le statut.

	 * @typedef {object} TradeInput
	 * @property {number|null} [trade_offer] - Quantité à proposer (0 à owned). null = calcul automatique
	 * @property {number|null} [trade_want] - Quantité recherchée (0 à 30). null = calcul automatique

	 * @param {string} user_api_key
	 * @param {string} quest_slug
	 * @param {MonsterName} monster_name
	 * @param {TradeInput} options
 
	 * @returns {Promise<{
	 * ok: boolean,
	 * status: number,
	 * statusText: string,
	 * retryAfter?: number,
	 * error? string,
	 * data?: Monster & { trade_offer: number|null, trade_want: number|null },
	 * }>}

	 * @example
	 * updateUserQuestMonsterTrade("jean_api_key", "abcdef", "Aboub", { trade_offer: 1, trade_want: null }); // Met a jour le monstre Aboub (propose = 1, recherche = calcul automatique) et renvoi le payload ()
	 */
	async updateUserQuestMonsterTrade(
		user_api_key,
		quest_slug,
		monster_name,
		options,
	) {
		const monster = monsterByName(monster_name);

		if (!monster) {
			throw new Error(`monster_name '${monster_name}' doesn't exist`);
		}

		let path = `${base}/quests/${quest_slug}/monsters/${monster.id}/trade`;

		const _body = {
			trade_offer: options.trade_offer,
			trade_want: options.trade_want,
		};

		console.log("BODY SENT:", JSON.stringify(_body, null, 2));

		let result = {};

		try {
			const _ = await fetch(path, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user_api_key}`,
				},
				body: JSON.stringify(_body),
			});

			result.ok = _.ok;
			result.status = _.status;
			result.statusText = _.statusText;

			if (_.status === 429) {
				result.retryAfter = _.headers.get("Retry-After");
			}

			let data = {};

			if (result.ok) {
				data = convertIds(await _.json());

				data.data = {
					...cache.monsters.find((x) => x.id === data.data.monster_id),
					...data.data,
				};

				delete data.data.monster_id;
			}

			result = {
				...result,
				...data,
			};
		} catch (error) {
			result.ok = false;
			result.status = 500;
			result.statusText = "Internal Server Error";
			result.error = error.message ?? error.toString();
		}

		return result;
	}
};
