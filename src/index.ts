import * as core from "@actions/core";
import * as github from "@actions/github";
import { identifyReplicant } from "voight-kampff-test";
import { formatComment, type VerifiedAutomation } from "./format";

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

    // Fetch verified automations list
    let verifiedAutomation: VerifiedAutomation | undefined;
    try {
      const { data: verifiedList } = await octokit.rest.repos.getContent({
        owner: "matteogabriele",
        repo: "agentscan",
        path: "data/verified-automations-list.json",
      });

      if ("content" in verifiedList) {
        const content = Buffer.from(verifiedList.content, "base64").toString(
          "utf-8",
        );
        const verified = JSON.parse(content) as VerifiedAutomation[];
        verifiedAutomation = verified.find((v) => v.username === actor);
      }
    } catch (err) {
      core.debug(`Failed to fetch verified automations: ${err}`);
      // Continue without verified automation data if fetch fails
    }

    const analysis = identifyReplicant(user, events);

    const body = formatComment(
      actor,
      analysis,
      events.length,
      verifiedAutomation,
    );

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
