import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { Categories } from "~/pages";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export default function CategoriesRoute() {
  return <Categories />;
}
