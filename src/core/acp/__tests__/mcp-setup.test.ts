import { describe, expect, it } from "vitest";

import { mergeCodexMcpServerIntoToml } from "../mcp-setup";

describe("mergeCodexMcpServerIntoToml", () => {
  it("preserves unrelated codex config while appending routa coordination", () => {
    const raw = `
model_provider = "custom"
model = "gpt-5.4"

[model_providers.custom]
name = "custom"
wire_api = "responses"
requires_openai_auth = true
base_url = "https://www.xmapi.cc/v1"

[mcp_servers.playwright]
type = "stdio"
command = "npx"
args = ["@playwright/mcp@latest"]
enabled = true
`;

    const merged = mergeCodexMcpServerIntoToml(raw, "routa-coordination", {
      url: "http://localhost:3500/api/mcp",
    });

    expect(merged).toContain('model_provider = "custom"');
    expect(merged).toContain('base_url = "https://www.xmapi.cc/v1"');
    expect(merged).toContain("[mcp_servers.playwright]");
    expect(merged).toContain("[mcp_servers.routa-coordination]");
    expect(merged).toContain('url = "http://localhost:3500/api/mcp"');
  });

  it("replaces an existing routa coordination block without dropping other entries", () => {
    const raw = `
[mcp_servers.routa-coordination]
url = "http://localhost:3500/api/mcp?old=1"
enabled = true

[mcp_servers.playwright]
type = "stdio"
command = "npx"
args = ["@playwright/mcp@latest"]
enabled = true
`;

    const merged = mergeCodexMcpServerIntoToml(raw, "routa-coordination", {
      url: "http://localhost:3500/api/mcp?new=1",
    });

    expect(merged).toContain('url = "http://localhost:3500/api/mcp?new=1"');
    expect(merged).not.toContain('url = "http://localhost:3500/api/mcp?old=1"');
    expect(merged).toContain("[mcp_servers.playwright]");
  });
});
