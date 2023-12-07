import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const WalletCryptoForm = ({ onSuccess, editDealId, updateFormData, cryptoFormData }) => {
  // Състояния на данните от формата
  const [cryptoName, setCryptoName] = useState("");
  const [cryptoSymbol, setCryptoSymbol] = useState("");
  const [walletQuantity, setWalletQuantity] = useState(0);
  const [walletPrice, setWalletPrice] = useState("");
  const [selectedCryptoId, setSelectedCryptoId] = useState("");
  const [isDealAdded, setIsDealAdded] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState([]);
  const [cryptoFormValid, setCryptoFormValid] = useState(false);
  const [walletFormValid, setWalletFormValid] = useState(false);
  const [cryptoFormDataLocal, setCryptoFormDataLocal] = useState({
    cryptoData: {
      name: "",
      symbol: "",
      id: "",
    },
    quantity: 0,
    price: "",
  });

  const { user } = useAuth();

  // Извличане на възможните информация за криптовалутите
  useEffect(() => {
    const fetchCryptoData = async () => {
      const cryptoCollection = collection(db, "crypto");
      const cryptoSnapshot = await getDocs(cryptoCollection);
      const options = cryptoSnapshot.docs.map((cryptoDoc) => {
        const cryptoData = cryptoDoc.data();
        return { id: cryptoDoc.id, name: cryptoData.name };
      });
      setCryptoOptions(options);
    };

    fetchCryptoData();
  }, []);

  // Зареждане на данни от външният компонент във формата за редакция
  useEffect(() => {
    if (editDealId && cryptoFormData) {
      setCryptoFormDataLocal(cryptoFormData);
      setCryptoName(cryptoFormData.cryptoData.name);
      setCryptoSymbol(cryptoFormData.cryptoData.symbol);
      setWalletQuantity(cryptoFormData.quantity);
      setWalletPrice(cryptoFormData.price);
      setSelectedCryptoId(cryptoFormData.cryptoData.id);
    }
  }, [editDealId, cryptoFormData]);

  // Валидация на данните от формата за криптовалути
  useEffect(() => {
    const isCryptoFormValid = cryptoName.trim() !== "" && cryptoSymbol.trim() !== "";
    setCryptoFormValid(isCryptoFormValid);
  }, [cryptoName, cryptoSymbol]);

  // Валидация на данните от формата за портфейл
  useEffect(() => {
    const isCryptoSelected = selectedCryptoId !== "";
    const isPositiveQuantity = walletQuantity > 0;
    const isNumericPrice = !isNaN(parseFloat(walletPrice)) && isFinite(walletPrice);
    const isWalletFormValid = isCryptoSelected && isPositiveQuantity && isNumericPrice;
    setWalletFormValid(isWalletFormValid);
  }, [selectedCryptoId, walletQuantity, walletPrice]);

  // Зареждане на данни във формата при избрана съществуваща сделка
  useEffect(() => {
    if (cryptoFormData) {
      setCryptoFormDataLocal(cryptoFormData);
      setCryptoName(cryptoFormData.cryptoData.name);
      setCryptoSymbol(cryptoFormData.cryptoData.symbol);
      setWalletQuantity(cryptoFormData.quantity);
      setWalletPrice(cryptoFormData.price);
      setSelectedCryptoId(cryptoFormData.cryptoData.id);
    }
  }, [cryptoFormData]);

  // Обновяване на локалните данни на формата при промяна в cryptoFormData
  useEffect(() => {
    setCryptoFormDataLocal(cryptoFormData);
  }, [cryptoFormData]);

  // Функция за добавяне на криптовалута
  const handleAddCrypto = async () => {
    if (!cryptoFormValid) {
      console.error("Invalid crypto form");
      return;
    }

    try {
      const cryptoCollection = collection(db, "crypto");
      const docRef = await addDoc(cryptoCollection, {
        name: cryptoName,
        symbol: cryptoSymbol,
      });
      console.log("Crypto added with ID: ", docRef.id);

      // Изчистване на полетата след успешно добавяне
      setCryptoName("");
      setCryptoSymbol("");
    } catch (error) {
      console.error("Error adding crypto: ", error);
    }
  };

  // Функция за добавяне на сделка към портфейла
  const handleAddWalletCrypto = async () => {
    if (!walletFormValid) {
      console.error("Invalid wallet form");
      return;
    }
    try {
      const walletCollection = collection(db, "wallet");

      if (user) {
        // Ако редактираме съществуваща сделка
        if (editDealId) {
          await updateExistingDeal(editDealId);
        } else {
          // Ако добавяме нова сделка
          await addNewDeal(walletCollection);
        }
      } else {
        console.error("User not authenticated");
      }

      // Изчистване на формата след успешно добавяне
      resetForm();
    } catch (error) {
      console.error("Error adding wallet crypto: ", error);
    }
  };

  // Функция за обновяване на съществуваща сделка
  const updateExistingDeal = async (dealId) => {
    const walletDocRef = doc(db, "wallet", dealId);

    await setDoc(walletDocRef, {
      quantity: walletQuantity,
      price: Number(walletPrice),
      crypto_id: doc(db, "crypto", selectedCryptoId),
      user_id: user.uid,
      time: serverTimestamp(),
    }, { merge: true });

    setIsDealAdded((prev) => !prev);
    onSuccess();
  };

  // Функция за добавяне на нова сделка
  const addNewDeal = async (collection) => {
    await addDoc(collection, {
      quantity: walletQuantity,
      price: Number(walletPrice),
      crypto_id: doc(db, "crypto", selectedCryptoId),
      user_id: user.uid,
      time: serverTimestamp(),
    });

    setIsDealAdded((prev) => !prev);
    onSuccess();
  };

  // Функция за изчистване на формата
  const resetForm = () => {
    setWalletQuantity(0);
    setWalletPrice("");
    setSelectedCryptoId("");
  };

  return (
    <div className="border border-gray-300 p-4 rounded-md">
      <div>
        {/* Форма за избор на криптовалута */}
        <label className="block mb-2">
          Select Crypto:
          <select
            className="border border-gray-400 px-2 py-1 w-full"
            value={selectedCryptoId}
            onChange={(e) => setSelectedCryptoId(e.target.value)}
          >
            <option value="">Select Crypto</option>
            {cryptoOptions.map((crypto) => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          Quantity:
          <input
            className="border border-gray-400 px-2 py-1 w-full"
            type="number"
            value={walletQuantity}
            onChange={(e) => setWalletQuantity(parseFloat(e.target.value) || 0)}
          />
        </label>

        <label className="block mb-2">
          Price:
          <input
            className="border border-gray-400 px-2 py-1 w-full"
            type="number"
            value={walletPrice}
            onChange={(e) => setWalletPrice(parseFloat(e.target.value) || "")}
          />
        </label>

        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${walletFormValid ? "" : "opacity-50 cursor-not-allowed"}`}
          onClick={handleAddWalletCrypto}
          disabled={!walletFormValid}
        >
          {editDealId ? "Edit Deal" : "Add Deal to my Wallet"}
        </button>
      </div>
    </div>
  );
};

export default WalletCryptoForm;
