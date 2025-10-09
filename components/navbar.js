import React,{useEffect,useState} from 'react'
import { doc, updateDoc, getDoc, collection, addDoc,Timestamp } from "firebase/firestore";
import { DB } from '../firebaseConfig';
import dayjs from 'dayjs'
import { CiLogout } from "react-icons/ci"
import { IoMdAdd } from "react-icons/io"
import { useRouter } from 'next/navigation'
import { Modal } from "antd"
import ClipLoader from "react-spinners/ClipLoader"

const Navbar = ({postLimit,postLength}) => {
    const router = useRouter();
    const [userName,setUserName] = useState('')
    const [isLoggingOut,setIsLoggingOUt] = useState(false)
    const [openAddingNewPostModal,setOpenAddingNewPostModal] = useState(false)
    const [openAddingNewPostModalLoading,setOpenAddingNewPostModalLoading] = useState(false)
    const [productName,setProductName] = useState('')
    const [discountType,setDiscountType] = useState('price')
    const [oldPrice,setOldPrice] = useState(0)
    const [newPrice,setNewPrice] = useState(0)
    const [percentageAmount,setPercentageAmount] = useState(0)
    const [creatingPostLoading, setCreatingPostLoading] = useState(false)

    useEffect(() => {
        const storedName = localStorage.getItem('shopName');
        setUserName(storedName)
    }, []);

    //Logout handler
    const logoutHandler = () => {
        setIsLoggingOUt(true)
        try {
            localStorage.removeItem('shopLoggedIn')
            localStorage.removeItem('shopName')
            router.push('/login');
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoggingOUt(false)
        }
    }

    //Open create new post modal
    const openAddNewPostModalHandler = async () => {
        try {
            setOpenAddingNewPostModalLoading(true)
            const shopId = localStorage.getItem('shopID');
            if (!shopId) {
                alert("حدث خطأ أثناء تحديد الحساب، يرجى إعادة تسجيل الدخول");
                return;
            }

            // Get the shop document
            const shopRef = doc(DB, "shops", shopId);
            const shopSnap = await getDoc(shopRef);

            if (!shopSnap.exists()) {
                alert("لم يتم العثور على بيانات المتجر");
                return;
            }

            const shopData = shopSnap.data();
            const postIds = shopData.posts || [];

            // Check plan limit
            if (postLength >= postLimit) {
                alert(`لقد وصلت للحد الأقصى للمنشورات في خطتك الحالية . يرجى الاشتراك لإضافة منشورات أكثر.`);
                return;
            }

            // No posts yet → allow opening
            if (postLength === 0) {
                setOpenAddingNewPostModal(true);
                return;
            }

            // Get last (most recent) post
            const lastPostId = postIds[0];
            const lastPostRef = doc(DB, "posts", lastPostId);
            const lastPostSnap = await getDoc(lastPostRef);

            if (!lastPostSnap.exists()) {
                setOpenAddingNewPostModal(true);
                return;
            }

            const lastPost = lastPostSnap.data();
            const now = Timestamp.now();

            if (lastPost.end_date > now && !lastPost.canceled) {
                alert("يوجد منشور نشط حاليا، يرجى الانتظار حتى انتهاء المنشور الحالي قبل إضافة منشور جديد.");
                return;
            }

            // Otherwise, open the modal
            setOpenAddingNewPostModal(true);

        } catch (error) {
            console.error("Error checking active post:", error);
            alert("حدث خطأ أثناء التحقق من حالة المنشور");
        } finally{
            setOpenAddingNewPostModalLoading(false);
        }
    }

    //Create new post
    const createNewPost = async () => {
        const shopId = localStorage.getItem('shopID');
        const shopName = localStorage.getItem('shopName');

        if (!productName.trim()) {
            alert('يرجى إدخال اسم المنتج');
            return;
        }

        if (discountType === 'price' && (!oldPrice || !newPrice)) {
            alert('يرجى إدخال المبالغ');
            return;
        }

        if (discountType === 'percentage' && !percentageAmount) {
            alert('يرجى إدخال نسبة التخفيض');
            return;
        }

        try {
            setCreatingPostLoading(true);

            // Calculate start/end dates (1 week duration)
            const startDate = Timestamp.fromDate(dayjs().toDate());
            const endDate = Timestamp.fromDate(dayjs().add(7, 'day').toDate());

            // Fetch shop data for location
            const shopRef = doc(DB, "shops", shopId);
            const shopSnap = await getDoc(shopRef);
            const shopData = shopSnap.exists() ? shopSnap.data() : {};

            // Create post document
            const postRef = await addDoc(collection(DB, "posts"), {
                prod_name: productName,
                category:shopData?.category || null,
                discount_type: discountType,
                ...(discountType === 'price'
                    ? { old_price: Number(oldPrice), new_price: Number(newPrice) }
                    : { percentage: Number(percentageAmount) }),
                start_date: startDate,
                end_date: endDate,
                shop_name: shopName,
                location: shopData?.location || null,
                shop_id: shopId,
                canceled: false,
            });

            const currentPosts = shopData.posts || [];
            const updatedPosts = [postRef.id, ...currentPosts];

            // Add post ID to shop’s post list
            await updateDoc(shopRef, { posts: updatedPosts });

            // Reset form and close modal
            setProductName('');
            setOldPrice(0);
            setNewPrice(0);
            setPercentageAmount(0);
            setDiscountType('price');
            setOpenAddingNewPostModal(false);

            alert('تم إضافة المنشور بنجاح ✅');

        } catch (err) {
            console.error("Error creating post:", err);
            alert('حدث خطأ أثناء إنشاء المنشور');
        } finally {
            setCreatingPostLoading(false);
        }
    }

    return (
        <div className='navbar'>
            <div className='add-new-post-box'>
                {openAddingNewPostModalLoading ? (
                    <div>
                        <ClipLoader
                            color={'#000'}
                            loading={openAddingNewPostModalLoading}
                            size={10}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                ) : (
                    <div onClick={openAddNewPostModalHandler}>
                        <p>اضف منشور</p>
                        <IoMdAdd style={{color:'#000',fontSize:20}}/>
                    </div>
                )}
            </div>
            <Modal
                title={'اضافة منشور جديد'}
                open={openAddingNewPostModal}
                onCancel={() => setOpenAddingNewPostModal(false)}
                centered
                footer={null}
            >
                <div className='creating-new-post-modal'>
                    <div className='creating-new-post-form'>
                        <div className='creating-new-post-form-item-name'>
                            <input
                                placeholder='اسم المنتج'
                                type='text'
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)} 
                            />
                        </div>
                        <div className='creating-new-post-form-toggle'>
                            <div>
                                <input
                                    type='radio'
                                    value='price'
                                    checked={discountType === 'price'}
                                    onChange={() => setDiscountType('price')}
                                />
                                <h5>مبلغ مالي</h5>
                            </div>
                            <div>
                                <input
                                    type='radio'
                                    value='percentage'
                                    checked={discountType === 'percentage'}
                                    onChange={() => setDiscountType('percentage')}
                                />
                                <h5>نسبة مئوية</h5>
                            </div>
                        </div>
                        {discountType === 'price' ? (
                            <div className='creating-new-post-form-discount-value'>
                                <div>
                                    <input
                                        type='number'
                                        placeholder='المبلغ القديم'
                                        value={oldPrice}
                                        onChange={(e) => setOldPrice(e.target.value)}
                                    />
                                    <h5 style={{marginBottom:'7px'}}>المبلغ القديم</h5>
                                </div>
                                <div>
                                    <input
                                        type='number'
                                        placeholder='المبلغ الجديد'
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                    />
                                    <h5 style={{marginBottom:'7px'}}>المبلغ الجديد</h5>
                                </div>
                            </div>
                        ) : (
                            <div className='creating-new-post-form-discount-value'>
                                <div>
                                    <input
                                        type='number'
                                        placeholder='نسبة التخفيض'
                                        value={percentageAmount}
                                        onChange={(e) => setPercentageAmount(e.target.value)}
                                    />
                                    <div className='creating-new-post-form-discount-value' style={{gap:'3px',marginBottom:'7px'}}>
                                        <h5>نسبة التخفيض</h5>
                                        <h5>%</h5>
                                    </div>                                   
                                </div>
                            </div>
                        )}
                        {creatingPostLoading ? (
                            <div className='add-new-post-button' >
                                <ClipLoader
                                    color={'#000'}
                                    loading={creatingPostLoading}
                                    size={10}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={createNewPost}
                                disabled={creatingPostLoading}
                                className='add-new-post-button'                                
                            >
                                أضف
                            </button>  
                        )}   
                    </div>
                </div>
            </Modal>
            <div className='navbar_user_box'>
                <h5>{userName}</h5>
                {isLoggingOut ? (
                    <div style={{ width:'70px',padding:'7px 0',marginRight:'50px', backgroundColor:'#cccc',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <ClipLoader
                            color={'#fff'}
                            loading={isLoggingOut}
                            size={10}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                ) : (
                    <button onClick={logoutHandler}>
                        <p>خروج</p>
                        <CiLogout style={{color:'#000',fontSize:15}}/>
                    </button>
                )}        
            </div>
        </div>
    )
}

export default Navbar