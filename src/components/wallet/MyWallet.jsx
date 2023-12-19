import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { LinearScale, CategoryScale, LineElement, LineController, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns'; //библиотека за работа с дати


import { collection, getDocs, query, where, getDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

import WalletCryptoForm from "./WalletCryptoForm";

export default function MyWallet() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDealId, setEditDealId] = useState(null);
  const [cryptoFormData, setCryptoFormData] = useState(null);
  const [cryptoFormDataLocal, setCryptoFormDataLocal] = useState({
    cryptoData: {
      name: "",
      symbol: "",
      id: "",
    },
    quantity: 0,
    price: "",
  });
  const hasData = data.length > 0;

  // Състояние за общата сума
  const [totalAmount, setTotalAmount] = useState(0);
  const { user } = useAuth();

  // Настройване на локалните данни за формата при промяна на cryptoFormData
  useEffect(() => {
    setCryptoFormDataLocal(cryptoFormData || {
      cryptoData: {
        name: "",
        symbol: "",
        id: "",
      },
      quantity: 0,
      price: "",
    });
  }, [cryptoFormData]);

  // Извличане на данни при промяна в user, isModalOpen или cryptoFormData
  useEffect(() => {
    fetchData();
  }, [user, isModalOpen, cryptoFormData]);

  // Функция за извличане на данни от базата данни
  const fetchData = async () => {
    try {
      const walletCollection = collection(db, "wallet");
      const querySnapshot = await getDocs(query(walletCollection, where("user_id", "==", user ? user.uid : '')));
      const documents = [];
      let newTotalAmount = 0;

      for (const walletDoc of querySnapshot.docs) {
        const walletData = walletDoc.data();
        const cryptoDocRef = walletData.crypto_id;

        try {
          const cryptoDoc = await getDoc(cryptoDocRef);

          if (cryptoDoc.exists()) {
            const cryptoData = { id: cryptoDoc.id, ...cryptoDoc.data() };

            if (cryptoData && cryptoData.name && cryptoData.symbol) {
              newTotalAmount += walletData.quantity * walletData.price;
              documents.push({ id: walletDoc.id, ...walletData, cryptoData });
            } else {
              console.error(`Data incomplete for wallet ID: ${walletDoc.id}`);
            }
          } else {
            console.error(`Data not found or does not exist for wallet ID: ${walletDoc.id}`);
          }
        } catch (error) {
          console.error(`Error fetching data for wallet ID ${walletDoc.id}:`, error);
        }
      }

      setData(documents);
      setTotalAmount(newTotalAmount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Функция за изтриване на запис
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this deal?"
    );

    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "wallet", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting deal:", error);
      }
    }
  };

  // Функция за отваряне на модалния прозорец
  const openFormModal = (dealId) => {
    setEditDealId(dealId);
    setIsModalOpen(true);
    // Подаване на данните на сделката към формата за редактиране
    if (dealId) {
      const selectedDeal = data.find((item) => item.id === dealId);
      setCryptoFormData(selectedDeal);
    }
  };

  // Функция за затваряне на модалния прозорец
  const closeFormModal = () => {
    setEditDealId(null);
    setIsModalOpen(false);
    setCryptoFormData(null);
  };

  // Функция за успешно добавяне/редактиране на запис
  const handleFormSuccess = () => {
    closeFormModal();
    fetchData();
  };

//Графика 

// Регистриране ня грфиката с нейните компоненти
Chart.register(LinearScale, CategoryScale, LineElement, LineController, Tooltip);

// Функция за дефиниране на графика
const generateChartData = (data) => {
  try {
    // Проверка дали data е дефинирано и не е празно
    if (!data || data.length === 0) return [];

    // Обект, който ще съдържа агрегирани данни
    const aggregatedData = {};

    // Обхождане на входните данни и агрегиране на стойностите по дати
    data.forEach((item) => {
      // Проверка дали item има свойство time и дали то е функция toDate
      if (item.time && typeof item.time.toDate === 'function') {
        // Създаване на ключ за дата във формат ISO
        const dateKey = item.time.toDate().toISOString().split("T")[0];
        // Извличане на вече съхранените данни или създаване на нови, ако ключът липсва
        const existingData = aggregatedData[dateKey] || { quantity: 0, price: 0 };

        // Актуализиране на агрегираните данни със стойностите от текущия елемент
        existingData.quantity += item.quantity;
        existingData.price += item.quantity * item.price;

        // Записване на агрегирания обект в обекта с агрегирани данни
        aggregatedData[dateKey] = existingData;
      }
    });

    // Преобразуване на агрегираните данни в масив от обекти за използване в графика
    const chartData = Object.keys(aggregatedData)
      .map((dateKey) => {
        try {
          // Преобразуване на ключа за дата в обект тип Date
          const dateObject = new Date(dateKey);
          // Проверка дали датата е валидна
          if (isNaN(dateObject.getTime())) return null;

          // Създаване на обект за използване в графика със стойности от агрегираните данни
          return { t: dateObject, y: aggregatedData[dateKey].quantity * aggregatedData[dateKey].price };
        } catch (error) {
          // Обработка на грешки при форматирането на датата
          console.error("Error formatting date:", error);
          console.log("Original date:", dateKey);
          return null;
        }
      })
      // Филтриране на невалидните обекти и сортиране на масива по време
      .filter((item) => item !== null)
      .sort((a, b) => a.t - b.t);

    // Извеждане на генерираните данни за графиката в конзолата
    console.log("Generated Chart Data:", chartData);
    // Връщане на генерираните данни за графика
    return chartData;
  } catch (error) {
    // Обработка на неочаквана грешка
    console.error("An unexpected error occurred:", error);
    // Връщане на празен масив при грешка
    return [];
  }
};



  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="relative flex h-10 items-center justify-between"></div>

      <h2 className="text-xl font-semibold">My Wallet</h2>

      <div>
        
      {loading ? (
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: '10px' }}>
            Loading...
          </p>
        ) : hasData ? (
          <div>
            <Line
              data={{
                datasets: [
                  {
                    label: 'Wallet deals by date',
                    data: generateChartData(data).map((item) => ({ x: item.t, y: item.y })),
                  },
                ],
              }}
              options={{
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'day',
                      displayFormats: {
                        day: 'MM/dd/yyyy',
                      },
                      tooltipFormat: 'MM/dd/yyyy',
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        ) : (
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'black', margin: '10px' }}>    
There is no data entered to display the graph
          </p>
        )}


<button onClick={() => openFormModal(null)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 rounded-full"  style={{marginTop:'20px'}}>Add Deal</button>

        {/* Модал за добавяне/редактиране на записи */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
            <div className="relative p-8 bg-white w-full max-w-md m-auto rounded shadow-lg">
              <button onClick={closeFormModal} className="absolute top-0 right-0 p-4">
                Close
              </button>
              <h2 className="text-2xl font-semibold mb-4">
                {editDealId ? "Edit Deal" : "Add Deal"}
              </h2>
              <WalletCryptoForm
                onSuccess={handleFormSuccess}
                editDealId={editDealId}
                updateFormData={setCryptoFormDataLocal}
                cryptoFormData={cryptoFormDataLocal}
              />
            </div>
          </div>
        )}

        {/* Показване на портфейла */}
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden"></div>
              <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500 max-w-screen-md mx-auto">
                <thead className="border-b font-medium dark:border-neutral-500 bg-gray-600 text-white">
                  <tr>
                    <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Deal time</th>
                    <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Crypto Name</th>
                    <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Quantity</th>
                    <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Price</th>
                    <th scope="col" className="border-r px-2 py-4 dark:border-neutral-500">Total</th>
                    <th colSpan={3}>Actions</th>
                  </tr>
                </thead>
                {!loading && hasData ? (
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={7}>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin:'10px' }}>Loading...</p>
                        </td>
                      </tr>
                    )}

                    {data.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">
                          {item.time ? new Date(item.time.toDate()).toLocaleString() : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">
                          <img src={`crypto-logos/${item.cryptoData.name}.png`} alt={item.cryptoData.name} style={{width: '40px', height: '40px' , float:'left'}}/>
                          <div style={{float: 'left', marginTop: '10px', marginLeft:'10px'}}>{item.cryptoData ? item.cryptoData.name : 'N/A'} ({item.cryptoData ? item.cryptoData.symbol : 'N/A'})</div>
                        </td>
                        <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{item.quantity}</td>
                        <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500 text-right">{item.price} $</td>
                        <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500 text-right">{item.quantity * item.price} $</td>
                        <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500" style={{width:'25%'}}>
                          <Link to={`/MyWalletItem/${item.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Deal Details</Link>
                          <button onClick={() => openFormModal(item.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full ml-2 mr-2">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Delete</button>
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan="4" className="whitespace-nowrap border-t border-r px-2 py-2 font-bold text-lg dark:border-neutral-500 text-right">Total investment:</td>
                      <td className="whitespace-nowrap border-t border-r px-2 py-2 font-bold text-lg dark:border-neutral-500 text-right">
                        {totalAmount} $
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={7}>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'black', margin:'10px' }}>No deals added</p>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
