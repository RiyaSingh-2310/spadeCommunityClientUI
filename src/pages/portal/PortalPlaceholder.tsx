import '../../components/portal/portal.css';

interface PortalPlaceholderProps {
  title: string;
  description: string;
}

export default function PortalPlaceholder({ title, description }: PortalPlaceholderProps) {
  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="portal-placeholder">
        <p>This section is part of the demo portal shell and will be expanded in a future release.</p>
      </div>
    </div>
  );
}
