import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Eye, 
  Save, 
  Settings,
  Tag,
  Globe,
  Sidebar,
  FileText,
  ChevronRight,
  ChevronDown,
  X
} from "lucide-react";
import { articleAPI, generateSlug, type Article } from "../lib/api";
import { supabase } from "../lib/supabase";
import { ImageUpload } from "../components";

interface ExtendedArticle extends Article {
  author: string;
}

export default function ArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [article, setArticle] = useState<ExtendedArticle>({
    id: "",
    title: "",
    slug: "",
    content: "",
    category: "",
    status: "draft",
    parentId: "",
    createdAt: "",
    updatedAt: "",
    authorId: "",
    author: "Unknown User",
  });
  
  const [activeTab, setActiveTab] = useState<"content" | "meta" | "seo">("content");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [showPreview, setShowPreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => {
    // Initialize based on screen size if window is available
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    // Set initial sidebar visibility based on screen size
    const handleResize = () => {
      const shouldShow = window.innerWidth >= 1024;
      setShowSidebar(shouldShow);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        // Update article with current user as author if creating new article
        if (!isEditing) {
          setArticle(prev => ({
            ...prev,
            authorId: session.user.id,
            author: session.user.email?.split('@')[0] || session.user.email || "Unknown User"
          }));
        }
      }
    };

    getCurrentUser();
    
    if (isEditing && id) {
      fetchArticle(id);
    }
    fetchAllArticles();
  }, [isEditing, id]);

  const fetchAllArticles = async () => {
    try {
      const articles = await articleAPI.getAll();
      setAllArticles(articles);
      
      // Extract unique categories
      const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));
      setAvailableCategories(categories);
    } catch (error) {
      console.error("Error fetching articles for sidebar:", error);
    } finally {
      setSidebarLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const loadArticleIntoEditor = async (selectedArticle: Article) => {
      setLoading(true);
    try {
      // Load the full article data
      const fullArticle = await articleAPI.getById(selectedArticle.id);
      
      if (!fullArticle) {
        throw new Error("Article not found");
      }
      
      setArticle({
        ...fullArticle,
        author: fullArticle.authorId || "Unknown User"
      });
      
      setError(null);
    } catch (error) {
      console.error("Error loading article:", error);
      setError(error instanceof Error ? error.message : "Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async (articleId: string) => {
      setInitialLoading(true);
    try {
      const fetchedArticle = await articleAPI.getById(articleId);
      
      if (!fetchedArticle) {
        setError("Article not found");
        return;
      }

      // Extend the article with additional UI fields
      setArticle({
        ...fetchedArticle,
        author: fetchedArticle.authorId || "Unknown User"
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch article");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof ExtendedArticle, value: string) => {
    setArticle(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when title changes
    if (field === "title" && value) {
      const slug = generateSlug(value);
      setArticle(prev => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSave = async () => {
    if (!article.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const articleData = {
        title: article.title.trim(),
        slug: article.slug || generateSlug(article.title),
        content: article.content,
        category: article.category,
        parentId: article.parentId || undefined,
        featuredImage: article.featuredImage,
        imageAlt: article.imageAlt,
      };

      if (isEditing && id) {
        // Update existing article
        await articleAPI.update({
          id,
          ...articleData,
        });
      } else {
        // Create new article
        await articleAPI.create(articleData);
      }

      navigate("/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      setError(error instanceof Error ? error.message : "Failed to save article");
    } finally {
      setLoading(false);
    }
  };

  // Quill editor configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'video'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error && isEditing) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading article</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => navigate("/articles")}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Back to Articles
                </button>
                <button
                  onClick={() => fetchArticle(id!)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              value={article.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Article title..."
              className="text-xl sm:text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 w-full"
            />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-lg transition-colors ${
                showSidebar 
                  ? "bg-green-100 text-green-700 border-green-300" 
                  : "text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              }`}
              title="Toggle article tree"
            >
              <Sidebar className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Tree</span>
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-lg transition-colors ${
                showPreview 
                  ? "bg-green-100 text-green-700 border-green-300" 
                  : "text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Eye className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{showPreview ? "Edit" : "Preview"}</span>
            </button>
            <motion.button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{loading ? "Saving..." : "Save"}</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out lg:transform-none">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                Articles Tree
              </h3>
              <p className="text-sm text-gray-600 mt-1">Click an article to load it</p>
                  </div>
                  {/* Close button for mobile */}
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarLoading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                      className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="p-2">
                    {Object.entries(
                      allArticles.reduce((acc, article) => {
                        const category = article.category || 'Uncategorized';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(article);
                        return acc;
                      }, {} as Record<string, Article[]>)
                    ).map(([category, articles]) => (
                    <div key={category} className="mb-2">
                      <button
                        onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                          <div className="flex items-center">
                          {expandedCategories.has(category) ? (
                              <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                            )}
                            <span>{category}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {articles.length}
                        </span>
                      </button>

                      {expandedCategories.has(category) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 mt-1 space-y-1"
                        >
                          {articles.map((articleItem) => (
                            <button
                              key={articleItem.id}
                              onClick={() => loadArticleIntoEditor(articleItem)}
                                className={`w-full flex items-center p-2 text-left text-sm rounded-lg transition-colors group ${
                                  article.id === articleItem.id ? 'bg-green-100 text-green-700' : 'text-gray-700'
                              }`}
                            >
                              <FileText className={`w-4 h-4 mr-2 flex-shrink-0 ${
                                  article.id === articleItem.id ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium">
                                  {articleItem.title || 'Untitled'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {articleItem.slug}
                                </div>
                              </div>
                              {articleItem.content && (
                                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" title="Has content" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                  
                    {Object.keys(allArticles).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No articles found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { id: "content", label: "Content", icon: <Settings className="w-4 h-4" /> },
                { id: "meta", label: "Meta", icon: <Tag className="w-4 h-4" /> },
                { id: "seo", label: "SEO", icon: <Globe className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === "content" && (
              <div className="h-full flex flex-col">
                {showPreview ? (
                  <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-8">
                      <div className="prose prose-lg max-w-none">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">{article.title || "Untitled Article"}</h1>
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                      </div>
                    </div>
                          </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                        <ReactQuill
                          theme="snow"
                          value={article.content}
                          onChange={(content) => handleInputChange("content", content)}
                      modules={modules}
                      placeholder="Start writing your article..."
                      className="flex-1 flex flex-col"
                      style={{ height: '100%' }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "meta" && (
              <div className="flex-1 bg-gray-50">
                <div className="h-full overflow-y-auto p-4 sm:p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Slug
                    </label>
                    <input
                      type="text"
                      value={article.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="article-url-slug"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="space-y-2">
                      <select
                        value={article.category}
                        onChange={(e) => {
                          if (e.target.value === "create-new") {
                            setShowNewCategoryInput(true);
                          } else {
                            handleInputChange("category", e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select a category</option>
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="create-new">+ Create New Category</option>
                      </select>
                      
                      {showNewCategoryInput && (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter new category name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (newCategoryName.trim()) {
                                const trimmedCategory = newCategoryName.trim();
                                if (!availableCategories.includes(trimmedCategory)) {
                                  setAvailableCategories(prev => [...prev, trimmedCategory]);
                                }
                                handleInputChange("category", trimmedCategory);
                                setNewCategoryName("");
                                setShowNewCategoryInput(false);
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName("");
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Article (Optional)
                    </label>
                          <select
                      value={article.parentId || ""}
                      onChange={(e) => handleInputChange("parentId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">No Parent (Top Level)</option>
                      {allArticles
                        .filter(a => a.id !== article.id) // Don't allow self as parent
                        .map((parentArticle) => (
                          <option key={parentArticle.id} value={parentArticle.id}>
                            {parentArticle.category ? `[${parentArticle.category}] ` : ''}
                            {parentArticle.title || 'Untitled'}
                              </option>
                            ))}
                          </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select a parent article to create a nested structure
                    </p>
                        </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image
                    </label>
                    <ImageUpload
                      value={article.featuredImage}
                      onChange={(base64: string | undefined) => handleInputChange("featuredImage", base64 || "")}
                    />
                  </div>
                  
                  {article.featuredImage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={article.imageAlt || ""}
                        onChange={(e) => handleInputChange("imageAlt", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Describe the image for accessibility..."
                      />
                        </div>
                      )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Excerpt
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief summary of the article (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This excerpt will be used in article previews and social media sharing
                    </p>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reading Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated reading time for this article
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Article Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow comments</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured article</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Send notification to subscribers</span>
                      </label>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="flex-1  bg-gray-50">
                <div className="h-full overflow-y-auto p-4 sm:p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief description for search engines..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
        </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Graph Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Title for social media sharing"
                    />
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Graph Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Description for social media sharing"
                    />
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://example.com/canonical-url"
                    />
                </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Keyword
                    </label>
                  <input
                    type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Primary keyword for SEO"
                    />
                </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-3">SEO Preview</h4>
                    <div className="space-y-2">
                      <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                        {article.title || "Your Article Title"}
              </div>
                      <div className="text-green-700 text-sm">
                        https://yoursite.com/{article.slug || "article-slug"}
            </div>
                      <div className="text-gray-600 text-sm">
                        Meta description will appear here when you add one above...
              </div>
            </div>
                  </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}