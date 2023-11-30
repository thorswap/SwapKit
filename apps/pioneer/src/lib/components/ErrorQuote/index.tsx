import { Button } from '@chakra-ui/react';
import React from 'react';

const ErrorQuote: React.FC<any> = ({ error, onClose }) => {
  return (
    <div>
      {JSON.stringify(error)}
      <Button onClick={onClose} />
    </div>
  );
};

export default ErrorQuote;
