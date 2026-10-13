import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {blogPostContainerID} from '@docusaurus/utils-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
import BlogAuthorCard from '@site/src/components/BlogAuthorCard';
import type {Props} from '@theme/BlogPostItem/Content';

export default function BlogPostItemContent({
  children,
  className,
}: Props): ReactNode {
  const {isBlogPostPage, metadata, frontMatter, assets} = useBlogPost();
  const cardAuthors = metadata.authors.map((author, idx) => ({
    ...author,
    imageURL: assets.authorsImageUrls[idx] ?? author.imageURL,
  }));
  // Docusaurus's `image:` frontmatter doubles as the list-card thumbnail
  // and the OG/RSS social image, but it doesn't auto-render at the top
  // of the post body. Inject it here when present so readers see the
  // hero on the article page too — the convention every modern blog
  // (Medium, Stripe, Linear, Vercel) follows. Posts without `image:`
  // stay text-only; no placeholder is drawn.
  const heroImage = assets.image ?? frontMatter.image;
  // Optional credit line under the hero, e.g. for third-party logos:
  // `image_credit: "AV1 logo: Alliance for Open Media"` and an optional
  // `image_credit_url` that links the text to its source.
  const {image_credit: heroCredit, image_credit_url: heroCreditUrl} =
    frontMatter as {image_credit?: string; image_credit_url?: string};
  return (
    <div
      // This ID is used for the feed generation to locate the main content
      id={isBlogPostPage ? blogPostContainerID : undefined}
      className={clsx('markdown', className)}>
      {isBlogPostPage && heroImage && !heroCredit && (
        <img
          src={heroImage as string}
          alt=""
          className="blog-hero"
          loading="eager"
        />
      )}
      {isBlogPostPage && heroImage && heroCredit && (
        <figure className="blog-hero-figure">
          <img
            src={heroImage as string}
            alt=""
            className="blog-hero"
            loading="eager"
          />
          <figcaption>
            {heroCreditUrl ? (
              <a href={heroCreditUrl} target="_blank" rel="noopener noreferrer">
                {heroCredit}
              </a>
            ) : (
              heroCredit
            )}
          </figcaption>
        </figure>
      )}
      {isBlogPostPage && cardAuthors.length > 0 && (
        <BlogAuthorCard authors={cardAuthors} />
      )}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
