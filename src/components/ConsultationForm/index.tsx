import React, {useState, useEffect} from 'react';

const ENDPOINT = 'https://form-api.ovenmedia.com/api/forms/oc-consult';

const PROJECT_STAGES = [
  'Planning',
  'Proof of Concept',
  'Preparing for Launch',
  'In Production',
  'Migrating from Another Platform',
];

const HELP_TOPICS = [
  'Not Sure Yet',
  'Architecture Design',
  'Infrastructure',
  'Custom Development',
  'Channel Configuration',
  'Transcoding',
  'Deployment',
  'CDN or Third-Party Integration',
  'Web Console',
  'Migration',
  '24/7 Managed Operations',
];

type Status = 'idle' | 'submitting' | 'ok' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Human-readable messages keyed by field. Also used to translate the
// server's invalid_fields response into inline messages.
const FIELD_ERROR: Record<string, string> = {
  name: 'Please enter your name.',
  email: 'Please enter a valid work email.',
  company: 'Please enter your company or organization.',
  message: 'Please tell us a bit about your live streaming service.',
};

export default function ConsultationForm(): React.ReactElement {
  const [status, setStatus] = useState<Status>('idle');
  const [topics, setTopics] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consented, setConsented] = useState(false);
  const [consentRequired, setConsentRequired] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const param = new URLSearchParams(window.location.search).get('topic');
    const MAP: Record<string, string> = {
      'managed-ops': '24/7 Managed Operations',
    };
    const preset = param ? MAP[param] : undefined;
    if (preset) setTopics([preset]);
  }, []);

  const toggleTopic = (t: string) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  function validate(p: {name: string; email: string; company: string; message: string}) {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = FIELD_ERROR.name;
    if (!p.email.trim() || !EMAIL_RE.test(p.email.trim())) e.email = FIELD_ERROR.email;
    if (!p.company.trim()) e.company = FIELD_ERROR.company;
    if (!p.message.trim()) e.message = FIELD_ERROR.message;
    return e;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      company: String(fd.get('company') || ''),
      region: String(fd.get('region') || ''),
      stage: String(fd.get('stage') || ''),
      topics,
      message: String(fd.get('message') || ''),
      company_url: String(fd.get('company_url') || ''), // honeypot
    };

    const clientErrors = validate(payload);
    const hasFieldErrors = Object.keys(clientErrors).length > 0;
    if (!consented) setConsentRequired(true);
    if (hasFieldErrors || !consented) {
      if (hasFieldErrors) {
        setErrors(clientErrors);
        document.getElementById(`cf-${Object.keys(clientErrors)[0]}`)?.focus();
      }
      setStatus('idle');
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
        setTopics([]);
      } else if (Array.isArray(data.fields) && data.fields.length) {
        // Server-side field validation (should rarely trigger after client check)
        const e2: Record<string, string> = {};
        for (const k of data.fields) e2[k] = FIELD_ERROR[k] || 'Please check this field.';
        setErrors(e2);
        setStatus('idle');
        document.getElementById(`cf-${data.fields[0]}`)?.focus();
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
        <h3 className="text-main fw-bold mb-2">Thank you! Your request is in.</h3>
        <p className="text-sub mb-4">
          We have received your request.<br/>The OvenMedia Cloud team will review the information and contact you shortly.
        </p>
        <a href="/om-cloud" className="btn btn-company-outline rounded-pill px-4">
          <i className="ph ph-arrow-left me-2" />Back to OvenMedia Cloud
        </a>
      </div>
    );
  }

  const submitting = status === 'submitting';

  return (
    <form className="consult-form reveal-up" onSubmit={onSubmit} noValidate>
      <div className="row g-4h">
        <div className="col-md-6">
          <label className="consult-label" htmlFor="cf-name">
            Name <span className="consult-req">*</span>
          </label>
          <input className={`consult-input${errors.name ? ' is-invalid' : ''}`} id="cf-name" name="name" type="text"
            placeholder="Your full name" maxLength={200}
            aria-invalid={!!errors.name}
            onInput={() => errors.name && setErrors((p) => ({...p, name: ''}))} />
          {errors.name && <span className="consult-field-error">{errors.name}</span>}
        </div>
        <div className="col-md-6">
          <label className="consult-label" htmlFor="cf-email">
            Work Email <span className="consult-req">*</span>
          </label>
          <input className={`consult-input${errors.email ? ' is-invalid' : ''}`} id="cf-email" name="email" type="email"
            placeholder="you@company.com" maxLength={320}
            aria-invalid={!!errors.email}
            onInput={() => errors.email && setErrors((p) => ({...p, email: ''}))} />
          {errors.email && <span className="consult-field-error">{errors.email}</span>}
        </div>
        <div className="col-md-6">
          <label className="consult-label" htmlFor="cf-company">
            Company or Organization <span className="consult-req">*</span>
          </label>
          <input className={`consult-input${errors.company ? ' is-invalid' : ''}`} id="cf-company" name="company" type="text"
            placeholder="Company or organization name" maxLength={300}
            aria-invalid={!!errors.company}
            onInput={() => errors.company && setErrors((p) => ({...p, company: ''}))} />
          {errors.company && <span className="consult-field-error">{errors.company}</span>}
        </div>
        <div className="col-md-6">
          <label className="consult-label" htmlFor="cf-region">
            Country or Target Service Region
          </label>
          <input className="consult-input" id="cf-region" name="region" type="text"
            placeholder="e.g. Canada, North America, Europe, Global" maxLength={200} />
        </div>

        <div className="col-md-6">
          <label className="consult-label" htmlFor="cf-stage">Project Stage</label>
          <select className="consult-input consult-select" id="cf-stage" name="stage" defaultValue="">
            <option value="">Select a stage…</option>
            {PROJECT_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <label className="consult-label d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-baseline">What Do You Need Help With <span className="text-mono small fw-normal">* Select all that apply</span></label>
          <div className="consult-chips">
            {HELP_TOPICS.map((t) => {
              const active = topics.includes(t);
              return (
                <button type="button" key={t}
                  className={`consult-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => toggleTopic(t)}>
                  <i aria-hidden="true">
                    <svg viewBox="0 0 16 16"><path d="M3.5 8.4l3 3 6-6.4" /></svg>
                  </i>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-12">
          <label className="consult-label" htmlFor="cf-message">
            Tell Us About Your Live Streaming Service <span className="consult-req">*</span>
          </label>
          <textarea className={`consult-input consult-textarea${errors.message ? ' is-invalid' : ''}`} id="cf-message" name="message"
            rows={5} maxLength={10000}
            aria-invalid={!!errors.message}
            onInput={() => errors.message && setErrors((p) => ({...p, message: ''}))}
            placeholder="Share anything you already know: input/output workflow, protocols, channel count, transcoding needs, expected traffic, target regions, existing infrastructure, or launch schedule." />
          {errors.message && <span className="consult-field-error">{errors.message}</span>}
        </div>

        {/* honeypot: hidden from humans, catches bots */}
        <div className="consult-hp" aria-hidden="true">
          <label htmlFor="cf-company-url">Company URL</label>
          <input id="cf-company-url" name="company_url" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="col-12">
          <label className="d-flex align-items-start gap-2" style={{cursor: 'pointer'}}>
            <input
              type="checkbox"
              className="consent-check-input"
              checked={consented}
              onChange={(e) => { setConsented(e.target.checked); if (e.target.checked) setConsentRequired(false); }}
            />
            <span className={`consent-box${consented ? ' is-checked' : ''}`} aria-hidden="true">
              <svg viewBox="0 0 18 18"><path d="M3.5 9.4l3.4 3.4L14.5 5" /></svg>
            </span>
            <span className="text-sub small">
              The consultation is delivered jointly by OvenMedia Labs (software) and Embrace, OvenMedia Labs' infrastructure partner (infrastructure). I consent to the information submitted above being shared with Embrace solely for the purpose of this consultation.
            </span>
          </label>
          {consentRequired && !consented && (
            <span className="consult-field-error mt-1">Please read the notice above and check the box to proceed.</span>
          )}
        </div>

        <div className="col-12 d-flex flex-column align-items-center pt-2">
          <button type="submit" className="btn btn-company-outline px-5 py-2" disabled={submitting}>
            {submitting ? 'Sending…' : 'Request a Consultation'}
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
            Consultation is free. Billing begins only after the final environment is approved and activated.
          </p>
        </div>
      </div>
    </form>
  );
}
