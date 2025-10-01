import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";
import { articleAPI, formatDate, type Article } from "../lib/api";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Edit,
  Share,
  BookOpen,
  Clock,
  FileText,
  List,
  Home,
  ChevronRight
} from "lucide-react";

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedArticle = await articleAPI.getById(articleId);
      
      if (!fetchedArticle) {
        setError("Article not found");
        return;
      }

      setArticle(fetchedArticle);
      
      // Fetch related articles
      fetchRelatedArticles(fetchedArticle);
    } catch (error) {
      console.error("Error fetching article:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch article");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (currentArticle: Article) => {
    try {
      setSidebarLoading(true);
      const allArticles = await articleAPI.getAll();
      
      // Filter out current article and get related ones (same category or recent)
      const related = allArticles
        .filter(a => a.id !== currentArticle.id)
        .filter(a => a.category === currentArticle.category || !currentArticle.category)
        .slice(0, 5);
      
      setRelatedArticles(related);
    } catch (error) {
      console.error("Error fetching related articles:", error);
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: `Check out this article: ${article.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert("Article URL copied to clipboard!");
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Article URL copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The article you're looking for doesn't exist."}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate("/articles")}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Browse Articles
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => navigate("/articles")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group w-full"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:text-green-600 transition-colors" />
              <span className="group-hover:text-green-600 transition-colors font-medium">Back to Articles</span>
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 p-4 space-y-2">
            {/* Dashboard */}
            <Link
              to="/"
              className="flex items-center p-4 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-200 shadow-sm border border-gray-100"
            >
              <Home className="w-5 h-5 mr-4 text-gray-400" />
              <span className="font-medium">Dashboard</span>
            </Link>

            {/* Current Article - Active State */}
            <div className="flex items-center p-4 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-md">
              <BookOpen className="w-5 h-5 mr-4" />
              <span className="font-medium">Current Article</span>
            </div>

            {/* All Articles */}
            <Link
              to="/articles"
              className="flex items-center p-4 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-200 shadow-sm border border-gray-100"
            >
              <List className="w-5 h-5 mr-4 text-gray-400" />
              <span className="font-medium">All Articles</span>
            </Link>

            {/* Categories */}
            <Link
              to="/categories"
              className="flex items-center p-4 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-200 shadow-sm border border-gray-100"
            >
              <Tag className="w-5 h-5 mr-4 text-gray-400" />
              <span className="font-medium">Categories</span>
            </Link>

            {/* Media */}
            <Link
              to="/media"
              className="flex items-center p-4 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-200 shadow-sm border border-gray-100"
            >
              <FileText className="w-5 h-5 mr-4 text-gray-400" />
              <span className="font-medium">Media Library</span>
            </Link>

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <div className="pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">Related Articles</h3>
                <div className="space-y-2">
                  {relatedArticles.map((relatedArticle) => (
                    <Link
                      key={relatedArticle.id}
                      to={`/articles/${relatedArticle.id}/view`}
                      className="block p-3 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-start space-x-3">
                        {relatedArticle.featuredImage ? (
                          <img
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {relatedArticle.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {relatedArticle.category}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
              <Link
                to={`/articles/${article.id}/edit`}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  {article.category && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {article.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <main className="flex-1 overflow-auto p-6">
            <motion.article
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Featured Image */}
              {article.featuredImage && (
                <motion.div 
                  className="p-8 pb-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <img
                    src={article.featuredImage}
                    alt={article.imageAlt || article.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </motion.div>
              )}

              {/* Article Body */}
              <motion.div 
                className="p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-green-600 prose-code:bg-green-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </motion.div>

              {/* Article Footer */}
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Article ID: {article.slug}</p>
                    <p className="mt-1">Last updated: {formatDate(article.updatedAt)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleShare}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share Article
                    </button>
                    <Link
                      to={`/articles/${article.id}/edit`}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Article
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          </main>
        </div>
      </div>
    </div>
  );
}
