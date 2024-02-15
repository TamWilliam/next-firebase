import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from './lib/firebase';
import Link from 'next/link'

export default function VoirProduits() {
    const [produits, setProduits] = useState([]);

    useEffect(() => {
        const fetchProduits = async () => {
            const querySnapshot = await getDocs(collection(db, "products"));
            const produitsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                let imageUrl = '';
                console.log(data.imageUrl);
                try {
                    imageUrl = await getDownloadURL(ref(getStorage(), data.imageUrl));
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    data.imageUrl = 'Images/visu-indispo.png';
                }
                return { id: doc.id, ...data, imageUrl };
            }));
            setProduits(produitsData);
        };

        fetchProduits();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 bg-white">
            <h1 className="text-3xl font-bold mb-4 text-center">Liste des produits</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produits.map((produit) => (
                    <Link href={`/product/${produit.id}`} key={produit.id}>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={produit.imageUrl} alt={produit.name} className="w-full h-48 object-cover object-center" />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">{produit.name}</h2>
                                <p className="text-gray-600">{produit.description}</p>
                                <p className="text-gray-800 font-bold mt-2">{produit.price} €</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}