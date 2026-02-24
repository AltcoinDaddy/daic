import { JsonRpcProvider } from "near-api-js";
import { actionCreators } from "@near-js/transactions";
import { NEAR_CONFIG } from "@/config";
import type { WalletSelector } from "@near-wallet-selector/core";

const { functionCall } = actionCreators;

// --- Types matching on-chain structs ---

export interface Proposal {
    id: number;
    proposer: string;
    title: string;
    description: string;
    votes: number;
    contributions: number; // yoctoNEAR
    voter_count: number;
    status: "Active" | "Funded" | "Completed";
}

export interface Dataset {
    id: string;
    owner: string;
    title: string;
    description: string;
    lineage: string[];
    timestamp: number;
}

export interface DIDDocument {
    id: string;
    verification_method: string;
    controller: string;
    created: number;
}

// --- Service ---

export class NearService {
    private provider: JsonRpcProvider;
    private walletSelector: WalletSelector | null = null;

    constructor() {
        this.provider = new JsonRpcProvider({ url: NEAR_CONFIG.nodeUrl });
    }

    setWallet(selector: WalletSelector) {
        this.walletSelector = selector;
    }

    // ─── View Call Helper ──────────────────────────────────────

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async viewMethod(
        contractId: string,
        methodName: string,
        args: Record<string, unknown> = {}
    ): Promise<any> {
        const result = await this.provider.callFunction({
            contractId,
            method: methodName,
            args,
            blockQuery: { finality: "final" },
        });
        return result;
    }

    // ─── Change Call Helper ────────────────────────────────────

    private async callMethod(
        contractId: string,
        methodName: string,
        args: Record<string, unknown> = {},
        deposit: bigint = 0n,
        gas: bigint = 30_000_000_000_000n
    ) {
        if (!this.walletSelector) {
            throw new Error("Wallet not connected");
        }
        const wallet = await this.walletSelector.wallet();
        const action = functionCall(methodName, args, gas, deposit);
        return wallet.signAndSendTransaction({
            receiverId: contractId,
            actions: [action],
        });
    }

    // ─── DAO / Proposals ───────────────────────────────────────

    async getProposals(): Promise<Proposal[]> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.daoContract,
                "get_all_proposals"
            );
            return (result as Proposal[]) ?? [];
        } catch (err) {
            console.error("Failed to fetch proposals:", err);
            return [];
        }
    }

    async getProposal(id: number): Promise<Proposal | null> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.daoContract,
                "get_proposal",
                { proposal_id: id }
            );
            return (result as Proposal) ?? null;
        } catch (err) {
            console.error("Failed to fetch proposal:", err);
            return null;
        }
    }

    async getProposalCount(): Promise<number> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.daoContract,
                "get_proposal_count"
            );
            return (result as number) ?? 0;
        } catch (err) {
            console.error("Failed to fetch proposal count:", err);
            return 0;
        }
    }

    async createProposal(title: string, description: string) {
        return this.callMethod(
            NEAR_CONFIG.daoContract,
            "create_proposal",
            { title, description }
        );
    }

    async vote(proposalId: number, amountNear: string) {
        // Convert NEAR to yoctoNEAR bigint (1 NEAR = 10^24 yoctoNEAR)
        const yocto = BigInt(Math.round(parseFloat(amountNear) * 1e6)) * BigInt(1e18);
        return this.callMethod(
            NEAR_CONFIG.daoContract,
            "vote",
            { proposal_id: proposalId },
            yocto
        );
    }

    async getMatchedFunding(proposalId: number): Promise<number> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.daoContract,
                "get_matched_funding",
                { proposal_id: proposalId }
            );
            return (result as number) ?? 0;
        } catch {
            return 0;
        }
    }

    async getMatchingPool(): Promise<number> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.daoContract,
                "get_matching_pool"
            );
            return (result as number) ?? 0;
        } catch {
            return 0;
        }
    }

    // ─── Provenance / Datasets ─────────────────────────────────

    async getDatasets(): Promise<Dataset[]> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.provenanceContract,
                "get_all_datasets"
            );
            return (result as Dataset[]) ?? [];
        } catch (err) {
            console.error("Failed to fetch datasets:", err);
            return [];
        }
    }

    async getDataset(id: string): Promise<Dataset | null> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.provenanceContract,
                "get_dataset",
                { id }
            );
            return (result as Dataset) ?? null;
        } catch (err) {
            console.error("Failed to fetch dataset:", err);
            return null;
        }
    }

    async registerDataset(
        id: string,
        title: string,
        description: string,
        lineage: string[] = []
    ) {
        return this.callMethod(
            NEAR_CONFIG.provenanceContract,
            "register_dataset",
            { id, title, description, lineage }
        );
    }

    // ─── DID Registry ──────────────────────────────────────────

    async registerDID(verificationMethod: string) {
        return this.callMethod(
            NEAR_CONFIG.didRegistryContract,
            "register_did",
            { verification_method: verificationMethod }
        );
    }

    async getDID(accountId: string): Promise<DIDDocument | null> {
        try {
            const result = await this.viewMethod(
                NEAR_CONFIG.didRegistryContract,
                "resolve_did",
                { account_id: accountId }
            );
            return (result as DIDDocument) ?? null;
        } catch (err) {
            console.error("Failed to resolve DID:", err);
            return null;
        }
    }
}

export const nearService = new NearService();
