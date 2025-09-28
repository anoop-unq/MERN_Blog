
import { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import moment from 'moment';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { 
  ChatBubbleOvalLeftEllipsisIcon, 
  TagIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmModal';

const PostList = ({ posts: postsProp }) => {
  const { 
    posts: contextPosts, 
    isLoadingPosts, 
    userdata, 
    likePost, 
    addComment,
    deleteComment,
    fetchPosts,
    fetchComments,
    updatePostInContext 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const posts = postsProp || contextPosts;
  
  // Add new states for fetching posts
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Existing states
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRefs = useRef({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [showCommentsForPost, setShowCommentsForPost] = useState({});
  const [localLikes, setLocalLikes] = useState({});
  const [localLoading, setLocalLoading] = useState({});
  const [postComments, setPostComments] = useState({});
  const [delayedLoading, setDelayedLoading] = useState({});
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch posts on component mount if no posts are provided via props
  useEffect(() => {
    if (!postsProp && fetchPosts && (posts.length === 0 || fetchError)) {
      handleFetchPosts();
    }
  }, [postsProp, fetchPosts, posts.length, fetchError]);

  // Function to handle fetching posts
  const handleFetchPosts = async () => {
    if (!fetchPosts) {
      console.error('fetchPosts function not available in context');
      setFetchError('Unable to load posts. Please refresh the page.');
      return;
    }

    setIsRefreshing(true);
    setFetchError(null);
    
    try {
      await fetchPosts();
      // toast.success('Posts refreshed successfully!');
    } catch (error) {
      console.error('Error fetching posts:', error);
      setFetchError('Failed to load posts. Please try again.');
      // toast.error('Failed to refresh posts');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    await handleFetchPosts();
  };

  // Function to navigate to view description page
  const handleViewDescription = (post) => {
    navigate(`/view-description/post/${post._id}`, { 
      state: { 
        post: {
          ...post,
          description: post.description || '',
          tags: post.tags || [],
          imageUrl: post.imageUrl || '',
          content: post.content || '',
          author: post.author || {}
        }
      }
    });
  };

  // Extract all unique tags from posts - handle both string and object tags
  const extractTagName = (tag) => {
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object') return tag.name || tag._id || 'Unknown';
    return String(tag);
  };

  const extractTagSlug = (tag) => {
    if (typeof tag === 'string') return tag.toLowerCase();
    if (typeof tag === 'object') return (tag.slug || tag.name || tag._id || 'unknown').toLowerCase();
    return String(tag).toLowerCase();
  };

  // Get all unique tags from posts
  const allTags = [...new Set(posts.flatMap(post => 
    (post.tags || []).map(tag => extractTagSlug(tag))
  ))].filter(Boolean);

  // Helper function to check if a post has a specific tag
  const postHasTag = (post, targetTagSlug) => {
    if (!post.tags || !post.tags.length) return false;
    
    return post.tags.some(tag => {
      const tagSlug = extractTagSlug(tag);
      return tagSlug === targetTagSlug;
    });
  };
  
  // Filter posts based on selected filters and search query
  const filteredPosts = posts.filter(post => {
    const hasImage = post.imageUrl && post.imageUrl.trim() !== '';
    const hasMatchingTag = tagFilter === 'all' || postHasTag(post, tagFilter);
    
    // Apply type and tag filters
    let passesFilter = false;
    if (filter === 'images') passesFilter = hasImage && hasMatchingTag;
    else if (filter === 'text') passesFilter = !hasImage && hasMatchingTag;
    else passesFilter = hasMatchingTag; // 'all' filter
    
    // Apply search filter if search query exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      
      // Check if post content matches search query
      const contentMatches = post.content && 
        post.content.toLowerCase().includes(query);
      
      // Check if description matches search query
      const descriptionMatches = post.description && 
        post.description.toLowerCase().includes(query);
      
      // Check if any tag matches search query
      const tagMatches = post.tags && 
        post.tags.some(tag => {
          const tagName = extractTagName(tag).toLowerCase();
          return tagName.includes(query) || tagName.startsWith(query);
        });
      
      // Check if author name matches search query
      const authorMatches = post.author?.name && 
        post.author.name.toLowerCase().includes(query);
      
      // Only include posts that match search criteria AND other filters
      return passesFilter && (contentMatches || descriptionMatches || tagMatches || authorMatches);
    }
    
    return passesFilter;
  });

  // Apply filter with loading delay
  const handleFilterChange = (newFilter) => {
    if (filter === newFilter) return;
    
    setIsFiltering(true);
    setFilter(newFilter);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsFiltering(false);
    }, 500);
  };

  // Apply tag filter
  const handleTagFilterChange = (newTag) => {
    setIsFiltering(true);
    setTagFilter(newTag);
    
    setTimeout(() => {
      setIsFiltering(false);
    }, 500);
  };

  // Clear all filters
  const clearFilters = () => {
    setIsFiltering(true);
    setFilter('all');
    setTagFilter('all');
    setSearchQuery('');
    
    setTimeout(() => {
      setIsFiltering(false);
    }, 500);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsFiltering(true);
    
    // Debounce the search filtering
    setTimeout(() => {
      setIsFiltering(false);
    }, 300);
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
    setIsFiltering(true);
    
    setTimeout(() => {
      setIsFiltering(false);
    }, 300);
  };

  // Combined loading state
  const isLoading = (isLoadingPosts || isRefreshing) && !postsProp;

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading amazing posts...</p>
        </div>
      </div>
    );
  }

  // Error state display
  if (fetchError && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <XMarkIcon className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Failed to load posts</h3>
          <p className="text-gray-600 mb-4">{fetchError}</p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {isRefreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const handleProfileClick = (userId) => {
    if (userId) {
      navigate(`/view-users/${userId}`);
    }
  };

  const handleLike = async (postId) => {
    if (!userdata?.user?._id) {
      navigate('/login');
      return;
    }
    
    if (localLoading[postId]) return;
    setLocalLoading(prev => ({ ...prev, [postId]: true }));

    try {
      const post = posts.find(p => p._id === postId);
      const isCurrentlyLiked = post.likes.includes(userdata.user._id);
      
      const updatedPost = {
        ...post,
        likes: isCurrentlyLiked 
          ? post.likes.filter(id => id !== userdata.user._id)
          : [...post.likes, userdata.user._id]
      };
      
      updatePostInContext(updatedPost);
      await likePost(postId);
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLocalLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const loadComments = async (postId) => {
    if (commentsLoading[postId]) return;
    
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      console.log('Fetching comments for post:', postId);
      const comments = await fetchComments(postId);
      console.log('Received comments:', comments);
      
      // Validate and process comments
      const processedComments = Array.isArray(comments) ? comments.map(comment => {
        // Handle both populated and unpopulated comments
        if (typeof comment === 'string') {
          return {
            _id: comment,
            content: 'Loading...',
            author: {
              _id: null,
              name: 'Unknown User',
              username: 'unknown',
              photo: assets.user_image
            },
            createdAt: new Date().toISOString()
          };
        }
        
        return {
          ...comment,
          _id: comment._id || Date.now().toString(),
          content: comment.content || 'No content',
          author: comment.author || {
            _id: null,
            name: 'Unknown User',
            username: 'unknown',
            photo: assets.user_image
          },
          createdAt: comment.createdAt || new Date().toISOString()
        };
      }) : [];
      
      // Store comments in local state
      setPostComments(prev => ({
        ...prev,
        [postId]: processedComments
      }));
      
      // Also update the post in context if needed
      const post = posts.find(p => p._id === postId);
      if (post && updatePostInContext) {
        const updatedPost = {
          ...post,
          comments: processedComments
        };
        updatePostInContext(updatedPost);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      // toast.error('Failed to load comments');
      setPostComments(prev => ({
        ...prev,
        [postId]: []
      }));
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyShowing = showCommentsForPost[postId];
    
    setShowCommentsForPost(prev => ({
      ...prev,
      [postId]: !isCurrentlyShowing
    }));
    
    // Load comments when showing them
    if (!isCurrentlyShowing) {
      const existingComments = postComments[postId];
      const postFromContext = posts.find(p => p._id === postId);
      const contextComments = postFromContext?.comments;
      
      // Always load fresh comments when toggling to show
      // This ensures we get the latest comments from the server
      await loadComments(postId);
    }
  };

  const toggleCommentInput = async (postId) => {
    if (!userdata?.user?._id) {
      navigate('/login');
      return;
    }

    const isCurrentlyActive = activeCommentPostId === postId;
    setActiveCommentPostId(isCurrentlyActive ? null : postId);
    setCommentText('');
    
    setTimeout(() => {
      if (!isCurrentlyActive && commentInputRefs.current[postId]) {
        commentInputRefs.current[postId].focus();
      }
    }, 100);
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await addComment(postId, commentText);
      console.log('Add comment response:', response);
      
      if (response?.success) {
        // Create the new comment object with proper author info
        const newComment = {
          _id: response.comment._id || Date.now().toString(),
          content: response.comment.content || commentText,
          createdAt: response.comment.createdAt || new Date().toISOString(),
          author: {
            _id: userdata.user._id,
            name: userdata.user.name || 'You',
            username: userdata.user.username || 'you',
            photo: userdata.user.photo || assets.user_image
          }
        };

        // Update local comments state
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));
        
        // Update context if available
        const currentPost = posts.find(p => p._id === postId);
        if (currentPost && updatePostInContext) {
          const updatedPost = {
            ...currentPost,
            comments: [...(postComments[postId] || []), newComment]
          };
          updatePostInContext(updatedPost);
        }
        
        setCommentText('');
        setActiveCommentPostId(null);
        toast.success('Comment added successfully! 🎉');
      } else {
        throw new Error(response?.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!userdata?.user?._id) {
      navigate('/login');
      return;
    }
    setConfirmDeleteId(commentId);
  }
  
  const confirmDelete = async () => {
    const commentId = confirmDeleteId;
    if (!commentId) return;
    setDeletingCommentId(commentId);

    try {
      const response = await deleteComment(commentId);

      if (response?.success) {
        let postIdWithComment = null;
        for (const [postId, comments] of Object.entries(postComments)) {
          if (comments.some(comment => comment._id === commentId)) {
            postIdWithComment = postId;
            break;
          }
        }

        if (postIdWithComment) {
          setPostComments(prev => ({
            ...prev,
            [postIdWithComment]: (prev[postIdWithComment] || []).filter(c => c._id !== commentId)
          }));

          const currentPost = posts.find(p => p._id === postIdWithComment);
          if (currentPost && updatePostInContext) {
            updatePostInContext({
              ...currentPost,
              comments: (postComments[postIdWithComment] || []).filter(c => c._id !== commentId)
            });
          }
        }

        toast.success("Comment deleted successfully!");
      } else {
        throw new Error(response?.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.message || "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
      setConfirmDeleteId(null);
    }
  }

  // Helper function to get comments for a post
  const getCommentsForPost = (postId) => {
    const localComments = postComments[postId] || [];
    const postFromContext = posts.find(p => p._id === postId);
    const contextComments = postFromContext?.comments || [];
    
    return localComments.length > 0 ? localComments : contextComments;
  };

  // Check if current user is the author of a comment
  const isCommentAuthor = (comment) => {
    return comment.author && comment.author._id === userdata?.user?._id;
  };

  // Color schemes for cards
  const cardColorSchemes = [
    'from-purple-50 to-pink-50 border-purple-200',
    'from-blue-50 to-cyan-50 border-blue-200', 
    'from-emerald-50 to-teal-50 border-emerald-200',
    'from-orange-50 to-red-50 border-orange-200',
    'from-indigo-50 to-purple-50 border-indigo-200',
    'from-pink-50 to-rose-50 border-pink-200'
  ];

  // Tag color schemes
  const tagColors = [
    'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    'bg-gradient-to-r from-lime-500 to-green-500 text-white',
    'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
  ];

  const getTagColor = (tagSlug) => {
    const index = allTags.indexOf(tagSlug) % tagColors.length;
    return tagColors[index >= 0 ? index : 0];
  };

  // Get display name for tag
  const getTagDisplayName = (tagSlug) => {
    // Find a post that has this tag to get the original display name
    const postWithTag = posts.find(post => postHasTag(post, tagSlug));
    if (postWithTag) {
      const tag = postWithTag.tags.find(t => extractTagSlug(t) === tagSlug);
      return extractTagName(tag);
    }
    return tagSlug;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-3 sm:px-4 md:px-6 lg:px-8 py-6">
      {/* Refresh Button */}
      <div className="max-w-7xl mx-auto mb-4 flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-md"
          title="Refresh posts"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Posts'}</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto mb-6">
        {/* Search Bar */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search posts by content, description, tags, or author..."
              className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 font-medium text-gray-700 placeholder-gray-500 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600 text-center">
              <span className="font-semibold">{filteredPosts.length}</span> posts found for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(filter !== 'all' || tagFilter !== 'all' || searchQuery) && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-md">
              <span className="text-sm font-semibold text-gray-700 mr-2">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {filter !== 'all' && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                    {filter === 'images' ? 'Image Posts' : 'Text Posts'}
                  </span>
                )}
                {tagFilter !== 'all' && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-full">
                    #{getTagDisplayName(tagFilter)}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-full">
                    Search: "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="ml-3 text-gray-500 hover:text-gray-700 transition-colors"
                title="Clear all filters"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === 'all'
                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                : 'text-gray-700 bg-white/80 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 shadow-md'
            }`}
            disabled={isFiltering}
          >
            {filter === 'all' && isFiltering ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              'All Posts'
            )}
          </button>
          
          <button
            onClick={() => handleFilterChange('images')}
            className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === 'images'
                ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg'
                : 'text-gray-700 bg-white/80 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 shadow-md'
            }`}
            disabled={isFiltering}
          >
            {filter === 'images' && isFiltering ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              'Image Posts'
            )}
          </button>
          
          <button
            onClick={() => handleFilterChange('text')}
            className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === 'text'
                ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg'
                : 'text-gray-700 bg-white/80 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 shadow-md'
            }`}
            disabled={isFiltering}
          >
            {filter === 'text' && isFiltering ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              'Text Posts'
            )}
          </button>
        </div>

        {/* Tag Filter Section */}
        {allTags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-center mb-3">
              <TagIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-700">Filter by Tags:</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleTagFilterChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  tagFilter === 'all'
                    ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                    : 'text-gray-700 bg-white/80 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 shadow-md'
                }`}
              >
                All Tags
              </button>
              {allTags.map((tagSlug) => (
                <button
                  key={tagSlug}
                  onClick={() => handleTagFilterChange(tagSlug)}
                  className={`px-2 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    tagFilter === tagSlug
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 bg-white/80 hover:opacity-90 shadow-md'
                  } ${getTagColor(tagSlug)}`}
                >
                  #{getTagDisplayName(tagSlug)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto">
        {isFiltering ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">Filtering posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No posts found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery 
                ? `No posts match your search for "${searchQuery}". Try different keywords or clear filters.`
                : 'No posts match the current filters. Try changing your filter settings.'
              }
            </p>
            {(searchQuery || filter !== 'all' || tagFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5 md:gap-6 space-y-4 sm:space-y-5 md:space-y-6">
            {filteredPosts.map((post, index) => {
              const isLiked = localLikes[post._id] ?? post.likes?.includes(userdata?.user?._id);
              const likeCount = post.likes?.length || 0;
              const isLoading = localLoading[post._id];
              const comments = getCommentsForPost(post._id);
              const commentCount = comments.length;
              const hasImage = post.imageUrl && post.imageUrl.trim() !== '';
              const hasDescription = post.description && post.description.trim() !== '';
              const isCommentSectionOpen = activeCommentPostId === post._id;
              const showComments = showCommentsForPost[post._id];
              const colorScheme = cardColorSchemes[index % cardColorSchemes.length];
              const postTags = post.tags || [];

              return (
                <div 
                  key={post._id} 
                  className={`break-inside-avoid bg-gradient-to-br ${colorScheme} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2 hover:scale-[1.02] backdrop-blur-sm`}
                >
                  {/* Post Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative group/avatar flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5">
                          <img 
                            src={post.author?.photo  || assets.user_image} 
                            alt="User avatar" 
                            className="w-full h-full rounded-full object-cover bg-white cursor-pointer hover:scale-110 transition-transform duration-300"
                            onClick={() => handleProfileClick(post.author?._id)}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 
                          className="font-bold text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors text-base"
                          onClick={() => handleProfileClick(post.author?._id)}
                        >
                          {post.author?.name || 'Unknown User'}
                        </h3>
                        <p className="text-gray-600 text-sm font-medium">
                          @  {moment(post.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Post Content */}
                    {post.content && (
                      <div className="mb-4">
                        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line font-medium">
                          {post.content}
                        </p>
                      </div>
                    )}

                    {/* Description Preview */}
                    {/* {hasDescription && (
                      <div className="mb-3">
                        <div className="bg-white/60 rounded-xl p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                              <DocumentTextIcon className="h-3 w-3 mr-1" />
                              Description
                            </span>
                            <button
                              onClick={() => handleViewDescription(post)}
                              className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                            >
                              View Full
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    )} */}

                         {post.description && (
  <div className="mb-4">
    <div className="text-gray-700 text-sm leading-relaxed">
       <b>Description</b> <br></br>
      {post.description.length <= 200 ? (
        post.description
      ) : (
        <>
          {post.description.slice(0, 200)}...
          <button
            onClick={() => handleViewDescription(post)}
            className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            View Full
          </button>
        </>
      )}
    </div>
  </div>
)}

                  </div>
                  
                  {/* Post Image */}
                  {hasImage && (
                    <div className="relative mx-5 mb-4">
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={post.imageUrl} 
                          alt="Post content" 
                          className="w-full h-auto max-h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          style={{
                            aspectRatio: 'auto',
                            maxHeight: '320px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    </div>
                  )}

                  {/* Post Tags */}
                  {postTags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2 items-center justify-center m-1">
                      {postTags.map((tag, tagIndex) => {
                        const tagName = extractTagName(tag);
                        const tagSlug = extractTagSlug(tag);
                        
                        return (
                          <span
                            key={tagIndex}
                            className={`px-2 py-1 rounded-[5px] text-xs font-semibold ${getTagColor(tagSlug)} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => handleTagFilterChange(tagSlug)}
                          >
                            #{tagName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between mb-4">
                      {/* Like Button */}
                      <button 
                        className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          isLiked 
                            ? 'text-white bg-gradient-to-r from-red-400 to-pink-500 shadow-lg' 
                            : 'text-gray-700 bg-white/70 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 hover:text-red-600 shadow-md'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleLike(post._id)}
                        disabled={isLoading}
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill={isLiked ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                          />
                        </svg>
                        <span className="text-sm">{likeCount}</span>
                      </button>
                      
                      {/* View Description Button */}
                      {/* {hasDescription && (
                        <button 
                          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            'text-gray-700 bg-white/70 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-600 shadow-md'
                          }`}
                          onClick={() => handleViewDescription(post)}
                          title="View full description"
                        >
                          <EyeIcon className="w-5 h-5" />
                          <span className="text-sm">Details</span>
                        </button>
                      )} */}
                      
                      {/* Comment Buttons */}
                      <div className="flex space-x-2">
                        {/* View Comments Button */}
                        <button 
                          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            showComments 
                              ? 'text-white bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg' 
                              : 'text-gray-700 bg-white/70 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-blue-600 shadow-md'
                          }`}
                          onClick={() => toggleComments(post._id)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm">{commentCount}</span>
                        </button>
                        
                        {/* Add Comment Button */}
                        <button 
                          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            isCommentSectionOpen 
                              ? 'text-white bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg' 
                              : 'text-gray-700 bg-white/70 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-600 shadow-md'
                          }`}
                          onClick={() => toggleCommentInput(post._id)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm">Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Comment Input Section */}
                    {isCommentSectionOpen && (
                      <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-inner">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5">
                            <img 
                              src={userdata?.user?.photo || assets.user_image} 
                              alt="Your avatar" 
                              className="w-full h-full rounded-full object-cover bg-white"
                            />
                          </div>
                          <div className="flex-1 relative">
                            <input
                              ref={el => commentInputRefs.current[post._id] = el}
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Share your thoughts..."
                              className="w-full px-4 py-3 text-sm bg-white/90 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 font-medium"
                              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                            />
                            <button
                              onClick={() => handleCommentSubmit(post._id)}
                              disabled={!commentText.trim() || isSubmittingComment}
                              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all duration-300 ${
                                !commentText.trim() 
                                  ? 'text-gray-400' 
                                  : 'text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:scale-105'
                              }`}
                            >
                              {isSubmittingComment ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showComments && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-inner max-h-64 overflow-y-auto">
                        {commentsLoading[post._id] ? (
                          <div className="flex justify-center py-8">
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-3 border-purple-500"></div>
                              <span className="text-gray-600 font-medium">Loading comments...</span>
                            </div>
                          </div>
                        ) : (
                          comments.length > 0 ? (
                            <div className="space-y-3">
                              {comments.map((comment, commentIndex) => {
                                const fullComment = typeof comment === 'string' ? 
                                  { 
                                    _id: comment, 
                                    content: 'Loading...', 
                                    author: null,
                                    tempId: `temp-${comment}-${commentIndex}`
                                  } : 
                                  comment;
                                
                                const author = fullComment.author || {
                                  _id: null,
                                  name: 'Unknown User',
                                  username: 'unknown',
                                  photo: assets.user_image
                                };
                                
                                const uniqueKey = fullComment._id 
                                  ? `${fullComment._id}-${commentIndex}` 
                                  : fullComment.tempId 
                                    ? fullComment.tempId 
                                    : `comment-${Date.now()}-${commentIndex}`;
                                
                                return (
                                  <div key={uniqueKey} className="flex items-start space-x-3 p-3 bg-white/80 rounded-xl hover:bg-white transition-colors group/comment">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 p-0.5 flex-shrink-0">
                                      <img 
                                        src={author.photo || assets.user_image} 
                                        alt="Commenter avatar" 
                                        className="w-full h-full rounded-full object-cover bg-white cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => author._id && handleProfileClick(author._id)}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span 
                                          className={`text-sm font-bold text-gray-900 transition-colors ${
                                            author._id ? 'hover:text-purple-600 cursor-pointer' : ''
                                          }`}
                                          onClick={() => author._id && handleProfileClick(author._id)}
                                        >
                                          {author.name}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                          {fullComment.createdAt ? moment(fullComment.createdAt).fromNow() : 'now'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        {fullComment.content || 'Loading...'}
                                      </p>
                                    </div>
                                    
                                    {isCommentAuthor(fullComment) && (
                                      <button
                                        onClick={() => setConfirmDeleteId(fullComment._id)}
                                        disabled={deletingCommentId === fullComment._id}
                                        className="opacity-0 group-hover/comment:opacity-100 transition-opacity duration-300 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                                        title="Delete comment"
                                      >
                                        {deletingCommentId === fullComment._id ? (
                                          <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        ) : (
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                          </svg>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-600 font-bold mb-1">No comments yet</p>
                              <p className="text-xs text-gray-500">Start the conversation!</p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Comment?"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        loading={deletingCommentId === confirmDeleteId}
      />
    </div>
  );
};

export default PostList;