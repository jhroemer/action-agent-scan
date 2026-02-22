import { afterEach, describe, expect, it, vi } from "vitest";
import { identifyReplicant } from "voight-kampff-test";
import { formatComment } from "../src/format";
import eventsMock from "./events-mock.json";
import replicantEventsMock from "./replicant-events-mock.json";
import replicantUserMock from "./replicant-user-mock.json";
import userMock from "./user-mock.json";

afterEach(() => {
  vi.useRealTimers();
});

describe("formatComment", () => {
  it("should produce the expected markdown output", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-18T12:00:00Z"));

    // @ts-expect-error type issue
    const analysis = identifyReplicant(userMock, eventsMock);
    const output = formatComment("rick-deckard", analysis, eventsMock.length);

    expect(output).toMatchInlineSnapshot(`
      "## Agent Scan — @rick-deckard

      **Score:** 100 · **Human**

      | | |
      |---|---|
      | Followers | 9 |
      | Repos | 12 |
      | Account age | 3264 days |

      Based on 10 recent events"
    `);
  });

  it("should identify a replicant as likely_bot", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-18T12:00:00Z"));

    // @ts-expect-error type issue
    const analysis = identifyReplicant(replicantUserMock, replicantEventsMock);
    const output = formatComment(
      "leon-kowalski",
      analysis,
      replicantEventsMock.length,
    );

    expect(analysis.classification).toBe("likely_bot");
    expect(analysis.score).toBeLessThan(50);
    expect(output).toMatchInlineSnapshot(`
      "## Agent Scan — @leon-kowalski

      **Score:** 40 · **Likely Bot**

      | | |
      |---|---|
      | Followers | 0 |
      | Repos | 1 |
      | Account age | 15 days |

      Based on 15 recent events

      ### Notable patterns

      - **Recently created** — Account is 15 days old
      - **Multiple forks** — 5 repos forked recently
      - **Mostly external activity** — 100% of activity on other people's repos"
    `);
  });
});
