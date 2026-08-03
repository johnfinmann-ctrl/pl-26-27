import type { Team } from "@/types/domain";

/**
 * Neutral holdmarkør: klubforkortelse i en enkel cirkel med en neutral,
 * selvvalgt appfarve. Ingen officielle logoer eller trøjedesign (§3).
 */
export function TeamBadge({ team, size = 36 }: { team: Team; size?: number }) {
  return (
    <span
      role="img"
      aria-label={team.name}
      className="inline-flex items-center justify-center rounded-full font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: team.colorPrimary,
        color: isLight(team.colorPrimary) ? "#0B1220" : "#EAF0F7",
        fontSize: Math.max(10, size * 0.32),
      }}
    >
      {team.shortName}
    </span>
  );
}

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
