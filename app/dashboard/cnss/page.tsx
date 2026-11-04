import { redirect } from "next/navigation";

export default function CNSSRedirectPage() {
  redirect("/dashboard/tax?tab=cnss");
}
