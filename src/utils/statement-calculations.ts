import { LineItem, StatementType } from '../types/financial';
import { STATEMENT_SECTIONS } from '../services/statement-structure';

export function calculateSectionTotals(
  items: LineItem[],
  type: StatementType
): Record<string, LineItem[]> {
  const sections = STATEMENT_SECTIONS[type];
  const result: Record<string, LineItem[]> = {};

  // Initialize sections
  Object.keys(sections).forEach(section => {
    result[section] = [];
  });

  // Sort items into sections
  items.forEach(item => {
    const code = item.section.substring(0, 4);
    let assigned = false;

    Object.entries(sections).forEach(([sectionName, codes]) => {
      if (Array.isArray(codes)) {
        if (codes.some(prefix => code.startsWith(prefix))) {
          result[sectionName].push(item);
          assigned = true;
        }
      } else {
        Object.entries(codes).forEach(([subSection, subCodes]) => {
          if (subCodes.some((prefix: string) => code.startsWith(prefix))) {
            const fullSectionName = `${sectionName}_${subSection}`;
            result[fullSectionName] = result[fullSectionName] || [];
            result[fullSectionName].push(item);
            assigned = true;
          }
        });
      }
    });

    // If item doesn't match any section, put in "other"
    if (!assigned) {
      result.other = result.other || [];
      result.other.push(item);
    }
  });

  return result;
}