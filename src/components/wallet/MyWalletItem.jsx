import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../firebase";
import getAllData from "../../lib/get-all-data";

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

            // Извличане на данни за конкретна валута от CoinCap
            const coinCapData = await getAllData(
              `https://api.coincap.io/v2/assets/${cryptoData.name.toLowerCase()}`
            );
            console.log("CoinCapData:", coinCapData);

            if (coinCapData.data) {
              // Добавяне на данни от CoinCap към cryptoData
              cryptoData.priceUsd = coinCapData.data.priceUsd;
            }
          } else {
            console.error(
              `Crypto document not found or does not exist for wallet ID: ${walletId}`
            );
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
    return <p className="flex justify-center items-center max-h-screen">Loading...</p>;
  }


// Изчисляване на първоначалната инвестиция
const initialInvestment = walletData.price * walletData.quantity;

// Изчисляване на текущата стойност на портфейла
const currentPortfolioValue = walletData.cryptoData && !isNaN(parseFloat(walletData.cryptoData.priceUsd))
  ? parseFloat(walletData.cryptoData.priceUsd) * walletData.quantity
  : 0; 

// Изчисляване на печалбата
const profit = currentPortfolioValue - initialInvestment;

// Стилизиране на печалбата
const profitClass = profit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';

  return (
    <div className="flex justify-center items-center max-h-screen max-w-screen" style={{marginTop:'40px'}}>
    <div className="p-4 bg-gray-100 border rounded-lg shadow-md">
      <button
        onClick={() => window.history.back()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Back
      </button>
  
      <h2 className="text-2xl font-bold mt-4 mb-2">Deal Details</h2>
      {/* <p className="mb-2">ID: {walletData.id}</p> */}
      <div className="mb-2 text-base font-bold">Deal time: {walletData.time ? new Date(walletData.time.toDate()).toLocaleString() : "N/A"}</div>
      <div className="mb-2 text-lg font-bold">Crypto: {walletData.cryptoData ? walletData.cryptoData.name : "N/A"}({walletData.cryptoData ? walletData.cryptoData.symbol : "N/A"})</div>
      <table className="min-w-full border text-center text-base font-light dark:border-neutral-500 max-w-screen-md mx-auto my-4 max-w-4xl">
  <thead className="border-b font-medium dark:border-neutral-500 bg-gray-600 text-white">
    <tr>
        <th className="py-2 px-4 border-r">Quantity</th>
      <th className="py-2 px-4 border-r">Deal price</th>
      <th className="py-2 px-4 border-r">Total investment </th>
      <th className="py-2 px-4 border-r">Current price from CoinCap (live data)</th>
      <th className="py-2 px-4">Profit</th>
    </tr>
  </thead>
  <tbody className="bg-white">
    <tr className="border-b">
      <td className="py-2 px-4 border-r">{walletData.quantity}</td>
      <td className="py-2 px-4 border-r">{walletData.price}</td>
      <td className="py-2 px-4 border-r font-bold">{initialInvestment.toFixed(2)}</td>
      <td className="py-2 px-4 border-r">
        {walletData.cryptoData && !isNaN(parseFloat(walletData.cryptoData.priceUsd))
        ? parseFloat(walletData.cryptoData.priceUsd).toFixed(2)
        : "N/A"}
      </td>
     
      <td className="py-2 px-4"><span className={profitClass}>{profit.toFixed(2)} $</span></td>
    </tr>
  </tbody>
</table>
    </div>
  </div>
  

  );
}
