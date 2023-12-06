import React, { useState, useEffect } from 'react';
import getAllData from '../../lib/get-all-data';

export default function CryptoNews() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const fetchData = async () => {
    const url = 'https://real-time-finance-data.p.rapidapi.com/stock-news?symbol=AAPL%3ANASDAQ&language=en';
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '089206b11amshbfb2558f931c3f0p1135b3jsnca1b7650d57e',
        'X-RapidAPI-Host': 'real-time-finance-data.p.rapidapi.com'
      }
    };

    try {
      setLoading(true);
      const result = await getAllData(url, options);
      setData(result);
    } catch (error) {
      setError(`Грешка при извличане на данни: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const handleRefreshIntervalChange = (e) => {
    setRefreshInterval(parseInt(e.target.value, 10));
  };

  return (
    <div>
      {/* Вашите компоненти за показване на новините */}
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && data.length > 0 && (
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}

      {/* Променете стойностите на тези елементи според вашия UI */}
      <label htmlFor="refreshInterval">Refresh Interval (seconds): </label>
      <input
        type="number"
        id="refreshInterval"
        value={refreshInterval}
        onChange={handleRefreshIntervalChange}
      />
    </div>
  );
}
