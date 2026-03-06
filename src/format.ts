import type { identifyReplicant } from "voight-kampff-test";

type IdentifyReplicantResult = ReturnType<typeof identifyReplicant>;
type Classification = IdentifyReplicantResult["classification"];

export type VerifiedAutomation = {
  username: string;
  reason: string;
  issueUrl: string;
  createdAt: string;
};

const classificationConfig = {
  human: {
    label: "Organic activity",
    description: "No automation signals detected in the analyzed events.",
  },
  suspicious: {
    label: "Mixed activity",
    description:
      "Activity patterns show a mix of organic and automated signals.",
  },
  likely_bot: {
    label: "Automation signals",
    description: "Activity patterns show signs of automation.",
  },
} as const satisfies Record<Classification, object>;

type User = {
  followers: number;
  public_repos: number;
  created_at: string;
};

export function formatComment(
  actor: string,
  analysis: IdentifyReplicantResult,
  eventCount: number,
  user: User,
  verifiedAutomation?: VerifiedAutomation,
): string {
  const config = classificationConfig[analysis.classification];
  const lines: string[] = [];

  // Header
  lines.push(`## Agent Scan — @${actor}`);
  lines.push("");

  // Community Flag Alert
  if (verifiedAutomation) {
    lines.push("⚠️ **Community Flagged**");
    lines.push("");
    lines.push(`**Reason:** ${verifiedAutomation.reason}`);
    lines.push("");
    lines.push(`[View flagging issue](${verifiedAutomation.issueUrl})`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Score and Classification
  lines.push(`**Score:** ${analysis.score} — ${config.label}`);
  lines.push("");
  lines.push(`> ${config.description}`);
  lines.push("");

  // Activity Signals (Flags)
  if (analysis.flags.length > 0) {
    lines.push("### Activity Signals");
    lines.push("");
    for (const flag of analysis.flags) {
      lines.push(`**${flag.label}**`);
      lines.push(`${flag.detail}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
