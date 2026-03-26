import {
  ComplaintCategory,
  ClassifyComplaintResult,
  Urgency,
  CATEGORY_DEPARTMENT_MAP,
} from '@/types';

// ---------------------- Keyword Groups ----------------------

const KEYWORD_MAP: Record<string, ComplaintCategory> = {
  // garbage_collection
  garbage: ComplaintCategory.GARBAGE_COLLECTION,
  waste: ComplaintCategory.GARBAGE_COLLECTION,
  trash: ComplaintCategory.GARBAGE_COLLECTION,
  dustbin: ComplaintCategory.GARBAGE_COLLECTION,
  sweeping: ComplaintCategory.GARBAGE_COLLECTION,

  // water_leakage
  water: ComplaintCategory.WATER_LEAKAGE,
  leakage: ComplaintCategory.WATER_LEAKAGE,
  pipe: ComplaintCategory.WATER_LEAKAGE,
  tap: ComplaintCategory.WATER_LEAKAGE,
  supply: ComplaintCategory.WATER_LEAKAGE,

  // sewer_blockage
  sewer: ComplaintCategory.SEWER_BLOCKAGE,
  blockage: ComplaintCategory.SEWER_BLOCKAGE,
  sewage: ComplaintCategory.SEWER_BLOCKAGE,

  // drain_overflow
  drain: ComplaintCategory.DRAIN_OVERFLOW,
  overflow: ComplaintCategory.DRAIN_OVERFLOW,

  // streetlight
  light: ComplaintCategory.STREETLIGHT,
  streetlight: ComplaintCategory.STREETLIGHT,
  lamp: ComplaintCategory.STREETLIGHT,
  dark: ComplaintCategory.STREETLIGHT,
  pillar: ComplaintCategory.STREETLIGHT,

  // pothole
  pothole: ComplaintCategory.POTHOLE,
  road: ComplaintCategory.POTHOLE,
  crater: ComplaintCategory.POTHOLE,
  bump: ComplaintCategory.POTHOLE,

  // illegal_dumping
  dump: ComplaintCategory.ILLEGAL_DUMPING,
  dumping: ComplaintCategory.ILLEGAL_DUMPING,
  debris: ComplaintCategory.ILLEGAL_DUMPING,

  // mosquito_sanitation
  mosquito: ComplaintCategory.MOSQUITO_SANITATION,
  stagnant: ComplaintCategory.MOSQUITO_SANITATION,
  dengue: ComplaintCategory.MOSQUITO_SANITATION,
  malaria: ComplaintCategory.MOSQUITO_SANITATION,

  // stray_animal
  dog: ComplaintCategory.STRAY_ANIMAL,
  cow: ComplaintCategory.STRAY_ANIMAL,
  animal: ComplaintCategory.STRAY_ANIMAL,
  stray: ComplaintCategory.STRAY_ANIMAL,

  // park_maintenance
  park: ComplaintCategory.PARK_MAINTENANCE,
  garden: ComplaintCategory.PARK_MAINTENANCE,
  tree: ComplaintCategory.PARK_MAINTENANCE,
  bench: ComplaintCategory.PARK_MAINTENANCE,

  // encroachment
  encroach: ComplaintCategory.ENCROACHMENT,
  illegal: ComplaintCategory.ENCROACHMENT,
  occupy: ComplaintCategory.ENCROACHMENT,
};

const URGENCY_KEYWORDS: string[] = [
  'urgent',
  'emergency',
  'danger',
  'accident',
  'child',
  'hospital',
];

// ---------------------- Classifier ----------------------

/**
 * Classify a complaint based on its description text and user-selected category.
 * Uses keyword matching to suggest a category and determine urgency.
 * The user-selected category is used as the primary choice; keyword-detected
 * category is used as a fallback or confidence signal.
 *
 * No LLM calls — rule-based only.
 */
export function classifyComplaint(
  description: string,
  userSelectedCategory: ComplaintCategory
): ClassifyComplaintResult {
  const lowerDescription = description.toLowerCase();
  const words = lowerDescription.split(/\s+/);

  // Count keyword matches per category
  const categoryCounts: Partial<Record<ComplaintCategory, number>> = {};

  for (const word of words) {
    // Strip common punctuation from word edges
    const cleanWord = word.replace(/[^a-z]/g, '');
    const matchedCategory = KEYWORD_MAP[cleanWord];
    if (matchedCategory) {
      categoryCounts[matchedCategory] =
        (categoryCounts[matchedCategory] || 0) + 1;
    }
  }

  // Determine the keyword-detected category (most matches)
  let detectedCategory: ComplaintCategory | null = null;
  let maxCount = 0;

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      detectedCategory = category as ComplaintCategory;
    }
  }

  // Use user-selected category as primary; calculate confidence
  const finalCategory = userSelectedCategory;
  let confidence = 0.5; // base confidence for user selection

  if (detectedCategory === userSelectedCategory) {
    // Keywords agree with user selection — high confidence
    confidence = Math.min(0.5 + maxCount * 0.1, 1.0);
  } else if (detectedCategory) {
    // Keywords suggest a different category — lower confidence
    confidence = 0.3;
  }

  // Determine urgency
  const isUrgent = URGENCY_KEYWORDS.some((keyword) =>
    lowerDescription.includes(keyword)
  );
  const urgency = isUrgent ? Urgency.HIGH : Urgency.MEDIUM;

  // Map category to department
  const department_id = CATEGORY_DEPARTMENT_MAP[finalCategory];

  return {
    category: finalCategory,
    department_id,
    urgency,
    confidence,
  };
}
