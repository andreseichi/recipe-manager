export type AppRelease = {
  id: string;
  version: string;
  releasedAt: string;
  title: string;
  changes: string[];
};

export const APP_RELEASES = [
  {
    id: "2026-06-28-recipe-sharing",
    version: "0.3.0",
    releasedAt: "2026-06-28",
    title: "Compartilhamento de receitas",
    changes: [
      "Agora voce pode gerar um link publico para compartilhar uma receita.",
      "O link pode ser desativado quando quiser, invalidando o acesso antigo.",
    ],
  },
  {
    id: "2026-06-27-release-notifications",
    version: "0.2.0",
    releasedAt: "2026-06-27",
    title: "Avisos de novidades no app",
    changes: [
      "Agora o app avisa quando uma nova versao estiver disponivel.",
      "As novidades ficam vinculadas a sua conta e nao reaparecem depois de vistas.",
    ],
  },
] satisfies AppRelease[];

export function getLatestRelease(
  releases: readonly AppRelease[] = APP_RELEASES,
) {
  return releases.reduce<AppRelease | null>((latest, release) => {
    if (!latest) return release;

    const releaseTime = Date.parse(release.releasedAt);
    const latestTime = Date.parse(latest.releasedAt);

    if (releaseTime > latestTime) return release;
    if (releaseTime < latestTime) return latest;

    return release.id > latest.id ? release : latest;
  }, null);
}

export function getPendingReleaseForSeenIds(
  seenReleaseIds: Iterable<string>,
  releases: readonly AppRelease[] = APP_RELEASES,
) {
  const latestRelease = getLatestRelease(releases);

  if (!latestRelease) return null;

  return new Set(seenReleaseIds).has(latestRelease.id) ? null : latestRelease;
}

export function isKnownReleaseId(releaseId: string) {
  return APP_RELEASES.some((release) => release.id === releaseId);
}
