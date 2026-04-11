# KPP Architecture Document

## 1. System Overview
Kaiitzn Pocket Pay (KPP) is a decentralized campus economy platform. It leverages the Stellar network for low-cost micro-payments and Soroban smart contracts for reward logic.

## 2. Component Diagram
```
[ Frontend (React) ] <--> [ Stellar Wallets Kit ] <--> [ User Wallet (Freighter/Albedo) ]
        |
        +--> [ Local Store (MVP State) ]
        |
        +--> [ Stellar SDK ] <--> [ Stellar Horizon API ]
                                        |
                                        +--> [ Soroban RPC ]
                                                |
                                                +--> [ KPP Points Contract ]
                                                +--> [ KPP Token Contract ]
```

## 3. Data Flow
1. **Earn**: User completes a task -> Frontend calls `awardPoints` -> Points Contract updates balance.
2. **Convert**: User clicks Convert -> Frontend calls `convert_to_tokens` -> Points Contract deducts points -> Token Contract mints KPP Tokens (Inter-contract call).
3. **Pay**: User scans QR -> Frontend builds Stellar transaction -> User signs via Wallet Kit -> Transaction submitted to Stellar Network.

## 4. Security Model
- **Non-Custodial**: Users own their keys. KPP never stores private keys.
- **On-Chain Validation**: Smart contracts enforce conversion rates and authorization.
- **Campus Identity**: Student IDs are used for UI personalization but mapped to on-chain addresses for value transfer.

## 5. Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion.
- **Blockchain**: Stellar Network, Soroban (Rust).
- **Tooling**: Stellar SDK, Stellar Wallets Kit, GitHub Actions (CI/CD).
