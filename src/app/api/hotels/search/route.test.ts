import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("production hotel-search route wiring", () => {
  it("is disabled by default and does not require Google configuration", async () => {
    const response = await POST(
      new Request("http://localhost/api/hotels/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "Test Hotel", locale: "en" }),
      })
    );
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("HOTEL_SEARCH_DISABLED");
  });
});
