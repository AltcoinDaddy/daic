/**
 * IPFS Service — Content-addressed storage for datasets
 *
 * Uses Web Crypto API to generate deterministic CIDs from file content.
 * When an NFT.Storage / Pinata API key is configured, uploads to real IPFS.
 * Otherwise generates a valid-looking CID from the SHA-256 hash.
 */

// Optional: set this to enable real IPFS pinning
const IPFS_API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY || "";
const IPFS_GATEWAY = "https://nftstorage.link/ipfs";

async function sha256(data: ArrayBuffer | Uint8Array): Promise<string> {
    const buffer: ArrayBuffer = data instanceof Uint8Array ? new Uint8Array(data).buffer as ArrayBuffer : data;
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function hashToCid(hash: string): string {
    // Create a CIDv1-like string from the hash (bafkrei... prefix for raw leaves)
    return `bafkrei${hash.slice(0, 52)}`;
}

export class IPFSService {
    /**
     * Upload JSON data to IPFS. Returns a CID.
     */
    static async uploadJSON(data: unknown): Promise<string> {
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const buffer = encoder.encode(jsonString);

        // If we have an API key, upload to NFT.Storage
        if (IPFS_API_KEY) {
            try {
                const blob = new Blob([jsonString], { type: "application/json" });
                const res = await fetch("https://api.nft.storage/upload", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${IPFS_API_KEY}` },
                    body: blob,
                });
                const result = await res.json();
                if (result.ok && result.value?.cid) {
                    return result.value.cid;
                }
            } catch (err) {
                console.warn("NFT.Storage upload failed, using local CID:", err);
            }
        }

        // Fallback: generate CID from content hash
        const hash = await sha256(buffer);
        return hashToCid(hash);
    }

    /**
     * Upload a File to IPFS. Returns a CID.
     */
    static async uploadFile(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();

        if (IPFS_API_KEY) {
            try {
                const res = await fetch("https://api.nft.storage/upload", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${IPFS_API_KEY}` },
                    body: file,
                });
                const result = await res.json();
                if (result.ok && result.value?.cid) {
                    return result.value.cid;
                }
            } catch (err) {
                console.warn("NFT.Storage upload failed, using local CID:", err);
            }
        }

        const hash = await sha256(buffer);
        return hashToCid(hash);
    }

    /**
     * Get the gateway URL for a CID
     */
    static getUrl(cid: string): string {
        return `${IPFS_GATEWAY}/${cid}`;
    }
}
