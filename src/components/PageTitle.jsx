import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component sets the browser tab title
// It does NOT render any visible HTML — it just updates document.title
const PageTitle = ({ title }) => {
  const location = useLocation();

  useEffect(() => {
    document.title = title;
  }, [location, title]);

  return null;
};

export default PageTitle;