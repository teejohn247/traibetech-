import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect to dashboard as the default authenticated route
  return redirect("/dashboard");
}
