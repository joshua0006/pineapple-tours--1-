import { getRezdyProducts } from "@/lib/services/rezdy-server";
import dynamicImport from "next/dynamic";

// @ts-ignore – Client component ships separately; type accuracy not critical here.
const RezdyDataClient = dynamicImport(() => import("./RezdyDataClient"), {
  ssr: false,
});

export const dynamic = "force-static"; // build time, still supports on-demand ISR revalidate below
export const revalidate = 3600; // 1-hour incremental revalidation

export default async function RezdyPage() {
  const products = await getRezdyProducts(1000, 0);
  return <RezdyDataClient initialProducts={products} />;
}
