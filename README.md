# action-agent-scan

> A GitHub action that helps detecting if a contributor is an AI agent.

## What it does

Simple github action that utilizes [Matteo Gabriele](https://github.com/MatteoGabriele)'s [voight-kampff-test](https://github.com/MatteoGabriele/voight-kampff-test). This runs on PRs and adds a small summary about a contributor, with a focus on identifying if the contributor is likely to be an AI agent.

## Usage

```yaml
name: Agent Scan

on:
  pull_request:
    types: [opened]

jobs:
  agent_scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Agent Scan
        uses: jhroemer/action-agent-scan@v0.0.1
```

## License

MIT
