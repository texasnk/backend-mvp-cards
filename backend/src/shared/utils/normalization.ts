const MULTIPLE_SPACES_PATTERN = /\s+/g;

export function normalizeStudyDomainName(name: string): string {
  return name.trim().replace(MULTIPLE_SPACES_PATTERN, " ").toLowerCase();
}
