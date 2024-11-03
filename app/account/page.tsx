import { getServerSession } from "next-auth";
import Account from "./account";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }
  return <Account />;
}
