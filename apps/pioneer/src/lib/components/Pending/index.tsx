import { Button, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

const Pending = ({ onClose }: any) => {
  const [pendingTransactions, setPendingTransactions] = useState<string[]>([]);

  useEffect(() => {
    // Retrieve and parse data from local storage
    const storedData = localStorage.getItem("pendingTransactions");
    if (storedData && storedData.length > 0) {
      setPendingTransactions(JSON.parse(storedData));
    }
  }, []);

  const handleMark = (txId: string, status: "success" | "failed") => {
    // Remove the transaction from the list
    const updatedTransactions = pendingTransactions.filter((tx) => tx !== txId);

    // Update state and local storage
    setPendingTransactions(updatedTransactions);
    localStorage.setItem(
      "pendingTransactions",
      JSON.stringify(updatedTransactions)
    );

    // Optionally, handle additional logic based on the status
    console.log(`Transaction ${txId} marked as ${status}`);
    onClose();
  };

  return (
    <div>
      {pendingTransactions.map((txId, index) => (
        <div key={index}>
          <Link as={RouterLink} to={`/txid/${txId}`}>
            View Transaction {txId}
          </Link>
          <Button onClick={() => handleMark(txId, "success")}>
            Mark Success
          </Button>
          <Button onClick={() => handleMark(txId, "failed")}>
            Mark Failed
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Pending;
