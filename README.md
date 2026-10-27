# Maths Quest — L’Académie des Nombres

Version publiée : **0.3.29**.

[Jouer à Maths Quest](https://offsidealex.github.io/Maths-Quest/)

## Le prototype actuel

Le héros suit un parcours dans l’Académie. Chaque défi propose dix questions ; il faut au moins huit bonnes réponses pour poursuivre.

- Tables de multiplication : 10 secondes par question.
- Additions de relatifs : 10 secondes par question.
- Fractions équivalentes : numérateur manquant, 30 secondes par question.

Les réussites sont mémorisées dans le navigateur. Un défi déjà validé peut être rejoué ou passé. Après les trois défis, le héros contourne le muret, rejoint le pont et une transition animée montre la grande porte du niveau 2 qui s’ouvre devant lui. Les exercices du niveau 2 restent à intégrer.

## Utilisation hors ligne

Télécharger et extraire [le dépôt complet](https://github.com/Offsidealex/Maths-Quest/archive/refs/heads/main.zip), puis ouvrir `index.html`. Conserver le dossier `assets/` à côté de ce fichier. Le jeu n’a aucune dépendance réseau et ne nécessite aucune installation.

La version HTML autonome et les archives des versions précédentes sont conservées localement par le propriétaire. Le dépôt contient uniquement la version publiée actuelle.

## Organisation

- `index.html` : interface, styles et logique du jeu.
- `assets/` : décors et poses du personnage.
- `sources/` : générateurs et données de référence, avec la licence d’origine d’Activités mentales.
- `docs/INTEGRATION.md` : provenance des exercices intégrés.
- `docs/GAME_DESIGN.md` : feuille de route initiale ; elle décrit des évolutions futures, pas toutes les fonctions du prototype actuel.

Les exercices sont adaptés du dépôt [Activités mentales](https://github.com/Offsidealex/Activites_mentales), d’Alexis RUIZ — Lycée Denis Diderot, Belfort. Voir `sources/Activites-mentales-LICENSE.txt` pour la licence de cette source.
