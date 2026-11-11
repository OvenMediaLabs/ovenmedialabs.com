import React, {useState, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

const STORAGE_KEY = 'oml_interbee2026';
const BLOG_SLUG = 'meet-at-interbee2026';
const BLOG_URL = `/blog/${BLOG_SLUG}`;
const BLOG_TITLE = 'Meet OvenMedia Labs at Inter BEE 2026 in Japan!';
const THUMBNAIL = '/images/blog/interbee2026.png';


export default function AnnouncementBanner(): React.ReactElement | null {
  const {pathname} = useLocation();
  const [visible, setVisible] = useState(false);

  const isOnPost = pathname.includes(BLOG_SLUG);

  useEffect(() => {
    if (isOnPost) {
      setVisible(false);
      return;
    }
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if (val && Date.now() - parseInt(val, 10) < 24 * 60 * 60 * 1000) return;
    } catch {}
    setVisible(true);
  }, [pathname]);

  if (!visible) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
  };

  const snooze = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {localStorage.setItem(STORAGE_KEY, String(Date.now()));} catch {}
    setVisible(false);
  };

  return (
    <div className="ann-banner">
      <a href={BLOG_URL} className="ann-banner-link">
        <img src={THUMBNAIL} className="ann-banner-thumb" alt="" aria-hidden="true" />
        <span className="ann-banner-body">
          <span className="ann-banner-label">Event</span>
          <span className="ann-banner-title">{BLOG_TITLE}</span>
        </span>
        <span className="ann-banner-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </a>
      <div className="ann-banner-footer">
        <button className="ann-banner-snooze" onClick={snooze}>Don't show again today</button>
        <button className="ann-banner-close" onClick={dismiss} aria-label="닫기">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
