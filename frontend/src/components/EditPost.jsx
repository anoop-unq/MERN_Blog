
// import { useContext, useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';
// import { FaArrowLeft, FaTrash, FaTimes } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// const EditPost = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { posts, updatePost, deletePostImage, userdata } = useContext(AppContext);
//   const [content, setContent] = useState('');
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [tags, setTags] = useState([]);
//   const [tagInput, setTagInput] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [removeImage, setRemoveImage] = useState(false);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     const post = posts.find(p => p._id === id);
//     if (post) {
//       setContent(post.content || '');
//       setImagePreview(post.imageUrl || null);
      
//       // Handle tags properly - they might be objects with name property or strings
//       let postTags = [];
//       if (post.tags && Array.isArray(post.tags)) {
//         postTags = post.tags.map(tag => {
//           if (typeof tag === 'string') return tag;
//           if (tag && typeof tag === 'object' && tag.name) return tag.name;
//           return '';
//         }).filter(tag => tag && tag.trim() !== '');
//       }
      
//       setTags(postTags);
//       setLoading(false);
//     } else {
//       toast.error('Post not found');
//       navigate('/home');
//     }
//   }, [id, posts, navigate]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       toast.error('Please select an image file (JPEG, PNG, etc.)');
//       return;
//     }
    
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image size should be less than 5MB');
//       return;
//     }

//     setImage(file);
//     setImagePreview(URL.createObjectURL(file));
//     setRemoveImage(false);
//   };

//   const handleRemoveImage = async () => {
//     try {
//       setIsSubmitting(true);
      
//       const post = posts.find(p => p._id === id);
//       const hasBackendImage = post?.imageUrl;
      
//       if (hasBackendImage) {
//         const success = await deletePostImage(id);
//         if (!success) return;
//       }
      
//       setImage(null);
//       setImagePreview(null);
//       setRemoveImage(true);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
      
//       if (!hasBackendImage) {
//         toast.success("Image removed successfully");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleTagInput = (e) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault();
//       addTag();
//     }
//   };

//   const addTag = () => {
//     const trimmedTag = tagInput.trim();
    
//     if (!trimmedTag) return;
    
//     const tagRegex = /^[a-zA-Z0-9-_]+$/;
//     if (!tagRegex.test(trimmedTag)) {
//       toast.error('Tags can only contain letters, numbers, hyphens, and underscores');
//       return;
//     }
    
//     if (tags.includes(trimmedTag.toLowerCase())) {
//       toast.error('Tag already exists');
//       setTagInput('');
//       return;
//     }
    
//     if (tags.length >= 5) {
//       toast.error('Maximum 5 tags allowed');
//       return;
//     }
    
//     setTags([...tags, trimmedTag.toLowerCase()]);
//     setTagInput('');
//   };

//   const removeTag = (indexToRemove) => {
//     setTags(tags.filter((_, index) => index !== indexToRemove));
//   };

//   const handleTagBlur = () => {
//     if (tagInput.trim()) {
//       addTag();
//     }
//   };

//   const renderTags = () => {
//     if (!tags || !Array.isArray(tags)) return null;
    
//     return tags
//       .filter(tag => tag && typeof tag === 'string' && tag.trim() !== '')
//       .map((tag, index) => (
//         <span
//           key={`${tag}-${index}`}
//           className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
//         >
//           #{tag}
//           <button
//             type="button"
//             onClick={() => removeTag(index)}
//             className="ml-1.5 rounded-full hover:bg-blue-200 p-0.5"
//             aria-label={`Remove tag ${tag}`}
//           >
//             <FaTimes className="w-3 h-3" />
//           </button>
//         </span>
//       ));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!content.trim() && !image && !imagePreview && !removeImage && tags.length === 0) {
//       toast.error('Post must contain either content, an image, or tags');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const formData = new FormData();
//       if (content.trim()) formData.append('content', content);
//       if (image) formData.append('image', image);
//       if (removeImage) formData.append('removeImage', 'true');
      
//       // Add tags to formData - each tag as separate entry
//       tags.forEach(tag => {
//         formData.append('tags', tag);
//       });

//       const success = await updatePost(id, formData);
//       if (success) {
//         navigate(-1);
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-700">Loading post...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto bg-white min-h-screen">
//       <div className="px-4 py-4 flex items-center sticky top-0 bg-white z-10 border-b shadow-sm">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center justify-center bg-white text-gray-700 rounded-full p-3 w-12 h-12 hover:bg-gray-100 transition duration-200 ease-in-out shadow-sm border border-gray-200"
//           aria-label="Go back"
//         >
//           <FaArrowLeft className="text-xl" />
//         </button>
//         <h1 className="text-xl md:text-2xl font-bold ml-4">Edit Post</h1>
//       </div>

//       <div className="p-6">
//         <form onSubmit={handleSubmit}>
//           <div className="mb-6">
//             <textarea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="Edit your post..."
//               className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//               rows="5"
//               maxLength={500}
//             />
//             <div className="text-right mt-2">
//               <span className={`text-sm ${content.length === 500 ? 'text-red-500' : 'text-gray-500'}`}>
//                 {content.length}/500
//               </span>
//             </div>
//           </div>
          
//           {/* Tags Input Section */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               Tags {tags.length > 0 && <span className="text-gray-500">({tags.length}/5)</span>}
//             </label>
//             <div className="flex flex-wrap gap-2 mb-3">
//               {renderTags()}
//             </div>
//             <input
//               type="text"
//               value={tagInput}
//               onChange={(e) => setTagInput(e.target.value)}
//               onKeyDown={handleTagInput}
//               onBlur={handleTagBlur}
//               placeholder={tags.length >= 5 ? "Maximum 5 tags reached" : "Add a tag and press Enter or comma"}
//               disabled={tags.length >= 5}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//             />
//             <p className="text-xs text-gray-500 mt-2">
//               Tags can contain letters, numbers, hyphens, and underscores. Maximum 5 tags.
//             </p>
//           </div>
          
//           {/* Image preview section */}
//           {imagePreview && (
//             <div className="mb-6 relative group">
//               <img 
//                 src={imagePreview} 
//                 alt="Preview" 
//                 className="w-full max-h-96 rounded-lg object-contain border border-gray-200"
//               />
//               <div className="absolute top-3 right-3 flex space-x-2">
//                 {posts.find(p => p._id === id)?.imageUrl && (
//                   <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
//                     Current Image
//                   </span>
//                 )}
//                 <button
//                   type="button"
//                   onClick={handleRemoveImage}
//                   disabled={isSubmitting}
//                   className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all disabled:opacity-50"
//                   aria-label="Remove image"
//                 >
//                   <FaTrash className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           )}
          
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <label className="inline-flex items-center space-x-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleImageChange}
//                   accept="image/*"
//                   className="hidden"
//                   disabled={isSubmitting}
//                 />
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 <span className="text-sm font-medium text-gray-700">
//                   {imagePreview ? 'Change Image' : 'Add Image'}
//                 </span>
//               </label>
//             </div>
            
//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
//               disabled={isSubmitting || (!content.trim() && !image && !imagePreview && !removeImage && tags.length === 0)}
//             >
//               {isSubmitting ? 'Updating...' : 'Update Post'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditPost;


import { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FaArrowLeft, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, updatePost, deletePostImage, userdata } = useContext(AppContext);
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const post = posts.find(p => p._id === id);
    if (post) {
      setContent(post.content || '');
      setDescription(post.description || '');
      setImagePreview(post.imageUrl || null);
      
      // Handle tags properly - they might be objects with name property or strings
      let postTags = [];
      if (post.tags && Array.isArray(post.tags)) {
        postTags = post.tags.map(tag => {
          if (typeof tag === 'string') return tag;
          if (tag && typeof tag === 'object' && tag.name) return tag.name;
          return '';
        }).filter(tag => tag && tag.trim() !== '');
      }
      
      setTags(postTags);
      setLoading(false);
    } else {
      toast.error('Post not found');
      navigate('/home');
    }
  }, [id, posts, navigate]);

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
    setRemoveImage(false);
  };

  const handleRemoveImage = async () => {
    try {
      setIsSubmitting(true);
      
      const post = posts.find(p => p._id === id);
      const hasBackendImage = post?.imageUrl;
      
      if (hasBackendImage) {
        const success = await deletePostImage(id);
        if (!success) return;
      }
      
      setImage(null);
      setImagePreview(null);
      setRemoveImage(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (!hasBackendImage) {
        toast.success("Image removed successfully");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) return;
    
    const tagRegex = /^[a-zA-Z0-9-_]+$/;
    if (!tagRegex.test(trimmedTag)) {
      toast.error('Tags can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    if (tags.includes(trimmedTag.toLowerCase())) {
      toast.error('Tag already exists');
      setTagInput('');
      return;
    }
    
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    
    setTags([...tags, trimmedTag.toLowerCase()]);
    setTagInput('');
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag();
    }
  };

  const renderTags = () => {
    if (!tags || !Array.isArray(tags)) return null;
    
    return tags
      .filter(tag => tag && typeof tag === 'string' && tag.trim() !== '')
      .map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1.5 rounded-full hover:bg-blue-200 p-0.5"
            aria-label={`Remove tag ${tag}`}
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </span>
      ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !description.trim() && !image && !imagePreview && !removeImage && tags.length === 0) {
      toast.error('Post must contain either content, description, an image, or tags');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content);
      if (description.trim()) formData.append('description', description);
      if (image) formData.append('image', image);
      if (removeImage) formData.append('removeImage', 'true');
      
      // Add tags to formData - each tag as separate entry
      tags.forEach(tag => {
        formData.append('tags', tag);
      });

      const success = await updatePost(id, formData);
      if (success) {
        navigate(-1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      <div className="px-4 py-4 flex items-center sticky top-0 bg-white z-10 border-b shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-white text-gray-700 rounded-full p-3 w-12 h-12 hover:bg-gray-100 transition duration-200 ease-in-out shadow-sm border border-gray-200"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold ml-4">Edit Post</h1>
      </div>

      <div className="p-4 md:p-6">
        <form onSubmit={handleSubmit}>
          {/* Content Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your post title..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
              maxLength={100}
            />
            <div className="text-right mt-2">
              <span className={`text-sm ${content.length === 100 ? 'text-red-500' : 'text-gray-500'}`}>
                {content.length}/100
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your post in detail..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="6"
              maxLength={1000}
            />
            <div className="text-right mt-2">
              <span className={`text-sm ${description.length === 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                {description.length}/1000
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Provide detailed information about your post. This helps readers understand your content better.
            </p>
          </div>
          
          {/* Tags Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tags {tags.length > 0 && <span className="text-gray-500">({tags.length}/5)</span>}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {renderTags()}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              onBlur={handleTagBlur}
              placeholder={tags.length >= 5 ? "Maximum 5 tags reached" : "Add a tag and press Enter or comma"}
              disabled={tags.length >= 5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">
              Tags can contain letters, numbers, hyphens, and underscores. Maximum 5 tags.
            </p>
          </div>
          
          {/* Image preview section */}
          {imagePreview && (
            <div className="mb-6 relative group">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-h-96 rounded-lg object-contain border border-gray-200"
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                {posts.find(p => p._id === id)?.imageUrl && (
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Current Image
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all disabled:opacity-50"
                  aria-label="Remove image"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center space-x-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {imagePreview ? 'Change Image' : 'Add Image'}
                </span>
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 md:px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-center"
              disabled={isSubmitting || (!content.trim() && !description.trim() && !image && !imagePreview && !removeImage && tags.length === 0)}
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;