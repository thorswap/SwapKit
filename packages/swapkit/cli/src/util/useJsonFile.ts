import fs from 'node:fs/promises';
import { useEffect, useState } from 'react';

export const useJsonFile = (path: string) => {
  const [json, setJson] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJsonFile() {
      const json = await readJsonFile(path);

      if (json) {
        setJson(json);
      }
      setLoading(false);
    }

    loadJsonFile();
  }, [path]);

  return { json, loading };
};

const readJsonFile = async (path: string) => {
  const exists = await fs.stat(path).catch(() => false);
  if (!exists) {
    return undefined;
  }

  const file = await fs.readFile(path, 'utf8');

  try {
    return JSON.parse(file);
  } catch (err) {
    console.log('Error while parsing JSON config:', err);
  }
};
