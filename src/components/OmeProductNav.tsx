import React, { useState, useEffect } from 'react';

const NAVBAR_H = 78;
const NAVBAR_H_MOBILE = 64;

const PRODUCTS = [
  { href: '#enterprise',  label: 'OvenMediaEngine Enterprise', color: 'rgb(56, 189, 248)',  bg: 'rgba(56, 189, 248, 0.15)',  border: 'rgba(56, 189, 248, 0.35)'  },
  { href: '#open-source', label: 'OvenMediaEngine',  color: 'rgb(74, 222, 128)',  bg: 'rgba(74, 222, 128, 0.15)',  border: 'rgba(74, 222, 128, 0.35)'  },
  { href: '/ome-consultation', label: 'sales', color: '#C5A38E', bg: 'rgba(197, 163, 142, 0.15)', border: 'rgba(197, 163, 142, 0.3)' },
];

const ContactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9Z" />
  </svg>
);

export default function OmeProductNav(): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const checkMobile = () => setIsMobile(mq.matches);
    checkMobile();
    mq.addEventListener('change', checkMobile);

    const enterprise = document.getElementById('enterprise');
    if (!enterprise) return;

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const threshold = enterprise.offsetTop - NAVBAR_H - 200;
        setVisible(window.scrollY >= threshold);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener('change', checkMobile);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  if (isMobile) {
    // Mobile: full-width strip directly below navbar
    return (
      <div
        id="ome-scroll-menu"
        style={{
          position: 'fixed',
          top: NAVBAR_H_MOBILE,
          left: 0,
          right: 0,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          zIndex: 999,
          display: 'flex',
          alignItems: 'stretch',
          background: 'rgba(5, 7, 10, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {PRODUCTS.map(({ href, label, color, bg }) => (
          <a
            key={href}
            href={href}
            className="ome-nav-btn"
            style={{
              flex: label === 'sales' ? '0 0 auto' : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: label === 'sales' ? '8px 14px' : '8px 4px',
              background: bg.replace(', 0.15)', ', 0.25)'),
              color,
              fontSize: '11px',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              textAlign: 'center',
              borderLeft: label === 'sales' ? '1px solid rgba(233,237,246,0.1)' : undefined,
            }}
          >
            {label === 'sales' ? <ContactIcon /> : label}
          </a>
        ))}
      </div>
    );
  }

  // Desktop: floating pill
  return (
    <div
      id="ome-scroll-menu"
      style={{
        position: 'fixed',
        left: '50%',
        top: 'calc(78px + 8px)',
        width: 'min(92vw, 560px)',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-14px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 999,
        display: 'flex',
        alignItems: 'stretch',
        gap: '6px',
        padding: '5px 6px',
        background: 'rgba(5, 7, 10, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '999px',
        border: '1px solid rgba(233, 237, 246, 0.1)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
        transition: 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {PRODUCTS.map(({ href, label, color, bg, border }, i) => (
        <React.Fragment key={href}>
          {label === 'sales' && (
            <div style={{width: '1px', background: 'rgba(233,237,246,0.12)', margin: '4px 8px'}} />
          )}
          <a
            href={href}
            className="ome-nav-btn"
            style={{
              flex: label === 'sales' ? '0 0 auto' : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: label === 'sales' ? '7px 14px' : '7px 8px',
              borderRadius: '999px',
              background: bg,
              border: label === 'sales' ? `1.5px solid ${border}` : `1px solid ${border}`,
              color,
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              textAlign: 'center',
            }}
          >
            {href === '#open-source' ? (
              <>
                <span className="d-none d-md-inline">OvenMediaEngine</span>
                <span className="d-md-none">OME</span>
              </>
            ) : label === 'sales' ? (
              <ContactIcon />
            ) : label}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
}
