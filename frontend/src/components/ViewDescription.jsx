import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EyeIcon, TagIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import { assets } from '../assets/assets';
import { Navbar } from './Navbar';
import { BackButton } from './BackButton';

const ViewDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post;

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <EyeIcon className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const extractTagName = (tag) => {
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object') return tag.name || tag._id || 'Unknown';
    return String(tag);
  };

  const tagColors = [
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-blue-500 to-indigo-500',
    'bg-gradient-to-r from-emerald-500 to-teal-500',
    'bg-gradient-to-r from-orange-500 to-red-500',
    'bg-gradient-to-r from-indigo-500 to-purple-500',
    'bg-gradient-to-r from-pink-500 to-rose-500',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
              <BackButton 
        id={id} 
        state={{
          verifiyKey: "product_back_123",
          source: "ViewAllProductsUser",
          timestamp: Date.now()
        }}
      />

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mt-12"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-1">
                <img
                  src={post.author?.photo || assets.user_image}
                  alt="Author"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {post.author?.name || 'Unknown User'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{moment(post.createdAt).format('MMMM D, YYYY')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>@{post.author?.bio || 'No Bio Available'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {post.content && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Content</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                  {post.content}
                </p>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <TagIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-700">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-full text-white font-semibold text-sm ${tagColors[index % tagColors.length]}`}
                    >
                      #{extractTagName(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center space-x-3 mb-4">
              <EyeIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Full Description</h2>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                {post.description}
              </p>
            </div>
          </div>

          {/* Image Section */}
          {post.imageUrl && (
            <div className="p-6 sm:p-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Attached Image</h3>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="p-6 sm:p-8 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{post.likes?.length || 0}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{post.comments?.length || 0}</div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{post.tags?.length || 0}</div>
                <div className="text-sm text-gray-600">Tags</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {post.description ? post.description.length : 0}
                </div>
                <div className="text-sm text-gray-600">Description Length</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewDescription;