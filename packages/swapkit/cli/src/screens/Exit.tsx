import { useApp } from 'ink';
import React, { useEffect } from 'react';

const Exit = () => {
  const app = useApp();

  useEffect(() => {
    app.exit();
    process.exit();
  }, [app]);

  return <></>;
};

export default Exit;
