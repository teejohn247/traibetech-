import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { Dashboard } from "~/pages";

export async function loader({ request }: LoaderFunctionArgs) {
  // Here you could fetch initial data for the dashboard
  return json({});
}

export default function DashboardRoute() {
  return <Dashboard />;
}
