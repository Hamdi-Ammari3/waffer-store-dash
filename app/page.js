'use client'
import React,{useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'
import { doc, getDoc, onSnapshot,Timestamp } from "firebase/firestore";
import {DB} from '../firebaseConfig'
import ClipLoader from "react-spinners/ClipLoader"
import './style.css'
import Navbar from '../components/navbar'
import Post from '../components/post'

const page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [postLimit, setPostLimit] = useState(0)
  const router = useRouter()

  // Check if admin is logged in
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('shopLoggedIn')
    const shopId = localStorage.getItem('shopID')
    if (!adminLoggedIn) {
      router.push('/login'); // Redirect to login page if not authenticated
    } else {
      setIsAuthenticated(true)
      const unsubscribe = listenShopPosts(shopId)
      return () => unsubscribe?.() // clean up listener on unmount
    }
  }, [])

  // 🔥 Listen to shop document and update posts automatically
  const listenShopPosts = (shopId) => {
    const shopRef = doc(DB, "shops", shopId)

    return onSnapshot(shopRef, async (shopSnap) => {
      if (!shopSnap.exists()) {
        setPosts([])
        setPostLimit(0)
        return
      }

      const shopData = shopSnap.data()
      const postIds = shopData.posts || []

      const now = Timestamp.now()
      let limit = 0

      if (shopData.plan === "free") {
        limit = 3
      } else if (shopData.plan === "paid") {
        const subsEnd = shopData.subs_period?.end
        if (subsEnd && subsEnd.toMillis() > now.toMillis()) {
          limit = 100
        } else {
          limit = 0
        }
      }

      setPostLimit(limit)

      if (postIds.length === 0) {
        setPosts([])
        return
      }

      setLoadingPosts(true)

      // Fetch each post document
      const postsPromises = postIds.map(async (postId) => {
        const postRef = doc(DB, "posts", postId)
        const postSnap = await getDoc(postRef)
        if (postSnap.exists()) {
          return { id: postId, ...postSnap.data() }
        }
        return null
      })

      const postsData = (await Promise.all(postsPromises)).filter(Boolean)
      setPosts(postsData)
      setLoadingPosts(false)
    })
  }

  // Callback to update a post in state
  const handleUpdatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    )
  }

  if (!isAuthenticated || loadingPosts) {
    return (
      <div style={{ width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <ClipLoader
        color={'#29c978'}
        loading={!isAuthenticated}
        size={70}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      </div>   
  )}

  return (
    <div className='dashboard-container'>
      <Navbar postLimit={postLimit} postLength={posts?.length}/>
      <div className='posts-list'>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post key={post.id} post={post} onUpdatePost={handleUpdatePost}/>
          ))
        ) : (
          <p style={{ textAlign: 'center', marginTop: 50 }}>لا توجد منشورات حاليا</p>
        )}
      </div>
    </div>
  )
}

export default page