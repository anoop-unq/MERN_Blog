import Tag from '../models/Tag.js';

// Function to process tags from string to Tag documents
export const processTags = async (tagNames) => {
  if (!tagNames || !Array.isArray(tagNames)) return [];
  
  const processedTags = [];
  
  for (const tagName of tagNames) {
    if (typeof tagName !== 'string' || !tagName.trim()) continue;
    
    const cleanName = tagName.trim().toLowerCase();
    if (!cleanName) continue;
    
    // Find existing tag or create new one
    let tag = await Tag.findOne({ name: cleanName });
    
    if (!tag) {
      // Create new tag
      const slug = cleanName.replace(/[^a-z0-9]/g, '-');
      tag = new Tag({
        name: cleanName,
        slug: slug
      });
      await tag.save();
    }
    
    processedTags.push(tag._id);
  }
  
  return processedTags;
};

// Function to update tag counts when post is created/updated/deleted
export const updateTagCounts = async (tagIds) => {
  for (const tagId of tagIds) {
    const postCount = await mongoose.model('Post').countDocuments({ 
      tags: tagId,
      isPublic: true 
    });
    
    await Tag.findByIdAndUpdate(tagId, { postCount });
  }
};