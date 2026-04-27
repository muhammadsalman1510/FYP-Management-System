const Loader = () => {
  return (
    /*
      vh-100: full screen height
      d-flex align-items-center justify-content-center: center the spinner
      bg-white: white background
    */
    <div className="d-flex vh-100 align-items-center justify-content-center bg-white">
      {/*
        Bootstrap spinner:
        spinner-border: creates a spinning circle
        text-primary: uses our blue color
        The style sets the size to match the original 4rem (64px)
      */}
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: '4rem', height: '4rem', borderWidth: '4px' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;