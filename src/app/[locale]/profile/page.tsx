import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth/auth-options";
import { redirect } from "next/navigation";
import UserProfile from "@/app/components/profil-user/UserProfile";


export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/get-started");

  return <UserProfile />;
}
