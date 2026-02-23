import { WalletSelector } from "@near-wallet-selector/core";

export interface Proposal {
    id: number;
    proposer: string;
    title: string;
    description: string;
    votes: number;
    contributions: number; // in yoctoNEAR
    status: 'Active' | 'Passed' | 'Rejected'; // Synthetic status for UI
    endDate: number; // Synthetic timestamp
}

export interface Dataset {
    id: string;
    owner: string;
    title: string;
    description: string;
    size: string;
    price: number;
}

// Mock Data
const MOCK_PROPOSALS: Proposal[] = [
    {
        id: 1,
        proposer: "research-lab.testnet",
        title: "Cancer Research Dataset Acquisition",
        description: "Proposal to acquire a comprehensive dataset of histopathology images for cancer detection model training.",
        votes: 45,
        contributions: 5500000000000000000000000, // 5.5 NEAR
        status: 'Active',
        endDate: Date.now() + 86400000 * 2
    },
    {
        id: 2,
        proposer: "algo-dev.testnet",
        title: "Federated Learning Infrastructure",
        description: "Funding for setting up the initial nodes for our decentralized federated learning network.",
        votes: 120,
        contributions: 12500000000000000000000000, // 12.5 NEAR
        status: 'Passed',
        endDate: Date.now() - 86400000
    },
    {
        id: 3,
        proposer: "data-dao.testnet",
        title: "Urban Traffic Pattern Analysis",
        description: "community driven project to analyze traffic patterns in major cities using privacy-preserving techniques.",
        votes: 12,
        contributions: 1500000000000000000000000, // 1.5 NEAR
        status: 'Active',
        endDate: Date.now() + 86400000 * 5
    }
];

const MOCK_DATASETS: Dataset[] = [
    {
        id: "QmHash1",
        owner: "hospital-a.testnet",
        title: "Chest X-Ray Collection 2024",
        description: "5000 anonymized chest x-ray images annotated with common pathologies.",
        size: "45 GB",
        price: 0
    },
    {
        id: "QmHash2",
        owner: "satellite-img.testnet",
        title: "Global Vegetation Index Q3",
        description: "High resolution satellite imagery processing results for vegetation analysis.",
        size: "1.2 TB",
        price: 5
    }
];

export class NearService {
    private walletSelector: WalletSelector | null = null;
    private networkId = "testnet";

    constructor(walletSelector?: WalletSelector) {
        if (walletSelector) {
            this.walletSelector = walletSelector;
        }
    }

    // --- DAO / Proposals ---

    async getProposals(): Promise<Proposal[]> {
        console.log("Mock NearService: Fetching proposals...");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return [...MOCK_PROPOSALS];
    }

    async createProposal(title: string, description: string): Promise<number> {
        console.log(`Mock NearService: Creating proposal: ${title}`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newId = MOCK_PROPOSALS.length + 1;
        const newProposal: Proposal = {
            id: newId,
            proposer: "current-user.testnet", // Placeholder
            title,
            description,
            votes: 0,
            contributions: 0,
            status: 'Active',
            endDate: Date.now() + 86400000 * 7
        };
        MOCK_PROPOSALS.unshift(newProposal);
        return newId;
    }

    async vote(proposalId: number, amount: number): Promise<void> {
        console.log(`Mock NearService: Voting on ${proposalId} with ${amount} NEAR`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const proposal = MOCK_PROPOSALS.find(p => p.id === proposalId);
        if (proposal) {
            proposal.votes += 1;
            // Mock conversion, assuming amount is full NEAR
            proposal.contributions += amount * 1000000000000000000000000;
        }
    }

    // --- Provenance / Datasets ---

    async getDatasets(): Promise<Dataset[]> {
        console.log("Mock NearService: Fetching datasets...");
        await new Promise(resolve => setTimeout(resolve, 600));
        return [...MOCK_DATASETS];
    }

    async registerDataset(title: string, description: string, size: string): Promise<string> {
        console.log(`Mock NearService: Registering dataset: ${title}`);
        await new Promise(resolve => setTimeout(resolve, 1200));

        const newId = `QmMake${Date.now()}`;
        MOCK_DATASETS.push({
            id: newId,
            owner: "current-user.testnet",
            title,
            description,
            size,
            price: 0
        });
        return newId;
    }

    // --- DID ---

    async registerDID(accountId: string, publicKey: string): Promise<string> {
        console.log(`Mock NearService: Registering DID for ${accountId} with key ${publicKey}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `did:near:${accountId}`;
    }

    async getDID(accountId: string): Promise<string | null> {
        console.log(`Mock NearService: Resolving DID for ${accountId}`);
        // Simulate that everyone has a DID for now
        return `did:near:${accountId}`;
    }
}

export const nearService = new NearService();
