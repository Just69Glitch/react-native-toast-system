import lunr from "lunr";
import { searchIndexUrl } from "@easyops-cn/docusaurus-search-local/dist/client/client/utils/proxiedGeneratedConstants";
import { SearchDocumentType } from "@easyops-cn/docusaurus-search-local/dist/client/shared/interfaces";
import { sortSearchResults } from "@easyops-cn/docusaurus-search-local/dist/client/client/utils/sortSearchResults";
import { processTreeStatusOfSearchResults } from "@easyops-cn/docusaurus-search-local/dist/client/client/utils/processTreeStatusOfSearchResults";

const cache = new Map();
const TOKEN_REGEX = /[^-\s]+/g;
const SEARCH_MODES = [
  lunr.Query.wildcard.TRAILING,
  lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
];

function tokenizeInput(input) {
  return (input || "").toLowerCase().match(TOKEN_REGEX) || [];
}

function stemToken(token) {
  return lunr.stemmer(new lunr.Token(token)).toString();
}

function tokenVariants(token) {
  const stemmed = stemToken(token);
  if (!stemmed || stemmed === token) {
    return [token];
  }
  return [token, stemmed];
}

function createQueryVariants(tokens) {
  const rawVariants = tokens.map(tokenVariants);
  const variants = [];

  function walk(index, acc) {
    if (index === rawVariants.length) {
      variants.push(acc.slice());
      return;
    }
    for (const candidate of rawVariants[index]) {
      acc.push(candidate);
      walk(index + 1, acc);
      acc.pop();
    }
  }

  walk(0, []);
  return variants;
}

async function loadIndexes(baseUrl, searchContext) {
  const cacheKey = `${baseUrl}${searchContext}`;
  let promise = cache.get(cacheKey);
  if (!promise) {
    promise = fetchIndexes(baseUrl, searchContext);
    cache.set(cacheKey, promise);
  }
  return promise;
}

function normalizeSearchIndexUrl(baseUrl, searchContext) {
  return `${baseUrl}${searchIndexUrl.replace(
    "{dir}",
    searchContext ? `-${searchContext.replace(/\//g, "-")}` : ""
  )}`;
}

async function fetchIndexes(baseUrl, searchContext) {
  const url = normalizeSearchIndexUrl(baseUrl, searchContext);
  const fullUrl = new URL(url, location.origin);
  if (fullUrl.origin !== location.origin) {
    throw new Error("Unexpected version url");
  }

  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const json = await response.json();
  return json.map(({ documents, index }, type) => ({
    type,
    documents,
    index: lunr.Index.load(index),
  }));
}

function appendResults({
  wrappedIndexes,
  results,
  seenRefs,
  tokens,
  terms,
  wildcard,
  limit,
}) {
  for (const { documents, index, type } of wrappedIndexes) {
    const matches = index.query((query) => {
      for (const term of terms) {
        query.term(term, {
          wildcard,
          presence: lunr.Query.presence.REQUIRED,
        });
      }
    });

    for (const result of matches) {
      if (results.length >= limit) {
        return;
      }
      if (seenRefs.has(result.ref)) {
        continue;
      }

      const document = documents.find((doc) => doc.i.toString() === result.ref);
      if (!document) {
        continue;
      }

      seenRefs.add(result.ref);
      results.push({
        document,
        type,
        page:
          type !== SearchDocumentType.Title
            ? wrappedIndexes[0].documents.find((doc) => doc.i === document.p)
            : undefined,
        metadata: result.matchData.metadata,
        tokens,
        score: result.score,
      });
    }
  }
}

export async function fetchIndexesByWorker(baseUrl, searchContext) {
  await loadIndexes(baseUrl, searchContext);
}

export async function searchByWorker(baseUrl, searchContext, input, limit) {
  const tokens = tokenizeInput(input);
  if (tokens.length === 0) {
    return [];
  }

  const wrappedIndexes = await loadIndexes(baseUrl, searchContext);
  if (!wrappedIndexes.length) {
    return [];
  }
  const queryVariants = createQueryVariants(tokens);
  const results = [];
  const seenRefs = new Set();

  for (const wildcard of SEARCH_MODES) {
    for (const terms of queryVariants) {
      appendResults({
        wrappedIndexes,
        results,
        seenRefs,
        tokens,
        terms,
        wildcard,
        limit,
      });
      if (results.length >= limit) {
        break;
      }
    }
    if (results.length >= limit) {
      break;
    }
  }

  sortSearchResults(results);
  processTreeStatusOfSearchResults(results);
  return results;
}
