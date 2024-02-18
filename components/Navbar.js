import React, { useState } from 'react'
import Link from 'next/link'
import { auth } from '../firebase/firebase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
  const [cartItemCount] = useState(0)

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error)
    }
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <ul className="flex justify-between items-center">
          <li>
            <Link href="/">
              <span className="text-white font-bold">Accueil</span>
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/cart" className="text-white mr-4">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartItemCount > 0 && (
                <span className="ml-1 text-white">{cartItemCount}</span>
              )}
            </Link>
            {auth.currentUser ? (
              <div className="flex items-center">
                <Link href="/profile">
                  <span className="text-white mr-4">
                    {auth.currentUser.email}
                  </span>
                </Link>
                <button className="text-white" onClick={handleSignOut}>
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <span className="text-white">Connexion</span>
                </Link>
                <Link href="/register">
                  <span className="text-white ml-4">Inscription</span>
                </Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
