"use client"
import React,{useState} from 'react'
import '../style.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { collection, getDocs, query, where } from "firebase/firestore"
import { DB } from '../../firebaseConfig'
import ClipLoader from "react-spinners/ClipLoader"
import Image from 'next/image'
import logo_image from '../../public/images/logo.png'

const page = () => {
    const [username,setUsername] = useState('')
    const [password,setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading,setLoading] = useState(false)

    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
        // Query Firestore for admin credentials
        const q = query(
            collection(DB, "shops"),
            where("username", "==", username),
            where("password", "==", password)
        )

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const userData = docSnap.data();
            const shopId = docSnap.id;

            localStorage.setItem('shopLoggedIn', true)
            localStorage.setItem('shopName', userData?.name)
            localStorage.setItem('shopID', shopId)
            router.push('/')
        } else {
            setError('يرجى التثبت من المعلومات المدرجة')
        }
        } catch (err) {
            setError('يرجى التثبت من المعلومات المدرجة')
        }finally {
            setLoading(false)
        }
    }

    return (
        <div className='login-container'>
            <div className='login-box'>
                <div className='form-title-box'>
                    <Image
                        src={logo_image}
                        width={60}
                        height={60}
                        alt='logo image'
                        style={{objectFit:'contain',borderRadius:50}}
                    />
                </div>
                {error && <p style={{color:'red'}}>{error}</p>}
                <div className='login-form-box'>
                    <form className='form'>
                        <input 
                            placeholder='اسم المستخدم' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                            placeholder='كلمة المرور' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {loading ? (
                            <div style={{ width:'250px',height:'35px',backgroundColor:'#29c978',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <ClipLoader
                                color={'#fff'}
                                loading={loading}
                                size={10}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                                />
                            </div>
                        ) : (
                            <button onClick={handleLogin}>دخول</button>
                        )}
                    </form>
                </div>
                <div className='delete_account_box'>
                    <p>تريد مسح حسابك من على التطبيق؟</p>
                    <Link href='/delete-account'>اضغط هنا</Link>
                </div>
            </div>
        </div>
    )
}

export default page