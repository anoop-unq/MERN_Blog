import { useContext, useState, useCallback, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const PostForm = () => {
  const { createPost, islogged, userdata } = useContext(AppContext);
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      if (trimmedTag.length > 20) {
        toast.error('Tags must be less than 20 characters');
        return;
      }
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !image) {
      toast.error('Post must contain either text or an image');
      return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content);
      if (description.trim()) formData.append('description', description);
      if (image) formData.append('image', image);
      
      tags.forEach(tag => {
        formData.append('tags', tag);
      });

      const success = await createPost(formData);
      if (success) {
        setContent('');
        setDescription('');
        setTags([]);
        removeImage();
        setActiveTab('content');
        toast.success('Post created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create post');
      console.error('Post submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, description, image, tags, createPost, isSubmitting]);

  const navigateToProfile = (id) => {
    navigate(`/user-profile/${id}`);
  };

  const navigateToEditProfile = (id) => {
    navigate(`/edit-profile/${id}`);
  };

  const toggleBio = () => {
    setShowFullBio(!showFullBio);
  };

  if (!islogged) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 mx-2 sm:mx-0">
      {/* Header Section */}
      <div className="flex items-start gap-3 mb-4">
        <img 
          src={userdata?.user?.photo || assets.user_image || '/default-avatar.png'} 
          alt="User avatar" 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer flex-shrink-0 object-cover border border-gray-200"
          onClick={() => navigateToProfile(userdata.user._id)}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 
                className="font-semibold text-gray-900 text-sm sm:text-base truncate cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => navigateToProfile(userdata.user._id)}
              >
                {userdata?.name}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm truncate">
                @{userdata?.user?.username}
              </p>
            </div>
            
            <button
              onClick={() => navigateToEditProfile(userdata.user._id)}
              className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors border border-gray-200 text-xs sm:text-sm font-medium"
              aria-label="Edit profile"
            >
              <span className="hidden xs:inline">Edit Profile</span>
              <span className="xs:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Bio Section */}
          {userdata?.user?.bio && (
            <div className="mt-2 text-gray-600 text-xs sm:text-sm">
              <div className={`${showFullBio ? '' : 'line-clamp-2'}`}>
                {userdata.user.bio}
              </div>
              {userdata.user.bio.length > 100 && (
                <button
                  onClick={toggleBio}
                  className="text-blue-500 hover:text-blue-700 text-xs mt-1 font-medium transition-colors"
                >
                  {showFullBio ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 xs:flex-none px-3 py-2 text-xs xs:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`flex-1 xs:flex-none px-3 py-2 text-xs xs:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Description
          </button>
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? (Required if no image)"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              rows={3}
              maxLength={2500}
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${content.length === 2500 ? 'text-red-500' : 'text-gray-500'}`}>
                {content.length}/2500
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors"
              >
                Add Description →
              </button>
            </div>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your post (optional)"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              rows={3}
              maxLength={2500}
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${description.length === 2500 ? 'text-red-500' : 'text-gray-500'}`}>
                {description.length}/2500
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors"
              >
                ← Back to Content
              </button>
            </div>
          </div>
        )}
        
        {/* Tags Input */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center bg-blue-50 text-blue-700 text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-full border border-blue-100">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (max 5)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tags.length >= 5}
              className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
            >
              Add Tag
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {tags.length}/5 tags • Press Enter to add • Max 20 characters
          </p>
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4 relative group">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-64 sm:max-h-80 md:max-h-96 rounded-lg object-contain border border-gray-200 bg-gray-50"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 w-full xs:w-auto">
            <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 w-full xs:w-auto justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{image ? 'Change Photo' : 'Add Photo'}</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !image)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full xs:w-auto text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create Post
              </>
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex flex-wrap gap-3">
            <span className="bg-gray-50 px-2 py-1 rounded">Content: {content.length}/2500</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Desc: {description.length}/2500</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Tags: {tags.length}/5</span>
          </div>
          <span className={`px-2 py-1 rounded ${image ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
            {image ? 'Image: ✓' : 'Image: ✗'}
          </span>
        </div>
      </form>
    </div>
  );
};

export default PostForm;