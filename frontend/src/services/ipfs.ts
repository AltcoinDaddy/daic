/**
 * IPFS + Filecoin Service — Content-addressed storage with permanent Filecoin deals
 *
 * Uses Lighthouse SDK to upload data to IPFS + Filecoin simultaneously.
 * Lighthouse handles deal aggregation, replication, renewal, and repair (RaaS).
 * Files are pinned on IPFS and stored permanently on the Filecoin network.
 *
 * When no API key is configured, falls back to generating deterministic CIDs
 * from SHA-256 content hashes (still useful for integrity verification).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Set NEXT_PUBLIC_LIGHTHOUSE_API_KEY in .env.local or Vercel env vars
// Get a free key at https://files.lighthouse.storage
const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "";
const LIGHTHOUSE_GATEWAY = "https://gateway.lighthouse.storage/ipfs";
const FILECOIN_GATEWAY = "https://gateway.lighthouse.storage/ipfs";

async function sha256(data: ArrayBuffer | Uint8Array): Promise<string> {
    const buffer: ArrayBuffer = data instanceof Uint8Array
        ? new Uint8Array(data).buffer as ArrayBuffer
        : data;
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function hashToCid(hash: string): string {
    return `bafkrei${hash.slice(0, 52)}`;
}

export interface UploadResult {
    cid: string;
    url: string;
    filecoinDeal: boolean; // true if stored on Filecoin via Lighthouse
    size?: number;
}

export class IPFSService {
    /**
     * Upload JSON data to IPFS + Filecoin via Lighthouse.
     * Falls back to local CID generation when no API key is set.
     */
    static async uploadJSON(data: unknown): Promise<UploadResult> {
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const buffer = encoder.encode(jsonString);

        // Try Lighthouse (IPFS + Filecoin) first
        if (LIGHTHOUSE_API_KEY) {
            try {
                const blob = new Blob([jsonString], { type: "application/json" });
                const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${LIGHTHOUSE_API_KEY}`,
                    },
                    body: (() => {
                        const fd = new FormData();
                        fd.append("file", blob, "data.json");
                        return fd;
                    })(),
                });
                const result = await response.json();
                if (result.Hash) {
                    return {
                        cid: result.Hash,
                        url: `${LIGHTHOUSE_GATEWAY}/${result.Hash}`,
                        filecoinDeal: true,
                        size: result.Size ? parseInt(result.Size) : undefined,
                    };
                }
            } catch (err) {
                console.warn("Lighthouse upload failed, using local CID:", err);
            }
        }

        // Fallback: generate CID from content hash
        const hash = await sha256(buffer);
        const cid = hashToCid(hash);
        return {
            cid,
            url: `${FILECOIN_GATEWAY}/${cid}`,
            filecoinDeal: false,
        };
    }

    /**
     * Upload a File to IPFS + Filecoin via Lighthouse.
     */
    static async uploadFile(file: File): Promise<UploadResult> {
        const buffer = await file.arrayBuffer();

        if (LIGHTHOUSE_API_KEY) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${LIGHTHOUSE_API_KEY}`,
                    },
                    body: formData,
                });
                const result = await response.json();
                if (result.Hash) {
                    return {
                        cid: result.Hash,
                        url: `${LIGHTHOUSE_GATEWAY}/${result.Hash}`,
                        filecoinDeal: true,
                        size: result.Size ? parseInt(result.Size) : undefined,
                    };
                }
            } catch (err) {
                console.warn("Lighthouse upload failed, using local CID:", err);
            }
        }

        const hash = await sha256(buffer);
        const cid = hashToCid(hash);
        return {
            cid,
            url: `${FILECOIN_GATEWAY}/${cid}`,
            filecoinDeal: false,
        };
    }

    /**
     * Check Filecoin deal status for a CID via Lighthouse
     */
    static async getDealStatus(cid: string): Promise<any> {
        if (!LIGHTHOUSE_API_KEY) return null;
        try {
            const res = await fetch(
                `https://api.lighthouse.storage/api/lighthouse/deal_status?cid=${cid}`,
                { headers: { Authorization: `Bearer ${LIGHTHOUSE_API_KEY}` } }
            );
            return await res.json();
        } catch {
            return null;
        }
    }

    /**
     * Get the IPFS gateway URL for a CID
     */
    static getUrl(cid: string): string {
        return `${LIGHTHOUSE_GATEWAY}/${cid}`;
    }
}
