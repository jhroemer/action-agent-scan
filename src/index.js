import * as core from "@actions/core";
import * as github from "@actions/github";

try {
  const token = core.getInput("github-token");
  const owner = github.context.repo.owner;

  const octokit = github.getOctokit(token);
  const { data: user } = await octokit.rest.users.getByUsername({
    username: owner,
  });

  const createdAt = new Date(user.created_at);
  const now = new Date();
  const ageMs = now - createdAt;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  console.log(`User ${owner} has been on GitHub for ${ageDays} days`);
} catch (error) {
  core.setFailed(error.message);
}
