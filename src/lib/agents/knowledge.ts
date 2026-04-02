import { prisma } from '../db';

export interface BrandVaultData {
    domain: string;
    totalAudits: number;
    evolvingContext: any;
    knowledgeItems: any[];
}

/**
 * KnowledgeStore (v2.0): The persistent memory layer for BrandOS AI.
 * Facilitates strategic continuity and longitudinal intelligence loop.
 */
export async function recallKnowledge(domain: string, userEmail: string): Promise<BrandVaultData | null> {
    try {
        const vault = await prisma.brandVault.findUnique({
            where: { domain_userEmail: { domain, userEmail } },
            include: { knowledgeItems: { take: 10, orderBy: { createdAt: 'desc' } } }
        });

        if (!vault) return null;

        return {
            domain: vault.domain,
            totalAudits: vault.totalAudits,
            evolvingContext: vault.evolvingContext,
            knowledgeItems: vault.knowledgeItems
        };
    } catch (e) {
        console.error('Knowledge recall failed:', e);
        return null;
    }
}

export async function learnKnowledge(
    domain: string, 
    userEmail: string, 
    type: 'STRATEGIC' | 'VISUAL' | 'MESSAGING' | 'UX',
    content: string,
    meta: any,
    evolvingContextUpdate: any
) {
    try {
        // Atomic Upsert of the Brand Vault
        const vault = await prisma.brandVault.upsert({
            where: { domain_userEmail: { domain, userEmail } },
            update: {
                totalAudits: { increment: 1 },
                evolvingContext: evolvingContextUpdate
            },
            create: {
                domain,
                userEmail,
                totalAudits: 1,
                evolvingContext: evolvingContextUpdate
            }
        });

        // Register new Knowledge Item (Strategic Shard)
        await prisma.knowledgeItem.create({
            data: {
                vaultId: vault.id,
                type,
                content,
                meta
            }
        });

        return true;
    } catch (e) {
        console.error('Learning loop failed:', e);
        return false;
    }
}
