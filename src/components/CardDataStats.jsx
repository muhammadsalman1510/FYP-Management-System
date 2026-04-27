import React from 'react';

const CardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    /*
      Bootstrap card:
      - card: base card style (white background, border, shadow)
      - shadow-sm: light shadow
      - h-100: full height in a grid row
    */
    <div className="card shadow-sm h-100">
      <div className="card-body px-4 py-4">

        {/*
          Icon circle at top:
          - d-flex align-items-center justify-content-center: center the icon inside
          - rounded-circle: makes it a perfect circle
          - bg-primary bg-opacity-10: light blue background
        */}
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
          style={{ width: '46px', height: '46px' }}
        >
          {/* The icon passed in as children (SVG) */}
          {children}
        </div>

        {/*
          Bottom section of the card:
          - mt-4: top margin
          - d-flex justify-content-between align-items-end: space between left text and right rate
        */}
        <div className="mt-4 d-flex justify-content-between align-items-end">

          {/* Left side: total number and title label */}
          <div>
            {/* Big number / value */}
            <h4 className="fs-4 fw-bold text-dark mb-1">{total}</h4>
            {/* Label below the number */}
            <span className="text-muted small fw-medium">{title}</span>
          </div>

          {/*
            Right side: rate percentage and up/down arrow icon
            - text-success if levelUp (green)
            - text-danger if levelDown (red)
          */}
          <span
            className={`d-flex align-items-center gap-1 small fw-medium ${
              levelUp ? 'text-success' : ''
            } ${levelDown ? 'text-danger' : 'text-muted'}`}
          >
            {rate}

            {/* Up arrow - shown when levelUp is true */}
            {levelUp && (
              <svg
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z" />
              </svg>
            )}

            {/* Down arrow - shown when levelDown is true */}
            {levelDown && (
              <svg
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z" />
              </svg>
            )}
          </span>

        </div>
      </div>
    </div>
  );
};

export default CardDataStats;