import React, {useState, useEffect, useRef} from 'react';

const ENDPOINT = 'https://form-api.ovenmedia.com/api/forms/newsletter';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export default function NewsletterForm(): React.ReactElement {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (status !== 'ok') return;
    const timer = setTimeout(() => {
      setStatus('idle');
      setError('');
      setFormKey((k) => k + 1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    if (!email || !EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setStatus('submitting');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email,
          company_url: String(fd.get('company_url') || ''), // honeypot
        }),
      });
      const data = await res.json().catch(() => ({ok: false}));
      if (res.ok && data.ok) {
        setStatus('ok');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const isOk = status === 'ok';
  const submitting = status === 'submitting';
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const input = field.querySelector<HTMLInputElement>('.nl-input');
    const lab = field.querySelector<HTMLElement>('.nl-lab');
    const line = field.querySelector<HTMLElement>('.nl-line');
    const ph = field.querySelector<HTMLElement>('.nl-ph');
    if (!input || !lab || !line || !ph) return;

    function setGap(up: boolean) {
      line!.style.setProperty('--gap', up ? (lab!.offsetWidth * 0.78 + 6) + 'px' : '0px');
    }

    function lift() {
      const up = document.activeElement === input || input!.value.length > 0;
      field!.classList.toggle('is-up', up);
      setGap(up);
    }

    function onFocus() {
      field!.classList.add('is-focus');
      lift();
    }

    function onBlur() {
      field!.classList.remove('is-focus');
      const isEmpty = input!.value.length === 0;
      const wasUp = field!.classList.contains('is-up');
      if (isEmpty && wasUp) {
        // label fades out in place (no movement)
        lab!.style.transition = 'opacity .18s';
        lab!.style.opacity = '0';
        setGap(false);
        setTimeout(() => {
          if (!field!.isConnected) return;
          // instantly freeze transform at center before restoring — no animation
          field!.classList.remove('is-up');
          lab!.style.transition = 'none';
          lab!.style.transform = 'none';
          lab!.style.opacity = '0';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            lab!.style.transition = '';
            lab!.style.transform = '';
            lab!.style.opacity = '';
          }));
          // placeholder reveals left → right
          ph!.style.clipPath = 'inset(0 100% 0 0)';
          void ph!.offsetWidth;
          ph!.style.transition = 'clip-path .18s cubic-bezier(.2,.8,.2,1)';
          ph!.style.clipPath = 'inset(0 0% 0 0)';
          setTimeout(() => { ph!.style.transition = ''; ph!.style.clipPath = ''; }, 200);
        }, 200);
      } else {
        lift();
      }
    }

    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);
    input.addEventListener('input', lift);
    lift();

    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('input', lift);
    };
  }, [formKey]);

  return (
    <div style={{position: 'relative'}}>
      {/* Normal content — fades out on success */}
      <div style={{opacity: isOk ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: isOk ? 'none' : 'auto'}}>
        <h2 className="h2s fw-bold text-main mb-3">Stay Up to Date with OvenMedia Labs</h2>
        <p className="lead text-sub fw-light mb-4 col-lg-8 mx-auto">Get release notes, technical insights, and company news delivered to your inbox.</p>
        <form key={formKey} onSubmit={onSubmit} noValidate>
          <div className="col-lg-5 mx-auto">
            <div className="row g-2 align-items-center">
              <div className="col">
                <div className={`nl-field${error ? ' is-invalid' : ''}`} ref={fieldRef}>
                  <div className="nl-box">
                    <input
                      className="nl-input"
                      id="nl-email" name="email" type="email"
                      placeholder="Please enter your email"
                      maxLength={320}
                      aria-invalid={!!error}
                      onInput={() => error && setError('')}
                    />
                    <span className="nl-line" aria-hidden="true">
                      <i className="nl-l" /><i className="nl-g" /><i className="nl-r" />
                    </span>
                    <label className="nl-lab" htmlFor="nl-email">Email{' '}</label>
                    <span className="nl-ph" aria-hidden="true">Please enter your email</span>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <button type="submit" className="btn btn-sm btn-secondary-outline2" disabled={submitting}>
                  {submitting ? 'Subscribing…' : 'Subscribe'}
                </button>
              </div>
            </div>
            {error && <span className="consult-field-error d-block text-start mt-1">{error}</span>}
            {status === 'error' && (
              <p className="consult-error mt-2 mb-0 text-center small">
                Something went wrong. Please try again.
              </p>
            )}
            <div className="consult-hp" aria-hidden="true">
              <label htmlFor="nl-company-url">Company URL</label>
              <input id="nl-company-url" name="company_url" type="text" tabIndex={-1} autoComplete="off" />
            </div>
          </div>
          <div className="col-lg-10 mx-auto">
            <p className="text-mono-deep small mt-3 mb-0 text-center">
              By subscribing, you agree to receive emails from OvenMedia Labs. You can unsubscribe at any time.
            </p>
          </div>
        </form>
      </div>

      {/* Success message — fades in on success, centered over original content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: isOk ? 1 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: isOk ? 'auto' : 'none',
      }}>
        <p className="lead text-main fw-bold mb-2">You're subscribed!</p>
        <p className="text-sub small mb-0">Thanks for subscribing.<br/>We'll keep you updated with the latest news from OvenMedia Labs.</p>
      </div>
    </div>
  );
}
