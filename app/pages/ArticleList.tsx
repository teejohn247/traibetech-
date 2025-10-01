import React, { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { articleAPI, formatRelativeTime, formatDate, type Article } from "../lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Folder
} from "lucide-react";

interface ExtendedArticle extends Article {
  children?: ExtendedArticle[];
}

interface CategoryTreeNodeProps {
  category: string;
  articles: Article[];
  expandedNodes: Set<string>;
  toggleExpanded: (nodeId: string) => void;
  deleteArticle: (id: string, title: string) => void;
  handleStatusChange: (id: string, newStatus: 'draft' | 'published') => Promise<void>;
}

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({ 
  category, 
  articles, 
  expandedNodes, 
  toggleExpanded, 
  deleteArticle,
  handleStatusChange
}) => {
  const categoryId = `category-${category}`;
  const isExpanded = expandedNodes.has(categoryId);

  const renderArticleNode = (article: Article, level: number = 0) => {
    return (
      <div key={article.id}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-green-50 ${
            level > 0 ? 'ml-6 border-l-2 border-green-200' : ''
          }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              {article.children && article.children.length > 0 ? (
                <button
                  onClick={() => toggleExpanded(article.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-green-100"
                >
                  {expandedNodes.has(article.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full" />
                </div>
              )}
              
              {article.featuredImage ? (
                <img
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  className="w-8 h-8 rounded object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <Link
                  to={`/articles/${article.id}/view`}
                  className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors block truncate"
                >
                  {article.title || 'Untitled Article'}
                </Link>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                  {level > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Child Article
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Link
              to={`/articles/${article.id}/edit`}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                const newStatus = article.status === 'published' ? 'draft' : 'published';
                handleStatusChange(article.id, newStatus);
              }}
              className={`text-xs font-medium px-2 py-1 rounded ${
                article.status === 'published'
                  ? 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100'
                  : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
              }`}
              title={article.status === 'published' ? 'Unpublish' : 'Publish'}
            >
              {article.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => deleteArticle(article.id, article.title)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Child Articles */}
        {article.children && article.children.length > 0 && expandedNodes.has(article.id) && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 space-y-1">
                {article.children.map((child) => renderArticleNode(child, level + 1))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => toggleExpanded(categoryId)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-green-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-green-600" />
          )}
          <Folder className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-gray-900">{category}</span>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>
      
      {/* Category Articles */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
                <div className="p-2 space-y-1">
                  {articles.map((article) => renderArticleNode(article))}
                </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface HierarchicalTableViewProps {
  articles: ExtendedArticle[];
  expandedNodes: Set<string>;
  toggleExpanded: (nodeId: string) => void;
  deleteArticle: (id: string, title: string) => Promise<void>;
  handleStatusChange: (id: string, newStatus: 'draft' | 'published') => Promise<void>;
}

const HierarchicalTableView: React.FC<HierarchicalTableViewProps> = ({ articles, expandedNodes, toggleExpanded, deleteArticle, handleStatusChange }) => {
  
  const renderTableRow = (article: ExtendedArticle, level: number = 0) => (
    <React.Fragment key={article.id}>
      {/* Parent Article Row */}
      <tr className={`hover:bg-gray-50 transition-colors ${level > 0 ? 'bg-green-50/30' : ''}`}>
        {/* Title Column with Expand/Collapse */}
        <td className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Indentation for child articles */}
            {level > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-px bg-gray-300"></div>
                <div className="w-px h-4 bg-gray-300"></div>
              </div>
            )}
            
            {/* Expand/Collapse Button */}
            <div className="flex-shrink-0">
              {article.children && article.children.length > 0 ? (
                <button
                  onClick={() => toggleExpanded(article.id)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {expandedNodes.has(article.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full" />
                </div>
              )}
            </div>

            {/* Article Image */}
            <div className="flex-shrink-0">
              {article.featuredImage ? (
                <img
                  className="h-12 w-12 rounded-lg object-cover border-2 border-gray-100"
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center border-2 border-gray-100">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            
            {/* Article Title and Info */}
            <div className="min-w-0 flex-1">
              <Link
                to={`/articles/${article.id}/view`}
                className="text-sm font-semibold text-gray-900 hover:text-green-600 transition-colors"
              >
                {article.title || 'Untitled Article'}
              </Link>
              <div className="flex items-center space-x-2 mt-1">
                {article.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {article.category}
                  </span>
                )}
                {level > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Child Article
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Date Column */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{new Date(article.createdAt).toLocaleDateString()}</div>
        </td>

        {/* Updated Column */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{formatRelativeTime(article.updatedAt)}</div>
        </td>

        {/* Category Column */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {article.category || 'Uncategorized'}
          </span>
        </td>

        {/* Status Column */}
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            article.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className="w-1.5 h-1.5 bg-current rounded-full mr-2" />
            {article.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </td>

        {/* Actions Column */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end space-x-2">
            <Link
              to={`/articles/${article.id}/edit`}
              className="text-green-600 hover:text-green-700"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </Link>
            <button
              onClick={() => {
                const newStatus = article.status === 'published' ? 'draft' : 'published';
                handleStatusChange(article.id, newStatus);
              }}
              className={`text-sm font-medium ${
                article.status === 'published'
                  ? 'text-orange-600 hover:text-orange-700'
                  : 'text-green-600 hover:text-green-700'
              }`}
              title={article.status === 'published' ? 'Unpublish' : 'Publish'}
            >
              {article.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => deleteArticle(article.id, article.title)}
              className="text-red-600 hover:text-red-700"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Child Articles */}
      {article.children && article.children.length > 0 && expandedNodes.has(article.id) && (
        <AnimatePresence>
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={6} className="p-0">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <table className="min-w-full">
                  <tbody className="bg-white divide-y divide-gray-50">
                    {article.children.map((child) => renderTableRow(child, level + 1))}
                  </tbody>
                </table>
              </motion.div>
            </td>
          </motion.tr>
        </AnimatePresence>
      )}
    </React.Fragment>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first article.</p>
          <Link
            to="/articles/new"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Updated</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {articles.map((article) => renderTableRow(article))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function ArticleList() {
  const [articles, setArticles] = useState<ExtendedArticle[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set()); // Start with all collapsed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categorizedArticles, setCategorizedArticles] = useState<Record<string, Article[]>>({});

  useEffect(() => {
    fetchArticles();
  }, []);

  // Fetch categorized hierarchy when switching to tree view
  useEffect(() => {
    if (viewMode === "tree") {
      fetchCategorizedHierarchy();
    }
  }, [viewMode]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedArticles = await articleAPI.getWithHierarchy();
      
      // Build hierarchy
      const articleMap = new Map<string, ExtendedArticle>();
      const rootArticles: ExtendedArticle[] = [];

      // First pass: create all articles
      fetchedArticles.forEach(article => {
        articleMap.set(article.id, { ...article, children: [] });
      });

      // Second pass: build hierarchy
      fetchedArticles.forEach(article => {
        if (article.parentId && articleMap.has(article.parentId)) {
          // Article has a valid parent - add it as a child
          const parent = articleMap.get(article.parentId)!;
          const child = articleMap.get(article.id)!;
          parent.children!.push(child);
        } else {
          // Article has no parent OR parent doesn't exist - treat as root level
          const rootArticle = articleMap.get(article.id)!;
          rootArticles.push(rootArticle);
        }
      });

      setArticles(rootArticles);

      // Extract unique categories
      const uniqueCategories = [...new Set(fetchedArticles.map(a => a.category).filter(Boolean))];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error("Error fetching articles:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorizedHierarchy = async () => {
    try {
      setLoading(true);
      const categorized = await articleAPI.getCategorizedHierarchy();
      setCategorizedArticles(categorized);
    } catch (err) {
      console.error("Failed to fetch categorized hierarchy:", err);
      setError("Failed to load categorized articles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await articleAPI.delete(id);
        await fetchArticles(); // Refresh the list
        await fetchCategorizedHierarchy(); // Also refresh categorized list
      } catch (error) {
        console.error("Error deleting article:", error);
        setError(error instanceof Error ? error.message : "Failed to delete article");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published') => {
    try {
      setLoading(true);
      await articleAPI.updateStatus(id, newStatus);
      await fetchArticles(); // Refresh the list
      await fetchCategorizedHierarchy(); // Also refresh categorized list
    } catch (error) {
      console.error("Error updating article status:", error);
      setError(error instanceof Error ? error.message : "Failed to update article status");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (articles: ExtendedArticle[]) => {
      articles.forEach(article => {
        allNodeIds.add(article.id);
        if (article.children) {
          collectIds(article.children);
        }
      });
    };
    collectIds(articles);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const TreeNode = ({ article, level = 0 }: { article: ExtendedArticle; level?: number }) => {
    const hasChildren = article.children && article.children.length > 0;
    const isExpanded = expandedNodes.has(article.id);
    const isCollapsible = true; // All articles are now collapsible to show details

    return (
      <motion.div 
        className="select-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: level * 0.05 }}
      >
        <div
          className={`group hover:bg-gray-50 transition-all duration-200 cursor-pointer border-l-2 ${
            level === 0 
              ? "bg-white border-l-green-500 shadow-sm" 
              : isExpanded 
                ? "bg-green-25 border-l-green-300" 
                : "border-l-gray-200"
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Main Article Row */}
          <div
            className="flex items-center py-3 px-4"
            onClick={() => toggleExpanded(article.id)}
          >
            {/* Expansion Arrow */}
            <div className="w-6 h-6 flex items-center justify-center mr-3">
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-green-600" />
              </motion.div>
            </div>

            {/* Article Icon */}
            <div className="w-8 h-8 mr-3 flex items-center justify-center">
              {article.featuredImage ? (
                <img
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  className="w-8 h-8 rounded object-cover border border-gray-200"
                />
              ) : level === 0 ? (
                <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded flex items-center justify-center">
                  <Folder className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${
                    level === 0 
                      ? "text-gray-900 text-base" 
                      : "text-gray-700 text-sm"
                  }`}>
                    {article.title}
                  </h3>
                  
                  {/* Category Badge */}
                  {article.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                      {article.category}
                    </span>
                  )}
                  
                  {/* Status Indicators */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {article.content.length > 0 && (
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Has content" />
                    )}
                    {article.featuredImage && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" title="Has featured image" />
                    )}
                  </div>
                </div>
                
                {/* Actions - Always visible on hover */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                  <Link
                    to={`/articles/${article.id}/view`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="View article"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/articles/${article.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Edit article"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteArticle(article.id, article.title);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Quick metadata */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span>Updated {formatRelativeTime(article.updatedAt)}</span>
                {hasChildren && (
                  <>
                    <span>•</span>
                    <span>{article.children!.length} {article.children!.length === 1 ? 'item' : 'items'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden bg-gradient-to-r from-green-25/20 to-emerald-25/20 border-t border-gray-100"
              >
                {/* Detailed Information */}
                <div className="px-4 py-3 ml-14 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 w-16">Title:</span>
                        <span className="text-gray-900">{article.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 w-16">Slug:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-green-700">
                          {article.slug}
                        </code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 w-16">Category:</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {article.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 w-16">Created:</span>
                        <span className="text-gray-700 text-xs">
                          {new Date(article.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 w-16">Author:</span>
                        <span className="text-gray-700 text-xs">
                          {article.authorId || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 w-16">Parent:</span>
                        <span className="text-gray-700 text-xs">
                          {article.parentId ? (
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {article.parentId}
                            </code>
                          ) : (
                            <span className="text-gray-400 italic">Root level</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  {article.content && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-medium text-gray-600 text-sm">Content Preview:</span>
                      <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-hidden">
                        {article.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                        {article.content.length > 200 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Children Articles */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
              className="overflow-hidden"
            >
              {article.children!.map((child) => (
                <TreeNode key={child.id} article={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Helper functions for the new table design
  const getStatusColor = (article: Article) => {
    if (article.status === 'published') {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    return status === 'published' ? 'Published' : 'Draft';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusDotColor = (status: string) => {
    return status === 'published' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const getProgressPercentage = (article: Article) => {
    let progress = 0;
    if (article.title) progress += 25;
    if (article.content && article.content.length > 100) progress += 25;
    if (article.category) progress += 25;
    if (article.featuredImage) progress += 25;
    return progress;
  };



  const TableView = () => {
    // Filter and paginate articles
    const filteredArticles = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            article.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const paginatedArticles = filteredArticles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center space-x-6">
            {['all', 'draft', 'published'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status === 'all' ? 'All (Most Recent)' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
            </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Updated</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
            </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
            </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {paginatedArticles.length > 0 ? (
                paginatedArticles.map((article, index) => {
                  const progress = getProgressPercentage(article);
                  
                  return (
                    <motion.tr
                      key={article.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* Title Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {article.featuredImage ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover border-2 border-gray-100"
                                src={article.featuredImage}
                                alt={article.imageAlt || article.title}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center border-2 border-gray-100">
                                <FileText className="w-5 h-5 text-green-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/articles/${article.id}/view`}
                              className="text-sm font-semibold text-gray-900 hover:text-green-600 transition-colors"
                            >
                              {article.title || 'Untitled Article'}
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              {article.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {article.category}
                </span>
                              )}
                              {article.authorId && (
                                <span className="text-xs text-gray-500">
                                  • Author: {article.authorId.substring(0, 8)}...
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                • {article.slug}
                              </span>
                            </div>
                          </div>
                        </div>
              </td>

                      {/* Date Column */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created
                          </div>
                        </div>
              </td>

                      {/* Updated Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Last Update: {formatRelativeTime(article.updatedAt)}
                          </div>
                        </div>
              </td>

                      {/* Category Column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          article.category === 'IEP' ? 'bg-green-100 text-green-800' :
                          article.category === 'MLP' ? 'bg-green-100 text-green-800' :
                          article.category === '504' ? 'bg-yellow-100 text-yellow-800' :
                          article.category === 'ALP' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {article.category || 'Uncategorized'}
                </span>
              </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(article)}`}>
                          <div className="w-1.5 h-1.5 bg-current rounded-full mr-2" />
                          {getStatusText(article.status)}
                        </span>
              </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                <Link
                  to={`/articles/${article.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit
                </Link>
                          {article.status === 'draft' ? (
                            <button
                              onClick={() => handleStatusChange(article.id, 'published')}
                              className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
                            >
                              Publish
                </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(article.id, 'draft')}
                              className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-colors"
                            >
                              Unpublish
                </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                      <p className="text-gray-500 mb-4">Get started by creating your first article.</p>
                      <Link
                        to="/articles/new"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Article
                      </Link>
                    </div>
              </td>
            </tr>
              )}
        </tbody>
      </table>
    </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {paginatedArticles.length > 0 ? (
            paginatedArticles.map((article, index) => {
              const progress = getProgressPercentage(article);
              
              return (
                <motion.div
                  key={article.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Article Header */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      {article.featuredImage ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover border-2 border-gray-100"
                          src={article.featuredImage}
                          alt={article.imageAlt || article.title}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center border-2 border-gray-100">
                          <FileText className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/articles/${article.id}/view`}
                        className="text-sm font-semibold text-gray-900 hover:text-green-600 transition-colors block truncate"
                      >
                        {article.title || 'Untitled Article'}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        {article.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {article.category}
                          </span>
                        )}
                        {article.authorId && (
                          <span className="text-xs text-gray-500">
                            • Author: {article.authorId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Article Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {formatDate(article.createdAt)}</span>
                      <span>Updated: {formatRelativeTime(article.updatedAt)}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(article.status)}`} />
                        {getStatusText(article.status)}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/articles/${article.id}/edit`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleStatusChange(article.id, article.status === 'published' ? 'draft' : 'published')}
                          className={`text-sm font-medium ${
                            article.status === 'published'
                              ? 'text-orange-600 hover:text-orange-700'
                              : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {article.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No articles found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{filteredArticles.length} Records</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Records per page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <ChevronRight className="w-4 h-4 rotate-180 -ml-2" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <ChevronRight className="w-4 h-4 -ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
  };


  if (loading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage your content hierarchy and organization.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === "tree"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } rounded-l-lg transition-colors`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                viewMode === "table"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } rounded-r-lg transition-colors`}
            >
              Table View
            </button>
          </div>
          
          {/* Expand/Collapse buttons - only show in tree view */}
          {/* {viewMode === "tree" && (
            <div className="flex rounded-lg shadow-sm">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-l-lg transition-colors"
                title="Expand all articles"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-sm font-medium bg-white text-gray-700 border-t border-b border-r border-gray-300 hover:bg-gray-50 rounded-r-lg transition-colors"
                title="Collapse all articles"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )} */}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              {/* <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => {
                    setViewMode("tree");
                    fetchCategorizedHierarchy();
                  }}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "tree"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tree
                </button>
              </div> */}
            <Link
              to="/articles/new"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading articles</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchArticles}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "tree" ? (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Article Tree Structure</h3>
            {Object.keys(categorizedArticles).length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== "all" ? "No articles found" : "No articles yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== "all" 
                    ? "Try adjusting your search or filter criteria." 
                    : "Get started by creating your first article."
                  }
                </p>
                {!searchQuery && selectedCategory === "all" && (
                  <Link
                    to="/articles/new"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categorizedArticles).map(([category, categoryArticles]) => (
                  <CategoryTreeNode 
                    key={category} 
                    category={category} 
                    articles={categoryArticles}
                    expandedNodes={expandedNodes}
                    toggleExpanded={toggleExpanded}
                    deleteArticle={deleteArticle}
                    handleStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
          <HierarchicalTableView 
            articles={articles}
            expandedNodes={expandedNodes}
            toggleExpanded={toggleExpanded}
            deleteArticle={deleteArticle}
            handleStatusChange={handleStatusChange}
          />
      )}
    </div>
  );
}
