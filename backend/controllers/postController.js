// import Comment from '../models/Comment.js';
// import Post from '../models/Post.js';
// import userModel from '../models/user.js';
// import { v2 as cloudinary } from 'cloudinary';
// import mongoose from 'mongoose';

// import Tag from '../models/Tag.js';

// // Helper function to process tags
// const processTags = async (tagNames) => {
//   const tagIds = [];
  
//   for (const tagName of tagNames) {
//     if (!tagName || typeof tagName !== 'string') continue;
    
//     const cleanedTag = tagName.trim().toLowerCase();
//     if (!cleanedTag) continue;
    
//     let tag = await Tag.findOne({ name: cleanedTag });
    
//     if (!tag) {
//       tag = new Tag({
//         name: cleanedTag,
//         slug: cleanedTag.replace(/[^a-z0-9]/g, '-')
//       });
//       await tag.save();
//     }
    
//     tagIds.push(tag._id);
//   }
  
//   return tagIds;
// };

// // Helper function to update tag counts
// const updateTagCounts = async (tagIds) => {
//   try {
//     for (const tagId of tagIds) {
//       await Tag.findByIdAndUpdate(
//         tagId,
//         { $inc: { postCount: 1 } }
//       );
//     }
//   } catch (error) {
//     console.error('Error updating tag counts:', error);
//   }
// };


// export const createPost = async (req, res) => {
  
//   try {
//     if (!req.userId) {
//       return res.status(401).json({ 
//         success: false,
//         error: 'Unauthorized - No user ID found' 
//       });
//     }

//     const { content } = req.body;

//     // Handle tags from form-data
//     let tags = [];
//     if (req.body.tags) {
//       // If tags is a string (comma-separated), convert to array
//       if (typeof req.body.tags === 'string') {
//         tags = req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
//       } 
//       // If tags is already an array (when sent as multiple fields)
//       else if (Array.isArray(req.body.tags)) {
//         tags = req.body.tags.map(tag => tag.trim().toLowerCase());
//       }
//     }

//     const hasContent = content && content.trim() !== '';
//     const hasImage = req.file;

//     if (!hasContent && !hasImage) {
//       return res.status(400).json({
//         success: false,
//         error: 'Post must contain either content or an image'
//       });
//     }

//     // Handle image upload
//     let imageData = null;
//     if (hasImage) {
//       try {
//         // Upload image to Cloudinary
//       const b64 = Buffer.from(req.file.buffer).toString("base64");
//         const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
//         const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
//           folder: "posts",
//           resource_type: "auto",
//           quality: "auto:good"
//         });

//         imageData = {
//           url: cloudinaryResponse.secure_url,
//           publicId: cloudinaryResponse.public_id
//         };
//       } catch (uploadError) {
//         console.error('Cloudinary upload error:', uploadError);
//         return res.status(500).json({
//           success: false,
//           error: 'Failed to upload image',
//           details: uploadError.message
//         });
//       }
//     }

//     // PROCESS TAGS
//     let tagIds = [];
//     if (tags && tags.length > 0) {
//       tagIds = await processTags(tags);
//     }

//     // Create new post
//     const post = new Post({
//       content: hasContent ? content.trim() : null,
//       author: req.userId,
//       tags: tagIds,
//       ...(imageData && {
//         imageUrl: imageData.url,
//         imagePublicId: imageData.publicId
//       })
//     });

//     await post.save();

//     // UPDATE TAG COUNTS
//     if (tagIds.length > 0) {
//       await updateTagCounts(tagIds);
//     }

//     // Update user's posts array
//     try {
//       await userModel.findByIdAndUpdate(
//         req.userId,
//         { $push: { posts: post._id } },
//         { new: true }
//       );
//     } catch (userUpdateError) {
//       console.error('User update error:', userUpdateError);
//     }

//     // Populate author AND tags info
//     const populatedPost = await Post.findById(post._id)
//       .populate({
//         path: 'author',
//         select: 'name email bio avatar photo'
//       })
//       .populate({
//         path: 'tags',
//         select: 'name slug postCount'
//       })
//       .lean();

//     // Ensure consistent response structure
//     const responseData = {
//       _id: populatedPost._id,
//       content: populatedPost.content,
//       imageUrl: populatedPost.imageUrl,
//       imagePublicId: populatedPost.imagePublicId,
//       tags: populatedPost.tags || [],
//       author: {
//         _id: populatedPost.author._id,
//         name: populatedPost.author.name,
//         username: populatedPost.author.username,
//         avatar: populatedPost.author.avatar,
//         photo: populatedPost.author.photo,
//         bio: populatedPost.author.bio
//       },
//       likes: populatedPost.likes || [],
//       comments: populatedPost.comments || [],
//       likeCount: populatedPost.likes ? populatedPost.likes.length : 0,
//       commentCount: populatedPost.comments ? populatedPost.comments.length : 0,
//       createdAt: populatedPost.createdAt,
//       updatedAt: populatedPost.updatedAt
//     };

//     res.status(201).json({
//       success: true,
//       post: responseData
//     });
    
//   } catch (error) {
//     console.error('Post creation error:', error);
    
//     // Clean up uploaded image if error occurred
//     if (imageData?.publicId) {
//       try {
//         await cloudinary.uploader.destroy(imageData.publicId);
//       } catch (cleanupError) {
//         console.error('Image cleanup failed:', cleanupError);
//       }
//     }
    
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to create post',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all tags with post counts
// export const getAllTags = async (req, res) => {
//   try {
//     const tags = await Tag.find()
//       .sort({ postCount: -1, name: 1 })
//       .select('name slug postCount');
    
//     res.status(200).json({
//       success: true,
//       tags
//     });
//   } catch (error) {
//     console.error('Error fetching tags:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch tags'
//     });
//   }
// };

// // Get posts by specific tag
// export const getPostsByTag = async (req, res) => {
//   try {
//     const { tagSlug } = req.params;
    
//     const tag = await Tag.findOne({ slug: tagSlug });
//     if (!tag) {
//       return res.status(404).json({
//         success: false,
//         error: 'Tag not found'
//       });
//     }
    
//     const posts = await Post.find({ tags: tag._id, isPublic: true })
//       .populate('author', 'name email bio photo')
//       .populate('tags', 'name slug')
//       .sort({ createdAt: -1 });
    
//     res.status(200).json({
//       success: true,
//       tag: {
//         name: tag.name,
//         slug: tag.slug,
//         postCount: tag.postCount
//       },
//       posts
//     });
//   } catch (error) {
//     console.error('Error fetching posts by tag:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch posts'
//     });
//   }
// };

// export const getPosts = async (req, res) => {
//   try {
//     // Get all public posts, newest first
//     const posts = await Post.find()
//       .sort({ createdAt: -1 })
//       .populate('author', 'name email bio photo')
//        .populate('tags', 'name slug'); 
    
//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch posts' });
//   }
// };

// export const getPost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id)
//       .populate('author', 'name email bio')
//         .populate('tags', 'name slug');
//     if (!post) {
//       return res.status(404).json({ error: 'Post not found' });
//     }
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// export const deletePost = async (req, res) => {
//   try {
//     console.log("Request params:", req.params); // Debug log
//     console.log("User ID from middleware:", req.userId); // Debug log
    
//     const post = await Post.findById(req.params.id);
//     console.log("Found post:", post);
    
//     if (!post) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Post not found' 
//       });
//     }

//     // Verify ownership using req.userId from middleware
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         error: 'User authentication required'
//       });
//     }

//     if (post.author.toString() !== req.userId.toString()) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized to delete this post' 
//       });
//     }

//     const deletedPost = await Post.findByIdAndDelete(req.params.id);
//     console.log("Deleted post:", deletedPost);
    
//     if (!deletedPost) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Post not found during deletion' 
//       });
//     }

//     res.json({ 
//       success: true,
//       message: 'Post deleted successfully',
//       deletedPost 
//     });
    
//   } catch (error) {
//     console.error("Delete error:", error);
//     res.status(500).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// };


// export const updatePost = async (req, res) => {
//   try {
//     console.log("Request params:", req.params);
//     console.log("User ID from middleware:", req.userId);
//     console.log("Request body:", req.body);
//     console.log("Request file:", req.file);

//     const post = await Post.findById(req.params.id);
//     console.log("Found post:", post);
    
//     if (!post) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Post not found' 
//       });
//     }

//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         error: 'User authentication required'
//       });
//     }

//     if (post.author.toString() !== req.userId.toString()) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized to edit this post' 
//       });
//     }

//     const { content, tags } = req.body;
    
//     // At least one of content or image must be present
//     if ((!content || !content.trim()) && !req.file) {
//       return res.status(400).json({
//         success: false,
//         error: 'Post must contain either content or an image'
//       });
//     }

//     let imageData = null;
    
//     // Handle image upload if present
//     if (req.file) {
//       try {
//         // Delete old image if exists
//         if (post.imagePublicId) {
//           await cloudinary.uploader.destroy(post.imagePublicId);
//         }

//         const b64 = Buffer.from(req.file.buffer).toString("base64");
//         const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
//         const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
//           folder: "posts",
//           resource_type: "auto",
//           quality: "auto:good"
//         });

//         imageData = {
//           url: cloudinaryResponse.secure_url,
//           publicId: cloudinaryResponse.public_id
//         };
//       } catch (uploadError) {
//         console.error('Cloudinary upload error:', uploadError);
//         return res.status(500).json({
//           success: false,
//           error: 'Failed to upload image',
//           details: uploadError.message
//         });
//       }
//     }

//     // PROCESS TAGS FOR UPDATE
//     let tagIds = [];
//     if (tags) {
//       // Handle both string array and comma-separated string
//       const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
//       tagIds = await processTags(tagsArray);
//     }

//     // Get old tags for count update
//     const oldTagIds = post.tags.map(tag => tag.toString());

//     // Prepare update data
//     const updateData = {
//       content: content ? content.trim() : post.content,
//       ...(imageData && {
//         imageUrl: imageData.url,
//         imagePublicId: imageData.publicId
//       }),
//       ...(!req.file && !content && {
//         content: post.content,
//         imageUrl: post.imageUrl,
//         imagePublicId: post.imagePublicId
//       })
//     };

//     // Only update tags if new tags are provided
//     if (tags !== undefined) {
//       updateData.tags = tagIds;
//     }

//     // Remove image if requested
//     if (req.body.removeImage === 'true') {
//       if (post.imagePublicId) {
//         await cloudinary.uploader.destroy(post.imagePublicId);
//       }
//       updateData.imageUrl = null;
//       updateData.imagePublicId = null;
//     }

//     // Update tag counts - decrease counts for removed tags, increase for added tags
//     if (tags !== undefined) {
//       const tagsToRemove = oldTagIds.filter(tagId => !tagIds.includes(tagId));
//       const tagsToAdd = tagIds.filter(tagId => !oldTagIds.includes(tagId));
      
//       if (tagsToRemove.length > 0) {
//         await Tag.updateMany(
//           { _id: { $in: tagsToRemove } },
//           { $inc: { postCount: -1 } }
//         );
//       }
      
//       if (tagsToAdd.length > 0) {
//         await Tag.updateMany(
//           { _id: { $in: tagsToAdd } },
//           { $inc: { postCount: 1 } }
//         );
//       }
//     }

//     const updatedPost = await Post.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('author', 'name username photo')
//      .populate('tags', 'name slug postCount');

//     console.log("Updated post:", updatedPost);
    
//     res.json({ 
//       success: true,
//       message: 'Post updated successfully',
//       post: updatedPost 
//     });
    
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to update post',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import userModel from '../models/user.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import Tag from '../models/Tag.js';

// Helper function to process tags
const processTags = async (tagNames) => {
  const tagIds = [];
  
  for (const tagName of tagNames) {
    if (!tagName || typeof tagName !== 'string') continue;
    
    const cleanedTag = tagName.trim().toLowerCase();
    if (!cleanedTag) continue;
    
    let tag = await Tag.findOne({ name: cleanedTag });
    
    if (!tag) {
      tag = new Tag({
        name: cleanedTag,
        slug: cleanedTag.replace(/[^a-z0-9]/g, '-')
      });
      await tag.save();
    }
    
    tagIds.push(tag._id);
  }
  
  return tagIds;
};

// Helper function to update tag counts
const updateTagCounts = async (tagIds) => {
  try {
    for (const tagId of tagIds) {
      await Tag.findByIdAndUpdate(
        tagId,
        { $inc: { postCount: 1 } }
      );
    }
  } catch (error) {
    console.error('Error updating tag counts:', error);
  }
};

export const createPost = async (req, res) => {
  let imageData = null;
  
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
    }

    const { content, description } = req.body;

    // Handle tags from form-data
    let tags = [];
    if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        tags = req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
      } else if (Array.isArray(req.body.tags)) {
        tags = req.body.tags.map(tag => tag.trim().toLowerCase());
      }
    }

    const hasContent = content && content.trim() !== '';
    const hasDescription = description && description.trim() !== '';
    const hasImage = req.file;

    if (!hasContent && !hasImage) {
      return res.status(400).json({
        success: false,
        error: 'Post must contain either content or an image'
      });
    }

    // Validate content length
    if (hasContent && content.length > 2500) {
      return res.status(400).json({
        success: false,
        error: 'Content cannot exceed 2500 characters'
      });
    }

    // Validate description length
    if (hasDescription && description.length > 2500) {
      return res.status(400).json({
        success: false,
        error: 'Description cannot exceed 2500 characters'
      });
    }

    // Handle image upload
    if (hasImage) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "posts",
          resource_type: "auto",
          quality: "auto:good"
        });

        imageData = {
          url: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id
        };
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image',
          details: uploadError.message
        });
      }
    }

    // PROCESS TAGS
    let tagIds = [];
    if (tags && tags.length > 0) {
      tagIds = await processTags(tags);
    }

    // Create new post
    const post = new Post({
      content: hasContent ? content.trim() : null,
      description: hasDescription ? description.trim() : '',
      author: req.userId,
      tags: tagIds,
      ...(imageData && {
        imageUrl: imageData.url,
        imagePublicId: imageData.publicId
      })
    });

    await post.save();

    // UPDATE TAG COUNTS
    if (tagIds.length > 0) {
      await updateTagCounts(tagIds);
    }

    // Update user's posts array
    try {
      await userModel.findByIdAndUpdate(
        req.userId,
        { $push: { posts: post._id } },
        { new: true }
      );
    } catch (userUpdateError) {
      console.error('User update error:', userUpdateError);
    }

    // Populate author AND tags info
    const populatedPost = await Post.findById(post._id)
      .populate({
        path: 'author',
        select: 'name email bio avatar photo username'
      })
      .populate({
        path: 'tags',
        select: 'name slug postCount'
      })
      .lean();

    // Ensure consistent response structure
    const responseData = {
      _id: populatedPost._id,
      content: populatedPost.content,
      description: populatedPost.description,
      imageUrl: populatedPost.imageUrl,
      imagePublicId: populatedPost.imagePublicId,
      tags: populatedPost.tags || [],
      author: {
        _id: populatedPost.author._id,
        name: populatedPost.author.name,
        username: populatedPost.author.username,
        avatar: populatedPost.author.avatar,
        photo: populatedPost.author.photo,
        bio: populatedPost.author.bio
      },
      likes: populatedPost.likes || [],
      comments: populatedPost.comments || [],
      likeCount: populatedPost.likes ? populatedPost.likes.length : 0,
      commentCount: populatedPost.comments ? populatedPost.comments.length : 0,
      createdAt: populatedPost.createdAt,
      updatedAt: populatedPost.updatedAt
    };

    res.status(201).json({
      success: true,
      post: responseData
    });
    
  } catch (error) {
    console.error('Post creation error:', error);
    
    // Clean up uploaded image if error occurred
    if (imageData?.publicId) {
      try {
        await cloudinary.uploader.destroy(imageData.publicId);
      } catch (cleanupError) {
        console.error('Image cleanup failed:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create post',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all tags with post counts
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find()
      .sort({ postCount: -1, name: 1 })
      .select('name slug postCount');
    
    res.status(200).json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags'
    });
  }
};

// Get posts by specific tag
export const getPostsByTag = async (req, res) => {
  try {
    const { tagSlug } = req.params;
    
    const tag = await Tag.findOne({ slug: tagSlug });
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }
    
    const posts = await Post.find({ tags: tag._id, isPublic: true })
      .populate('author', 'name email bio photo username')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      tag: {
        name: tag.name,
        slug: tag.slug,
        postCount: tag.postCount
      },
      posts
    });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email bio photo username')
      .populate('tags', 'name slug');
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email bio username')
      .populate('tags', 'name slug');
      
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    console.log("Request params:", req.params);
    console.log("User ID from middleware:", req.userId);
    
    const post = await Post.findById(req.params.id);
    console.log("Found post:", post);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to delete this post' 
      });
    }

    // Decrement tag counts before deletion
    if (post.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: post.tags } },
        { $inc: { postCount: -1 } }
      );
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    console.log("Deleted post:", deletedPost);
    
    if (!deletedPost) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found during deletion' 
      });
    }

    res.json({ 
      success: true,
      message: 'Post deleted successfully',
      deletedPost 
    });
    
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const updatePost = async (req, res) => {
  let imageData = null;
  
  try {
    console.log("Request params:", req.params);
    console.log("User ID from middleware:", req.userId);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const post = await Post.findById(req.params.id);
    console.log("Found post:", post);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to edit this post' 
      });
    }

    const { content, description, tags } = req.body;
    
    // At least one of content or image must be present
    if ((!content || !content.trim()) && !req.file) {
      return res.status(400).json({
        success: false,
        error: 'Post must contain either content or an image'
      });
    }

    // Validate content length
    if (content && content.length > 2500) {
      return res.status(400).json({
        success: false,
        error: 'Content cannot exceed 2500 characters'
      });
    }

    // Validate description length
    if (description && description.length > 2500) {
      return res.status(400).json({
        success: false,
        error: 'Description cannot exceed 2500 characters'
      });
    }
    
    // Handle image upload if present
    if (req.file) {
      try {
        // Delete old image if exists
        if (post.imagePublicId) {
          await cloudinary.uploader.destroy(post.imagePublicId);
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "posts",
          resource_type: "auto",
          quality: "auto:good"
        });

        imageData = {
          url: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id
        };
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image',
          details: uploadError.message
        });
      }
    }

    // PROCESS TAGS FOR UPDATE
    let tagIds = [];
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      tagIds = await processTags(tagsArray);
    }

    // Get old tags for count update
    const oldTagIds = post.tags.map(tag => tag.toString());

    // Prepare update data
    const updateData = {
      content: content ? content.trim() : post.content,
      description: description !== undefined ? description.trim() : post.description,
      ...(imageData && {
        imageUrl: imageData.url,
        imagePublicId: imageData.publicId
      }),
      ...(!req.file && !content && {
        content: post.content,
        imageUrl: post.imageUrl,
        imagePublicId: post.imagePublicId
      })
    };

    // Only update tags if new tags are provided
    if (tags !== undefined) {
      updateData.tags = tagIds;
    }

    // Remove image if requested
    if (req.body.removeImage === 'true') {
      if (post.imagePublicId) {
        await cloudinary.uploader.destroy(post.imagePublicId);
      }
      updateData.imageUrl = null;
      updateData.imagePublicId = null;
    }

    // Update tag counts - decrease counts for removed tags, increase for added tags
    if (tags !== undefined) {
      const tagsToRemove = oldTagIds.filter(tagId => !tagIds.includes(tagId));
      const tagsToAdd = tagIds.filter(tagId => !oldTagIds.includes(tagId));
      
      if (tagsToRemove.length > 0) {
        await Tag.updateMany(
          { _id: { $in: tagsToRemove } },
          { $inc: { postCount: -1 } }
        );
      }
      
      if (tagsToAdd.length > 0) {
        await Tag.updateMany(
          { _id: { $in: tagsToAdd } },
          { $inc: { postCount: 1 } }
        );
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name username photo')
     .populate('tags', 'name slug postCount');

    console.log("Updated post:", updatedPost);
    
    res.json({ 
      success: true,
      message: 'Post updated successfully',
      post: updatedPost 
    });
    
  } catch (error) {
    console.error("Update error:", error);
    
    // Clean up uploaded image if error occurred
    if (imageData?.publicId) {
      try {
        await cloudinary.uploader.destroy(imageData.publicId);
      } catch (cleanupError) {
        console.error('Image cleanup failed:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to update post',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const post = await Post.findById(postId)
      .populate({
        path: 'likes',
        select: 'name username photo'
      });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user can view private post
    if (!post.isPublic && post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied to private post' });
    }
    
    res.status(200).json({
      success: true,
      likes: post.likes || []
    });
  } catch (error) {
    console.error('Error fetching post likes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching likes' 
    });
  }
};
// Get comments for a specific post with user details
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Check if the post exists and is accessible
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if the post is public or user is the author
    if (!post.isPublic && post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied to private post' });
    }
    
    // Find comments for the post and populate author details
    const comments = await Comment.find({ post: postId })
      .populate({
        path: 'author',
        select: 'name username photo'
      })
      .populate({
        path: 'likes',
        select: 'name username photo'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Error fetching post comments:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};



// controllers/commentController.js


export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create new comment
    const comment = new Comment({
      content,
      author: userId,
      post: postId
    });

    // Save comment
    await comment.save();

    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();

    // Populate author info before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name username photo');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    // Find the comment and populate author info if needed
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }
    console.log(comment.author.toString(),"525")
    // Check authorization
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this comment' 
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Remove comment reference from the post
    await Post.findByIdAndUpdate(
      comment.post,
      { $pull: { comments: commentId } }
    );

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};


export const getComments = async (req, res) => {
  // try {
  //   const { postId } = req.params;

  //   // Check if post exists
  //   const post = await Post.findById(postId);
  //   if (!post) {
  //     return res.status(404).json({ message: 'Post not found' });
  //   }

  //   // Get all comments for the post and populate author info
  //   const comments = await Comment.find({ post: postId })
  //     .populate('author', 'name username photo')
  //     .sort({ createdAt: -1 }); // Newest first

  //   res.status(200).json({
  //     success: true,
  //     comments
  //   });

  // } catch (error) {
  //   console.error('Error fetching comments:', error);
  //   res.status(500).json({ message: 'Server error' });
  // }


  try {
    const { postId } = req.params;
    
    // If you have a separate Comment model
    const comments = await Comment.find({ post: postId })
      .populate('author', 'name username photo email profilePicture avatar')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log('Found comments:', comments.length);
    
    res.status(200).json({
      success: true,
      comments: comments
    });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    // Check if user already liked the post
    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    // Toggle like status
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      post: updatedPost
    });

  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update like status' 
    });
  }
};

export const deletePostImage = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    // Authorization check (middleware already verified the user)
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to edit this post' 
      });
    }

    // Check if post has an image to delete
    if (!post.imageUrl && !post.imagePublicId) {
      return res.status(400).json({
        success: false,
        error: 'Post does not have an image to delete'
      });
    }

    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    // Update post to remove image references
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          imageUrl: null,
          imagePublicId: null
        }
      },
      { new: true, runValidators: true }
    ).populate('author', 'name username avatar');

    res.json({ 
      success: true,
      message: 'Image deleted successfully',
      post: updatedPost 
    });
    
  } catch (error) {
    console.error("");
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete image from post',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// In your posts routes file
export const searchUser = async (req, res) => {
  try {
    const query = req.query.q || '';
    const posts = await Post.find({
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { 'author.name': { $regex: query, $options: 'i' } },
        { 'author.username': { $regex: query, $options: 'i' } }
      ]
    })
    .populate('author', 'name username avatar')
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
};