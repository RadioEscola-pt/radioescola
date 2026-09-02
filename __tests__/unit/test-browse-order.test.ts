import { describe, it, expect } from "vitest";
import {
  ORDER_PARAM,
  browseHref,
  dealRanks,
  isRandomOrder,
  orderQuestions,
} from "@/lib/browse/order";

/** A deterministic rng, so an ordering can be asserted instead of sampled. */
function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}

const questions = [1, 2, 3, 4, 5].map((id) => ({ id }));

describe("Unit: browse order", () => {
  it("ranks every id exactly once", () => {
    const ranks = dealRanks([10, 20, 30, 40]);
    expect(ranks.size).toBe(4);
    expect([...ranks.values()].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it("deals the identity order when the rng always picks the last slot", () => {
    // Fisher-Yates with rng() -> ~1 swaps each element with itself.
    const ranks = dealRanks([7, 8, 9], sequence([0.999]));
    expect(orderQuestions([{ id: 7 }, { id: 8 }, { id: 9 }], ranks)).toEqual([
      { id: 7 },
      { id: 8 },
      { id: 9 },
    ]);
  });

  it("orders by rank, not by the input order", () => {
    const ranks = new Map([
      [3, 0],
      [1, 1],
      [5, 2],
      [2, 3],
      [4, 4],
    ]);
    expect(orderQuestions(questions, ranks).map((q) => q.id)).toEqual([3, 1, 5, 2, 4]);
  });

  it("keeps the relative order of a filtered subset", () => {
    const ranks = dealRanks(questions.map((q) => q.id));
    const all = orderQuestions(questions, ranks).map((q) => q.id);
    const subset = orderQuestions(
      questions.filter((q) => q.id !== 2 && q.id !== 4),
      ranks
    ).map((q) => q.id);
    expect(subset).toEqual(all.filter((id) => id !== 2 && id !== 4));
  });

  it("leaves the bank order alone without a deal", () => {
    expect(orderQuestions(questions, null).map((q) => q.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it("never mutates the input", () => {
    const input = [{ id: 3 }, { id: 1 }, { id: 2 }];
    orderQuestions(input, dealRanks([1, 2, 3], sequence([0])));
    expect(input.map((q) => q.id)).toEqual([3, 1, 2]);
  });

  it("keeps unranked questions in their given order", () => {
    // A deal from another category ranks none of these, so the page renders in
    // bank order rather than in half of someone else's shuffle.
    const ordered = orderQuestions(questions, new Map([[99, 0]]));
    expect(ordered.map((q) => q.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it("builds a href carrying both the topic and the order", () => {
    expect(browseHref("1", {})).toBe("/browse/1");
    expect(browseHref("1", { topic: "antenas" })).toBe("/browse/1?topic=antenas");
    expect(browseHref("1", { random: true })).toBe(`/browse/1?${ORDER_PARAM}=random`);
    expect(browseHref("2", { topic: "antenas", random: true })).toBe(
      `/browse/2?topic=antenas&${ORDER_PARAM}=random`
    );
    expect(browseHref("3", { topic: null, random: false })).toBe("/browse/3");
  });

  it("reads the order parameter", () => {
    expect(isRandomOrder("random")).toBe(true);
    expect(isRandomOrder(null)).toBe(false);
    expect(isRandomOrder("bank")).toBe(false);
    expect(isRandomOrder("Random")).toBe(false);
  });
});
