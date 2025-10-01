import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { articleAPI } from "../lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Search,
  FileText,
  X,
  Check
} from "lucide-react";

interface CategoryStats {
  name: string;
  count: number;
  articles: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
}

export default function Categories() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const articles = await articleAPI.getAll();
      
      // Group articles by category
      const categoryMap = new Map<string, CategoryStats>();
      
      articles.forEach(article => {
        const categoryName = article.category || "Uncategorized";
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            name: categoryName,
            count: 0,
            articles: []
          });
        }
        
        const category = categoryMap.get(categoryName)!;
        category.count++;
        category.articles.push({
          id: article.id,
          title: article.title,
          createdAt: article.createdAt
        });
      });

      // Sort articles within each category by creation date
      categoryMap.forEach(category => {
        category.articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      // Convert to array and sort by count
      const categoriesArray = Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count);

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditValue(categoryName);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editValue.trim()) return;
    
    try {
      // In a real implementation, you'd update all articles with this category
      // For now, we'll just update the local state
      setCategories(prev => 
        prev.map(cat => 
          cat.name === editingCategory 
            ? { ...cat, name: editValue.trim() }
            : cat
        )
      );
      
      setEditingCategory(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      // In a real implementation, you'd create a new category
      // For now, we'll just add it to the local state
      const newCategory: CategoryStats = {
        name: newCategoryName.trim(),
        count: 0,
        articles: []
      };
      
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${categoryName}" category? Articles in this category will become uncategorized.`)) {
      try {
        // In a real implementation, you'd update all articles in this category
        setCategories(prev => prev.filter(cat => cat.name !== categoryName));
      } catch (error) {
        console.error("Error deleting category:", error);
        setError("Failed to delete category");
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Organize and manage your content categories.</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </motion.button>
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchCategories}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCategoryName("");
              }}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.name}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {editingCategory === category.name ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-b border-green-500 focus:outline-none"
                      onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                      onBlur={handleSaveEdit}
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  )}
                  <p className="text-sm text-gray-600">{category.count} articles</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {editingCategory === category.name ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditCategory(category.name)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.name)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Recent Articles */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Articles</h4>
              {category.articles.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No articles in this category</p>
              ) : (
                <div className="space-y-2">
                  {category.articles.slice(0, 3).map((article) => (
                    <div key={article.id} className="flex items-center space-x-2 text-sm">
                      <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 truncate">{article.title}</span>
                    </div>
                  ))}
                  {category.articles.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{category.articles.length - 3} more articles
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No categories found" : "No categories yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Create your first category to organize your articles"
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          )}
        </div>
      )}
    </div>
  );
}
