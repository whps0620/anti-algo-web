/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This allows the production build to finish even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This ignores ESLint warnings/errors during the build as well
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;