import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogOut, Save, Settings, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/ApiError';
import { changeMyPassword, getMyProfile, updateMyProfile } from '../../api/panelist';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import { useAutoDismiss } from '../../hooks/useAutoDismiss';
import './PanelistPortal.css';

const PROFILE_SUCCESS_MS = 5000;
const PROFILE_SUCCESS_FADE_MS = 400;

export default function PanelistSettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = usePanelistAuth();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  const clearProfileMessage = useCallback(() => {
    setProfileMessage('');
  }, []);

  const { exiting: profileMessageExiting } = useAutoDismiss({
    active: Boolean(profileMessage),
    delayMs: PROFILE_SUCCESS_MS,
    fadeMs: PROFILE_SUCCESS_FADE_MS,
    onDismiss: clearProfileMessage,
  });

  useEffect(() => {
    void getMyProfile()
      .then((profile) => {
        setFullName(profile.name);
        setEmail(profile.email);
        setPhoneNumber(profile.phone ?? '');
        updateUser(profile);
      })
      .catch(() => {
        // Keep session values if profile refresh fails.
      });
  }, [updateUser]);

  const handleSavePersonalInfo = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setProfileMessage('');
    setIsSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        name: fullName.trim(),
        phone: phoneNumber.trim(),
      });
      updateUser(updated);
      setFullName(updated.name);
      setEmail(updated.email);
      setPhoneNumber(updated.phone ?? '');
      setProfileMessage('Profile updated successfully.');
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password must match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordMessage(response.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <section className="pdash container-wide pdash-fade-in">
      <header className="pdash-page-head">
        <p className="pdash-page-head__eyebrow">
          <Settings size={13} aria-hidden="true" />
          Account Settings
        </p>
        <h1>Settings</h1>
        <p>Update your personal information and manage account security.</p>
      </header>

      {error ? <div className="pdash-error" role="alert">{error}</div> : null}

      <div className="pdash-settings-grid">
        <motion.article
          className="pdash-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="pdash-panel__head">
            <h2>Personal Information</h2>
            <p>Keep your profile up to date for better survey matching.</p>
          </div>
          <form className="pdash-form" onSubmit={(event) => void handleSavePersonalInfo(event)}>
            <label>
              Full Name
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                readOnly
                disabled
                aria-readonly="true"
                className="pdash-input--readonly"
              />
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
            {profileMessage ? (
              <p
                className={`pdash-message pdash-message--success${profileMessageExiting ? ' pdash-message--exiting' : ''}`}
                role="status"
              >
                {profileMessage}
              </p>
            ) : null}
            <button type="submit" className="pdash-btn pdash-btn--block" disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2 size={16} className="pdash-spin" /> : <Save size={16} />}
              {isSavingProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </motion.article>

        <motion.article
          className="pdash-panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
        >
          <div className="pdash-panel__head">
            <h2>Change Password</h2>
            <p>Update your password to keep your account secure.</p>
          </div>
          <form className="pdash-form" onSubmit={(event) => void handleChangePassword(event)}>
            <label>
              Current Password
              <span className="pdash-password-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((value) => !value)}
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <label>
              New Password
              <span className="pdash-password-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((value) => !value)}
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <label>
              Confirm Password
              <span className="pdash-password-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            {passwordMessage ? (
              <p className="pdash-message pdash-message--success">{passwordMessage}</p>
            ) : null}
            <button
              type="submit"
              className="pdash-btn pdash-btn--block"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? <Loader2 size={16} className="pdash-spin" /> : <ShieldCheck size={16} />}
              {isSavingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </motion.article>
      </div>

      <motion.article
        className="pdash-panel pdash-logout"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <div>
          <h2>Logout</h2>
          <p>Sign out of your account and return to the public website.</p>
        </div>
        <button type="button" className="pdash-btn pdash-btn--danger" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </motion.article>
    </section>
  );
}
