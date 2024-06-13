# Odyssee-Software/fetchFactory

Cette bibliothèque fournit une factory de requêtes HTTP réutilisables appelée Fetch Factory, ainsi qu'un système de traitement par lots (Batcher) pour gérer l'exécution asynchrone et concurrente des contrôleurs.

## **Fetch Factory**

Fetch Factory permet de créer des fonctions de requête HTTP réutilisables avec des options spécifiques telles que la méthode, les en-têtes et les validateurs. Elle peut être utilisée pour effectuer des requêtes GET, POST, PUT, PATCH ou DELETE.

### **Utilisation de Fetch Factory**

Pour utiliser Fetch Factory, importez-la dans votre projet et créez des fonctions de requête pour différents types de méthodes HTTP :

```tsx
// Exemple pour Node.js
import { FetchFactory } from '@Odyssee-Software/fetchFactory';
import { fetch, Response } from 'node-fetch';

const MyGet = FetchFactory<Response>({
  caller: fetch,
  method: 'GET',
  headers: {},
  validator: async (response) => {
    let result = await response.text();
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error(error);
    }
    return result;
  }
});

MyGet<InputData, OutputData>(/** ...optional headers... */)(/** endpoint */, /** body */)
.then(({ output_data }) => {
  console.log({ output_data });
});
```

```tsx
// Exemple pour le navigateur
import { FetchFactory } from '@Odyssee-Software/fetchFactory';

const MyGet = FetchFactory<Response>({
  caller: fetch.bind(window),
  method: 'GET',
  headers: {},
  validator: async (response) => {
    let result = await response.text();
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error(error);
    }
    return result;
  }
});

MyGet<InputData, OutputData>(/** ...optional headers... */)(/** endpoint */, /** body */)
.then(({ output_data }) => {
  console.log({ output_data });
});
```

### **Requêtes Prédéfinies**

Fetch Factory inclut également des fonctions de requête prédéfinies pour simplifier les opérations courantes :

```tsx
import { Get, Post, Put, Patch, Delete } from '@Odyssee-Software/fetchFactory';

const fetchData = async () => {
  const responseData = await Get(/** ...optional headers... */)('/api/data');
  console.log('Data:', responseData);
};
```

### **Validator**

Le **validator** est une fonction asynchrone qui permet de traiter et valider les réponses des requêtes HTTP avant qu'elles ne soient renvoyées à l'utilisateur. Il peut être utilisé pour transformer les données de la réponse, vérifier leur intégrité, ou gérer des erreurs spécifiques. Lorsqu'un validateur est spécifié, son résultat est inscrit dans `output_data` de la réponse.

### Exemple de Validator

Supposons que vous souhaitiez valider et transformer les données de réponse JSON avant de les utiliser. Vous pouvez définir un validateur comme suit :

```tsx
const MyGet = FetchFactory<Response>({
  caller: fetch,
  method: 'GET',
  headers: {},
  validator: async (response) => {
    let result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  }
});

MyGet<InputData, OutputData>(/** ...optional headers... */)(/** endpoint */, /** body */)
.then(({ output_data }) => {
  console.log({ output_data });
})
.catch((error) => {
  console.error('Validation error:', error);
});
```

### **Caller**

Le **caller** est la fonction responsable de l'exécution des requêtes HTTP. Fetch Factory permet de spécifier n'importe quel caller compatible, comme `fetch`, `axios`, ou toute autre bibliothèque de requêtes HTTP. Cette flexibilité est intéressante car elle permet d'utiliser Fetch Factory dans différents environnements ou de remplacer facilement la technologie sous-jacente sans modifier les appels de fonction dans le code.

### **Exemple avec un caller non compatible Fetch**

Supposons que vous avez une fonction `customCaller` qui ne suit pas exactement la nomenclature de `fetch`. Vous pouvez encapsuler ce caller dans une fonction qui adopte la même signature que `fetch`.

```tsx
// Exemple d'un customCaller qui ne respecte pas la nomenclature de fetch
const customCaller = (url: string, options: any) => {
  return new Promise((resolve, reject) => {
    // Simuler une requête HTTP
    setTimeout(() => {
      resolve({ data: 'response data from customCaller' });
    }, 1000);
  });
};

// Fonction d'adaptation pour customCaller
const fetchLikeCaller = (url: string, options: any) => {
  return customCaller(url, options).then((response) => ({
    json: () => Promise.resolve(response.data),
  }));
};

// Utilisation avec Fetch Factory
import { FetchFactory } from '@Odyssee-Software/fetchFactory';

const MyGet = FetchFactory({
  caller: fetchLikeCaller,
  method: 'GET',
  headers: {},
  validator: async (response) => {
    let result = await response.json();
    return result;
  }
});

MyGet<InputData, OutputData>(/** ...optional headers... */)(/** endpoint */, /** body */)
.then(({ output_data }) => {
  console.log({ output_data });
});
```

Dans cet exemple, `fetchLikeCaller` agit comme une interface pour `customCaller`, en transformant sa réponse pour qu'elle corresponde à la manière dont `fetch` retourne les résultats.

## **Batcher**

Le **Batcher** est un système de traitement par lots qui permet d'exécuter de manière asynchrone et concurrente une série de contrôleurs. Il offre un contrôle sur le niveau de concurrence, la gestion des événements de progression et de fin, ainsi que la possibilité de gérer des dépendances entre les contrôleurs avec un mécanisme de fallback.

### **Utilisation de Batcher**

Pour utiliser Batcher, importez-le dans votre projet et créez une instance de batcher avec une configuration éventuelle :

```tsx
import { createBatch } from '@Odyssee-Software/fetchFactory';

const batch = createBatch({
  concurrency: 4, // Niveau de concurrence
  progress: (progress) => {
    console.log('Progress:', progress);
  },
  end: (err, results) => {
    if (err) {
      console.error('Batch ended with error:', err);
    } else {
      console.log('Batch completed successfully:', results);
    }
  },
});
```

Ensuite, ajoutez des contrôleurs à la file d'attente du batcher et lancez le traitement par lots :

```tsx
batch.push(async (args) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return 'Task result';
});

// Ajoutez d'autres contrôleurs...

batch.start().then((results) => {
  console.log('Batch results:', results);
});
```

## **Fallback Resolver**

Le **Fallback Resolver** est une fonctionnalité de Batcher qui permet d'encapsuler un job qui sera utilisé uniquement si un autre job échoue. Cela permet de gérer les dépendances entre les contrôleurs.

### **Utilisation du Fallback Resolver**

Pour utiliser le Fallback Resolver, créez une requête de fallback avec un ensemble de contrôleurs associés et leurs gestionnaires de succès, d'attente et d'erreur :

```tsx
import { BatchFallbackQuery } from '@Odyssee-Software/fetchFactory';

const fallbackQuery = (args: any[]): BatchFallbackQuery<any> => {
  return {
    find: { id: [0] }, // Identifiants des contrôleurs associés
    args: args, // Arguments facultatifs
    on: {
      success: (next, reject, result) => {
        console.log('Fallback success:', result);
        next(Promise.resolve('Fallback result'));
      },
      pending: (wait) => {
        console.log('Fallback pending');
        wait();
      },
      error: (reject) => {
        console.log('Fallback error');
        reject('Error occurred');
      },
    },
  };
};

batch.push((args) => {
  return batch.solver(fallbackQuery(args));
});
```