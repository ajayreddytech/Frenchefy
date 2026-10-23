import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Coffee,
  Cloud,
  ExternalLink,
  FileText,
  Heart,
  LogOut,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

const APP_NAME = "The Canadian Dream";
const THIRD_PARTY_LICENSES = [
  { name: "React", version: "18.3.1", license: "MIT" },
  { name: "React DOM", version: "18.3.1", license: "MIT" },
  { name: "Lucide React", version: "0.468.0", license: "ISC" },
  { name: "Vite", version: "6.4.5", license: "MIT" },
  { name: "@vitejs/plugin-react", version: "4.7.0", license: "MIT" },
  { name: "Tailwind CSS", version: "3.4.19", license: "MIT" },
  { name: "PostCSS", version: "8.5.31", license: "MIT" },
  { name: "Autoprefixer", version: "10.6.1", license: "MIT" },
];

/**
 * @typedef {Object} SettingsViewProps
 * @property {string} appVersion
 * @property {string} buildNumber
 * @property {string} developerName
 * @property {string} supportEmail
 * @property {string} legalDomain
 * @property {string} kofiUrl
 * @property {string} paypalUrl
 * @property {string} githubSponsorsUrl
 * @property {boolean} authConfigured
 * @property {boolean} authLoading
 * @property {string} userEmail
 * @property {string} cloudStatus
 * @property {string} cloudMessage
 * @property {() => void} onGoogleSignIn
 * @property {() => void} onSignOut
 * @property {() => void} onRetryCloud
 * @property {(error: Error) => void} onLinkError
 */

/**
 * @param {SettingsViewProps} props
 */
function SettingsView({
  appVersion,
  buildNumber,
  developerName,
  supportEmail,
  legalDomain,
  kofiUrl,
  paypalUrl,
  githubSponsorsUrl,
  authConfigured,
  authLoading,
  userEmail,
  cloudStatus,
  cloudMessage,
  onGoogleSignIn,
  onSignOut,
  onRetryCloud,
  onLinkError,
}) {
  const [licensesOpen, setLicensesOpen] = useState(false);
  const domain = legalDomain.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const policyUrl = domain ? `https://${domain}/privacy` : "";
  const termsUrl = domain ? `https://${domain}/terms` : "";
  const supportSubject = encodeURIComponent(`App Support Request - ${APP_NAME}`);
  const feedbackSubject = encodeURIComponent(`Feedback / Bug Report - ${APP_NAME}`);
  const supportUrl = `mailto:${supportEmail}?subject=${supportSubject}`;
  const feedbackUrl = `mailto:${supportEmail}?subject=${feedbackSubject}`;

  useEffect(() => {
    if (!licensesOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setLicensesOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [licensesOpen]);

  function openSystemLink(value) {
    try {
      const url = new URL(value);
      if (!["https:", "mailto:"].includes(url.protocol)) {
        throw new Error("Only secure web links and email links are supported.");
      }
      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.referrerPolicy = "no-referrer";
      document.body.append(link);
      link.click();
      link.remove();
    } catch (error) {
      onLinkError(error instanceof Error ? error : new Error("Could not open the requested link."));
    }
  }

  function LegalLink({ label, url, icon: Icon }) {
    return url ? (
      <button className="settings-link" type="button" onClick={() => openSystemLink(url)}>
        <span className="settings-link-icon"><Icon size={17} /></span>
        <span>{label}</span>
        <ExternalLink size={15} aria-hidden="true" />
      </button>
    ) : (
      <div className="settings-link settings-link-disabled" aria-label={`${label}, not configured`}>
        <span className="settings-link-icon"><Icon size={17} /></span>
        <span>{label}<small>Website address not configured</small></span>
      </div>
    );
  }

  return (
    <section className="settings-layout" aria-label="Settings and app information">
      <article className="settings-card account-card">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><Cloud size={18} /></span>
          <div><h2>Account &amp; cloud sync</h2><p>Your study journal, available across your devices.</p></div>
        </div>
        {!authConfigured ? (
          <p className="account-status-message" role="status">
            Google sign-in is not configured yet. Your entries remain saved in this browser.
          </p>
        ) : authLoading ? (
          <p className="account-status-message" role="status">Checking your sign-in status…</p>
        ) : userEmail ? (
          <>
            <p className="account-email">{userEmail}</p>
            <p className={`account-status-message ${cloudStatus === "error" ? "account-status-error" : ""}`} role={cloudStatus === "error" ? "alert" : "status"}>
              {cloudStatus === "synced" ? "Your study data is saved to your cloud account."
                : cloudStatus === "syncing" ? "Syncing your latest changes…"
                  : cloudStatus === "error" ? cloudMessage || "Cloud sync needs attention."
                    : "Connecting to your cloud account…"}
            </p>
            <div className="settings-button-row">
              {cloudStatus === "error" && (
                <button className="settings-action-button" type="button" onClick={onRetryCloud}>Retry sync</button>
              )}
              <button className="settings-action-button secondary" type="button" onClick={onSignOut}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="account-status-message">
              Sign in with Google to back up your study data and use it on other devices. Your existing browser entries will be imported on first sign-in; matching dates are combined.
            </p>
            {cloudMessage && <p className="account-status-error" role="alert">{cloudMessage}</p>}
            <button className="settings-action-button" type="button" onClick={onGoogleSignIn}>
              Continue with Google
            </button>
            <p className="account-footnote">New accounts are created automatically the first time you sign in.</p>
          </>
        )}
      </article>

      <article className="settings-card">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><ShieldCheck size={18} /></span>
          <div><h2>Legal information</h2><p>Policies and notices for this app.</p></div>
        </div>
        <div className="settings-link-list">
          <LegalLink label="Privacy Policy" url={policyUrl} icon={ShieldCheck} />
          <LegalLink label="Terms of Service" url={termsUrl} icon={FileText} />
          <button className="settings-link" type="button" onClick={() => setLicensesOpen(true)}>
            <span className="settings-link-icon"><BookOpen size={17} /></span>
            <span>Open Source Licenses</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
        {!legalDomain && <p className="settings-notice">Add a hosted privacy policy and terms URL before publishing this app.</p>}
      </article>

      <article className="settings-card">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><BookOpen size={18} /></span>
          <div><h2>App info &amp; support</h2><p>Version details and a direct line for help.</p></div>
        </div>
        <dl className="app-info-list">
          <div><dt>App version</dt><dd>v{appVersion}</dd></div>
          <div><dt>Build number</dt><dd>{buildNumber}</dd></div>
        </dl>
        <p className="copyright-line">© 2026 {developerName}. All rights reserved.</p>
        <div className="settings-button-row">
          <button className="settings-action-button" type="button" onClick={() => openSystemLink(supportUrl)}>
            <Mail size={16} /> Contact support
          </button>
          <button className="settings-action-button secondary" type="button" onClick={() => openSystemLink(feedbackUrl)}>
            <Heart size={16} /> Send feedback / bug report
          </button>
        </div>
      </article>

      <article className="settings-card support-card">
        <div className="settings-section-heading">
          <span className="settings-section-icon support-icon"><Coffee size={18} /></span>
          <div><h2>Support the developer</h2><p>Help keep this independent project going.</p></div>
        </div>
        <div className="settings-button-row support-link-row">
          {kofiUrl ? (
            <button className="settings-action-button" type="button" onClick={() => openSystemLink(kofiUrl)}>
              <Coffee size={16} /> Support via Ko-fi / Card / PayPal <ExternalLink size={14} />
            </button>
          ) : <span className="support-unavailable">Ko-fi is not configured</span>}
          {paypalUrl ? (
            <button className="settings-action-button secondary" type="button" onClick={() => openSystemLink(paypalUrl)}>
              <Heart size={16} /> PayPal.me <ExternalLink size={14} />
            </button>
          ) : <span className="support-unavailable">PayPal.me is not configured</span>}
          {githubSponsorsUrl ? (
            <button className="settings-action-button secondary" type="button" onClick={() => openSystemLink(githubSponsorsUrl)}>
              <BookOpen size={16} /> GitHub Sponsors <ExternalLink size={14} />
            </button>
          ) : <span className="support-unavailable">GitHub Sponsors is not configured</span>}
        </div>
        <p className="support-compliance-note">Voluntary support helps keep this app free and independently maintained. Contributions do not unlock digital features.</p>
      </article>

      {licensesOpen && (
        <div className="license-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setLicensesOpen(false);
        }}>
          <section className="license-modal" role="dialog" aria-modal="true" aria-labelledby="licenses-title">
            <div className="license-modal-heading">
              <div><span className="section-kicker">THIRD-PARTY SOFTWARE</span><h2 id="licenses-title">Open Source Licenses</h2></div>
              <button className="license-modal-close" type="button" aria-label="Close licenses" autoFocus onClick={() => setLicensesOpen(false)}><X size={18} /></button>
            </div>
            <p className="license-intro">This app uses the following direct production and build dependencies:</p>
            <ul className="license-list">
              {THIRD_PARTY_LICENSES.map(({ name, version, license }) => (
                <li key={name}><strong>{name}</strong><span>v{version}</span><small>{license} License</small></li>
              ))}
            </ul>
            <p className="license-footnote">Each project retains its own copyright and license terms. Refer to the corresponding package for its complete license text.</p>
          </section>
        </div>
      )}
    </section>
  );
}

export default SettingsView;
