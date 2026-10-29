# Maths Quest — version 0.3.38

Connexion avec le compte élève d’Activités mentales. Les 22 défis ont une correspondance explicite avec les mêmes modules dans Activités mentales. Les séries de 10 questions réussies à 80 % depuis le 19 octobre 2026 sont partagées. Les échecs sont également envoyés au suivi professeur, sans annuler une réussite.

Cette version conserve la transition directe vers le niveau 3 de la 0.3.37.

## Publication

Activation Supabase et publication des deux dépôts autorisées et effectuées le 29 octobre 2026. Les étapes suivantes décrivent l’installation, déjà effectuée sur le projet et les dépôts officiels.

1. Appliquer le SQL sur le projet existant Activités mentales (ajouts de colonnes, fonction d’enregistrement et vue professeur respectant les droits existants).
2. Publier backend.js, index.html et dashboard_prof.html du dossier integration-activites-mentales dans Offsidealex/Activites_mentales.
3. Publier index.html et assets/ de cette archive dans Offsidealex/Maths-Quest.
4. Vérifier la connexion et une série sur un compte TEST-IA, les deux sens et le suivi professeur.

## Utilisation

Ouvrir index.html avec assets/ à côté, ou le HTML autonome. Le mode invité conserve sa progression locale. Le compte élève est utilisé pour la synchronisation, avec Internet ; les séries effectuées pendant une coupure sont conservées sur l’appareil et réenvoyées uniquement pour leur compte. La connexion est conservée pour cet onglet ; le mot de passe n’est pas stocké.

Les anciennes réussites anonymes ne sont jamais attribuées automatiquement à un élève. Au changement de compte, toute série en cours est interrompue et la progression du compte choisi remplace celle affichée.

## Vérifications

Tests du moteur des trois niveaux, synchronisation dans les deux sens avec les clients réels et réseau simulé, idempotence, comptes distincts, interruptions réseau, pagination, renouvellement de session et rendu des tableaux professeur.

Test SQL sur le vrai projet, sous les droits élève, professeur et anonyme : enregistrement atomique, cohérence des réponses et scores, absence de doublons et isolation. Transaction entièrement annulée ; aucun résultat de test ni changement de schéma conservé.

Le test HTTP de connexion avec un mot de passe de TEST-IA et la vérification visuelle dans le navigateur restent à réaliser après activation. L’outil navigateur refuse les URL file:// ; ne pas présenter les tests simulés comme un test visuel réel.

Exercices adaptés d’Activités mentales, Alexis RUIZ — Lycée Denis Diderot, Belfort. Voir sources/ pour la licence.
