interface LoadingSkeletonProps {
  variant: 'card' | 'text' | 'image' | 'circle';
  width?: string;
  height?: string;
}

export default function LoadingSkeleton({ variant, width, height }: LoadingSkeletonProps) {
  const className = `skeleton skeleton--${variant}`;

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={className} style={style} />;
}
