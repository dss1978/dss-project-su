import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const WalletCryptoForm = ({ onSuccess, editDealId, updateFormData, yourFormData }) => {
  const [cryptoName, setCryptoName] = useState("");
  const [cryptoSymbol, setCryptoSymbol] = useState("");
  const [walletQuantity, setWalletQuantity] = useState(0);
  const [walletPrice, setWalletPrice] = useState("");
  const [selectedCryptoId, setSelectedCryptoId] = useState("");
  const [isDealAdded, setIsDealAdded] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState([]);
  const [cryptoFormValid, setCryptoFormValid] = useState(false);
  const [walletFormValid, setWalletFormValid] = useState(false);
  const [yourFormDataLocal, setYourFormDataLocal] = useState({
    cryptoData: {
      name: "",
      symbol: "",
      id: "",
    },
    quantity: 0,
    price: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchCryptoOptions = async () => {
      const cryptoCollection = collection(db, "crypto");
      const cryptoSnapshot = await getDocs(cryptoCollection);
      const options = cryptoSnapshot.docs.map((cryptoDoc) => {
        const cryptoData = cryptoDoc.data();
        return { id: cryptoDoc.id, name: cryptoData.name };
      });
      setCryptoOptions(options);
    };

    fetchCryptoOptions();
  }, []);

  useEffect(() => {
    if (editDealId && yourFormData) {
      setYourFormDataLocal(yourFormData);
      setCryptoName(yourFormData.cryptoData.name);
      setCryptoSymbol(yourFormData.cryptoData.symbol);
      setWalletQuantity(yourFormData.quantity);
      setWalletPrice(yourFormData.price);
      setSelectedCryptoId(yourFormData.cryptoData.id);
    }
  }, [editDealId, yourFormData]);


  useEffect(() => {
    const isCryptoFormValid = cryptoName.trim() !== "" && cryptoSymbol.trim() !== "";
    setCryptoFormValid(isCryptoFormValid);
  }, [cryptoName, cryptoSymbol]);

  useEffect(() => {
    const isCryptoSelected = selectedCryptoId !== "";
    const isPositiveQuantity = walletQuantity > 0;
    const isNumericPrice = !isNaN(parseFloat(walletPrice)) && isFinite(walletPrice);
    const isWalletFormValid = isCryptoSelected && isPositiveQuantity && isNumericPrice;
    setWalletFormValid(isWalletFormValid);
  }, [selectedCryptoId, walletQuantity, walletPrice]);

 useEffect(() => {
  if (yourFormData) {
    setYourFormDataLocal(yourFormData);
    setCryptoName(yourFormData.cryptoData.name);
    setCryptoSymbol(yourFormData.cryptoData.symbol);
    setWalletQuantity(yourFormData.quantity);
    setWalletPrice(yourFormData.price);
    setSelectedCryptoId(yourFormData.cryptoData.id);
  }
}, [yourFormData]);


  useEffect(() => {
    setYourFormDataLocal(yourFormData);
  }, [yourFormData]);

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

      setCryptoName("");
      setCryptoSymbol("");
    } catch (error) {
      console.error("Error adding crypto: ", error);
    }
  };

  const handleAddWalletCrypto = async () => {
    if (!walletFormValid) {
      console.error("Invalid wallet form");
      return;
    }
  
    try {
      const walletCollection = collection(db, "wallet");
  
      if (user) {
        if (editDealId) {
          await updateExistingDeal(editDealId);
        } else {
          await addNewDeal(walletCollection);
        }
      } else {
        console.error("User not authenticated");
      }
  
      resetForm();
    } catch (error) {
      console.error("Error adding wallet crypto: ", error);
    }
  };

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

  const resetForm = () => {
    setWalletQuantity(0);
    setWalletPrice("");
    setSelectedCryptoId("");
  };

  

  return (
    <div className="border border-gray-300 p-4 rounded-md">
      <div>
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
       
        </label>
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${walletFormValid ? "" : "opacity-50 cursor-not-allowed"}`}
          onClick={handleAddWalletCrypto}
          disabled={!walletFormValid}
        >
          {editDealId ? "Edit Deal" : "Add Deal to my Wallet"}
        </button>
      </div>

      {/* <div className="mb-4" style={{ marginTop: "40px" }}>
        <h2 className="text-xl">Added a type of crypto for deal </h2>
        <label className="block mb-2">
          Crypto Name:
          <input
            className="border border-gray-400 px-2 py-1 w-full"
            type="text"
            value={yourFormDataLocal.cryptoData.name}
            onChange={(e) => setCryptoName(e.target.value)}
          />
        </label>
        <label className="block mb-2">
          Crypto Symbol:
          <input
            className="border border-gray-400 px-2 py-1 w-full"
            type="text"
            value={yourFormDataLocal.cryptoData.symbol}
            onChange={(e) => setCryptoSymbol(e.target.value)}
          />
        </label>
        <button
          className={`bg-blue-500 hover.bg-blue-700 text-white font-bold py-2 px-4 rounded ${cryptoFormValid ? "" : "opacity-50 cursor-not-allowed"}`}
          onClick={handleAddCrypto}
          disabled={!cryptoFormValid}
        >
          Add Crypto
        </button>
      </div> */}
    </div>
  );
};

export default WalletCryptoForm;
