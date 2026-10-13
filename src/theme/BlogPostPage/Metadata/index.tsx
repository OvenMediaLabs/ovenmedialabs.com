import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';

export default function BlogPostPageMetadata(): ReactNode {
  const {assets, metadata} = useBlogPost();
  const {title, description, date, tags, authors, permalink, frontMatter} = metadata;
  const {keywords} = frontMatter;
  const image = assets.image ?? frontMatter.image;
  const displayTitle = frontMatter.title_meta ?? title;
  const {siteConfig} = useDocusaurusContext();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: displayTitle,
    ...(description && {description}),
    datePublished: date,
    author: authors.map((author) => ({
      '@type': 'Person',
      name: author.name,
      ...(author.url && {url: author.url}),
    })),
    publisher: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: 'OvenMedia Labs Inc.',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}${permalink}`,
    },
    url: `${siteConfig.url}${permalink}`,
    ...(image && {
      image:
        typeof image === 'string' && !image.startsWith('http')
          ? `${siteConfig.url}${image}`
          : image,
    }),
    keywords: keywords ?? [],
  };

  return (
    <>
      <PageMetadata
        title={displayTitle}
        description={description}
        keywords={keywords}
        image={image}>
        <title>{displayTitle} | OvenMedia Blog</title>
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={date} />
        {authors.some((author) => author.url) && (
          <meta
            property="article:author"
            content={authors.map((author) => author.url).filter(Boolean).join(',')}
          />
        )}
        {tags.length > 0 && (
          <meta
            property="article:tag"
            content={tags.map((tag) => tag.label).join(',')}
          />
        )}
      </PageMetadata>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Head>
    </>
  );
}
