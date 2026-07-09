import { useState, type FormEvent } from 'react';
import { changeMyPassword } from '../../api/panelist';
import { ApiError } from '../../api/ApiError';
import Button from '../../components/ui/Button';

export default function PanelistPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

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
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Unable to change password right now.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="panelist-portal-panel">
      <h2>Change Password</h2>
      <p>Update the password you use to sign in to the Panelist Portal.</p>

      {message ? <div className="panelist-portal-message panelist-portal-message--success">{message}</div> : null}
      {error ? <div className="panelist-portal-message panelist-portal-message--error">{error}</div> : null}

      <form className="panelist-portal-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>

        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </label>

        <label>
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        <div className="panelist-portal-actions">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Updating...' : 'Update password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
