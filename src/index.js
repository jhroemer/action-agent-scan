import * as core from "@actions/core";
import * as github from "@actions/github";
import { identifyReplicant } from "voight-kampff-test";

try {
  const token = core.getInput("github-token");
  const actor = github.context.actor;

  const octokit = github.getOctokit(token);

  const { data: user } = await octokit.rest.users.getByUsername({
    username: actor,
  });

  // TODO: needs error handling
  const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
    username: actor,
    per_page: 100,
  });

  const createdAt = new Date(user.created_at);
  const now = new Date();
  const ageMs = now - createdAt;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  const analysis = identifyReplicant(user, events);
  console.log(
    `User ${actor} has been on GitHub for ${analysis.profile.age} days`,
  );
  console.log(`The score is: ${analysis.score}`);
} catch (error) {
  core.setFailed(error.message);
}
