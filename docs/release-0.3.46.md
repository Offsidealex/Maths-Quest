# Maths Quest 0.3.46

L’ancien panneau de progression (titre, barre, compteur, médaillon 80 % et bordure) a été effacé directement dans six décors : trois cartes et trois transitions du niveau 1. Les zones supprimées sont reconstituées avec le ciel, l’architecture et la végétation environnants. La plaque CSS ajoutée en 0.3.45 est retirée.

Les six images utilisées par le jeu portent le suffixe `-sans-progression.png`, pour renouveler leur URL et éviter la réutilisation des anciens décors en cache. Les originaux restent dans l’historique des ressources. L’en-tête des épreuves des niveaux 2/3 réutilise seulement la partie gauche et le cartouche du niveau ; son ancienne zone droite n’est plus dessinée sur les ateliers.

Retouches réalisées avec l’outil intégré ImageGen. Consigne commune : supprimer uniquement le panneau de progression en haut à droite, médaillon et bordure compris, reconstituer naturellement le décor environnant, conserver cadrage, personnages, textes et thème médiéval bleu royal et or. Les six fichiers finaux sont dans assets/.

Validation : tests des parcours des trois niveaux (`node development/test-game-v0336.cjs`), vérification Chromium des cartes, transitions et épreuves, formats ordinateur, portrait et paysage ; aucune erreur JavaScript. Logique de progression, résultats et synchronisation Activités mentales inchangés. Connexion réelle non retestée.
