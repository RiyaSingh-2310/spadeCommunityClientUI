import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2, Save, ShieldCheck, UserRound } from 'lucide-react';
import { ApiError } from '../../api/ApiError';
import { changeMyPassword, getMyProfile, updateMyProfile } from '../../api/panelist';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import './PanelistExperience.css';

export default function PanelistProfilePage() {
  const { user, updateUser } = usePanelistAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void getMyProfile()
      .then((profile) => {
        setName(profile.name);
        setEmail(profile.email);
        setPhoneNumber(profile.phone ?? '');
        updateUser(profile);
      })
      .catch(() => {
        // keep session values if profile refresh fails
      });
  }, [updateUser]);

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);
    try {
      const updated = await updateMyProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phoneNumber.trim(),
      });
      updateUser(updated);
      setMessage('Personal information saved successfully.');
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to save profile information.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password must match.');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const response = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setMessage(response.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <section className="panelist-settings container-wide">
      <div className="panelist-settings__hero">
        <p className="panelist-dashboard__eyebrow">
          <UserRound size={14} aria-hidden="true" />
          Profile
        </p>
        <h1>Personal Information</h1>
        <p>Manage your profile details and credentials.</p>
      </div>

      {error ? <div className="panelist-settings__message panelist-settings__message--error">{error}</div> : null}
      {message ? <div className="panelist-settings__message panelist-settings__message--success">{message}</div> : null}

      <div className="panelist-settings__grid">
        <article className="panelist-settings__card">
          <h2>Personal Information</h2>
          <form className="panelist-settings__form" onSubmit={(event) => void handleSaveProfile(event)}>
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+91 98765 43210"
              />
            </label>
            <button type="submit" className="panelist-settings__button" disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className="panelist-dashboard__spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </article>

        <article className="panelist-settings__card">
          <h2>Change Password</h2>
          <form className="panelist-settings__form" onSubmit={(event) => void handlePasswordUpdate(event)}>
            <label>
              Current Password
              <span className="panelist-settings__password-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowCurrent((value) => !value)} aria-label="Toggle current password visibility">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <label>
              New Password
              <span className="panelist-settings__password-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowNew((value) => !value)} aria-label="Toggle new password visibility">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <label>
              Confirm Password
              <span className="panelist-settings__password-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowConfirm((value) => !value)} aria-label="Toggle confirm password visibility">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <button type="submit" className="panelist-settings__button panelist-settings__button--secondary" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? <Loader2 size={16} className="panelist-dashboard__spin" /> : <ShieldCheck size={16} />}
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
