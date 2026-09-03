/**
 * PathWise Logo Component
 * Official logo: uses the logo.svg image file from /public/logo.svg
 * Can be used with or without the wordmark text.
 *
 * Props:
 *   size   - px size of the icon square (default 32)
 *   text   - show "PathWise" wordmark text (default true)
 *   href   - if provided, wraps logo in a Link
 *   className - extra classes on the wrapper
 */
import { Link } from 'react-router-dom';

const PathWiseLogo = ({ size = 32, text = true, href, className = '', textColor }) => {
  const content = (
    <span className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.svg"
        alt="PathWise logo"
        width={size}
        height={size}
        style={{
          borderRadius: `${Math.round(size * 0.22)}px`,
          boxShadow: '0 0 14px rgba(0,86,255,0.35)',
          flexShrink: 0,
          display: 'block',
        }}
        draggable={false}
      />
      {text && (
        <span
          className="font-outfit font-extrabold tracking-tight"
          style={{
            fontSize: `${Math.round(size * 0.65)}px`,
            color: textColor || 'var(--white)',
            lineHeight: 1,
          }}
        >
          PathWise
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link to={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default PathWiseLogo;
