import * as core from "@actions/core";

try {
  console.log(`Hello from agent scan workflow`);
} catch (error) {
  core.setFailed(error.message);
}
