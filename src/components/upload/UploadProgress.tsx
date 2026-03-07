interface UploadProgressProps {
  current: number;
  total: number;
  currentFile?: string;
}

export default function UploadProgress({ current, total, currentFile }: UploadProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="upload-progress">
      <div className="upload-progress-bar">
        <div className="upload-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="upload-progress-text">
        Uploading {current}/{total} photos{currentFile ? ` — ${currentFile}` : ''}...
      </span>
    </div>
  );
}
