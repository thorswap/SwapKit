import type React from 'react';

interface MiddleEllipsisProps {
  text: string;
}

const MiddleEllipsis: React.FC<MiddleEllipsisProps> = ({ text }) => {
  const maxLength = 20;
  const ellipsis = '...';

  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  const frontPart = text.slice(0, 7);
  const backPart = text.slice(-10);

  return (
    <span>
      {frontPart}
      {ellipsis}
      {backPart}
    </span>
  );
};

export default MiddleEllipsis;
