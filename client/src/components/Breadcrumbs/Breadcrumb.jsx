import { Link } from 'react-router-dom';

const Breadcrumb = ({ pageName }) => {
  return (
    /*
      mb-4: bottom margin
      d-flex flex-column: stack on mobile
      d-sm-flex flex-sm-row: side by side on sm+
      align-items-sm-center justify-content-sm-between: space between on sm+
    */
    <div className="mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2">

      {/* Page title */}
      <h2 className="fs-4 fw-semibold text-dark mb-0">{pageName}</h2>

      {/* Breadcrumb navigation */}
      <nav>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link className="text-decoration-none text-muted fw-medium" to="/dashboard">
              Dashboard /
            </Link>
          </li>
          <li className="breadcrumb-item active text-primary fw-medium">
            {pageName}
          </li>
        </ol>
      </nav>

    </div>
  );
};

export default Breadcrumb;