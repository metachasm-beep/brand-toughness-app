import { BrandEngine } from './src/lib/audit/brandEngine';

async function test() {
    console.log("Testing Apple.com (heavy JS/Bot protection)...");
    const engine = new BrandEngine('https://www.apple.com');
    const data = await engine.scan();
    console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
