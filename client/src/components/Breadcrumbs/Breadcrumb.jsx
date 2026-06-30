import { Link } from 'react-router-dom';

const Breadcrumb = ({ pageName }) => {
  return (
    <div className="mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2">

      <h2 className="fs-4 fw-semibold text-dark mb-0">{pageName}</h2>

      {/* Breadcrumb navigation — Bootstrap adds the "/" separator via CSS ::before,
          so the link text must NOT include a trailing slash. */}
      <nav>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link className="text-decoration-none text-muted fw-medium" to="/dashboard">
              Dashboard
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
