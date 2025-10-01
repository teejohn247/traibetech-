import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { ArticleView } from "~/pages";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({ articleId: params.id });
}

export default function ViewArticleRoute() {
  return <ArticleView />;
}
