const nodeComfort = require("@ix-xs/node-comfort");
const base = "https://www.metamob.fr/api/v1";
const cache = require("./cache/$");

/**
 * @see {@link https://www.metamob.fr/help/api|Metamob API Documentation}
 */
module.exports = class MetamobAPI {
  #api_key;

  cache = {
    get game_versions() {
      return cache.game_versions;
    },
    get monster_types() {
      return cache.monster_types;
    },
    get quest_types() {
      return cache.quest_types;
    },
    get monsters() {
      const monsterTypesById = new Map(cache.monster_types.map(t => [t.id, t]));
      const monstersById = new Map(cache.monsters.map(m => [m.id, m]));

      return cache.monsters.map(monster => ({
        ...monster,
        type: monsterTypesById.get(monster.type) ?? null,
        ...(monster.reference
          ? { reference: monstersById.get(monster.reference) ?? null }
          : {}),
      }));
    },
    get quest_templates() {
      const questTypesById = new Map(cache.quest_types.map(t => [t.id, t]));
      const gameVersionsById = new Map(cache.game_versions.map(v => [v.id, v]));
      const monstersById = new Map(cache.monsters.map(m => [m.id, m]));

      return cache.quest_templates.map(template => ({
        ...template,
        quest_type: questTypesById.get(template.quest_type) ?? null,
        game_version: gameVersionsById.get(template.game_version) ?? null,
        monsters: (template.monsters ?? [])
          .map(id => monstersById.get(id))
          .filter(Boolean),
      }));
    },
    get servers() {
      const gameVersionsById = new Map(cache.game_versions.map(v => [v.id, v]));

      return cache.servers.map(server => ({
        ...server,
        game_version: gameVersionsById.get(server.game_version) ?? null,
      }));
    },
    get subzones() {
      const zonesById = new Map(cache.zones.map(zone => [zone.id, zone]));
      const monstersById = new Map(cache.monsters.map(monster => [monster.id, monster]));

      return cache.subzones.map(subzone => ({
        ...subzone,
        zone: zonesById.get(subzone.zone) ?? null,
        monsters: (subzone.monsters ?? [])
          .map(id => monstersById.get(id))
          .filter(Boolean),
      }));
    },
    get zones() {
      const subzonesById = new Map(cache.subzones.map(subzone => [subzone.id, subzone]));

      return cache.zones.map(zone => ({
        ...zone,
        subzones: (zone.subzones ?? [])
          .map(id => subzonesById.get(id))
          .filter(Boolean),
      }));
    },
  };

  /**
   * @typedef {object} ClientOptions
   * @property {string} api_key
   */

  /**
   * @typedef {object} BaseResult
   * @property {boolean} ok
   * @property {number} status
   * @property {string} statusText
   * @property {string} [error]
   * @property {number} [retryAfter]
   */

  /**
   * @typedef {object} Pagination
   * @property {number} total
   * @property {number} limit
   * @property {number} offset
   */

  /**
   * @typedef {object} CursorPagination
   * @property {boolean} has_more
   * @property {number|null} [next_before_id]
   */

  /**
   * Options communes à toutes les requêtes.
   *
   * @typedef {object} RequestOptions
   * @property {string} [api_key] - Clé API à utiliser pour cette requête, à la place de celle du
   *   client. Destiné à agir pour le compte d'un autre utilisateur qui vous a confié sa clé
   *   (service/bot multi-utilisateurs). La limite de 60 req/min s'applique par clé : merci de la
   *   respecter et de ne pas l'utiliser pour la contourner.
   */

  /** @typedef {string} Username - Pseudo d'un utilisateur Metamob. */
  /** @typedef {string} QuestSlug - Identifiant court d'une quête (visible dans l'URL de la page de quête). */
  /** @typedef {string|number} KraloveId - Identifiant d'un évènement Kralamoure. */

  /** @typedef {1|2|3} GameVersionId */
  /** @typedef {"Dofus (Unity)"|"Dofus Retro (1.29)"|"Dofus Touch"} GameVersionName */

  /** @typedef {1|2|3} MonsterTypeId */
  /** @typedef {"monstre"|"boss"|"archimonstre"} MonsterTypeNameFr */
  /** @typedef {"monster"|"boss"|"archmonster"} MonsterTypeNameEn */
  /** @typedef {"monstruo"|"boss"|"archimonstruo"} MonsterTypeNameEs */

  /** @typedef {121|472|452|572|492|592|573|279|261|101|221|82|321|222|141|432|612|670|676|512|122|552|223|473|123|671|677|474|352|722|704|731|353|2|641|22|124|3|767|354|705|724|632|280|781|412|62|746|372|23|24|373|201|413|532|513|42|181|392|43|44|45|46|613|393|394|395|281|202|241|574|242|25|83|453|102|301|103|302|104|303|322|105|304|454|455|456|553|47|106|457|396|355|374|375|397|4|5|26|305|27|356|593|262|243|224|554|687|743|782|575|244|728|729|744|125|765|783|763|458|84|85|63|433|341|306|414|533|182|126|475|434|459|107|142|143|161|108|86|144|460|476|493|477|646|357|435|436|614|689|615|282|28|87|88|89|48|283|398|437|284|285|616|286|617|618|203|49|342|644|225|399|534|204|400|801|764|726|109|50|127|478|738|774|657|183|323|64|514|415|6|162|619|438|494|90|163|576|91|145|324|205|639|495|439|358|555|65|66|343|110|416|725|556|461|401|51|462|479|463|128|129|130|131|464|803|706|723|686|307|245|577|146|496|206|184|620|164|691|578|594|715|515|535|806|440|698|595|536|246|537|465|579|92|226|132|699|185|186|647|662|648|187|188|649|666|650|651|667|652|674|653|668|654|675|308|557|700|263|264|658|678|265|266|659|679|660|680|661|681|692|538|693|694|596|701|695|696|247|227|697|267|597|598|599|67|402|794|539|789|780|147|600|775|790|777|778|540|795|776|796|791|792|797|541|207|663|740|208|664|209|210|751|756|752|758|753|754|759|757|542|805|466|268|601|248|189|558|7|8|9|10|602|249|480|68|481|133|580|228|229|559|344|804|417|69|250|148|325|712|702|93|441|603|376|442|642|29|94|30|685|309|345|326|310|377|497|134|482|581|230|52|643|31|378|327|135|483|498|251|688|231|252|560|604|328|346|329|672|682|165|582|95|287|621|707|719|561|562|269|211|516|499|733|166|167|168|169|655|517|299|633|500|622|288|212|563|213|564|347|136|484|737|730|745|748|770|786|784|766|543|605|190|253|232|191|149|192|193|254|501|606|544|583|545|546|584|502|150|233|485|32|379|330|255|96|443|840|828|814|826|820|810|816|812|842|809|811|813|815|817|829|831|833|835|837|819|821|823|825|827|839|841|843|845|847|834|818|832|846|824|838|848|830|822|836|844|214|170|171|172|173|518|519|520|521|33|380|151|381|565|382|11|215|70|34|35|467|359|665|152|153|734|771|137|486|585|289|194|174|634|290|749|787|418|175|503|331|270|623|690|760|71|291|271|444|256|607|445|97|721|257|258|332|234|586|72|419|403|727|53|98|73|420|311|348|421|312|259|608|313|333|360|12|195|522|216|566|217|567|196|547|720|138|487|218|548|422|139|488|54|383|74|292|624|742|785|708|717|235|568|154|489|504|505|506|349|716|523|656|524|507|508|176|155|156|157|509|735|772|739|736|768|769|732|798|755|773|741|779|569|236|525|237|238|587|761|609|293|423|424|425|75|76|111|77|78|714|426|13|14|15|16|17|18|361|362|363|364|365|366|588|239|367|36|272|625|404|526|177|405|55|468|800|158|510|314|178|645|197|315|807|549|527|198|528|802|112|446|406|273|427|274|294|589|37|99|428|275|635|384|718|703|713|511|56|159|407|179|529|447|316|113|114|115|116|448|117|469|449|450|118|119|470|295|626|219|199|385|530|317|350|334|747|788|640|220|570|711|19|368|200|550|351|490|160|627|296|335|683|673|590|276|57|386|551|387|38|39|388|389|20|40|21|318|369|370|371|408|409|429|430|79|58|80|81|762|571|390|277|610|319|41|628|297|629|120|471|636|684|278|630|59|391|631|298|637|300|336|337|338|339|60|410|180|531|340|61|320|100|411|431|611|240|260|591|451|140|491|750|793|709} MonsterId */ /** TODO EXACT TYPE */
  /** @typedef {"Aboub"|"Aboudbra le Porteur"|"Abrakadnuzar"|"Abrakanette l'Encapsulé"|"Abrakildas le Vénérable"|"Abrakine le Sombre"|"Abraklette le Fondant"|"Abrakleur Clair"|"Abrakleur Sombre"|"Abrakne"|"Abrakne Sombre"|"Abraknyde"|"Abraknyde Ancestral"|"Abraknyde Sombre"|"Abraknyde Vénérable"|"Abrakroc l'édenté"|"Abrinos le Clair"|"Aerohouctor le guerrier"|"Aerotrugobur le Malveillant"|"Akaka le Souillé"|"Akakwa"|"Alhoui le Répondeur"|"Alhyène"|"Ameur la Laide"|"Amlub"|"Aquabralak le guerrier"|"Aqualikros l'impitoyable"|"Arabord la Cruche"|"Arachitik la Souffreteuse"|"Arakazam la Psychique"|"Arakmuté"|"Araknawa"|"Araknay la Galopante"|"Arakne"|"Arakne Agressive"|"Arakne des Égouts"|"Arakne Majeure"|"Arakne Malade"|"Arakozette l'Intrépide"|"Arakule la Revancharde"|"Arapex"|"Arapliké la Calligraphe"|"Bakaglace le Congelé"|"Bakazako"|"Bambono le Divin"|"Bambouské le Camouflé"|"Bambouto"|"Bambouto Sacré"|"Bandapar l'Exclu"|"Bandit du clan des Roublards"|"Bandit Manchot"|"Bandson le Tonitruant"|"Barbroussa"|"Barchwork le Multicolore"|"Barebourd le Comte"|"Bebetto l'Intellectuel"|"Berger Porkass"|"Betto"|"Bi le Partageur"|"Biblop Coco"|"Biblop Griotte"|"Biblop Indigo"|"Biblop Reinette"|"Bigbadaboum l'Élémentaire"|"Bilvoezé le Bonimenteur"|"Bistou le Quêteur"|"Bistou le Rieur"|"Bitouf Aérien"|"Bitouf des Plaines"|"Bitouf Sombre"|"Bitoven le Musicien"|"Bizarbwork"|"Black Tiwabbit"|"Black Wabbit"|"Blof l'Apathique"|"Blop Coco"|"Blop Coco Royal"|"Blop Griotte"|"Blop Griotte Royal"|"Blop Indigo"|"Blop Indigo Royal"|"Blop Multicolore Royal"|"Blop Reinette"|"Blop Reinette Royal"|"Bloporte le Veule"|"Blordur l'Infect"|"Blorie l'Assourdissante"|"Bonpake le Chavireur"|"Boo"|"Boomba"|"Boombata le Garde"|"Boostif l'Affamé"|"Boudalf le Blanc"|"Boudur le Raide"|"Boufdégou le Refoulant"|"Bouflet le Puéril"|"Boufton Blanc"|"Boufton Noir"|"Bouftou"|"Bouftou Royal"|"Boulanger Sombre"|"Boulgourvil le Lointain"|"Bouliver le Géant"|"Boumbardier"|"Bourbassingue"|"Bourdard"|"Bourde le Maladroit"|"Bourdilleu le Social"|"Braconnier"|"Bramin le Bicéphale"|"Brouste l'Humiliant"|"Brouture"|"Bulbambou"|"Bulbiflore"|"Bulbig"|"Bulbuisson"|"Buldeflore le Pénétrant"|"Bulgig le Danseur"|"Bulleur le Dormeur"|"Bulsavon le Gonflé"|"Bwork"|"Bwork Archer"|"Bwork Mage"|"Bworkasse le Dégoutant"|"Bworker"|"Bworkette"|"Bwormage le Respectueux"|"Caboume l'Artilleur"|"Canondorf"|"Cavalier Porkass"|"Cavordemal le Sorcier"|"Chafalfer l'Optimiste"|"Chafemal le Bagarreur"|"Chafer"|"Chafer Archer"|"Chafer d'Élite"|"Chafer Draugr"|"Chafer Fantassin"|"Chafer Invisible"|"Chafer Lancier"|"Chaffoin le Sournois"|"Chafmarcel le Fêtard"|"Chafrit le Barbare"|"Chalan le Commerçant"|"Chamane d'Egoutant"|"Chamchie le Difficile"|"Chamdblé le Cultivé"|"Chamflay le Ballonné"|"Chamilero le Malchanceux"|"Chamitant le Dillettante"|"Chamoute le Duveteux"|"Champ à Gnons"|"Champ Champ"|"Champa Bleu"|"Champa Marron"|"Champa Rouge"|"Champa Vert"|"Champaknyde"|"Champayr le Disjoncté"|"Champayt l'Odorant"|"Champbis"|"Champmane"|"Champmé le Méchant"|"Champodonte"|"Champolyon le Polyglotte"|"Champoul l'Illuminé"|"Chef Crocodaille"|"Chef de Guerre Bouftou"|"Chêne Mou"|"Chevaucheur de Karne"|"Chevaucheur Koalak"|"Chevaustine le Reconstruit"|"Chiendanlémin l'Illusionniste"|"Chiendent"|"Chonstip la Passagère"|"Choudini"|"Citassaté le Service"|"Citwouille"|"Cochon de Farle"|"Cochon de Lait"|"Codem"|"Codenlgaz le Problème"|"Cooleuvre"|"Cooligane le Névrosé"|"Coquille Explosive"|"Corailleur"|"Corailleur Magistral"|"Corbac"|"Corboyard l'Enigmatique"|"Corpat le Vampire"|"Crabe"|"Crachefoux"|"Crachefouxtre le Surpris"|"Crakmitaine le Faucheur"|"Cramikaz le Suicidaire"|"Craqueboule"|"Craqueboule Poli"|"Craquecrac l'Endurant"|"Craqueleur"|"Craqueleur des Plaines"|"Craqueleur Légendaire"|"Craqueleur Poli"|"Craquelourd"|"Craquetou le Fissuré"|"Craquetuss le Piquant"|"Craraboss le Féérique"|"Crathdogue le Cruel"|"Croc Gland"|"Croc Gland Enragé"|"Crocabulia"|"Crocodaille"|"Crognan le Barbare"|"Crognan le Barbare"|"Crok le Beau"|"Crolnareff l'Exilé"|"Cromikay le Néophyte"|"Crowneille"|"Cruskof le Rustre"|"Crusmeyer le Pervers"|"Crustensyl le Pragmatique"|"Crustorail Kouraçao"|"Crustorail Malibout"|"Crustorail Morito"|"Crustorail Passaoh"|"Crustterus l'Organique"|"Damadrya"|"Dardalaine"|"Dardamel la Kidnappeuse"|"Dark Vlad"|"Déminoboule"|"Disciple Zoth"|"Diskord le Belliqueux"|"Dok Alako"|"Doktopuss le Maléfique"|"Don Dorgan"|"Don Duss Ang"|"Don Kizoth l'Obstiné"|"Dragacé"|"Dragalgan l'Effervescent"|"Dragdikal le Décisif"|"Drageaufol la Joyeuse"|"Dragioli le Succulent"|"Dragioli le Succulent"|"Dragkouine la Déguisée"|"Dragkouine la Magnifique"|"Draglida la Disparue"|"Dragma le Bouillant"|"Dragminster le Magicien"|"Dragmoclaiss le Fataliste"|"Dragnarok"|"Dragnostik le Sceptique"|"Dragnoute l'Irascible"|"Dragobert le Monarque"|"Dragodinde amande sauvage"|"Dragodinde dorée sauvage"|"Dragodinde rousse sauvage"|"Dragoeth le Penseur"|"Dragoeuf Ardoise"|"Dragoeuf Argile"|"DragOeuf Blanc"|"DragOeuf Blanc Éveillé"|"DragOeuf Blanc Immature"|"Dragoeuf Calcaire"|"Dragoeuf Charbon"|"DragOeuf de Saphir"|"DragOeuf de Saphir Éveillé"|"DragOeuf de Saphir Immature"|"DragOeuf Doré"|"DragOeuf Doré Éveillé"|"DragOeuf Doré Immature"|"Dragoeuf Guerrier"|"DragOeuf Noir"|"DragOeuf Noir Éveillé"|"DragOeuf Noir Immature"|"Dragoeuf Volant"|"Dragon Cochon"|"Dragonienne l'Econome"|"Dragoo le Cramoisi"|"Dragoss Ardoise"|"Dragoss Argile"|"Dragoss Blanc"|"Dragoss Blanc Eveillé"|"Dragoss Calcaire"|"Dragoss Charbon"|"Dragoss de Saphir"|"Dragoss de Saphir Eveillé"|"Dragoss Doré"|"Dragoss Doré Éveillé"|"Dragoss Noir"|"Dragoss Noir Éveillé"|"Dragsta le Détendu"|"Dragstayr le Fonceur"|"Dragstik le Frustre"|"Dragstore le Généraliste"|"Dragtarus le Bellâtre"|"Dragtonien le Malvoyant"|"Dragtopaile l'Excavateur"|"Dragtula l'Ancien"|"Draguaindrop"|"Dragueuse"|"Dragybuss le Sucré"|"Drakoalak"|"Drakolage le Tentateur"|"Draquetteur le Voleur"|"Ecorfé la Vive"|"Étoile de la Mer d'Asse"|"Étoilette la Bouchée"|"Fanburn le Viril"|"Fandanleuil le Précis"|"Fandouich l'Hautain"|"Fanfancisco le Cosmopolite"|"Fangshu"|"Fangshui la Dysorthographiée"|"Fanhnatur le Simple"|"Fanhopruno le Gourmet"|"Fanjipann le Sucré"|"Fanjo le Pilote"|"Fanlabiz le Véloce"|"Fanlagoel le Comique"|"Fanlmyl l'Acuité"|"Fansiss la Brêle"|"Fansissla l'Âne"|"Fanstatik l'Etonnant"|"Fantassein le Soldat"|"Fantoch le Pantin"|"Fantôme Apero"|"Fantôme Ardent"|"Fantôme Arepo"|"Fantôme Aux Plates"|"Fantôme Brave"|"Fantôme Égérie"|"Fantôme Hicide"|"Fantôme Léopardo"|"Fantôme Maho Firefoux"|"Fantôme Pandikaze"|"Fantôme Pandore"|"Fantôme Pandule"|"Fantôme Soryo Firefoux"|"Fantôme Tanukouï San"|"Fantôme Yokai Firefoux"|"Fantrask la Rêveuse"|"Fantrask le Rêveur"|"Farlon l'Enfant"|"Fauchalak"|"Faufoll la Joyeuse"|"Fécorce"|"Félygiène"|"Félyssion la Gourmande"|"Flammèche Air"|"Flammèche Eau"|"Flammèche Feu"|"Flammèche Terre"|"Floanna la Blonde"|"Floribonde"|"Floriste la Cannibale"|"Floristile"|"Forboyar l'Enigmatique"|"Forgeron Sombre"|"Fossamoel le Juteux"|"Fossoyeur Koalak"|"Foufayteur"|"Fouflay le Retombé"|"Founamboul"|"Founoroshi"|"Fourapin le Chaud"|"Fourbasse"|"Gamine Zoth"|"Gamino"|"Gardienne des Égouts"|"Gargantua la Dévoreuse"|"Gargantûl"|"Gargrouille"|"Garsim le Mort"|"Gastroth la Contagieuse"|"Gelanal le Huileux"|"Gelaviv le Glaçon"|"Gelée Bleue"|"Gelée Bleuet"|"Gelée Fraise"|"Gelée Menthe"|"Gelée Royale Bleue"|"Gelée Royale Bleuet"|"Gelée Royale Citron"|"Gelée Royale Fraise"|"Gelée Royale Menthe"|"Geloliaine l'Aérien"|"Germinol l'Indigent"|"Gink"|"Ginsenk le Stimulant"|"Gloubibou le Gars"|"Gloutovore"|"Gob-trotteur"|"Gobelin"|"Gobet"|"Gobstiniais le Têtu"|"Gourlo le Terrible"|"Grand Pa Wabbit"|"Grandilok le Clameur"|"Grenuche la Gentille"|"Grenufar"|"Grokosto le Bosco"|"Guerrier Koalak"|"Guerrier Zoth"|"Guerrite le Veilleur"|"Guerumoth le Collant"|"Hanshi"|"Haute Truche"|"Hell Mina"|"Ignelicrobur le Guerrier"|"Ignerkocropos l'Affamé"|"Ino-Naru"|"Inopenope le Négatif"|"Ishigro Pake"|"Jiangshi-Nobi"|"Jiankor le Radoteur"|"Kaeneko"|"Kaenepris l'Amoureux"|"Kanasukr le Mielleux"|"Kanibière l'Encordée"|"Kaniblou"|"Kanigrou"|"Kannémik le Maigre"|"Kannibal le Lecteur"|"Kanniboul Archer"|"Kanniboul Ark"|"Kanniboul Eth"|"Kanniboul Jav"|"Kanniboul Sarbak"|"Kanniboul Thierry"|"Kannisterik le Forcené"|"Kaonashi"|"Kaonucléair l'Instable"|"Kapota la Fraise"|"Kaskapointhe la Couverte"|"Kaskargo"|"Kido"|"Kido l'Âtre"|"Kilibriss"|"Kilimanj'haro le Grimpeur"|"Kimbo"|"Kirevam"|"Kiroyal le Sirupeux"|"Kitsou Nae"|"Kitsou Nakwa"|"Kitsou Nere"|"Kitsou Nufeu"|"Kitsoudbra le Malodorant"|"Kitsoufre l'Explosif"|"Kitsoupierre le Récipient"|"Kitsoupopulère le Généreux"|"Koakofrui le Confit"|"Koalaboi le Calorifère"|"Koalak Coco"|"Koalak Farouche"|"Koalak Forestier"|"Koalak Griotte"|"Koalak Immature"|"Koalak Indigo"|"Koalak Reinette"|"Koalak Sanguin"|"Koalastrof la Naturelle"|"Koalvissie le Chauve"|"Koamaembair le Coulant"|"Koamag'oel le Défiguré"|"Koarmit la Batracienne"|"Koaskette la Chapelière"|"Koasossyal le Psychopathe"|"Koko la Violente"|"Kokoko"|"Kokom"|"Koktèle le Secoué"|"Kolérat"|"Kolforthe l'Indécollable"|"Koulosse"|"Krambwork"|"Kraméléhon"|"Krapahut le Randonneur"|"Krokage la Vorace"|"Krokblanche l'Immaculée"|"Krokcinelle la Tâchetée"|"Krokée l'Entamée"|"Krokenjambe la Tombeuse"|"Krokette la Croustillante"|"Krokikrisp la Céréalière"|"Krokillage la Marine"|"Krokillagée la Sage"|"Krokille Juvénile Boueuse"|"Krokille Juvénile Humide"|"Krokille Juvénile Incandescente"|"Krokille Juvénile Insipide"|"Krokille Juvénile Sèche"|"Krokille Mature Boueuse"|"Krokille Mature Humide"|"Krokille Mature Incandescente"|"Krokille Mature Insipide"|"Krokille Mature Sèche"|"Krokille Novice Boueuse"|"Krokille Novice Humide"|"Krokille Novice Incandescente"|"Krokille Novice Insipide"|"Krokille Novice Sèche"|"Krokille Vénérable Boueuse"|"Krokille Vénérable Humide"|"Krokille Vénérable Incandescente"|"Krokille Vénérable Insipide"|"Krokille Vénérable Sèche"|"Krokine l'Allumeuse"|"Krokis l'Esquissée"|"Kroknemboure la Mousseuse"|"Krokobure la Maudite"|"Krokotte la Minutée"|"Krokpit la Pilotée"|"Krokrane la Distordue"|"Krokrodaille la Mordante"|"Kroktail la Désaltérante"|"Krokue la Trompée"|"Krokuite la Calcinée"|"Kurookin"|"Kwak de Flamme"|"Kwak de Glace"|"Kwak de Terre"|"Kwak de Vent"|"Kwakamole l'Appétissant"|"Kwaké le Piraté"|"Kwakolak le Chocolaté"|"Kwakwatique le Trempé"|"Kwoan"|"Kwoanneur le Frimeur"|"La Ouassingue"|"Larchimaide la Poussée"|"Larvaloeil l'Émue"|"Larvapstrè le Subjectif"|"Larve Bleue"|"Larve Champêtre"|"Larve Jaune"|"Larve Orange"|"Larve Verte"|"Larvomatik le Propre"|"Larvonika l'Instrument"|"Le Flib"|"Le Ouassingue"|"Le Ouassingue Entourbé"|"Léopardo"|"Léopolnor le Barde"|"Let Emoliug"|"Let le Rond"|"Lichangora l'Immaculée"|"Lichangoro"|"Lolojiki"|"Macien"|"Madgang le Docteur"|"Madura"|"Maho Firefoux"|"Mahoku le Botté"|"Maître Amboat le Moqueur"|"Maître Bolet"|"Maître Champeur le Sabreur"|"Maître Corbac"|"Maître Koalak"|"Maître Koantik le Théoricien"|"Maître Onom le Régulier"|"Maître Pandore"|"Maître Vampire"|"Maître Zoth"|"Malle Outillée"|"Mallopiée l'Épineuse"|"Mama Koalak"|"Mamakomou l'Âge"|"Mandalo l'Aqueuse"|"Mandrine"|"Marude l'Ensablé"|"Médibwork"|"Mégabwork"|"Meulou"|"Meupette"|"Meuroup le Prêtre"|"Milimulou"|"Milipatte la Griffe"|"Milipussien le Géant"|"Milirat d'Egoutant malade"|"Milirat Strubien"|"Mineur Sombre"|"Minoskito"|"Minoskour le Sauveur"|"Minotoror"|"Minotot"|"Minsinistre l'Elu"|"Mob l'Éponge"|"Momie Koalak"|"Momikonos la Bandelette"|"Mominotor"|"Moon"|"Mosketère le Dévoué"|"Moskito"|"Moumoule"|"Moumoute la Douce"|"Mufafah"|"Mufguedin le Suprême"|"Mulou"|"Muloufok l'Hilarant"|"Nakunbra"|"Nakuneuye le Borgne"|"Nanashi le Virtuose"|"Nebgib"|"Nelvin le Boulet"|"Nerbe"|"Nerdeubeu le Flagellant"|"Neufedur le Flottant"|"Nipul"|"Nipulnislip l'Exhibitionniste"|"Nodkoko"|"Nodkoku le Trahi"|"Noeul"|"Onabu-Geisha"|"Onabuémangé la Rassasiée"|"Oni"|"Onihylis le Destructeur"|"Onirakam"|"Onistérique le déchainé"|"Orfélin"|"Orfélyre le Charmeur"|"Osurc"|"Osuxion le Vampirique"|"Ouashouash l'Exubérant"|"Ouassébo l'Esthète"|"Ouature la Mobile"|"Ougah"|"Ougaould le Parasite"|"Ougaould le Parasite"|"Ouginak"|"Palmbytch la Bronzée"|"Palmiche le Serein"|"Palmiflette le Convivial"|"Palmifleur Kouraçao"|"Palmifleur Malibout"|"Palmifleur Morito"|"Palmifleur Passaoh"|"Palmito le Menteur"|"Pandalette Ivre"|"Pandanlagl la Saoule"|"Pandawa Ivre"|"Pandikaze"|"Pandimaensh l'Animateur"|"Pandimy le Contagieux"|"Pandit"|"Pandive le Végétarien"|"Pandore"|"Pandouille le Titubant"|"Pandule"|"Pangraive le Militant"|"Pantacour le Long"|"Panthègros"|"Parapadkouï l'Émasculé"|"Parashukouï"|"Pékeualak"|"Pékeutar le Tireur"|"Péki Péki"|"Pétarfoutu le Mouillé"|"Pétartifoux"|"Pichakoté le Dégoutant"|"Pichdourse le Puissant"|"Pichduitre le Totem"|"Pichon Blanc"|"Pichon Bleu"|"Pichon Kloune"|"Pichon Orange"|"Pichon Vert"|"Picht le Brioché"|"Pichtoire l'Erudit"|"Piou Bleu"|"Piou Jaune"|"Piou Rose"|"Piou Rouge"|"Piou Vert"|"Piou Violet"|"Pioufe la Maquillée"|"Pioukas la Plante"|"Pioulbrineur le Mercenaire"|"Pioulette la Coquine"|"Pioussokrim le Délétère"|"Pioustone le Problème"|"Piradain le Pingre"|"Piralak"|"Pissdane l'Insipide"|"Pissenlit Diabolique"|"Poolay"|"Poolopo la Traditionnelle"|"Porfavor le Quémandeur"|"Porsalé le Râleur"|"Porsalu"|"Preskapwal le Tendancieux"|"Prespic"|"Radoutable le Craint"|"Rakoopeur"|"Ramane d'Égoutant"|"Ramitant le Dilettante"|"Rat Blanc"|"Rat d'Égoutant"|"Rat d'Egoutant Malade"|"Rat d'Hyoactif"|"Rat Noir"|"Ratatouille le Cuisinier"|"Ratéhaifaim le Professeur"|"Ratlbol l'Aigri"|"Raul Mops"|"Rauligo le Sale"|"Reine Nyée"|"Rib"|"Ribibi le Cher"|"Robiolego l'Assemblé"|"Robionicle"|"Robocoop l'Échangé"|"Robot Fléau"|"Roissingue"|"Rooroku l'Imposant"|"Rose Démoniaque"|"Rose Obscure"|"Rostensyl la Cuisinière"|"Rouquette"|"Roy le Merlin"|"Roz la Magicienne"|"Sakkado la Transporteuse"|"Saltik"|"Saltoavan la Gymnaste"|"Sampi l'Eternel"|"Sanglier"|"Sanglier des Plaines"|"Sangria le Fruité"|"Sarkapwane"|"Sarkastik l'Incompris"|"Scapé l'Epée"|"Scarabosse Doré"|"Scarafeuille Blanc"|"Scarafeuille Bleu"|"Scarafeuille Rouge"|"Scarafeuille Vert"|"Scaramel le Fondant"|"Scaratos"|"Scaratyn l'Huître"|"Scarfayss le Balafré"|"Scarouarze l'Epopée"|"Scélérat Strubien"|"Scorbute"|"Scorpitène l'Enflammé"|"Sergent Zoth"|"Seripoth l'Ennemi"|"Serpentin"|"Serpiplume"|"Serpistol l'Illustre"|"Serpistule le Purulent"|"Shin Larve"|"Silf le Rasboul Majeur"|"Skeunk"|"Soryo Firefoux"|"Soryonara le Poli"|"Souris Grise"|"Souris Verte"|"Souristiti l'Immortalisée"|"Sourizoto le Collant"|"Sousouris Grise"|"Sousourizoto le Collant"|"Sparo"|"Sparoket le Lanceur"|"Sphincter Cell"|"Susbewl l'Hypocrite"|"Susej"|"Tambouille le Gastronome"|"Tambouraï"|"Tanukouï San"|"Terraburkal le Perfide"|"Terrakoubiak le Guerrier"|"Tétonée la Plantureuse"|"Tétonuki"|"Tikoko"|"Tikosto le Mousse"|"Tilolo la Bien Moulée"|"Tiwa'Missou le Gateux"|"Tiwabbit"|"Tiwabbit Kiafin"|"Tiwalpé le Dévêtu"|"Tiwoflan le Lâche"|"Tofu"|"Tofu Malade"|"Tofu Maléfique"|"Tofu Royal"|"Tofuldebeu l'Explosif"|"Tofumanchou l'Empereur"|"Tofurapin le Pétri"|"Tortenssia la Fleurie"|"Torthur la Lutte"|"Tortilleur le Coulé"|"Tortorak le Cornu"|"Tortue Bleue"|"Tortue Jaune"|"Tortue Rouge"|"Tortue Verte"|"Touchparak"|"Toufou le Benêt"|"Tour le Vice"|"Tourbassingue"|"Tourbiket le Virevoletant"|"Tournesol Affamé"|"Tournesol Sauvage"|"Toutouf le Velu"|"Tromperelle"|"Tromplamor le Survivant"|"Tronknyde"|"Tronkoneuz la Tranchante"|"Tronquette la Réduite"|"Trooll"|"Troollaraj"|"Trooyé l'Oxydé"|"Trukikol"|"Trukul le Lent"|"Tsucékoi la Colporteuse"|"Tsukinochi"|"Tsumani l'Inondeur"|"Tsume-bozu"|"Tynril Ahuri"|"Tynril Consterné"|"Tynril Déconcerté"|"Tynril Perfide"|"Vampire"|"Vampunor le Glacial"|"Vétauran"|"Vétaurine l'Énergisé"|"Wa Wabbit"|"Wabbit"|"Wabbit Gm"|"Wabbit Squelette"|"Wabbitud le Constant"|"Wagnagnah le Sanglant"|"Wara l'Amer"|"Warko Marron"|"Warko Violet"|"Warkolad l'Etreinte"|"Watdogue le Bien Nommé"|"Wo Wabbit"|"Wokènrôl le Danseur"|"Yokai Firefoux"|"YokaiKoral le Duel"|"Yukisamara"} MonsterNameFr */ /** TODO EXACT TYPE */
  /** @typedef {"Aboub"|"Abounteous the Generous"|"Treeknidylus"|"Treekonk the Stunned"|"Treektamak the Loud"|"Treekness the Dark"|"Treekalack the Sad"|"Light Treeckler"|"Dark Treeckler"|"Treechnee"|"Dark Treechnee"|"Treechnid"|"Ancestral Treechnid"|"Dark Treechnid"|"Venerable Treechnid"|"Treekniddioo the Needy"|"Treekstalbal the Psychic"|"Aeroktor the Warrior"|"Aerogoburius the Malicious"|"Akakaka the Dirty"|"Akakwa"|"Aftathabeep the Answerphone"|"Alyeena"|"Amlullabeye the Dreamer"|"Amlub"|"Aquabralak the Warrior"|"Aqualikros the Merciless"|"Arachma the Greek"|"Arachnangel the Hopeful"|"Arakazam the Psychic"|"Arachmutated"|"Araknawa"|"Arachnekros the Aggressive"|"Arachnee"|"Aggressive Arachnee"|"Sewer Arachnee"|"Major Arachnee"|"Sick Arachnee"|"Arachnawar the Killinmachin"|"Arakula the Carpature"|"Daddy Longlex"|"Arachiro the Calligrapher"|"Bakazicle the Icicle"|"Bakazako"|"Bambono the Holy"|"Bambottinit the Quiet"|"Bambooto"|"Holy Bambooto"|"Bandirty the Messy"|"Rogue Clan Bandit"|"One-Armed Bandit"|"Bandinamit the Explosive"|"Barbrossa"|"Blorko the Colourful"|"Barbrosskam the Chief"|"Bakaka the Intellectual"|"Lousy Pig Shepherd"|"Baka"|"Biblokajin the Bald"|"Coco Biblop"|"Morello Cherry Biblop"|"Indigo Biblop"|"Pippin Biblop"|"Bigbadabooum the Elementary"|"Biblopopo the Organiser"|"Billbiblop the Great"|"Bibloponey the Entertainer"|"Air Pikoko"|"Plain Pikoko"|"Dark Pikoko"|"Pikhoven the Deaf"|"Weirbwork"|"Black Tiwabbit"|"Black Wabbit"|"Blopal the Precious"|"Coco Blop"|"Royal Coco Blop"|"Morello Cherry Blop"|"Royal Morello Cherry Blop"|"Indigo Blop"|"Royal Indigo Blop"|"Royal Rainbow Blop"|"Pippin Blop"|"Royal Pippin Blop"|"Blopium the Delirious"|"Blorchid the Gorgeous"|"Blopulent the Pretentious"|"Ishigood Pak the Mover"|"Mushd"|"Boomba"|"Boombora the Dangerous"|"Mushdrill the Piercer"|"Gobbach the Contrapuntaler"|"Bakeraider the Tomb"|"Gobballad the Romantic"|"Gobbalky the Stubborn"|"White Gobbly"|"Black Gobbly"|"Gobball"|"Royal Gobball"|"Dark Baker"|"Gobballyhoo the Noisy"|"Mopidyk the Mire"|"Boombardier"|"Miremop"|"Beaztinga"|"Blunder the Clumsy"|"Buzzby the Social"|"Poacher"|"Pocher the Kingponger"|"Floratio the Investigator"|"Rotaflor"|"Bulbamboo"|"Bulbiflor"|"Bulbig"|"Bulbush"|"Bulbisonic the Penetrating"|"Bulbigroov the Dancer"|"Bulbamoon the Trumpeter"|"Bulbushisu the Makisan"|"Bwork"|"Bwork Archer"|"Bwork Magus"|"Bworak the Bohemian"|"Bworker"|"Bworkette"|"Bworkoder the Mazter"|"Ganon the Dwarf"|"Cannon Dorf"|"Lousy Pig Knight"|"Pygknightlion the Lousy"|"Chafaldrag the Charming"|"Chaferanho the Essential"|"Chafer"|"Chafer Archer"|"Elite Chafer"|"Draugur Chafer"|"Chafer Foot Soldier"|"Invisible Chafer"|"Chafer Lancer"|"Chafred the Fish"|"Chaferotix the Sixtininth"|"Chaferuption the Volcanic"|"Chafermented the Drinker"|"Grossewer Shaman"|"Matmushmush the Flasher"|"Spimushuaia the Traveller"|"Speedmush the Racer"|"Nidsally the Mushtang"|"Shamassel the Off"|"Edvushmunch the Screamer"|"Mush Rhume"|"Mush Mush"|"Blue Spimush"|"Brown Spimush"|"Red Spimush"|"Green Spimush"|"Mushnid"|"Spimushtache the Hairy"|"Spimushty the Smelly"|"Mush Tup"|"Mush Mish"|"Mushketeer the Loyal"|"Mushmunch"|"Mushuliet the Catapulet"|"Romush the Montecchi"|"Crocodyl Chief"|"Gobball War Chief"|"Soft Oak"|"Karne Rider"|"Koalak Rider"|"Karnyona the Rider"|"Warazpacho the Cherrilla"|"Warguerite"|"Pigoblet the Useful"|"Cauldini"|"Jackellington the Lantewn"|"Pumpkwin"|"Farle's Pig"|"Piglet"|"Codem"|"Codemonic the Mean"|"Grass Snake"|"Grasnakizanami the Ruler"|"Explosive Shell"|"Coralator"|"Great Coralator"|"Crobak"|"Kojaklator the Lollipoper"|"Crowmanion the Primitive"|"Crab"|"Spitfoux"|"Spitfouxgolly the Surprised"|"Jiminicrackler the Conscious"|"Cracklerod the Old"|"Crackrock"|"Polished Crackrock"|"Crickcrack the Crossfit"|"Crackler"|"Plain Crackler"|"Legendary Crackler"|"Polished Crackler"|"Cracklerge"|"Crackrodilrock the Helltune"|"Crackrockisree the Tiger"|"Krabaoly the Patient"|"Crackedral the Majestic"|"Whitish Fang"|"Furious Whitish Fang"|"Crocabulia"|"Crocodyl"|"Lupisnockio the Woodwolf"|"Lupisnockio the Woodwolf"|"Crokdylann the Rebel"|"Croccyx the Bummer"|"Snowhitisha the Pure"|"Crovus"|"Crabaramis the One"|"Crabathos the For"|"Craborthos the All"|"Kurasso Craboral"|"Mahlibuh Craboral"|"Mojeeto Craboral"|"Passaoh Craboral"|"Crabartanian the Allforone"|"Damadrya"|"Venomica"|"Gargamarak the Kidnapper"|"Dark Vlad"|"Deminoball"|"Zoth Disciple"|"Ezothbeitor the Neighbour"|"Dok Alako"|"Dokterwho the Tardisporter"|"Dorgan Ation"|"Blodz Uker"|"Don Quizothe the Stubborn"|"Dragnnoyed"|"Dragostino the Tiny"|"Dregguantico the Trainer"|"Dragossiper the Nag"|"Dragoskovit the Barefoot"|"Dragoskovit the Barefoot"|"Dreggump the Shrimp"|"Dreggump the Magnificent"|"Dragotitis the Painful"|"Dreggooniz the Adventurous"|"Dragorse the Wild"|"Dreggatón the Latino"|"Dragnarok"|"Dreggommomm the Chewer"|"Drakokidoki the Volunteer"|"Dragory the Violent"|"Wild Almond Dragoturkey"|"Wild Golden Dragoturkey"|"Wild Ginger Dragoturkey"|"Dreggoog the Downunder"|"Slate Dreggon"|"Clay Dreggon"|"White Dreggon"|"Alert White Dreggon"|"Immature White Dreggon"|"Limestone Dreggon"|"Coal Dreggon"|"Sapphire Dreggon"|"Alert Sapphire Dreggon"|"Immature Sapphire Dreggon"|"Golden Dreggon"|"Alert Golden Dreggon"|"Immature Golden Dreggon"|"Dreggon Warrior"|"Black Dreggon"|"Alert Black Dreggon"|"Immature Black Dreggon"|"Flying Dreggon"|"Dragon Pig"|"Dragangora the Softy"|"Dreggooliz the Macho"|"Slate Dragoss"|"Clay Dragoss"|"White Dragoss"|"Alert White Dragoss"|"Limestone Dragoss"|"Charcoal Dragoss"|"Sapphire Dragoss"|"Alert Sapphire Dragoss"|"Golden Dragoss"|"Alert Golden Dragoss"|"Black Dragoss"|"Alert Black Dragoss"|"Dragoolash the Stewed"|"Dragamemnon the Deadtroyer"|"Dreggonzola the Cheesy"|"Drakween the Cross Dresser"|"Draigovsky the SocalledSwan"|"Dreggrieg the Pianist"|"Dragaustin the Power"|"Dreggershween the Tinpanalley"|"Dragandrop"|"Dragostess"|"Dragospel the Black"|"Drakoalak"|"Drakoamax the Mad"|"Draghouse the Cynical"|"Barkricrac the Unsteady"|"Starfish Trooper"|"Stary the Strooper"|"Tanuktonik the Doofdoof"|"Polterghaisk the Stray Soul"|"Tanukhuina the Drawer"|"Pandumonium the Joker"|"Fangshu"|"Fangshui the Misspelled"|"TanuKiki the Deliveryghost"|"Satonuki the Plastikpaddy"|"Tanaked the Stalker"|"Tanno the Dominator"|"Aperobics the Dynamic"|"Miomaho the Siciliano"|"Pandoracle the Opposing Force"|"Tanukhiraru the Gifted"|"Leorio the Haunted"|"Pandipoopik the Wondrous"|"Yoksai the Spirited"|"Arepotair the Bespectacled"|"Apero Ghost"|"Burning Ghost"|"Arepo Ghost"|"Plated Ghost"|"Brave Ghost"|"Ghost Ominjry"|"Ghost Hicidal"|"Leopardo Ghost"|"Maho Firefoux Ghost"|"Pandikaze Ghost"|"Pandora Ghost"|"Pandulum Ghost"|"Soryo Firefoux Ghost"|"Tanukouï San Ghost"|"Yokai Firefoux Ghost"|"Ghostabrava the Tourist"|"Ghostabrava the Tourist"|"Pighatchoo the Electrical"|"Reapalak"|"Ryukualak the Bored"|"Barkritter"|"Felygiene"|"Felicity the Gormandiser"|"Air Spark"|"Water Spark"|"Fire Spark"|"Earth Spark"|"Floramodovar the Stoned"|"Floramor"|"Floristil the Pistil"|"Flowistil"|"Smitherz the Licker"|"Dark Smith"|"Koalarchitect the Balancing Force"|"Koalak Gravedigger"|"Foxfyter"|"Fouflay the Fallen"|"Fouxnamballist"|"Founoroshi"|"Ambushapens the Unlucky"|"Ambusher"|"Zoth Girl"|"Minokid"|"Sewer Keeper"|"Gargantua the Devourer"|"Gargantula"|"Gargoyl"|"Gargoyla the Paranoiac"|"Calipzoth the Icy"|"Jellvis the King"|"Jellyposukshion the Slim"|"Blue Jelly"|"Blueberry Jelly"|"Strawberry Jelly"|"Mint Jelly"|"Royal Blue Jelly"|"Royal Blueberry Jelly"|"Royal Lemon Jelly"|"Royal Strawberry Jelly"|"Royal Mint Jelly"|"Jelleno the Chinny"|"Minoknok the Visitor"|"Gink"|"Ginsync the Hyperactive"|"Greetdoff the Gentleman"|"Greedovore"|"Gob-Trotter"|"Goblin"|"Gobnoramus"|"Goblimp the Bis Kit"|"Gourlo the Terrible"|"Gwandpa Wabbit"|"Gwabbit the Wunner"|"Ninnyfrog the Nice"|"Nenufrog"|"Bignstrong the Quartermaster"|"Koalak Warrior"|"Zoth Warrior"|"Chukoalak the Norris"|"Zigzoth the Indecisive"|"Hanshi"|"Cross Strich"|"Hell Mina"|"Ignilicrobur the Warrior"|"Ignirkocropos the Famished"|"Ino-Naru"|"Ino-Nope the Negative"|"Ishibig Pak"|"Jiangshi-Nobi"|"Jianamble the Rambler"|"Kaeneko"|"Kaenekfire the Voluble"|"Kaniedoss the Giggling"|"Kanabeer the Shaken"|"Kanazure"|"Kaniger"|"Kannemik the Skinny"|"Kannimantha the Maneater"|"Kanniball Archer"|"Kanniballbo"|"Kanniball Thierry"|"Kanniball Jav"|"Kanniball Sarbak"|"Kanniball Thierry"|"Kannarrie the Reckless"|"Kaonashi"|"Kaonuclear the Unstable"|"Kanniranda the Maniac"|"Snailmetalika the Garagician"|"Snailmet"|"Kido"|"Kidodo the Extinct"|"Kilibriss"|"Killua the Assassin"|"Kimbo"|"Kirevam"|"Kirevampiro the Wrestler"|"Kitsou Nae"|"Kitsou Nakw"|"Kitsou Nere"|"Kitsou Nufeu"|"Kitchy the Scratcher"|"Kitsuey the Red"|"Kitsewey the Blue"|"Kitsouie the Green"|"Koaly the Fiddler"|"Koalsen the Similar"|"Coco Koalak"|"Wild Koalak"|"Koalak Forester"|"Morello Cherry Koalak"|"Immature Koalak"|"Indigo Koalak"|"Pippin Koalak"|"Bloody Koalak"|"Koaldmen the Grumpy"|"Koaldman the Garish"|"Jackoalak the Ripper"|"Koelloggs the Creator"|"Snapoalak the Redhead"|"Crackoalak the Blonde"|"Popoalak the Mousibrown"|"Komko the Vexatious"|"Kokoko"|"Kwakumber"|"Misskokoko the Channel"|"Kolerat"|"Koleraspootin the Anesthesialogist"|"Koolich"|"Burnabwork"|"Khamelerost"|"Khameleltux the Tolerant"|"Sauruman the Destructive"|"Saurlax the Sleepy"|"Prontosaur the Punctual"|"Sauroful the Regretting"|"Saurbic the Acidic"|"Blubasaur the Weepy"|"Segasaur the Megadriven"|"Ikthyosaur the Fishy"|"Saurcery the Magical"|"Muddy Juvenile Sauroshell"|"Moist Juvenile Sauroshell"|"Incandescent Juvenile Sauroshell"|"Insipid Juvenile Sauroshell"|"Dry Juvenile Sauroshell"|"Muddy Mature Sauroshell"|"Moist Mature Sauroshell"|"Incandescent Mature Sauroshell"|"Insipid Mature Sauroshell"|"Dry Mature Sauroshell"|"Muddy Novice Sauroshell"|"Moist Novice Sauroshell"|"Incandescent Novice Sauroshell"|"Insipid Novice Sauroshell"|"Dry Novice Sauroshell"|"Muddy Venerable Sauroshell"|"Moist Venerable Sauroshell"|"Incandescent Venerable Sauroshell"|"Insipid Venerable Sauroshell"|"Dry Venerable Sauroshell"|"Saurgei the Rushing"|"Dynasaur the Scaly"|"Saurbet the Refreshing"|"Eyesaur the Repulsive"|"Bedsaur the Blotchy"|"Sauriasis the Flaky"|"Tyranno the Despotic"|"Saurdid the Scandalous"|"Absaurbo the Spongy"|"Scisaur the Pointed"|"Censaur the Forbidding"|"Kurookin"|"Fire Kwak"|"Ice Kwak"|"Earth Kwak"|"Wind Kwak"|"Kwakamole the Appetising"|"Kwaked the Pirated"|"Kwadbury the Chocolaty"|"Kwakwatic the Soaked"|"Kwoan"|"Kwoanium the Smart"|"Ouassingal"|"Larvadelaide the Ozie"|"Grubby the Tubby"|"Larvalencia the Orange"|"Blue Larva"|"Plains Larva"|"Yellow Larva"|"Orange Larva"|"Green Larva"|"Larvamatic the Pragmatic"|"Larvalaska the Cold"|"Ze Flib"|"Ouassingue"|"Boggedown Ouassingue"|"Leopardo"|"Leopardon the Sorry"|"Let Emoliug"|"Lert Macraken the Used Emo"|"Lichangora the Immaculate"|"Lichangoro"|"Tatatojiki"|"Macian"|"Madgang the Doctor"|"Madura"|"Maho Firefoux"|"MoMaho the Modernist"|"Lord Lacedhat the Vampiric"|"Fungi Master"|"Blackmush Master the Swordsman"|"Lord Crow"|"Koalak Master"|"Koalakropolis the King of the Hill"|"Fung Ku the Master"|"Pandora Master"|"Vampire Master"|"Zoth Master"|"Equipped Chest"|"Quippy the Equippy Chest"|"Mama Koalak"|"Mamankalak the Bibliomaniac"|"Salamaa the Henpeck"|"Manderisha"|"Marude the Sandy"|"Mabwork"|"Megabwork"|"Moowolf"|"Moopet"|"Moops the Bubbleboy"|"Miliboowolf"|"Milivanilli the Mime"|"Miliopold the Bloomer"|"Sick Grossewer Milirat"|"Strubian Milirat"|"Dark Miner"|"Minoskito"|"Milikkybum the Informer"|"Minotoror"|"Minotot"|"Minoskittle the Coloured"|"Sponge Mob"|"Koalak Mummy"|"Jackoalak the Moonwalker"|"Mumminotor"|"Moon"|"Moskoitus the Interruptor"|"Moskito"|"Mumussel"|"Mastostroke the Strokable"|"Mufafah"|"Mufavabeenz the Cannibal"|"Boowolf"|"Booty the Beast"|"Hazwonarm"|"Hazwonball the Hickler"|"Nanashi the Virtuoso"|"Nebgib"|"Nebuchadnezzar the Conqueror"|"Gwass"|"Supergwass the Free"|"Eyemi the Narcissist"|"Nipul"|"Niptuk the Plasticynic"|"Kokonut"|"Kokonan the Talker"|"Neye"|"Onabu-Geisha"|"Onabinge the Gulletfull"|"Oni"|"Oni'orses the Foolish"|"Onirakam"|"Onisterical the Unleashed"|"Orfan"|"Orfaniel the Charmer"|"Osurc"|"Osurcus the Tamer"|"Ouassingiam the Tyrant"|"Ouassup the Irritating"|"Ougineemo the Lost"|"Ougaa"|"Ougathard the Fortunate"|"Ougathard the Fortunate"|"Ouginak"|"Palmella the Hefty"|"Palmoleaf the Greasy"|"Naypalm the Herbivorous"|"Kurasso Palmflower"|"Mahlibuh Palmflower"|"Mojeeto Palmflower"|"Passaoh Palmflower"|"Palmpilot the Yuppie"|"Drunk Pandalette"|"Pandarwin the Naturist"|"Drunken Pandawa"|"Pandikaze"|"Pandartmoore the Dogged"|"Pandaltry the Unknown"|"Pandit"|"Pandahl the Rolled"|"Pandora"|"Pandan the Desperate"|"Pandulum"|"Pandali the Surreal"|"Heera Bighero"|"Bigheera"|"Paranotackle the Emasculated"|"Parashutackle"|"Fisheralak"|"Fisheralf the Stewart"|"Peki Peki"|"Bumbartifoux the Farty"|"Bangartifoux"|"Snappy the Fishfrier"|"Snappu the Shopkeep"|"Snapple the Wise"|"White Snapper"|"Blue Snapper"|"Kloon Snapper"|"Brown Snapper"|"Green Snapper"|"Snappster the Sued"|"Snapp the Dragon"|"Blue Piwi"|"Yellow Piwi"|"Pink Piwi"|"Red Piwi"|"Green Piwi"|"Purple Piwi"|"Piwi the Ermine"|"Piwiliam the Brave"|"Piwicker the Manly"|"Piwilde the Bossie"|"Piwinston the Churlish"|"Piwiki the Witty"|"Piralhaka the Intimidator"|"Piralak"|"Dandel the Boy"|"Evil Dandelion"|"Cheeken"|"Cheech the Pussycat"|"Pigstol the Sexy"|"Baconolia the Salty"|"Pignolia"|"Prestreet the Fighter"|"Prespic"|"Ratatouille the Stirrer"|"Raccooper"|"Grossewer Raeman"|"Ralftime the Dilettante"|"White Rat"|"Grossewer Rat"|"Sick Grossewer Rat"|"Hyoactive Rat"|"Black Rat"|"Chef Ratatouille"|"Ratilla the Hun"|"Rattle the Hummer"|"Raul Mops"|"Raul Modrid the Chulo"|"Rac Queen"|"Rib"|"Rib the Torn"|"Robiolego the Assembled"|"Robionicle"|"Robocoop the Switched"|"Robo Mace"|"Mopy King"|"Rookin the Caped Kinster"|"Demonic Rose"|"Dark Rose"|"Zorrose the Messican"|"Gingerocket"|"Roy the Rover"|"Roseanne the Yanker"|"Sakkado the Carrier"|"Jumparak"|"Summersalt the Gymnast"|"Boarealis the Bright"|"Boar"|"Plain Boar"|"Boarnigen the Damasker"|"Blokapwane"|"Snarkapwane the Snarky"|"Scaratheef the Pincher"|"Golden Scarabugly"|"White Scaraleaf"|"Blue Scaraleaf"|"Red Scaraleaf"|"Green Scaraleaf"|"Scaramel the Melty"|"Scaratos"|"Scaraheath the Hanger"|"Scarahazad the Storyteller"|"Scarabreef the Short"|"Strubian Sickrat"|"Scurvion"|"Scorbison the Lonely"|"Zoth Sergeant"|"Zouzoth the Cuddly"|"Plissken"|"Quetsnakiatl"|"Serpico the Honest"|"Quetnin the Fictional"|"Shin Larva"|"Silf the Greater Bherb"|"Skeunk"|"Soryo Firefoux"|"Sorgyo Quiretox the Chatterbox"|"Grey Mouse"|"Green Mouse"|"Cheesy the Immortalised"|"Famouse the Little-Known"|"Grey Moumouse"|"Famoumouse the Little-Known"|"Sparo"|"Sparodi the Python"|"Sphincter Cell"|"Suzessman the Enthusiastic"|"Susej"|"Drumurosh the Nosher"|"Drumurai"|"Tanukouï San"|"Terraburkahl the Perfidious"|"Terrakubiack the Warrior"|"Titinaynay the Swayer"|"Titinuki"|"Tikokoko"|"Eskoko the Baron"|"Tatatojiki the Squeaky"|"Tiwana the Tokin'"|"Tiwabbit"|"Tiwabbit Wosungwee"|"Tiwaldo the Hidden"|"Tiwascal the Wapper"|"Tofu"|"Sick Tofu"|"Evil Tofu"|"Royal Tofu"|"Tofudd the Hunter"|"Tofulsom the Jailer"|"Tofull the Optimist"|"Turtan'ernie the Streetwise"|"Turture the Hooded"|"Turtrenalds the Tragic"|"Turticorn the Horned"|"Blue Turtle"|"Yellow Turtle"|"Red Turtle"|"Green Turtle"|"Touchparak"|"Prikoko the Witless"|"Hunflower the Sinful"|"Mopeat"|"Mopfeet the Circular"|"Famished Sunflower"|"Wild Sunflower"|"Follikoko the Tufted"|"Trumperelle"|"Trumpaynor the Survivor"|"Trunknid"|"Trunkbeard the Gentle"|"Ginger the Clincher"|"Trool"|"Troolaraj"|"Trooligan the Bulldogg"|"Glukoko"|"Glukoko the Slow"|"Saywhatinochi the Gossipy"|"Tsukinochi"|"Tsumani the Flooder"|"Tsume-Bozu"|"Stunned Tynril"|"Dismayed Tynril"|"Disconcerted Tynril"|"Perfidious Tynril"|"Vampire"|"Vamp the Impalest"|"Vetauran"|"Vetaurine the Energised"|"Wa Wabbit"|"Wabbit"|"GM Wabbit"|"Skeleton Wabbit"|"McWhabbit the Diehard"|"Wabbin the Wich"|"Worka the Willful"|"Brown Warko"|"Purple Warko"|"Warko the Inky"|"Wabbitor the Apt"|"Wo Wabbit"|"Wowalker the Egyptian"|"Yokai Firefoux"|"Yokai the Choral"|"Yukisamara"} MonsterNameEn */
  /** @typedef {"Abub"|"Abubanero el Naranja"|"Abrákneo el Elegido"|"Abrakeponerse el Optimista"|"Abrakadabra el Pata de Kabra"|"Abrajinieves el Enanito"|"Ábrakin el Oscuro"|"Abrajidor claro"|"Abrajidor oscuro"|"Abrakno"|"Abrakno oscuro"|"Abráknido"|"Abráknido Ancestral"|"Abráknido oscuro"|"Abráknido venerable"|"Abrakíledo el Patas Ligeras"|"Abroesidor el Navegante"|"Aerohuctor, el Guerrero"|"Aerotrugobur, el Malvado"|"Kakai el Ensuciado"|"Kuakai"|"Alhienado el Enajenado"|"Alhiena"|"Amlobdovar el Movidista"|"Amlub"|"Aquabralak, el Guerrero"|"Aqualikros, el Despiadado"|"Araklas Mausus el Encofiado"|"Arkandinska la Lírica"|"Arakazam la Psíquica"|"Arakmutada"|"Araknawa"|"Araknekros el Salvaje"|"Arakna"|"Arakna Agresiva"|"Arakna de alcantarilla"|"Arakna mayor"|"Arakna enferma"|"Araknosia el Olvidadizo"|"Arakniry la Destripada"|"Arápex"|"Arafernalia la Calígrafa"|"Bakazhielo el Congelado"|"Bakazako"|"Bambono el Divino"|"Bambudín el Azteca"|"Bambuto"|"Bambuto Sagrado"|"Banrí Mantís el Pigmentado"|"Bandido del clan de los tymadores"|"Bandido manco"|"Bandiras el zorro del clan Los Malagueños"|"Barbrusa"|"Barchwork el Multicolor"|"Barbrétzel el Salado"|"Kuapánfilo el Intelectual"|"Pastor puerkazo"|"Kuapatán"|"Biblidiana la Controvertida"|"Biblop coco"|"Biblop guinda"|"Biblop índigo"|"Biblop reineta"|"Grambadabum el Elemental"|"Bibolsón el Anilloso"|"Biblues el Ritmo"|"Biblópera el Fantasma"|"Tufo aéreo"|"Tufo de las llanuras"|"Tufo oscuro"|"Tofofo el Blandito"|"Eztrambwork"|"Black pekewabbit"|"Black wabbit"|"Bloppy Reinarker la Primera Mitad"|"Blop coco"|"Blop Coco Real"|"Blop guinda"|"Blop Guinda Real"|"Blop índigo"|"Blop Índigo Real"|"Blop Multicolor Real"|"Blop reineta"|"Blop Reineta Real"|"Blop Inocho el Narizotas"|"Blop Dylan el Ventoso"|"Blómperman el Explosivo"|"Paketeru el Impresionante"|"Boo"|"Boomba"|"Doomba el Inimitable"|"Bo'Callaghan el Trebol"|"Jalatintin el Reportero"|"Paelladero Oscuro el Arrozoso"|"Jaleté el Extraterrestre"|"Jalatillo el Infantil"|"Jalatín blanco"|"Jalatín negro"|"Jalató"|"Jalató Real"|"Panadero oscuro"|"Jalatintanic el Hundido"|"Lodontólogo el Sonriente"|"Bumbardero"|"Lodostropajo"|"Zumbobo"|"Patón el Metido"|"Zumburdieu el Social"|"Cazador de contrabando"|"Cazafrán el Colorante"|"Esquenosé el Indeciso"|"Esquejika"|"Bulbambú"|"Bulbiflor"|"Bulbig"|"Bulbomatorral"|"Bulbiftericia la Amarillenta"|"Bulbii la Creadora"|"Buldamort el Serpiente"|"Bulbubunet la Única"|"Bwork"|"Bwork arquero"|"Bwork mago"|"Bwarkgner el Magnificentista"|"Bworker"|"Bworka"|"Bwhork Mageneration el Precursor"|"Cañón Dorzuelo el Doloroso"|"Cañón dorf"|"Caballero puerkazo"|"Caballagami Pueryukazo el Aburrido"|"Chafo el del Ocho"|"Cháferlie el Ángeles"|"Chafer"|"Chafer arquero"|"Chafer de élite"|"Chafer draugr"|"Chafer infante"|"Chafer invisible"|"Chafer lancero"|"Chafíner Divarrio el Casposo"|"Chaferditos los Tres"|"Chafernan D'alonzo el Nano"|"Chagüer Langers los Coloridos"|"Chamán de Alcantarilla"|"Champi Casso el Cúbico"|"Champán el Espumoso"|"Champlin el Cómico"|"Champacné el Granitos"|"Chamadkasas, las Desesperadas"|"Champli el Sonoro"|"Seta peleona"|"Champi champ"|"Champo azul"|"Champo marrón"|"Champo rojo"|"Champo verde"|"Champáknido"|"Champolís el Astronauta"|"Champlomo el Soldadito"|"Champbis"|"Setador"|"Setal Slugdor el Exterminador"|"Champidonte"|"Setsa'n Desiti la Amistosa"|"Chalbis el King"|"Jefe cocodrail"|"Jefe de guerra jalató"|"Roble Blando"|"Cabalgador de Karne"|"Koalak cabalgador"|"Cabalista el Conspirador"|"Merkxguerrita el Ogro"|"Marguerrita"|"Cochumájer el Rápido"|"Judini"|"Calawino el Oriental"|"Calawaza"|"Cerdo de Farle"|"Cochinillo"|"Codem"|"Codembolia el Obstructor"|"Coolebra"|"Cooligan el Agresivo"|"Cáscara Explosiva"|"Coralador"|"Coralador Magistral"|"Cuerbok"|"Cortazador el Inconformista"|"Cuergotismo el Febril"|"Cangrejo"|"Escupefux"|"Escupefistro el Torpedo"|"Crujaitor el Eurovisivo"|"Crujidilo Dundee el Australiano"|"Crujibola"|"Crujibola pulío"|"Cracrac el Resistente"|"Crujidor"|"Crujidor de las llanuras"|"Crujidor Legendario"|"Crujidor pulío"|"Crujidolmen"|"Crujlieta la Veronesa"|"Crojmeo el Veronés"|"Cangri-doo la Hadada"|"Crujíbaro el Tzantza"|"Colmillo blando"|"Colmillo blando rabioso"|"Cocabulia"|"Cocodrail"|"Colmillazaqui, el Inagotable"|"Colmillazaqui, el Inagotable"|"Jefe Cocolumbo el Detective"|"Cocodranel la perfumada"|"Colmillamoto el Omnipotente"|"Crowrajo"|"Crustérix el Viajante"|"Crusthórpal Passian el Submarino"|"Crustodralí el Bigotudo"|"Crustoral kuraçao"|"Crustoral malibut"|"Crustoral mohito"|"Crustoral passaoh"|"Crustoriyama el Boludo"|"Kodámade"|"Arapúas"|"Dárdamel la Secuestradora"|"Dark Vlad"|"Deminobola"|"Discípulo zoth"|"Diszápulo Delzoih el Profeta"|"Dok alako"|"DoK Ok el Gasterópodo"|"Don dórgano"|"Don dessangre"|"Don Kizoth el Obstinado"|"Draguirritado"|"Dragosstinho, el Futboleiro"|"Drakójak el Piruletas"|"Ledrag el Ognat"|"Dragrogui, el Ebrio"|"Dragrogui el Ebrio"|"Dragkuín el Disfrazado"|"Dragkuín el Magnífico"|"Dragozart Almandreus el Prodigio"|"Dragma, el Griego"|"Dragoss&Dungeoss el Original"|"Dragmocles el Fatalista"|"Dragnarok"|"Drajoanito el Rojo"|"Dragamenón el Destructroyer"|"Dreghouse el Cínico"|"Dragopavo almendrado salvaje"|"Dragopavo dorado salvaje"|"Dragopavo pelirrojo salvaje"|"Drajorgito, el Verde"|"Dragohuevo pizarroso"|"Dragohuevo arcilloso"|"Dragohuevo Blanco"|"Dragohuevo Blanco Despierto"|"Dragohuevo Blanco Inmaduro"|"Dragohuevo calizo"|"Dragohuevo carbonoso"|"Dragohuevo Zafiro"|"Dragohuevo zafiro despierto"|"Dragohuevo Zafiro Inmaduro"|"Dragohuevo Dorado"|"Dragohuevo dorado despierto"|"Dragohuevo Dorado Inmaduro"|"Dragohuevo guerrero"|"Dragohuevo Negro"|"Dragohuevo negro despierto"|"Dragohuevo Negro Inmaduro"|"Dragohuevo volador"|"Dragocerdo"|"Mafaldragosa la Hermana Pequeña"|"Drageagainst, el Máquina"|"Dragoss pizarroso"|"Dragoss arcilloso"|"Dragoss Blanco"|"Dragoss blanco despierto"|"Dragoss calizo"|"Dragoss carbonoso"|"Dragoss Zafiro"|"Dragoss zafiro despierto"|"Dragoss Dorado"|"Dragoss dorado despierto"|"Dragoss Negro"|"Dragoss negro despierto"|"Drajoimito, el Azul"|"Dreggeatón el Latino"|"Drugmiente, la Bella"|"Dragstor, el de la Esquina"|"Dragoss To el Caluroso"|"Draltóniko, el Ojo de Águila"|"Dragump, el Oscarizado"|"Drakaoly, la Violinista"|"Dragandrop"|"Dragosa"|"Dragoss Pel, el Negro"|"Drakoalak"|"Drakolakao el Sabroso"|"Dragore el Sangriento"|"Dientetris el Inolvidable"|"Estrella del mar Rano"|"Estroilette la Atascada"|"Fantasmaik Táisunkui San el Pegador"|"Fanthraks el Acomplejado"|"Fanturo Pandez-Revértulo el Espadachín"|"Fantasmeluze la Gentil"|"Fangshu"|"Fangshui la Parónima"|"Fant-eagux el Germano"|"Fantasmonroe el Deseo"|"Fantasmator Soryonara el Baby"|"Fredtásmer Tanukuín el Chanpion"|"Fantasmarley el Rastafari"|"Fantasmarty Mac Flyrefux el Futurista"|"Fantasmily-Celly la Madre"|"Fantasmanson el Familiar"|"Fantaradona el Mágico"|"Fantarmantino el Visceral"|"Fantazmania el Diablo"|"Fantasma Arepopins la Niñera"|"Fantasma de aperitubo"|"Fantasma ardiente"|"Fantasma Arepo"|"Fantasma corazado"|"Fantasma valiente"|"Fantasma nimado"|"Fantasma sesino"|"Fantasma Leopardo"|"Fantasma Maho Firefux"|"Fantasma Pandikaze"|"Fantasma Pandora"|"Fantasma Pandulo"|"Fantasma Soryo Firefux"|"Fantasma Tanukui San"|"Fantasma Yokai Firefux"|"Fantastle Vániante la Matavampiros"|"Volver a la lista"|"Cerduodenitis el Abdominal"|"Siegalak"|"Siegálaher los Chulos"|"Diente pe-león"|"Highiena"|"Highia la Golosa"|"Llamita aire"|"Llamita agua"|"Llamita fuego"|"Llamita tierra"|"Florivera el Muralista"|"Floribundo"|"Florista la Caníbal"|"Floristilo"|"Herranor el Pizzaiolo"|"Herrero oscuro"|"Sepaulturero Kleealak el Arquitecto"|"Koalak sepulturero"|"Fuxfaigter"|"Fuflé el Definflado"|"Funámbola"|"Funoroshi"|"Mazomorra el Rolista"|"Mazorral"|"Chavala zoth"|"Minovillo"|"Guardiana de alcantarilla"|"Gargantúa la Devoradora"|"Gargántula"|"Gárgrola"|"Pulgargrolito el Astuto"|"Chavala Zotaina la Castigadora"|"Gelatiris el Arenero"|"Gelatina Turner la Best"|"Gelatina Azul"|"Gelatina de Aciano"|"Gelatina de fresa"|"Gelatina de menta"|"Gelatina Real Azul"|"Gelatina Real de Aciano"|"Gelatina Real de Limón"|"Gelatina Real de Fresa"|"Gelatina Real de Menta"|"Gelazquina el Men"|"Minocontavan Konm'astuzia el Colorado"|"Gink"|"Gínsenk el Estimulante"|"Zampatávoro el Miliano"|"Zampávoro"|"Gobletrotter"|"Goblin"|"Gobobo"|"Goyablín el Afrancesado"|"Gurlo el Terrible"|"Awelito wabbit"|"Abustin Pawits el Bocasucia"|"Raninia la Buena"|"Ranúfar"|"Granfortote el Contramaestre"|"Guerrero koalak"|"Guerrero zoth"|"Guerred-Fish el Cortés"|"Guerreynor Zothia la Superviviente"|"Hanshi"|"Thor Pestruz"|"Hell Mina"|"Ignelicrobur, el Guerrero"|"Ignirkocropos, el Hambriento"|"Ino-naru"|"Kenoikenó el Negativo"|"Mazaishi"|"Jiangshi-Nobi"|"Samurrancyo el Senil"|"Kaeneko"|"Kaenekfeu el Parlanchín"|"Kánudalf el Kanoso"|"Kanubirra la Fuerte"|"Kanublú"|"Kanugro"|"Klaidíbola Cerbarrow la Otra Mitad"|"Kanníbal el Lector"|"Kaníbola Arquero"|"Kaníbola arquero"|"Kaníbola Fipi"|"Kaníbola jav"|"Kaníbola cerbat"|"Kaníbola Thierry"|"Kanibúlrich Lars el Metálico"|"Kaonashi"|"Kaonuclear el Inestable"|"Kanábolo el Rubio"|"Kasrafantásol el Parapsicólogo"|"Kasrakol"|"Kido"|"Kidoloroso del Calmante"|"Kilibris"|"Kílibrill vol.2 el Vengativo"|"Kimbo"|"Kirevam"|"Kiravel el Artesano"|"Kitsu Nae"|"Kitsu Nakwa"|"Kitsu Nere"|"Kitsu Fogoso"|"Kitsa No el Violento"|"Kitsu Positoyo el Sanador"|"Kitsiús el Estornudo"|"Kitsean Cónere el Agente Secreto"|"Koalugok el Pato"|"Koayak el Destripador"|"Koalak coco"|"Koalak salvaje"|"Koalak forestal"|"Koalak guinda"|"Koalak inmaduro"|"Koalak índigo"|"Koalak reineta"|"Koalak sanguíneo"|"Kokajín el Calvo"|"Koelloks el Cerealista"|"Koalalia el Mudo"|"Botalak Cabalgator el Ingenioso"|"Koaluik el Pato"|"Koalako el Pato"|"Koalúkyluk el Solitario"|"Kukumina la Violenta"|"Kokoko"|"Kukumi"|"Kokotel el Agitado"|"Kólerat"|"Kolafuerte el Pegatodo"|"Trankitronko"|"Komanbwork"|"Krameleón"|"Kramelanoma el Ennegrecedor"|"Cascarnivoro el Voraz"|"Cascablanco el Inmaculado"|"Cascariquita el Alunarado"|"Cascaocado el Mordido"|"Casccadilla el Tramposo"|"Cascacreta el Crujiente"|"Cascacripis el Cerealista"|"Cascalva el Marino"|"Cascaduro el Sabio"|"Cascasaurio joven fangoso"|"Cascasaurio joven húmedo"|"Cascasaurio joven incandescente"|"Cascasaurio joven insípido"|"Cascasaurio joven seco"|"Cascasaurio maduro fangoso"|"Cascasaurio maduro húmedo"|"Cascasaurio maduro incandescente"|"Cascasaurio maduro insípido"|"Cascasaurio maduro seco"|"Cascasaurio novato fangoso"|"Cascasaurio novato húmedo"|"Cascasaurio novato incandescente"|"Cascasaurio novato insípido"|"Cascasaurio novato seco"|"Cascasaurio venerable fangoso"|"Cascasaurio venerable húmedo"|"Cascasaurio venerable incandescente"|"Cascasaurio venerable insípido"|"Cascasaurio venerable seco"|"Cascascivo el Libidinoso"|"Cascokris el Esbozado"|"Cascanenburg el Espumoso"|"Cascoburio el Maldito"|"Cascaolla el Exprés"|"Cascabina el Piloto"|"CasCoCrane-o el Retorcido"|"Cascadilo el Mordiente"|"Cascaseosa el Refrescante"|"Cascarnudo el Engañado"|"Cascocido el Calcinado"|"Kurookin"|"Kwak de llamas"|"Kwak de hielo"|"Kwak de tierra"|"Kwak de viento"|"Kwakamole el Apetitoso"|"Kwakeado el Pirateado"|"Kwakaolatt el Chocolateado"|"Kwakwático el Mojado"|"Kwoan"|"Kwane el Ciudadano"|"La stropajo"|"Larvémming el Descerebrado"|"Larvidriosa la Emocionada"|"Larvangoj el Desorejado"|"Larva azul"|"Larva campestre"|"Larva amarilla"|"Larva naranja"|"Larva verde"|"Larvado el Limpio"|"Larvichuela Jack la Mágica"|"Flib"|"El stropajo"|"Stropajo turbado"|"Loopardo"|"Looparpel el Dip"|"Let emoliug"|"Led Empling el Ascensorista"|"Lichangora la Inmaculada"|"Gorolichang"|"Senojiki"|"Mata"|"Majarola el Doctor"|"Majaro"|"Maho Firefux"|"Maho Firel-Tux el Paciente"|"Maéstrick Vaggerpiro el Canto Rodado"|"Maestro boletus"|"Maestro Champavor el Espadachín"|"Maestro Cuerbok"|"Maestro koalak"|"Maestro Peado la Cuenta"|"Maestrónomo, el Estrellado"|"Maestro Pandora"|"Vampiro jefe"|"Maestro zoth"|"Cofre equipado"|"Cofresno el Espinoso"|"Mamá koalak"|"Mamoon el Grande"|"Mandreinas las Nueve"|"Mandrina"|"Marude la Enarenada"|"Medibwork"|"Megabwork"|"Maxilubo"|"Mopet"|"Mospetero el Triple"|"Minilubo"|"Mililupin el Tercero"|"Milirratatúi el Gastrónomo"|"Milirata de alcantarillas enferma"|"Milirrata strubiense"|"Minero oscuro"|"Minoskito"|"Mitoskorleone el Buen Padre"|"Minotauroro"|"Minotot"|"Minerón el Incendiario"|"Mob Lasponja"|"Momia koalak"|"Momíller Frának el Umbrío"|"Mominotauro"|"Moon"|"Mashkira la Rubia de Bote"|"Moskito"|"Almejillón"|"Peluca la Suavita"|"Mufafah"|"Munchfavard el Gritador"|"Mediulubo"|"Miluigi el Fontanero"|"Notyebra"|"Nakúmbat el Mortal"|"Nanashi el Virtuoso"|"Nebgib"|"Nelgibson el Letal"|"Nierba"|"Nieruba el Poeta"|"Nujosawa el Emperador"|"Nipul"|"Nipultay Dea el Poco Inspirado"|"Nozdekoko"|"Nozdoku el Numérico"|"Nujo"|"Onabu-Geisha"|"Melokomitó la Saciada"|"Oni"|"Onicienta la de Medianoche"|"Onirakam"|"Onistérico el Desenfrenado"|"Huerfelino"|"Huerfeliz el Encantador"|"Osurc"|"Osurce Kodes el Problemático"|"El Strópala Otravez el Sam"|"El Stronyjok el Pajarillo"|"El Strat el Vampiro"|"Ugah"|"Uginukem, el Duque"|"Uginukem el Duque"|"Uginak"|"Palmiró el Tetradimensional"|"Palmila la Vigilante"|"Palmifred Passteroh el Bailarín"|"Palmiflor kuraçao"|"Palmiflor malibut"|"Palmiflor mohito"|"Palmiflor passaoh"|"Palmiscor Pions los Amantes"|"Pandita Borracha"|"Panpítar el Niño"|"Pandawa Borracho"|"Pandikaze"|"Pandiánayons el Aventurero"|"Pandarwin el Evolucionista"|"Pandido"|"Pan Dórrison el Hosco"|"Pandora"|"Pandahl Borroaldcho el Cuentacuentos"|"Pandulo"|"Pángdulo el Revienta-Bolas"|"Tigredo el Rápido"|"Tigredón"|"Akujune el Capado"|"Kojonuki"|"Pekewalak"|"Peketchup el Hamburguesero"|"Peki Peki"|"Jopetas el Mojado"|"Petafux"|"Gazpischos el Refrescante"|"Pischurrasco el Braseado"|"Pischili Conkarne el Fuerte"|"Pischis blanco"|"Pischis azul"|"Pischis payaso"|"Pischis naranja"|"Pischis verde"|"Pischto, el Tomatoso"|"Pischistorra la Cárnica"|"Pío azul"|"Pío amarillo"|"Pío rosa"|"Pío rojo"|"Pío verde"|"Pío violeta"|"Pido el Greñas"|"Spionter Vellde el Peligroso"|"Piokacho el Eléctrico"|"Capioricito Rojo el Forestal"|"Spío el Dragón"|"Pioch el Arenil"|"Piralhaka el Maorí"|"Piralak"|"Diente de Lennon el Universal"|"Diente de león diabólico"|"Pohoyo"|"Pohozí el Jorobado"|"Pastortilla el Huevo"|"Serranito el Montadito"|"Cerdo serrano"|"Prestrit el Luchador"|"Prespic"|"Ratokio de Alcontel la Despeinada"|"Rakooper"|"Ramán de alcantarilla"|"Charratos el Diletante"|"Rata Blanca"|"Rata de alcantarilla"|"Rata de Alcantarilla Enferma"|"Rata hyoactiva"|"Rata Negra"|"Ratatouille el Cocinero"|"Ratila el Huno"|"Rafa de Alnadalillas el Canibal"|"Raúl mops"|"Raúl Cera la Péptica"|"Lasoberaña"|"Rib"|"Arib Abá el de los 40"|"Robiolego el Ensamblado"|"Robionicle"|"Robocoop el Intercambiado"|"Robot mangual"|"Rey stropajo"|"Kurogordu el Imponente"|"Rosa demoníaca"|"Rosa oscura"|"Rostetricia la Reproductiva"|"Rojiva"|"Reyuna el Dibujante"|"Rochavo Democho el Chispotiado"|"Sakkado la Transportista"|"Araquesalta"|"Saltolante la Gimnasta"|"Jabulio de la Llanesias el Portero"|"Jabalí"|"Jabalí de las llanuras"|"Jabachlí el Casto"|"Kuanuto"|"Kuantista el Incomprendido"|"Escarumais los Siete"|"Escarajefe Dorado"|"Escarahoja blanco"|"Escarahoja azul"|"Escarahoja rojo"|"Escarahoja verde"|"Escaramelo el Derretido"|"Escarato"|"Escarálibur la Legendaria"|"Estarausija Azul el del Danubio"|"Escorobeitor el Malvado"|"Miserata strubiense"|"Scorbuto"|"Scorbuthoveen el Sordo"|"Sargento zoth"|"Sargende Michael el Narrador"|"Culebrón"|"Serpipluma"|"Culebretty la Fea"|"Serpistol el Afónico"|"Shin Larva"|"Silf el Rasgabola Mayor"|"Skonk"|"Soryo Firefux"|"Sairyó Hrdanfux el Volador"|"Ratón Gris"|"Ratón verde"|"Patata la Inmortalizada"|"Ratom Raider, la Curvas"|"Raratón gris"|"Raratom Raider la Curvas"|"Sparo"|"Sparito el Feo"|"Sfinter Cell"|"Sushij el Makisan"|"Susej"|"Tambulé el Gastrónomo"|"Tamburái"|"Tanukui San"|"Terraburkal, el Pérfido"|"Terrakubiack, el Guerrero"|"Mamachichu la Exuberante"|"Mamanuki"|"Pekekoko"|"Pekekokoitu el Interruptus"|"Jikitita la Moldeada"|"Black Tegerwoddit el Swinguero"|"Pekewabbit"|"Pekewabbit Hambriento"|"Pekewasqhabit el Juguetón"|"Pekiwbyt Hambriento el Glotón"|"Tofu"|"Tofu enfermo"|"Tofu maléfico"|"Tofu Real"|"Satofu el PlasticPaddy"|"Tofumantxú el Mítico"|"Tofumado el Alucinado"|"Tortugadget el Inspector"|"Tortugríssom el Doctor"|"Tortruquini el Inspector"|"Tortugo Projatt el Corto"|"Tortuga azul"|"Tortuga amarilla"|"Tortuga roja"|"Tortuga verde"|"Araknola"|"Tufóbico el Miedoso"|"Gearsol Metalvaje el Espía"|"Barrostropajo"|"Barrostroporosis el Frágil"|"Girasol Hambriento"|"Girasol salvaje"|"Tufaldo Aréneo el Marielito"|"Trompseta"|"Trompsosis el Cardiaco"|"Tronkónido"|"Trroncky III el Tigre"|"Rojevita la Pequeña"|"Trooll"|"Trooloko"|"Troolbin el de los Bolsquels"|"Kosakepega"|"Kosakhiin el Lunítico"|"Sabeké la Vendedora"|"Tsukinoichi"|"Tsumani el Inundador"|"Tsume-bozu"|"Tynril Atónito"|"Tynril Estupefacto"|"Tynril Absorto"|"Tynril Pérfido"|"Vampiro"|"Vamorespirros el Múltiple"|"Vetorano"|"Vetaurino el Energizado"|"Wey Wabbit"|"Wabbit"|"Wabbit GM"|"Wabbit esqueleto"|"Wogew Wabbit el Engañado"|"Blackowibbit el Imaginativo"|"Warjamer el Miniaturista"|"Warko marrón"|"Warko violeta"|"Warkamole el Apetitoso"|"Waybbit Esquelite el Rebelde"|"Wabbit wodo"|"Wabibip Woyote el Persistente"|"Yokai Firefux"|"Yocái Ipehkaíto el Frito"|"Yukisamara"} MonsterNameEs */

  /** @typedef {1|2} QuestTypeId */
  /** @typedef {"ocre"|"dokille"} QuestTypeSlug */
  /** @typedef {"Ocre"|"Dokille"} QuestTypeNameFr */
  /** @typedef {"Ochre"|"Grofus"} QuestTypeNameEn */
  /** @typedef {"Ocre"|"Dosaurio"} QuestTypeNameEs */

  /** @typedef {1|24|25|2|3|4|5|23|7|11|21|10|15|20|14|16|8|17|18|9|13|12} ZoneId */
  /** @typedef {"Amakna"|"Archipel de Valonia"|"Archipel de Vulkania"|"Astrub"|"Baie de Sufokia"|"Bonta"|"Brâkmar"|"Expéditions"|"Foire du Trool"|"Forêt des Abraknydes"|"Forêt Maléfique"|"Gelaxième dimension"|"Île d'Otomaï"|"Île de Grobe"|"Île de Moon"|"Île de Pandala"|"Île des Wabbits"|"Île du Minotoror"|"Labyrinthe du Dragon Cochon"|"Landes de Sidimote"|"Montagne des Koalaks"|"Plaines de Cania"} ZoneNameFr */
  /** @typedef {"Amakna"|"Archipelago of Valonia"|"Archipelago of Vulkania"|"Astrub"|"Sufokia Bay"|"Bonta"|"Brakmar"|"Expeditions"|"Trool Fair"|"Treechnid Forest"|"Evil Forest"|"Jellith Dimension"|"Otomai Island"|"Nolifis Island"|"Moon Island"|"Pandala Island"|"Wabbit Islands"|"Minotoror Island"|"Dragon Pig's Maze"|"Sidimote Moors"|"Koalak Mountain"|"Cania Plains"} ZoneNameEn */
  /** @typedef {"Amakna"|"Archipiélago de Valonia"|"Archipiélago de Vulkania"|"Astrub"|"Bahía de Sufokia"|"Bonta"|"Brakmar"|"Expediciones"|"Feria del Trool"|"Bosque de los abráknidos"|"Bosque Maléfico"|"Gelexta Dimensión"|"Isla de Otomai"|"Isla de Grobe"|"Isla de Moon"|"Isla de Pandala"|"Archipiélago wabbit"|"Isla del Minotauroro"|"Laberinto del Dragocerdo"|"Landas de Sidimote"|"Montaña de los koalaks"|"Llanuras de Cania"} ZoneNameEs */

  /** @typedef {48|131|60|5|46|47|31|34|16|125|8|7|14|30|70|38|171|95|79|32|136|42|57|4|3|61|134|39|44|81|12|13|135|168|157|2|130|1|156|37|92|160|33|17|28|155|210|214|220|216} SubZoneId */
  /** @typedef {"Akadémie des Gobs"|"Antre de Crocabulia"|"Bord de la forêt maléfique"|"Campagne d'Amakna"|"Campement des Bworks"|"Campement des Gobelins"|"Champ des Ingalsse"|"Cimetière"|"Clairière de Brouce Boulgoure"|"Cloaque d'Amakna"|"Coin des Boos"|"Coin des Bouftous"|"Côte d'Asse"|"Cryptes du cimetière"|"Donjon des Bworks"|"Donjon des Forgerons"|"Donjon des Larves"|"Donjon des Scarafeuilles"|"Donjon des Squelettes"|"Donjon des Tofus"|"Épreuve de Draegnerys"|"Forêt d'Amakna"|"Marécages d'Amakna"|"Milifutaie"|"Montagne basse des Craqueleurs"|"Montagne des Craqueleurs"|"Nid du Kwakwa"|"Passage vers Brâkmar"|"Péninsule des gelées"|"Pitons Rocheux des Craqueleurs"|"Plaine des Scarafeuilles"|"Port de Madrestam"|"Presqu'île des Dragoeufs"|"Repaire de Sphincter Cell"|"Repaire du Kharnozor"|"Rivière Kawaii"|"Sanctuaire des Dragoeufs"|"Souterrains"|"Souterrains des Dragoeufs"|"Territoire des Bandits"|"Territoire des Porcos"|"Territoire souterrain des Porcos"|"Tofulailler Royal"|"Village d'Amakna"|"Village des Bworks"|"Village des Dragoeufs"|"Refuge sylvestre"|"Cratère Minus"|"Cratère Monseleya"|"Cratère Mopyle"} SubZoneNameFr */
  /** @typedef {"Gob Akademy"|"Crocabulia's Lair"|"Edge of the Evil Forest"|"Amakna Countryside"|"The Bwork Camp"|"The Goblin Camp"|"Ingalsses' Fields"|"Cemetery"|"Brouce Boulgoure's Clearing"|"Amakna Sewers"|"Mushd Corner"|"Gobball Corner"|"Asse Coast"|"Cemetery Crypts"|"Bwork Dungeon"|"Blacksmith Dungeon"|"Larva Dungeon"|"Scaraleaf Dungeon"|"Skeleton Dungeon"|"Tofu House"|"Draegnerys's Trial"|"Amakna Forest"|"Amakna Swamps"|"Milicluster"|"Low Crackler Mountain"|"Crackler Mountain"|"The Kwakwa's Nest"|"Passage to Brakmar"|"Jelly Peninsula"|"Crackler's Rocky Peaks"|"Scaraleaf Plain"|"Madrestam Harbour"|"Dreggon Peninsula"|"Sphincter Cell's Lair"|"Kharnotaurus's Lair"|"Kawaii River"|"The Dreggons' Sanctuary"|"Tunnels"|"Dreggon Tunnels"|"Bandit Territory"|"Porco Territory"|"Underground Porco Territory"|"Royal Tofu House"|"Amakna Village"|"Bwork Village"|"Dreggon Village"|"Sylvan Refuge"|"Pinki Crater"|"Mountsaleia Crater"|"Onthea Crater"} SubZoneNameEn */
  /** @typedef {"Akademia de los Goblins"|"Antro de Cocabulia"|"Linde del Bosque Maléfico"|"Campo de Amakna"|"Campamento de los bworks"|"Campamento de los goblins"|"Campo de los Ingals"|"Cementerio"|"Claro de Brus Bulguro"|"Cloaca de Amakna"|"Rincón de los Boos"|"Rincón de los Jalatós"|"Costa del Rano"|"Criptas del cementerio"|"Mazmorra de los Bworks"|"Mazmorra de los Herreros"|"Mazmorra de las Larvas"|"Mazmorra de los Escarahojas"|"Mazmorra de los Esqueletos"|"Mazmorra de los Tofus"|"Prueba de Dragenerys"|"Bosque de Amakna"|"Pantanos de Amakna"|"Mililameda"|"Piedemonte de los crujidores"|"La montaña de los crujidores"|"Nido de Kwoknan"|"Pasaje hacia Brakmar"|"Península de las gelatinas"|"Picos Rocosos de los Crujidores"|"Llanura de los escarahojas"|"Puerto de Madrestam"|"Península de los dragohuevos"|"Guarida de Sfinter Cell"|"Guarida de Karnozor"|"Río Kawaii"|"Santuario de los dragohuevos"|"Subterráneos"|"Subterráneos de los dragohuevos"|"Territorio de los bandidos"|"Territorio de los porcos"|"Territorio subterráneo de los porcos"|"Tofullinero Real"|"Pueblo de Amakna"|"Pueblo de los bworks"|"Pueblo de los dragohuevos"|"Refugio Silvestre"|"Cráter Mino"|"Cráter Montseleya"|"Cráter Mófilo"} SubZoneNameEs */

  /** @typedef {1|2|3|4} QuestTemplateId */

  /** @typedef {1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20} ServerId */
  /** @typedef {"Brial"|"Rafal"|"Salar"|"Kourial"|"Dakal"|"Mikhal"|"Imagiro"|"Hell Mina"|"Tylezia"|"Orukam"|"Tal Kasha"|"Draconiros"|"Ombre"|"Fallanster"|"Boune"|"Allisteria"|"Blair"|"Kelerog"|"Talok"|"Tiliwan"} ServerName */
  /** @typedef {"World"|"France"} ServerCommunity */

  /**
   * @typedef {object} MonsterTypeName
   * @property {MonsterTypeNameFr} fr
   * @property {MonsterTypeNameEn} en
   * @property {MonsterTypeNameEs} es
   */

  /**
   * @typedef {object} MonsterName
   * @property {MonsterNameFr} fr
   * @property {MonsterNameEn} en
   * @property {MonsterNameEs} es
   */

  /** @typedef {"aboub.png"|"abrakne.png"|"abraknyde_sombre.png"|"abraknyde_venerable.png"|"abrakleur_sombre.png"|"abrakne_sombre.png"|"abrakleur_clair.png"|"abraknyde.png"|"abraknyde_ancestral.png"|"aerohouctor_le_guerrier.png"|"aerotrugobur_le_malveillant.png"|"akakwa.png"|"alhyene.png"|"amlub.png"|"aquabralak_le_guerrier.png"|"aqualikros_l_impitoyable.png"|"arakne_majeure.png"|"arakne_malade.png"|"arakmutee.png"|"araknawa.png"|"arakne_des_egouts.png"|"arakne.png"|"arakne_agressive.png"|"arapex.png"|"bakazako.png"|"bambouto_sacre.png"|"bambouto.png"|"bandit_manchot.png"|"bandit_du_clan_des_roublards.png"|"barbroussa.png"|"bwork_archer.png"|"betto.png"|"berger_porkass.png"|"biblop_griotte.png"|"biblop_coco.png"|"biblop_indigo.png"|"biblop_reinette.png"|"boumbardier.png"|"bitouf_aerien.png"|"bitouf_des_plaines.png"|"bitouf_sombre.png"|"bizarbwork.png"|"black_tiwabbit.png"|"black_wabbit.png"|"blop_reinette.png"|"blop_coco.png"|"blop_coco_royal.png"|"blop_griotte.png"|"blop_griotte_royal.png"|"blop_indigo.png"|"blop_indigo_royal.png"|"blop_multicolore_royal.png"|"blop_reinette_royal.png"|"ishigro_pake.png"|"boo.png"|"boomba.png"|"boufton_blanc.png"|"boulanger_sombre.png"|"bouftou.png"|"chef_de_guerre_bouftou.png"|"boufton_noir.png"|"bouftou_royal.png"|"bourbassingue.png"|"bourdard.png"|"braconnier.png"|"brouture.png"|"bulbambou.png"|"bulbiflore.png"|"bulbig.png"|"bulbuisson.png"|"bwork.png"|"bwork_mage.png"|"bworker.png"|"bworkette.png"|"canondorf.png"|"cavalier_porkass.png"|"chafer_invisible.png"|"chafer.png"|"chafer_archer.png"|"chafer_d_elite.png"|"chafer_draugr.png"|"chafer_fantassin.png"|"chafer_lancier.png"|"chamane_d_egoutant.png"|"champ_champ.png"|"champa_rouge.png"|"champa_marron.png"|"champaknyde.png"|"champodonte.png"|"champ_a_gnons.png"|"champa_bleu.png"|"champa_vert.png"|"champbis.png"|"champmane.png"|"chef_crocodaille.png"|"chene_mou.png"|"chevaucheur_de_karne.png"|"chevaucheur_koalak.png"|"gob_trotteur.png"|"chiendent.png"|"cochon_de_lait.png"|"choudini.png"|"citwouille.png"|"cochon_de_farle.png"|"codem.png"|"cooleuvre.png"|"coquille_explosive.png"|"corailleur.png"|"corailleur_magistral.png"|"corbac.png"|"crabe.png"|"crachefoux.png"|"craqueleur.png"|"craqueleur_des_plaines.png"|"craqueboule.png"|"craqueboule_poli.png"|"craquelourd.png"|"craqueleur_legendaire.png"|"craqueleur_poli.png"|"croc_gland.png"|"croc_gland_enrage.png"|"crocabulia.png"|"crocodaille.png"|"crowneille.png"|"crustorail_morito.png"|"crustorail_passaoh.png"|"crustorail_malibout.png"|"crustorail_kouracao.png"|"damadrya.png"|"dardalaine.png"|"dark_vlad.png"|"deminoboule.png"|"disciple_zoth.png"|"dok_alako.png"|"don_dorgan.png"|"don_duss_ang.png"|"maitre_zoth.png"|"dragace.png"|"dragoss_dore.png"|"dragnarok.png"|"dragoss_ardoise.png"|"dragoss_de_saphir.png"|"dragoeuf_argile.png"|"dragkouine_la_magnifique.png"|"dragodinde_amande_sauvage.png"|"dragoeuf_dore_eveille.png"|"dragoss_calcaire.png"|"dragoeuf_ardoise.png"|"dragoeuf_charbon.png"|"dragodinde_rousse_sauvage.png"|"draguaindrop.png"|"dragodinde_doree_sauvage.png"|"dragoeuf_noir_eveille.png"|"dragoeuf_blanc.png"|"dragoeuf_blanc_eveille.png"|"dragoeuf_blanc_immature.png"|"dragoeuf_calcaire.png"|"dragoeuf_de_saphir.png"|"dragoeuf_de_saphir_eveille.png"|"dragoeuf_de_saphir_immature.png"|"dragoeuf_dore.png"|"dragoeuf_dore_immature.png"|"dragoeuf_guerrier.png"|"dragoeuf_noir.png"|"dragoeuf_noir_immature.png"|"dragoeuf_volant.png"|"dragon_cochon.png"|"dragueuse.png"|"dragoss_argile.png"|"dragoss_blanc.png"|"dragoss_blanc_eveille.png"|"dragoss_charbon.png"|"dragoss_de_saphir_eveille.png"|"dragoss_dore_eveille.png"|"dragoss_noir.png"|"dragoss_noir_eveille.png"|"drakoalak.png"|"fecorce.png"|"etoile_de_la_mer_d_asse.png"|"fantome_tanukoui_san.png"|"fantome_aux_plates.png"|"fantome_pandule.png"|"fanfancisco_le_cosmopolite.png"|"fangshu.png"|"fanhatur_le_simple.png"|"fantome_soryo_firefoux.png"|"fanjipann_le_sucre.png"|"fanjo_le_pilote.png"|"fantome_apero.png"|"fantome_maho_firefoux.png"|"fanlmyl_l_acuite.png"|"fantome_pandore.png"|"fantome_leopardo.png"|"fantome_pandikaze.png"|"fantome_yokai_firefoux.png"|"fantome_hicide.png"|"fantome_ardent.png"|"fantome_arepo.png"|"fantome_brave.png"|"fantome_egerie.png"|"fantrask_le_reveur.png"|"fauchalak.png"|"felygiene.png"|"flammeche_air.png"|"flammeche_eau.png"|"flammeche_feu.png"|"flammeche_terre.png"|"floribonde.png"|"floristile.png"|"forgeron_sombre.png"|"fossoyeur_koalak.png"|"foufayteur.png"|"founamboul.png"|"founoroshi.png"|"fourbasse.png"|"gamine_zoth.png"|"gamino.png"|"gardienne_des_egouts.png"|"gargantul.png"|"gargrouille.png"|"gelee_bleuet.png"|"gelee_fraise.png"|"gelee_bleue.png"|"gelee_menthe.png"|"gelee_royale_bleue.png"|"gelee_royale_bleuet.png"|"gelee_royale_citron.png"|"gelee_royale_fraise.png"|"gelee_royale_menthe.png"|"gink.png"|"gloutovore.png"|"gobelin.png"|"gobet.png"|"gourlo_le_terrible.png"|"grand_pa_wabbit.png"|"grenufar.png"|"grokoko.png"|"guerrier_koalak.png"|"guerrier_zoth.png"|"hanshi.png"|"haute_truche.png"|"hell_mina.png"|"ignelicrobur_le_guerrier.png"|"ignerkocropos_l_affame.png"|"ino_naru.png"|"jiangshi_nobi.png"|"kaeneko.png"|"kanigrou.png"|"kaniblou.png"|"kanniboul_sarbak.png"|"kanniboul_ark.png"|"kanniboul_archer.png"|"kanniboul_eth.png"|"kanniboul_jav.png"|"kanniboul_thierry.png"|"kaonashi.png"|"kaskargo.png"|"kido.png"|"kilibriss.png"|"kimbo.png"|"kirevam.png"|"kitsou_nae.png"|"kitsou_nakwa.png"|"kitsou_nere.png"|"kitsou_nufeu.png"|"koalak_griotte.png"|"koalak_farouche.png"|"koalak_coco.png"|"koalak_forestier.png"|"koalak_immature.png"|"koalak_indigo.png"|"koalak_reinette.png"|"koalak_sanguin.png"|"kokom.png"|"kokoko.png"|"kolerat.png"|"koulosse.png"|"krambwork.png"|"kramelehon.png"|"krokage_la_vorace.png"|"krokblanche_l_immaculee.png"|"krokcinelle_la_tachetee.png"|"krokee_l_entamee.png"|"krokenjambe_la_tombeuse.png"|"krokette_la_croustillante.png"|"krokikrisp_la_cerealiere.png"|"krokillage_la_marine.png"|"krokillagee_la_sage.png"|"krokille_juvenile_boueuse.png"|"krokille_juvenile_humide.png"|"krokille_juvenile_incandescente.png"|"krokille_juvenile_insipide.png"|"krokille_juvenile_seche.png"|"krokille_mature_boueuse.png"|"krokille_mature_humide.png"|"krokille_mature_incandescente.png"|"krokille_mature_insipide.png"|"krokille_mature_seche.png"|"krokille_novice_boueuse.png"|"krokille_novice_humide.png"|"krokille_novice_incandescente.png"|"krokille_novice_insipide.png"|"krokille_novice_seche.png"|"krokille_venerable_boueuse.png"|"krokille_venerable_humide.png"|"krokille_venerable_incandescente.png"|"krokille_venerable_insipide.png"|"krokille_venerable_seche.png"|"krokine_l_allumeuse.png"|"krokis_l_esquissee.png"|"kroknemboure_la_mousseuse.png"|"krokobure_la_maudite.png"|"krokotte_la_minutee.png"|"krokpit_la_pilotee.png"|"krokrane_la_distordue.png"|"krokrodaille_la_mordante.png"|"kroktail_la_desalterante.png"|"krokue_la_trompee.png"|"krokuite_la_calcinee.png"|"kurookin.png"|"kwak_de_flamme.png"|"kwak_de_glace.png"|"kwak_de_terre.png"|"kwak_de_vent.png"|"kwoan.png"|"la_ouassingue.png"|"larve_verte.png"|"larve_champetre.png"|"larve_orange.png"|"larve_bleue.png"|"larve_jaune.png"|"le_flib.png"|"le_ouassingue.png"|"le_ouassingue_entourbe.png"|"leopardo.png"|"let_emoliug.png"|"lichangoro.png"|"lolojiki.png"|"macien.png"|"madura.png"|"maho_firefoux.png"|"maitre_vampire.png"|"maitre_bolet.png"|"maitre_corbac.png"|"maitre_koalak.png"|"maitre_pandore.png"|"malle_outillee.png"|"mama_koalak.png"|"mandrine.png"|"medibwork.png"|"megabwork.png"|"meulou.png"|"meupette.png"|"milimulou.png"|"milirat_strubien.png"|"milirat_d_egoutant_malade.png"|"mineur_sombre.png"|"minoskito.png"|"minotoror.png"|"minotot.png"|"mob_l_eponge.png"|"momie_koalak.png"|"mominotor.png"|"moon.png"|"moskito.png"|"moumoule.png"|"mufafah.png"|"mulou.png"|"nakunbra.png"|"nebgib.png"|"nerbe.png"|"noeul.png"|"nipul.png"|"nodkoko.png"|"onabu_geisha.png"|"oni.png"|"onirakam.png"|"orfelin.png"|"osurc.png"|"ougah.png"|"ouginak.png"|"palmifleur_kouracao.png"|"palmifleur_morito.png"|"palmifleur_passaoh.png"|"palmifleur_malibout.png"|"pandalette_ivre.png"|"pandawa_ivre.png"|"pandikaze.png"|"pandit.png"|"pandore.png"|"pandule.png"|"panthegros.png"|"parashukoui.png"|"pekeualak.png"|"peki_peki.png"|"petartifoux.png"|"pichon_vert.png"|"pichon_bleu.png"|"pichon_blanc.png"|"pichon_kloune.png"|"pichon_orange.png"|"piou_bleu.png"|"piou_jaune.png"|"piou_rose.png"|"piou_rouge.png"|"piou_vert.png"|"piou_violet.png"|"piralak.png"|"pissenlit_diabolique.png"|"poolay.png"|"porsalu.png"|"prespic.png"|"scelerat_strubien.png"|"rakoopeur.png"|"ramane_d_egoutant.png"|"rat_blanc.png"|"rat_d_egoutant.png"|"rat_d_egoutant_malade.png"|"rat_d_hyoactif.png"|"rat_noir.png"|"ratatouille_le_cuisinier.png"|"raul_mops.png"|"reine_nyee.png"|"rib.png"|"robionicle.png"|"robot_fleau.png"|"roissingue.png"|"rose_demoniaque.png"|"rose_obscure.png"|"rouquette.png"|"yukisamara.png"|"saltik.png"|"sanglier_des_plaines.png"|"sanglier.png"|"sarkapwane.png"|"scarafeuille_blanc.png"|"scarabosse_dore.png"|"scarafeuille_bleu.png"|"scarafeuille_rouge.png"|"scarafeuille_vert.png"|"scaratos.png"|"scorbute.png"|"sergent_zoth.png"|"serpentin.png"|"serpiplume.png"|"shin_larve.png"|"silf_le_rasboul_majeur.png"|"skeunk.png"|"soryo_firefoux.png"|"souris_grise.png"|"souris_verte.png"|"sousouris_grise.png"|"sparo.png"|"sphincter_cell.png"|"susej.png"|"tambourai.png"|"tanukoui_san.png"|"terraburkal_le_perfide.png"|"terrakoubiak_le_guerrier.png"|"tetonuki.png"|"tikoko.png"|"tiwabbit.png"|"tiwabbit_kiafin.png"|"tofu.png"|"tofu_malade.png"|"tofu_malefique.png"|"tofu_royal.png"|"tortue_bleue.png"|"tortue_jaune.png"|"tortue_verte.png"|"tortue_rouge.png"|"touchparak.png"|"tournesol_sauvage.png"|"tourbassingue.png"|"tournesol_affame.png"|"tromperelle.png"|"tronknyde.png"|"trooll.png"|"troollaraj.png"|"trukikol.png"|"tsukinochi.png"|"tsume_bozu.png"|"tynril_ahuri.png"|"tynril_consterne.png"|"tynril_deconcerte.png"|"tynril_perfide.png"|"vampire.png"|"vetauran.png"|"wa_wabbit.png"|"wabbit.png"|"wabbit_gm.png"|"wabbit_squelette.png"|"warko_violet.png"|"warko_marron.png"|"wo_wabbit.png"|"yokai_firefoux.png"} MonsterImage */
  /** @typedef {35|42|78|74|131|82|152|38|90|80|114|122|40|11|132|22|16|14|130|162|77|102|37|58|24|144|97|46|52|60|120|25|30|95|51|65|127|15|18|75|180|50|32|33|172|61|140|27|125|59|1|62|93|70|96|36|110|300|108|92|126|112|84|55|100|128|400|170|220|230|380|160|164|57|150|129|101|64|117|145|54|20|201|151|43|53|98|21|73|103|104|56|200|143|10|106|94|203|45|39|800|142|17|34|181|19|204|133|123|107|41|330|91|66|44|48} MonsterLevelMin */
  /** @typedef {47|50|90|86|143|160|96|126|130|48|15|140|43|30|20|18|138|170|97|110|49|70|28|109|142|54|60|120|29|107|59|66|85|139|23|26|83|180|37|40|41|58|77|35|114|137|45|98|67|200|105|108|300|78|100|68|72|82|122|440|210|80|220|250|400|270|73|158|6|141|112|129|128|165|62|24|132|150|209|159|51|61|81|111|88|116|118|198|64|76|104|240|65|155|22|106|75|211|95|52|840|92|25|42|63|189|27|212|135|1|69|350|101|74|56} MonsterLevelMax */
  /** @typedef {337|636|577|20} MonsterCount */
  /** @typedef {1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34} MonsterStep */
  /** @typedef {18|34|4} StepCount */

  /**
   * @typedef {object} QuestTypeName
   * @property {QuestTypeNameFr} fr
   * @property {QuestTypeNameEn} en
   * @property {QuestTypeNameEs} es
   */

  /**
   * @typedef {object} ZoneName
   * @property {ZoneNameFr} fr
   * @property {ZoneNameEn} en
   * @property {ZoneNameEs} es
   */

  /**
   * @typedef {object} SubZoneName
   * @property {SubZoneNameFr} fr
   * @property {SubZoneNameEn} en
   * @property {SubZoneNameEs} es
   */

  /**
   * @typedef {object} GameVersion
   * @property {GameVersionId} id
   * @property {GameVersionName} name
   */

  /**
   * @typedef {object} MonsterType
   * @property {MonsterTypeId} id
   * @property {MonsterTypeName} name
   */

  /**
   * @typedef {object} MonsterReference
   * @property {MonsterId} id
   * @property {MonsterName} name
   */

  /**
   * @typedef {object} BaseMonster
   * @property {MonsterId} id
   * @property {MonsterName} name
   * @property {MonsterImage} image
   * @property {MonsterLevelMin} level_min
   * @property {MonsterLevelMax} level_max
   * @property {MonsterType|null} type
   * @property {MonsterReference|null} [reference]
   */

  /**
   * @typedef {object} QuestType
   * @property {QuestTypeId} id
   * @property {QuestTypeSlug} slug
   * @property {QuestTypeName} name
   */

  /**
   * @typedef {object} Zone
   * @property {ZoneId} id
   * @property {ZoneName} name
   * @property {Array<SubZone>} [subzones]
   */

  /**
   * @typedef {object} SubZone
   * @property {SubZoneId} id
   * @property {SubZoneName} name
   * @property {Zone|null} [zone]
   * @property {Array<BaseMonster>} [monsters]
   */

  /**
   * @typedef {object} MonsterDetail
   * @property {MonsterReference|null} [reference]
   * @property {Array<Zone>} [zones]
   */

  /**
   * @typedef {object} BaseQuestTemplate
   * @property {QuestTemplateId} id
   * @property {QuestType|null} quest_type
   * @property {GameVersion|null} game_version
   */

  /**
   * @typedef {object} QuestTemplateList
   * @property {MonsterCount} monster_count
   * @property {StepCount} step_count
   */

  /**
   * @typedef {object} QuestTemplateMonster
   * @property {MonsterId} id
   * @property {MonsterName} name
   * @property {MonsterImage} image
   * @property {MonsterLevelMin} level_min
   * @property {MonsterLevelMax} level_max
   * @property {MonsterType|null} type
   * @property {MonsterStep} step
   */

  /**
   * @typedef {object} QuestTemplateDetail
   * @property {Array<QuestTemplateMonster>} monsters
   * @property {Pagination} [pagination]
   */

  /**
   * @typedef {object} Server
   * @property {ServerId} id
   * @property {ServerName} name
   * @property {ServerCommunity} community
   * @property {GameVersion|null} game_version
   */

  /**
   * @typedef {object} BaseKralove
   * @property {string} id
   * @property {string} event_datetime
   * @property {string} description
   * @property {string} creator
   * @property {Server|null} server
   */

  /**
   * @typedef {object} KraloveList
   * @property {number} participants_count
   * @property {number} character_count
   * @property {number} messages_count
   */

  /**
   * @typedef {object} Participant
   * @property {string} username
   * @property {number} character_count
   */

  /**
   * @typedef {object} KraloveMessage
   * @property {string} username
   * @property {string} content
   * @property {string} created_at
   */

  /**
   * @typedef {object} KraloveDetail
   * @property {Array<Participant>} participants
   * @property {Array<KraloveMessage>} messages
   */

  /**
   * @typedef {object} AvatarMonster
   * @property {MonsterId} id
   * @property {MonsterName} name
   * @property {string} image
   */

  /**
   * @typedef {object} BaseUser
   * @property {string} username
   * @property {AvatarMonster|null} avatar
   * @property {string} last_active
   */

  /**
   * @typedef {object} QuestTemplateRef
   * @property {QuestTemplateId} id
   * @property {MonsterCount} monster_count
   * @property {StepCount} step_count
   */

  /**
   * @typedef {object} BaseQuest
   * @property {string} slug
   * @property {string} character_name
   * @property {MonsterStep} current_step
   * @property {number} parallel_quests
   * @property {Server|null} server
   * @property {QuestTemplateRef} quest_template
   */

  /**
   * @typedef {object} UserQuestListItem
   * @property {string} slug
   * @property {string} character_name
   * @property {MonsterStep} current_step
   * @property {number} parallel_quests
   * @property {number} wanted_count
   * @property {number} offered_count
   * @property {Server|null} server
   * @property {QuestTemplateRef} quest_template
   */

  /**
   * @typedef {object} UserDetail
   * @property {string} bio
   * @property {string} created_at
   * @property {Array<BaseQuest>} quests
   */

  /**
   * @typedef {object} UserQuestMonster
   * @property {MonsterId} id
   * @property {MonsterName} name
   * @property {MonsterImage} image
   * @property {MonsterLevelMin} level_min
   * @property {MonsterLevelMax} level_max
   * @property {MonsterType|null} type
   * @property {MonsterStep} step
   * @property {number} quantity - Quantité possédée par l'utilisateur.
   * @property {number} offer - Quantité proposée à l'échange.
   * @property {number} want - Quantité recherchée à l'échange.
   */

  /**
   * @typedef {object} UserQuestDetail
   * @property {string} slug
   * @property {string} character_name
   * @property {MonsterStep} current_step
   * @property {number} parallel_quests
   * @property {Server|null} server
   * @property {QuestTemplateRef} quest_template
   * @property {Array<UserQuestMonster>} monsters
   * @property {Pagination} pagination
   */

  /**
   * @typedef {object} Conversation
   * @property {string} username
   * @property {number} message_count
   * @property {string} last_message_at
   */

  /**
   * @typedef {object} ProposalQuestType
   * @property {QuestTypeId} id
   * @property {QuestTypeSlug} slug
   */

  /**
   * @typedef {object} ProposalMonsterItem
   * @property {MonsterId} monster_id
   * @property {number} quantity
   */

  /**
   * @typedef {object} ProposalApplication
   * @property {string} username
   * @property {string} created_at
   */

  /**
   * @typedef {object} ConversationTextMessage
   * @property {"message"} kind
   * @property {number} id
   * @property {string} content
   * @property {string} sender
   * @property {string} created_at
   * @property {string|null} read_at
   */

  /**
   * @typedef {object} ConversationProposal
   * @property {"proposal"} kind
   * @property {number} id
   * @property {string} sender
   * @property {string} recipient
   * @property {"pending"|"half_applied"|"completed"|"cancelled"} status
   * @property {ServerId} server_id
   * @property {ProposalQuestType|null} quest_type
   * @property {Array<ProposalMonsterItem>} monsters_given
   * @property {Array<ProposalMonsterItem>} monsters_received
   * @property {Array<ProposalApplication>} applications
   * @property {string|null} cancelled_at
   * @property {string} created_at
   */

  /** @typedef {ConversationTextMessage|ConversationProposal} ConversationItem */

  /**
   * Champs modifiables d'une quête via `updateQuest`. Tous sont optionnels.
   *
   * @typedef {object} QuestUpdate
   * @property {string} [character_name] - Nom du personnage (max 200 caractères).
   * @property {number} [parallel_quests] - Nombre de quêtes en parallèle (≥ 1 ; max défini par le site).
   * @property {MonsterStep} [current_step] - Étape courante (1-34).
   * @property {boolean} [show_trades] - Visibilité de la quête dans la communauté.
   * @property {0|1} [trade_mode] - Mode de trading (0 = Automatique, 1 = Mode expert).
   * @property {number|null} [trade_offer_threshold] - Seuil minimal pour proposer en mode expert (0-30).
   * @property {number|null} [trade_want_threshold] - Seuil maximal pour rechercher en mode expert (0-30).
   * @property {boolean|0|1} [never_offer_normal] - Ne jamais proposer les monstres normaux (étapes 1-16).
   * @property {boolean|0|1} [never_want_normal] - Ne jamais rechercher les monstres normaux (étapes 1-16).
   * @property {boolean|0|1} [never_offer_boss] - Ne jamais proposer les boss (étapes 17-19).
   * @property {boolean|0|1} [never_want_boss] - Ne jamais rechercher les boss (étapes 17-19).
   * @property {boolean|0|1} [never_offer_arch] - Ne jamais proposer les archimonstres (étapes 20+).
   * @property {boolean|0|1} [never_want_arch] - Ne jamais rechercher les archimonstres (étapes 20+).
   */

  /**
   * @typedef {object} TypeFilterEntry
   * @property {boolean} never_offer - Ne jamais proposer ce type de monstre.
   * @property {boolean} never_want - Ne jamais rechercher ce type de monstre.
   */

  /**
   * Filtres de trade par type de monstre, indexés par id de type sous forme de chaîne
   * (`"1"` = monstre, `"2"` = boss, `"3"` = archimonstre).
   *
   * @typedef {Object<string, TypeFilterEntry>} TypeFilters
   */

  /**
   * Réponse de `updateQuest`. L'API **n'écho que les champs effectivement modifiés** (en plus de
   * `slug`) : les propriétés ci-dessous sont donc toutes optionnelles. Les flags `never_*`, quand
   * ils sont modifiés, sont renvoyés regroupés dans `type_filters` (et non à plat).
   *
   * @typedef {object} QuestUpdateResult
   * @property {QuestSlug} slug
   * @property {string} [character_name]
   * @property {number} [parallel_quests]
   * @property {MonsterStep} [current_step]
   * @property {boolean} [show_trades]
   * @property {0|1} [trade_mode]
   * @property {number|null} [trade_offer_threshold]
   * @property {number|null} [trade_want_threshold]
   * @property {TypeFilters} [type_filters]
   */

  /**
   * @typedef {object} QuestMonsterQuantityResult
   * @property {MonsterId} monster_id
   * @property {number} quantity
   * @property {number} owned
   * @property {number} status - Calculé (`owned - parallel_quests`) : négatif = recherché, positif = proposé, 0 = neutre.
   * @property {number} effective_offer - Quantité réellement proposée à l'échange (après mode, seuils et surcharges).
   * @property {number} effective_want - Quantité réellement recherchée à l'échange (après mode, seuils et surcharges).
   */

  /**
   * @typedef {object} QuestMonstersBatchResult
   * @property {number} updated_count
   * @property {Array<QuestMonsterQuantityResult>} monsters
   */

  /**
   * @typedef {object} QuestMonsterTradeResult
   * @property {MonsterId} monster_id
   * @property {number|null} trade_offer
   * @property {number|null} trade_want
   * @property {number} effective_offer - Quantité réellement proposée à l'échange (après mode, seuils et surcharges).
   * @property {number} effective_want - Quantité réellement recherchée à l'échange (après mode, seuils et surcharges).
   */

  /**
   * Une entrée `{ monster, quantity }` pour la mise à jour d'un monstre par lot.
   *
   * @typedef {object} QuestMonsterQuantityInput
   * @property {MonsterId|MonsterNameFr|MonsterNameEn|MonsterNameEs} monster - Id ou nom du monstre.
   * @property {number} quantity - Quantité possédée (0 à 30).
   */

  /**
   * @typedef {object} MatchMonster
   * @property {MonsterId} id
   * @property {MonsterName} name
   * @property {number} available - Quantité disponible à l'échange.
   * @property {number} needed - Besoin.
   * @property {boolean} covers_need - `true` si l'offre couvre entièrement le besoin.
   */

  /**
   * @typedef {object} MatchQuest
   * @property {QuestSlug} slug
   * @property {string} character_name
   * @property {number} parallel_quests
   */

  /**
   * @typedef {object} QuestMatch
   * @property {BaseUser} user
   * @property {MatchQuest} quest
   * @property {{ they_have_you_want: Array<MatchMonster>, you_have_they_want: Array<MatchMonster> }} matches
   * @property {number} match_score - Somme des types de monstres échangeables (donnés + reçus).
   */

  /**
   * @typedef {object} QuestZoneMonster
   * @property {MonsterId} id
   * @property {MonsterName} name
   * @property {MonsterImage} image
   * @property {MonsterType|null} type
   * @property {MonsterStep} step
   * @property {number} owned
   * @property {number} required
   * @property {"validated"|"completed"|"incomplete"} status
   * @property {number} offer - Quantité réellement proposée à l'échange.
   * @property {number} want - Quantité réellement recherchée à l'échange.
   */

  /**
   * @typedef {object} QuestZoneSubZoneProgress
   * @property {SubZoneId} id
   * @property {SubZoneName} name
   * @property {number} completed
   * @property {number} total
   * @property {Array<QuestZoneMonster>} monsters
   */

  /**
   * @typedef {object} QuestZoneProgress
   * @property {ZoneId} id
   * @property {ZoneName} name
   * @property {number} completed
   * @property {number} total
   * @property {Array<QuestZoneSubZoneProgress>} subzones
   */

  /**
   * @typedef {object} GameVersionsOptions
   * @property {GameVersionId|GameVersionName} [idOrName] - Id ou nom de la version du jeu
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
   * @typedef {object} MonsterTypesOptions
   * @property {MonsterTypeId|MonsterTypeNameFr|MonsterTypeNameEn|MonsterTypeNameEs} [idOrName] - Id ou nom du type de monstre
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
   * @typedef {object} ZonesOptions
   * @property {ZoneId|ZoneNameFr|ZoneNameEn|ZoneNameEs} [idOrName] - Id ou nom de la zone
   * @property {string} [query] - Recherche par nom (français, anglais ou espagnol) - minimum 3 caractères
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
  * @typedef {object} SubZonesOptions
  * @property {SubZoneId|SubZoneNameFr|SubZoneNameEn|SubZoneNameEs} [idOrName] - Id ou nom de la sous-zone
  * @property {string} [query] - Recherche par nom (français, anglais ou espagnol), nécessite `zoneIdOrName`, minimum 3 caractères
  * @property {ZoneId|ZoneNameFr|ZoneNameEn|ZoneNameEs} [zoneIdOrName] - Zone parente
  * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
  */

  /**
   * @typedef {object} MonstersOptions
   * @property {MonsterId|MonsterNameFr|MonsterNameEn|MonsterNameEs} [idOrName] - Id ou nom du monstre
   * @property {string} [query] - Recherche par nom (français, anglais ou espagnol) - minimum 3 caractères
   * @property {MonsterTypeId|MonsterTypeNameFr|MonsterTypeNameEn|MonsterTypeNameEs} [typeIdOrName] - Filtrer par type de monstre (1 = Monstre, 2 = Boss, 3 = Archimonstre)
   * @property {number} [limit] - Nombre de résultats (défaut : 50, max : 200)
   * @property {number} [offset] - Décalage pour la pagination (défaut : 0)
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
  * @typedef {object} QuestTemplatesOptions
  * @property {QuestTemplateId} [id] - Id du modèle de quête (1 = Ocre Dofus Unity, 2 = Ocre Dofus Rétro, 3 = Ocre Dofus Touch, 4 = Dokille Dofus Unity)
  * @property {MonsterStep} [step] - Filtrer par numéro d'étape
  * @property {number} [limit] - Nombre de résultats (défaut : 50, max : 200)
  * @property {number} [offset] - Décalage pour la pagination (défaut : 0)
  * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
  */

  /**
   * @typedef {object} ServersOptions
   * @property {ServerId|ServerName} [idOrName] - Id ou nom du serveur
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
   * @typedef {object} KralovesOptions
   * @property {string|number} [id] - Id de l'évènement kralamoure
   * @property {ServerId|ServerName} [serverIdOrName] - Filtrer par serveur
   * @property {string} [from] - Date de début au format `YYYY-MM-DD`. Par défaut : aujourd'hui
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
   * @typedef {object} SearchUsersOptions
   * @property {ServerId|ServerName} [serverIdOrName] - Filtrer par serveur
   * @property {number} [active_within_days] - Utilisateurs actifs dans les N derniers jours (défaut : 90, max : 365)
   * @property {number} [limit] - Nombre de résultats (défaut : 20, max : 50)
   * @property {number} [offset] - Décalage pour la pagination (défaut : 0)
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
  * @typedef {object} UserQuestsOptions
  * @property {string} [slug] - Slug de la quête utilisateur
  * @property {MonsterTypeId|MonsterTypeNameFr|MonsterTypeNameEn|MonsterTypeNameEs} [monsterTypeIdOrName] - Filtrer par type de monstre (1 = Monstre, 2 = Boss, 3 = Archimonstre)
  * @property {"wanted"|"offered"} [status] - wanted = recherchés, offered = proposés
  * @property {MonsterStep} [step] - Filtrer par numéro d'étape
  * @property {number} [limit] - Nombre de résultats (défaut : 50, max : 200)
  * @property {number} [offset] - Décalage pour la pagination (défaut : 0)
  * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
  */

  /**
   * @typedef {object} ConversationsOptions
   * @property {"active"|"archived"} [status] - `active` (défaut) ou `archived` pour lister les conversations archivées.
   * @property {number} [limit] - nombre de résultats, max **50** (défaut 50).
   * @property {number} [offset] - décalage de pagination (défaut 0).
   * @property {string} [api_key] - Clé API à utiliser (défaut : clé du client). Détermine l'utilisateur dont on liste les conversations.
   */

  /**
   * @typedef {object} MessagesOptions
   * @property {number} [limit] - nombre d'items par page (défaut 30, max 50).
   * @property {number} [before_id] - curseur = id du plus ancien item déjà récupéré (valeur de `next_before_id`).
   * @property {string} [api_key] - Clé API à utiliser (défaut : clé du client). Détermine le compte depuis lequel lire la conversation.
   */

  /**
   * @typedef {object} QuestMatchesOptions
   * @property {number} [limit] - Nombre de résultats (défaut : 20, max : 50).
   * @property {number} [offset] - Décalage pour la pagination (défaut : 0).
   * @property {number} [min_parallel_quests] - Nombre minimum de quêtes en parallèle chez le partenaire (défaut : 1).
   * @property {boolean|0|1} [only_possible_trades] - Exclut les partenaires avec qui un seul sens d'échange est possible (défaut : false).
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
   * @typedef {object} QuestZonesOptions
   * @property {ZoneId|ZoneNameFr|ZoneNameEn|ZoneNameEs} [zoneIdOrName] - Filtrer par zone.
   * @property {SubZoneId|SubZoneNameFr|SubZoneNameEn|SubZoneNameEs} [subzoneIdOrName] - Filtrer par sous-zone.
   * @property {MonsterTypeId|MonsterTypeNameFr|MonsterTypeNameEn|MonsterTypeNameEs} [monsterTypeIdOrName] - Filtrer par type de monstre.
   * @property {string} [api_key] - Clé API alternative pour cette requête (défaut : clé du client).
   */

  /**
   * @typedef {object} MonsterTradeOptions
   * @property {number|null} [trade_offer] - Quantité à proposer (0 à `owned`). `null` = calcul automatique.
   * @property {number|null} [trade_want] - Quantité recherchée (0 à 30). `null` = calcul automatique.
   */

  /**
   * @param {ClientOptions} options
   */
  constructor(options = {}) {
    if (!nodeComfort.isString(options?.api_key)) {
      throw new Error("`api_key` parameter must be a non-empty string");
    }

    this.#api_key = options.api_key;
  }

  #cid(payload) {
    if (nodeComfort.isArray(payload)) {
      return payload.map(item => this.#cid(item));
    }

    if (nodeComfort.isObject(payload)) {
      const out = {};

      for (const k in payload) {
        if (k === "id" && nodeComfort.isString(payload[k]) && /^\d+$/.test(payload[k])) {
          out[k] = Number(payload[k]);
        } else {
          out[k] = this.#cid(payload[k]);
        }
      }

      return out;
    }

    return payload;
  }
  #normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  #matchI18nName(entry, value) {
    const q = this.#normalize(value);

    return (
      this.#normalize(entry?.name?.fr) === q ||
      this.#normalize(entry?.name?.en) === q ||
      this.#normalize(entry?.name?.es) === q
    );
  }
  #gameVersionByName(game_name) {
    const q = this.#normalize(game_name);
    return this.cache.game_versions.find(x => this.#normalize(x.name) === q);
  }
  #monsterTypeByName(monster_type_name) {
    return this.cache.monster_types.find(x => this.#matchI18nName(x, monster_type_name));
  }
  #monsterByName(monster_name) {
    return this.cache.monsters.find(x => this.#matchI18nName(x, monster_name));
  }
  #serverByName(server_name) {
    const q = this.#normalize(server_name);
    return this.cache.servers.find(x => this.#normalize(x.name) === q);
  }
  #subZoneByName(subzone_name) {
    return this.cache.subzones.find(x => this.#matchI18nName(x, subzone_name));
  }
  #zoneByName(zone_name) {
    return this.cache.zones.find(x => this.#matchI18nName(x, zone_name));
  }
  #resolveMonsterId(value) {
    const monster =
      typeof value === "number"
        ? this.cache.monsters.find(x => x.id === value)
        : this.#monsterByName(value);

    if (!monster) {
      throw new Error(`Unknown monster: ${value}`);
    }

    return monster.id;
  }
  #resolveMonsterTypeId(value) {
    const type =
      typeof value === "number"
        ? this.cache.monster_types.find(x => x.id === value)
        : this.#monsterTypeByName(value);

    if (!type) {
      throw new Error(`Unknown monster type: ${value}`);
    }

    return type.id;
  }
  #resolveZoneId(value) {
    const zone =
      typeof value === "number"
        ? this.cache.zones.find(x => x.id === value)
        : this.#zoneByName(value);

    if (!zone) {
      throw new Error(`Unknown zone: ${value}`);
    }

    return zone.id;
  }
  #resolveSubZone(value) {
    const subzone =
      typeof value === "number"
        ? this.cache.subzones.find(x => x.id === value)
        : this.#subZoneByName(value);

    if (!subzone) {
      throw new Error(`Unknown subzone: ${value}`);
    }

    return subzone;
  }
  #buildQuery(params = {}) {
    const qs = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return qs.length ? `?${qs.join("&")}` : "";
  }
  /**
   * Effectue une requête HTTP authentifiée vers l'API Metamob et normalise la réponse.
   *
   * @param {string} path - Chemin relatif à la base de l'API (doit commencer par `/`).
   * @param {object} [init]
   * @param {string} [init.apiKey] - Clé API à utiliser pour cette requête (défaut : celle du client).
   * @param {"GET"|"PATCH"|"POST"|"PUT"|"DELETE"} [init.method] - Méthode HTTP (défaut : `GET`).
   * @param {object} [init.body] - Corps JSON à envoyer (pour `PATCH`/`POST`/`PUT`).
   * @returns {Promise<object>}
   */
  async #req(path, { apiKey, method = "GET", body } = {}) {
    try {
      const requestInit = {
        method,
        headers: {
          Authorization: `Bearer ${apiKey ?? this.#api_key}`,
        },
      };

      if (body !== undefined) {
        requestInit.headers["Content-Type"] = "application/json";
        requestInit.body = JSON.stringify(body);
      }

      const response = await fetch(`${base}${path}`, requestInit);

      const result = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      };

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        result.retryAfter = retryAfter ? Number(retryAfter) : undefined;
      }

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        const errorBody = await response.text();

        return {
          ...result,
          ok: false,
          error: errorBody || "An unknown error occurred",
        };
      }

      if (contentType.includes("application/json")) {
        const payload = await response.json();

        return {
          ...result,
          ...this.#cid(payload),
        };
      }

      return {
        ...result,
        data: await response.text(),
      };
    } catch (e) {
      return {
        ok: false,
        status: 500,
        statusText: "@ix-xs/metamob.api Error",
        error: e?.message ?? String(e),
      };
    }
  }

  /**
   * ### Versions du jeu

   * @overload
   * @returns {Promise<BaseResult & { data: Array<GameVersion> }>}

   * @overload
   * @param {GameVersionsOptions & { idOrName: GameVersionId|GameVersionName }} options
   * @returns {Promise<BaseResult & { data: GameVersion }>}

   * @param {GameVersionsOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<GameVersion>|GameVersion }>}
   * @example
   * // Toutes les versions du jeu
   * const { data } = await client.getGameVersions();
   * // Une version précise (par id ou par nom)
   * const unity = await client.getGameVersions({ idOrName: "Dofus (Unity)" });
   */
  async getGameVersions(options = {}) {
    if (nodeComfort.isUndefined(options?.idOrName)) {
      return await this.#req("/game-versions", { apiKey: options.api_key });
    }

    const idOrName = options.idOrName;
    const game =
      typeof idOrName === "number"
        ? this.cache.game_versions.find(x => x.id === idOrName)
        : this.cache.game_versions.find(x => this.#normalize(x.name) === this.#normalize(idOrName));

    if (!game) {
      throw new Error(`Unknown game version: ${idOrName}`);
    }

    return await this.#req(`/game-versions/${game.id}`, { apiKey: options.api_key });
  }

  /**
   * ### Types de monstres

   * @overload
   * @returns {Promise<BaseResult & { data: Array<MonsterType> }>}

   * @overload
   * @param {MonsterTypesOptions & { idOrName: MonsterTypeId|MonsterTypeNameFr|MonsterTypeNameEn|MonsterTypeNameEs }} options
   * @returns {Promise<BaseResult & { data: MonsterType }>}

   * @param {MonsterTypesOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<MonsterType>|MonsterType }>}
   * @example
   * const types = await client.getMonsterTypes();
   * // Par id (1/2/3) ou par nom fr/en/es ("boss", "archimonstre"…)
   * const boss = await client.getMonsterTypes({ idOrName: "boss" });
   */
  async getMonsterTypes(options = {}) {
    if (nodeComfort.isUndefined(options?.idOrName)) {
      return await this.#req("/monster-types", { apiKey: options.api_key });
    }

    const idOrName = options.idOrName;
    const type =
      typeof idOrName === "number"
        ? this.cache.monster_types.find(x => x.id === idOrName)
        : this.cache.monster_types.find(x => this.#matchI18nName(x, idOrName));

    if (!type) {
      throw new Error(`Unknown monster type: ${idOrName}`);
    }

    return await this.#req(`/monster-types/${type.id}`, { apiKey: options.api_key });
  }

  /**
   * ### Zones

   * @overload
   * @returns {Promise<BaseResult & { data: Array<Zone> }>}

   * @overload
   * @param {ZonesOptions & { idOrName: ZoneId|ZoneNameFr|ZoneNameEn|ZoneNameEs }} options
   * @returns {Promise<BaseResult & { data: Zone }>}

   * @overload
   * @param {ZonesOptions & { query: string }} options
   * @returns {Promise<BaseResult & { data: Array<Zone> }>}

   * @param {ZonesOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<Zone>|Zone }>}
   * @example
   * const zones = await client.getZones();                        // liste complète
   * const amakna = await client.getZones({ idOrName: "Amakna" }); // détail + sous-zones
   * const found = await client.getZones({ query: "ama" });        // recherche (≥ 3 caractères)
   */
  async getZones(options = {}) {
    const hasIdOrName = !nodeComfort.isUndefined(options?.idOrName);
    const hasQuery = !nodeComfort.isUndefined(options?.query);

    if (hasIdOrName && hasQuery) {
      throw new Error("`options.idOrName` and `options.query` cannot be used together");
    }

    if (!hasIdOrName && !hasQuery) {
      return await this.#req("/zones", { apiKey: options.api_key });
    }

    if (hasIdOrName) {
      const idOrName = options.idOrName;
      const zone =
        typeof idOrName === "number"
          ? this.cache.zones.find(x => x.id === idOrName)
          : this.cache.zones.find(x => this.#matchI18nName(x, idOrName));

      if (!zone) {
        throw new Error(`Unknown zone: ${idOrName}`);
      }

      return await this.#req(`/zones/${zone.id}`, { apiKey: options.api_key });
    }

    if (!nodeComfort.isString(options.query) || options.query.trim().length < 3) {
      throw new Error("`query` parameter must be a non-empty string with at least 3 characters");
    }

    return await this.#req(`/zones${this.#buildQuery({
      q: options.query.trim(),
    })}`, { apiKey: options.api_key });
  }

  /**
 * ### Sous-zones

 * @overload
 * @param {SubZonesOptions & { idOrName: SubZoneId|SubZoneNameFr|SubZoneNameEn|SubZoneNameEs }} options
 * @returns {Promise<BaseResult & { data: SubZone }>}

 * @overload
 * @param {SubZonesOptions & { zoneIdOrName: ZoneId|ZoneNameFr|ZoneNameEn|ZoneNameEs }} options
 * @returns {Promise<BaseResult & { data: Array<SubZone> }>}

 * @param {SubZonesOptions} [options]
 * @returns {Promise<BaseResult & { data: Array<SubZone> | SubZone }>}
 * @example
 * // Sous-zones d'une zone (zoneIdOrName requis)
 * const subs = await client.getSubZones({ zoneIdOrName: "Amakna" });
 * // Recherche dans une zone
 * const found = await client.getSubZones({ zoneIdOrName: 1, query: "plaine" });
 * // Détail d'une sous-zone (zone parente déduite du cache)
 * const one = await client.getSubZones({ idOrName: "Cimetière" });
 */
  async getSubZones(options = {}) {
    const hasIdOrName = !nodeComfort.isUndefined(options?.idOrName);
    const hasQuery = !nodeComfort.isUndefined(options?.query);
    const hasZoneIdOrName = !nodeComfort.isUndefined(options?.zoneIdOrName);

    if (hasIdOrName && (hasQuery || hasZoneIdOrName)) {
      throw new Error("`options.idOrName` cannot be used together with `options.query` or `options.zoneIdOrName`");
    }

    if (!hasIdOrName && !hasZoneIdOrName) {
      throw new Error("`options.zoneIdOrName` is required unless `options.idOrName` is provided");
    }

    if (hasIdOrName) {
      const value = options.idOrName;
      const subzone =
      typeof value === "number"
        ? this.cache.subzones.find(x => x.id === value)
        : this.#subZoneByName(value);

      if (!subzone) {
        throw new Error(`Unknown subzone: ${value}`);
      }

      const zoneId = nodeComfort.isObject(subzone.zone) ? subzone.zone.id : subzone.zone;

      if (!zoneId) {
        throw new Error(`Missing zone for subzone: ${value}`);
      }

      return await this.#req(`/zones/${zoneId}/subzones/${subzone.id}`, { apiKey: options.api_key });
    }

    if (hasQuery) {
      if (!nodeComfort.isString(options.query) || options.query.trim().length < 3) {
        throw new Error("`query` parameter must be a non-empty string with at least 3 characters");
      }
    }

    const zoneValue = options.zoneIdOrName;
    const zone =
    typeof zoneValue === "number"
      ? this.cache.zones.find(x => x.id === zoneValue)
      : this.#zoneByName(zoneValue);

    if (!zone) {
      throw new Error(`Unknown zoneIdOrName: ${zoneValue}`);
    }

    return await this.#req(`/zones/${zone.id}/subzones${this.#buildQuery({
      q: options.query?.trim(),
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Monstres

   * @overload
   * @returns {Promise<BaseResult & { data: Array<BaseMonster> } & Pagination>}

   * @overload
   * @param {MonstersOptions & { idOrName: MonsterId|MonsterNameFr|MonsterNameEn|MonsterNameEs }} options
   * @returns {Promise<BaseResult & { data: BaseMonster & MonsterDetail }>}

   * @overload
   * @param {MonstersOptions} options
   * @returns {Promise<BaseResult & { data: Array<BaseMonster> } & Pagination>}

   * @param {MonstersOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<BaseMonster>|(BaseMonster & MonsterDetail) } & Partial<Pagination>>}
   * @example
   * // Détail d'un monstre par id ou par nom (fr/en/es)
   * const tofu = await client.getMonsters({ idOrName: "Tofu" });
   * // Liste paginée + filtre par type
   * const archis = await client.getMonsters({ query: "tofu", typeIdOrName: "archimonstre", limit: 20 });
   * console.log(archis.pagination); // { total, limit, offset }
   */
  async getMonsters(options = {}) {
    const hasIdOrName = !nodeComfort.isUndefined(options?.idOrName);

    if (hasIdOrName) {
      const idOrName = options.idOrName;
      const monster =
        typeof idOrName === "number"
          ? this.cache.monsters.find(x => x.id === idOrName)
          : this.#monsterByName(idOrName);

      if (!monster) {
        throw new Error(`Unknown monster: ${idOrName}`);
      }

      return await this.#req(`/monsters/${monster.id}`, { apiKey: options.api_key });
    }

    if (options.query != null) {
      if (!nodeComfort.isString(options.query) || options.query.trim().length < 3) {
        throw new Error("`query` parameter must be a non-empty string with at least 3 characters");
      }
    }

    let typeId;

    if (options.typeIdOrName != null) {
      const type =
        typeof options.typeIdOrName === "number"
          ? this.cache.monster_types.find(x => x.id === options.typeIdOrName)
          : this.#monsterTypeByName(options.typeIdOrName);

      if (!type) {
        throw new Error(`Unknown typeIdOrName: ${options.typeIdOrName}`);
      }

      typeId = type.id;
    }

    return await this.#req(`/monsters${this.#buildQuery({
      q: options.query?.trim(),
      type: typeId,
      limit: options.limit,
      offset: options.offset,
    })}`, { apiKey: options.api_key });
  }

  /**
  * ### Modèles de quête

  * @overload
  * @returns {Promise<BaseResult & { data: Array<BaseQuestTemplate & QuestTemplateList> }>}

  * @overload
  * @param {QuestTemplatesOptions & { id: QuestTemplateId }} options
  * @returns {Promise<BaseResult & { data: BaseQuestTemplate & QuestTemplateDetail }>}

  * @param {QuestTemplatesOptions} [options]
  * @returns {Promise<BaseResult & {data: Array<BaseQuestTemplate & QuestTemplateList> | (BaseQuestTemplate & QuestTemplateDetail)}>}
  * @example
  * const templates = await client.getQuestTemplates();
  * // Détail d'un modèle avec ses monstres, filtré par étape
  * const step15 = await client.getQuestTemplates({ id: 1, step: 15, limit: 50 });
  */
  async getQuestTemplates(options = {}) {
    const hasId = !nodeComfort.isUndefined(options?.id);

    if (!hasId) {
      return await this.#req("/quest-templates", { apiKey: options.api_key });
    }

    const template = this.cache.quest_templates.find(x => x.id === options.id) ?? null;

    if (!template) {
      throw new Error(`Unknown quest template id: ${options.id}`);
    }

    return await this.#req(`/quest-templates/${template.id}${this.#buildQuery({
      step: options.step,
      limit: options.limit,
      offset: options.offset,
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Serveurs

   * @overload
   * @returns {Promise<BaseResult & { data: Array<Server> }>}

   * @overload
   * @param {ServersOptions & { idOrName: ServerId|ServerName }} options
   * @returns {Promise<BaseResult & { data: Server }>}

   * @param {ServersOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<Server>|Server }>}
   * @example
   * const servers = await client.getServers();
   * const draconiros = await client.getServers({ idOrName: "Draconiros" });
   */
  async getServers(options = {}) {
    if (nodeComfort.isUndefined(options?.idOrName)) {
      return await this.#req("/servers", { apiKey: options.api_key });
    }

    const idOrName = options.idOrName;
    const server =
      typeof idOrName === "number"
        ? this.cache.servers.find(x => x.id === idOrName)
        : this.#serverByName(idOrName);

    if (!server) {
      throw new Error(`Unknown server: ${idOrName}`);
    }

    return await this.#req(`/servers/${server.id}`, { apiKey: options.api_key });
  }

  /**
   * ### Événements Kralamoure

   * @overload
   * @returns {Promise<BaseResult & { data: Array<BaseKralove & KraloveList> }>}

   * @overload
   * @param {KralovesOptions & { id: KraloveId }} options
   * @returns {Promise<BaseResult & { data: BaseKralove & KraloveDetail }>}

   * @overload
   * @param {KralovesOptions} options
   * @returns {Promise<BaseResult & { data: Array<BaseKralove & KraloveList> }>}

   * @param {KralovesOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<BaseKralove & KraloveList>|(BaseKralove & KraloveDetail) }>}
   * @example
   * // Liste (filtrable par serveur et date de début)
   * const events = await client.getKraloves({ serverIdOrName: "Draconiros", from: "2026-07-01" });
   * // Détail d'un évènement (participants + messages)
   * const detail = await client.getKraloves({ id: 42 });
   */
  async getKraloves(options = {}) {
    if (!nodeComfort.isUndefined(options?.id)) {
      const id = options.id;

      if (!(nodeComfort.isString(id) || typeof id === "number")) {
        throw new Error("`options.id` parameter must be a non-empty string or a number");
      }

      return await this.#req(`/kralove/${id}`, { apiKey: options.api_key });
    }

    let serverId;

    if (options.serverIdOrName != null) {
      const server =
        typeof options.serverIdOrName === "number"
          ? this.cache.servers.find(x => x.id === options.serverIdOrName)
          : this.#serverByName(options.serverIdOrName);

      if (!server) {
        throw new Error(`Unknown serverIdOrName: ${options.serverIdOrName}`);
      }

      serverId = server.id;
    }

    return await this.#req(`/kralove${this.#buildQuery({
      server: serverId,
      from: options.from,
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Utilisateurs (recherche)

   * @param {string} query
   * @param {SearchUsersOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<BaseUser>, pagination: Pagination }>}
   * @example
   * const { data, pagination } = await client.searchUsers("player", {
   *   serverIdOrName: "Draconiros",
   *   active_within_days: 30,
   *   limit: 50,
   * });
   */
  async searchUsers(query, options = {}) {
    if (!nodeComfort.isString(query) || query.trim().length < 3) {
      throw new Error("`query` parameter must be a non-empty string with at least 3 characters");
    }

    let serverId;

    if (options.serverIdOrName != null) {
      const server =
        typeof options.serverIdOrName === "number"
          ? this.cache.servers.find(x => x.id === options.serverIdOrName)
          : this.#serverByName(options.serverIdOrName);

      if (!server) {
        throw new Error(`Unknown serverIdOrName: ${options.serverIdOrName}`);
      }

      serverId = server.id;
    }

    return await this.#req(`/users/search${this.#buildQuery({
      q: query.trim(),
      server_id: serverId,
      active_within_days: options.active_within_days,
      limit: options.limit,
      offset: options.offset,
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Utilisateur

   * @param {Username} username
   * @param {RequestOptions} [options]
   * @returns {Promise<BaseResult & { data: BaseUser & UserDetail }>}
   * @example
   * const profile = await client.getUser("player1");
   * if (profile.ok) console.log(profile.data.bio, profile.data.quests);
   */
  async getUser(username, options = {}) {
    if (!nodeComfort.isString(username)) {
      throw new Error("`username` parameter must be a non-empty string");
    }

    return await this.#req(`/users/${encodeURIComponent(username)}`, { apiKey: options.api_key });
  }

  /**
  * ### Quêtes utilisateur

  * @overload
  * @param {Username} username
  * @returns {Promise<BaseResult & { data: Array<UserQuestListItem> }>}

  * @overload
  * @param {Username} username
  * @param {UserQuestsOptions & { slug: string }} options
  * @returns {Promise<BaseResult & { data: UserQuestDetail }>}

  * @param {Username} username
  * @param {UserQuestsOptions} [options]
  * @returns {Promise<BaseResult & { data: Array<UserQuestListItem> | UserQuestDetail }>}
  * @example
  * // Liste des quêtes publiques d'un joueur
  * const quests = await client.getUserQuests("player1");
  * // Détail d'une quête : monstres recherchés, première page
  * const detail = await client.getUserQuests("player1", { slug: "a1b2c3d4", status: "wanted", limit: 50 });
  */
  async getUserQuests(username, options = {}) {
    if (!nodeComfort.isString(username)) {
      throw new Error("username parameter must be a non-empty string");
    }

    const hasSlug = !nodeComfort.isUndefined(options?.slug);

    if (!hasSlug) {
      if (
        options.monsterTypeIdOrName != null ||
      options.status != null ||
      options.step != null ||
      options.limit != null ||
      options.offset != null
      ) {
        throw new Error("`monsterTypeIdOrName`, `status`, `step`, `limit` and `offset` can only be used when `options.slug` is provided");
      }

      return await this.#req(`/users/${encodeURIComponent(username)}/quests`, { apiKey: options.api_key });
    }

    if (!nodeComfort.isString(options.slug)) {
      throw new Error("`options.slug` parameter must be a non-empty string");
    }

    let monsterTypeId;

    if (options.monsterTypeIdOrName != null) {
      const type =
      typeof options.monsterTypeIdOrName === "number"
        ? this.cache.monster_types.find(x => x.id === options.monsterTypeIdOrName)
        : this.#monsterTypeByName(options.monsterTypeIdOrName);

      if (!type) {
        throw new Error(`Unknown monsterTypeIdOrName: ${options.monsterTypeIdOrName}`);
      }

      monsterTypeId = type.id;
    }

    return await this.#req(
      `/users/${encodeURIComponent(username)}/quests/${encodeURIComponent(options.slug)}${this.#buildQuery({
        monster_type: monsterTypeId,
        status: options.status,
        step: options.step,
        limit: options.limit,
        offset: options.offset,
      })}`,
      { apiKey: options.api_key },
    );
  }

  /**
   * ### Conversations
   *
   * Liste les conversations de l'utilisateur authentifié. Par défaut, utilise la clé API du
   * client ; passez `options.api_key` pour interroger les conversations d'un autre utilisateur.
   *
   * @param {ConversationsOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<Conversation>, pagination: Pagination }>}
   * @example
   * // Conversations du compte lié à la clé du client
   * const convos = await client.getConversations({ status: "active" });
   * // Ou pour un autre utilisateur, via sa propre clé
   * const other = await client.getConversations({ api_key: OTHER_USER_KEY });
   */
  async getConversations(options = {}) {
    if (options.status != null && !["active", "archived"].includes(options.status)) {
      throw new Error("`status` parameter must be active or archived");
    }

    return await this.#req(`/conversations${this.#buildQuery({
      status: options.status,
      limit: options.limit,
      offset: options.offset,
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Messages d'une conversation
   *
   * Retourne les messages échangés avec `username`. Par défaut, utilise la clé API du client ;
   * passez `options.api_key` pour lire la conversation depuis le compte d'un autre utilisateur.
   *
   * @param {Username} username - Interlocuteur.
   * @param {MessagesOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<ConversationItem>, pagination: CursorPagination }>}
   * @example
   * // Page la plus récente
   * const first = await client.getMessages("player1", { limit: 30 });
   * // Page suivante (plus ancienne) via le curseur
   * if (first.pagination.has_more) {
   *   const next = await client.getMessages("player1", { before_id: first.pagination.next_before_id });
   * }
   */
  async getMessages(username, options = {}) {
    if (!nodeComfort.isString(username)) {
      throw new Error("`username` parameter must be a non-empty string");
    }

    return await this.#req(`/conversations/${encodeURIComponent(username)}${this.#buildQuery({
      limit: options.limit,
      before_id: options.before_id,
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Monstres d'une sous-zone
   *
   * Liste tous les monstres pouvant être trouvés dans une sous-zone. La zone parente
   * est déduite automatiquement du cache.
   *
   * @param {SubZoneId|SubZoneNameFr|SubZoneNameEn|SubZoneNameEs} subzoneIdOrName - Id ou nom de la sous-zone.
   * @param {RequestOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<BaseMonster> }>}
   * @example
   * const monsters = await client.getSubZoneMonsters("Cimetière");
   */
  async getSubZoneMonsters(subzoneIdOrName, options = {}) {
    if (nodeComfort.isUndefined(subzoneIdOrName)) {
      throw new Error("`subzoneIdOrName` parameter is required");
    }

    const subzone = this.#resolveSubZone(subzoneIdOrName);
    const zoneId = nodeComfort.isObject(subzone.zone) ? subzone.zone.id : subzone.zone;

    if (!zoneId) {
      throw new Error(`Missing zone for subzone: ${subzoneIdOrName}`);
    }

    return await this.#req(`/zones/${zoneId}/subzones/${subzone.id}/monsters`, { apiKey: options.api_key });
  }

  /**
   * ### Modifier les paramètres d'une quête
   *
   * Met à jour un ou plusieurs paramètres de **votre** quête. Tous les champs sont optionnels.
   *
   * La réponse n'écho que les champs modifiés (voir {@link QuestUpdateResult}) ; les flags `never_*`
   * y reviennent regroupés sous `type_filters`.
   *
   * @param {QuestSlug} slug - Slug de la quête.
   * @param {QuestUpdate} changes - Champs à modifier.
   * @param {RequestOptions} [options]
   * @returns {Promise<BaseResult & { data: QuestUpdateResult }>}
   * @example
   * const res = await client.updateQuest("a1b2c3d4", {
   *   current_step: 12,
   *   show_trades: true,
   *   trade_mode: 1, // mode expert
   * });
   * // res.data ne contient que les champs modifiés (voir QuestUpdateResult)
   */
  async updateQuest(slug, changes, options = {}) {
    if (!nodeComfort.isString(slug)) {
      throw new Error("`slug` parameter must be a non-empty string");
    }

    if (!nodeComfort.isObject(changes) || Object.keys(changes).length === 0) {
      throw new Error("`changes` parameter must be a non-empty object");
    }

    return await this.#req(`/quests/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      body: changes,
      apiKey: options.api_key,
    });
  }

  /**
   * ### Modifier la quantité d'un monstre dans une quête
   *
   * @param {QuestSlug} slug - Slug de la quête.
   * @param {MonsterId|MonsterNameFr|MonsterNameEn|MonsterNameEs} monsterIdOrName - Id ou nom du monstre.
   * @param {number} quantity - Quantité possédée (0 à 30).
   * @param {RequestOptions} [options]
   * @returns {Promise<BaseResult & { data: QuestMonsterQuantityResult }>}
   * @example
   * // Par id ou par nom (fr/en/es)
   * await client.updateQuestMonster("a1b2c3d4", "Bouftou", 5);
   */
  async updateQuestMonster(slug, monsterIdOrName, quantity, options = {}) {
    if (!nodeComfort.isString(slug)) {
      throw new Error("`slug` parameter must be a non-empty string");
    }

    if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
      throw new Error("`quantity` parameter must be a number");
    }

    const monsterId = this.#resolveMonsterId(monsterIdOrName);

    return await this.#req(`/quests/${encodeURIComponent(slug)}/monsters/${monsterId}`, {
      method: "PATCH",
      body: { quantity },
      apiKey: options.api_key,
    });
  }

  /**
   * ### Modifier plusieurs monstres d'une quête en une requête
   *
   * @param {QuestSlug} slug - Slug de la quête.
   * @param {Array<QuestMonsterQuantityInput>} monsters - Liste `{ monster, quantity }` (max 200).
   * @param {RequestOptions} [options]
   * @returns {Promise<BaseResult & { data: QuestMonstersBatchResult }>}
   * @example
   * await client.updateQuestMonsters("a1b2c3d4", [
   *   { monster: "Tofu", quantity: 3 }, // nom
   *   { monster: 456, quantity: 0 },    // ou id
   * ]);
   */
  async updateQuestMonsters(slug, monsters, options = {}) {
    if (!nodeComfort.isString(slug)) {
      throw new Error("`slug` parameter must be a non-empty string");
    }

    if (!nodeComfort.isArray(monsters) || monsters.length === 0) {
      throw new Error("`monsters` parameter must be a non-empty array");
    }

    if (monsters.length > 200) {
      throw new Error("`monsters` parameter cannot contain more than 200 items");
    }

    const body = {
      monsters: monsters.map(entry => {
        if (!nodeComfort.isObject(entry) || typeof entry.quantity !== "number") {
          throw new Error("each monster entry must be an object with a numeric `quantity`");
        }

        return {
          monster_id: this.#resolveMonsterId(entry.monster ?? entry.monster_id),
          quantity: entry.quantity,
        };
      }),
    };

    return await this.#req(`/quests/${encodeURIComponent(slug)}/monsters`, {
      method: "PATCH",
      body,
      apiKey: options.api_key,
    });
  }

  /**
   * ### Paramètres de trade manuels d'un monstre
   *
   * Force les quantités proposées et recherchées pour un monstre, au lieu du calcul automatique.
   *
   * @param {QuestSlug} slug - Slug de la quête.
   * @param {MonsterId|MonsterNameFr|MonsterNameEn|MonsterNameEs} monsterIdOrName - Id ou nom du monstre.
   * @param {MonsterTradeOptions} trade - Quantités `trade_offer` / `trade_want` (`null` = calcul automatique).
   * @param {RequestOptions} [options]
   * @returns {Promise<BaseResult & { data: QuestMonsterTradeResult }>}
   * @example
   * // Forcer l'offre à 1, laisser la demande en calcul automatique
   * await client.setQuestMonsterTrade("a1b2c3d4", 123, { trade_offer: 1, trade_want: null });
   */
  async setQuestMonsterTrade(slug, monsterIdOrName, trade = {}, options = {}) {
    if (!nodeComfort.isString(slug)) {
      throw new Error("`slug` parameter must be a non-empty string");
    }

    if (!nodeComfort.isObject(trade) || (trade.trade_offer === undefined && trade.trade_want === undefined)) {
      throw new Error("`trade` parameter must define `trade_offer` and/or `trade_want`");
    }

    const monsterId = this.#resolveMonsterId(monsterIdOrName);
    const body = {};

    if (trade.trade_offer !== undefined) {
      body.trade_offer = trade.trade_offer;
    }

    if (trade.trade_want !== undefined) {
      body.trade_want = trade.trade_want;
    }

    return await this.#req(`/quests/${encodeURIComponent(slug)}/monsters/${monsterId}/trade`, {
      method: "PATCH",
      body,
      apiKey: options.api_key,
    });
  }

  /**
   * ### Partenaires d'échange potentiels
   *
   * Retourne les meilleurs partenaires d'échange pour **votre** quête, classés comme
   * l'option « Meilleur matching » de la page Communauté.
   *
   * @param {QuestSlug} slug - Slug de la quête.
   * @param {QuestMatchesOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<QuestMatch>, pagination: Pagination }>}
   * @example
   * const { data, pagination } = await client.getQuestMatches("a1b2c3d4", {
   *   limit: 10,
   *   only_possible_trades: true,
   * });
   */
  async getQuestMatches(slug, options = {}) {
    if (!nodeComfort.isString(slug)) {
      throw new Error("`slug` parameter must be a non-empty string");
    }

    return await this.#req(`/quests/${encodeURIComponent(slug)}/matches${this.#buildQuery({
      limit: options.limit,
      offset: options.offset,
      min_parallel_quests: options.min_parallel_quests,
      only_possible_trades: options.only_possible_trades === undefined
        ? undefined
        : Number(Boolean(options.only_possible_trades)),
    })}`, { apiKey: options.api_key });
  }

  /**
   * ### Progression d'une quête par zones
   *
   * Retourne l'avancement de **votre** quête organisé par zones et sous-zones.
   *
   * @param {QuestSlug} slug - Slug de la quête.
   * @param {QuestZonesOptions} [options]
   * @returns {Promise<BaseResult & { data: Array<QuestZoneProgress> }>}
   * @example
   * // Progression, filtrée par type de monstre (id ou nom)
   * const progress = await client.getQuestZones("a1b2c3d4", { monsterTypeIdOrName: "archimonstre" });
   */
  async getQuestZones(slug, options = {}) {
    if (!nodeComfort.isString(slug)) {
      throw new Error("`slug` parameter must be a non-empty string");
    }

    const zone_id = options.zoneIdOrName === undefined
      ? undefined
      : this.#resolveZoneId(options.zoneIdOrName);
    const subzone_id = options.subzoneIdOrName === undefined
      ? undefined
      : this.#resolveSubZone(options.subzoneIdOrName).id;
    const monster_type_id = options.monsterTypeIdOrName === undefined
      ? undefined
      : this.#resolveMonsterTypeId(options.monsterTypeIdOrName);

    return await this.#req(`/quests/${encodeURIComponent(slug)}/zones${this.#buildQuery({
      zone_id,
      subzone_id,
      monster_type_id,
    })}`, { apiKey: options.api_key });
  }
};
