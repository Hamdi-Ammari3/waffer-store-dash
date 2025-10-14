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
      router.push('/login')
      return
    }

    setIsAuthenticated(true)
    const unsubscribe = listenShopPosts(shopId)
    return () => unsubscribe?.()
  }, [])

  //Listen to shop document and update posts automatically
  const listenShopPosts = (shopId) => {
    setLoadingPosts(true);
    const shopRef = doc(DB, "shops", shopId);

    const unsubscribe = onSnapshot(
      shopRef,
      async (shopSnap) => {
        if (!shopSnap.exists()) {
          setPosts([]);
          setPostLimit(0);
          setLoadingPosts(false);
          return;
        }

        const shopData = shopSnap.data();
        const postObjects = shopData.posts || [];

        // Determine plan limit
        const now = Timestamp.now();
        let limit = 0;
        if (shopData.plan === "free") {
          limit = 3;
        } else if (shopData.plan === "paid") {
          const subsEnd = shopData.subs_period?.end;
          if (subsEnd && subsEnd.toMillis() > now.toMillis()) {
            limit = 100;
          }
        }

        setPostLimit(limit);

        if (postObjects.length === 0) {
          setPosts([]);
          setLoadingPosts(false);
          return;
        }

        // Fetch all posts
        const postsPromises = postObjects.map(async (postObj) => {
          const postRef = doc(DB, "posts", postObj.id);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            return { id: postObj.id, ...postSnap.data() };
          }
          return null;
        });

        const postsData = (await Promise.all(postsPromises)).filter(Boolean);
        setPosts(postsData);
        setLoadingPosts(false); // ✅ now set after the first data is ready
      },
      (error) => {
        console.error("Error listening to shop posts:", error);
        setLoadingPosts(false);
      }
    );

    return unsubscribe;
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
          <div className='no-posts-list'>
            <p style={{ textAlign: 'center', marginTop: 50 }}>لا توجد منشورات حاليا</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default page