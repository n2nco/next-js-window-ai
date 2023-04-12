import { add, multiply } from "../utils";

describe("Utils", () => {
   
    
  test("add function adds two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  test("multiply function multiplies two numbers", () => {
    expect(multiply(2, 3)).toBe(6);
  });
});
