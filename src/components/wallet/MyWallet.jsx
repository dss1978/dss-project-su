import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, getDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import WalletCryptoForm from "./WalletCryptoForm";

export default function MyWallet() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDealId, setEditDealId] = useState(null);
  const [yourFormData, setYourFormData] = useState(null);
  const [yourFormDataLocal, setYourFormDataLocal] = useState({
    cryptoData: {
      name: "",
      symbol: "",
      id: "",
    },
    quantity: 0,
    price: "",
  });
  const hasData = data.length > 0;


  const [totalAmount, setTotalAmount] = useState(0);
  const { user } = useAuth();
  useEffect(() => {
    setYourFormDataLocal(yourFormData || {
      cryptoData: {
        name: "",
        symbol: "",
        id: "",
      },
      quantity: 0,
      price: "",
    });
  }, [yourFormData]);


  useEffect(() => {
    fetchData();
  }, [user, isModalOpen, yourFormData]); // Добавете yourFormData към зависимостите, за да се повика fetchData при промяна на данните от формата

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
              console.error(`Crypto data incomplete for wallet ID: ${walletDoc.id}`);
            }
          } else {
            console.error(`Crypto document not found or does not exist for wallet ID: ${walletDoc.id}`);
          }
        } catch (error) {
          console.error(`Error fetching crypto data for wallet ID ${walletDoc.id}:`, error);
        }
      }

      setData(documents);
      setTotalAmount(newTotalAmount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  const openFormModal = (dealId) => {
    setEditDealId(dealId);
    setIsModalOpen(true);
    // Подаване на данните на сделката към формата за редактиране
    if (dealId) {
      const selectedDeal = data.find((item) => item.id === dealId);
      setYourFormData(selectedDeal);
      
    }
  };

  const closeFormModal = () => {
    setEditDealId(null);
    setIsModalOpen(false);
    setYourFormData(null);
  };

  const handleFormSuccess = () => {
    closeFormModal();
    fetchData();
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="relative flex h-10 items-center justify-between"></div>

      <h2 className="text-xl font-semibold">My Wallet</h2>

      <div>
        <button
          onClick={() => openFormModal(null)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 rounded-full"
        >
          Add Deal
        </button>

        {/* Modal for adding/editing deals */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
            <div className="relative p-8 bg-white w-full max-w-md m-auto rounded shadow-lg">
              <button onClick={closeFormModal} className="absolute top-0 right-0 p-4">
                Close
              </button>
              <h2 className="text-2xl font-semibold mb-4">
                {editDealId ? "Edit Deal" : "Add Deal"}
              </h2>
              {/* Променената част: Подаване на yourFormData към компонента */}
              <WalletCryptoForm
  onSuccess={handleFormSuccess}
  editDealId={editDealId}
  updateFormData={setYourFormDataLocal}
  yourFormData={yourFormDataLocal}
/>

         </div>
          </div>
        )}

        {/* Display the wallet data */}
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
                        {item.cryptoData ? item.cryptoData.name : 'N/A'} ({item.cryptoData ? item.cryptoData.symbol : 'N/A'})
                      </td>
                      <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500">{item.quantity}</td>
                      <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500 text-right">{item.price} $</td>
                      <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500 text-right">{item.quantity * item.price} $</td>
                      <td className="whitespace-nowrap border-r px-2 py-2 font-medium dark:border-neutral-500" style={{width:'25%'}}>
                        <Link to={`/MyWalletItem/${item.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Deal Details</Link>
                      
                        <button onClick={() => openFormModal(item.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full ml-2 mr-2">Edit</button>
                    
                      <button onClick={() => handleDelete(item.id)}   className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"

>Delete</button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="4" className="whitespace-nowrap border-t border-r px-2 py-2 font-bold text-lg dark:border-neutral-500 text-right">Total investment:</td>
                    <td className="whitespace-nowrap border-t border-r px-2 py-2 font-bold text-lg dark:border-neutral-500 text-right">
{totalAmount} $</td>
                    <td></td>
                  </tr>
                </tbody>)
                : (
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
