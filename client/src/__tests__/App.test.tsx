import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import App from "../App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    // Basic smoke test
    expect(document.body).toBeTruthy();
  });
});