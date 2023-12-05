import { useApp } from 'ink';
import { useEffect } from 'react';

const Exit = () => {
  const app = useApp();

  useEffect(() => {
    app.exit();
    process.exit();
  }, [app]);

  return null;
};

export default Exit;
