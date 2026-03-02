import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
	// Enable minification to stay under Cloudflare's 33MB script size limit
	minify: true,

	// Aggressive build optimizations
	dangerous: {
		disableTracedCaching: true,
	}
});
