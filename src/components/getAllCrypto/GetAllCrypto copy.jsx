import React, { useState, useEffect } from 'react';
import getAllData from '../../lib/get-all-data'

export default function GetAllCrypto() {
  const [getData, setGetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const apiUrl = 'https://api.coincap.io/v2/assets';

  useEffect(() => {
    const showCrypto = async () => {
      try {
        setLoading(true);
        const resultGet = await getAllData(apiUrl);
        console.log(typeof resultGet);
        setGetData(resultGet.data);
        //setGetData(Object.values(resultGet));
        console.log(resultGet);
      }
       catch (error) {
        setError(`Грешка при извличане на данни: ${error.message}`);
      } 
       finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      showCrypto();
    }, refreshInterval * 1000);

    // При завършване на компонента, изчистване на интервала
    return () => clearInterval(intervalId);
  }, [refreshInterval]); 


  const handleRefreshIntervalChange = (e) => {
    setRefreshInterval(parseInt(e.target.value, 10));
  };


  return (
    <>
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-10 items-center justify-between"></div>

      <h2 className="text-xl font-semibold">Crypto market</h2>
       
        {error && <p style={{ color: 'red' }}>{error}</p>}
      
      
        <div className="flex justify-left" style={{marginBottom:'-15px'}}>
  <div className="relative mb-3 md:w-96 pt-5 flex items-center">
    <label htmlFor="refreshInterval" className="mr-2">
      Refresh interval (seconds):
    </label>
    <select
      id="refreshInterval"
      value={refreshInterval}
      onChange={handleRefreshIntervalChange}
      className="border rounded-md p-1 w-16"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={15}>15</option>
      <option value={60}>60</option>
    </select>
  </div>
</div>

<div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden"></div>
          <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500 max-w-screen-md mx-auto">
            <thead className="border-b font-medium dark:border-neutral-500 bg-gray-600 text-white">
              <tr>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Rank</th>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Symbol</th>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Name</th>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Price USD</th>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Change Percent 24hr</th>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Supply</th>
                {/* <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Max Supply</th> */}
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Market Cap USD</th>
                <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Volume 24 Hr</th>
               {/* <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Vwap 24hr</th>*/}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin:'10px' }}>Loading...</p>
                  </td>
                </tr>
              )}
              {getData.map(({ id, rank, symbol, name, supply, maxSupply, marketCapUsd, volumeUsd24Hr, priceUsd, changePercent24Hr, vwap24Hr, explorer }) => (
                <tr key={id} className="border-b dark:border-neutral-500">
                  <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{rank}</td>
                  <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">
                    <a href={explorer} target="_blank" rel="noopener noreferrer">
                      {symbol}
                    </a>
                  </td>
                  <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{name}</td>
                  <td className={`whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500 ${parseFloat(changePercent24Hr) > 0 ? 'text-green-500' : parseFloat(changePercent24Hr) < 0 ? 'text-red-500' : ''}`}>$ {parseFloat(priceUsd).toFixed(2)}</td>
                  <td className={`whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500 ${changePercent24Hr > 0 ? 'text-green-500' : changePercent24Hr < 0 ? 'text-red-500' : ''}`}>{parseFloat(changePercent24Hr).toFixed(4)} %</td>

                  <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{Math.round((supply)/1000000).toFixed(2)} M</td>
                  {/*<td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{Math.round(maxSupply)} M</td>*/}
                  <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{Math.round((marketCapUsd)/1000000).toFixed(2)} М</td>
                  <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{Math.round((volumeUsd24Hr)/1000000).toFixed(2)} М</td>

                 {/* <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{Math.round(vwap24Hr)}</td>*/}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

</div>
    </>
  );
}
