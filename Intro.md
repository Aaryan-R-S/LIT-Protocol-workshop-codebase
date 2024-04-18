# What is Lit Protocol

- Lit is a decentralized key management network and platform for building applications and experiences that leverage threshold cryptography.

- With Lit, you can create and control keys and run code for virtually any application that can be made private, immutable, and/or autonomous.

- The system builds off of contemporary work in applied cryptography, secure enclaves, and distributed systems to provide the maximum amount of control and privacy to end users.

- Developers can use Lit to build apps with private data, intuitive wallet onboarding and asset management experiences, and immutable serverless functions that run based on the rules you set.

## How does Lit Protocol work

- Lit decentralizes public key cryptography through the use of secure multi-party computation (MPC) and threshold signature schemes (TSS).
- The Lit Network is a distributed network of nodes that securely manages cryptographic keys for signing, encryption, and compute.
- MPC and TSS remove the dependence on centralized key custodians, reducing the risk of key compromise.
- In the Lit Network, nodes perform distributed key generation (DKG) to create new key pairs without any party holding the entire key.
- Each node holds a key share and operations are performed in parallel, with results aggregated to form complete signatures or decryption keys.
- The network is robust and can function even when multiple participating parties are offline or malicious.
- Lit leverages AMD's Secure Encrypted Virtualization (SEV) for advanced hardware-level protection and additional security.
- SEV ensures that node operators never have direct access to key shares or computation processed inside nodes.
- User-facing operations use independent, encrypted channels, exposing shares only at the moment of recombination.
- The combination of MPC, TSS, and SEV provides robust security and versatile custody solutions for end users.

## How Lit Protocol works for:

1. Access Control:
    - Lit offers threshold encryption for regulating access to data stored on the Web.
    - Encryption and decryption happen client-side according to specific rules defined by the end user.
    - Access Control Conditions are used to define the parameters for access.
    - Conditions can be based on on-chain or off-chain data sources.
    - Lit does not store any encrypted content directly, allowing developers to choose their preferred storage provider.

2. Decentralized Programmable Signing and MPC Wallets:
    - Lit provides distributed ECDSA key-pairs known as Programmable Key Pairs (PKPs).
    - PKPs can be used for programmable, "smart" signing and authentication.
    - Lit Actions are JavaScript functions that dictate the signing and authentication logic for PKPs.
    - PKPs can be used to facilitate complex, condition-based automation within decentralized applications.
    - Each PKP is a wallet where the private key is distributed across the Lit Network.
    - Lit Actions are used to handle authentication logic and provide a seamless onboarding experience for users.

3. Supported Chains:
    - Lit is currently compatible with most EVM blockchains, Cosmos, and Solana.

## Use Cases

### Decentralized Access Control

The Lit Network can be used to introduce private and permissioned data to the open web through [threshold encryption](../resources/how-it-works.md), addressing the “public-by-default” nature of blockchains and public storage networks like IPFS. 

Encrypting your data with Lit is simple and a completely [client-side operation](../sdk/access-control/encryption.md). In order to decrypt, users have to meet the ([access control conditions](../sdk/access-control/evm/basic-examples.md)) you set. Some possible use cases for decentralized access control include:

1. Encrypted wallet-based messaging: Secure wallet-to-wallet communication. [Examples](https://github.com/LIT-Protocol/awesome/blob/main/README.md).

2. User-owned social and identity graphs (“self-sovereign data”): Empower users with full control over how their data is managed on the Web. [Examples](https://github.com/LIT-Protocol/awesome/blob/main/README.md).

3. Credential-gated spaces: Use token and credential ownership as “keys” to accessing exclusive spaces, content, and experiences. [Examples](https://github.com/LIT-Protocol/awesome/blob/main/README.md).

4. Private NFTs: Release NFTs with private embedded content that can only be accessed by the NFT owner themselves. 

### Programmable Signing and User Wallets

Interrelated but distinct from Lit’s decentralized encryption capabilities is the ability to generate programmable keys for non-custodial [user onboarding](../sdk/wallets/intro.md) and [serverless signing](../sdk/serverless-signing/overview.md). Some potential use cases include:

1. Event listening and condition-based transaction execution: Automate transactions with condition-based execution, enabling use cases such as on-chain limit orders, recurring payments, and more. [Example](https://spark.litprotocol.com/automated-portfolio-rebalancing-uniswap/).

2. Native cross-chain messaging and swaps: Transfer assets and data across blockchain networks without relying on a trusted intermediary or centralized asset bridge. [Example](https://spark.litprotocol.com/xchain-bridging-yacht-lit-swap/).

3. Seed-phraseless user onboarding and web2 authentication flows (such as SMS, Discord oAuth, Passkeys): Create easier onboarding experiences for non-crypto native users using familiar sign-on methods and session keys, while providing the full web3 capabilities of an EOA. [Examples](https://github.com/LIT-Protocol/awesome/blob/main/README.md?ref=spark.litprotocol.com#wallets-and-account-abstraction-aa).

4. Backup, recovery, and progressive self custody for account abstraction (AA): Use Lit to configure robust backup and recovery solutions for AA wallets (such as multi-factor authentication or social recovery methods), helping users avoid the loss of access to their assets due to lost or compromised keys. [Get started](https://spark.litprotocol.com/mass-adoption-of-digital-ownership-and-progressive-self-custody/).


## Join the Community

https://developer.litprotocol.com/v3/support/intro