import React from 'react';

const Avatar = ({ name = '', photoUrl = null, size = 44, bgColor, title, className = '', style = {} }) => {
  const px = `${size}px`;
  const baseStyle = {
    width: px,
    height: px,
    minWidth: px,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (photoUrl) {
    return (
      <div title={title} style={baseStyle} className={className}>
        <img
          src={photoUrl}
          alt={name || 'User'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  const iconSize = Math.round(size * 0.6);
  const headR = Math.round(iconSize * 0.28);
  const headCy = Math.round(iconSize * 0.35);
  const cx = iconSize / 2;

  return (
    <div
      title={title}
      className={`d-flex align-items-center justify-content-center ${className}`}
      style={{ ...baseStyle, backgroundColor: bgColor || '#e0e0e0' }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${iconSize} ${iconSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx={cx} cy={headCy} r={headR} fill="#9e9e9e" />
        {/* Shoulders / body */}
        <path
          d={`M${cx - iconSize * 0.38},${iconSize} Q${cx - iconSize * 0.38},${iconSize * 0.58} ${cx},${iconSize * 0.58} Q${cx + iconSize * 0.38},${iconSize * 0.58} ${cx + iconSize * 0.38},${iconSize}`}
          fill="#9e9e9e"
        />
      </svg>
    </div>
  );
};

export default Avatar;
