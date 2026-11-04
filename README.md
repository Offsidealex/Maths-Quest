# Maths Quest 🏰

**Maths Quest** est un jeu de rôle éducatif (RPG) en 2D qui transforme les exercices de mathématiques en aventures. L'élève explore des décors fantastiques, déplace son personnage, découvre des lieux, relève des défis et progresse en réussissant des épreuves.

🎮 **[Version publique](https://offsidealex.github.io/Maths-Quest/)**  
🧪 **[Version de test](https://offsidealex.github.io/Maths-Quest/test/)**  
🔗 **[Code source sur GitHub](https://github.com/Offsidealex/Maths-Quest)**

> Version actuelle : **0.3.47** — projet en développement. Les deux adresses utilisent GitHub Pages. Pour activer cette publication automatisée, choisir **GitHub Actions** dans *Settings → Pages → Build and deployment → Source*.

## Le principe du jeu

Au lieu d'enchaîner des exercices sur une page classique, le joueur avance dans un univers médiéval-fantastique. Il se déplace sur une carte, rejoint des points d'intérêt et ouvre des épreuves présentées comme des quêtes sur des parchemins. Chaque réussite contribue à sa progression et lui permet de poursuivre son aventure.

Les défis sont tirés des véritables modules pédagogiques d'[Activités mentales](https://github.com/Offsidealex/Activites_mentales), et non de questions fictives.

## Les mondes

- **Niveau 1 — Le Village des Savoirs :** découverte des déplacements et des premières épreuves, notamment les tables de multiplication, les additions de nombres relatifs et les fractions équivalentes.
- **Niveau 2 :** nouveaux défis de calcul, mesures et conversions, proportionnalité, statistiques, probabilités, expressions et équations.
- **Niveau 3 — L'Observatoire royal :** aventure autour de nouvelles épreuves : calculs, arrondis, carrés, moyennes, conversions, géométrie, pourcentages et probabilités.

Le contenu évolue au fil des versions ; certains éléments peuvent encore être en cours d'amélioration.

## Fonctionnalités

- 🧭 Exploration d'un univers illustré avec un personnage contrôlable.
- 📜 Défis mathématiques intégrés à des quêtes.
- ✅ Validation des épreuves à partir de **80 %** de bonnes réponses (8/10).
- 💾 Conservation de la progression et des réussites.
- 👤 Possibilité de retrouver son compte **Activités mentales** et les résultats liés à celui-ci.
- 🖥️ Affichage adaptatif, commandes adaptées aux écrans tactiles et mode plein écran.
- 🎨 Interface médiévale aux couleurs **bleu royal et or**.

## Objectif pédagogique

Maths Quest est conçu pour donner envie aux élèves de **s'entraîner régulièrement en mathématiques**, en leur proposant une progression ludique, des objectifs concrets et une expérience plus immersive qu'une série d'exercices traditionnelle.

Le projet s'appuie sur les activités mathématiques existantes tout en leur donnant une nouvelle forme, proche d'un jeu d'aventure.

## Utilisation

Ouvrir le [jeu en ligne](https://offsidealex.github.io/Maths-Quest/) dans un navigateur récent. Suivre les indications à l'écran pour commencer l'aventure, rejoindre les lieux de quête et résoudre les exercices. Un compte Activités mentales peut être utilisé pour les fonctionnalités de suivi partagé.

## Développement

- **Version :** 0.3.47
- **Technologies :** HTML, CSS et JavaScript.
- **Hébergement prévu :** GitHub Pages.
- **Dépôt :** [Offsidealex/Maths-Quest](https://github.com/Offsidealex/Maths-Quest)
- **Projet associé :** [Activités mentales](https://github.com/Offsidealex/Activites_mentales)

Maths Quest est un projet pédagogique en évolution : nouveaux niveaux, nouvelles épreuves et améliorations de l'ergonomie sont progressivement ajoutés.

## Nouveauté 0.3.47

La calculatrice intégrée est aussi accessible pendant l'épreuve **Calcul de moyenne** du niveau 3. Elle permet de poser les additions et divisions, puis de reporter le résultat dans la réponse sans interrompre le chronomètre.

## Versions publique et de test

- **`main`** : version validée, diffusée à l'adresse [Maths Quest](https://offsidealex.github.io/Maths-Quest/).
- **`test`** : nouveautés à essayer avant validation, diffusées à l'adresse [Maths Quest — Test](https://offsidealex.github.io/Maths-Quest/test/).

Les deux versions sont déployées ensemble par [GitHub Actions](.github/workflows/pages.yml) à chaque modification de `main` ou `test`. Les tests de parcours s'exécutent avant publication et une erreur empêche le déploiement. Les pull requests vers ces deux branches déclenchent également les [tests automatiques](.github/workflows/tests.yml).

### Méthode pour les prochaines modifications

1. Développer sur une branche de travail et ouvrir une pull request vers `test`.
2. Une fois les tests passés, fusionner vers `test`, puis essayer la version dans le navigateur à l'adresse **/test/**.
3. Quand la version est validée, ouvrir une pull request de `test` vers `main` et fusionner : l'adresse publique est alors mise à jour.

**Configuration initiale indispensable :** dans GitHub → **Settings → Pages**, sélectionner **GitHub Actions** comme source du déploiement. Les liens sont prévus dans le workflow, mais ne deviennent actifs qu'une fois les déploiements réussis. Ne pas choisir la branche `test` comme source Pages : cela remplacerait le site public au lieu de créer le sous-dossier `/test/`.
