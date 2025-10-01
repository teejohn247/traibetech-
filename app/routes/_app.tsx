import { json, redirect } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { supabase } from "~/lib/supabase";
import { LandingPage, Login } from "~/pages";
import { Layout } from "~/components";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export default function AppLayout() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user && showLogin) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  if (!user) {
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  // User is authenticated, show the layout with nested routes
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout user={user}>
        <Outlet />
      </Layout>
    </div>
  );
}
