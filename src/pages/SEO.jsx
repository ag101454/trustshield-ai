import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url }) {
  const siteName = 'TrustShield AI';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'AI-powered scam detection platform. Check websites, emails, and messages for threats.';
  const defaultImage = '/og-image.png';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || 'https://trustshield.ai'} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Additional */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#060606" />
      <link rel="canonical" href={url || 'https://trustshield.ai'} />
    </Helmet>
  );
}