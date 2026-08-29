/**
 * Exam replay URL round-trip
 *
 * The property that matters is that `a` stays pinned to `q` by position, even
 * when the bank has moved on since the link was made. Withholding a question
 * is what makes that reachable: an id in an old replay URL stops resolving,
 * and the reader used to walk the answer string against the questions it could
 * resolve, silently reassigning every later answer to the wrong question.
 */
import { describe, it, expect } from "vitest";
import {
  encodeReplayAnswers,
  decodeReplayIds,
  decodeReplayAnswers,
} from "@/lib/exam/replay";

const all = () => true;

describe("exam replay", () => {
  it("round-trips answers through the URL format", () => {
    const ids = [10, 20, 30, 40];
    const answers = { 10: 0, 20: 3, 40: 1 };
    const a = encodeReplayAnswers(ids, answers);

    expect(a).toBe("03x1");
    expect(decodeReplayAnswers(ids, a, all)).toEqual(answers);
  });

  it("parses ids and ignores junk in q", () => {
    expect(decodeReplayIds("10-20-30")).toEqual([10, 20, 30]);
    expect(decodeReplayIds("10--x-30")).toEqual([10, 30]);
  });

  it("encodes an option index above 9 in base36", () => {
    expect(encodeReplayAnswers([1], { 1: 11 })).toBe("b");
    expect(decodeReplayAnswers([1], "b", all)).toEqual({ 1: 11 });
  });

  it("keeps later answers on their own questions when one is withdrawn", () => {
    // The regression. Question 20 has been withheld since the link was made.
    const ids = [10, 20, 30, 40];
    const a = encodeReplayAnswers(ids, { 10: 0, 20: 3, 30: 1, 40: 2 });
    const available = (id: number) => id !== 20;

    const decoded = decodeReplayAnswers(ids, a, available);

    // 30 and 40 keep their own answers rather than inheriting 20's and 30's.
    expect(decoded).toEqual({ 10: 0, 30: 1, 40: 2 });
    expect(decoded[20]).toBeUndefined();
  });

  it("treats a missing or short answer string as unanswered", () => {
    expect(decodeReplayAnswers([1, 2], null, all)).toEqual({});
    expect(decodeReplayAnswers([1, 2, 3], "0", all)).toEqual({ 1: 0 });
    // More characters than ids: the extras have nothing to attach to.
    expect(decodeReplayAnswers([1], "012", all)).toEqual({ 1: 0 });
  });
});
