import { useEffect } from 'react';

import { usePioneer } from '../../context/Pioneer';
import Portfolio from '../Portfolio';
export default function KeepKey({ onClose }) {
  const { state } = usePioneer();
  // const { app, balances } = state;

  useEffect(() => {}, []);

  return (
    <div>
      Connecting KeepKey... buy a keepkey download KK Desktop
      <Portfolio />
    </div>
  );
}
