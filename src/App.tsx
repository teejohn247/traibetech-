import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import {
  Dashboard,
  Login,
  LandingPage,
  ArticleEditor,
  ArticleList,
  ArticleView,
  Categories,
  Media
} from "./pages";
import { Layout } from "./components";

export default function App() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
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

  return (
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Layout user={user} />}>
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleEditor />} />
              <Route path="articles/:id/edit" element={<ArticleEditor />} />
              <Route path="categories" element={<Categories />} />
              <Route path="media" element={<Media />} />
              <Route path="*" element={<NoMatch />} />
            </Route>
            <Route path="/articles/:id/view" element={<ArticleView />} />
          </Routes>
        </div>
  );
}


function NoMatch() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-4">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
