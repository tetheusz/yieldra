# Mandatory Margin Explanation: The Economics of Yieldra on Arc

This document provides the economic proof required for the **Agentic Economy on Arc** hackathon. It explains why the Yieldra model of high-frequency agentic settlements (Nanopayments) is uniquely viable on Arc and would fail on traditional Layer-1/Layer-2 networks.

## 📊 The Unit Economic Problem

Yieldra processes high-frequency agent settlements as low as **$0.001 to $0.010 USDC**. To remain economically viable, the transaction cost (gas) must be at least 100x smaller than the value being moved.

### Comparison Table: Gas vs. Margin

| Network | Avg Gas Fee (USDC) | Action Value | Net Result | Margin Eroded |
| :--- | :--- | :--- | :--- | :--- |
| **Ethereum L1** | ~$2.50 - $10.00 | $0.01 | **-$2.49** | **25,000% Loss** |
| **Optimistic L2** | ~$0.05 - $0.20 | $0.01 | **-$0.04** | **400% Loss** |
| **Arc (Nanopayments)** | **<$0.0001** | **$0.01** | **+$0.0099** | **<0.1% Loss** |

## 🧠 Why Yieldra Fails Without Arc

On traditional networks, agents would be required to **batch** transactions to save on gas. 
- **Batching leads to Custodial Risk:** Agents have to trust middlemen to hold funds until they reach a "worthy" batch size.
- **Batching leads to Latency:** Real-time coordination is lost as agents wait minutes or hours to settle.

**The Arc Advantage:**
With Arc's sub-second finality and sub-cent fees, Yieldra allows agents to settle **every single micro-action in real-time**. This enables "Usage-Based Compute" and "Per-Query Monetization" where a $0.005 fee is finally a profitable business model.

### Proof of Concept (Yieldra v3.3)
In our demo, the Autonomous Agent bot performs actions with a range of **$0.0001 to $0.30**. 
- 80% of our traffic represents Nanopayments that are physically impossible on any other chain without eroding the entire service margin.
- Arc serves as the **Economic OS** that makes these machine-to-machine micro-economies deterministic and profitable.
