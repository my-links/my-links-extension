# MyLinks Extension

Une extension de navigateur pour gérer vos favoris avec les collections MyLinks.

## Fonctionnalités

### 🚀 Initialisation

- Sauvegarde automatique de vos favoris existants dans un dossier "Backup Favorites"
- Configuration de l'URL MyLinks et de la clé API
- Validation automatique de la clé API

### 📚 Gestion des Collections

- Créer, modifier et supprimer des collections
- Synchronisation automatique avec l'API MyLinks
- Interface utilisateur moderne avec Mantine UI

### 🔗 Ajout de Liens

- Menu contextuel pour ajouter des pages aux collections
- Interface dédiée pour gérer les liens en attente
- Support des descriptions personnalisées

### 🏠 Nouvel Onglet

- Remplacement de la page de nouvel onglet par le dashboard MyLinks
- Paramètre random pour éviter le cache
- Interface responsive et moderne

### 🌍 Internationalisation

- Support complet en anglais et français
- Interface adaptée selon la langue du navigateur

## Installation

### Développement

1. Cloner le repository :

```bash
git clone <repository-url>
cd my-links-extension
```

2. Installer les dépendances :

```bash
pnpm install
```

3. Construire l'extension :

```bash
pnpm build
```

4. Charger l'extension dans Chrome :
   - Ouvrir `chrome://extensions/`
   - Activer le "Mode développeur"
   - Cliquer sur "Charger l'extension non empaquetée"
   - Sélectionner le dossier `dist`

### Production

1. Construire l'extension :

```bash
pnpm build
```

2. L'archive ZIP est automatiquement créée dans le dossier `dist`

## Configuration

### Première Utilisation

1. **Initialisation** : Cliquer sur l'icône de l'extension et suivre le processus d'initialisation
2. **Configuration** : Définir l'URL MyLinks (par défaut : https://www.mylinks.app) et votre clé API
3. **Création de Collections** : Créer vos premières collections via la popup de l'extension

### Clé API

Pour obtenir votre clé API :

1. Aller sur https://www.mylinks.app/user/settings
2. Générer une nouvelle clé API
3. Copier la clé dans les paramètres de l'extension

## Architecture

### Structure des Fichiers

```
src/
├── background/          # Service worker principal
├── popup/              # Interface de la popup
│   ├── components/     # Composants React
│   └── main.tsx        # Point d'entrée
├── newtab/             # Page de nouvel onglet
├── content/            # Content script
├── services/           # Services métier
│   ├── api.ts         # Service API MyLinks
│   ├── storage.ts     # Service de stockage
│   └── bookmarks.ts   # Service de gestion des favoris
└── types/              # Types TypeScript
```

### Technologies Utilisées

- **React 19** : Interface utilisateur
- **Mantine 8** : Composants UI modernes
- **TypeScript** : Typage statique
- **Chrome Extensions API** : Fonctionnalités du navigateur
- **Vite** : Build tool et bundler

## API MyLinks

L'extension utilise l'API MyLinks pour :

- Vérifier la validité des tokens
- Récupérer les collections
- Créer/modifier/supprimer des collections
- Ajouter des liens aux collections

### Endpoints Utilisés

- `GET /api/v1/tokens/check` : Validation de token
- `GET /api/v1/collections` : Récupération des collections
- `POST /api/v1/collections` : Création de collection
- `PUT /api/v1/collections/:id` : Modification de collection
- `DELETE /api/v1/collections/:id` : Suppression de collection
- `POST /api/v1/links` : Ajout de lien

## Développement

### Scripts Disponibles

```bash
pnpm dev          # Mode développement avec hot reload
pnpm build        # Construction pour production
pnpm preview      # Prévisualisation de la build
```

### Bonnes Pratiques

- **Clean Code** : Code propre et lisible
- **SOLID** : Principes de conception orientée objet
- **DRY** : Éviter la duplication de code
- **TypeScript** : Typage strict pour la sécurité
- **Tests** : Couverture de tests (à implémenter)

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Support

Pour toute question ou problème :

1. Vérifier la documentation
2. Consulter les issues existantes
3. Créer une nouvelle issue avec les détails du problème
