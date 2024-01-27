<div align=center>
<span style="font-size:30px;">@ix-xs/metamob.api</span><br>
<br>
</div>

<img align=right src="https://metamob.fr/img/otomai.png">
<h1><img src="https://metamob.fr/img/logo.png">Metamob</h1>
<a href="https://metamob.fr/connexion">Connectez-vous</a> ou <a href="https://metamob.fr/inscription">Inscrivez-vous</a> pour profiter des avantages du site :
    <ul>
        <li>Suivez votre avancement dans la quête</li>
        <li>Gérez finement vos monstres</li>
        <li>Visualisez votre profil</li>
        <li>Echangez avec d'autres joueurs</li>
        <li>Une question ? Regardez <a href="https://metamob.fr/aide">l'aide</a></li>
      </ul>
<br>
<br>
<h1>🌐API</h1>
Une clé API sert à interroger les données de Metamob pour pouvoir les utiliser ailleurs: dans une feuille Google Sheets, sur une application web, dans un bot Discord...
<br><br>
Vous trouverez plus d'informations dans <a href="https://metamob.fr/aide/api">la page d'aide</a>.
<br><br>
<span style="background-color: DarkRed;">Utiliser une clé API requiert des connaissances en développement. Si vous ne savez pas ce qu'est une API ni comment l'utiliser, ce n'est pas la peine de créer une clé.<br>
Les clés API sont automatiquement supprimées au bout de 90 jours sans utilisation.</span>
<br>
<br>
<h3> 🗝️Récupérer une clé </h3>
Pour créer votre clé, rendez-vous dans <a href="https://metamob.fr/utilisateur/mon_profil">votre espace</a> et cliquez sur l'onglet "API".
Vous devrez saisir un nom. Gardez à l'esprit que vous ne pouvez créer qu'une seule clé API pour l'instant.<br>
<b>Votre clé sera immédiatement utilisable.</b>
<br>
<h2>✨Installation</h2>

`npm install @ix-xs/metamob.api`
<br>
<h2>👀Utilisation</h2>
<h3>1. Créez un nouveau client en fournissant votre clé API Metamob :</h3>

```js
const MetamobAPI = require("@ix-xs/metamob.api");

const client = new MetamobAPI({ apiKey:"votre_clé_api" });
```

<img src="https://user-images.githubusercontent.com/114710533/234149976-268042b8-9300-4fda-92f8-fa781541abad.png">

<br>
<h3>2. Liste des appels possibles</h3>
<br>

Méthode | options | Description |
| --- | --- | --- |
| `getUser()` | `username`:string; | Récupère les informations d'un utilisateur. Non sensible à la casse. |
| `getUserMonsters()` | `username`:string;<br>{<br>`type?`:string;<br>`monstre?`:string;<br>`etape?`:string;<br>`quantite?`:string;<br>`etat?`:string;<br>} | Récupère les monstres d'un utilisateur. Le nom d'utilisateur n'est pas sensible à la casse. |
| `getMonsters()` | {<br>`monstre?`:string;<br>`etape?`:string;<br>`type?`:string;<br>} | Récupère les monstres. |
| `getServers()` | `server?`:string; | Récupère les serveurs. |
| `getKralamoures()` | {<br>`serveur?`:string;<br>`date_debut?`:string;<br>`date_fin?`:string;<br>} | Récupère les kralamoures. |
| `getZones()` | `zone?`:string; | Récupère les zones. |
| `getSouszones()` | `souszone?`:string; | Récupère les sous-zones. |
| `putUserMonsters()` | `username`:string<br>`uniqueId`:string<br>`body`:Array<{<br>`monstre`:string;<br>`quantite?`:string;<br>`etat?`:string;<br>}> | Met à jour les informations de monstre d'un compte utilisateur.<br>Le champ quantite indique l'opération à effectuer sur la quantité:<br>• Si la quantité renseigner commence par "===", la quantité du monstre sera forcée à cette valeur.<br>• Si la quantité renseigner commence par "+", la quantité du monstre sera incrémenter de cette valeur<br>• Si la quantité renseigner commence par "-", la quantité du monstre sera décrémenter de cette valeur  |
| `resetUserMonsters()` | `username`:string;<br>`uniqueId`:string; | Réinitialise les monstres sur le compte. Cela signifie que toutes les informations relatives aux monstres seront supprimées !<br>Les monstres seront mis à l'état aucun (ni recherché ni proposé), avec une quantité nulle (0). |

<br>
<h3>3. Exemples</h3>
<br>


```js
const MetamobAPI = require("@ix-xs/metamob.api");

const client = new MetamobAPI({ apiKey:"votre_clé_api" });

// Renvoie les informations de l'utilisateur
client.getUser("popop").then(console.log);

// Renvoie les monstres "proposés" dont l'utilisateur possède en + de 1 exemplaire
client.getUserMonsters("popop", { etat:"propose", quantite:">1" }).then(console.log);
 // Renvoie les monstres de l'utilisateur à l'étape 20
client.getUserMonsters("popop", { etape:"20" }).then(console.log);

// Renvoie la liste de tous les monstres
client.getMonsters().then(console.log);
// Renvoie la liste de tous les archimonstres
client.getMonsters({ type:"archimonstre" }).then(console.log);

// Renvoie la liste de tous les serveurs
client.getServers().then(console.log);
// Renvoie les informations sur le serveur "Tylezia"
client.getServers("Tylezia").then(console.log);

// Renvoie la liste des ouvertures prévues entre la date du jour et 1 mois plus tard
client.getKralamoures().then(console.log);
 // Renvoie la liste des ouvertures prévues entre la date du jour et le 01 juin 2024 sur le serveur Tylezia
client.getKralamoures({ serveur:"Tylezia", date_fin:"2023-06-01" }).then(console.log);

// Renvoie la liste de toutes les zones
client.getZones().then(console.log); 
// Renvoie les informations sur la zone Amakna
client.getZones("Amakna").then(console.log);

// Renvoie la liste de toutes les sous-zones.
client.getSouszones().then(console.log);
// Renvoie les informations sur la sous-zones Aerdala
client.getSouszones("Aerdala").then(console.log);

// La quantité du monstre Arakne sera incrémenter de 5 et passera à l'état proposé
// La quantité du monstre Larchimaide la Poussée passera à 3
// La quantité du monstre Bouftou Royal sera décrémenter de 2
client.putUserMonsters("nom_utilisateur", "id_unique_utilisateur", [
	{ monstre:"Arakne", quantite:"+5", etat:"propose" },
	{ monstre:"Larchimaide la Poussée", quantite:"===3" },
	{ monstre:"Bouftou Royal", quantite:"-2" },
]).then(console.log);

// Tous les monstres de l'utilisateur seront réinitialiser (quantite à 0 et aucun état)
client.resestUserMonsters("pseudo_utilisateur", "id_unique_utilisateur").then(console.log);
```
<br>
<br>
Contactez moi sur Discord si vous rencontrez des difficultés : ix_xs
