import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataWithBackoff = async () => {
    const url = 'https://newsdata.io/api/1/news?apikey=pub_34340e4626ed5895604e502c18712314d37ce&q=crypto&language=en&category=business';

    try {
      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else if (response.status === 429) {
        // ако върне 429 (too many request), се изчкаква 10 секунди преди да се направи нов опит
        await new Promise(resolve => setTimeout(resolve, 10000));
        await fetchDataWithBackoff();
      } else {
        setError(`Error fetching data: ${response.statusText}`);
      }
    } catch (error) {
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataWithBackoff();
  }, []); // изпълнява се един път при mount на компонента

  return (
     
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-10 items-center justify-between"></div>
        <h2 className="text-xl font-semibold">News </h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {data && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{marginTop:'15px'}}>
            {data.results.map(article => (
              <div key={article.article_id} className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                  {/* <p className="text-gray-700 mb-4">{article.description}</p> */}
        {/* Проверка дали article.description е дефиниран, преди да извикате slice */}
          {article.description && (
            <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.description.slice(0, 250)) }} />
          )}
                  <p className="text-sm text-gray-600">Source: {article.source_id}</p>
                  <p className="text-sm text-gray-600">Published Date: {article.pubDate}</p>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 transition duration-300"
                  >
                    Read More
                  </a>
                </div>
              </div>
            ))}
          </div>
           )}
        </div>
     
  );
};

export default Home;
