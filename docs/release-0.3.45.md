# Maths Quest 0.3.45

- Recouvrement opaque des anciens panneaux de progression dessinés dans les décors, derrière le compte invité ou élève ; les validations et compteurs restent internes.
- Quêtes regroupées par domaines mathématiques sur les cartes et les écrans d’épreuve des trois niveaux. Niveau 2 : mesures/proportionnalité, statistiques/probabilités, calcul/algèbre. Les identifiants sauvegardés et l’ordre des épreuves restent identiques.
- Dans la Cour et l’Observatoire, le cartouche gauche nomme le lieu ; le panneau central porte le titre de l’épreuve. Au niveau 1, le titre imprimé à gauche est conservé et le doublon central est remplacé.
- Compte arrimé à la scène des transitions du niveau 1.

Validation : `node development/test-game-v0336.cjs` depuis la racine du dépôt. Le test lit désormais le script livré dans index.html. Parcours des trois niveaux, seuil 8/10, échec, sauvegarde, rejeu, groupes, générateurs, calculatrice et transitions vérifiés.

Contrôle Chromium : cartes des trois niveaux, transition du niveau 1, épreuve du niveau 3, formats 1440×1000, 390×844 et 844×390 ; aucune erreur JavaScript. Le format portrait conserve la scène ajustée et sa commande d’agrandissement.

Limite : connexion à un vrai compte et écriture distante des résultats Activités mentales non testées (pas de compte de test utilisé). Le code de synchronisation et les générateurs pédagogiques ne sont pas modifiés.
