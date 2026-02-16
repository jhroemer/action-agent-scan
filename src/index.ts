import * as core from "@actions/core";
import * as github from "@actions/github";
import { IdentifyReplicantResult, identifyReplicant } from "voight-kampff-test";

type Classification = IdentifyReplicantResult["classification"];

const classificationLabels = {
  human: "Human",
  suspicious: "Suspicious",
  likely_bot: "Likely Bot",
} as const satisfies Record<Classification, string>;

function formatComment(
  actor: string,
  analysis: IdentifyReplicantResult,
  eventCount: number,
): string {
  const label = classificationLabels[analysis.classification];
  const lines: string[] = [];

  lines.push(`## Agent Scan — @${actor}`);
  lines.push("");
  lines.push(`**Score:** ${analysis.score} · **${label}**`);
  lines.push("");
  lines.push("| | |");
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

async function run(): Promise<void> {
  try {
    const token = core.getInput("github-token");
    const actor = github.context.actor;

    const octokit = github.getOctokit(token);

    const { data: user } = await octokit.rest.users.getByUsername({
      username: actor,
    });

    const { data: events } =
      await octokit.rest.activity.listPublicEventsForUser({
        username: actor,
        per_page: 100,
      });

    const prNumber = parseInt(core.getInput("pr-number"), 10);

    if (Number.isNaN(prNumber) || prNumber < 1) {
      core.info("No valid pull request number was found. Skipping.");
      return;
    }

    // @ts-expect-error type issue
    const analysis = identifyReplicant(user, events);

    const body = formatComment(actor, analysis, events.length);

    await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber,
      body,
    });
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred");
    }
  }
}

if (import.meta.main) {
  run();
}
