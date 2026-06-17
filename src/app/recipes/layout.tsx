import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
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

  return (
    <div className="min-h-screen lg:pl-64">
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
      />
      {children}
    </div>
  );
}
