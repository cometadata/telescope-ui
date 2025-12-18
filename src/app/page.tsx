import { getGlobalStats, getTopOrganizations } from "@/lib/data";
import HomeClient from "./HomeClient";

export default async function Home() {
  const [stats, topOrganizations] = await Promise.all([
    getGlobalStats(),
    getTopOrganizations(10),
  ]);

  return <HomeClient stats={stats} topOrganizations={topOrganizations} />;
}
