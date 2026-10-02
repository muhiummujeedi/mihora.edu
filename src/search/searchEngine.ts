import { Resource, FilterState } from '../types';

export interface SearchMatch {
  resource: Resource;
  score: number;
}

// Common synonym mapping based on Parts 22 & 49
const SYNONYM_MAP: Record<string, { type?: string; tag?: string }> = {
  mid: { type: 'MIDTERM' },
  midterm: { type: 'MIDTERM' },
  'mid-term': { type: 'MIDTERM' },
  final: { type: 'FINALTERM' },
  finalterm: { type: 'FINALTERM' },
  'final-term': { type: 'FINALTERM' },
  handout: { type: 'HANDOUT' },
  handouts: { type: 'HANDOUT' },
  notes: { tag: 'SHORT-NOTES' },
  'short-notes': { tag: 'SHORT-NOTES' },
  book: { tag: 'BOOK' },
  quiz: { type: 'QUIZ' },
  quizzes: { type: 'QUIZ' },
  assignment: { type: 'ASSIGNMENT' },
  assignments: { type: 'ASSIGNMENT' },
  gdb: { tag: 'GDB' },
  gdbs: { tag: 'GDB' },
  mcq: { tag: 'MCQ' },
  mcqs: { tag: 'MCQ' },
  objective: { tag: 'MCQ' },
  subjective: { tag: 'SUBJECTIVE' },
  solved: { tag: 'SOLVED' },
  solution: { tag: 'SOLVED' },
  pastpaper: { tag: 'PAST-PAPER' },
  'past-paper': { tag: 'PAST-PAPER' },
  current: { tag: 'CURRENT' },
  important: { tag: 'IMPORTANT' },
  moaaz: { tag: 'MOAAZ' },
  waqar: { tag: 'WAQAR' },
  slides: { tag: 'SLIDES' },
  slide: { tag: 'SLIDES' },
  lecture: { tag: 'LECTURE' }
};

// Normalize course codes: "cs 302" -> "CS302", "CS-302" -> "CS302"
export function normalizeCourseCode(query: string): string {
  return query
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

// Tokenize query with hyphen/space normalization
export function parseQuery(query: string) {
  const clean = query.trim().toLowerCase();
  if (!clean) return { course: null, types: [], tags: [], terms: [] };

  // Detect course code pattern e.g. "CS302", "CS 302", "CS-302", "MTH101", "ACC311"
  const courseMatch = clean.match(/\b([a-z]{2,4})\s*-?\s*([0-9]{3}[a-z]?)\b/i);
  let detectedCourse: string | null = null;
  let remainingQuery = clean;

  if (courseMatch) {
    detectedCourse = `${courseMatch[1].toUpperCase()}${courseMatch[2].toUpperCase()}`;
    remainingQuery = clean.replace(courseMatch[0], ' ').trim();
  }

  const rawTokens = remainingQuery.split(/[\s,+/_-]+/).filter(Boolean);
  const matchedTypes = new Set<string>();
  const matchedTags = new Set<string>();
  const freeTerms: string[] = [];

  for (const token of rawTokens) {
    if (SYNONYM_MAP[token]) {
      const mapping = SYNONYM_MAP[token];
      if (mapping.type) matchedTypes.add(mapping.type);
      if (mapping.tag) matchedTags.add(mapping.tag);
    } else {
      freeTerms.push(token);
    }
  }

  return {
    course: detectedCourse,
    types: Array.from(matchedTypes),
    tags: Array.from(matchedTags),
    terms: freeTerms
  };
}

export function searchResources(
  resources: Resource[],
  query: string,
  filters: FilterState,
  limit: number = 12
): Resource[] {
  const trimmed = query.trim();
  const parsed = parseQuery(trimmed);

  // If no query and no filters, return top slice
  const hasActiveFilters =
    filters.course ||
    filters.type ||
    filters.format ||
    filters.tags.length > 0 ||
    filters.solvedOnly ||
    filters.pastPapersOnly ||
    filters.currentOnly;

  if (!trimmed && !hasActiveFilters) {
    return resources.slice(0, limit);
  }

  const scoredList: SearchMatch[] = [];

  for (let i = 0; i < resources.length; i++) {
    const res = resources[i];
    let score = 0;

    // Filter checks (Strict Disqualifiers)
    if (filters.course && res.course.toUpperCase() !== filters.course.toUpperCase()) {
      continue;
    }
    if (filters.type && res.type.toUpperCase() !== filters.type.toUpperCase()) {
      continue;
    }
    if (filters.format && res.format.toUpperCase() !== filters.format.toUpperCase()) {
      continue;
    }
    if (filters.solvedOnly && !res.tags.includes('SOLVED')) {
      continue;
    }
    if (filters.pastPapersOnly && !res.tags.includes('PAST-PAPER')) {
      continue;
    }
    if (filters.currentOnly && !res.tags.includes('CURRENT')) {
      continue;
    }
    if (filters.tags.length > 0) {
      const hasAllTags = filters.tags.every(t => res.tags.includes(t.toUpperCase()));
      if (!hasAllTags) continue;
    }

    // Scoring weights based on Part 23
    const nameLower = res.name.toLowerCase();
    const courseNorm = normalizeCourseCode(res.course);

    // 1. Course Code Match (Highest weight: 100pts)
    if (parsed.course) {
      if (courseNorm === parsed.course) {
        score += 100;
      } else if (courseNorm.startsWith(parsed.course) || parsed.course.startsWith(courseNorm)) {
        score += 60;
      } else {
        // If a specific course was typed in the query (e.g. "CS302"), penalize non-matching courses
        score -= 50;
      }
    }

    // 2. Type Match (Very High: 45pts)
    for (const t of parsed.types) {
      if (res.type.toUpperCase() === t) {
        score += 45;
      }
    }

    // 3. Tag Match (High: 30pts each)
    for (const tag of parsed.tags) {
      if (res.tags.includes(tag)) {
        score += 30;
      }
    }

    // 4. Free text term matches in name
    for (const term of parsed.terms) {
      if (nameLower.includes(term)) {
        score += 35;
      }
      if (courseNorm.toLowerCase().includes(term)) {
        score += 40;
      }
    }

    // 5. Semantic quality bonuses (Part 23)
    if (res.tags.includes('SOLVED')) score += 15;
    if (res.tags.includes('CURRENT')) score += 12;
    if (res.tags.includes('PAST-PAPER')) score += 10;
    if (res.tags.includes('IMPORTANT')) score += 8;

    if (score > 0 || hasActiveFilters) {
      scoredList.push({ resource: res, score });
    }
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.slice(0, limit).map(item => item.resource);
}
