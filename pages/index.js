import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { db, useAuth } from '../firebase/firebase'

export default function VoirProduits() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const defaultImage = 'Images/noImage/noImage.jpg'

  useEffect(() => {
    const fetchProduits = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'))
      const produitsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data()
          let imageUrl = defaultImage // Utilisez l'image par défaut ici
          if (data.imageUrl) {
            try {
              imageUrl = await getDownloadURL(ref(getStorage(), data.imageUrl))
            } catch (error) {
              console.error('Error fetching image URL:', error)
              // En cas d'erreur, imageUrl est déjà défini sur l'image par défaut
            }
          }
          return { id: doc.id, ...data, imageUrl }
        })
      )
      setProduits(produitsData)
      setLoading(false)
    }

    fetchProduits()
  }, [])

  const handleAddToCart = async (produit) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des articles au panier.')
      return
    }

    const userCartRef = doc(db, 'carts', user.uid)
    const userCartDoc = await getDoc(userCartRef)
    const userCartData = userCartDoc.exists() ? userCartDoc.data() : {}

    if (userCartData[produit.id]) {
      const newQuantity = userCartData[produit.id].quantity + 1
      await updateDoc(userCartRef, {
        [`${produit.id}.quantity`]: newQuantity
      })
    } else {
      await updateDoc(userCartRef, {
        [produit.id]: { ...produit, quantity: 1 }
      })
    }

    alert('Produit ajouté au panier !')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 bg-white">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Liste des produits
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produits.map((produit) => (
            <div
              key={produit.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <Link href={`/product/${produit.id}`}>
                {/* Vérification de l'URL de l'image et utilisation de l'image par défaut si nécessaire */}
                <img
                  src={produit.imageUrl || 'Images/noImage/noImage.jpg'}
                  alt={produit.name}
                  className="w-full h-48 object-cover object-center"
                />
              </Link>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{produit.name}</h2>
                <p className="text-gray-600">{produit.description}</p>
                <p className="text-gray-800 font-bold mt-2">
                  {produit.price} €
                </p>
                <button
                  onClick={() => handleAddToCart(produit)}
                  className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 mt-4"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
