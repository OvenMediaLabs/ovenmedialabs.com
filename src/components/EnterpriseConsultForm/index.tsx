import React, {useState, useEffect} from 'react';

const ENDPOINT = 'https://form-api.ovenmedia.com/api/forms/enterprise-consult';

const LICENSE = 'OvenMediaEngine Enterprise License';
const SUPPORT = 'Enterprise Support Program';
const X264   = 'x264 Add-on';

const INTERESTS = [LICENSE, SUPPORT, X264];

type Status = 'idle' | 'submitting' | 'ok' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_ERROR: Record<string, string> = {
  name:      'Please enter your name.',
  email:     'Please enter a valid work email.',
  message:   'Please tell us about your inquiry.',
  interests: 'Please select at least one area of interest.',
};

export default function EnterpriseConsultForm(): React.ReactElement {
  const [status, setStatus] = useState<Status>('idle');
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const param = new URLSearchParams(window.location.search).get('interest');
    const MAP: Record<string, string[]> = {
      license: [LICENSE],
      x264:    [X264, LICENSE],
      support: [SUPPORT, LICENSE],
    };
    const preset = param ? MAP[param] : undefined;
    if (preset) setInterests(preset);
  }, []);

  const toggleInterest = (t: string) => {
    setInterests((prev) => {
      if (prev.includes(t)) {
        // Deselecting Enterprise License clears all dependents too
        if (t === LICENSE) return [];
        return prev.filter((x) => x !== t);
      }
      // Selecting x264 or Support Program also ensures License is selected
      if (t === X264 || t === SUPPORT) {
        const next = prev.includes(LICENSE) ? [...prev, t] : [...prev, t, LICENSE];
        return next;
      }
      return [...prev, t];
    });
    if (errors.interests) setErrors((p) => ({...p, interests: ''}));
  };

  function validate(p: {name: string; email: string}, sel: string[]) {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = FIELD_ERROR.name;
    if (!p.email.trim() || !EMAIL_RE.test(p.email.trim())) e.email = FIELD_ERROR.email;
    if (!sel.length) e.interests = FIELD_ERROR.interests;
    return e;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name:        String(fd.get('name') || ''),
      email:       String(fd.get('email') || ''),
      company:     String(fd.get('company') || ''),
      country:     String(fd.get('country') || ''),
      interests,
      message:     String(fd.get('message') || ''),
      company_url: String(fd.get('company_url') || ''), // honeypot
    };

    const clientErrors = validate(payload, interests);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setStatus('idle');
      const firstKey = Object.keys(clientErrors)[0];
      document.getElementById(firstKey === 'interests' ? 'ecf-interests' : `ecf-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    setStatus('submitting');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ok: false}));
      if (res.ok && data.ok) {
        setStatus('ok');
        form.reset();
        setInterests([]);
      } else if (Array.isArray(data.fields) && data.fields.length) {
        const e2: Record<string, string> = {};
        for (const k of data.fields) e2[k] = FIELD_ERROR[k] || 'Please check this field.';
        setErrors(e2);
        setStatus('idle');
        document.getElementById(`ecf-${data.fields[0]}`)?.focus();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="consult-form consult-done text-center">
        <i className="ph ph-check-circle consult-done-icon" />
        <h3 className="text-main fw-bold mb-2">Thank You for Contacting Us!</h3>
        <p className="text-sub mb-4">
          We've received your inquiry.<br/>The OvenMediaEngine Enterprise team will contact you as soon as possible.
        </p>
        <a href="/#enterprise" className="btn btn-enterprise-outline rounded-pill px-4">
          <i className="ph ph-arrow-left me-2" />Back to OvenMediaEngine Enterprise
        </a>
      </div>
    );
  }

  const submitting = status === 'submitting';

  return (
    <form className="consult-form reveal-up" onSubmit={onSubmit} noValidate>
      <div className="row g-4h">
        <div className="col-md-6">
          <label className="consult-label" htmlFor="ecf-name">
            Name <span className="consult-req">*</span>
          </label>
          <input className={`consult-input${errors.name ? ' is-invalid' : ''}`} id="ecf-name" name="name" type="text"
            placeholder="Your full name" maxLength={200}
            aria-invalid={!!errors.name}
            onInput={() => errors.name && setErrors((p) => ({...p, name: ''}))} />
          {errors.name && <span className="consult-field-error">{errors.name}</span>}
        </div>
        <div className="col-md-6">
          <label className="consult-label" htmlFor="ecf-email">
            Work Email <span className="consult-req">*</span>
          </label>
          <input className={`consult-input${errors.email ? ' is-invalid' : ''}`} id="ecf-email" name="email" type="email"
            placeholder="you@company.com" maxLength={320}
            aria-invalid={!!errors.email}
            onInput={() => errors.email && setErrors((p) => ({...p, email: ''}))} />
          {errors.email && <span className="consult-field-error">{errors.email}</span>}
        </div>
        <div className="col-md-6">
          <label className="consult-label" htmlFor="ecf-company">
            Company or Organization
          </label>
          <input className="consult-input" id="ecf-company" name="company" type="text"
            placeholder="Company or organization name" maxLength={300} />
        </div>
        <div className="col-md-6">
          <label className="consult-label" htmlFor="ecf-country">
            Country
          </label>
          <input className="consult-input" id="ecf-country" name="country" type="text"
            placeholder="e.g. South Korea, United States, Germany" maxLength={200} />
        </div>

        <div className="col-12">
          <label className="consult-label d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-baseline">
            <span>What Are You Interested In? <span className="consult-req">*</span></span>
            <span className="text-mono small fw-normal">* The x264 Add-on and Support Program require an OvenMediaEngine Enterprise License</span>
          </label>
          <div id="ecf-interests" className={`consult-chips${errors.interests ? ' is-invalid' : ''}`} tabIndex={-1}>
            {INTERESTS.map((t) => {
              const active = interests.includes(t);
              return (
                <button type="button" key={t}
                  className={`consult-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => toggleInterest(t)}>
                  <i aria-hidden="true">
                    <svg viewBox="0 0 16 16"><path d="M3.5 8.4l3 3 6-6.4" /></svg>
                  </i>
                  {t}
                </button>
              );
            })}
          </div>
          {errors.interests && <span className="consult-field-error">{errors.interests}</span>}
        </div>

        <div className="col-12">
          <label className="consult-label" htmlFor="ecf-message">
            Is There Anything Else You'd Like Us to Know?
          </label>
          <textarea className="consult-input consult-textarea" id="ecf-message" name="message"
            rows={5} maxLength={10000}
            placeholder="Tell us briefly about your service, requirements, or any questions you may have." />
        </div>

        {/* honeypot: hidden from humans, catches bots */}
        <div className="consult-hp" aria-hidden="true">
          <label htmlFor="ecf-company-url">Company URL</label>
          <input id="ecf-company-url" name="company_url" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="col-12 d-flex flex-column align-items-center pt-2">
          <button type="submit" className="btn btn-enterprise-outline px-5 py-2" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit Inquiry'}
          </button>
          {Object.values(errors).some(Boolean) && (
            <p className="consult-error mt-3 mb-0">
              Please fill in the highlighted required fields above.
            </p>
          )}
          {status === 'error' && (
            <p className="consult-error mt-3 mb-0">
              Something went wrong. Please try again, or email{' '}
              <a href="mailto:contact@ovenmedia.com">contact@ovenmedia.com</a>.
            </p>
          )}
          <p className="text-sub2 small mt-3 mb-0 text-center">
            This inquiry is free and non-binding. Our team will review and follow up by email.
          </p>
        </div>
      </div>
    </form>
  );
}
