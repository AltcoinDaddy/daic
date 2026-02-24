/**
 * P2P Chat Service — Decentralized messaging via Gun.js
 *
 * Gun.js provides decentralized, peer-to-peer data sync without a central server.
 * Messages are replicated across all connected peers via WebRTC + relay servers.
 *
 * NOTE: Gun.js is loaded dynamically because it doesn't support SSR.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    channel: string;
}

const APP_NAMESPACE = "daic-chat-v1";

let gunInstance: any = null;

async function getGun(): Promise<any> {
    if (gunInstance) return gunInstance;
    if (typeof window === "undefined") return null; // No Gun in SSR

    const Gun = (await import("gun")).default;
    await import("gun/sea");

    gunInstance = Gun({
        peers: [
            "https://gun-manhattan.herokuapp.com/gun",
            "https://gun-us.herokuapp.com/gun",
        ],
        localStorage: false,
    });

    return gunInstance;
}

export class ChatService {
    private channel: string;

    constructor(channel: string = "general") {
        this.channel = channel;
    }

    /**
     * Send a message to the current channel
     */
    async sendMessage(sender: string, text: string): Promise<ChatMessage> {
        const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            sender,
            text,
            timestamp: Date.now(),
            channel: this.channel,
        };

        const gun = await getGun();
        if (gun) {
            gun.get(APP_NAMESPACE)
                .get(this.channel)
                .get(msg.id)
                .put({
                    sender: msg.sender,
                    text: msg.text,
                    timestamp: msg.timestamp,
                    channel: msg.channel,
                });
        }

        return msg;
    }

    /**
     * Subscribe to new messages on the current channel.
     * Returns an unsubscribe function.
     */
    async onMessage(callback: (msg: ChatMessage) => void): Promise<() => void> {
        const gun = await getGun();
        if (!gun) return () => { };

        const seen = new Set<string>();

        gun.get(APP_NAMESPACE)
            .get(this.channel)
            .map()
            .on((data: any, key: string) => {
                if (!data || seen.has(key)) return;
                seen.add(key);

                const msg: ChatMessage = {
                    id: key,
                    sender: data.sender || "Unknown",
                    text: data.text || "",
                    timestamp: data.timestamp || Date.now(),
                    channel: this.channel,
                };

                callback(msg);
            });

        return () => {
            // Gun doesn't have clean per-listener unsubscribe
            gun.get(APP_NAMESPACE).get(this.channel).off();
        };
    }

    /**
     * Switch to a different channel
     */
    switchChannel(channel: string): void {
        this.channel = channel;
    }

    /**
     * Get the current channel name
     */
    getChannel(): string {
        return this.channel;
    }

    /**
     * List available channels
     */
    static getDefaultChannels(): { id: string; name: string; description: string }[] {
        return [
            { id: "general", name: "General", description: "Open discussion" },
            { id: "research", name: "Research", description: "AI research coordination" },
            { id: "datasets", name: "Datasets", description: "Dataset sharing & verification" },
            { id: "governance", name: "Governance", description: "DAO proposals & voting" },
        ];
    }
}
