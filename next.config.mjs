const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const isGithubPages = Boolean(process.env.GITHUB_ACTIONS);
const isUserPage = repoName.endsWith(".github.io");
const basePath = isGithubPages && repoName && !isUserPage ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
