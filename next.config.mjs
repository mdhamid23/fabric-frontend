/** @type {import('next').NextConfig} */
const normalizeBaseUrl = (value) => {
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value.replace(/\/$/, "");
    }

    return `http://${value.replace(/\/$/, "")}`;
};

const backendApiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:5001");

const authServerBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_AUTH_SERVER_BASE_URL || "localhost:9000");

const nextConfig = {
    cacheComponents: true,

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
        ],
    },

    reactStrictMode: true,
    poweredByHeader: false,

    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                ],
            },
        ];
    },

    async rewrites() {
        return [
            // Optional: only use this for public backend endpoints.
            {
                source: "/backend-api/:path*",
                destination: `${backendApiBaseUrl}/:path*`,
            },

            // Optional: auth server proxy if you need it from browser.
            {
                source: "/auth-api/:path*",
                destination: `${authServerBaseUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
