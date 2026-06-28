import { redirect } from "next/navigation";
import { AppTopbar } from "@/components/app-topbar";
import { ReleaseNotification } from "@/components/release-notification";
import { getPendingReleaseForUser } from "@/data/releases";
import { getCurrentSession } from "@/lib/session";

type AuthenticatedRecipesShellProps = {
  children: React.ReactNode;
  centerContent?: React.ReactNode;
};

export async function AuthenticatedRecipesShell({
  children,
  centerContent,
}: AuthenticatedRecipesShellProps) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/");
  }

  const pendingRelease = await getPendingReleaseForUser(session.user.id);

  return (
    <div className="min-h-screen">
      <AppTopbar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
        centerContent={centerContent}
      />
      <ReleaseNotification release={pendingRelease} />
      {children}
    </div>
  );
}
