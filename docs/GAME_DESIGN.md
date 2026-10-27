# Maths Quest — Game Design v2

## Vision
Un RPG 2D éducatif, jouable sur ordinateur, tablette et smartphone. Le joueur explore un village vivant, parle aux habitants, résout des défis et débloque des mondes.

## Règles pédagogiques
- Monde 1 : **tous** les modules de niveau 1 réellement présents dans Activités mentales, déterminés par un inventaire du code source.
- Un défi = série de questions du module d'origine, avec ses règles de génération, de validation et de correction.
- Seuil de réussite : 80 % ; les essais incomplets ne sont pas validés.
- Aucun module ne doit être simulé par de simples additions.
- Le site d'origine reste indépendant et inchangé.
- La progression du jeu est distincte de celle du site existant tant qu'une intégration Supabase sécurisée n'est pas définie.

## Boucle de jeu
Explorer → discuter avec un PNJ → accepter une quête → réussir un défi → recevoir XP/récompense → progresser vers le monde suivant.

## Monde 1 : Village des Savoirs
- Place centrale, école, bibliothèque, ateliers, jardins, fontaine, panneaux et habitants.
- Une quête par module de niveau 1 ; ordre libre.
- PNJ guides et dialogues courts, sans ralentir l'élève.
- Les bâtiments bloquent le déplacement ; portes et zones d'interaction dédiées.
- Caméra qui suit le joueur ; monde plus grand que l'écran.
- Contrôles clavier et tactiles ; boutons adaptés aux petits écrans.
- Menu pause, carte, journal de quêtes et indicateur de progression.

## Interface des exercices
Remplacer prompt()/alert() par une interface Phaser/HTML accessible :
- Question, progression, réponse numérique ou choix, validation, correction.
- Navigation clavier, prise en charge du tactile et lisibilité mobile.
- Retour au village après bilan.

## Architecture cible
- src/scenes/ : Boot, Village, Challenge, UI
- src/world/ : carte, collisions, PNJ, portes
- src/modules/ : adaptateurs vers générateurs de questions existants
- src/state/ : progression locale puis synchronisation éventuelle
- assets/ : tilesets, personnages, sons avec licences vérifiées
- tests/ : validation des questions et de la progression

## Étapes
1. Audit des modules niveau 1 d'Activités mentales.
2. Interface de défi sans fenêtres natives et premiers tests.
3. Carte tilemap, collisions, caméra et personnage animé.
4. PNJ, quêtes, récompenses et journal.
5. Connexion des vrais modules, tests automatisés, revue CodeRabbit.
6. Optimisation mobile et accessibilité.

## Critères de réussite du premier monde
- Tous les vrais modules niveau 1 accessibles.
- Aucune question factice.
- Jouable au clavier et au tactile.
- Progression sauvegardée sans perdre les résultats.
- Pas de régression sur Activités mentales.
