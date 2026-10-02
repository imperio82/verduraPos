import type { NextConfig } from "next";

// La web y la API corren en el mismo servicio: las llamadas a /api se
// reenvían a la API interna, así el navegador nunca sale del mismo dominio.
const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:3901";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiInternalUrl}/api/:path*` }];
  },
};

export default nextConfig;
