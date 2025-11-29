import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_SEO = {
  title: 'AnimeStream Hub - Free Hindi Dubbed Anime | Watch Anime Online in Hindi',
  description: 'Watch free Hindi dubbed anime online. Stream your favorite anime series and movies in Hindi, English, Japanese and more languages. Best free anime website with Hindi dub, English sub, and multiple language options. Browse by genre, season, and year.',
  keywords: 'free hindi dubbed anime, hindi dub anime, anime in hindi, watch anime in hindi, hindi anime website, free anime hindi, anime hindi dubbed, hindi me anime, best hindi anime site, watch anime online free, anime streaming, free anime website, anime with hindi audio, hindi dubbed anime series',
  image: 'https://animestreamhub.com/og-image.jpg',
  url: 'https://animestreamhub.com',
  type: 'website'
};

export function useSEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}: SEOProps = {}) {
  useEffect(() => {
    const seoTitle = title ? `${title} | AnimeStream Hub` : DEFAULT_SEO.title;
    const seoDescription = description || DEFAULT_SEO.description;
    const seoKeywords = keywords || DEFAULT_SEO.keywords;
    const seoImage = image || DEFAULT_SEO.image;
    const seoUrl = url || DEFAULT_SEO.url;

    // Update document title
    document.title = seoTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('title', seoTitle);
    updateMetaTag('description', seoDescription);
    updateMetaTag('keywords', seoKeywords);
    
    if (author) {
      updateMetaTag('author', author);
    }

    // Open Graph tags
    updateMetaTag('og:title', seoTitle, true);
    updateMetaTag('og:description', seoDescription, true);
    updateMetaTag('og:image', seoImage, true);
    updateMetaTag('og:url', seoUrl, true);
    updateMetaTag('og:type', type, true);
    
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:title', seoTitle);
    updateMetaTag('twitter:description', seoDescription);
    updateMetaTag('twitter:image', seoImage);
    updateMetaTag('twitter:url', seoUrl);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seoUrl);

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime]);
}
