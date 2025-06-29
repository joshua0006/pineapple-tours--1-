import { getRezdyProducts } from "@/lib/services/rezdy-server";
import dynamicImport from "next/dynamic";

// @ts-ignore
const HopOnHopOffClient = dynamicImport(() => import("./HopOnHopOffClient"));

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Page() {
  const products = await getRezdyProducts(1000, 0);
  return <HopOnHopOffClient initialProducts={products} />;
}
