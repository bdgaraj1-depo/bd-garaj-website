import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { blogAPI } from '../services/api';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogAPI.getOne(id);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Blog yazısı bulunamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="blog-detail-page">
      <Navbar />

      <div className="flex-grow bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-8"
            data-testid="back-to-blog-link"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Tüm Blog Yazılarına Dön
          </Link>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg" data-testid="error-message">{error}</p>
            </div>
          ) : (
            <article className="bg-white rounded-xl shadow-lg overflow-hidden" data-testid="blog-post-detail">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                  data-testid="blog-post-image"
                />
              )}
              {!post.image_url && (
                <div className="w-full h-96 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-8xl">🏍️</span>
                </div>
              )}

              <div className="p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="blog-post-title">
                  {post.title}
                </h1>

                <div className="flex items-center text-gray-600 mb-8 pb-8 border-b">
                  <span className="mr-4">👤 {post.author}</span>
                  <span>📅 {formatDate(post.created_at)}</span>
                </div>

                <div className="prose prose-lg max-w-none" data-testid="blog-post-content">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t">
                  <Link
                    to="/randevu"
                    className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                    data-testid="blog-cta-appointment"
                  >
                    Hemen Randevu Al
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;