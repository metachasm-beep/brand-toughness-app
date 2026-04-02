export interface AgentResponse {
    success: boolean;
    data: any;
    error?: string;
}

export interface BrandShard {
    id: string;
    focus: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PlannerOutput {
    shards: BrandShard[];
    totalConfidence: number;
}
