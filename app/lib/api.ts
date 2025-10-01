import { supabase } from './supabase';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  authorId?: string;
  featuredImage?: string; // Base64 image data
  imageAlt?: string; // Alt text for the image
  children?: Article[]; // For nested hierarchy
}

export interface CreateArticleData {
  title: string;
  slug: string;
  content: string;
  category: string;
  status?: 'draft' | 'published';
  parentId?: string;
  authorId?: string;
  featuredImage?: string;
  imageAlt?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string;
}

// Article CRUD Operations
export const articleAPI = {
  // Get all articles
  async getAll(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return (data || []).map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      status: article.status || 'draft',
      parentId: article.parentId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      authorId: article.authorId,
      featuredImage: article.featuredImage,
      imageAlt: article.imageAlt,
    }));
  },

  // Get article by ID
  async getById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Article not found
      }
      console.error('Error fetching article:', error);
      throw new Error(`Failed to fetch article: ${error.message}`);
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      category: data.category,
      status: data.status || 'draft',
      parentId: data.parentId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt: data.publishedAt,
      authorId: data.authorId,
      featuredImage: data.featuredImage,
      imageAlt: data.imageAlt,
    };
  },

  // Create new article
  async create(articleData: CreateArticleData): Promise<Article> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        ...articleData,
        authorId: user.user?.id || articleData.authorId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      throw new Error(`Failed to create article: ${error.message}`);
    }

    return data;
  },

  // Update article
  async update(articleData: UpdateArticleData): Promise<Article> {
    const { id, ...updateData } = articleData;
    
    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating article:', error);
      throw new Error(`Failed to update article: ${error.message}`);
    }

    return data;
  },

  // Delete article
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting article:', error);
      throw new Error(`Failed to delete article: ${error.message}`);
    }
  },

  // Get articles by category
  async getByCategory(category: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching articles by category:', error);
      throw new Error(`Failed to fetch articles by category: ${error.message}`);
    }

    return data || [];
  },

  // Get articles with parent-child relationships
  async getWithHierarchy(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching articles hierarchy:', error);
      throw new Error(`Failed to fetch articles hierarchy: ${error.message}`);
    }

    return (data || []).map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      status: article.status as 'draft' | 'published',
      parentId: article.parentId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      authorId: article.authorId,
      featuredImage: article.featuredImage,
      imageAlt: article.imageAlt,
    }));
  },

  // Get articles organized by categories with nested children
  async getCategorizedHierarchy(): Promise<Record<string, Article[]>> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching categorized hierarchy:', error);
      throw new Error(`Failed to fetch categorized hierarchy: ${error.message}`);
    }

    const articles = (data || []).map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      status: article.status as 'draft' | 'published',
      parentId: article.parentId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      authorId: article.authorId,
      featuredImage: article.featuredImage,
      imageAlt: article.imageAlt,
    }));

    // Group articles by category
    const categorized: Record<string, Article[]> = {};
    
    articles.forEach(article => {
      const category = article.category || 'Uncategorized';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(article);
    });

    // Build hierarchy within each category
    Object.keys(categorized).forEach(category => {
      categorized[category] = this.buildHierarchy(categorized[category]);
    });

    return categorized;
  },

  // Helper function to build nested hierarchy from flat array
  buildHierarchy(articles: Article[], parentId: string | null = null): Article[] {
    return articles
      .filter(article => article.parentId === parentId)
      .map(article => ({
        ...article,
        children: this.buildHierarchy(articles, article.id)
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Create a new article with optional parent
  async createWithParent(data: CreateArticleData & { parentId?: string }): Promise<Article> {
    const articleData = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      category: data.category,
      status: data.status || 'draft',
      parent_id: data.parentId || null,
      author_id: data.authorId,
      featured_image: data.featuredImage,
      image_alt: data.imageAlt,
    };

    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      throw new Error(`Failed to create article: ${error.message}`);
    }

    return {
      id: newArticle.id,
      title: newArticle.title,
      slug: newArticle.slug,
      content: newArticle.content,
      category: newArticle.category,
      status: newArticle.status,
      parentId: newArticle.parent_id,
      createdAt: newArticle.created_at,
      updatedAt: newArticle.updated_at,
      publishedAt: newArticle.published_at,
      authorId: newArticle.author_id,
      featuredImage: newArticle.featured_image,
      imageAlt: newArticle.image_alt,
    };
  },

  // Get article statistics
  async getStats() {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting article count:', countError);
      throw new Error(`Failed to get article count: ${countError.message}`);
    }

    // Get categories count
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('articles')
      .select('category');

    if (categoriesError) {
      console.error('Error getting categories:', categoriesError);
      throw new Error(`Failed to get categories: ${categoriesError.message}`);
    }

    const uniqueCategories = new Set(categoriesData?.map(item => item.category) || []);

    // Get recent articles (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: recentCount, error: recentError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', weekAgo.toISOString());

    if (recentError) {
      console.error('Error getting recent articles count:', recentError);
      throw new Error(`Failed to get recent articles count: ${recentError.message}`);
    }

    return {
      total: totalCount || 0,
      categories: uniqueCategories.size,
      recent: recentCount || 0
    };
  },

  // Update article status
  async updateStatus(id: string, status: 'draft' | 'published'): Promise<Article> {
    const updateData: any = { 
      status
    };
    
    // Set publishedAt when publishing, clear it when moving to draft
    if (status === 'published') {
      updateData.publishedAt = new Date().toISOString();
    } else {
      updateData.publishedAt = null;
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating article status:', error);
      throw new Error(`Failed to update article status: ${error.message}`);
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      category: data.category,
      status: data.status,
      parentId: data.parentId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt: data.publishedAt,
      authorId: data.authorId,
      featuredImage: data.featuredImage,
      imageAlt: data.imageAlt,
    };
  },

  // Get articles by status
  async getByStatus(status?: 'draft' | 'published'): Promise<Article[]> {
    let query = supabase
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles by status:', error);
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return (data || []).map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      status: article.status || 'draft',
      parentId: article.parentId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      authorId: article.authorId,
      featuredImage: article.featuredImage,
      imageAlt: article.imageAlt,
    }));
  }
};

// Utility function to generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Utility function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Utility function to format relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
};
