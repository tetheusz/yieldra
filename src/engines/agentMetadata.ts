/**
 * Yieldra Agent Metadata Engine
 * Generates ERC-8004 compliant metadata for Yieldra AI Agents.
 */

export interface AgentMetadata {
  name: string;
  description: string;
  image: string;
  agent_type: string;
  capabilities: string[];
  version: string;
  yieldra_config: {
    strategy: string;
    risk_profile: string;
  };
}

/**
 * Generates the metadata JSON for a Yieldra Agent based on user settings.
 */
export function generateAgentMetadata(
  address: string,
  strategyName: string,
  riskProfile: string
): AgentMetadata {
  return {
    name: `Yieldra Agent - ${address.slice(0, 6)}...${address.slice(-4)}`,
    description: "Autonomous Yield & Credit Engine Agent powered by Yieldra Protocol on Arc Network.",
    image: "https://yieldra.xyz/agent-avatar.png", // placeholder
    agent_type: "finance",
    capabilities: [
      "yield_optimization",
      "credit_scoring",
      "automated_rebalancing",
      "liquidity_provision"
    ],
    version: "1.0.0",
    yieldra_config: {
      strategy: strategyName,
      risk_profile: riskProfile
    }
  };
}

/**
 * For a real production app, we would upload this to IPFS.
 * For this implementation on Arc Testnet, we will use a data URI or a mock persistent link.
 */
export async function uploadMetadataToIPFS(metadata: AgentMetadata): Promise<string> {
  // In a real scenario, we'd use Pinata or similar.
  // Returning a mock CID for now to demonstrate the flow.
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  console.log("Mock Uploading Metadata to IPFS...", metadata);
  // bafkreid... is a sample CID
  return "ipfs://bafkreidv6f67h7u2f2j2p2j2p2j2p2j2p2j2p2j2p2j2p2j2p2j2p2j2p2";
}
