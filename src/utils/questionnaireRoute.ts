export function isQuestionnaireGroupId(value: string | undefined | null): boolean {
  const normalized = String(value ?? '').trim();
  return /^\d+$/.test(normalized);
}
