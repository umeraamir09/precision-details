import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
		// For email templates we sometimes use external full URLs; disabling
		// the image optimizer for these avoids build-time errors when using
		// arbitrary external image hosts. Keep this minimal and add domains as needed.
		unoptimized: true,
	},
};

export default nextConfig;
