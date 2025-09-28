import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const [islogged, setIsLogged] = useState(false);
  const [userdata, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]); // NEW: Tags state
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  // ... existing user functions remain the same ...
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUserData(response.data.userData);
      } else {
        toast.error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  const getUserById = async (userId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/user-details/${userId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        return response.data.userData;
      } else {
        toast.error(response.data.message || "Failed to fetch user data");
        return null;
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Something went wrong"
      );
      return null;
    }
  };

  const getAuthState = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user-auth`, {
        withCredentials: true
      });

      if (response.data.success) {
        setIsLogged(true);
        await getUserData();
      } else {
        setIsLogged(false);
      }
    } catch (error) {
      setIsLogged(false);
      console.warn("Not logged in:", error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query, page = 1, limit = 10) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${backendUrl}/api/search`, {
        params: { query, page, limit },
        withCredentials: true
      });
      
      if (response.data.success) {
        setSearchResults(response.data.users);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  // ============ TAG-RELATED API FUNCTIONS ============

  // Get all tags
  const getAllTags = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/posts/tags/all`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setTags(response.data.tags);
        return response.data.tags;
      }
      return [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags");
      return [];
    }
  };

  // Get posts by specific tag
  const getPostsByTag = async (tagSlug) => {
    try {
      const response = await axios.get(`${backendUrl}/api/posts/tags/${tagSlug}/posts`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Failed to fetch posts by tag");
    } catch (error) {
      console.error("Error fetching posts by tag:", error);
      throw error;
    }
  };

  // ============ UPDATED POST FUNCTIONS WITH TAGS SUPPORT ============

  // Fetch all posts (updated to handle tags)
  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const response = await axios.get(`${backendUrl}/api/posts`, {
        withCredentials: true
      });
      console.log(response.data, "API Context");
      setPosts(response.data);
    } catch (error) {
      toast.error("Failed to fetch posts");
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [backendUrl]);

  // Create post with tags support
  const createPost = useCallback(async (formData) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/posts`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Post creation response:', response.data);
      
      if (response.data.success && response.data.post) {
        const newPost = {
          ...response.data.post,
        };
        
        setPosts(prevPosts => [newPost, ...prevPosts]);
        return true;
      }
      throw new Error(response.data.message || 'Invalid response format');
      
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Failed to create post'
      );
      return false;
    }
  }, [backendUrl]);

  // Update post with tags support
  // const updatePost = useCallback(async (postId, formData) => {
  //   try {
  //     // Determine if we're sending FormData (for images) or JSON (for text-only updates)
  //     const isFormData = formData instanceof FormData;
      
  //     const config = {
  //       withCredentials: true,
  //       headers: {
  //         'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
  //       }
  //     };

  //     const response = await axios.put(
  //       `${backendUrl}/api/posts/${postId}`,
  //       isFormData ? formData : formData,
  //       config
  //     );

  //     if (response.data.success && response.data.post) {
  //       // Update the post in context
  //       setPosts(prevPosts => 
  //         prevPosts.map(post => 
  //           post._id === postId ? response.data.post : post
  //         )
  //       );
  //       toast.success("Post updated successfully");
  //       return true;
  //     }
  //     throw new Error(response.data.message || 'Invalid response format');
  //   } catch (error) {
  //     console.error('Update post error:', {
  //       error: error.response?.data || error.message
  //     });
  //     toast.error(
  //       error.response?.data?.error || 
  //       error.response?.data?.message || 
  //       error.message || 
  //       'Failed to update post'
  //     );
  //     return false;
  //   }
  // }, [backendUrl]);


// In your AppContext.js
const updatePost = async (postId, formData) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/posts/${postId}`,
      formData,
      {
        withCredentials: true, // This sends cookies
        headers: {
          // Don't set Content-Type - axios will set it automatically for FormData
        }
      }
    );

    if (response.data.success && response.data.post) {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? response.data.post : post
        )
      );
      toast.success("Post updated successfully");
      return true;
    }
    
    throw new Error(response.data.message || 'Invalid response format');
  } catch (error) {
    console.error('Update post error:', {
      error: error.response?.data || error.message
    });
    
    if (error.response?.status === 401) {
      toast.error('Authentication failed. Please login again.');
      // Optional: redirect to login
      // navigate('/login');
      return false;
    }
    
    toast.error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'Failed to update post'
    );
    return false;
  }
};

  // Helper function to prepare form data for posts with tags
  const preparePostFormData = (postData) => {
    const formData = new FormData();
    
    // Append text fields
    if (postData.content) formData.append('content', postData.content);
    
    // Append tags as array
    if (postData.tags && Array.isArray(postData.tags)) {
      postData.tags.forEach((tag, index) => {
        formData.append('tags', tag);
      });
    }
    
    // Append image if exists
    if (postData.image) {
      formData.append('image', postData.image);
    }
    
    // Add removeImage flag if needed
    if (postData.removeImage) {
      formData.append('removeImage', 'true');
    }
    
    return formData;
  };

  // ============ EXISTING FUNCTIONS (UNCHANGED) ============

  const updateUserBio = async (userId, bio) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/${userId}`,
        { bio },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        if (userdata?.user?._id === userId) {
          setUserData(prev => ({
            ...prev,
            user: {
              ...prev.user,
              bio: response.data.user.bio
            }
          }));
        }
        toast.success("Bio updated successfully");
        return true;
      }
      throw new Error(response.data.message || 'Update failed');
      
    } catch (error) {
      console.error('Bio update failed:', {
        error: error.response?.data || error.message
      });
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update bio'
      );
      return false;
    }
  };

  const deletePostImage = useCallback(async (postId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/posts/${postId}/delete-image`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? response.data.post : post
          )
        );
        toast.success("Image removed successfully");
        return true;
      }

      throw new Error(response.data.message || 'Failed to remove image');
    } catch (error) {
      if (!error.response || 
          (error.response.status !== 400 && error.response.status !== 404)) {
        toast.error(
          error.response?.data?.message || 
          error.message || 
          'Failed to remove image'
        );
      }
      return false;
    }
  }, [backendUrl]);

  const updateUserProfile = async (userId, profileData) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/users/edit/${userId}`, 
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            ...response.data.user
          }
        }));
        toast.success('Profile updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  const getPostLikes = async (postId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/posts/${postId}/likes`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const getPostComments = async (postId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const addComment = async (postId, content) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/posts/${postId}/comments`,
        { content },
        { withCredentials: true }
      );
      
      if (response.data.success && response.data.comment) {
        const comment = response.data.comment;
        
        if (!comment.author) {
          comment.author = {
            name: 'Unknown User',
            username: 'unknown',
            photo: null // You might want to import assets or handle this differently
          };
        }
        
        return {
          success: true,
          message: response.data.message,
          comment: comment
        };
      }
      throw new Error(response.data.message || 'Failed to add comment');
    } catch (error) {
      console.error('Add comment error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Network error or server unavailable');
      }
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/posts/comments/${commentId}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      }
      throw new Error(response.data.message || 'Failed to delete comment');
    } catch (error) {
      console.error('Delete comment error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Network error or server unavailable');
      }
    }
  };

  const fetchComments = async (postId) => {
    try {
      console.log('Fetching comments for postId:', postId);
      
      const response = await axios.get(
        `${backendUrl}/api/posts/${postId}/user-comments`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const comments = Array.isArray(response.data.comments) ? response.data.comments : [];
        
        const processedComments = comments.map((comment, index) => {
          if (typeof comment === 'string') {
            return {
              _id: comment,
              content: 'Comment details not found',
              author: {
                _id: null,
                name: 'Unknown User',
                username: 'unknown',
                photo: null
              },
              createdAt: new Date().toISOString()
            };
          }
          
          const processedComment = {
            _id: comment._id || `temp-${Date.now()}-${index}`,
            content: comment.content || 'No content available',
            createdAt: comment.createdAt || new Date().toISOString(),
            author: null
          };
          
          if (comment.author) {
            if (typeof comment.author === 'object') {
              processedComment.author = {
                _id: comment.author._id || null,
                name: comment.author.name || comment.author.username || 'Unknown User',
                username: comment.author.username || 'unknown',
                photo: comment.author.photo || null
              };
            } else if (typeof comment.author === 'string') {
              processedComment.author = {
                _id: comment.author,
                name: 'User',
                username: 'user',
                photo: null
              };
            }
          } else {
            processedComment.author = {
              _id: null,
              name: 'Anonymous User',
              username: 'anonymous',
              photo: null
            };
          }
          
          return processedComment;
        });
        
        return processedComments;
      } else {
        console.error('API returned success: false', response.data);
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
      return [];
    }
  };

  const updateUserPhoto = async (userId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.put(
        `${backendUrl}/api/users/edit/${userId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUserData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            photo: response.data.photoUrl
          }
        }));
        toast.success('Profile photo updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile photo');
      return false;
    }
  };

  const updatePostInContext = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const likePost = async (postId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Like failed:', error);
      throw error;
    }
  };

  const deletePost = useCallback(async (postId) => {
    console.log(postId, "deleter")
    try {
      await axios.delete(`${backendUrl}/api/posts/${postId}`, {
        withCredentials: true
      });
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success("Post deleted successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete post");
      return false;
    }
  }, [backendUrl]);

  // Initial data loading
  useEffect(() => {
    getAuthState();
    fetchPosts();
    getAllTags(); // Load tags on app start
  }, []);

  const value = {
    backendUrl,
    getUserData,
    islogged,
    setIsLogged,
    userdata,
    setUserData,
    posts,
    tags, // NEW: Tags state
    fetchPosts,
    createPost,
    deletePost,
    isLoadingPosts,
    updateUserBio,
    updateUserProfile,
    updatePost,
    updateUserPhoto,
    likePost,
    deletePostImage,
    updatePostInContext,
    addComment,
    searchUsers,
    clearSearchResults,
    searchResults,
    isSearching,
    fetchComments,
    loading,
    getUserById,
    getPostLikes,
    getPostComments,
    deleteComment,
    // NEW: Tag-related functions
    getAllTags,
    getPostsByTag,
    preparePostFormData
  };

  return (
    <AppContext.Provider value={value}>{!loading && props.children}</AppContext.Provider>
  );
};