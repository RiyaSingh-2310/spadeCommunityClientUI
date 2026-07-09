import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2, LogOut, Save, Settings, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/ApiError';
import { changeMyPassword, getMyProfile, updateMyProfile } from '../../api/panelist';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import './PanelistExperience.css';

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
        email: email.trim(),
        phone: phoneNumber.trim(),
      });
      updateUser(updated);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <section className="panelist-settings container-wide">
      <div className="panelist-settings__hero">
        <p className="panelist-dashboard__eyebrow">
          <Settings size={14} aria-hidden="true" />
          Account
        </p>
        <h1>Settings</h1>
        <p>Update your personal information and manage account security.</p>
      </div>

      {error ? <div className="panelist-settings__message panelist-settings__message--error">{error}</div> : null}

      <div className="panelist-settings__grid">
        <article className="panelist-settings__card">
          <h2>Personal Information</h2>
          <form className="panelist-settings__form" onSubmit={(event) => void handleSavePersonalInfo(event)}>
            <label>
              Full Name
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
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
            {profileMessage ? (
              <p className="panelist-settings__message panelist-settings__message--success">{profileMessage}</p>
            ) : null}
            <button type="submit" className="panelist-settings__button" disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2 size={16} className="panelist-dashboard__spin" /> : <Save size={16} />}
              {isSavingProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </article>

        <article className="panelist-settings__card">
          <h2>Change Password</h2>
          <form className="panelist-settings__form" onSubmit={(event) => void handleChangePassword(event)}>
            <label>
              Current Password
              <span className="panelist-settings__password-wrap">
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
              <span className="panelist-settings__password-wrap">
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
              <span className="panelist-settings__password-wrap">
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
              <p className="panelist-settings__message panelist-settings__message--success">{passwordMessage}</p>
            ) : null}
            <button
              type="submit"
              className="panelist-settings__button panelist-settings__button--secondary"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? <Loader2 size={16} className="panelist-dashboard__spin" /> : <ShieldCheck size={16} />}
              {isSavingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </article>
      </div>

      <div className="panelist-settings__logout-card">
        <h2>Logout</h2>
        <p>Sign out of your account and return to the public website.</p>
        <button
          type="button"
          className="panelist-settings__button panelist-settings__button--danger"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </section>
  );
}
