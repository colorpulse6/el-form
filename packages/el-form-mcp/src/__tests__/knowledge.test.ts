import { describe, it, expect } from "vitest";
import {
  OVERVIEW,
  KNOWLEDGE,
  listTopics,
  getTopic,
  searchKnowledge,
} from "../knowledge.js";

describe("knowledge base", () => {
  it("exposes a non-empty overview mentioning both APIs", () => {
    expect(OVERVIEW).toContain("AutoForm");
    expect(OVERVIEW).toContain("useForm");
  });

  it("lists every topic with key + title", () => {
    const topics = listTopics();
    expect(topics.length).toBe(KNOWLEDGE.length);
    for (const t of topics) {
      expect(t.key).toBeTruthy();
      expect(t.title).toBeTruthy();
    }
  });

  it("fetches a topic by key (case-insensitive, trimmed)", () => {
    expect(getTopic("autoform")?.title).toBe("AutoForm");
    expect(getTopic("  AutoForm  ")?.title).toBe("AutoForm");
  });

  it("returns undefined for an unknown topic", () => {
    expect(getTopic("does-not-exist")).toBeUndefined();
  });
});

describe("searchKnowledge", () => {
  it("ranks the most relevant topic first", () => {
    const hits = searchKnowledge("async validation");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].snippet.toLowerCase()).toContain("async");
  });

  it("returns hits with a key, title, and snippet", () => {
    const [hit] = searchKnowledge("autoform");
    expect(hit).toMatchObject({
      key: expect.any(String),
      title: expect.any(String),
      snippet: expect.any(String),
    });
  });

  it("returns nothing for an empty query or no match", () => {
    expect(searchKnowledge("")).toEqual([]);
    expect(searchKnowledge("zzzzzznotarealterm")).toEqual([]);
  });

  it("caps results at 4", () => {
    expect(searchKnowledge("form").length).toBeLessThanOrEqual(4);
  });
});
