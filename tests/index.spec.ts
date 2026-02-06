import { expect, test } from "vitest";
import { toString } from "../src/index.ts";

test("adds 1 + 2 to equal 3", () => {
  const tree = { type: "emphasis", value: "a" };

  const actual = toString(tree);

  const expected = "emphasis";
  expect(actual).toBe(expected);
});
