import type { identifyReplicant } from "voight-kampff-test";

type IdentifyReplicantResult = ReturnType<typeof identifyReplicant>;
type Classification = IdentifyReplicantResult["classification"];

const classificationLabels = {
  human: "Human",
  suspicious: "Suspicious",
  likely_bot: "Likely Bot",
} as const satisfies Record<Classification, string>;

const classificationDot = {
  human: "🟢",
  suspicious: "🟡",
  likely_bot: "🔴",
} as const satisfies Record<Classification, string>;

export function formatComment(
  actor: string,
  analysis: IdentifyReplicantResult,
  eventCount: number,
): string {
  const label = classificationLabels[analysis.classification];
  const dot = classificationDot[analysis.classification];
  const lines: string[] = [];

  lines.push(`## Agent Scan — @${actor}`);
  lines.push("");
  lines.push(`**Score:** ${analysis.score} · ${dot} **${label}**`);
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---|");
  lines.push(`| Followers | ${analysis.profile.followers} |`);
  lines.push(`| Repos | ${analysis.profile.repos} |`);
  lines.push(`| Account age | ${analysis.profile.age} days |`);
  lines.push("");
  lines.push(`Based on ${eventCount} recent events`);

  if (analysis.flags.length > 0) {
    lines.push("\n### Notable patterns\n");
    for (const flag of analysis.flags) {
      lines.push(`- **${flag.label}** — ${flag.detail}`);
    }
  }

  return lines.join("\n");
}
