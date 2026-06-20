import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export default async function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
