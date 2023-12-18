import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../firebase";
import getAllData from "../../lib/get-all-data";

export default function MyWalletItem() {
  // Получаване на параметъра walletId от URL
  const { walletId } = useParams();

  // Състояния за данните на портфейла и Loading
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Извличане на данни при зареждане на компонента или промяна в walletId
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Извличане на данни за портфейла от базата данни
        const walletDoc = await getDoc(doc(db, "wallet", walletId));

        if (walletDoc.exists()) {
          // Обработка на данните за портфейла
          const walletData = { id: walletDoc.id, ...walletDoc.data() };

          // Извличане на данни за таблицата с name и symbol на крипто валутите от базата данни
          const cryptoDocRef = walletData.crypto_id;
          const cryptoDoc = await getDoc(cryptoDocRef);
          let cryptoData;

          if (cryptoDoc.exists()) {
            cryptoData = { id: cryptoDoc.id, ...cryptoDoc.data() };

            // Извличане на данни за криптовалутата от CoinCap по name!
            const coinCapData = await getAllData(
              `https://api.coincap.io/v2/assets/${cryptoData.name.toLowerCase()}`
            );

            if (coinCapData.data) {
              // Добавяне на данни (priceUsd) от CoinCap към cryptoData
              cryptoData.priceUsd = coinCapData.data.priceUsd;
            }
          } else {
            console.error(
              `Crypto data not found or does not exist for wallet ID: ${walletId}`
            );
          }

          // Проверка на целостта на данните и задаване на state
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

  // Визуализация на "Loading..." докато се зареждат данните
  if (loading) {
    return <p className="flex justify-center items-center max-h-screen">Loading...</p>;
  }

  // Изчисляване на първоначалната инвестиция, текущата стойност на портфейла и печалбата
  const initialInvestment = walletData.price * walletData.quantity;
  const currentPortfolioValue = walletData.cryptoData && !isNaN(parseFloat(walletData.cryptoData.priceUsd))
    ? parseFloat(walletData.cryptoData.priceUsd) * walletData.quantity
    : 0;
  const profit = currentPortfolioValue - initialInvestment;

  // Стилизиране на цвета на печалбата
  const profitClass = profit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';

  return (
    <div className="flex justify-center items-center max-h-screen max-w-screen" style={{ marginTop: '40px' }}>
      <div className="p-4 bg-gray-100 border rounded-lg shadow-md">
        <button
          onClick={() => window.history.back()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >Back</button>

        <h2 className="text-2xl font-bold mt-4 mb-2">Deal Details</h2>
        <div className="mb-2 text-base font-bold" >Deal time: {walletData.time ? new Date(walletData.time.toDate()).toLocaleString() : "N/A"}</div>

        <div className="mb-2 text-lg font-bold" style={{float:'left', marginBottom:'20px'}}>
          Crypto:  
        <span style={{display:'inline-block', marginLeft:'10px'}}>{walletData.cryptoData ? walletData.cryptoData.name : "N/A"}({walletData.cryptoData ? walletData.cryptoData.symbol : "N/A"})</span>
        </div>
        <img src={`../crypto-logos/${walletData.cryptoData.name}.png`} alt={walletData.cryptoData.name} style={{width: '40px', height: '40px', marginLeft:'20px',marginTop:'-5px', float:'left'}}/>

        
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
              <td className="py-2 px-4 border-r">{walletData.price}&nbsp;$</td>
              <td className="py-2 px-4 border-r font-bold">{initialInvestment.toFixed(2)}&nbsp;$</td>
              <td className="py-2 px-4 border-r">
                {walletData.cryptoData && !isNaN(parseFloat(walletData.cryptoData.priceUsd))
                  ? parseFloat(walletData.cryptoData.priceUsd).toFixed(2)
                  : "N/A"}&nbsp;$
              </td>
              <td className="py-2 px-4"><span className={profitClass}>{profit.toFixed(2)}&nbsp;$</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
