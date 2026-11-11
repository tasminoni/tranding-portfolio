export interface Position { section: string; x: number; y: number }
export interface Peer { id: string; name: string; color: string; position: Position | null }
export interface Project {
 id: string; title: string; category: string; label: string; summary: string;
 description: string; details: string[]; tools: string[]; url?: string; sourceUrl?: string;
 graphic: string; image?: string; pending?: boolean;
}
