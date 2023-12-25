export enum TransactionState {
  Unsigned = 'unsigned',
  Signed = 'signed',
  Pending = 'pending',
  Completed = 'completed',
  Errored = 'errored',
}

export interface Transaction {
  id?: number;
  txid: string;
  state: TransactionState;
}

export class TransactionDB {
  private dbName: string;
  private storeName: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('txid', 'txid', { unique: true });
          store.createIndex('state', 'state', { unique: false });
        }
      };

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  async initDB(): Promise<void> {
    try {
      const db = await this.openDB();
      db.close();
    } catch (error) {
      console.error("Error initializing the database:", error);
      throw error;
    }
  }

  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<number> {
    const db = await this.openDB();
    return new Promise(async (resolve, reject) => {
      const checkTransaction = db.transaction(this.storeName, 'readonly');
      const storeCheck = checkTransaction.objectStore(this.storeName);
      const indexCheck = storeCheck.index('txid');
      const requestCheck = indexCheck.get(tx.txid);

      requestCheck.onsuccess = () => {
        if (requestCheck.result) {
          reject(new Error('Duplicate txid'));
          db.close();
          return;
        }

        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(tx);

        request.onsuccess = () => {
          resolve(request.result as number);
        };
        request.onerror = () => {
          reject(request.error);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      };

      requestCheck.onerror = () => {
        reject(requestCheck.error);
      };
    });
  }

  async getTransaction(txid: string): Promise<Transaction | undefined> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('txid');
      const request = index.get(txid);

      request.onsuccess = () => {
        resolve(request.result as Transaction | undefined);
      };
      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  }

  async updateTransaction(txid: string, newState: TransactionState): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('txid');
      const getRequest = index.get(txid);

      getRequest.onsuccess = () => {
        const tx = getRequest.result as Transaction;
        if (tx) {
          tx.state = newState;
          const putRequest = store.put(tx);
          putRequest.onsuccess = () => {
            resolve();
          };
          putRequest.onerror = () => {
            reject(putRequest.error);
          };
        } else {
          reject(new Error('Transaction not found'));
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll(); // This should fetch all records

      request.onsuccess = () => {
        resolve(request.result as Transaction[]);
      };
      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  }

  async clearAllTransactions(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear(); // Clears all entries in the store

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  }

}

const transactionDB = new TransactionDB('MyDatabase', 'transactions');
export default transactionDB;
