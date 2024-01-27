/* eslint-disable no-trailing-spaces */

const MetamobData = require("./Data.json");

module.exports = class {

	/**
     * **Instance Client**
	 *
	 * ---
	 * @param {{
	 * apiKey:string
	 * }} config clé API Metamob
	 *
	 * ---
	 * @example
	 * const client = new metamobapi({ apiKey:"votre_clé_api" });
     */
	constructor(config) {

		this.apiKey = config.apiKey;

		/**
		 * 👀 **Récupère les informations d'un utilisateur. Non sensible à la casse.**
		 *
		 * ---
		 * @param {string} username Nom d'utilisateur Metamob
		 *
		 * ---
		 * @returns {Promise<{
	 	 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:{
		 * pseudo:string,
		 * contact:string,
		 * presentation:string,
		 * image:string,
		 * image_url:string,
		 * etape:"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34",
		 * serveur:"Draconiros" | "HellMina" | "Imagiro" | "Ombre" | "Orukam" | "Oto-Mustam" | "Rosal" | "Rushu" | "TalKasha" | "Temporis" | "Tylezia" | "Brutas" | "Dodge" | "Grandapan" | "Herdegrize" | "Oshimo" | "Terra Cogita" | "Crail" | "Eratz" | "Galgarion" | "Henual",
		 * derniere_connexion:string,
		 * lien:string,
		 * },
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération du profil utilisateur  
		 * • `result?` : Résultat  
		 * > • `pseudo` : Pseudo de l'utilisateur  
		 * > • `contact` : Le contact indiqué à utiliser en jeu  
		 * > • `presentation` : Le texte de présentation  
		 * > • `image` : Le monstre utilisé pour l'icone  
		 * > • `image_url` : L'URL complète de l'icone  
		 * > • `etape` : L'étape actuelle de l'utilisateur  
		 * > • `serveur` : Le nom du serveur sur lequel joue cet utilisateur  
		 * > • `derniere_connexion` : La date de dernière connexion, au format YYYY-MM-DD HH:mm:ss  
		 * > • `lien` : Le lien vers la page de cet utilisateur
		 *
		 * ---
		 * @example
		 * client.getUser("nom_utilisateur").then(console.log);
		 */
		this.getUser = async (username) => {

			try {

				const _ = await fetch(`https://api.metamob.fr/utilisateurs/${username}`, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Récupère les monstres d'un utilisateur. Le nom d'utilisateur n'est pas sensible à la casse.**
		 *
		 * ---
		 * @param {string} username Nom d'utilisateur
		 * @param {{
         * monstre?:"Arakne" | "Arakne malade" | "Boufton blanc" | "Boufton noir" | "Crabe" | "Flammèche air" | "Flammèche eau" | "Flammèche feu" | "Flammèche terre" | "Larve bleue" | "Moskito" | "Piou bleu" | "Piou jaune" | "Piou rose" | "Piou rouge" | "Piou vert" | "Piou violet" | "Souris grise" | "Tofu" | "Tofu maléfique" | "Arakne des égoûts" | "Bandit du clan des Roublards" | "Bandit manchot" | "Black tiwabbit" | "Bouftou" | "Boulanger sombre" | "Champ champ" | "Gelée bleue" | "Gelée menthe" | "Gobet" | "Kolérat" | "Kwoan" | "Larve orange" | "Larve verte" | "Pissenlit diabolique" | "Rose démoniaque" | "Tiwabbit" | "Tiwabbit kiafin" | "Tofu malade" | "Tournesol sauvage" | "Berger Porkass" | "Biblop coco" | "Biblop griotte" | "Biblop indigo" | "Biblop reinette" | "Boo" | "Champa vert" | "Chef de Guerre Bouftou" | "Cochon de Lait" | "Crowneille" | "Gob-trotteur" | "Milirat Strubien" | "Nodkoko" | "Prespic" | "Sanglier" | "Tikoko" | "Tortue Jaune" | "Trukikol" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Mage" | "Corbac" | "Croc Gland" | "Croc Gland enragé" | "Etoile de la Mer d'Asse" | "Floristile" | "Fourbasse" | "Larve Jaune" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Noeul" | "Pichon Blanc" | "Pichon Bleu" | "Pichon Orange" | "Pichon Vert" | "Tortue Bleue" | "Tortue rouge" | "Tortue Verte" | "Abraknyde" | "Black Wabbit" | "Bwork" | "Bwork Archer" | "Chafer Invisible" | "Champa Bleu" | "Champa Marron" | "Champa Rouge" | "Craqueboule" | "Craqueleur" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Ishigro PakeKraméléhon" | "Mandrine" | "Mineur Sombre" | "Rose Obscure" | "Wabbit Squelette" | "Abrakne" | "Blop Coco" | "Blop Griotte" | "Blop Indigo" | "Blop Reinette" | "Boomba" | "Chafer" | "Chafer Fantassin" | "Cochon de Farle" | "Crocodaille" | "Pichon Kloune" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Scarafeuille Vert" | "Scaratos" | "Scélérat Strubien" | "Scorbute" | "Tronknyde" | "Aboub" | "Akakwa" | "Amlub" | "Arakne Majeure" | "Bulbuisson" | "Cavalier Porkass" | "Codem" | "Crustorail Kouraçao" | "Crustorail Malibout" | "Crustorail Morito" | "Crustorail Passaoh" | "Dragodinde Rousse Sauvage" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Let Emoliug" | "Nebgib" | "Nipul" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer Archer" | "Chafer d'élite" | "Chafer Lancier" | "Craqueleur des plaines" | "DoK Alako" | "Fangshu" | "Gamino" | "Koalak Immature" | "Kokoko" | "La Ouassingue" | "Le Ouassingue" | "Le Ouassingue Entourbé" | "Osurc" | "Palmifleur Malibout" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Ramane d'Egoutant" | "Sanglier Des Plaines" | "Susej" | "Chafer Draugr" | "Crachefoux" | "Craqueboule Poli" | "Dragacé" | "Ino-Naru" | "Kanniboul Ark" | "Kanniboul Eth" | "Kanniboul Jav" | "Kanniboul Sarbak" | "Kwak de Flamme" | "Kwak de Glace" | "Kwak de Terre" | "Kwak de Vent" | "Macien" | "Maître Bolet" | "Palmifleur Kouraçao" | "Porsalu" | "Rat d'Egoutant" | "Sarkapwane" | "Vétauran" | "Betto" | "Canondorf" | "Corailleur" | "Don Duss Ang" | "Dragoeuf Ardoise" | "Dragoeuf Argile" | "Dragoeuf Calcaire" | "DragOeuf Charbon" | "Félygiène" | "Koalak Coco" | "Koalak Griotte" | "Koalak Indigo" | "Koalak Reinette" | "Lolojiki" | "Moumoule" | "Nakunbra" | "Rat d'Hyoactif" | "Raul Mops" | "Serpiplume" | "Sparo" | "Barbroussa" | "Bitouf des plaines" | "Chef Crocodaille" | "Chiendent" | "Craqueleur poli" | "Don Dorgan" | "Fantôme Apero" | "Fantôme Aux Plates" | "Fantôme Egérie" | "Fantôme Hicide" | "Kanigrou" | "Kido" | "Kilibriss" | "Kurookin" | "Larve Champêtre" | "Mufafah" | "MulouNerbe" | "Serpentin" | "Souris Verte" | "Abrakne sombre" | "Abraknyde sombre" | "Alhyène" | "Bourdard" | "Chevaucheur koalak" | "Dragodinde Dorée sauvage" | "Dragueuse" | "Fossoyeur koalak" | "Foufayteur" | "Gloutovore" | "Guerrier koalak" | "Koalak forestier" | "Kokom" | "Meupette" | "Orfélin" | "Panthègros" | "Parashukouï" | "Pékeualak" | "Piralak" | "Warko marron" | "Bitouf sombre" | "Bizarbwork" | "Bourbassingue" | "Brouture" | "Disciple zoth" | "Dragnarok" | "Draguaindrop" | "Fécorce" | "Floribonde" | "Gamine zoth" | "Grenufar" | "Guerrier zoth" | "Koalak farouche" | "Koalak sanguin" | "Krambwork" | "Mama koalak" | "Médibwork" | "Mégabwork" | "Momie koalak" | "Warko violet" | "Abrakleur sombre" | "Boumbardier" | "Dragoss Ardoise" | "Dragoss Argile" | "Dragoss Calcaire" | "Dragoss Charbon" | "Drakoalak" | "Fauchalak" | "Kaniblou" | "Maître koalak" | "Malle Outillée" | "Poolay" | "Robionicle" | "Robot Fléau" | "Rouquette" | "Tétonuki" | "Tourbassingue" | "Troollaraj" | "Abrakleur clair" | "Bakazako" | "Bitouf aérien" | "Champ à gnons" | "Champaknyde" | "Champbis" | "Champmane" | "Champodonte" | "Jiangshi-nobi" | "Kaskargo" | "Lichangoro" | "Madura" | "Maître Zoth" | "Onabu-geisha" | "Pétartifoux" | "Roissingue" | "Sergent zoth" | "Tambouraï" | "Tromperelle" | "Tsukinochi" | "Kaonashi" | "Tsume-Bozu" | "Blop Coco Royal" | "Blop Griotte Royal" | "Blop Indigo Royal" | "Blop Reinette Royal" | "Bouftou Royal" | "Bworkette" | "Déminoboule" | "Dragon Cochon" | "Gelée Royale Bleue" | "Gelée Royale Menthe" | "Minotoror" | "Mob l'Eponge" | "Mominotor" | "Rat Blanc" | "Rat Noir" | "Scarabosse Doré" | "Shin Larve" | "Tofu Royal" | "Tournesol Affamé" | "Wabbit GM" | "Abraknyde ancestral" | "Blop multicolore royal" | "Corailleur magistral" | "Craqueleur légendaire" | "Gardienne des égouts" | "Gelée Royale Fraise" | "Gourlo le terrible" | "Hanshi" | "Hell Mina" | "Koulosse" | "Maître corbac" | "Meulou" | "Moon" | "Skeunk" | "Tanukoui San" | "Tynril ahuri" | "Tynril consterné" | "Tynril déconcerté" | "Tynril perfide" | "Wa wabbit" | "Bworker" | "Chêne mou" | "Crocabulia" | "Founamboul" | "Gelée Royale Citron" | "Haute Truche" | "Kimbo" | "Minotot" | "Ougah" | "Silf le rasboul majeur" | "Sphincter cell" | "Arachitik la Souffreteuse" | "Araknay la Galopante" | "Arakule la Revancharde" | "Boudalf le Blanc" | "Boulgourvil le Lointain" | "Chamchie le Difficile" | "Craraboss le Féérique" | "Larvonika l'Instrument" | "Mosketère le Dévoué" | "Pioufe la Maquillée" | "Pioukas la Plante" | "Pioulbrineur le Mercenaire" | "Pioulette la Coquine" | "Pioussokrim le Délétère" | "Pioustone le Problème" | "Pissdane l'Insipide" | "Sourizoto le Collant" | "Tofuldebeu l'Explosif" | "Tofumanchou l'Empereur" | "Tofurapin le Pétri" | "Bandapar l'Exclu" | "Bandson le Tonitruant" | "Boudur le Raide" | "Boufdégou le Refoulant" | "Gelanal le Huileux" | "Geloliaine l'Aérien" | "Gobstiniais le Têtu" | "Kolforthe l'Indécollable" | "Kwoanneur le Frimeur" | "Larchimaide la Poussée" | "Larvapstrè le Subjectif" | "Nodkoku le Trahi" | "Roz la Magicienne" | "Serpistol l'Illustre" | "Tikosto le Mousse" | "Tiwa'Missou le Gateux" | "Tiwalpé le Dévêtu" | "Tiwoflan le Lâche" | "Tour le Vice" | "Trukul le Lent" | "Bi le Partageur" | "Bilvoezé le Bonimenteur" | "Bistou le Quêteur" | "Bistou le Rieur" | "Boostif l'Affamé" | "Bouflet le Puéril" | "Champayr le Disjoncté" | "Chevaustine le Reconstruit" | "Chonstip la Passagère" | "Cromikay le Néophyte" | "Étoilette la Bouchée" | "Milipussien le Géant" | "Porfavor le Quémandeur" | "Preskapwal le Tendancieux" | "Robiolego l'Assemblé" | "Sangria le Fruité" | "Tortenssia la Fleurie" | "Torthur la Lutte" | "Vampunor le Glacial" | "Wabbitud le Constant" | "Bambouské le Camouflé" | "Barchwork le Multicolore" | "Bwormage le Respectueux" | "Corpat le Vampire" | "Crognan le Barbare" | "Fourapin le Chaud" | "Maître Amboat le Moqueur" | "Milipatte la Griffe" | "Minoskour le Sauveur" | "Minsinistre l'Elu" | "Neufedur le Flottant" | "Pichakoté le Dégoûtant" | "Pichdourse le Puissant" | "Pichduitre le Totem" | "Pichtoire l'Erudit" | "Robocoop l'Échangé" | "Rostensyl la Cuisinière" | "Tortilleur le Coulé" | "Tortorak le Cornu" | "Wagnagnah le Sanglant" | "Abrakroc l'Edenté" | "Bworkasse le Dégoûtant" | "Chafalfer l'Optimiste" | "Chamdblé le Cultivé" | "Chamflay le Ballonné" | "Champayt l'Odorant" | "Crakmitaine le Faucheur" | "Craquetuss le Piquant" | "Draglida la Disparue" | "Garsim le Mort" | "Gelaviv le Glaçon" | "Krapahut le Randonneur" | "Mallopiée l'Épineuse" | "Mandalo l'Aqueuse" | "Ribibi le Cher" | "Scapé l'Epée" | "Scaramel le Fondant" | "Scarfayss le Balafré" | "Scarouarze l'Epopée" | "Watdogue le Bien Nommé" | "Abrakadnuzar" | "Blof l'Apathique" | "Bloporte le Veule" | "Blordur l'Infect" | "Blorie l'Assourdissante" | "Boombata le Garde" | "Bulsavon le Gonflé" | "Chafemal le Bagarreur" | "Chaffoin le Sournois" | "Crolnareff l'Exilé" | "Cruskof le Rustre" | "Crustensyl le Pragmatique" | "Crustterus l'Organique" | "Dragnoute l'Irascible" | "Farlon l'Enfant" | "Larvomatik le Propre" | "Radoutable le Craint" | "Scaratyn l'Huître" | "Scorpitène l'Enflammé" | "Tronkoneuz la Tranchante" | "Aboudbra le Porteur" | "Ameur la Laide" | "Arabord la Cruche" | "Cavordemal le Sorcier" | "Chafmarcel le Fêtard" | "Chalan le Commerçant" | "Codenlgaz le Problème" | "Crusmeyer le Pervers" | "Floriste la Cannibale" | "Forboyar l'Enigmatique" | "Ginsenk le Stimulant" | "Grandilok le Clameur" | "Kiroyal le Sirupeux" | "Koktèle le Secoué" | "Let le Rond" | "Nelvin le Boulet" | "Nipulnislip l'Exhibitionniste" | "Osuxion le Vampirique" | "Susbewl l'Hypocrite" | "Wokènrôl le Danseur" | "Abrakildas le Vénérable" | "Chafrit le Barbare" | "Cramikaz le Suicidaire" | "Craquetou le Fissuré" | "Doktopuss le Maléfique" | "Germinol l'Indigent" | "Grenuche la Gentille" | "Kannibal le Lecteur" | "Kapota la Fraise" | "Koalastrof la Naturelle" | "Koko la Violente" | "Maître Onom le Régulier" | "Ouashouash l'Exubérant" | "Ouassébo l'Esthète" | "Ouature la Mobile" | "Palmiche le Serein" | "Palmiflette le Convivial" | "Palmito le Menteur" | "Ramitant le Dilettante" | "Sampi l'Eternel" | "Akaka le Souillé" | "Bebetto l'Intellectuel" | "Corboyard l'Enigmatique" | "Dragioli le Succulent" | "Kannémik le Maigre" | "Kannisterik le Forcené" | "Kwakamole l'Appétissant" | "Kwaké le Piraté" | "Kwakolak le Chocolaté" | "Kwakwatique le Trempé" | "Moumoute la Douce" | "Ougaould le Parasite" | "Palmbytch la Bronzée" | "Parapadkouï l'Émasculé" | "Porsalé le Râleur" | "Ratlbol l'Aigri" | "Rauligo le Sale" | "Sarkastik l'Incompris" | "Serpistule le Purulent" | "Vétaurine L'énergisé" | "Barebourd le Comte" | "Caboume l'Artilleur" | "Chiendanlémin l'Illusionniste" | "Dragkouine la Déguisée" | "Dragmoclaiss le Fataliste" | "Dragnostik le Sceptique" | "Dragstayr le Fonceur" | "Fandanleuil le Précis" | "Fanlabiz le Véloce" | "Fantoch le Pantin" | "Fantrask la Rêveuse" | "Koakofrui le Confit" | "Koamaembair le Coulant" | "Koarmit la Batracienne" | "Koaskette la Chapelière" | "Nakuneuye le Borgne" | "Nerdeubeu le Flagellant" | "Ratéhaifaim le Professeur" | "Sparoket le Lanceur" | "Tilolo la Bien Moulée" | "Alhoui le Répondeur" | "Bonpake le Chavireur" | "Bourde le Maladroit" | "Crathdogue le Cruel" | "Crok le Beau" | "Dragonienne l'Econome" | "Félyssion la Gourmande" | "Fouflay le Retombé" | "Guerrite le Veilleur" | "Kanasukr le Mielleux" | "Kanibière l'Encordée" | "Kido l'Âtre" | "Kilimanj'haro le Grimpeur" | "Larvaloeil l'Émue" | "Mufguedin le Suprême" | "Muloufok l'Hilarant" | "Orfélyre le Charmeur" | "Pantacour le Long" | "Souristiti l'Immortalisée" | "Toufou le Benêt" | "Abrakanette l'Encapsulé" | "Abraklette le Fondant" | "Bitoven le Musicien" | "Brouste l'Humiliant" | "Craquecrac l'Endurant" | "Diskord le Belliqueux" | "Dragdikal le Décisif" | "Dragobert le Monarque" | "Fossamoel le Juteux" | "Gloubibou le Gars" | "Inopenope le Négatif" | "Koamag'oel le Défiguré" | "Koasossyal le Psychopathe" | "Lichangora l'Immaculée" | "Meuroup le Prêtre" | "Pékeutar le Tireur" | "Piradain le Pingre" | "Rooroku l'Imposant" | "Tétonée la Plantureuse" | "Warkolad l'Etreinte" | "Abrakine le Sombre" | "Bouliver le Géant" | "Drageaufol la Joyeuse" | "Dragminster le Magicien" | "Dragtarus le Bellâtre" | "Drakolage le Tentateur" | "Draquetteur le Voleur" | "Ecorfé la Vive" | "Fangshui la Dysorthographiée" | "Faufoll la Joyeuse" | "Floanna la Blonde" | "Gastroth la Contagieuse" | "Guerumoth le Collant" | "Koalaboi le Calorifère" | "Koalvissie le Chauve" | "Mamakomou l'Âge" | "Momikonos la Bandelette" | "Pétarfoutu le Mouillé" | "Tourbiket le Virevoletant" | "Wara l'Amer" | "Abrinos le Clair" | "Bigbadaboum l'Élémentaire" | "Chamiléro le Malchanceux" | "Chamoute le Duveteux" | "Champmé le Méchant" | "Champolyon le Polyglotte" | "Champoul l'Illuminé" | "Crachefouxtre le Surpris" | "Don Kizoth l'Obstiné" | "Jiankor le Radoteur" | "Kaskapointhe la Couverte" | "Maître Koantik le Théoricien" | "Onabuémangé la Rassasiée" | "Poolopo la Traditionnelle" | "Seripoth l'Ennemi" | "Tambouille le Gastronome" | "Toutouf le Velu" | "Tromplamor le Survivant" | "Trooyé l'Oxydé" | "Tsucékoi la Colporteuse" | "Bakaglace le Congelé" | "Kaonucléair l'Instable" | "Madgang le Docteur" | "Roy le Merlin" | "Tronquette la Réduite" | "Tsumani l'Inondeur",
         * etape?:"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34",
         * type?:"monstre" | "archimonstre" | "boss",
         * quantite?:"===" | ">" | "<",
         * etat?:"recherche" | "propose" | "aucun",
		 * }} [params] **Paramètres de filtrage** :
		 *
		 * • `monstre?` : Le nom du monstre à filtrer. Le filtre s'effectue sur le champ "nom" mais aussi sur le champ "nom_normal" pour les archimonstres  
		 * • `etape?` : L'étape sur laquelle filtrer  
		 * • `type?` : Le type de monstre à afficher. N'accepte que "monstre", "archimonstre", et "boss"  
		 * • `quantite?` : Pour n'afficher que les monstres dont l'utilisateur possède la quantité indiquée.  
		 * * Si la valeur saisie commence par "<" alors les monstres affichées seront ceux dont la quantité est strictement inférieure à la valeur saisie.  
		 * * Si la valeur saisie commence par ">" alors les monstres affichées seront ceux dont la quantité est strictement supérieure à la valeur saisie.  
		 * * Si la valeur saisie comment par "===" alors les monstres affichées seront ceux dont la quantité est strictement égale à la valeur saisie.  
		 * Exemple: { quantite:"<5" } n'affichera que les monstres dont la quantité est strictement inférieure à 5.  
		 * 
		 * • `etat` : Pour filtrer la recherche par état ("propose", "recherche", "aucun")
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:Array<{
		 * id:"3" | "7" | "4" | "5" | "19" | "14" | "15" | "16" | "17" | "18" | "2" | "8" | "9" | "13" | "10" | "11" | "12" | "1" | "20" | "6" | "24" | "39" | "25" | "35" | "31" | "34" | "22" | "27" | "28" | "40" | "32" | "29" | "33" | "30" | "23" | "26" | "36" | "37" | "21" | "38" | "60" | "48" | "49" | "50" | "51" | "54" | "45" | "59" | "56" | "46" | "52" | "53" | "41" | "55" | "44" | "42" | "57" | "43" | "47" | "58" | "70" | "79" | "64" | "61" | "80" | "65" | "128" | "76" | "62" | "72" | "75" | "73" | "74" | "66" | "67" | "68" | "69" | "63" | "71" | "78" | "98" | "82" | "97" | "84" | "95" | "85" | "86" | "87" | "88" | "96" | "92" | "91" | "93" | "217" | "99" | "89" | "83" | "81" | "94" | "115" | "105" | "106" | "107" | "108" | "111" | "116" | "113" | "109" | "117" | "114" | "104" | "100" | "101" | "102" | "103" | "110" | "118" | "119" | "112" | "132" | "185" | "133" | "127" | "126" | "131" | "134" | "122" | "123" | "124" | "125" | "120" | "121" | "135" | "129" | "136" | "137" | "138" | "139" | "130" | "157" | "143" | "160" | "144" | "158" | "145" | "268" | "147" | "146" | "142" | "151" | "152" | "149" | "140" | "153" | "154" | "155" | "148" | "156" | "141" | "178" | "285" | "162" | "179" | "229" | "164" | "167" | "165" | "166" | "174" | "175" | "173" | "172" | "171" | "161" | "170" | "176" | "169" | "168" | "177" | "183" | "187" | "182" | "190" | "194" | "192" | "191" | "193" | "77" | "195" | "196" | "197" | "198" | "186" | "188" | "189" | "199" | "184" | "181" | "200" | "207" | "213" | "210" | "201" | "214" | "206" | "202" | "203" | "205" | "204" | "212" | "218" | "219" | "241" | "220" | "215" | "216" | "209" | "211" | "208" | "237" | "230" | "638" | "221" | "239" | "238" | "224" | "232" | "222" | "236" | "225" | "233" | "159" | "240" | "227" | "223" | "180" | "235" | "234" | "228" | "251" | "244" | "257" | "249" | "248" | "242" | "243" | "253" | "252" | "259" | "163" | "260" | "254" | "250" | "245" | "255" | "246" | "247" | "256" | "258" | "262" | "270" | "266" | "264" | "263" | "265" | "269" | "271" | "276" | "272" | "274" | "273" | "277" | "275" | "295" | "231" | "261" | "278" | "282" | "298" | "281" | "291" | "284" | "290" | "292" | "287" | "294" | "280" | "226" | "297" | "283" | "293" | "267" | "296" | "279" | "289" | "286" | "288" | "299" | "300" | "314" | "315" | "316" | "317" | "302" | "309" | "312" | "310" | "304" | "305" | "320" | "301" | "311" | "319" | "318" | "308" | "306" | "313" | "303" | "307" | "335" | "327" | "328" | "323" | "324" | "325" | "329" | "336" | "321" | "333" | "326" | "330" | "332" | "334" | "322" | "337" | "338" | "339" | "340" | "331" | "343" | "349" | "347" | "348" | "341" | "342" | "351" | "345" | "350" | "346" | "344" | "358" | "371" | "354" | "355" | "356" | "369" | "364" | "365" | "353" | "366" | "362" | "360" | "361" | "363" | "359" | "370" | "352" | "367" | "357" | "368" | "372" | "387" | "383" | "377" | "374" | "379" | "388" | "378" | "375" | "376" | "380" | "389" | "373" | "381" | "390" | "382" | "384" | "385" | "386" | "391" | "397" | "396" | "398" | "399" | "402" | "409" | "393" | "400" | "404" | "410" | "394" | "401" | "407" | "403" | "408" | "392" | "411" | "405" | "395" | "406" | "412" | "431" | "426" | "413" | "428" | "421" | "419" | "422" | "423" | "430" | "424" | "417" | "415" | "414" | "416" | "420" | "429" | "425" | "418" | "427" | "445" | "444" | "442" | "434" | "433" | "432" | "443" | "435" | "439" | "438" | "440" | "446" | "437" | "436" | "451" | "447" | "450" | "448" | "449" | "441" | "462" | "455" | "454" | "453" | "452" | "456" | "468" | "463" | "459" | "464" | "471" | "470" | "469" | "467" | "457" | "460" | "465" | "458" | "466" | "461" | "479" | "480" | "475" | "478" | "490" | "491" | "481" | "472" | "474" | "473" | "482" | "476" | "483" | "489" | "484" | "485" | "486" | "487" | "488" | "477" | "503" | "506" | "504" | "507" | "493" | "494" | "509" | "510" | "511" | "495" | "505" | "508" | "498" | "497" | "496" | "500" | "501" | "499" | "492" | "502" | "530" | "529" | "518" | "524" | "512" | "513" | "522" | "519" | "521" | "520" | "526" | "517" | "515" | "527" | "523" | "516" | "531" | "514" | "528" | "525" | "550" | "533" | "545" | "537" | "536" | "538" | "535" | "547" | "546" | "548" | "549" | "540" | "539" | "542" | "541" | "534" | "551" | "543" | "544" | "532" | "559" | "563" | "568" | "552" | "554" | "570" | "557" | "569" | "571" | "560" | "558" | "564" | "565" | "566" | "561" | "562" | "556" | "555" | "567" | "553" | "576" | "583" | "591" | "590" | "573" | "589" | "587" | "588" | "578" | "579" | "575" | "584" | "580" | "572" | "585" | "581" | "582" | "586" | "577" | "574" | "603" | "598" | "607" | "604" | "605" | "611" | "606" | "592" | "609" | "612" | "593" | "600" | "601" | "595" | "594" | "596" | "597" | "608" | "602" | "599" | "619" | "610" | "621" | "624" | "629" | "628" | "627" | "622" | "620" | "631" | "617" | "613" | "630" | "614" | "616" | "626" | "618" | "623" | "615" | "625" | "635" | "637" | "634" | "633" | "632" | "636",
         * nom:"Arakne" | "Arakne malade" | "Boufton blanc" | "Boufton noir" | "Crabe" | "Flammèche air" | "Flammèche eau" | "Flammèche feu" | "Flammèche terre" | "Larve bleue" | "Moskito" | "Piou bleu" | "Piou jaune" | "Piou rose" | "Piou rouge" | "Piou vert" | "Piou violet" | "Souris grise" | "Tofu" | "Tofu maléfique" | "Arakne des égoûts" | "Bandit du clan des Roublards" | "Bandit manchot" | "Black tiwabbit" | "Bouftou" | "Boulanger sombre" | "Champ champ" | "Gelée bleue" | "Gelée menthe" | "Gobet" | "Kolérat" | "Kwoan" | "Larve orange" | "Larve verte" | "Pissenlit diabolique" | "Rose démoniaque" | "Tiwabbit" | "Tiwabbit kiafin" | "Tofu malade" | "Tournesol sauvage" | "Berger Porkass" | "Biblop coco" | "Biblop griotte" | "Biblop indigo" | "Biblop reinette" | "Boo" | "Champa vert" | "Chef de Guerre Bouftou" | "Cochon de Lait" | "Crowneille" | "Gob-trotteur" | "Milirat Strubien" | "Nodkoko" | "Prespic" | "Sanglier" | "Tikoko" | "Tortue Jaune" | "Trukikol" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Mage" | "Corbac" | "Croc Gland" | "Croc Gland enragé" | "Etoile de la Mer d'Asse" | "Floristile" | "Fourbasse" | "Larve Jaune" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Noeul" | "Pichon Blanc" | "Pichon Bleu" | "Pichon Orange" | "Pichon Vert" | "Tortue Bleue" | "Tortue rouge" | "Tortue Verte" | "Abraknyde" | "Black Wabbit" | "Bwork" | "Bwork Archer" | "Chafer Invisible" | "Champa Bleu" | "Champa Marron" | "Champa Rouge" | "Craqueboule" | "Craqueleur" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Ishigro PakeKraméléhon" | "Mandrine" | "Mineur Sombre" | "Rose Obscure" | "Wabbit Squelette" | "Abrakne" | "Blop Coco" | "Blop Griotte" | "Blop Indigo" | "Blop Reinette" | "Boomba" | "Chafer" | "Chafer Fantassin" | "Cochon de Farle" | "Crocodaille" | "Pichon Kloune" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Scarafeuille Vert" | "Scaratos" | "Scélérat Strubien" | "Scorbute" | "Tronknyde" | "Aboub" | "Akakwa" | "Amlub" | "Arakne Majeure" | "Bulbuisson" | "Cavalier Porkass" | "Codem" | "Crustorail Kouraçao" | "Crustorail Malibout" | "Crustorail Morito" | "Crustorail Passaoh" | "Dragodinde Rousse Sauvage" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Let Emoliug" | "Nebgib" | "Nipul" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer Archer" | "Chafer d'élite" | "Chafer Lancier" | "Craqueleur des plaines" | "DoK Alako" | "Fangshu" | "Gamino" | "Koalak Immature" | "Kokoko" | "La Ouassingue" | "Le Ouassingue" | "Le Ouassingue Entourbé" | "Osurc" | "Palmifleur Malibout" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Ramane d'Egoutant" | "Sanglier Des Plaines" | "Susej" | "Chafer Draugr" | "Crachefoux" | "Craqueboule Poli" | "Dragacé" | "Ino-Naru" | "Kanniboul Ark" | "Kanniboul Eth" | "Kanniboul Jav" | "Kanniboul Sarbak" | "Kwak de Flamme" | "Kwak de Glace" | "Kwak de Terre" | "Kwak de Vent" | "Macien" | "Maître Bolet" | "Palmifleur Kouraçao" | "Porsalu" | "Rat d'Egoutant" | "Sarkapwane" | "Vétauran" | "Betto" | "Canondorf" | "Corailleur" | "Don Duss Ang" | "Dragoeuf Ardoise" | "Dragoeuf Argile" | "Dragoeuf Calcaire" | "DragOeuf Charbon" | "Félygiène" | "Koalak Coco" | "Koalak Griotte" | "Koalak Indigo" | "Koalak Reinette" | "Lolojiki" | "Moumoule" | "Nakunbra" | "Rat d'Hyoactif" | "Raul Mops" | "Serpiplume" | "Sparo" | "Barbroussa" | "Bitouf des plaines" | "Chef Crocodaille" | "Chiendent" | "Craqueleur poli" | "Don Dorgan" | "Fantôme Apero" | "Fantôme Aux Plates" | "Fantôme Egérie" | "Fantôme Hicide" | "Kanigrou" | "Kido" | "Kilibriss" | "Kurookin" | "Larve Champêtre" | "Mufafah" | "MulouNerbe" | "Serpentin" | "Souris Verte" | "Abrakne sombre" | "Abraknyde sombre" | "Alhyène" | "Bourdard" | "Chevaucheur koalak" | "Dragodinde Dorée sauvage" | "Dragueuse" | "Fossoyeur koalak" | "Foufayteur" | "Gloutovore" | "Guerrier koalak" | "Koalak forestier" | "Kokom" | "Meupette" | "Orfélin" | "Panthègros" | "Parashukouï" | "Pékeualak" | "Piralak" | "Warko marron" | "Bitouf sombre" | "Bizarbwork" | "Bourbassingue" | "Brouture" | "Disciple zoth" | "Dragnarok" | "Draguaindrop" | "Fécorce" | "Floribonde" | "Gamine zoth" | "Grenufar" | "Guerrier zoth" | "Koalak farouche" | "Koalak sanguin" | "Krambwork" | "Mama koalak" | "Médibwork" | "Mégabwork" | "Momie koalak" | "Warko violet" | "Abrakleur sombre" | "Boumbardier" | "Dragoss Ardoise" | "Dragoss Argile" | "Dragoss Calcaire" | "Dragoss Charbon" | "Drakoalak" | "Fauchalak" | "Kaniblou" | "Maître koalak" | "Malle Outillée" | "Poolay" | "Robionicle" | "Robot Fléau" | "Rouquette" | "Tétonuki" | "Tourbassingue" | "Troollaraj" | "Abrakleur clair" | "Bakazako" | "Bitouf aérien" | "Champ à gnons" | "Champaknyde" | "Champbis" | "Champmane" | "Champodonte" | "Jiangshi-nobi" | "Kaskargo" | "Lichangoro" | "Madura" | "Maître Zoth" | "Onabu-geisha" | "Pétartifoux" | "Roissingue" | "Sergent zoth" | "Tambouraï" | "Tromperelle" | "Tsukinochi" | "Kaonashi" | "Tsume-Bozu" | "Blop Coco Royal" | "Blop Griotte Royal" | "Blop Indigo Royal" | "Blop Reinette Royal" | "Bouftou Royal" | "Bworkette" | "Déminoboule" | "Dragon Cochon" | "Gelée Royale Bleue" | "Gelée Royale Menthe" | "Minotoror" | "Mob l'Eponge" | "Mominotor" | "Rat Blanc" | "Rat Noir" | "Scarabosse Doré" | "Shin Larve" | "Tofu Royal" | "Tournesol Affamé" | "Wabbit GM" | "Abraknyde ancestral" | "Blop multicolore royal" | "Corailleur magistral" | "Craqueleur légendaire" | "Gardienne des égouts" | "Gelée Royale Fraise" | "Gourlo le terrible" | "Hanshi" | "Hell Mina" | "Koulosse" | "Maître corbac" | "Meulou" | "Moon" | "Skeunk" | "Tanukoui San" | "Tynril ahuri" | "Tynril consterné" | "Tynril déconcerté" | "Tynril perfide" | "Wa wabbit" | "Bworker" | "Chêne mou" | "Crocabulia" | "Founamboul" | "Gelée Royale Citron" | "Haute Truche" | "Kimbo" | "Minotot" | "Ougah" | "Silf le rasboul majeur" | "Sphincter cell" | "Arachitik la Souffreteuse" | "Araknay la Galopante" | "Arakule la Revancharde" | "Boudalf le Blanc" | "Boulgourvil le Lointain" | "Chamchie le Difficile" | "Craraboss le Féérique" | "Larvonika l'Instrument" | "Mosketère le Dévoué" | "Pioufe la Maquillée" | "Pioukas la Plante" | "Pioulbrineur le Mercenaire" | "Pioulette la Coquine" | "Pioussokrim le Délétère" | "Pioustone le Problème" | "Pissdane l'Insipide" | "Sourizoto le Collant" | "Tofuldebeu l'Explosif" | "Tofumanchou l'Empereur" | "Tofurapin le Pétri" | "Bandapar l'Exclu" | "Bandson le Tonitruant" | "Boudur le Raide" | "Boufdégou le Refoulant" | "Gelanal le Huileux" | "Geloliaine l'Aérien" | "Gobstiniais le Têtu" | "Kolforthe l'Indécollable" | "Kwoanneur le Frimeur" | "Larchimaide la Poussée" | "Larvapstrè le Subjectif" | "Nodkoku le Trahi" | "Roz la Magicienne" | "Serpistol l'Illustre" | "Tikosto le Mousse" | "Tiwa'Missou le Gateux" | "Tiwalpé le Dévêtu" | "Tiwoflan le Lâche" | "Tour le Vice" | "Trukul le Lent" | "Bi le Partageur" | "Bilvoezé le Bonimenteur" | "Bistou le Quêteur" | "Bistou le Rieur" | "Boostif l'Affamé" | "Bouflet le Puéril" | "Champayr le Disjoncté" | "Chevaustine le Reconstruit" | "Chonstip la Passagère" | "Cromikay le Néophyte" | "Étoilette la Bouchée" | "Milipussien le Géant" | "Porfavor le Quémandeur" | "Preskapwal le Tendancieux" | "Robiolego l'Assemblé" | "Sangria le Fruité" | "Tortenssia la Fleurie" | "Torthur la Lutte" | "Vampunor le Glacial" | "Wabbitud le Constant" | "Bambouské le Camouflé" | "Barchwork le Multicolore" | "Bwormage le Respectueux" | "Corpat le Vampire" | "Crognan le Barbare" | "Fourapin le Chaud" | "Maître Amboat le Moqueur" | "Milipatte la Griffe" | "Minoskour le Sauveur" | "Minsinistre l'Elu" | "Neufedur le Flottant" | "Pichakoté le Dégoûtant" | "Pichdourse le Puissant" | "Pichduitre le Totem" | "Pichtoire l'Erudit" | "Robocoop l'Échangé" | "Rostensyl la Cuisinière" | "Tortilleur le Coulé" | "Tortorak le Cornu" | "Wagnagnah le Sanglant" | "Abrakroc l'Edenté" | "Bworkasse le Dégoûtant" | "Chafalfer l'Optimiste" | "Chamdblé le Cultivé" | "Chamflay le Ballonné" | "Champayt l'Odorant" | "Crakmitaine le Faucheur" | "Craquetuss le Piquant" | "Draglida la Disparue" | "Garsim le Mort" | "Gelaviv le Glaçon" | "Krapahut le Randonneur" | "Mallopiée l'Épineuse" | "Mandalo l'Aqueuse" | "Ribibi le Cher" | "Scapé l'Epée" | "Scaramel le Fondant" | "Scarfayss le Balafré" | "Scarouarze l'Epopée" | "Watdogue le Bien Nommé" | "Abrakadnuzar" | "Blof l'Apathique" | "Bloporte le Veule" | "Blordur l'Infect" | "Blorie l'Assourdissante" | "Boombata le Garde" | "Bulsavon le Gonflé" | "Chafemal le Bagarreur" | "Chaffoin le Sournois" | "Crolnareff l'Exilé" | "Cruskof le Rustre" | "Crustensyl le Pragmatique" | "Crustterus l'Organique" | "Dragnoute l'Irascible" | "Farlon l'Enfant" | "Larvomatik le Propre" | "Radoutable le Craint" | "Scaratyn l'Huître" | "Scorpitène l'Enflammé" | "Tronkoneuz la Tranchante" | "Aboudbra le Porteur" | "Ameur la Laide" | "Arabord la Cruche" | "Cavordemal le Sorcier" | "Chafmarcel le Fêtard" | "Chalan le Commerçant" | "Codenlgaz le Problème" | "Crusmeyer le Pervers" | "Floriste la Cannibale" | "Forboyar l'Enigmatique" | "Ginsenk le Stimulant" | "Grandilok le Clameur" | "Kiroyal le Sirupeux" | "Koktèle le Secoué" | "Let le Rond" | "Nelvin le Boulet" | "Nipulnislip l'Exhibitionniste" | "Osuxion le Vampirique" | "Susbewl l'Hypocrite" | "Wokènrôl le Danseur" | "Abrakildas le Vénérable" | "Chafrit le Barbare" | "Cramikaz le Suicidaire" | "Craquetou le Fissuré" | "Doktopuss le Maléfique" | "Germinol l'Indigent" | "Grenuche la Gentille" | "Kannibal le Lecteur" | "Kapota la Fraise" | "Koalastrof la Naturelle" | "Koko la Violente" | "Maître Onom le Régulier" | "Ouashouash l'Exubérant" | "Ouassébo l'Esthète" | "Ouature la Mobile" | "Palmiche le Serein" | "Palmiflette le Convivial" | "Palmito le Menteur" | "Ramitant le Dilettante" | "Sampi l'Eternel" | "Akaka le Souillé" | "Bebetto l'Intellectuel" | "Corboyard l'Enigmatique" | "Dragioli le Succulent" | "Kannémik le Maigre" | "Kannisterik le Forcené" | "Kwakamole l'Appétissant" | "Kwaké le Piraté" | "Kwakolak le Chocolaté" | "Kwakwatique le Trempé" | "Moumoute la Douce" | "Ougaould le Parasite" | "Palmbytch la Bronzée" | "Parapadkouï l'Émasculé" | "Porsalé le Râleur" | "Ratlbol l'Aigri" | "Rauligo le Sale" | "Sarkastik l'Incompris" | "Serpistule le Purulent" | "Vétaurine L'énergisé" | "Barebourd le Comte" | "Caboume l'Artilleur" | "Chiendanlémin l'Illusionniste" | "Dragkouine la Déguisée" | "Dragmoclaiss le Fataliste" | "Dragnostik le Sceptique" | "Dragstayr le Fonceur" | "Fandanleuil le Précis" | "Fanlabiz le Véloce" | "Fantoch le Pantin" | "Fantrask la Rêveuse" | "Koakofrui le Confit" | "Koamaembair le Coulant" | "Koarmit la Batracienne" | "Koaskette la Chapelière" | "Nakuneuye le Borgne" | "Nerdeubeu le Flagellant" | "Ratéhaifaim le Professeur" | "Sparoket le Lanceur" | "Tilolo la Bien Moulée" | "Alhoui le Répondeur" | "Bonpake le Chavireur" | "Bourde le Maladroit" | "Crathdogue le Cruel" | "Crok le Beau" | "Dragonienne l'Econome" | "Félyssion la Gourmande" | "Fouflay le Retombé" | "Guerrite le Veilleur" | "Kanasukr le Mielleux" | "Kanibière l'Encordée" | "Kido l'Âtre" | "Kilimanj'haro le Grimpeur" | "Larvaloeil l'Émue" | "Mufguedin le Suprême" | "Muloufok l'Hilarant" | "Orfélyre le Charmeur" | "Pantacour le Long" | "Souristiti l'Immortalisée" | "Toufou le Benêt" | "Abrakanette l'Encapsulé" | "Abraklette le Fondant" | "Bitoven le Musicien" | "Brouste l'Humiliant" | "Craquecrac l'Endurant" | "Diskord le Belliqueux" | "Dragdikal le Décisif" | "Dragobert le Monarque" | "Fossamoel le Juteux" | "Gloubibou le Gars" | "Inopenope le Négatif" | "Koamag'oel le Défiguré" | "Koasossyal le Psychopathe" | "Lichangora l'Immaculée" | "Meuroup le Prêtre" | "Pékeutar le Tireur" | "Piradain le Pingre" | "Rooroku l'Imposant" | "Tétonée la Plantureuse" | "Warkolad l'Etreinte" | "Abrakine le Sombre" | "Bouliver le Géant" | "Drageaufol la Joyeuse" | "Dragminster le Magicien" | "Dragtarus le Bellâtre" | "Drakolage le Tentateur" | "Draquetteur le Voleur" | "Ecorfé la Vive" | "Fangshui la Dysorthographiée" | "Faufoll la Joyeuse" | "Floanna la Blonde" | "Gastroth la Contagieuse" | "Guerumoth le Collant" | "Koalaboi le Calorifère" | "Koalvissie le Chauve" | "Mamakomou l'Âge" | "Momikonos la Bandelette" | "Pétarfoutu le Mouillé" | "Tourbiket le Virevoletant" | "Wara l'Amer" | "Abrinos le Clair" | "Bigbadaboum l'Élémentaire" | "Chamiléro le Malchanceux" | "Chamoute le Duveteux" | "Champmé le Méchant" | "Champolyon le Polyglotte" | "Champoul l'Illuminé" | "Crachefouxtre le Surpris" | "Don Kizoth l'Obstiné" | "Jiankor le Radoteur" | "Kaskapointhe la Couverte" | "Maître Koantik le Théoricien" | "Onabuémangé la Rassasiée" | "Poolopo la Traditionnelle" | "Seripoth l'Ennemi" | "Tambouille le Gastronome" | "Toutouf le Velu" | "Tromplamor le Survivant" | "Trooyé l'Oxydé" | "Tsucékoi la Colporteuse" | "Bakaglace le Congelé" | "Kaonucléair l'Instable" | "Madgang le Docteur" | "Roy le Merlin" | "Tronquette la Réduite" | "Tsumani l'Inondeur",
         * slug:"arakne" | "arakne malade" | "boufton blanc" | "boufton noir" | "crabe" | "flammeche air" | "flammeche eau" | "flammeche feu" | "flammeche terre" | "larve bleue" | "moskito" | "piou bleu" | "piou jaune" | "piou rose" | "piou rouge" | "piou vert" | "piou violet" | "souris grise" | "tofu" | "tofu malefique" | "arakne des egouts" | "bandit du clan des roublards" | "bandit manchot" | "black tiwabbit" | "bouftou" | "boulanger sombre" | "champ champ" | "gelee bleue" | "gelee menthe" | "gobet" | "kolerat" | "kwoan" | "larve orange" | "larve verte" | "pissenlit diabolique" | "rose demoniaque" | "tiwabbit" | "tiwabbit kiafin" | "tofu malade" | "tournesol sauvage" | "berger porkass" | "biblop coco" | "biblop griotte" | "biblop indigo" | "biblop reinette" | "boo" | "champa vert" | "chef de guerre bouftou" | "cochon de lait" | "crowneille" | "gob-trotteur" | "milirat strubien" | "nodkoko" | "prespic" | "sanglier" | "tikoko" | "tortue jaune" | "trukikol" | "vampire" | "wabbit" | "bambouto" | "bwork mage" | "corbac" | "croc gland" | "croc gland enrage" | "etoile de la mer d asse" | "floristile" | "fourbasse" | "larve jaune" | "maitre vampire" | "milimulou" | "minoskito" | "noeul" | "pichon blanc" | "pichon bleu" | "pichon orange" | "pichon vert" | "tortue bleue" | "tortue rouge" | "tortue verte" | "abraknyde" | "black wabbit" | "bwork" | "bwork archer" | "chafer invisible" | "champa bleu" | "champa marron" | "champa rouge" | "craqueboule" | "craqueleur" | "dragodinde amande sauvage" | "gargrouille" | "gelee fraise" | "ishigro pake" | "kramelehon" | "mandrine" | "mineur sombre" | "rose obscure" | "wabbit squelette" | "abrakne" | "blop coco" | "blop griotte" | "blop indigo" | "blop reinette" | "boomba" | "chafer" | "chafer fantassin" | "cochon de farle" | "crocodaille" | "pichon kloune" | "rib" | "scarafeuille blanc" | "scarafeuille bleu" | "scarafeuille rouge" | "scarafeuille vert" | "scaratos" | "scelerat strubien" | "scorbute" | "tronknyde" | "aboub" | "akakwa" | "amlub" | "arakne majeure" | "bulbuisson" | "cavalier porkass" | "codem" | "crustorail kouracao" | "crustorail malibout" | "crustorail morito" | "crustorail passaoh" | "dragodinde rousse sauvage" | "forgeron sombre" | "gink" | "grand pa wabbit" | "kirevam" | "let emoliug" | "nebgib" | "nipul" | "wo wabbit" | "abraknyde venerable" | "chafer archer" | "chafer d elite" | "chafer lancier" | "craqueleur des plaines" | "dok alako" | "fangshu" | "gamino" | "koalak immature" | "kokoko" | "la ouassingue" | "le ouassingue" | "le ouassingue entourbe" | "osurc" | "palmifleur malibout" | "palmifleur morito" | "palmifleur passaoh" | "ramane d egoutant" | "sanglier des plaines" | "susej" | "chafer draugr" | "crachefoux" | "craqueboule poli" | "dragace" | "ino naru" | "kanniboul ark" | "kanniboul eth" | "kanniboul jav" | "kanniboul sarbak" | "kwak de flamme" | "kwak de glace" | "kwak de terre" | "kwak de vent" | "macien" | "maitre bolet" | "palmifleur kouracao" | "porsalu" | "rat d egoutant" | "sarkapwane" | "vetauran" | "betto" | "canondorf" | "corailleur" | "don duss ang" | "dragoeuf ardoise" | "dragoeuf argile" | "dragoeuf calcaire" | "dragoeuf charbon" | "felygiene" | "koalak coco" | "koalak griotte" | "koalak indigo" | "koalak reinette" | "lolojiki" | "moumoule" | "nakunbra" | "rat d hyoactif" | "raul mops" | "serpiplume" | "sparo" | "barbroussa" | "bitouf des plaines" | "chef crocodaille" | "chiendent" | "craqueleur poli" | "don dorgan" | "fantome apero" | "fantome aux plates" | "fantome egerie" | "fantome hicide" | "kanigrou" | "kido" | "kilibriss" | "kurookin" | "larve champetre" | "mufafah" | "mulou" | "nerbe" | "serpentin" | "souris verte" | "abrakne sombre" | "abraknyde sombre" | "alhyene" | "bourdard" | "chevaucheur koalak" | "dragodinde doree sauvage" | "dragueuse" | "fossoyeur koalak" | "foufayteur" | "gloutovore" | "guerrier koalak" | "koalak forestier" | "kokom" | "meupette" | "orfelin" | "panthegros" | "parashukoui" | "pekeualak" | "piralak" | "warko marron" | "bitouf sombre" | "bizarbwork" | "bourbassingue" | "brouture" | "disciple zoth" | "dragnarok" | "draguaindrop" | "fecorce" | "floribonde" | "gamine zoth" | "grenufar" | "guerrier zoth" | "koalak farouche" | "koalak sanguin" | "krambwork" | "mama koalak" | "medibwork" | "megabwork" | "momie koalak" | "warko violet" | "abrakleur sombre" | "boumbardier" | "dragoss ardoise" | "dragoss argile" | "dragoss calcaire" | "dragoss charbon" | "drakoalak" | "fauchalak" | "kaniblou" | "maitre koalak" | "malle outillee" | "poolay" | "robionicle" | "robot fleau" | "rouquette" | "tetonuki" | "tourbassingue" | "troollaraj" | "abrakleur clair" | "bakazako" | "bitouf aerien" | "champ a gnons" | "champaknyde" | "champbis" | "champmane" | "champodonte" | "jiangshi nobi" | "kaskargo" | "lichangoro" | "madura" | "maitre zoth" | "onabu geisha" | "petartifoux" | "roissingue" | "sergent zoth" | "tambourai" | "tromperelle" | "tsukinochi" | "kaonashi" | "tsume bozu" | "blop coco royal" | "blop griotte royal" | "blop indigo royal" | "blop reinette royal" | "bouftou royal" | "bworkette" | "deminoboule" | "dragon cochon" | "gelee royale bleue" | "gelee royale menthe" | "minotoror" | "mob eponge" | "mominotor" | "rat blanc" | "rat noir" | "scarabosse dore" | "shin larve" | "tofu royal" | "tournesol affame" | "wabbit gm" | "abraknyde ancestral" | "blop multicolore royal" | "corailleur magistral" | "craqueleur legendaire" | "gardienne des egouts" | "gelee royale fraise" | "gourlo le terrible" | "hanshi" | "hell mina" | "koulosse" | "maitre corbac" | "meulou" | "moon" | "skeunk" | "tanukoui san" | "tynril ahuri" | "tynril consterne" | "tynril deconcerte" | "tynril perfide" | "wa wabbit" | "bworker" | "chene mou" | "crocabulia" | "founamboul" | "gelee royale citron" | "haute truche" | "kimbo" | "minotot" | "ougah" | "silf le rasboul majeur" | "sphincter cell" | "arachitik la souffreteuse" | "araknay la galopante" | "arakule la revancharde" | "boudalf le blanc" | "boulgourvil le lointain" | "chamchie le difficile" | "craraboss le feerique" | "larvonika instrument" | "mosketere le devoue" | "pioufe la maquillee" | "pioukas la plante" | "pioulbrineur le mercenaire" | "pioulette la coquine" | "pioussokrim le deletere" | "pioustone le probleme" | "pissdane insipide" | "sourizoto le collant" | "tofuldebeu explosif" | "tofumanchou empereur" | "tofurapin le petri" | "bandapar exclu" | "bandson le tonitruant" | "boudur le raide" | "boufdegou le refoulant" | "gelanal le huileux" | "geloliaine aerien" | "gobstiniais le tetu" | "kolforthe indecollable" | "kwoanneur le frimeur" | "larchimaide la poussee" | "larvapstre le subjectif" | "nodkoku le trahi" | "roz la magicienne" | "serpistol illustre" | "tikosto le mousse" | "tiwa missou le gateux" | "tiwalpe le devetu" | "tiwoflan le lache" | "tour le vice" | "trukul le lent" | "bi le partageur" | "bilvoeze le bonimenteur" | "bistou le queteur" | "bistou le rieur" | "boostif affame" | "bouflet le pueril" | "champayr le disjoncte" | "chevaustine le reconstruit" | "chonstip la passagere" | "cromikay le neophyte" | "Etoilette la Bouchee" | "milipussien le geant" | "porfavor le quemandeur" | "preskapwal le tendancieux" | "robiolego assemble" | "sangria le fruite" | "tortenssia la fleurie" | "torthur la lutte" | "vampunor le glacial" | "wabbitud le constant" | "bambouske le camoufle" | "barchwork le multicolore" | "bwormage le respectueux" | "corpat le vampire" | "crognan le barbare" | "fourapin le chaud" | "maitre amboat le moqueur" | "milipatte la griffe" | "minoskour le sauveur" | "minsinistre elu" | "neufedur le flottant" | "pichakote le degoutant" | "pichdourse le puissant" | "pichduitre le totem" | "pichtoire erudit" | "robocoop echange" | "rostensyl la cuisiniere" | "tortilleur le coule" | "tortorak le cornu" | "wagnagnah le sanglant" | "abrakroc edente" | "bworkasse le degoutant" | "chafalfer optimiste" | "chamdble le cultive" | "chamflay le ballonne" | "champayt odorant" | "crakmitaine le faucheur" | "craquetuss le piquant" | "draglida la disparue" | "garsim le mort" | "gelaviv le glacon" | "krapahut le randonneur" | "mallopiee epineuse" | "mandalo aqueuse" | "ribibi le cher" | "scape epee" | "scaramel le fondant" | "scarfayss le balafre" | "scarouarze epopee" | "watdogue le bien nomme" | "abrakadnuzar" | "blof apathique" | "bloporte le veule" | "blordur infect" | "blorie assourdissante" | "boombata le garde" | "bulsavon le gonfle" | "chafemal le bagarreur" | "chaffoin le sournois" | "crolnareff exile" | "cruskof le rustre" | "crustensyl le pragmatique" | "crustterus organique" | "dragnoute irascible" | "farlon enfant" | "larvomatik le propre" | "radoutable le craint" | "scaratyn huitre" | "scorpitene enflamme" | "tronkoneuz la tranchante" | "aboudbra le porteur" | "ameur la laide" | "arabord la cruche" | "cavordemal le sorcier" | "chafmarcel le fetard" | "chalan le commercant" | "codenlgaz le probleme" | "crusmeyer le pervers" | "floriste la cannibale" | "forboyar enigmatique" | "ginsenk le stimulant" | "grandilok le clameur" | "kiroyal le sirupeux" | "koktele le secoue" | "let le rond" | "nelvin le boulet" | "nipulnislip exhibitionniste" | "osuxion le vampirique" | "susbewl hypocrite" | "wokenrol le danseur" | "abrakildas le venerable" | "chafrit le barbare" | "cramikaz le suicidaire" | "craquetou le fissure" | "doktopuss le malefique" | "germinol indigent" | "grenuche la gentille" | "kannibal le lecteur" | "kapota la fraise" | "koalastrof la naturelle" | "koko la violente" | "maitre onom le regulier" | "ouashouash exuberant" | "ouassebo esthete" | "ouature la mobile" | "palmiche le serein" | "palmiflette le convivial" | "palmito le menteur" | "ramitant le dilettante" | "sampi eternel" | "akaka le souille" | "bebetto intellectuel" | "corboyard enigmatique" | "dragioli le succulent" | "kannemik le maigre" | "kannisterik le forcene" | "kwakamole appetissant" | "kwake le pirate" | "kwakolak le chocolate" | "kwakwatique le trempe" | "moumoute la douce" | "ougaould le parasite" | "palmbytch la bronzee" | "parapadkoui emascule" | "porsale le raleur" | "ratlbol aigri" | "rauligo le sale" | "sarkastik incompris" | "serpistule le purulent" | "vetaurine energise" | "barebourd le comte" | "caboume artilleur" | "chiendanlemin illusionniste" | "dragkouine la deguisee" | "dragmoclaiss le fataliste" | "dragnostik le sceptique" | "dragstayr le fonceur" | "fandanleuil le precis" | "fanlabiz le veloce" | "fantoch le pantin" | "fantrask la reveuse" | "koakofrui le confit" | "koamaembair le coulant" | "koarmit la batracienne" | "koaskette la chapeliere" | "nakuneuye le borgne" | "nerdeubeu le flagellant" | "ratehaifaim le professeur" | "sparoket le lanceur" | "tilolo la bien moulee" | "alhoui le repondeur" | "bonpake le chavireur" | "bourde le maladroit" | "crathdogue le cruel" | "crok le beau" | "dragonienne econome" | "felyssion la gourmande" | "fouflay le retombe" | "guerrite le veilleur" | "kanasukr le mielleux" | "kanibiere encordee" | "kido atre" | "kilimanj haro le grimpeur" | "larvaloeil emue" | "mufguedin le supreme" | "muloufok hilarant" | "orfelyre le charmeur" | "pantacour le long" | "souristiti immortalisee" | "toufou le benet" | "abrakanette encapsule" | "abraklette le fondant" | "bitoven le musicien" | "brouste humiliant" | "craquecrac l endurant" | "diskord le belliqueux" | "dragdikal le decisif" | "dragobert le monarque" | "fossamoel le juteux" | "gloubibou le gars" | "inopenope le negatif" | "koamag oel le defigure" | "koasossyal le psychopathe" | "lichangora immaculee" | "meuroup le pretre" | "pekeutar le tireur" | "piradain le pingre" | "rooroku imposant" | "tetonee la plantureuse" | "warkolad etreinte" | "abrakine le sombre" | "bouliver le geant" | "drageaufol la joyeuse" | "dragminster le magicien" | "dragtarus le bellatre" | "drakolage le tentateur" | "draquetteur le voleur" | "ecorfe la vive" | "fangshui la dysorthographiee" | "faufoll la joyeuse" | "floanna la blonde" | "gastroth la contagieuse" | "guerumoth le collant" | "koalaboi le calorifere" | "koalvissie le chauve" | "mamakomou age" | "momikonos la bandelette" | "petarfoutu le mouille" | "tourbiket le virevoletant" | "wara amer" | "abrinos le clair" | "bigbadaboum elementaire" | "chamilero le malchanceux" | "chamoute le duveteux" | "champme le mechant" | "champolyon le polyglotte" | "champoul illumine" | "crachefouxtre le surpris" | "don kizoth obstine" | "jiankor le radoteur" | "kaskapointhe la couverte" | "maitre koantik le theoricien" | "onabuemange la rassasiee" | "poolopo la traditionnelle" | "seripoth ennemi" | "tambouille le gastronome" | "toutouf le velu" | "tromplamor le survivant" | "trooye oxyde" | "tsucekoi la colporteuse" | "bakaglace le congele" | "kaonucleair instable" | "madgang le docteur" | "roy le merlin" | "tronquette la reduite" | "tsumani inondeur",
         * type:"monstre"|"archimonstre"|"boss",
		 * image_url:string,
         * etape:"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34",
         * zone:"Amakna" | "Astrub" | "Baie de Sufokia" | "Bonta" | "Brakmar" | "Forêt des Abraknydes" | "Île d'Otomaï" | "Île de Grobe" | "Île de Moon" | "Île de Pandala" | "Île des Wabbits" | "Île du Minotoror" | "Labyrinthe du Dragon Cochon" | "Landes de Sidimote" | "Montagnes des Koalaks" | "Plaines de Cania",
         * souszone:"Aerdala" | "Akwadala" | "Antre de Crocabulia" | "Antre du Dragon Cochon" | "Arbre de Moon" | "Arche d'Otomaï" | "Atelier du Tanukouï San" | "Baie de Cania" | "Bambusaie de Damadrya" | "Bibliothèque du Maître corbac" | "Bois de Litneg" | "Bord de la forêt maléfique" | "Bordure de Brakmar" | "Calanques d'Astrub" | "Cale de l'arche d'otomaï" | "Canopée du Kimbo" | "Canyon sauvage" | "Caverne des Fungus" | "Caverne du Koulosse" | "Centre du labyrinthe du Minotoror" | "Champ des Ingalsse" | "Champs de Cania" | "Château du Wa Wabbit" | "Château Ensablé" | "Chemin du Crâne" | "Cimetière d'Amakna" | "Cimetière d'Astrub" | "Cimetière de Grobe" | "Cimetière des Torturés" | "Cimetière primitif" | "Cité d'Astrub" | "Clairière de Brouce Boulgoure" | "Clairière du Chêne Mou" | "Clos des Blops" | "Coin des Bouftous" | "Cour du Bouftou Royal" | "Cryptes du cimetière" | "Dents de Pierre" | "Désolation de Sidimote" | "Dojo du Vent" | "Domaine Ancestral" | "Domaine des Fungus" | "Donjon des Bworks" | "Donjon des Larves" | "Donjon des Rats du Château d'Amakna" | "Donjon des Scarafeuilles" | "Égouts d'Astrub" | "Entrailles de Brakmar" | "Épreuve de Draegnerys" | "Fabrique de foux d'artifice" | "Feudala" | "Forêt d'Amakna" | "Forêt de Kaliptus" | "Forêt des masques" | "Forêt maléfique" | "Forêt Sombre" | "Gelaxième dimension" | "Goulet du Rasboul" | "Grange du Tournesol Affamé" | "Grotte du Bworker" | "Grotte Hesque" | "Hauts des hurlements" | "Île de la Cawotte" | "Île du Minotoror" | "Îlot de la Couronne" | "îlot des Tombeaux" | "Jungle Interdite" | "Jungle Obscure" | "Laboratoire de Brumen Tinctorias" | "Laboratoire du Tynril" | "Labyrinthe du Dragon Cochon" | "Labyrinthe du Minotoror" | "Lac de Cania" | "Lacs enchantés" | "Marécages nauséabonds" | "Massif de Cania" | "Mont des Tombeaux" | "Montagne basse des Craqueleurs" | "Montagne des Craqueleurs" | "Orée de la forêt des Abraknydes" | "Passage vers Brakmar" | "Pénates du Corbac" | "Péninsule des gelées" | "Pics de Cania" | "Pitons Rocheux des Craqueleurs" | "Plage de Corail" | "Plage de la Tortue" | "Plaine des Porkass" | "Plaine des Scarafeuilles" | "Plaines herbeuses" | "Plaines Rocheuses" | "Plantala" | "Port de Madrestam" | "Presqu'île des Dragoeufs" | "Repaire de Skeunk" | "Repaire du Kharnozor" | "Rivage sufokien" | "Rives iridescentes" | "Routes Rocailleuses" | "Sanctuaire des Dragoeufs" | "Souterrains d'Astrub" | "Souterrains des Wabbits" | "Souterrains du Château d'Amakna" | "Sufokia" | "Tainéla" | "Tanière du Meulou" | "Temple du Grand Ougah" | "Terrdala" | "Territoire des Bandits" | "Territoire des Dragodindes Sauvages" | "Territoire des Porcos" | "Tofulailler royal" | "Tourbière sans fond" | "Tronc de l'arbre Hakam" | "Vallée de la Morh'kitu" | "Village de la Canopée" | "Village des dopeuls" | "Village des Dopeuls" | "Village des Dragoeufs" | "Volière de la Haute Truche",
         * quantite:string,
         * etat:"propose" | "recherche" | "aucun",
         * nom_normal:"Arakne Malade" | "Arakne Agressive" | "Arakne" | "Boufton Blanc" | "Boufton Noir" | "Champ Champ" | "Crabe" | "Larve Bleue" | "Moskito" | "Piou Rose" | "Piou Vert" | "Piou Jaune" | "Piou Rouge" | "Piou Violet" | "Piou Bleu" | "Pissenlit Diabolique" | "Souris Grise" | "Tofu" | "Tofu Maléfique" | "Tofu Malade" | "Bandit Manchot" | "Bandit du Clan des Roublards" | "Boulanger sombre" | "Bouftou" | "Gelée Bleue" | "Gelée Menthe" | "Gobelin" | "Kolérat" | "Kwoan" | "Larve Verte" | "Larve Orange" | "Nodkoko" | "Rose Démoniaque" | "Serpentin" | "Tikokoko" | "Black Tiwabbit" | "Tiwabbit" | "Tiwabbit Kiafin" | "Tournesol Sauvage" | "Trukikol" | "Biblop Griotte" | "Biblop Coco" | "Biblop Indigo" | "Biblop Reinette" | "Boo" | "Chef de guerre bouftou" | "Champa Vert" | "Chevaucheur de Karne" | "Cochon de Lait" | "Croc gland" | "Etoile de la Mer d'Asse" | "Milirat d'Egoutant Malade" | "Berger Porkass" | "Prespic" | "Robionicle" | "Sanglier" | "Tortue Bleue" | "Tortue Jaune" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Archer" | "Bwork Mage" | "Corbac" | "Crowneille" | "Fourbasse" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Mineur Sombre" | "Noeul" | "Pichon Vert" | "Pichon Bleu" | "Pichon Blanc" | "Pichon Orange" | "Robot Fléau" | "Rose Obscure" | "Tortue Verte" | "Tortue Rouge" | "Black Wabbit" | "Abraknyde" | "Bwork" | "Chafer Invisible" | "Champa Rouge" | "Champa Marron" | "Champa Bleu" | "Craqueleur" | "Craqueboule" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Kraméléhon" | "Malle Outillée" | "Mandrine" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Vert" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Wabbit Squelette" | "Abrakne" | "Blop Reinette" | "Blop Indigo" | "Blop Griotte" | "Blop Coco" | "Boomba" | "Bulbuisson" | "Chafer" | "Chafer Fantassin" | "Crocodaille" | "Crustorail Morito" | "Crustorail Malibout" | "Crustorail Kouraçao" | "Dragodinde Rousse Sauvage" | "Cochon de Farle" | "Larve jaune" | "Rat d'Egoutant Malade" | "Scaratos" | "Scorbute" | "Tronknyde" | "Aboub" | "Amlub" | "Arakne Majeure" | "Cavalier Porkass" | "Chafer Archer" | "Chafer Lancier" | "Codem" | "Crustorail Passaoh" | "Floristile" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Kokoko" | "Let Emoliug" | "Nebgib" | "Nipul" | "Osurc" | "Susej" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer d'Elite" | "Craqueleur des Plaines" | "Craqueboule poli" | "Dok Alako" | "Gamino" | "Grenufar" | "Kanniboul Archer" | "Kanniboul Jav" | "Koalak immature" | "Kokom" | "Maître Bolet" | "Le Ouassingue Entourbé" | "Le Ouassingue" | "La Ouassingue" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Palmifleur Malibout" | "Ramane d'Egoutant" | "Sanglier des plaines" | "Akakwa" | "Betto" | "Corailleur" | "Dragacé" | "Kanniboul Sarbak" | "Kanniboul Thierry" | "Kwak de Terre" | "Kwak de Vent" | "Kwak de Flamme" | "Kwak de Glace" | "Moumoule" | "Chafer Draugr" | "Palmifleur Kouraçao" | "Parashukouï" | "Porsalu" | "Rat d'Egoutant" | "Raul Mops" | "Sarkapwane" | "Serpiplume" | "Vétauran" | "Barbroussa" | "Canondorf" | "Chiendent" | "Dragoeuf Doré" | "Dragoeuf de Saphir" | "Dragoeuf Noir" | "Dragoeuf Blanc" | "Fantôme Ardent" | "Fantôme Apero" | "Fantôme Arepo" | "Fantôme Brave" | "Koalak Griotte" | "Koalak Coco" | "Koalak Reinette" | "Koalak Indigo" | "Nakunbra" | "Nerbe" | "Rat d'hyoactif" | "Sparo" | "Lolojiki" | "Alhyène" | "Ishigro Pake" | "Bourdard" | "Craqueleur Poli" | "Chef Crocodaille" | "Dragueuse" | "Félygiène" | "Foufayteur" | "Guerrier Koalak" | "Kanigrou" | "Kaniblou" | "Kido" | "Kilibriss" | "Larve Champêtre" | "Mufafah" | "Mulou" | "Orfélin" | "Panthègros" | "Souris Verte" | "Bitouf des Plaines" | "Abraknyde sombre" | "Abrakne Sombre" | "Bitouf Sombre" | "Brouture" | "Craquelourd" | "Disciple Zoth" | "Dragoeuf Guerrier" | "Draguaindrop" | "Fossoyeur Koalak" | "Gloutovore" | "Ino-Naru" | "Chevaucheur Koalak" | "Koalak Forestier" | "Lichangoro" | "Meupette" | "Pékeualak" | "Piralak" | "Kurookin" | "Tétonuki" | "Warko Marron" | "Abrakleur Sombre" | "Bourbassingue" | "Dragoss de Saphir Eveillé" | "Dragoss Blanc Eveillé" | "Dragoss Doré Eveillé" | "Drakoalak" | "Dragoss Noir Eveillé" | "Fécorce" | "Fangshu" | "Fauchalak" | "floribonde" | "Gamine Zoth" | "Guerrier Zoth" | "Koalak Farouche" | "Koalak Sanguin" | "Mama Koalak" | "Momie Koalak" | "Pétartifoux" | "Tourbassingue" | "Warko Violet" | "Abrakleur Clair" | "Boumbardier" | "Champaknyde" | "Champodonte" | "Champmane" | "Champ à Gnons" | "Champbis" | "Crachefoux" | "Maître Zoth" | "Jiangshi-nobi" | "Kaskargo" | "Maître Koalak" | "Onabu-geisha" | "Poolay" | "Sergent Zoth" | "Tambouraï" | "Bitouf Aérien" | "Tromperelle" | "Troollaraj" | "Tsukinochi" | "Bakazako" | "Kaonashi" | "Madura" | "Roissingue" | "Rouquette" | "Tsume-Bozu"
		 * }>
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération des monstres de l'utilisateur  
		 * • `result?` : Résultat  
		 * > • `id` : L'id du monstre  
		 * > • `nom` : Le nom du monstre  
		 * > • `slug` : Le slug du monstre (le nom nettoyé)  
		 * > • `type` : Type de monstre: monstre, archimonstre, boss  
		 * > • `image_url` : URL de l'image du monstre  
		 * > • `etape` : Etape à laquelle le monstre doit être rendu  
		 * > • `zone` : Zone dans laquelle évolue le mob  
		 * > • `souszone` : Sous-zone dans laquelle évolue le mob  
		 * > • `quantite` : Quantité indiquée par l'utilisateur  
		 * > • `etat` : État du monstre ("recherche", "propose", "aucun")  
		 * > • `nom_normal` : Nom du monstre normal associé (pour les archimonstres uniquement)
		 *
		 * ---
		 * @example
		 * client.getUserMonsters("nom_utilisateur", { type:"archimonstre" }).then(console.log); // Renvoi une liste des archimonstres de l'utilisateur
		 * client.getUserMonsters("nom_utilisateur", { etape:"20", quantite:">2" }); // Renvoi une liste des monstres à l'étape 20 dont la quantité est supérieur à 2
		 */
		this.getUserMonsters = async (username, params) => {

			try {

				let link = `https://api.metamob.fr/utilisateurs/${username}/monstres`;
				const linkParams = [];

				if (params) {

					if (params.monstre) {
						linkParams.push(`nom=${params.monstre}`);
					}
					if (params.etape) {
						linkParams.push(`etape=${params.etape}`);
					}
					if (params.type) {
						linkParams.push(`type=${params.type}`);
					}
					if (params.quantite) {
						if (params.quantite.startsWith("===")) {
							linkParams.push(`quantite=${params.quantite.slice(3)}`);
						}
						else if (params.quantite.startsWith(">")) {
							linkParams.push(`quantite=${params.quantite}`);
						}
						else if (params.quantite.startsWith("<")) {
							linkParams.push(`quantite=${params.quantite}`);
						}
					}
					if (params.etat) {
						const etat = params.etat === "propose" ? "propose=1" : params.etat === "recherche" ? "recherche=1" : "";
						linkParams.push(etat);
					}

				}

				link += "?" + linkParams.join("&");

				const _ = await fetch(link, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();

				if (params.etat && params.etat === "aucun") {
					return { ok:true, result:result.filter(d => d.propose === "0" && d.recherche === "0").map(d => ({
						id:d.id,
						nom:d.nom,
						slug:d.slug,
						type:d.type,
						image_url:d.image_url,
						etape:d.etape,
						zone:d.zone,
						souszone:d.souszone,
						quantite:d.quantite,
						etat:"aucun",
						nom_normal:d.nom_normal ?? "",
					})) };
				}
				else {
					return { ok:true, result:result.map(d => ({
						id:d.id,
						nom:d.nom,
						slug:d.slug,
						type:d.type,
						image_url:d.image_url,
						etape:d.etape,
						zone:d.zone,
						souszone:d.souszone,
						quantite:d.quantite,
						etat:d.propose === "1" ? "propose" : d.recherche === "1" ? "recherche" : "aucun",
						nom_normal:d.nom_normal ?? "",
					})) };
				}

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Récupère les monstres.**
		 *
		 * ---
		 * @param {{
		 * monstre?:"Arakne" | "Arakne malade" | "Boufton blanc" | "Boufton noir" | "Crabe" | "Flammèche air" | "Flammèche eau" | "Flammèche feu" | "Flammèche terre" | "Larve bleue" | "Moskito" | "Piou bleu" | "Piou jaune" | "Piou rose" | "Piou rouge" | "Piou vert" | "Piou violet" | "Souris grise" | "Tofu" | "Tofu maléfique" | "Arakne des égoûts" | "Bandit du clan des Roublards" | "Bandit manchot" | "Black tiwabbit" | "Bouftou" | "Boulanger sombre" | "Champ champ" | "Gelée bleue" | "Gelée menthe" | "Gobet" | "Kolérat" | "Kwoan" | "Larve orange" | "Larve verte" | "Pissenlit diabolique" | "Rose démoniaque" | "Tiwabbit" | "Tiwabbit kiafin" | "Tofu malade" | "Tournesol sauvage" | "Berger Porkass" | "Biblop coco" | "Biblop griotte" | "Biblop indigo" | "Biblop reinette" | "Boo" | "Champa vert" | "Chef de Guerre Bouftou" | "Cochon de Lait" | "Crowneille" | "Gob-trotteur" | "Milirat Strubien" | "Nodkoko" | "Prespic" | "Sanglier" | "Tikoko" | "Tortue Jaune" | "Trukikol" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Mage" | "Corbac" | "Croc Gland" | "Croc Gland enragé" | "Etoile de la Mer d'Asse" | "Floristile" | "Fourbasse" | "Larve Jaune" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Noeul" | "Pichon Blanc" | "Pichon Bleu" | "Pichon Orange" | "Pichon Vert" | "Tortue Bleue" | "Tortue rouge" | "Tortue Verte" | "Abraknyde" | "Black Wabbit" | "Bwork" | "Bwork Archer" | "Chafer Invisible" | "Champa Bleu" | "Champa Marron" | "Champa Rouge" | "Craqueboule" | "Craqueleur" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Ishigro PakeKraméléhon" | "Mandrine" | "Mineur Sombre" | "Rose Obscure" | "Wabbit Squelette" | "Abrakne" | "Blop Coco" | "Blop Griotte" | "Blop Indigo" | "Blop Reinette" | "Boomba" | "Chafer" | "Chafer Fantassin" | "Cochon de Farle" | "Crocodaille" | "Pichon Kloune" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Scarafeuille Vert" | "Scaratos" | "Scélérat Strubien" | "Scorbute" | "Tronknyde" | "Aboub" | "Akakwa" | "Amlub" | "Arakne Majeure" | "Bulbuisson" | "Cavalier Porkass" | "Codem" | "Crustorail Kouraçao" | "Crustorail Malibout" | "Crustorail Morito" | "Crustorail Passaoh" | "Dragodinde Rousse Sauvage" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Let Emoliug" | "Nebgib" | "Nipul" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer Archer" | "Chafer d'élite" | "Chafer Lancier" | "Craqueleur des plaines" | "DoK Alako" | "Fangshu" | "Gamino" | "Koalak Immature" | "Kokoko" | "La Ouassingue" | "Le Ouassingue" | "Le Ouassingue Entourbé" | "Osurc" | "Palmifleur Malibout" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Ramane d'Egoutant" | "Sanglier Des Plaines" | "Susej" | "Chafer Draugr" | "Crachefoux" | "Craqueboule Poli" | "Dragacé" | "Ino-Naru" | "Kanniboul Ark" | "Kanniboul Eth" | "Kanniboul Jav" | "Kanniboul Sarbak" | "Kwak de Flamme" | "Kwak de Glace" | "Kwak de Terre" | "Kwak de Vent" | "Macien" | "Maître Bolet" | "Palmifleur Kouraçao" | "Porsalu" | "Rat d'Egoutant" | "Sarkapwane" | "Vétauran" | "Betto" | "Canondorf" | "Corailleur" | "Don Duss Ang" | "Dragoeuf Ardoise" | "Dragoeuf Argile" | "Dragoeuf Calcaire" | "DragOeuf Charbon" | "Félygiène" | "Koalak Coco" | "Koalak Griotte" | "Koalak Indigo" | "Koalak Reinette" | "Lolojiki" | "Moumoule" | "Nakunbra" | "Rat d'Hyoactif" | "Raul Mops" | "Serpiplume" | "Sparo" | "Barbroussa" | "Bitouf des plaines" | "Chef Crocodaille" | "Chiendent" | "Craqueleur poli" | "Don Dorgan" | "Fantôme Apero" | "Fantôme Aux Plates" | "Fantôme Egérie" | "Fantôme Hicide" | "Kanigrou" | "Kido" | "Kilibriss" | "Kurookin" | "Larve Champêtre" | "Mufafah" | "MulouNerbe" | "Serpentin" | "Souris Verte" | "Abrakne sombre" | "Abraknyde sombre" | "Alhyène" | "Bourdard" | "Chevaucheur koalak" | "Dragodinde Dorée sauvage" | "Dragueuse" | "Fossoyeur koalak" | "Foufayteur" | "Gloutovore" | "Guerrier koalak" | "Koalak forestier" | "Kokom" | "Meupette" | "Orfélin" | "Panthègros" | "Parashukouï" | "Pékeualak" | "Piralak" | "Warko marron" | "Bitouf sombre" | "Bizarbwork" | "Bourbassingue" | "Brouture" | "Disciple zoth" | "Dragnarok" | "Draguaindrop" | "Fécorce" | "Floribonde" | "Gamine zoth" | "Grenufar" | "Guerrier zoth" | "Koalak farouche" | "Koalak sanguin" | "Krambwork" | "Mama koalak" | "Médibwork" | "Mégabwork" | "Momie koalak" | "Warko violet" | "Abrakleur sombre" | "Boumbardier" | "Dragoss Ardoise" | "Dragoss Argile" | "Dragoss Calcaire" | "Dragoss Charbon" | "Drakoalak" | "Fauchalak" | "Kaniblou" | "Maître koalak" | "Malle Outillée" | "Poolay" | "Robionicle" | "Robot Fléau" | "Rouquette" | "Tétonuki" | "Tourbassingue" | "Troollaraj" | "Abrakleur clair" | "Bakazako" | "Bitouf aérien" | "Champ à gnons" | "Champaknyde" | "Champbis" | "Champmane" | "Champodonte" | "Jiangshi-nobi" | "Kaskargo" | "Lichangoro" | "Madura" | "Maître Zoth" | "Onabu-geisha" | "Pétartifoux" | "Roissingue" | "Sergent zoth" | "Tambouraï" | "Tromperelle" | "Tsukinochi" | "Kaonashi" | "Tsume-Bozu" | "Blop Coco Royal" | "Blop Griotte Royal" | "Blop Indigo Royal" | "Blop Reinette Royal" | "Bouftou Royal" | "Bworkette" | "Déminoboule" | "Dragon Cochon" | "Gelée Royale Bleue" | "Gelée Royale Menthe" | "Minotoror" | "Mob l'Eponge" | "Mominotor" | "Rat Blanc" | "Rat Noir" | "Scarabosse Doré" | "Shin Larve" | "Tofu Royal" | "Tournesol Affamé" | "Wabbit GM" | "Abraknyde ancestral" | "Blop multicolore royal" | "Corailleur magistral" | "Craqueleur légendaire" | "Gardienne des égouts" | "Gelée Royale Fraise" | "Gourlo le terrible" | "Hanshi" | "Hell Mina" | "Koulosse" | "Maître corbac" | "Meulou" | "Moon" | "Skeunk" | "Tanukoui San" | "Tynril ahuri" | "Tynril consterné" | "Tynril déconcerté" | "Tynril perfide" | "Wa wabbit" | "Bworker" | "Chêne mou" | "Crocabulia" | "Founamboul" | "Gelée Royale Citron" | "Haute Truche" | "Kimbo" | "Minotot" | "Ougah" | "Silf le rasboul majeur" | "Sphincter cell" | "Arachitik la Souffreteuse" | "Araknay la Galopante" | "Arakule la Revancharde" | "Boudalf le Blanc" | "Boulgourvil le Lointain" | "Chamchie le Difficile" | "Craraboss le Féérique" | "Larvonika l'Instrument" | "Mosketère le Dévoué" | "Pioufe la Maquillée" | "Pioukas la Plante" | "Pioulbrineur le Mercenaire" | "Pioulette la Coquine" | "Pioussokrim le Délétère" | "Pioustone le Problème" | "Pissdane l'Insipide" | "Sourizoto le Collant" | "Tofuldebeu l'Explosif" | "Tofumanchou l'Empereur" | "Tofurapin le Pétri" | "Bandapar l'Exclu" | "Bandson le Tonitruant" | "Boudur le Raide" | "Boufdégou le Refoulant" | "Gelanal le Huileux" | "Geloliaine l'Aérien" | "Gobstiniais le Têtu" | "Kolforthe l'Indécollable" | "Kwoanneur le Frimeur" | "Larchimaide la Poussée" | "Larvapstrè le Subjectif" | "Nodkoku le Trahi" | "Roz la Magicienne" | "Serpistol l'Illustre" | "Tikosto le Mousse" | "Tiwa'Missou le Gateux" | "Tiwalpé le Dévêtu" | "Tiwoflan le Lâche" | "Tour le Vice" | "Trukul le Lent" | "Bi le Partageur" | "Bilvoezé le Bonimenteur" | "Bistou le Quêteur" | "Bistou le Rieur" | "Boostif l'Affamé" | "Bouflet le Puéril" | "Champayr le Disjoncté" | "Chevaustine le Reconstruit" | "Chonstip la Passagère" | "Cromikay le Néophyte" | "Étoilette la Bouchée" | "Milipussien le Géant" | "Porfavor le Quémandeur" | "Preskapwal le Tendancieux" | "Robiolego l'Assemblé" | "Sangria le Fruité" | "Tortenssia la Fleurie" | "Torthur la Lutte" | "Vampunor le Glacial" | "Wabbitud le Constant" | "Bambouské le Camouflé" | "Barchwork le Multicolore" | "Bwormage le Respectueux" | "Corpat le Vampire" | "Crognan le Barbare" | "Fourapin le Chaud" | "Maître Amboat le Moqueur" | "Milipatte la Griffe" | "Minoskour le Sauveur" | "Minsinistre l'Elu" | "Neufedur le Flottant" | "Pichakoté le Dégoûtant" | "Pichdourse le Puissant" | "Pichduitre le Totem" | "Pichtoire l'Erudit" | "Robocoop l'Échangé" | "Rostensyl la Cuisinière" | "Tortilleur le Coulé" | "Tortorak le Cornu" | "Wagnagnah le Sanglant" | "Abrakroc l'Edenté" | "Bworkasse le Dégoûtant" | "Chafalfer l'Optimiste" | "Chamdblé le Cultivé" | "Chamflay le Ballonné" | "Champayt l'Odorant" | "Crakmitaine le Faucheur" | "Craquetuss le Piquant" | "Draglida la Disparue" | "Garsim le Mort" | "Gelaviv le Glaçon" | "Krapahut le Randonneur" | "Mallopiée l'Épineuse" | "Mandalo l'Aqueuse" | "Ribibi le Cher" | "Scapé l'Epée" | "Scaramel le Fondant" | "Scarfayss le Balafré" | "Scarouarze l'Epopée" | "Watdogue le Bien Nommé" | "Abrakadnuzar" | "Blof l'Apathique" | "Bloporte le Veule" | "Blordur l'Infect" | "Blorie l'Assourdissante" | "Boombata le Garde" | "Bulsavon le Gonflé" | "Chafemal le Bagarreur" | "Chaffoin le Sournois" | "Crolnareff l'Exilé" | "Cruskof le Rustre" | "Crustensyl le Pragmatique" | "Crustterus l'Organique" | "Dragnoute l'Irascible" | "Farlon l'Enfant" | "Larvomatik le Propre" | "Radoutable le Craint" | "Scaratyn l'Huître" | "Scorpitène l'Enflammé" | "Tronkoneuz la Tranchante" | "Aboudbra le Porteur" | "Ameur la Laide" | "Arabord la Cruche" | "Cavordemal le Sorcier" | "Chafmarcel le Fêtard" | "Chalan le Commerçant" | "Codenlgaz le Problème" | "Crusmeyer le Pervers" | "Floriste la Cannibale" | "Forboyar l'Enigmatique" | "Ginsenk le Stimulant" | "Grandilok le Clameur" | "Kiroyal le Sirupeux" | "Koktèle le Secoué" | "Let le Rond" | "Nelvin le Boulet" | "Nipulnislip l'Exhibitionniste" | "Osuxion le Vampirique" | "Susbewl l'Hypocrite" | "Wokènrôl le Danseur" | "Abrakildas le Vénérable" | "Chafrit le Barbare" | "Cramikaz le Suicidaire" | "Craquetou le Fissuré" | "Doktopuss le Maléfique" | "Germinol l'Indigent" | "Grenuche la Gentille" | "Kannibal le Lecteur" | "Kapota la Fraise" | "Koalastrof la Naturelle" | "Koko la Violente" | "Maître Onom le Régulier" | "Ouashouash l'Exubérant" | "Ouassébo l'Esthète" | "Ouature la Mobile" | "Palmiche le Serein" | "Palmiflette le Convivial" | "Palmito le Menteur" | "Ramitant le Dilettante" | "Sampi l'Eternel" | "Akaka le Souillé" | "Bebetto l'Intellectuel" | "Corboyard l'Enigmatique" | "Dragioli le Succulent" | "Kannémik le Maigre" | "Kannisterik le Forcené" | "Kwakamole l'Appétissant" | "Kwaké le Piraté" | "Kwakolak le Chocolaté" | "Kwakwatique le Trempé" | "Moumoute la Douce" | "Ougaould le Parasite" | "Palmbytch la Bronzée" | "Parapadkouï l'Émasculé" | "Porsalé le Râleur" | "Ratlbol l'Aigri" | "Rauligo le Sale" | "Sarkastik l'Incompris" | "Serpistule le Purulent" | "Vétaurine L'énergisé" | "Barebourd le Comte" | "Caboume l'Artilleur" | "Chiendanlémin l'Illusionniste" | "Dragkouine la Déguisée" | "Dragmoclaiss le Fataliste" | "Dragnostik le Sceptique" | "Dragstayr le Fonceur" | "Fandanleuil le Précis" | "Fanlabiz le Véloce" | "Fantoch le Pantin" | "Fantrask la Rêveuse" | "Koakofrui le Confit" | "Koamaembair le Coulant" | "Koarmit la Batracienne" | "Koaskette la Chapelière" | "Nakuneuye le Borgne" | "Nerdeubeu le Flagellant" | "Ratéhaifaim le Professeur" | "Sparoket le Lanceur" | "Tilolo la Bien Moulée" | "Alhoui le Répondeur" | "Bonpake le Chavireur" | "Bourde le Maladroit" | "Crathdogue le Cruel" | "Crok le Beau" | "Dragonienne l'Econome" | "Félyssion la Gourmande" | "Fouflay le Retombé" | "Guerrite le Veilleur" | "Kanasukr le Mielleux" | "Kanibière l'Encordée" | "Kido l'Âtre" | "Kilimanj'haro le Grimpeur" | "Larvaloeil l'Émue" | "Mufguedin le Suprême" | "Muloufok l'Hilarant" | "Orfélyre le Charmeur" | "Pantacour le Long" | "Souristiti l'Immortalisée" | "Toufou le Benêt" | "Abrakanette l'Encapsulé" | "Abraklette le Fondant" | "Bitoven le Musicien" | "Brouste l'Humiliant" | "Craquecrac l'Endurant" | "Diskord le Belliqueux" | "Dragdikal le Décisif" | "Dragobert le Monarque" | "Fossamoel le Juteux" | "Gloubibou le Gars" | "Inopenope le Négatif" | "Koamag'oel le Défiguré" | "Koasossyal le Psychopathe" | "Lichangora l'Immaculée" | "Meuroup le Prêtre" | "Pékeutar le Tireur" | "Piradain le Pingre" | "Rooroku l'Imposant" | "Tétonée la Plantureuse" | "Warkolad l'Etreinte" | "Abrakine le Sombre" | "Bouliver le Géant" | "Drageaufol la Joyeuse" | "Dragminster le Magicien" | "Dragtarus le Bellâtre" | "Drakolage le Tentateur" | "Draquetteur le Voleur" | "Ecorfé la Vive" | "Fangshui la Dysorthographiée" | "Faufoll la Joyeuse" | "Floanna la Blonde" | "Gastroth la Contagieuse" | "Guerumoth le Collant" | "Koalaboi le Calorifère" | "Koalvissie le Chauve" | "Mamakomou l'Âge" | "Momikonos la Bandelette" | "Pétarfoutu le Mouillé" | "Tourbiket le Virevoletant" | "Wara l'Amer" | "Abrinos le Clair" | "Bigbadaboum l'Élémentaire" | "Chamiléro le Malchanceux" | "Chamoute le Duveteux" | "Champmé le Méchant" | "Champolyon le Polyglotte" | "Champoul l'Illuminé" | "Crachefouxtre le Surpris" | "Don Kizoth l'Obstiné" | "Jiankor le Radoteur" | "Kaskapointhe la Couverte" | "Maître Koantik le Théoricien" | "Onabuémangé la Rassasiée" | "Poolopo la Traditionnelle" | "Seripoth l'Ennemi" | "Tambouille le Gastronome" | "Toutouf le Velu" | "Tromplamor le Survivant" | "Trooyé l'Oxydé" | "Tsucékoi la Colporteuse" | "Bakaglace le Congelé" | "Kaonucléair l'Instable" | "Madgang le Docteur" | "Roy le Merlin" | "Tronquette la Réduite" | "Tsumani l'Inondeur",
         * etape?:"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34",
         * type?:"monstre" | "archimonstre" | "boss"
		 * }} [params] **Paramètres de filtrage** :
		 *
		 * • `monstre?` : Le nom du monstre à filtrer. Le filtre s'effectue sur le champ "nom" mais aussi sur le champ "nom_normal" pour les archimonstres  
		 * • `etape?` : L'étape sur laquelle filtrer  
		 * • `type?` :	Le type de monstre à afficher. N'accepte que "monstre", "archimonstre", et "boss"
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:Array<{
		 * id:"3" | "7" | "4" | "5" | "19" | "14" | "15" | "16" | "17" | "18" | "2" | "8" | "9" | "13" | "10" | "11" | "12" | "1" | "20" | "6" | "24" | "39" | "25" | "35" | "31" | "34" | "22" | "27" | "28" | "40" | "32" | "29" | "33" | "30" | "23" | "26" | "36" | "37" | "21" | "38" | "60" | "48" | "49" | "50" | "51" | "54" | "45" | "59" | "56" | "46" | "52" | "53" | "41" | "55" | "44" | "42" | "57" | "43" | "47" | "58" | "70" | "79" | "64" | "61" | "80" | "65" | "128" | "76" | "62" | "72" | "75" | "73" | "74" | "66" | "67" | "68" | "69" | "63" | "71" | "78" | "98" | "82" | "97" | "84" | "95" | "85" | "86" | "87" | "88" | "96" | "92" | "91" | "93" | "217" | "99" | "89" | "83" | "81" | "94" | "115" | "105" | "106" | "107" | "108" | "111" | "116" | "113" | "109" | "117" | "114" | "104" | "100" | "101" | "102" | "103" | "110" | "118" | "119" | "112" | "132" | "185" | "133" | "127" | "126" | "131" | "134" | "122" | "123" | "124" | "125" | "120" | "121" | "135" | "129" | "136" | "137" | "138" | "139" | "130" | "157" | "143" | "160" | "144" | "158" | "145" | "268" | "147" | "146" | "142" | "151" | "152" | "149" | "140" | "153" | "154" | "155" | "148" | "156" | "141" | "178" | "285" | "162" | "179" | "229" | "164" | "167" | "165" | "166" | "174" | "175" | "173" | "172" | "171" | "161" | "170" | "176" | "169" | "168" | "177" | "183" | "187" | "182" | "190" | "194" | "192" | "191" | "193" | "77" | "195" | "196" | "197" | "198" | "186" | "188" | "189" | "199" | "184" | "181" | "200" | "207" | "213" | "210" | "201" | "214" | "206" | "202" | "203" | "205" | "204" | "212" | "218" | "219" | "241" | "220" | "215" | "216" | "209" | "211" | "208" | "237" | "230" | "638" | "221" | "239" | "238" | "224" | "232" | "222" | "236" | "225" | "233" | "159" | "240" | "227" | "223" | "180" | "235" | "234" | "228" | "251" | "244" | "257" | "249" | "248" | "242" | "243" | "253" | "252" | "259" | "163" | "260" | "254" | "250" | "245" | "255" | "246" | "247" | "256" | "258" | "262" | "270" | "266" | "264" | "263" | "265" | "269" | "271" | "276" | "272" | "274" | "273" | "277" | "275" | "295" | "231" | "261" | "278" | "282" | "298" | "281" | "291" | "284" | "290" | "292" | "287" | "294" | "280" | "226" | "297" | "283" | "293" | "267" | "296" | "279" | "289" | "286" | "288" | "299" | "300" | "314" | "315" | "316" | "317" | "302" | "309" | "312" | "310" | "304" | "305" | "320" | "301" | "311" | "319" | "318" | "308" | "306" | "313" | "303" | "307" | "335" | "327" | "328" | "323" | "324" | "325" | "329" | "336" | "321" | "333" | "326" | "330" | "332" | "334" | "322" | "337" | "338" | "339" | "340" | "331" | "343" | "349" | "347" | "348" | "341" | "342" | "351" | "345" | "350" | "346" | "344" | "358" | "371" | "354" | "355" | "356" | "369" | "364" | "365" | "353" | "366" | "362" | "360" | "361" | "363" | "359" | "370" | "352" | "367" | "357" | "368" | "372" | "387" | "383" | "377" | "374" | "379" | "388" | "378" | "375" | "376" | "380" | "389" | "373" | "381" | "390" | "382" | "384" | "385" | "386" | "391" | "397" | "396" | "398" | "399" | "402" | "409" | "393" | "400" | "404" | "410" | "394" | "401" | "407" | "403" | "408" | "392" | "411" | "405" | "395" | "406" | "412" | "431" | "426" | "413" | "428" | "421" | "419" | "422" | "423" | "430" | "424" | "417" | "415" | "414" | "416" | "420" | "429" | "425" | "418" | "427" | "445" | "444" | "442" | "434" | "433" | "432" | "443" | "435" | "439" | "438" | "440" | "446" | "437" | "436" | "451" | "447" | "450" | "448" | "449" | "441" | "462" | "455" | "454" | "453" | "452" | "456" | "468" | "463" | "459" | "464" | "471" | "470" | "469" | "467" | "457" | "460" | "465" | "458" | "466" | "461" | "479" | "480" | "475" | "478" | "490" | "491" | "481" | "472" | "474" | "473" | "482" | "476" | "483" | "489" | "484" | "485" | "486" | "487" | "488" | "477" | "503" | "506" | "504" | "507" | "493" | "494" | "509" | "510" | "511" | "495" | "505" | "508" | "498" | "497" | "496" | "500" | "501" | "499" | "492" | "502" | "530" | "529" | "518" | "524" | "512" | "513" | "522" | "519" | "521" | "520" | "526" | "517" | "515" | "527" | "523" | "516" | "531" | "514" | "528" | "525" | "550" | "533" | "545" | "537" | "536" | "538" | "535" | "547" | "546" | "548" | "549" | "540" | "539" | "542" | "541" | "534" | "551" | "543" | "544" | "532" | "559" | "563" | "568" | "552" | "554" | "570" | "557" | "569" | "571" | "560" | "558" | "564" | "565" | "566" | "561" | "562" | "556" | "555" | "567" | "553" | "576" | "583" | "591" | "590" | "573" | "589" | "587" | "588" | "578" | "579" | "575" | "584" | "580" | "572" | "585" | "581" | "582" | "586" | "577" | "574" | "603" | "598" | "607" | "604" | "605" | "611" | "606" | "592" | "609" | "612" | "593" | "600" | "601" | "595" | "594" | "596" | "597" | "608" | "602" | "599" | "619" | "610" | "621" | "624" | "629" | "628" | "627" | "622" | "620" | "631" | "617" | "613" | "630" | "614" | "616" | "626" | "618" | "623" | "615" | "625" | "635" | "637" | "634" | "633" | "632" | "636",
		 * nom:"Arakne" | "Arakne malade" | "Boufton blanc" | "Boufton noir" | "Crabe" | "Flammèche air" | "Flammèche eau" | "Flammèche feu" | "Flammèche terre" | "Larve bleue" | "Moskito" | "Piou bleu" | "Piou jaune" | "Piou rose" | "Piou rouge" | "Piou vert" | "Piou violet" | "Souris grise" | "Tofu" | "Tofu maléfique" | "Arakne des égoûts" | "Bandit du clan des Roublards" | "Bandit manchot" | "Black tiwabbit" | "Bouftou" | "Boulanger sombre" | "Champ champ" | "Gelée bleue" | "Gelée menthe" | "Gobet" | "Kolérat" | "Kwoan" | "Larve orange" | "Larve verte" | "Pissenlit diabolique" | "Rose démoniaque" | "Tiwabbit" | "Tiwabbit kiafin" | "Tofu malade" | "Tournesol sauvage" | "Berger Porkass" | "Biblop coco" | "Biblop griotte" | "Biblop indigo" | "Biblop reinette" | "Boo" | "Champa vert" | "Chef de Guerre Bouftou" | "Cochon de Lait" | "Crowneille" | "Gob-trotteur" | "Milirat Strubien" | "Nodkoko" | "Prespic" | "Sanglier" | "Tikoko" | "Tortue Jaune" | "Trukikol" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Mage" | "Corbac" | "Croc Gland" | "Croc Gland enragé" | "Etoile de la Mer d'Asse" | "Floristile" | "Fourbasse" | "Larve Jaune" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Noeul" | "Pichon Blanc" | "Pichon Bleu" | "Pichon Orange" | "Pichon Vert" | "Tortue Bleue" | "Tortue rouge" | "Tortue Verte" | "Abraknyde" | "Black Wabbit" | "Bwork" | "Bwork Archer" | "Chafer Invisible" | "Champa Bleu" | "Champa Marron" | "Champa Rouge" | "Craqueboule" | "Craqueleur" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Ishigro PakeKraméléhon" | "Mandrine" | "Mineur Sombre" | "Rose Obscure" | "Wabbit Squelette" | "Abrakne" | "Blop Coco" | "Blop Griotte" | "Blop Indigo" | "Blop Reinette" | "Boomba" | "Chafer" | "Chafer Fantassin" | "Cochon de Farle" | "Crocodaille" | "Pichon Kloune" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Scarafeuille Vert" | "Scaratos" | "Scélérat Strubien" | "Scorbute" | "Tronknyde" | "Aboub" | "Akakwa" | "Amlub" | "Arakne Majeure" | "Bulbuisson" | "Cavalier Porkass" | "Codem" | "Crustorail Kouraçao" | "Crustorail Malibout" | "Crustorail Morito" | "Crustorail Passaoh" | "Dragodinde Rousse Sauvage" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Let Emoliug" | "Nebgib" | "Nipul" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer Archer" | "Chafer d'élite" | "Chafer Lancier" | "Craqueleur des plaines" | "DoK Alako" | "Fangshu" | "Gamino" | "Koalak Immature" | "Kokoko" | "La Ouassingue" | "Le Ouassingue" | "Le Ouassingue Entourbé" | "Osurc" | "Palmifleur Malibout" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Ramane d'Egoutant" | "Sanglier Des Plaines" | "Susej" | "Chafer Draugr" | "Crachefoux" | "Craqueboule Poli" | "Dragacé" | "Ino-Naru" | "Kanniboul Ark" | "Kanniboul Eth" | "Kanniboul Jav" | "Kanniboul Sarbak" | "Kwak de Flamme" | "Kwak de Glace" | "Kwak de Terre" | "Kwak de Vent" | "Macien" | "Maître Bolet" | "Palmifleur Kouraçao" | "Porsalu" | "Rat d'Egoutant" | "Sarkapwane" | "Vétauran" | "Betto" | "Canondorf" | "Corailleur" | "Don Duss Ang" | "Dragoeuf Ardoise" | "Dragoeuf Argile" | "Dragoeuf Calcaire" | "DragOeuf Charbon" | "Félygiène" | "Koalak Coco" | "Koalak Griotte" | "Koalak Indigo" | "Koalak Reinette" | "Lolojiki" | "Moumoule" | "Nakunbra" | "Rat d'Hyoactif" | "Raul Mops" | "Serpiplume" | "Sparo" | "Barbroussa" | "Bitouf des plaines" | "Chef Crocodaille" | "Chiendent" | "Craqueleur poli" | "Don Dorgan" | "Fantôme Apero" | "Fantôme Aux Plates" | "Fantôme Egérie" | "Fantôme Hicide" | "Kanigrou" | "Kido" | "Kilibriss" | "Kurookin" | "Larve Champêtre" | "Mufafah" | "MulouNerbe" | "Serpentin" | "Souris Verte" | "Abrakne sombre" | "Abraknyde sombre" | "Alhyène" | "Bourdard" | "Chevaucheur koalak" | "Dragodinde Dorée sauvage" | "Dragueuse" | "Fossoyeur koalak" | "Foufayteur" | "Gloutovore" | "Guerrier koalak" | "Koalak forestier" | "Kokom" | "Meupette" | "Orfélin" | "Panthègros" | "Parashukouï" | "Pékeualak" | "Piralak" | "Warko marron" | "Bitouf sombre" | "Bizarbwork" | "Bourbassingue" | "Brouture" | "Disciple zoth" | "Dragnarok" | "Draguaindrop" | "Fécorce" | "Floribonde" | "Gamine zoth" | "Grenufar" | "Guerrier zoth" | "Koalak farouche" | "Koalak sanguin" | "Krambwork" | "Mama koalak" | "Médibwork" | "Mégabwork" | "Momie koalak" | "Warko violet" | "Abrakleur sombre" | "Boumbardier" | "Dragoss Ardoise" | "Dragoss Argile" | "Dragoss Calcaire" | "Dragoss Charbon" | "Drakoalak" | "Fauchalak" | "Kaniblou" | "Maître koalak" | "Malle Outillée" | "Poolay" | "Robionicle" | "Robot Fléau" | "Rouquette" | "Tétonuki" | "Tourbassingue" | "Troollaraj" | "Abrakleur clair" | "Bakazako" | "Bitouf aérien" | "Champ à gnons" | "Champaknyde" | "Champbis" | "Champmane" | "Champodonte" | "Jiangshi-nobi" | "Kaskargo" | "Lichangoro" | "Madura" | "Maître Zoth" | "Onabu-geisha" | "Pétartifoux" | "Roissingue" | "Sergent zoth" | "Tambouraï" | "Tromperelle" | "Tsukinochi" | "Kaonashi" | "Tsume-Bozu" | "Blop Coco Royal" | "Blop Griotte Royal" | "Blop Indigo Royal" | "Blop Reinette Royal" | "Bouftou Royal" | "Bworkette" | "Déminoboule" | "Dragon Cochon" | "Gelée Royale Bleue" | "Gelée Royale Menthe" | "Minotoror" | "Mob l'Eponge" | "Mominotor" | "Rat Blanc" | "Rat Noir" | "Scarabosse Doré" | "Shin Larve" | "Tofu Royal" | "Tournesol Affamé" | "Wabbit GM" | "Abraknyde ancestral" | "Blop multicolore royal" | "Corailleur magistral" | "Craqueleur légendaire" | "Gardienne des égouts" | "Gelée Royale Fraise" | "Gourlo le terrible" | "Hanshi" | "Hell Mina" | "Koulosse" | "Maître corbac" | "Meulou" | "Moon" | "Skeunk" | "Tanukoui San" | "Tynril ahuri" | "Tynril consterné" | "Tynril déconcerté" | "Tynril perfide" | "Wa wabbit" | "Bworker" | "Chêne mou" | "Crocabulia" | "Founamboul" | "Gelée Royale Citron" | "Haute Truche" | "Kimbo" | "Minotot" | "Ougah" | "Silf le rasboul majeur" | "Sphincter cell" | "Arachitik la Souffreteuse" | "Araknay la Galopante" | "Arakule la Revancharde" | "Boudalf le Blanc" | "Boulgourvil le Lointain" | "Chamchie le Difficile" | "Craraboss le Féérique" | "Larvonika l'Instrument" | "Mosketère le Dévoué" | "Pioufe la Maquillée" | "Pioukas la Plante" | "Pioulbrineur le Mercenaire" | "Pioulette la Coquine" | "Pioussokrim le Délétère" | "Pioustone le Problème" | "Pissdane l'Insipide" | "Sourizoto le Collant" | "Tofuldebeu l'Explosif" | "Tofumanchou l'Empereur" | "Tofurapin le Pétri" | "Bandapar l'Exclu" | "Bandson le Tonitruant" | "Boudur le Raide" | "Boufdégou le Refoulant" | "Gelanal le Huileux" | "Geloliaine l'Aérien" | "Gobstiniais le Têtu" | "Kolforthe l'Indécollable" | "Kwoanneur le Frimeur" | "Larchimaide la Poussée" | "Larvapstrè le Subjectif" | "Nodkoku le Trahi" | "Roz la Magicienne" | "Serpistol l'Illustre" | "Tikosto le Mousse" | "Tiwa'Missou le Gateux" | "Tiwalpé le Dévêtu" | "Tiwoflan le Lâche" | "Tour le Vice" | "Trukul le Lent" | "Bi le Partageur" | "Bilvoezé le Bonimenteur" | "Bistou le Quêteur" | "Bistou le Rieur" | "Boostif l'Affamé" | "Bouflet le Puéril" | "Champayr le Disjoncté" | "Chevaustine le Reconstruit" | "Chonstip la Passagère" | "Cromikay le Néophyte" | "Étoilette la Bouchée" | "Milipussien le Géant" | "Porfavor le Quémandeur" | "Preskapwal le Tendancieux" | "Robiolego l'Assemblé" | "Sangria le Fruité" | "Tortenssia la Fleurie" | "Torthur la Lutte" | "Vampunor le Glacial" | "Wabbitud le Constant" | "Bambouské le Camouflé" | "Barchwork le Multicolore" | "Bwormage le Respectueux" | "Corpat le Vampire" | "Crognan le Barbare" | "Fourapin le Chaud" | "Maître Amboat le Moqueur" | "Milipatte la Griffe" | "Minoskour le Sauveur" | "Minsinistre l'Elu" | "Neufedur le Flottant" | "Pichakoté le Dégoûtant" | "Pichdourse le Puissant" | "Pichduitre le Totem" | "Pichtoire l'Erudit" | "Robocoop l'Échangé" | "Rostensyl la Cuisinière" | "Tortilleur le Coulé" | "Tortorak le Cornu" | "Wagnagnah le Sanglant" | "Abrakroc l'Edenté" | "Bworkasse le Dégoûtant" | "Chafalfer l'Optimiste" | "Chamdblé le Cultivé" | "Chamflay le Ballonné" | "Champayt l'Odorant" | "Crakmitaine le Faucheur" | "Craquetuss le Piquant" | "Draglida la Disparue" | "Garsim le Mort" | "Gelaviv le Glaçon" | "Krapahut le Randonneur" | "Mallopiée l'Épineuse" | "Mandalo l'Aqueuse" | "Ribibi le Cher" | "Scapé l'Epée" | "Scaramel le Fondant" | "Scarfayss le Balafré" | "Scarouarze l'Epopée" | "Watdogue le Bien Nommé" | "Abrakadnuzar" | "Blof l'Apathique" | "Bloporte le Veule" | "Blordur l'Infect" | "Blorie l'Assourdissante" | "Boombata le Garde" | "Bulsavon le Gonflé" | "Chafemal le Bagarreur" | "Chaffoin le Sournois" | "Crolnareff l'Exilé" | "Cruskof le Rustre" | "Crustensyl le Pragmatique" | "Crustterus l'Organique" | "Dragnoute l'Irascible" | "Farlon l'Enfant" | "Larvomatik le Propre" | "Radoutable le Craint" | "Scaratyn l'Huître" | "Scorpitène l'Enflammé" | "Tronkoneuz la Tranchante" | "Aboudbra le Porteur" | "Ameur la Laide" | "Arabord la Cruche" | "Cavordemal le Sorcier" | "Chafmarcel le Fêtard" | "Chalan le Commerçant" | "Codenlgaz le Problème" | "Crusmeyer le Pervers" | "Floriste la Cannibale" | "Forboyar l'Enigmatique" | "Ginsenk le Stimulant" | "Grandilok le Clameur" | "Kiroyal le Sirupeux" | "Koktèle le Secoué" | "Let le Rond" | "Nelvin le Boulet" | "Nipulnislip l'Exhibitionniste" | "Osuxion le Vampirique" | "Susbewl l'Hypocrite" | "Wokènrôl le Danseur" | "Abrakildas le Vénérable" | "Chafrit le Barbare" | "Cramikaz le Suicidaire" | "Craquetou le Fissuré" | "Doktopuss le Maléfique" | "Germinol l'Indigent" | "Grenuche la Gentille" | "Kannibal le Lecteur" | "Kapota la Fraise" | "Koalastrof la Naturelle" | "Koko la Violente" | "Maître Onom le Régulier" | "Ouashouash l'Exubérant" | "Ouassébo l'Esthète" | "Ouature la Mobile" | "Palmiche le Serein" | "Palmiflette le Convivial" | "Palmito le Menteur" | "Ramitant le Dilettante" | "Sampi l'Eternel" | "Akaka le Souillé" | "Bebetto l'Intellectuel" | "Corboyard l'Enigmatique" | "Dragioli le Succulent" | "Kannémik le Maigre" | "Kannisterik le Forcené" | "Kwakamole l'Appétissant" | "Kwaké le Piraté" | "Kwakolak le Chocolaté" | "Kwakwatique le Trempé" | "Moumoute la Douce" | "Ougaould le Parasite" | "Palmbytch la Bronzée" | "Parapadkouï l'Émasculé" | "Porsalé le Râleur" | "Ratlbol l'Aigri" | "Rauligo le Sale" | "Sarkastik l'Incompris" | "Serpistule le Purulent" | "Vétaurine L'énergisé" | "Barebourd le Comte" | "Caboume l'Artilleur" | "Chiendanlémin l'Illusionniste" | "Dragkouine la Déguisée" | "Dragmoclaiss le Fataliste" | "Dragnostik le Sceptique" | "Dragstayr le Fonceur" | "Fandanleuil le Précis" | "Fanlabiz le Véloce" | "Fantoch le Pantin" | "Fantrask la Rêveuse" | "Koakofrui le Confit" | "Koamaembair le Coulant" | "Koarmit la Batracienne" | "Koaskette la Chapelière" | "Nakuneuye le Borgne" | "Nerdeubeu le Flagellant" | "Ratéhaifaim le Professeur" | "Sparoket le Lanceur" | "Tilolo la Bien Moulée" | "Alhoui le Répondeur" | "Bonpake le Chavireur" | "Bourde le Maladroit" | "Crathdogue le Cruel" | "Crok le Beau" | "Dragonienne l'Econome" | "Félyssion la Gourmande" | "Fouflay le Retombé" | "Guerrite le Veilleur" | "Kanasukr le Mielleux" | "Kanibière l'Encordée" | "Kido l'Âtre" | "Kilimanj'haro le Grimpeur" | "Larvaloeil l'Émue" | "Mufguedin le Suprême" | "Muloufok l'Hilarant" | "Orfélyre le Charmeur" | "Pantacour le Long" | "Souristiti l'Immortalisée" | "Toufou le Benêt" | "Abrakanette l'Encapsulé" | "Abraklette le Fondant" | "Bitoven le Musicien" | "Brouste l'Humiliant" | "Craquecrac l'Endurant" | "Diskord le Belliqueux" | "Dragdikal le Décisif" | "Dragobert le Monarque" | "Fossamoel le Juteux" | "Gloubibou le Gars" | "Inopenope le Négatif" | "Koamag'oel le Défiguré" | "Koasossyal le Psychopathe" | "Lichangora l'Immaculée" | "Meuroup le Prêtre" | "Pékeutar le Tireur" | "Piradain le Pingre" | "Rooroku l'Imposant" | "Tétonée la Plantureuse" | "Warkolad l'Etreinte" | "Abrakine le Sombre" | "Bouliver le Géant" | "Drageaufol la Joyeuse" | "Dragminster le Magicien" | "Dragtarus le Bellâtre" | "Drakolage le Tentateur" | "Draquetteur le Voleur" | "Ecorfé la Vive" | "Fangshui la Dysorthographiée" | "Faufoll la Joyeuse" | "Floanna la Blonde" | "Gastroth la Contagieuse" | "Guerumoth le Collant" | "Koalaboi le Calorifère" | "Koalvissie le Chauve" | "Mamakomou l'Âge" | "Momikonos la Bandelette" | "Pétarfoutu le Mouillé" | "Tourbiket le Virevoletant" | "Wara l'Amer" | "Abrinos le Clair" | "Bigbadaboum l'Élémentaire" | "Chamiléro le Malchanceux" | "Chamoute le Duveteux" | "Champmé le Méchant" | "Champolyon le Polyglotte" | "Champoul l'Illuminé" | "Crachefouxtre le Surpris" | "Don Kizoth l'Obstiné" | "Jiankor le Radoteur" | "Kaskapointhe la Couverte" | "Maître Koantik le Théoricien" | "Onabuémangé la Rassasiée" | "Poolopo la Traditionnelle" | "Seripoth l'Ennemi" | "Tambouille le Gastronome" | "Toutouf le Velu" | "Tromplamor le Survivant" | "Trooyé l'Oxydé" | "Tsucékoi la Colporteuse" | "Bakaglace le Congelé" | "Kaonucléair l'Instable" | "Madgang le Docteur" | "Roy le Merlin" | "Tronquette la Réduite" | "Tsumani l'Inondeur",
		 * slug:"arakne" | "arakne malade" | "boufton blanc" | "boufton noir" | "crabe" | "flammeche air" | "flammeche eau" | "flammeche feu" | "flammeche terre" | "larve bleue" | "moskito" | "piou bleu" | "piou jaune" | "piou rose" | "piou rouge" | "piou vert" | "piou violet" | "souris grise" | "tofu" | "tofu malefique" | "arakne des egouts" | "bandit du clan des roublards" | "bandit manchot" | "black tiwabbit" | "bouftou" | "boulanger sombre" | "champ champ" | "gelee bleue" | "gelee menthe" | "gobet" | "kolerat" | "kwoan" | "larve orange" | "larve verte" | "pissenlit diabolique" | "rose demoniaque" | "tiwabbit" | "tiwabbit kiafin" | "tofu malade" | "tournesol sauvage" | "berger porkass" | "biblop coco" | "biblop griotte" | "biblop indigo" | "biblop reinette" | "boo" | "champa vert" | "chef de guerre bouftou" | "cochon de lait" | "crowneille" | "gob-trotteur" | "milirat strubien" | "nodkoko" | "prespic" | "sanglier" | "tikoko" | "tortue jaune" | "trukikol" | "vampire" | "wabbit" | "bambouto" | "bwork mage" | "corbac" | "croc gland" | "croc gland enrage" | "etoile de la mer d asse" | "floristile" | "fourbasse" | "larve jaune" | "maitre vampire" | "milimulou" | "minoskito" | "noeul" | "pichon blanc" | "pichon bleu" | "pichon orange" | "pichon vert" | "tortue bleue" | "tortue rouge" | "tortue verte" | "abraknyde" | "black wabbit" | "bwork" | "bwork archer" | "chafer invisible" | "champa bleu" | "champa marron" | "champa rouge" | "craqueboule" | "craqueleur" | "dragodinde amande sauvage" | "gargrouille" | "gelee fraise" | "ishigro pake" | "kramelehon" | "mandrine" | "mineur sombre" | "rose obscure" | "wabbit squelette" | "abrakne" | "blop coco" | "blop griotte" | "blop indigo" | "blop reinette" | "boomba" | "chafer" | "chafer fantassin" | "cochon de farle" | "crocodaille" | "pichon kloune" | "rib" | "scarafeuille blanc" | "scarafeuille bleu" | "scarafeuille rouge" | "scarafeuille vert" | "scaratos" | "scelerat strubien" | "scorbute" | "tronknyde" | "aboub" | "akakwa" | "amlub" | "arakne majeure" | "bulbuisson" | "cavalier porkass" | "codem" | "crustorail kouracao" | "crustorail malibout" | "crustorail morito" | "crustorail passaoh" | "dragodinde rousse sauvage" | "forgeron sombre" | "gink" | "grand pa wabbit" | "kirevam" | "let emoliug" | "nebgib" | "nipul" | "wo wabbit" | "abraknyde venerable" | "chafer archer" | "chafer d elite" | "chafer lancier" | "craqueleur des plaines" | "dok alako" | "fangshu" | "gamino" | "koalak immature" | "kokoko" | "la ouassingue" | "le ouassingue" | "le ouassingue entourbe" | "osurc" | "palmifleur malibout" | "palmifleur morito" | "palmifleur passaoh" | "ramane d egoutant" | "sanglier des plaines" | "susej" | "chafer draugr" | "crachefoux" | "craqueboule poli" | "dragace" | "ino naru" | "kanniboul ark" | "kanniboul eth" | "kanniboul jav" | "kanniboul sarbak" | "kwak de flamme" | "kwak de glace" | "kwak de terre" | "kwak de vent" | "macien" | "maitre bolet" | "palmifleur kouracao" | "porsalu" | "rat d egoutant" | "sarkapwane" | "vetauran" | "betto" | "canondorf" | "corailleur" | "don duss ang" | "dragoeuf ardoise" | "dragoeuf argile" | "dragoeuf calcaire" | "dragoeuf charbon" | "felygiene" | "koalak coco" | "koalak griotte" | "koalak indigo" | "koalak reinette" | "lolojiki" | "moumoule" | "nakunbra" | "rat d hyoactif" | "raul mops" | "serpiplume" | "sparo" | "barbroussa" | "bitouf des plaines" | "chef crocodaille" | "chiendent" | "craqueleur poli" | "don dorgan" | "fantome apero" | "fantome aux plates" | "fantome egerie" | "fantome hicide" | "kanigrou" | "kido" | "kilibriss" | "kurookin" | "larve champetre" | "mufafah" | "mulou" | "nerbe" | "serpentin" | "souris verte" | "abrakne sombre" | "abraknyde sombre" | "alhyene" | "bourdard" | "chevaucheur koalak" | "dragodinde doree sauvage" | "dragueuse" | "fossoyeur koalak" | "foufayteur" | "gloutovore" | "guerrier koalak" | "koalak forestier" | "kokom" | "meupette" | "orfelin" | "panthegros" | "parashukoui" | "pekeualak" | "piralak" | "warko marron" | "bitouf sombre" | "bizarbwork" | "bourbassingue" | "brouture" | "disciple zoth" | "dragnarok" | "draguaindrop" | "fecorce" | "floribonde" | "gamine zoth" | "grenufar" | "guerrier zoth" | "koalak farouche" | "koalak sanguin" | "krambwork" | "mama koalak" | "medibwork" | "megabwork" | "momie koalak" | "warko violet" | "abrakleur sombre" | "boumbardier" | "dragoss ardoise" | "dragoss argile" | "dragoss calcaire" | "dragoss charbon" | "drakoalak" | "fauchalak" | "kaniblou" | "maitre koalak" | "malle outillee" | "poolay" | "robionicle" | "robot fleau" | "rouquette" | "tetonuki" | "tourbassingue" | "troollaraj" | "abrakleur clair" | "bakazako" | "bitouf aerien" | "champ a gnons" | "champaknyde" | "champbis" | "champmane" | "champodonte" | "jiangshi nobi" | "kaskargo" | "lichangoro" | "madura" | "maitre zoth" | "onabu geisha" | "petartifoux" | "roissingue" | "sergent zoth" | "tambourai" | "tromperelle" | "tsukinochi" | "kaonashi" | "tsume bozu" | "blop coco royal" | "blop griotte royal" | "blop indigo royal" | "blop reinette royal" | "bouftou royal" | "bworkette" | "deminoboule" | "dragon cochon" | "gelee royale bleue" | "gelee royale menthe" | "minotoror" | "mob eponge" | "mominotor" | "rat blanc" | "rat noir" | "scarabosse dore" | "shin larve" | "tofu royal" | "tournesol affame" | "wabbit gm" | "abraknyde ancestral" | "blop multicolore royal" | "corailleur magistral" | "craqueleur legendaire" | "gardienne des egouts" | "gelee royale fraise" | "gourlo le terrible" | "hanshi" | "hell mina" | "koulosse" | "maitre corbac" | "meulou" | "moon" | "skeunk" | "tanukoui san" | "tynril ahuri" | "tynril consterne" | "tynril deconcerte" | "tynril perfide" | "wa wabbit" | "bworker" | "chene mou" | "crocabulia" | "founamboul" | "gelee royale citron" | "haute truche" | "kimbo" | "minotot" | "ougah" | "silf le rasboul majeur" | "sphincter cell" | "arachitik la souffreteuse" | "araknay la galopante" | "arakule la revancharde" | "boudalf le blanc" | "boulgourvil le lointain" | "chamchie le difficile" | "craraboss le feerique" | "larvonika instrument" | "mosketere le devoue" | "pioufe la maquillee" | "pioukas la plante" | "pioulbrineur le mercenaire" | "pioulette la coquine" | "pioussokrim le deletere" | "pioustone le probleme" | "pissdane insipide" | "sourizoto le collant" | "tofuldebeu explosif" | "tofumanchou empereur" | "tofurapin le petri" | "bandapar exclu" | "bandson le tonitruant" | "boudur le raide" | "boufdegou le refoulant" | "gelanal le huileux" | "geloliaine aerien" | "gobstiniais le tetu" | "kolforthe indecollable" | "kwoanneur le frimeur" | "larchimaide la poussee" | "larvapstre le subjectif" | "nodkoku le trahi" | "roz la magicienne" | "serpistol illustre" | "tikosto le mousse" | "tiwa missou le gateux" | "tiwalpe le devetu" | "tiwoflan le lache" | "tour le vice" | "trukul le lent" | "bi le partageur" | "bilvoeze le bonimenteur" | "bistou le queteur" | "bistou le rieur" | "boostif affame" | "bouflet le pueril" | "champayr le disjoncte" | "chevaustine le reconstruit" | "chonstip la passagere" | "cromikay le neophyte" | "Etoilette la Bouchee" | "milipussien le geant" | "porfavor le quemandeur" | "preskapwal le tendancieux" | "robiolego assemble" | "sangria le fruite" | "tortenssia la fleurie" | "torthur la lutte" | "vampunor le glacial" | "wabbitud le constant" | "bambouske le camoufle" | "barchwork le multicolore" | "bwormage le respectueux" | "corpat le vampire" | "crognan le barbare" | "fourapin le chaud" | "maitre amboat le moqueur" | "milipatte la griffe" | "minoskour le sauveur" | "minsinistre elu" | "neufedur le flottant" | "pichakote le degoutant" | "pichdourse le puissant" | "pichduitre le totem" | "pichtoire erudit" | "robocoop echange" | "rostensyl la cuisiniere" | "tortilleur le coule" | "tortorak le cornu" | "wagnagnah le sanglant" | "abrakroc edente" | "bworkasse le degoutant" | "chafalfer optimiste" | "chamdble le cultive" | "chamflay le ballonne" | "champayt odorant" | "crakmitaine le faucheur" | "craquetuss le piquant" | "draglida la disparue" | "garsim le mort" | "gelaviv le glacon" | "krapahut le randonneur" | "mallopiee epineuse" | "mandalo aqueuse" | "ribibi le cher" | "scape epee" | "scaramel le fondant" | "scarfayss le balafre" | "scarouarze epopee" | "watdogue le bien nomme" | "abrakadnuzar" | "blof apathique" | "bloporte le veule" | "blordur infect" | "blorie assourdissante" | "boombata le garde" | "bulsavon le gonfle" | "chafemal le bagarreur" | "chaffoin le sournois" | "crolnareff exile" | "cruskof le rustre" | "crustensyl le pragmatique" | "crustterus organique" | "dragnoute irascible" | "farlon enfant" | "larvomatik le propre" | "radoutable le craint" | "scaratyn huitre" | "scorpitene enflamme" | "tronkoneuz la tranchante" | "aboudbra le porteur" | "ameur la laide" | "arabord la cruche" | "cavordemal le sorcier" | "chafmarcel le fetard" | "chalan le commercant" | "codenlgaz le probleme" | "crusmeyer le pervers" | "floriste la cannibale" | "forboyar enigmatique" | "ginsenk le stimulant" | "grandilok le clameur" | "kiroyal le sirupeux" | "koktele le secoue" | "let le rond" | "nelvin le boulet" | "nipulnislip exhibitionniste" | "osuxion le vampirique" | "susbewl hypocrite" | "wokenrol le danseur" | "abrakildas le venerable" | "chafrit le barbare" | "cramikaz le suicidaire" | "craquetou le fissure" | "doktopuss le malefique" | "germinol indigent" | "grenuche la gentille" | "kannibal le lecteur" | "kapota la fraise" | "koalastrof la naturelle" | "koko la violente" | "maitre onom le regulier" | "ouashouash exuberant" | "ouassebo esthete" | "ouature la mobile" | "palmiche le serein" | "palmiflette le convivial" | "palmito le menteur" | "ramitant le dilettante" | "sampi eternel" | "akaka le souille" | "bebetto intellectuel" | "corboyard enigmatique" | "dragioli le succulent" | "kannemik le maigre" | "kannisterik le forcene" | "kwakamole appetissant" | "kwake le pirate" | "kwakolak le chocolate" | "kwakwatique le trempe" | "moumoute la douce" | "ougaould le parasite" | "palmbytch la bronzee" | "parapadkoui emascule" | "porsale le raleur" | "ratlbol aigri" | "rauligo le sale" | "sarkastik incompris" | "serpistule le purulent" | "vetaurine energise" | "barebourd le comte" | "caboume artilleur" | "chiendanlemin illusionniste" | "dragkouine la deguisee" | "dragmoclaiss le fataliste" | "dragnostik le sceptique" | "dragstayr le fonceur" | "fandanleuil le precis" | "fanlabiz le veloce" | "fantoch le pantin" | "fantrask la reveuse" | "koakofrui le confit" | "koamaembair le coulant" | "koarmit la batracienne" | "koaskette la chapeliere" | "nakuneuye le borgne" | "nerdeubeu le flagellant" | "ratehaifaim le professeur" | "sparoket le lanceur" | "tilolo la bien moulee" | "alhoui le repondeur" | "bonpake le chavireur" | "bourde le maladroit" | "crathdogue le cruel" | "crok le beau" | "dragonienne econome" | "felyssion la gourmande" | "fouflay le retombe" | "guerrite le veilleur" | "kanasukr le mielleux" | "kanibiere encordee" | "kido atre" | "kilimanj haro le grimpeur" | "larvaloeil emue" | "mufguedin le supreme" | "muloufok hilarant" | "orfelyre le charmeur" | "pantacour le long" | "souristiti immortalisee" | "toufou le benet" | "abrakanette encapsule" | "abraklette le fondant" | "bitoven le musicien" | "brouste humiliant" | "craquecrac l endurant" | "diskord le belliqueux" | "dragdikal le decisif" | "dragobert le monarque" | "fossamoel le juteux" | "gloubibou le gars" | "inopenope le negatif" | "koamag oel le defigure" | "koasossyal le psychopathe" | "lichangora immaculee" | "meuroup le pretre" | "pekeutar le tireur" | "piradain le pingre" | "rooroku imposant" | "tetonee la plantureuse" | "warkolad etreinte" | "abrakine le sombre" | "bouliver le geant" | "drageaufol la joyeuse" | "dragminster le magicien" | "dragtarus le bellatre" | "drakolage le tentateur" | "draquetteur le voleur" | "ecorfe la vive" | "fangshui la dysorthographiee" | "faufoll la joyeuse" | "floanna la blonde" | "gastroth la contagieuse" | "guerumoth le collant" | "koalaboi le calorifere" | "koalvissie le chauve" | "mamakomou age" | "momikonos la bandelette" | "petarfoutu le mouille" | "tourbiket le virevoletant" | "wara amer" | "abrinos le clair" | "bigbadaboum elementaire" | "chamilero le malchanceux" | "chamoute le duveteux" | "champme le mechant" | "champolyon le polyglotte" | "champoul illumine" | "crachefouxtre le surpris" | "don kizoth obstine" | "jiankor le radoteur" | "kaskapointhe la couverte" | "maitre koantik le theoricien" | "onabuemange la rassasiee" | "poolopo la traditionnelle" | "seripoth ennemi" | "tambouille le gastronome" | "toutouf le velu" | "tromplamor le survivant" | "trooye oxyde" | "tsucekoi la colporteuse" | "bakaglace le congele" | "kaonucleair instable" | "madgang le docteur" | "roy le merlin" | "tronquette la reduite" | "tsumani inondeur",
		 * type:"monstre" | "archimonstre" | "boss"
		 * image_url:string,
		 * etape:"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34",
		 * zone:"Amakna" | "Astrub" | "Baie de Sufokia" | "Bonta" | "Brakmar" | "Forêt des Abraknydes" | "Île d'Otomaï" | "Île de Grobe" | "Île de Moon" | "Île de Pandala" | "Île des Wabbits" | "Île du Minotoror" | "Labyrinthe du Dragon Cochon" | "Landes de Sidimote" | "Montagnes des Koalaks" | "Plaines de Cania",
		 * souszone:"Aerdala" | "Akwadala" | "Antre de Crocabulia" | "Antre du Dragon Cochon" | "Arbre de Moon" | "Arche d'Otomaï" | "Atelier du Tanukouï San" | "Baie de Cania" | "Bambusaie de Damadrya" | "Bibliothèque du Maître corbac" | "Bois de Litneg" | "Bord de la forêt maléfique" | "Bordure de Brakmar" | "Calanques d'Astrub" | "Cale de l'arche d'otomaï" | "Canopée du Kimbo" | "Canyon sauvage" | "Caverne des Fungus" | "Caverne du Koulosse" | "Centre du labyrinthe du Minotoror" | "Champ des Ingalsse" | "Champs de Cania" | "Château du Wa Wabbit" | "Château Ensablé" | "Chemin du Crâne" | "Cimetière d'Amakna" | "Cimetière d'Astrub" | "Cimetière de Grobe" | "Cimetière des Torturés" | "Cimetière primitif" | "Cité d'Astrub" | "Clairière de Brouce Boulgoure" | "Clairière du Chêne Mou" | "Clos des Blops" | "Coin des Bouftous" | "Cour du Bouftou Royal" | "Cryptes du cimetière" | "Dents de Pierre" | "Désolation de Sidimote" | "Dojo du Vent" | "Domaine Ancestral" | "Domaine des Fungus" | "Donjon des Bworks" | "Donjon des Larves" | "Donjon des Rats du Château d'Amakna" | "Donjon des Scarafeuilles" | "Égouts d'Astrub" | "Entrailles de Brakmar" | "Épreuve de Draegnerys" | "Fabrique de foux d'artifice" | "Feudala" | "Forêt d'Amakna" | "Forêt de Kaliptus" | "Forêt des masques" | "Forêt maléfique" | "Forêt Sombre" | "Gelaxième dimension" | "Goulet du Rasboul" | "Grange du Tournesol Affamé" | "Grotte du Bworker" | "Grotte Hesque" | "Hauts des hurlements" | "Île de la Cawotte" | "Île du Minotoror" | "Îlot de la Couronne" | "îlot des Tombeaux" | "Jungle Interdite" | "Jungle Obscure" | "Laboratoire de Brumen Tinctorias" | "Laboratoire du Tynril" | "Labyrinthe du Dragon Cochon" | "Labyrinthe du Minotoror" | "Lac de Cania" | "Lacs enchantés" | "Marécages nauséabonds" | "Massif de Cania" | "Mont des Tombeaux" | "Montagne basse des Craqueleurs" | "Montagne des Craqueleurs" | "Orée de la forêt des Abraknydes" | "Passage vers Brakmar" | "Pénates du Corbac" | "Péninsule des gelées" | "Pics de Cania" | "Pitons Rocheux des Craqueleurs" | "Plage de Corail" | "Plage de la Tortue" | "Plaine des Porkass" | "Plaine des Scarafeuilles" | "Plaines herbeuses" | "Plaines Rocheuses" | "Plantala" | "Port de Madrestam" | "Presqu'île des Dragoeufs" | "Repaire de Skeunk" | "Repaire du Kharnozor" | "Rivage sufokien" | "Rives iridescentes" | "Routes Rocailleuses" | "Sanctuaire des Dragoeufs" | "Souterrains d'Astrub" | "Souterrains des Wabbits" | "Souterrains du Château d'Amakna" | "Sufokia" | "Tainéla" | "Tanière du Meulou" | "Temple du Grand Ougah" | "Terrdala" | "Territoire des Bandits" | "Territoire des Dragodindes Sauvages" | "Territoire des Porcos" | "Tofulailler royal" | "Tourbière sans fond" | "Tronc de l'arbre Hakam" | "Vallée de la Morh'kitu" | "Village de la Canopée" | "Village des dopeuls" | "Village des Dopeuls" | "Village des Dragoeufs" | "Volière de la Haute Truche",
		 * nom_normal:"Arakne Malade" | "Arakne Agressive" | "Arakne" | "Boufton Blanc" | "Boufton Noir" | "Champ Champ" | "Crabe" | "Larve Bleue" | "Moskito" | "Piou Rose" | "Piou Vert" | "Piou Jaune" | "Piou Rouge" | "Piou Violet" | "Piou Bleu" | "Pissenlit Diabolique" | "Souris Grise" | "Tofu" | "Tofu Maléfique" | "Tofu Malade" | "Bandit Manchot" | "Bandit du Clan des Roublards" | "Boulanger sombre" | "Bouftou" | "Gelée Bleue" | "Gelée Menthe" | "Gobelin" | "Kolérat" | "Kwoan" | "Larve Verte" | "Larve Orange" | "Nodkoko" | "Rose Démoniaque" | "Serpentin" | "Tikokoko" | "Black Tiwabbit" | "Tiwabbit" | "Tiwabbit Kiafin" | "Tournesol Sauvage" | "Trukikol" | "Biblop Griotte" | "Biblop Coco" | "Biblop Indigo" | "Biblop Reinette" | "Boo" | "Chef de guerre bouftou" | "Champa Vert" | "Chevaucheur de Karne" | "Cochon de Lait" | "Croc gland" | "Etoile de la Mer d'Asse" | "Milirat d'Egoutant Malade" | "Berger Porkass" | "Prespic" | "Robionicle" | "Sanglier" | "Tortue Bleue" | "Tortue Jaune" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Archer" | "Bwork Mage" | "Corbac" | "Crowneille" | "Fourbasse" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Mineur Sombre" | "Noeul" | "Pichon Vert" | "Pichon Bleu" | "Pichon Blanc" | "Pichon Orange" | "Robot Fléau" | "Rose Obscure" | "Tortue Verte" | "Tortue Rouge" | "Black Wabbit" | "Abraknyde" | "Bwork" | "Chafer Invisible" | "Champa Rouge" | "Champa Marron" | "Champa Bleu" | "Craqueleur" | "Craqueboule" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Kraméléhon" | "Malle Outillée" | "Mandrine" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Vert" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Wabbit Squelette" | "Abrakne" | "Blop Reinette" | "Blop Indigo" | "Blop Griotte" | "Blop Coco" | "Boomba" | "Bulbuisson" | "Chafer" | "Chafer Fantassin" | "Crocodaille" | "Crustorail Morito" | "Crustorail Malibout" | "Crustorail Kouraçao" | "Dragodinde Rousse Sauvage" | "Cochon de Farle" | "Larve jaune" | "Rat d'Egoutant Malade" | "Scaratos" | "Scorbute" | "Tronknyde" | "Aboub" | "Amlub" | "Arakne Majeure" | "Cavalier Porkass" | "Chafer Archer" | "Chafer Lancier" | "Codem" | "Crustorail Passaoh" | "Floristile" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Kokoko" | "Let Emoliug" | "Nebgib" | "Nipul" | "Osurc" | "Susej" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer d'Elite" | "Craqueleur des Plaines" | "Craqueboule poli" | "Dok Alako" | "Gamino" | "Grenufar" | "Kanniboul Archer" | "Kanniboul Jav" | "Koalak immature" | "Kokom" | "Maître Bolet" | "Le Ouassingue Entourbé" | "Le Ouassingue" | "La Ouassingue" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Palmifleur Malibout" | "Ramane d'Egoutant" | "Sanglier des plaines" | "Akakwa" | "Betto" | "Corailleur" | "Dragacé" | "Kanniboul Sarbak" | "Kanniboul Thierry" | "Kwak de Terre" | "Kwak de Vent" | "Kwak de Flamme" | "Kwak de Glace" | "Moumoule" | "Chafer Draugr" | "Palmifleur Kouraçao" | "Parashukouï" | "Porsalu" | "Rat d'Egoutant" | "Raul Mops" | "Sarkapwane" | "Serpiplume" | "Vétauran" | "Barbroussa" | "Canondorf" | "Chiendent" | "Dragoeuf Doré" | "Dragoeuf de Saphir" | "Dragoeuf Noir" | "Dragoeuf Blanc" | "Fantôme Ardent" | "Fantôme Apero" | "Fantôme Arepo" | "Fantôme Brave" | "Koalak Griotte" | "Koalak Coco" | "Koalak Reinette" | "Koalak Indigo" | "Nakunbra" | "Nerbe" | "Rat d'hyoactif" | "Sparo" | "Lolojiki" | "Alhyène" | "Ishigro Pake" | "Bourdard" | "Craqueleur Poli" | "Chef Crocodaille" | "Dragueuse" | "Félygiène" | "Foufayteur" | "Guerrier Koalak" | "Kanigrou" | "Kaniblou" | "Kido" | "Kilibriss" | "Larve Champêtre" | "Mufafah" | "Mulou" | "Orfélin" | "Panthègros" | "Souris Verte" | "Bitouf des Plaines" | "Abraknyde sombre" | "Abrakne Sombre" | "Bitouf Sombre" | "Brouture" | "Craquelourd" | "Disciple Zoth" | "Dragoeuf Guerrier" | "Draguaindrop" | "Fossoyeur Koalak" | "Gloutovore" | "Ino-Naru" | "Chevaucheur Koalak" | "Koalak Forestier" | "Lichangoro" | "Meupette" | "Pékeualak" | "Piralak" | "Kurookin" | "Tétonuki" | "Warko Marron" | "Abrakleur Sombre" | "Bourbassingue" | "Dragoss de Saphir Eveillé" | "Dragoss Blanc Eveillé" | "Dragoss Doré Eveillé" | "Drakoalak" | "Dragoss Noir Eveillé" | "Fécorce" | "Fangshu" | "Fauchalak" | "floribonde" | "Gamine Zoth" | "Guerrier Zoth" | "Koalak Farouche" | "Koalak Sanguin" | "Mama Koalak" | "Momie Koalak" | "Pétartifoux" | "Tourbassingue" | "Warko Violet" | "Abrakleur Clair" | "Boumbardier" | "Champaknyde" | "Champodonte" | "Champmane" | "Champ à Gnons" | "Champbis" | "Crachefoux" | "Maître Zoth" | "Jiangshi-nobi" | "Kaskargo" | "Maître Koalak" | "Onabu-geisha" | "Poolay" | "Sergent Zoth" | "Tambouraï" | "Bitouf Aérien" | "Tromperelle" | "Troollaraj" | "Tsukinochi" | "Bakazako" | "Kaonashi" | "Madura" | "Roissingue" | "Rouquette" | "Tsume-Bozu"
		 * }>
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération des monstres  
		 * • `result?` : Résultat  
		 * > • `id` : L'identifiant du monstre  
		 * > • `nom` :	Le nom du monstre  
		 * > • `slug` : Le slug du monstre (le nom nettoyé)  
		 * > • `type` : Type de monstre: monstre, archimonstre, boss  
		 * > • `image_url` : URL de l'image du monstre  
		 * > • `etape` : Etape à laquelle le monstre doit être rendu  
		 * > • `zone` : Zone dans laquelle évolue le mob  
		 * > • `souszone` : Sous-zone dans laquelle évolue le mob  
		 * > • `nom_normal` : Nom du monstre normal associé (pour les archimonstres uniquement)
		 *
		 * ---
		 * @example
		 * client.getMonsters(); // Renvoi une liste de tous les monstres
		 * client.getMonsters({ etape:"20", type:"archimonstre" }); // Renvoi tous les archimonstres de l'étape 20
		 */
		this.getMonsters = async (params) => {

			try {

				let link = `https://api.metamob.fr/monstres`;
				const linkParams = [];

				if (params) {
					if (params.etape) {
						linkParams.push(`etape=${params.etape}`);
					}
					if (params.monstre) {
						linkParams.push(`nom=${params.monstre}`);
					}
					if (params.type) {
						linkParams.push(`type=${params.type}`);
					}
				}

				link += "?" + linkParams.join("&");

				const _ = await fetch(link, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Récupère les serveurs.**
		 *
		 * ---
		 * @param {"Draconiros" | "HellMina" | "Imagiro" | "Ombre" | "Orukam" | "Oto-Mustam" | "Rosal" | "Rushu" | "TalKasha" | "Temporis" | "Tylezia" | "Brutas" | "Dodge" | "Grandapan" | "Herdegrize" | "Oshimo" | "Terra Cogita" | "Crail" | "Eratz" | "Galgarion" | "Henual"} [server] Nom du serveur
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:Array<{
		 * id:"76" | "77" | "74" | "58" | "75" | "22" | "8" | "2" | "79" | "71" | "78" | "59" | "40" | "39" | "38" | "36" | "37" | "72" | "41" | "73" | "42",
		 * nom:"Draconiros" | "HellMina" | "Imagiro" | "Ombre" | "Orukam" | "Oto-Mustam" | "Rosal" | "Rushu" | "TalKasha" | "Temporis" | "Tylezia" | "Brutas" | "Dodge" | "Grandapan" | "Herdegrize" | "Oshimo" | "Terra Cogita" | "Crail" | "Eratz" | "Galgarion" | "Henual",
		 * communaute:"Monde" | "France" | "Monde, Epique" | "Monde, Héroïque",
		 * plateforme:"Dofus PC" | "Dofus Touch" | "Dofus Rétro"
		 * }>
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération des serveurs  
		 * • `result?` : Résultat  
		 * > • `id` : L'identifiant du serveur  
		 * > • `nom` : Le nom du serveur  
		 * > • `communaute` : La communauté concernée (France, Monde, etc)  
		 * > • `plateforme` : La plateforme concernée (Dofus PC, Dofus Touch, Dofus Rétro...)
		 *
		 * ---
		 * @example
		 * client.getServers(); // Renvoi une liste de tous les serveurs
		 * client.getServers("Tylezia"); // Renvoi les informations du serveurs Tylezia
		 */
		this.getServers = async (server) => {

			try {

				let link = "https://api.metamob.fr/serveurs";
				const linkParams = [];

				if (server) {
					linkParams.push(`nom=${server}`);
				}

				link += "?" + linkParams.join("&");

				const _ = await fetch(link, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Récupère les kralamoures.**
		 *
		 * ---
		 * @param {{
		 * serveur?:"Draconiros" | "HellMina" | "Imagiro" | "Ombre" | "Orukam" | "Oto-Mustam" | "Rosal" | "Rushu" | "TalKasha" | "Temporis" | "Tylezia" | "Brutas" | "Dodge" | "Grandapan" | "Herdegrize" | "Oshimo" | "Terra Cogita" | "Crail" | "Eratz" | "Galgarion" | "Henual",
		 * date_debut?:string,
		 * date_fin?:string,
		 * }} [params] **Paramètres de filtrage** :
		 *
		 * • `serveur?` : Le nom du serveur à filtrer, non sensible à la casse. La recherche partielle est possible (exemple: "Terr" fera remonter le serveur "Terra Cogita")  
		 * • `date_debut?` : La date de début du filtrage, au format YYYY-MM-DD  
		 * • `date_fin?` : La date de fin du filtrage, au format YYYY-MM-DD
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:Array<{
		 * id:string,
		 * date:string,
		 * url:string,
		 * serveur:"Draconiros" | "HellMina" | "Imagiro" | "Ombre" | "Orukam" | "Oto-Mustam" | "Rosal" | "Rushu" | "TalKasha" | "Temporis" | "Tylezia" | "Brutas" | "Dodge" | "Grandapan" | "Herdegrize" | "Oshimo" | "Terra Cogita" | "Crail" | "Eratz" | "Galgarion" | "Henual",
		 * createur:string,
		 * description:string,
		 * nombre_utilisateurs:string,
		 * nombre_comptes:string
		 * }>
		 * }>} **Renvoi une promesse de d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération des ouvertures kralamoures  
		 * • `result?` : Résultat  
		 * > • `id` : L'identifiant de l'évènement  
		 * > • `date` : La date de l'évènement prévu. Format YYYY-MM-DD HH:mm:ss  
		 * > • `url` : Le lien complet vers l'évènement  
		 * > • `serveur` : Le nom du serveur concerné  
		 * > • `createur` : Le pseudo de l'utilisateur qui a créé l'événement  
		 * > • `description` : La description de l'évènement  
		 * > • `nombre_utilisateurs` : Le nombre d'utilisateurs qui participeront à l'évènement  
		 * > • `nombre_comptes` : Le nombre de comptes qui participeront à l'évènement (la somme des champs "nombre" renseignée par les participants)
		 *
		 * ---
		 * @example
		 * client.getKralamoures(); // Renvoi une liste des ouvertures prévues entre la date du jour et 1 mois plus tard
		 * client.getKralamoures({ serveur:"Tylezia", date_fin:"XXXX-XX-XX" }); // Renvoi une liste des ouvertures prévues entre la date du jour et la date indiquée sur le serveur Tylezia
		 */
		this.getKralamoures = async (params) => {

			try {

				let link = "https://api.metamob.fr/kralamoures";
				const linkParams = [];

				if (params) {
					if (params.date_debut) {
						linkParams.push(`date_debut=${params.date_debut}`);
					}
					if (params.date_fin) {
						linkParams.push(`date_fin=${params.date_fin}`);
					}
					if (params.serveur) {
						linkParams.push(`serveur=${params.serveur}`);
					}
				}

				link += "?" + linkParams.join("&");

				const _ = await fetch(link, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Récupère les zones.**
		 *
		 * ---
		 * @param {"Amakna" | "Astrub" | "Baie de Sufokia" | "Bonta" | "Brakmar" | "Forêt des Abraknydes" | "Île d'Otomaï" | "Île de Grobe" | "Île de Moon" | "Île de Pandala" | "Île des Wabbits" | "Île du Minotoror" | "Labyrinthe du Dragon Cochon" | "Landes de Sidimote" | "Montagnes des Koalaks" | "Plaines de Cania"} [zone] 	Le nom de la zone à filtrer. Le filtre s'effectue sur le champ "libelle" mais aussi sur le champ "slug"
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:Array<{
		 * id:"5" | "6" | "13" | "16" | "12" | "2" | "3" | "7" | "10" | "4" | "8" | "14" | "15" | "11" | "9" | "1",
		 * libelle:"Amakna" | "Astrub" | "Baie de Sufokia" | "Bonta" | "Brakmar" | "Forêt des Abraknydes" | "Île d'Otomaï" | "Île de Grobe" | "Île de Moon" | "Île de Pandala" | "Île des Wabbits" | "Île du Minotoror" | "Labyrinthe du Dragon Cochon" | "Landes de Sidimote" | "Montagnes des Koalaks" | "Plaines de Cania",
		 * slug:"amakna" | "astrub" | "baie-de-sufokia" | "bonta" | "brakmar" | "foret-des-abraknydes" | "ile-d-otomai" | "ile-de-grobe" | "ile-de-moon" | "ile-de-pandala" | "ile-des-wabbits" | "ile-du-minotoror" | "labyrinthe-du-dragon-cochon" | "landes-de-sidimote" | "montagnes-des-koalaks" | "plaines-de-cania"
		 * }>
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération des zones  
		 * • `result?` : Résultat  
		 * > • `id` : L'identifiant de la zone  
		 * > • `libelle` : Le nom de la zone  
		 * > • `slug` : Le slug de la zone (le nom nettoyé)
		 *
		 * ---
		 * @example
		 * client.getZones(); // Renvoi une liste des toutes les zones
		 * client.getZones("Amakna"); // Renvoi les informations sur la zone Amakna
		 */
		this.getZones = async (zone) => {

			try {

				let link = `https://api.metamob.fr/zones`;
				const linkParams = [];

				if (zone) {
					linkParams.push(`nom=${zone}`);
				}

				link += "?" + linkParams.join("&");

				const _ = await fetch(link, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Récupère les sous-zones.**
		 *
		 * ---
		 * @param {"Aerdala" | "Akwadala" | "Antre de Crocabulia" | "Antre du Dragon Cochon" | "Arbre de Moon" | "Arche d'Otomaï" | "Atelier du Tanukouï San" | "Baie de Cania" | "Bambusaie de Damadrya" | "Bibliothèque du Maître corbac" | "Bois de Litneg" | "Bord de la forêt maléfique" | "Bordure de Brakmar" | "Calanques d'Astrub" | "Cale de l'arche d'otomaï" | "Canopée du Kimbo" | "Canyon sauvage" | "Caverne des Fungus" | "Caverne du Koulosse" | "Centre du labyrinthe du Minotoror" | "Champ des Ingalsse" | "Champs de Cania" | "Château du Wa Wabbit" | "Château Ensablé" | "Chemin du Crâne" | "Cimetière d'Amakna" | "Cimetière d'Astrub" | "Cimetière de Grobe" | "Cimetière des Torturés" | "Cimetière primitif" | "Cité d'Astrub" | "Clairière de Brouce Boulgoure" | "Clairière du Chêne Mou" | "Clos des Blops" | "Coin des Bouftous" | "Cour du Bouftou Royal" | "Cryptes du cimetière" | "Dents de Pierre" | "Désolation de Sidimote" | "Dojo du Vent" | "Domaine Ancestral" | "Domaine des Fungus" | "Donjon des Bworks" | "Donjon des Larves" | "Donjon des Rats du Château d'Amakna" | "Donjon des Scarafeuilles" | "Égouts d'Astrub" | "Entrailles de Brakmar" | "Épreuve de Draegnerys" | "Fabrique de foux d'artifice" | "Feudala" | "Forêt d'Amakna" | "Forêt de Kaliptus" | "Forêt des masques" | "Forêt maléfique" | "Forêt Sombre" | "Gelaxième dimension" | "Goulet du Rasboul" | "Grange du Tournesol Affamé" | "Grotte du Bworker" | "Grotte Hesque" | "Hauts des hurlements" | "Île de la Cawotte" | "Île du Minotoror" | "Îlot de la Couronne" | "îlot des Tombeaux" | "Jungle Interdite" | "Jungle Obscure" | "Laboratoire de Brumen Tinctorias" | "Laboratoire du Tynril" | "Labyrinthe du Dragon Cochon" | "Labyrinthe du Minotoror" | "Lac de Cania" | "Lacs enchantés" | "Marécages nauséabonds" | "Massif de Cania" | "Mont des Tombeaux" | "Montagne basse des Craqueleurs" | "Montagne des Craqueleurs" | "Orée de la forêt des Abraknydes" | "Passage vers Brakmar" | "Pénates du Corbac" | "Péninsule des gelées" | "Pics de Cania" | "Pitons Rocheux des Craqueleurs" | "Plage de Corail" | "Plage de la Tortue" | "Plaine des Porkass" | "Plaine des Scarafeuilles" | "Plaines herbeuses" | "Plaines Rocheuses" | "Plantala" | "Port de Madrestam" | "Presqu'île des Dragoeufs" | "Repaire de Skeunk" | "Repaire du Kharnozor" | "Rivage sufokien" | "Rives iridescentes" | "Routes Rocailleuses" | "Sanctuaire des Dragoeufs" | "Souterrains d'Astrub" | "Souterrains des Wabbits" | "Souterrains du Château d'Amakna" | "Sufokia" | "Tainéla" | "Tanière du Meulou" | "Temple du Grand Ougah" | "Terrdala" | "Territoire des Bandits" | "Territoire des Dragodindes Sauvages" | "Territoire des Porcos" | "Tofulailler royal" | "Tourbière sans fond" | "Tronc de l'arbre Hakam" | "Vallée de la Morh'kitu" | "Village de la Canopée" | "Village des dopeuls" | "Village des Dopeuls" | "Village des Dragoeufs" | "Volière de la Haute Truche"} [souszone] Le nom de la sous-zone à filtrer. Le filtre s'effectue sur le champ "libelle" mais aussi sur le champ "slug"
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:Array<{
		 * id:"40" | "35" | "56" | "125" | "106" | "24" | "44" | "3" | "39" | "15" | "9" | "69" | "115" | "83" | "31" | "32" | "97" | "108" | "100" | "122" | "74" | "8" | "90" | "82" | "102" | "128" | "81" | "87" | "114" | "94" | "84" | "50" | "21" | "7" | "48" | "79" | "67" | "2" | "109" | "42" | "20" | "107" | "49" | "73" | "70" | "72" | "76" | "116" | "61" | "41" | "37" | "68" | "99" | "104" | "45" | "18" | "65" | "33" | "85" | "127" | "28" | "112" | "88" | "121" | "89" | "92" | "103" | "22" | "110" | "34" | "124" | "120" | "5" | "95" | "93" | "16" | "86" | "52" | "54" | "19" | "46" | "10" | "64" | "6" | "55" | "27" | "105" | "4" | "63" | "25" | "11" | "36" | "66" | "59" | "101" | "62" | "118" | "126" | "12" | "57" | "77" | "91" | "51" | "119" | "78" | "111" | "113" | "38" | "47" | "96" | "53" | "75" | "26" | "23" | "98" | "29" | "1" | "13" | "58" | "14",
		 * libelle:"Aerdala" | "Akwadala" | "Antre de Crocabulia" | "Antre du Dragon Cochon" | "Arbre de Moon" | "Arche d'Otomaï" | "Atelier du Tanukouï San" | "Baie de Cania" | "Bambusaie de Damadrya" | "Bibliothèque du Maître corbac" | "Bois de Litneg" | "Bord de la forêt maléfique" | "Bordure de Brakmar" | "Calanques d'Astrub" | "Cale de l'arche d'otomaï" | "Canopée du Kimbo" | "Canyon sauvage" | "Caverne des Fungus" | "Caverne du Koulosse" | "Centre du labyrinthe du Minotoror" | "Champ des Ingalsse" | "Champs de Cania" | "Château du Wa Wabbit" | "Château Ensablé" | "Chemin du Crâne" | "Cimetière d'Amakna" | "Cimetière d'Astrub" | "Cimetière de Grobe" | "Cimetière des Torturés" | "Cimetière primitif" | "Cité d'Astrub" | "Clairière de Brouce Boulgoure" | "Clairière du Chêne Mou" | "Clos des Blops" | "Coin des Bouftous" | "Cour du Bouftou Royal" | "Cryptes du cimetière" | "Dents de Pierre" | "Désolation de Sidimote" | "Dojo du Vent" | "Domaine Ancestral" | "Domaine des Fungus" | "Donjon des Bworks" | "Donjon des Larves" | "Donjon des Rats du Château d'Amakna" | "Donjon des Scarafeuilles" | "Égouts d'Astrub" | "Entrailles de Brakmar" | "Épreuve de Draegnerys" | "Fabrique de foux d'artifice" | "Feudala" | "Forêt d'Amakna" | "Forêt de Kaliptus" | "Forêt des masques" | "Forêt maléfique" | "Forêt Sombre" | "Gelaxième dimension" | "Goulet du Rasboul" | "Grange du Tournesol Affamé" | "Grotte du Bworker" | "Grotte Hesque" | "Hauts des hurlements" | "Île de la Cawotte" | "Île du Minotoror" | "Îlot de la Couronne" | "îlot des Tombeaux" | "Jungle Interdite" | "Jungle Obscure" | "Laboratoire de Brumen Tinctorias" | "Laboratoire du Tynril" | "Labyrinthe du Dragon Cochon" | "Labyrinthe du Minotoror" | "Lac de Cania" | "Lacs enchantés" | "Marécages nauséabonds" | "Massif de Cania" | "Mont des Tombeaux" | "Montagne basse des Craqueleurs" | "Montagne des Craqueleurs" | "Orée de la forêt des Abraknydes" | "Passage vers Brakmar" | "Pénates du Corbac" | "Péninsule des gelées" | "Pics de Cania" | "Pitons Rocheux des Craqueleurs" | "Plage de Corail" | "Plage de la Tortue" | "Plaine des Porkass" | "Plaine des Scarafeuilles" | "Plaines herbeuses" | "Plaines Rocheuses" | "Plantala" | "Port de Madrestam" | "Presqu'île des Dragoeufs" | "Repaire de Skeunk" | "Repaire du Kharnozor" | "Rivage sufokien" | "Rives iridescentes" | "Routes Rocailleuses" | "Sanctuaire des Dragoeufs" | "Souterrains d'Astrub" | "Souterrains des Wabbits" | "Souterrains du Château d'Amakna" | "Sufokia" | "Tainéla" | "Tanière du Meulou" | "Temple du Grand Ougah" | "Terrdala" | "Territoire des Bandits" | "Territoire des Dragodindes Sauvages" | "Territoire des Porcos" | "Tofulailler royal" | "Tourbière sans fond" | "Tronc de l'arbre Hakam" | "Vallée de la Morh'kitu" | "Village de la Canopée" | "Village des dopeuls" | "Village des Dopeuls" | "Village des Dragoeufs" | "Volière de la Haute Truche",
		 * slug:"aerdala" | "akwadala" | "antre-de-crocabulia" | "antre-du-dragon-cochon" | "arbre-de-moon" | "arche-d-otomai" | "atelier-du-tanukoui-san" | "baie-de-cania" | "bambusaie-de-damadrya" | "bibliotheque-du-maitre-corbac" | "bois-de-litneg" | "bord-de-la-foret-malefique" | "bordure-de-brakmar" | "calanques-d-astrub" | "cale-de-l-arche-d-otomai" | "canopee-du-kimbo" | "canyon-sauvage" | "caverne-des-fungus" | "caverne-du-koulosse" | "centre-du-labyrinthe-du-minotoror" | "champ-des-ingalsse" | "champs-de-cania" | "chateau-du-wa-wabbit" | "chateau-ensable" | "chemin-du-crane" | "cimetiere-d-amakna" | "cimetiere-d-astrub" | "cimetiere-de-grobe" | "cimetiere-des-tortures" | "cimetiere-primitif" | "cite-dastrub" | "clairiere-de-brouce-boulgoure" | "clairiere-du-chene-mou" | "clos-des-blops" | "coin-des-bouftous" | "cour-du-bouftou-royal" | "cryptes-du-cimetiere" | "dents-de-pierre" | "desolation-de-sidimote" | "dojo-du-vent" | "domaine-ancestral" | "domaine-des-fungus" | "donjon-des-bworks" | "donjon-des-larves" | "donjon-des-rats-du-chateau-d-amakna" | "donjon-des-scarafeuilles" | "egouts-d-astrub" | "entrailles-de-brakmar" | "epreuve-de-draegnerys" | "fabrique-de-foux-d-artifice" | "feudala" | "foret-d-amakna" | "foret-de-kaliptus" | "foret-des-masques" | "foret-malefique" | "foret-sombre" | "gelaxieme-dimension" | "goulet-du-rasboul" | "grange-du-tournesol-affame" | "grotte-du-bworker" | "grotte-hesque" | "hauts-des-hurlements" | "ile-de-la-cawotte" | "ile-du-minotoror" | "ilot-de-la-couronne" | "ilot-des-tombeaux" | "jungle-interdite" | "jungle-obscure" | "laboratoire-de-brumen-tinctorias" | "laboratoire-du-tynril" | "labyrinthe-du-dragon-cochon" | "labyrinthe-du-minotoror" | "lac-de-cania" | "lacs-enchantes" | "marecages-nauseabonds" | "massif-de-cania" | "mont-des-tombeaux" | "montagne-basse-des-craqueleurs" | "montagne-des-craqueleurs" | "oree-de-la-foret-des-abraknydes" | "passage-vers-brakmar" | "penates-du-corbac" | "peninsule-des-gelees" | "pics-de-cania" | "pitons-rocheux-des-craqueleurs" | "plage-de-corail" | "plage-de-la-tortue" | "plaine-des-porkass" | "plaine-des-scarafeuilles" | "plaines-herbeuses" | "plaines-rocheuses" | "plantala" | "port-de-madrestam" | "presqu-ile-des-dragoeufs" | "repaire-de-skeunk" | "repaire-du-kharnozor" | "rivage-sufokien" | "rives-iridescentes" | "routes-rocailleuses" | "sanctuaire-des-dragoeufs" | "souterrains-d-astrub" | "souterrains-des-wabbits" | "souterrains-du-chateau-d-amakna" | "sufokia" | "tainela" | "taniere-du-meulou" | "temple-du-grand-ougah" | "terrdala" | "territoire-des-bandits" | "territoire-des-dragodindes-sauvages" | "territoire-des-porcos" | "tofulailler-royal" | "tourbiere-sans-fond" | "tronc-de-l-arbre-hakam" | "vallee-de-la-morh-kitu" | "village-de-la-canopee" | "village-des-dopeuls" | "village-des-dopeuls" | "village-des-dragoeufs" | "voliere-de-la-haute-truche",
		 * zone_libelle:"Amakna" | "Astrub" | "Baie de Sufokia" | "Bonta" | "Brakmar" | "Forêt des Abraknydes" | "Île d'Otomaï" | "Île de Grobe" | "Île de Moon" | "Île de Pandala" | "Île des Wabbits" | "Île du Minotoror" | "Labyrinthe du Dragon Cochon" | "Landes de Sidimote" | "Montagnes des Koalaks" | "Plaines de Cania",
		 * zone_slug:"amakna" | "astrub" | "baie-de-sufokia" | "bonta" | "brakmar" | "foret-des-abraknydes" | "ile-d-otomai" | "ile-de-grobe" | "ile-de-moon" | "ile-de-pandala" | "ile-des-wabbits" | "ile-du-minotoror" | "labyrinthe-du-dragon-cochon" | "landes-de-sidimote" | "montagnes-des-koalaks" | "plaines-de-cania",
		 * }>
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la récupération des sous-zones  
		 * • `result?` : Résultat  
		 * > • `id` : L'identifiant de la sous-zone  
		 * > • `libelle` : Le nom de la sous-zone  
		 * > • `slug` : Le slug de la sous-zone (le nom nettoyé)  
		 * > • `zone_libelle` : Le nom de la zone  
		 * > • `zone_slug` : Le slug de la zone (le nom nettoyé)
		 *
		 * ---
		 * @example
		 * client.getSouszones(); // Renvoi une liste de toutes les sous-zones
		 * client.getSouszones("Aerdala"); // Renvoi les informations de la sous-zones Aerdala
		 */
		this.getSouszones = async (souszone) => {

			try {

				let link = `https://api.metamob.fr/souszones`;
				const linkParams = [];

				if (souszone) {
					linkParams.push(`nom=${souszone}`);
				}

				link += "?" + linkParams.join("&");

				const _ = await fetch(link, {
					method:"GET",
					headers:{
						"HTTP-X-APIKEY":this.apiKey,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Met à jour les informations de monstre d'un compte utilisateur.**
		 *
		 * ---
		 * @param {string} username Le nom d'utilisateur
		 * @param {string} uniqueId L'identifiant unique de l'utilisateur
		 * @param {Array<{
		 * monstre:"Arakne" | "Arakne malade" | "Boufton blanc" | "Boufton noir" | "Crabe" | "Flammèche air" | "Flammèche eau" | "Flammèche feu" | "Flammèche terre" | "Larve bleue" | "Moskito" | "Piou bleu" | "Piou jaune" | "Piou rose" | "Piou rouge" | "Piou vert" | "Piou violet" | "Souris grise" | "Tofu" | "Tofu maléfique" | "Arakne des égoûts" | "Bandit du clan des Roublards" | "Bandit manchot" | "Black tiwabbit" | "Bouftou" | "Boulanger sombre" | "Champ champ" | "Gelée bleue" | "Gelée menthe" | "Gobet" | "Kolérat" | "Kwoan" | "Larve orange" | "Larve verte" | "Pissenlit diabolique" | "Rose démoniaque" | "Tiwabbit" | "Tiwabbit kiafin" | "Tofu malade" | "Tournesol sauvage" | "Berger Porkass" | "Biblop coco" | "Biblop griotte" | "Biblop indigo" | "Biblop reinette" | "Boo" | "Champa vert" | "Chef de Guerre Bouftou" | "Cochon de Lait" | "Crowneille" | "Gob-trotteur" | "Milirat Strubien" | "Nodkoko" | "Prespic" | "Sanglier" | "Tikoko" | "Tortue Jaune" | "Trukikol" | "Vampire" | "Wabbit" | "Bambouto" | "Bwork Mage" | "Corbac" | "Croc Gland" | "Croc Gland enragé" | "Etoile de la Mer d'Asse" | "Floristile" | "Fourbasse" | "Larve Jaune" | "Maître Vampire" | "Milimulou" | "Minoskito" | "Noeul" | "Pichon Blanc" | "Pichon Bleu" | "Pichon Orange" | "Pichon Vert" | "Tortue Bleue" | "Tortue rouge" | "Tortue Verte" | "Abraknyde" | "Black Wabbit" | "Bwork" | "Bwork Archer" | "Chafer Invisible" | "Champa Bleu" | "Champa Marron" | "Champa Rouge" | "Craqueboule" | "Craqueleur" | "Dragodinde Amande Sauvage" | "Gargrouille" | "Gelée Fraise" | "Ishigro PakeKraméléhon" | "Mandrine" | "Mineur Sombre" | "Rose Obscure" | "Wabbit Squelette" | "Abrakne" | "Blop Coco" | "Blop Griotte" | "Blop Indigo" | "Blop Reinette" | "Boomba" | "Chafer" | "Chafer Fantassin" | "Cochon de Farle" | "Crocodaille" | "Pichon Kloune" | "Rib" | "Scarafeuille Blanc" | "Scarafeuille Bleu" | "Scarafeuille Rouge" | "Scarafeuille Vert" | "Scaratos" | "Scélérat Strubien" | "Scorbute" | "Tronknyde" | "Aboub" | "Akakwa" | "Amlub" | "Arakne Majeure" | "Bulbuisson" | "Cavalier Porkass" | "Codem" | "Crustorail Kouraçao" | "Crustorail Malibout" | "Crustorail Morito" | "Crustorail Passaoh" | "Dragodinde Rousse Sauvage" | "Forgeron Sombre" | "Gink" | "Grand Pa Wabbit" | "Kirevam" | "Let Emoliug" | "Nebgib" | "Nipul" | "Wo Wabbit" | "Abraknyde Vénérable" | "Chafer Archer" | "Chafer d'élite" | "Chafer Lancier" | "Craqueleur des plaines" | "DoK Alako" | "Fangshu" | "Gamino" | "Koalak Immature" | "Kokoko" | "La Ouassingue" | "Le Ouassingue" | "Le Ouassingue Entourbé" | "Osurc" | "Palmifleur Malibout" | "Palmifleur Morito" | "Palmifleur Passaoh" | "Ramane d'Egoutant" | "Sanglier Des Plaines" | "Susej" | "Chafer Draugr" | "Crachefoux" | "Craqueboule Poli" | "Dragacé" | "Ino-Naru" | "Kanniboul Ark" | "Kanniboul Eth" | "Kanniboul Jav" | "Kanniboul Sarbak" | "Kwak de Flamme" | "Kwak de Glace" | "Kwak de Terre" | "Kwak de Vent" | "Macien" | "Maître Bolet" | "Palmifleur Kouraçao" | "Porsalu" | "Rat d'Egoutant" | "Sarkapwane" | "Vétauran" | "Betto" | "Canondorf" | "Corailleur" | "Don Duss Ang" | "Dragoeuf Ardoise" | "Dragoeuf Argile" | "Dragoeuf Calcaire" | "DragOeuf Charbon" | "Félygiène" | "Koalak Coco" | "Koalak Griotte" | "Koalak Indigo" | "Koalak Reinette" | "Lolojiki" | "Moumoule" | "Nakunbra" | "Rat d'Hyoactif" | "Raul Mops" | "Serpiplume" | "Sparo" | "Barbroussa" | "Bitouf des plaines" | "Chef Crocodaille" | "Chiendent" | "Craqueleur poli" | "Don Dorgan" | "Fantôme Apero" | "Fantôme Aux Plates" | "Fantôme Egérie" | "Fantôme Hicide" | "Kanigrou" | "Kido" | "Kilibriss" | "Kurookin" | "Larve Champêtre" | "Mufafah" | "MulouNerbe" | "Serpentin" | "Souris Verte" | "Abrakne sombre" | "Abraknyde sombre" | "Alhyène" | "Bourdard" | "Chevaucheur koalak" | "Dragodinde Dorée sauvage" | "Dragueuse" | "Fossoyeur koalak" | "Foufayteur" | "Gloutovore" | "Guerrier koalak" | "Koalak forestier" | "Kokom" | "Meupette" | "Orfélin" | "Panthègros" | "Parashukouï" | "Pékeualak" | "Piralak" | "Warko marron" | "Bitouf sombre" | "Bizarbwork" | "Bourbassingue" | "Brouture" | "Disciple zoth" | "Dragnarok" | "Draguaindrop" | "Fécorce" | "Floribonde" | "Gamine zoth" | "Grenufar" | "Guerrier zoth" | "Koalak farouche" | "Koalak sanguin" | "Krambwork" | "Mama koalak" | "Médibwork" | "Mégabwork" | "Momie koalak" | "Warko violet" | "Abrakleur sombre" | "Boumbardier" | "Dragoss Ardoise" | "Dragoss Argile" | "Dragoss Calcaire" | "Dragoss Charbon" | "Drakoalak" | "Fauchalak" | "Kaniblou" | "Maître koalak" | "Malle Outillée" | "Poolay" | "Robionicle" | "Robot Fléau" | "Rouquette" | "Tétonuki" | "Tourbassingue" | "Troollaraj" | "Abrakleur clair" | "Bakazako" | "Bitouf aérien" | "Champ à gnons" | "Champaknyde" | "Champbis" | "Champmane" | "Champodonte" | "Jiangshi-nobi" | "Kaskargo" | "Lichangoro" | "Madura" | "Maître Zoth" | "Onabu-geisha" | "Pétartifoux" | "Roissingue" | "Sergent zoth" | "Tambouraï" | "Tromperelle" | "Tsukinochi" | "Kaonashi" | "Tsume-Bozu" | "Blop Coco Royal" | "Blop Griotte Royal" | "Blop Indigo Royal" | "Blop Reinette Royal" | "Bouftou Royal" | "Bworkette" | "Déminoboule" | "Dragon Cochon" | "Gelée Royale Bleue" | "Gelée Royale Menthe" | "Minotoror" | "Mob l'Eponge" | "Mominotor" | "Rat Blanc" | "Rat Noir" | "Scarabosse Doré" | "Shin Larve" | "Tofu Royal" | "Tournesol Affamé" | "Wabbit GM" | "Abraknyde ancestral" | "Blop multicolore royal" | "Corailleur magistral" | "Craqueleur légendaire" | "Gardienne des égouts" | "Gelée Royale Fraise" | "Gourlo le terrible" | "Hanshi" | "Hell Mina" | "Koulosse" | "Maître corbac" | "Meulou" | "Moon" | "Skeunk" | "Tanukoui San" | "Tynril ahuri" | "Tynril consterné" | "Tynril déconcerté" | "Tynril perfide" | "Wa wabbit" | "Bworker" | "Chêne mou" | "Crocabulia" | "Founamboul" | "Gelée Royale Citron" | "Haute Truche" | "Kimbo" | "Minotot" | "Ougah" | "Silf le rasboul majeur" | "Sphincter cell" | "Arachitik la Souffreteuse" | "Araknay la Galopante" | "Arakule la Revancharde" | "Boudalf le Blanc" | "Boulgourvil le Lointain" | "Chamchie le Difficile" | "Craraboss le Féérique" | "Larvonika l'Instrument" | "Mosketère le Dévoué" | "Pioufe la Maquillée" | "Pioukas la Plante" | "Pioulbrineur le Mercenaire" | "Pioulette la Coquine" | "Pioussokrim le Délétère" | "Pioustone le Problème" | "Pissdane l'Insipide" | "Sourizoto le Collant" | "Tofuldebeu l'Explosif" | "Tofumanchou l'Empereur" | "Tofurapin le Pétri" | "Bandapar l'Exclu" | "Bandson le Tonitruant" | "Boudur le Raide" | "Boufdégou le Refoulant" | "Gelanal le Huileux" | "Geloliaine l'Aérien" | "Gobstiniais le Têtu" | "Kolforthe l'Indécollable" | "Kwoanneur le Frimeur" | "Larchimaide la Poussée" | "Larvapstrè le Subjectif" | "Nodkoku le Trahi" | "Roz la Magicienne" | "Serpistol l'Illustre" | "Tikosto le Mousse" | "Tiwa'Missou le Gateux" | "Tiwalpé le Dévêtu" | "Tiwoflan le Lâche" | "Tour le Vice" | "Trukul le Lent" | "Bi le Partageur" | "Bilvoezé le Bonimenteur" | "Bistou le Quêteur" | "Bistou le Rieur" | "Boostif l'Affamé" | "Bouflet le Puéril" | "Champayr le Disjoncté" | "Chevaustine le Reconstruit" | "Chonstip la Passagère" | "Cromikay le Néophyte" | "Étoilette la Bouchée" | "Milipussien le Géant" | "Porfavor le Quémandeur" | "Preskapwal le Tendancieux" | "Robiolego l'Assemblé" | "Sangria le Fruité" | "Tortenssia la Fleurie" | "Torthur la Lutte" | "Vampunor le Glacial" | "Wabbitud le Constant" | "Bambouské le Camouflé" | "Barchwork le Multicolore" | "Bwormage le Respectueux" | "Corpat le Vampire" | "Crognan le Barbare" | "Fourapin le Chaud" | "Maître Amboat le Moqueur" | "Milipatte la Griffe" | "Minoskour le Sauveur" | "Minsinistre l'Elu" | "Neufedur le Flottant" | "Pichakoté le Dégoûtant" | "Pichdourse le Puissant" | "Pichduitre le Totem" | "Pichtoire l'Erudit" | "Robocoop l'Échangé" | "Rostensyl la Cuisinière" | "Tortilleur le Coulé" | "Tortorak le Cornu" | "Wagnagnah le Sanglant" | "Abrakroc l'Edenté" | "Bworkasse le Dégoûtant" | "Chafalfer l'Optimiste" | "Chamdblé le Cultivé" | "Chamflay le Ballonné" | "Champayt l'Odorant" | "Crakmitaine le Faucheur" | "Craquetuss le Piquant" | "Draglida la Disparue" | "Garsim le Mort" | "Gelaviv le Glaçon" | "Krapahut le Randonneur" | "Mallopiée l'Épineuse" | "Mandalo l'Aqueuse" | "Ribibi le Cher" | "Scapé l'Epée" | "Scaramel le Fondant" | "Scarfayss le Balafré" | "Scarouarze l'Epopée" | "Watdogue le Bien Nommé" | "Abrakadnuzar" | "Blof l'Apathique" | "Bloporte le Veule" | "Blordur l'Infect" | "Blorie l'Assourdissante" | "Boombata le Garde" | "Bulsavon le Gonflé" | "Chafemal le Bagarreur" | "Chaffoin le Sournois" | "Crolnareff l'Exilé" | "Cruskof le Rustre" | "Crustensyl le Pragmatique" | "Crustterus l'Organique" | "Dragnoute l'Irascible" | "Farlon l'Enfant" | "Larvomatik le Propre" | "Radoutable le Craint" | "Scaratyn l'Huître" | "Scorpitène l'Enflammé" | "Tronkoneuz la Tranchante" | "Aboudbra le Porteur" | "Ameur la Laide" | "Arabord la Cruche" | "Cavordemal le Sorcier" | "Chafmarcel le Fêtard" | "Chalan le Commerçant" | "Codenlgaz le Problème" | "Crusmeyer le Pervers" | "Floriste la Cannibale" | "Forboyar l'Enigmatique" | "Ginsenk le Stimulant" | "Grandilok le Clameur" | "Kiroyal le Sirupeux" | "Koktèle le Secoué" | "Let le Rond" | "Nelvin le Boulet" | "Nipulnislip l'Exhibitionniste" | "Osuxion le Vampirique" | "Susbewl l'Hypocrite" | "Wokènrôl le Danseur" | "Abrakildas le Vénérable" | "Chafrit le Barbare" | "Cramikaz le Suicidaire" | "Craquetou le Fissuré" | "Doktopuss le Maléfique" | "Germinol l'Indigent" | "Grenuche la Gentille" | "Kannibal le Lecteur" | "Kapota la Fraise" | "Koalastrof la Naturelle" | "Koko la Violente" | "Maître Onom le Régulier" | "Ouashouash l'Exubérant" | "Ouassébo l'Esthète" | "Ouature la Mobile" | "Palmiche le Serein" | "Palmiflette le Convivial" | "Palmito le Menteur" | "Ramitant le Dilettante" | "Sampi l'Eternel" | "Akaka le Souillé" | "Bebetto l'Intellectuel" | "Corboyard l'Enigmatique" | "Dragioli le Succulent" | "Kannémik le Maigre" | "Kannisterik le Forcené" | "Kwakamole l'Appétissant" | "Kwaké le Piraté" | "Kwakolak le Chocolaté" | "Kwakwatique le Trempé" | "Moumoute la Douce" | "Ougaould le Parasite" | "Palmbytch la Bronzée" | "Parapadkouï l'Émasculé" | "Porsalé le Râleur" | "Ratlbol l'Aigri" | "Rauligo le Sale" | "Sarkastik l'Incompris" | "Serpistule le Purulent" | "Vétaurine L'énergisé" | "Barebourd le Comte" | "Caboume l'Artilleur" | "Chiendanlémin l'Illusionniste" | "Dragkouine la Déguisée" | "Dragmoclaiss le Fataliste" | "Dragnostik le Sceptique" | "Dragstayr le Fonceur" | "Fandanleuil le Précis" | "Fanlabiz le Véloce" | "Fantoch le Pantin" | "Fantrask la Rêveuse" | "Koakofrui le Confit" | "Koamaembair le Coulant" | "Koarmit la Batracienne" | "Koaskette la Chapelière" | "Nakuneuye le Borgne" | "Nerdeubeu le Flagellant" | "Ratéhaifaim le Professeur" | "Sparoket le Lanceur" | "Tilolo la Bien Moulée" | "Alhoui le Répondeur" | "Bonpake le Chavireur" | "Bourde le Maladroit" | "Crathdogue le Cruel" | "Crok le Beau" | "Dragonienne l'Econome" | "Félyssion la Gourmande" | "Fouflay le Retombé" | "Guerrite le Veilleur" | "Kanasukr le Mielleux" | "Kanibière l'Encordée" | "Kido l'Âtre" | "Kilimanj'haro le Grimpeur" | "Larvaloeil l'Émue" | "Mufguedin le Suprême" | "Muloufok l'Hilarant" | "Orfélyre le Charmeur" | "Pantacour le Long" | "Souristiti l'Immortalisée" | "Toufou le Benêt" | "Abrakanette l'Encapsulé" | "Abraklette le Fondant" | "Bitoven le Musicien" | "Brouste l'Humiliant" | "Craquecrac l'Endurant" | "Diskord le Belliqueux" | "Dragdikal le Décisif" | "Dragobert le Monarque" | "Fossamoel le Juteux" | "Gloubibou le Gars" | "Inopenope le Négatif" | "Koamag'oel le Défiguré" | "Koasossyal le Psychopathe" | "Lichangora l'Immaculée" | "Meuroup le Prêtre" | "Pékeutar le Tireur" | "Piradain le Pingre" | "Rooroku l'Imposant" | "Tétonée la Plantureuse" | "Warkolad l'Etreinte" | "Abrakine le Sombre" | "Bouliver le Géant" | "Drageaufol la Joyeuse" | "Dragminster le Magicien" | "Dragtarus le Bellâtre" | "Drakolage le Tentateur" | "Draquetteur le Voleur" | "Ecorfé la Vive" | "Fangshui la Dysorthographiée" | "Faufoll la Joyeuse" | "Floanna la Blonde" | "Gastroth la Contagieuse" | "Guerumoth le Collant" | "Koalaboi le Calorifère" | "Koalvissie le Chauve" | "Mamakomou l'Âge" | "Momikonos la Bandelette" | "Pétarfoutu le Mouillé" | "Tourbiket le Virevoletant" | "Wara l'Amer" | "Abrinos le Clair" | "Bigbadaboum l'Élémentaire" | "Chamiléro le Malchanceux" | "Chamoute le Duveteux" | "Champmé le Méchant" | "Champolyon le Polyglotte" | "Champoul l'Illuminé" | "Crachefouxtre le Surpris" | "Don Kizoth l'Obstiné" | "Jiankor le Radoteur" | "Kaskapointhe la Couverte" | "Maître Koantik le Théoricien" | "Onabuémangé la Rassasiée" | "Poolopo la Traditionnelle" | "Seripoth l'Ennemi" | "Tambouille le Gastronome" | "Toutouf le Velu" | "Tromplamor le Survivant" | "Trooyé l'Oxydé" | "Tsucékoi la Colporteuse" | "Bakaglace le Congelé" | "Kaonucléair l'Instable" | "Madgang le Docteur" | "Roy le Merlin" | "Tronquette la Réduite" | "Tsumani l'Inondeur",
         * quantite?:"===" | "+" | "-",
         * etat?:"propose" | "recherche" | "aucun"
		 * }>} body **Corp de la requête** :
		 * > • `monstre` : Le nom du monstre à incrémenter  
		 * > • `quantite?` :
		 * > * * Si la quantité renseigner commence par "===", la quantité du monstre sera forcée à cette valeur
		 * > * * Si la quantité renseigner commence par "+", la quantité du monstre sera incrémenter de cette valeur
		 * > * * Si la quantité renseigner commence par "-", la quantité du monstre sera décrémenter de cette valeur  
		 * 
		 * > • `etat?` : L'état dans le quel sera le monstre de l'utilisateur
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:{
		 * reussite:Record<"3" | "7" | "4" | "5" | "19" | "14" | "15" | "16" | "17" | "18" | "2" | "8" | "9" | "13" | "10" | "11" | "12" | "1" | "20" | "6" | "24" | "39" | "25" | "35" | "31" | "34" | "22" | "27" | "28" | "40" | "32" | "29" | "33" | "30" | "23" | "26" | "36" | "37" | "21" | "38" | "60" | "48" | "49" | "50" | "51" | "54" | "45" | "59" | "56" | "46" | "52" | "53" | "41" | "55" | "44" | "42" | "57" | "43" | "47" | "58" | "70" | "79" | "64" | "61" | "80" | "65" | "128" | "76" | "62" | "72" | "75" | "73" | "74" | "66" | "67" | "68" | "69" | "63" | "71" | "78" | "98" | "82" | "97" | "84" | "95" | "85" | "86" | "87" | "88" | "96" | "92" | "91" | "93" | "217" | "99" | "89" | "83" | "81" | "94" | "115" | "105" | "106" | "107" | "108" | "111" | "116" | "113" | "109" | "117" | "114" | "104" | "100" | "101" | "102" | "103" | "110" | "118" | "119" | "112" | "132" | "185" | "133" | "127" | "126" | "131" | "134" | "122" | "123" | "124" | "125" | "120" | "121" | "135" | "129" | "136" | "137" | "138" | "139" | "130" | "157" | "143" | "160" | "144" | "158" | "145" | "268" | "147" | "146" | "142" | "151" | "152" | "149" | "140" | "153" | "154" | "155" | "148" | "156" | "141" | "178" | "285" | "162" | "179" | "229" | "164" | "167" | "165" | "166" | "174" | "175" | "173" | "172" | "171" | "161" | "170" | "176" | "169" | "168" | "177" | "183" | "187" | "182" | "190" | "194" | "192" | "191" | "193" | "77" | "195" | "196" | "197" | "198" | "186" | "188" | "189" | "199" | "184" | "181" | "200" | "207" | "213" | "210" | "201" | "214" | "206" | "202" | "203" | "205" | "204" | "212" | "218" | "219" | "241" | "220" | "215" | "216" | "209" | "211" | "208" | "237" | "230" | "638" | "221" | "239" | "238" | "224" | "232" | "222" | "236" | "225" | "233" | "159" | "240" | "227" | "223" | "180" | "235" | "234" | "228" | "251" | "244" | "257" | "249" | "248" | "242" | "243" | "253" | "252" | "259" | "163" | "260" | "254" | "250" | "245" | "255" | "246" | "247" | "256" | "258" | "262" | "270" | "266" | "264" | "263" | "265" | "269" | "271" | "276" | "272" | "274" | "273" | "277" | "275" | "295" | "231" | "261" | "278" | "282" | "298" | "281" | "291" | "284" | "290" | "292" | "287" | "294" | "280" | "226" | "297" | "283" | "293" | "267" | "296" | "279" | "289" | "286" | "288" | "299" | "300" | "314" | "315" | "316" | "317" | "302" | "309" | "312" | "310" | "304" | "305" | "320" | "301" | "311" | "319" | "318" | "308" | "306" | "313" | "303" | "307" | "335" | "327" | "328" | "323" | "324" | "325" | "329" | "336" | "321" | "333" | "326" | "330" | "332" | "334" | "322" | "337" | "338" | "339" | "340" | "331" | "343" | "349" | "347" | "348" | "341" | "342" | "351" | "345" | "350" | "346" | "344" | "358" | "371" | "354" | "355" | "356" | "369" | "364" | "365" | "353" | "366" | "362" | "360" | "361" | "363" | "359" | "370" | "352" | "367" | "357" | "368" | "372" | "387" | "383" | "377" | "374" | "379" | "388" | "378" | "375" | "376" | "380" | "389" | "373" | "381" | "390" | "382" | "384" | "385" | "386" | "391" | "397" | "396" | "398" | "399" | "402" | "409" | "393" | "400" | "404" | "410" | "394" | "401" | "407" | "403" | "408" | "392" | "411" | "405" | "395" | "406" | "412" | "431" | "426" | "413" | "428" | "421" | "419" | "422" | "423" | "430" | "424" | "417" | "415" | "414" | "416" | "420" | "429" | "425" | "418" | "427" | "445" | "444" | "442" | "434" | "433" | "432" | "443" | "435" | "439" | "438" | "440" | "446" | "437" | "436" | "451" | "447" | "450" | "448" | "449" | "441" | "462" | "455" | "454" | "453" | "452" | "456" | "468" | "463" | "459" | "464" | "471" | "470" | "469" | "467" | "457" | "460" | "465" | "458" | "466" | "461" | "479" | "480" | "475" | "478" | "490" | "491" | "481" | "472" | "474" | "473" | "482" | "476" | "483" | "489" | "484" | "485" | "486" | "487" | "488" | "477" | "503" | "506" | "504" | "507" | "493" | "494" | "509" | "510" | "511" | "495" | "505" | "508" | "498" | "497" | "496" | "500" | "501" | "499" | "492" | "502" | "530" | "529" | "518" | "524" | "512" | "513" | "522" | "519" | "521" | "520" | "526" | "517" | "515" | "527" | "523" | "516" | "531" | "514" | "528" | "525" | "550" | "533" | "545" | "537" | "536" | "538" | "535" | "547" | "546" | "548" | "549" | "540" | "539" | "542" | "541" | "534" | "551" | "543" | "544" | "532" | "559" | "563" | "568" | "552" | "554" | "570" | "557" | "569" | "571" | "560" | "558" | "564" | "565" | "566" | "561" | "562" | "556" | "555" | "567" | "553" | "576" | "583" | "591" | "590" | "573" | "589" | "587" | "588" | "578" | "579" | "575" | "584" | "580" | "572" | "585" | "581" | "582" | "586" | "577" | "574" | "603" | "598" | "607" | "604" | "605" | "611" | "606" | "592" | "609" | "612" | "593" | "600" | "601" | "595" | "594" | "596" | "597" | "608" | "602" | "599" | "619" | "610" | "621" | "624" | "629" | "628" | "627" | "622" | "620" | "631" | "617" | "613" | "630" | "614" | "616" | "626" | "618" | "623" | "615" | "625" | "635" | "637" | "634" | "633" | "632" | "636", Array<string>>,
         * erreurs:Array<string>
		 * }
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la modification des monstres sur le profil utilisateur  
		 * • `result?` : Résultat  
		 * > • `reussite` : L'API répond avec un tableau contenant les actions effectuées pour chaque monstre dans un tableau nommé "réussite", et un tableau contenant les erreurs dans un tableau nommé "erreurs".  
		 * > • `erreurs` : L'API répond avec un tableau contenant les actions effectuées pour chaque monstre dans un tableau nommé "réussite", et un tableau contenant les erreurs dans un tableau nommé "erreurs".  
		 *
		 * ---
		 * @example
         client.putUserMonsters("pseudo_utilisateur", "id_unique_utilisateur", [
         { monstre:"Arakne", quantite:"+1" }, // La quantité du monstre "Arakne" sera incrémenter de 1
         { monstre:"Tsumani l'Inondeur", etat:"propose" }, // Le monstre "Tsumani l'Inondeur" passera à l'état proposé
         { monstre:"Boombata le Garde", quantite:"===5", etat:"aucun" }, // La quantité du monstre "Boombata le Garde" passera à 5 et son état à aucun
         ]).then(console.log);
		 * ])
		 */
		this.putUserMonsters = async (username, uniqueId, body) => {

			try {

				const link = `https://api.metamob.fr/utilisateurs/${username}/monstres`;
				const array = [];

				for (let i = 0; i < body.length; i++) {

					const monstre = MetamobData.monstres.find(m => m.nom === body[i].monstre);

					const objectToPush = {
						id:parseInt(monstre.id),
					};

					if (body[i].etat !== undefined) {
						objectToPush.etat = body[i].etat;
					}
					if (body[i].quantite !== undefined) {
						if (body[i].quantite?.startsWith("===")) {
							objectToPush.quantite = body[i].quantite?.slice(3);
						}
						else {
							objectToPush.quantite = body[i].quantite;
						}
					}

					array.push(objectToPush);

				}

				const _ = await fetch(link, {
					method:"PUT",
					headers:{
						"HTTP-X-APIKEY": this.apiKey,
						"HTTP-X-USERKEY": uniqueId,
					},
					body:JSON.stringify(array),
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};
		/**
		 * 👀 **Réinitialise les monstres sur le compte.**
		 * @param {string} username Le nom d'utilisateur
		 * @param {string} uniqueId L'identifiant unique de l'utilisateur
		 *
		 * ---
		 * @returns {Promise<{
		 * ok:boolean,
		 * statusText?:string,
		 * error?:string,
		 * result?:{
		 * reussite:string,
		 * erreurs:Array<string>
		 * }
		 * }>} **Renvoi une promesse d'objet** :
		 *
		 * • `ok` : État de la requête (true ou false)  
		 * • `statusText?` : État de la requête (similaire à error)  
		 * • `error?` : Erreur lors de la réinitialisation des monstres  
		 * • `result?` : **Résultat** :  
		 * > • `reussite` : Réponse en cas de reussite  
		 * > • `erreurs` : Réponses en cas d'erreurs
		 *
		 * ---
		 * @example
		 * client.resetUserMonsters("nom_utilisateur", "clé_unique_utilisateur");
		 */
		this.resetUserMonsters = async (username, uniqueId) => {

			try {

				const link = `https://api.metamob.fr/utilisateurs/${username}/monstres/reinitialiser`;

				const _ = await fetch(link, {
					method:"PUT",
					headers:{
						"HTTP-X-APIKEY": this.apiKey,
						"HTTP-X-USERKEY": uniqueId,
					},
				});

				if (!_.ok) {
					return { ok:false, statusText:_.statusText };
				}

				const result = await _.json();
				return { ok:true, result };

			}

			catch (error) {
				return { ok:false, error:error.stack };
			}

		};

	}

};
