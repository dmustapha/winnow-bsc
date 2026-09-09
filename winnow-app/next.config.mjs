/** @type {import('next').NextConfig} */
export default { output: "standalone", experimental: { instrumentationHook: true }, serverExternalPackages: ["better-sqlite3"] };
