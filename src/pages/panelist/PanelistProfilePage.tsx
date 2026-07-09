import { useEffect, useState, type FormEvent } from 'react';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import { getMyProfile, updateMyProfile } from '../../api/panelist';
import { ApiError } from '../../api/ApiError';
import Button from '../../components/ui/Button';

export default function PanelistProfilePage() {
  const { user, updateUser } = usePanelistAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profile_image ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void getMyProfile()
      .then((profile) => {
        setName(profile.name);
        setEmail(profile.email);
        setPreviewUrl(profile.profile_image ?? '');
        updateUser(profile);
      })
      .catch(() => {
        // Keep session data if refresh fails.
      });
  }, [updateUser]);

  useEffect(() => {
    if (!profileImage) return;
    const objectUrl = URL.createObjectURL(profileImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const updated = await updateMyProfile({
        name,
        email,
        profileImage,
      });
      updateUser(updated);
      setMessage('Profile updated successfully.');
      setProfileImage(null);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Unable to update profile right now.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (name || user?.name || 'P')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="panelist-portal-panel">
      <h2>Profile</h2>
      <p>View and update your personal account details.</p>

      {message ? <div className="panelist-portal-message panelist-portal-message--success">{message}</div> : null}
      {error ? <div className="panelist-portal-message panelist-portal-message--error">{error}</div> : null}

      <form className="panelist-portal-form" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          {previewUrl ? (
            <img src={previewUrl} alt="Profile preview" className="panelist-portal-avatar-preview" />
          ) : (
            <div className="panelist-portal-avatar-fallback">{initials}</div>
          )}
        </div>

        <label>
          Profile photo
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <div className="panelist-portal-actions">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
