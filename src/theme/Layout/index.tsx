import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import type {Props} from '@theme/Layout';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';

function isBlogListPath(pathname: string): boolean {
  return (
    pathname === '/blog' ||
    pathname === '/blog/' ||
    /^\/blog\/page\//.test(pathname) ||
    /^\/blog\/tags/.test(pathname) ||
    /^\/blog\/archive/.test(pathname)
  );
}

export default function Layout({title, children, ...props}: Props): React.ReactNode {
  const {pathname} = useLocation();
  const showBlogListTitle = isBlogListPath(pathname);

  return (
    <OriginalLayout title={title} {...props}>
      {children}
      {showBlogListTitle && <Head><title>OvenMedia Blog | OvenMediaEngine Team's Insights</title></Head>}
    </OriginalLayout>
  );
}
