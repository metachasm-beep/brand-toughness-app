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

export interface RemediationShard {
    id: string;
    type: 'COPY' | 'CSS' | 'UX' | 'STRATEGY';
    problem: string;
    solution: string;
    codeSnippet?: string;
    impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RemediationOutput {
    solutions: RemediationShard[];
    overallAuthorityHeal: number;
}
