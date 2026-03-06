import { afterEach, describe, expect, it, vi } from "vitest";
import { identifyReplicant } from "voight-kampff-test";
import { formatComment, type VerifiedAutomation } from "../src/format";
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

      **Score:** 100 — Organic activity

      > No automation signals detected in the analyzed events.

      ### Profile Information

      | Metric | Value |
      |---|---|
      | Followers | 9 |
      | Public Repos | 12 |
      | Account Age | 3264 days |

      ### Analysis Details

      Analyzed from the last **10 public events**
      "
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

      **Score:** 40 — Automation signals

      > Activity patterns show signs of automation.

      ### Profile Information

      | Metric | Value |
      |---|---|
      | Followers | 0 |
      | Public Repos | 1 |
      | Account Age | 15 days |

      ### Analysis Details

      Analyzed from the last **15 public events**

      ### Activity Signals

      **Recently created**
      Account is 15 days old

      **Multiple forks**
      5 repos forked recently

      **Mostly external activity**
      100% of activity on other people's repos
      "
    `);
  });

  it("should display community flag when user is verified automation", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-18T12:00:00Z"));

    // @ts-expect-error type issue
    const analysis = identifyReplicant(replicantUserMock, replicantEventsMock);

    const verifiedAutomation: VerifiedAutomation = {
      username: "leon-kowalski",
      reason: "Automated spam and fork activity detected",
      issueUrl: "https://github.com/matteogabriele/agentscan/issues/123",
      createdAt: "2026-02-01T10:00:00Z",
    };

    const output = formatComment(
      "leon-kowalski",
      analysis,
      replicantEventsMock.length,
      verifiedAutomation,
    );

    expect(output).toMatchInlineSnapshot(`
      "## Agent Scan — @leon-kowalski

      ⚠️ **Community Flagged**

      **Reason:** Automated spam and fork activity detected

      [View flagging issue](https://github.com/matteogabriele/agentscan/issues/123)

      ---

      **Score:** 40 — Automation signals

      > Activity patterns show signs of automation.

      ### Profile Information

      | Metric | Value |
      |---|---|
      | Followers | 0 |
      | Public Repos | 1 |
      | Account Age | 15 days |

      ### Analysis Details

      Analyzed from the last **15 public events**

      ### Activity Signals

      **Recently created**
      Account is 15 days old

      **Multiple forks**
      5 repos forked recently

      **Mostly external activity**
      100% of activity on other people's repos
      "
    `);
  });
});
