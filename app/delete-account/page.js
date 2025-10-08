"use client";
import React, { useState } from "react"
import Link from "next/link"
import { addDoc, collection } from "firebase/firestore"
import { DB } from "../../firebaseConfig"
import ClipLoader from "react-spinners/ClipLoader"
import Image from 'next/image'
import logo_image from '../../public/images/logo.png'

const DeleteAccountRequest = () => {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [reason, setReason] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading,setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        if (!phoneNumber) {
            setError("الرجاء ادخال رقم الهاتف");
            return;
        }

        try {
            // Send deletion request to Firebase
            await addDoc(collection(DB, "deleteRequests"), {
                phoneNumber,
                reason,
                requestedAt: new Date().toISOString(),
            });
            setSuccess("تم ارسال طلب مسح الحساب بنجاح");
            setPhoneNumber("");
            setReason("");
        } catch (error) {
            setError("حدث خطأ ما الرجاء المحاولة مرة اخرى");
        } finally{
            setLoading(false)
        }
    }

    return(
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
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                <div className='login-form-box'>
                    <form className='form'>
                        <input 
                            placeholder='رقم الهاتف' 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <textarea 
                            placeholder='سبب مسح الحساب' 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            style={{width:'250px'}}
                        />
                        {loading ? (
                            <div style={{ width:'250px',padding:'12px 0',backgroundColor:'#29c978',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <ClipLoader
                                    color={'#fff'}
                                    loading={loading}
                                    size={10}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        ) : (
                            <button onClick={handleSubmit}>طلب مسح الحساب</button>
                        )}
                    </form>
                </div>
                <div className='delete_account_box'>
                    <p>الرجوع الى صفحة الدخول؟</p>
                    <Link href='/login'>اضغط هنا</Link>
                </div>
            </div>
        </div>
    )
}

export default DeleteAccountRequest;