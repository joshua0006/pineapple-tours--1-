import { getWordPressData } from "@/lib/services/wordpress-server";
import dynamicImport from "next/dynamic";

// @ts-ignore
const WordPressDataClient = dynamicImport(
  () => import("./WordPressDataClient"),
  { ssr: false }
);

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function WordPressDataPage() {
  const data = await getWordPressData();
  return <WordPressDataClient initialData={data} />;
}
