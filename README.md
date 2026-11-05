# Le Soin par Stéphanie · site web

Site vitrine statique de l'institut de soin du visage **Le Soin par Stéphanie** (Stéphanie Wathelet, Herve, partenaire Care Personal Beauty). Version 2, refondue d'après l'audit UX/UI du 27 octobre 2026 : un seul parcours de conversion (réserver son bilan de peau), des pages courtes, une seule animation (le scan des mesures dans le hero), une palette crème, rose poudré, sable chaud, bronze et noir alignée sur le logo.

Aucune étape de construction : des fichiers HTML, une feuille de style et un script. Ouvrez `index.html` dans un navigateur ou déposez le dossier sur n'importe quel hébergement.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : hero, réassurance, 3 étapes, qui suis-je, vos besoins, concept Care, tarifs en bref, questions, infos pratiques |
| `bilan-de-peau.html` | Le bilan de peau en 9 mesures, le déroulé du premier rendez-vous (2 h à 2 h 30), questions |
| `soins.html` | La carte des soins Care, les technologies, une séance |
| `qui-suis-je.html` | Parcours de Stéphanie, pourquoi Care, l'institut, engagements |
| `produits.html` | Les 19 produits Care avec prix indicatifs, filtres, routine en six étapes |
| `tarifs.html` | Grille tarifaire avec un bouton par ligne, forfaits et cures, bon cadeau |
| `reserver.html` | Le formulaire unique de réservation et les infos pratiques |
| `merci.html` | Page de remerciement, affichée après l'envoi (page de conversion, `noindex`) |
| `mentions-legales.html`, `confidentialite.html` | Pages légales, cookies et mesure d'audience |
| `404.html` | Page introuvable (`noindex`) |
| `analyse.html`, `methode.html`, `contact.html` | Anciennes adresses : redirection vers les nouvelles pages. Sur le serveur, prévoir des redirections 301 vers `bilan-de-peau.html`, `qui-suis-je.html` et `reserver.html`, puis supprimer ces fichiers. |

## À compléter avant la mise en ligne

Les emplacements sont repérés dans le code par des commentaires `À COMPLÉTER`, `À CONFIRMER`, `À VALIDER` ou `À REMPLACER`, et visibles à l'écran par un surlignage sable (`mark-note`, `<mark>`).

| Élément | Où |
|---|---|
| Grille tarifaire (chaque `XX €`), moyens de paiement, conditions d'annulation | `tarifs.html`, bloc « Tarifs en bref » de `index.html` |
| Bilan offert ou payant, bon cadeau de Noël | Bandeau d'offre en haut de chaque page (`parts/head.html`), `tarifs.html` |
| Les 9 mesures exactes et ce que chacune indique | `bilan-de-peau.html` (section « Les 9 mesures »), hero de `index.html` |
| Jours et heures d'ouverture, jours à cocher dans le formulaire | `reserver.html`, `index.html` (infos pratiques) |
| Numéro de téléphone professionnel définitif | Partout (`tel:+32495791738`) et dans les données structurées de l'en-tête |
| Années d'expérience, parcours, ancien institut | `qui-suis-je.html`, section « Qui suis-je » de `index.html` |
| Durées des soins | `soins.html`, `tarifs.html` |
| Prix des produits | `produits.html` : prix TTC relevés en octobre 2026 sur le site Care et chez un revendeur agréé belge, à confirmer avec le tarif de l'institut |
| Logo | Version vectorielle redessinée d'après le logo fourni (`parts/head.html`, symbole `#logo`), en attente de validation. Exports dans `assets/img/logo/` (PNG transparent, PNG sur fond, favicon). Le fichier original pourra les remplacer. |
| Photos | Portrait de Stéphanie, cabine, appareils, visuels et vidéo Care (emplacements `.ph`, après le shooting de mi-novembre et l'accord de la marque) |
| Réseaux sociaux | Liens Instagram et Facebook dans le pied de page |
| Mentions légales, hébergeur, numéro d'entreprise, dates | `mentions-legales.html`, `confidentialite.html` |

## Formulaire et suivi des demandes

Le formulaire de `reserver.html` est le seul point d'entrée. Il comporte prénom et nom, téléphone, e-mail, besoin principal, jours préférés, moment, première visite ou déjà cliente, message, et la case de consentement RGPD. Des champs cachés enregistrent la provenance : `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `source_page`, `referent`.

- **Sans service d'envoi** (réglage par défaut) : la messagerie de la visiteuse s'ouvre avec la demande pré-remplie vers l'adresse `CONFIG.contactEmail` de `assets/js/main.js`, puis la page `merci.html` s'affiche.
- **Avec un service d'envoi** (recommandé) : ajoutez `data-endpoint="https://…"` sur la balise `<form>` de `reserver.html`. Les champs sont envoyés en JSON (`POST`) et la visiteuse est redirigée vers `merci.html`. Formspree, Basin, Netlify Forms ou un petit script serveur conviennent.

## Mesure d'audience et campagnes

- Les cookies de mesure d'audience ne sont chargés qu'après accord dans le bandeau (choix mémorisé sous la clé `lsps-cookies`).
- Renseignez l'identifiant du conteneur Google Tag Manager dans `CONFIG.gtmId` (`assets/js/main.js`). Rien n'est chargé tant qu'il est vide.
- Événements poussés dans `dataLayer` : `lead_form_submit` (envoi du formulaire), `lead_thanks` (arrivée sur `merci.html`, conversion principale), `phone_click` avec la position du lien (`header`, `hero`, `infos`, `barre-mobile`, `footer`…), conversion secondaire.
- Pour les campagnes, faites arriver le trafic sur `reserver.html` ou `index.html` avec les paramètres UTM : ils sont recopiés dans la demande.

## Structure du code

- `assets/css/styles.css` : tokens de couleur et de typographie en tête de fichier, puis les composants dans l'ordre des pages. Polices Google Fonts : Cormorant Garamond (titres), Figtree (texte), Bodoni Moda (logo).
- `assets/js/main.js` : vanilla, sans dépendance. Modules isolés : en-tête, menu, questions dépliables, filtres du catalogue, horaires (jour courant), formulaire, appels, bandeau cookies, étiquettes du scan, année.
- `assets/img/photos/` : photos des pages et des appareils. `assets/img/produits/` : visuels des 20 produits. `assets/img/logo/` : exports du logo. `assets/video/` : vidéo Care de la routine (720p, 3,4 Mo, sans son, chargée seulement à la lecture) et son image de couverture.
- Les pages partagent le même en-tête et le même pied de page : pour une modification commune, faites-la sur toutes les pages (ou reconstruisez-les à partir des gabarits).

## Accessibilité et performance

Contrastes vérifiés sur les textes (bronze foncé sur crème), navigation au clavier, lien d'évitement, mouvement réduit respecté, aucune animation en dehors du hero. Pas de bibliothèque, pas de police de code, pas de curseur ni de chargeur personnalisés.
