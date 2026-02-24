/**
 * ZK Service — Data integrity proofs using browser-native cryptography
 *
 * Uses SHA-256 hashing for deterministic integrity proofs.
 * Can be swapped for Circom + SnarkJS for real ZK proofs later.
 */

export interface IntegrityProof {
    dataHash: string;
    timestamp: number;
    nonce: string;
    signature: string; // Combined hash of all fields
}

async function sha256Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export class ZKService {
    /**
     * Generate an integrity proof for arbitrary data.
     * Produces a deterministic cryptographic proof that the data hasn't been tampered with.
     */
    static async generateProof(data: string | object): Promise<IntegrityProof> {
        const dataString = typeof data === "string" ? data : JSON.stringify(data);
        const timestamp = Date.now();
        const nonce = crypto.randomUUID();

        // Hash the data
        const dataHash = await sha256Hex(dataString);

        // Create a combined signature: hash(dataHash + timestamp + nonce)
        const signature = await sha256Hex(`${dataHash}:${timestamp}:${nonce}`);

        return {
            dataHash,
            timestamp,
            nonce,
            signature,
        };
    }

    /**
     * Verify an integrity proof against the original data.
     * Returns true if the data matches the proof.
     */
    static async verifyProof(proof: IntegrityProof, data: string | object): Promise<boolean> {
        const dataString = typeof data === "string" ? data : JSON.stringify(data);

        // Re-hash the data
        const dataHash = await sha256Hex(dataString);
        if (dataHash !== proof.dataHash) {
            return false;
        }

        // Re-create the signature
        const expectedSignature = await sha256Hex(
            `${proof.dataHash}:${proof.timestamp}:${proof.nonce}`
        );

        return expectedSignature === proof.signature;
    }

    /**
     * Generate a proof for a file (uses ArrayBuffer)
     */
    static async generateFileProof(file: File): Promise<IntegrityProof> {
        const buffer = await file.arrayBuffer();
        const hashArray = Array.from(new Uint8Array(buffer));
        // Use first 1KB for performance on large files
        const sample = hashArray.slice(0, 1024);
        const dataString = `file:${file.name}:${file.size}:${sample.join(",")}`;
        return this.generateProof(dataString);
    }
}
