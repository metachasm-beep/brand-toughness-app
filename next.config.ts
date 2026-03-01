import type { NextConfig } from "next";
import { withCloudflare } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withCloudflare(nextConfig);

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
