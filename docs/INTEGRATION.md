# Exercices intégrés — v0.3.29

Source : [Offsidealex/Activites_mentales](https://github.com/Offsidealex/Activites_mentales/blob/main/index.html).

| Défi | Module d’origine | Série | Temps par question | Validation |
| --- | --- | --- | --- | --- |
| Tables de multiplication | `mult` | 10 produits distincts, tables de 2 à 9 | 10 s | 8/10 |
| Additions de relatifs | `add_rel`, `generateRelatives('add')` | 10 additions distinctes, entiers signés de 1 à 45 | 10 s | 8/10 |
| Fractions équivalentes | `frac_equiv` | 10 égalités tirées parmi les 20 originales ; numérateur manquant | 30 s | 8/10 |

La correction est entière et exacte. Une réponse hors délai n’est pas validée. Les échecs n’effacent pas les réussites précédentes. Les données et générateurs de référence sont conservés dans `sources/`, avec la licence d’origine.

La progression est locale au navigateur, sans compte et sans appel au dépôt d’origine pendant le jeu. Aucun changement n’a été apporté à Activités mentales.

Les vérifications locales couvrent le seuil 7/10 contre 8/10, les minuteurs et leur expiration, le pool des fractions, la sauvegarde et la migration des réussites, le rejouement et le passage d’un défi validé, les déplacements et leur annulation, le plein écran appliqué au jeu entier et le déclenchement de la transition vers le niveau 2.
