export function getProfileUrl(petId: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${base}/#/pet/${petId}`;
}
