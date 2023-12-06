import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function MyWalletItem() {
  const { walletId } = useParams();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const walletDoc = await getDoc(doc(db, "wallet", walletId));
        if (walletDoc.exists()) {
          const walletData = { id: walletDoc.id, ...walletDoc.data() };
          console.log("WalletData:", walletData);
  
          const cryptoDocRef = walletData.crypto_id;
          const cryptoDoc = await getDoc(cryptoDocRef);
          let cryptoData;
  
          if (cryptoDoc.exists()) {
            cryptoData = { id: cryptoDoc.id, ...cryptoDoc.data() };
            console.log("CryptoData:", cryptoData);
          } else {
            console.error(`Crypto document not found or does not exist for wallet ID: ${walletId}`);
          }
  
          if (cryptoData && cryptoData.name && cryptoData.symbol) {
            setWalletData({ ...walletData, cryptoData });
          } else {
            console.error(`Crypto data incomplete for wallet ID: ${walletId}`);
          }
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [walletId]);
  
  if (loading) {
    return <p>Loading...</p>;
  }
  
  return (
    <div>
    <button onClick={() => window.history.back()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Back</button>
    <h2>Wallet Details</h2>
    <p>ID: {walletData.id}</p>
    <p>Name: {walletData.cryptoData ? walletData.cryptoData.name : 'N/A'}</p>
    <p>Symbol: {walletData.cryptoData ? walletData.cryptoData.symbol : 'N/A'}</p>
    <p>Deal time: {walletData.time ? new Date(walletData.time.toDate()).toLocaleString() : 'N/A'}</p>
    <p>Quantity: {walletData.quantity}</p>
    <p>Price: {walletData.price}</p>
    <p>Total: {walletData.price * walletData.quantity}</p>
  </div>
  );
}
