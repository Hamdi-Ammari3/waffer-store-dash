import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import {DB} from '../firebaseConfig'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { Dropdown,Modal } from 'antd'
import { BsThreeDots } from "react-icons/bs"
import { IoMdCloseCircleOutline } from "react-icons/io"

const Post = ({post,onUpdatePost }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productName, setProductName] = useState(post?.prod_name || '');
  const [discountType, setDiscountType] = useState(post?.discount_type || 'price');
  const [oldPrice, setOldPrice] = useState(post?.old_price || '');
  const [newPrice, setNewPrice] = useState(post?.new_price || '');
  const [percentageAmount, setPercentageAmount] = useState(post?.percentage || '');
  //const [images, setImages] = useState(post?.images || [])
  //const [newImages, setNewImages] = useState([])
  const [images, setImages] = useState([]) // modal copy of images
  const [newImages, setNewImages] = useState([]) // new files
  const [loading, setLoading] = useState(false);

  //Open edit post modal
  const openEditModal = () => {
    setImages([...post.images])
    setNewImages([])
    setIsEditModalOpen(true)
  }

  //Click the three dots menu
  const handleMenuClick = async ({ key }) => {
    if (key === 'edit') openEditModal()

    if (key === 'cancel') {
      const confirmed = window.confirm('هل أنت متأكد من إلغاء هذا المنشور؟');
      if (confirmed) {
        try {
          const postRef = doc(DB, "posts", post.id);
          await updateDoc(postRef, { canceled: true });
          onUpdatePost({ ...post, canceled: true });
          alert('تم إلغاء المنشور بنجاح ✅');
        } catch (error) {
          console.log(error);
          alert('حدث خطأ أثناء إلغاء المنشور');
        }
      }
    }
  }

  //Add new images
  const handleAddImages = (files) => {
    const fileList = Array.from(files);
    const previews = fileList.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
  
    // ✅ Append new images instead of replacing
    setNewImages(prev => [...prev, ...previews]);
  }

  // Save edited post
  const handleSaveEdit = async () => {
    if (!productName.trim()) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    if(!images?.length && !newImages?.length) {
      alert('يرجى اضافة صورة المنتج');
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
      setLoading(true)
      const storage = getStorage()
      const newImageUrls = []

       // ✅ Upload new images if any
      for (const { file } of newImages) {
        const storageRef = ref(storage, `posts/${post.shop_id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        newImageUrls.push(downloadURL);
      }

      // ✅ Merge old + new
      const allImages = [...images, ...newImageUrls];

      // Compress first image for thumbnail
      let thumbnailUrl = allImages[0]
      if (allImages.length > 0 && newImageUrls.length > 0) {
        try {
          const firstFile = newImages[0].file
          const compressed = await imageCompression(firstFile, {
            maxWidthOrHeight: 100,
            useWebWorker: true,
            maxSizeMB: 0.05,
          })
          const thumbRef = ref(storage, `posts/${post.shop_id}/thumb_${Date.now()}_${firstFile.name}`)
          await uploadBytes(thumbRef, compressed)
          thumbnailUrl = await getDownloadURL(thumbRef)
        } catch (err) {
          console.warn("Thumbnail compression failed:", err)
        }
      }

      const postRef = doc(DB, "posts", post.id);
      const updatedData = {
        prod_name: productName,
        discount_type: discountType,
        images: allImages,
        thumbnail: thumbnailUrl,
        ...(discountType === 'price'
          ? { old_price: Number(oldPrice), new_price: Number(newPrice), percentage: null }
          : { percentage: Number(percentageAmount), old_price: null, new_price: null }),
      }
      await updateDoc(postRef, updatedData);
      onUpdatePost({ ...post, ...updatedData });
      alert('تم تحديث المنشور بنجاح ✅');
      setIsEditModalOpen(false);
    } catch (error) {
      //console.log(error);
      alert('حدث خطأ أثناء تعديل المنشور');
    } finally {
      setLoading(false);
    }
  }

  const menuItems = [
    { key: 'edit',label: 'تعديل'},
    ...(!post?.canceled ? [{ key: 'cancel', label: 'إلغاء' }] : []),
  ]

  return (
    <div className='post-box'>

      {!post?.canceled && (
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <div className='post-box-top-menu-three-dots'>
            <BsThreeDots />
          </div>
        </Dropdown>
      )}
      
      {post?.canceled && (
        <div className='post-box-top-menu-status'>
          <p>ملغي</p>
        </div>
      )}

      <div className='post-box-item-main'>

        <div className='post-box-item'>
          <h5 style={{textAlign:'center'}}>{post.prod_name}</h5>
        </div>

        {post?.images?.length > 0 && (
          <div className='existed-images-thumbs-box'>
            <div className='existed-images-slider'>
              {post?.images?.map((src, idx) => (
                <div key={idx} className='existed-image-thumb-item'>
                  <img src={src} alt="Preview" />                                          
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='post-box-item'>
          {post.discount_type === 'price' ? (
            <div className='post-box-item-price'>
              <p className='post-box-item-old-price-text'>{post.old_price}</p>
              <p>/</p>
              <p className='post-box-item-new-price-text'>{post.new_price}</p>
            </div>
          ) : (
            <div className='post-box-item-price' style={{gap:'5px'}}>
              <p className='post-box-item-new-price-text'>{post.percentage}</p>
              <p className='post-box-item-new-price-text'>%</p>
              <p className='post-box-item-new-price-text' style={{fontSize:'14px'}}>تخفيض</p>
            </div>
          )}
        </div>

        <div className='post-box-item'>
          <p style={{fontSize:'13px'}}>البداية</p>
          <p style={{fontSize:'13px'}}>{new Date(post.start_date.seconds * 1000).toLocaleDateString('fr-FR')}</p>
        </div>

        <div className='post-box-item'>
          <p style={{fontSize:'13px'}}>النهاية</p>
          <p style={{fontSize:'13px'}}>{new Date(post.end_date.seconds * 1000).toLocaleDateString('fr-FR')}</p>
        </div>

      </div>

      {/* Edit Modal */}
      <Modal
        title="تعديل المنشور"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleSaveEdit}
        okText="حفظ"
        cancelText="إلغاء"
        confirmLoading={loading}
        centered
      >
        <div className='creating-new-post-form'>
          <div className='creating-new-post-form-item-name'>
            <input
              placeholder='اسم المنتج'
              type='text'
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className='adding-new-image-input-box'>
            <label htmlFor="image-upload" className="custom-upload-button">
              إضافة صور
            </label>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleAddImages(e.target.files)}
            />
          </div>

          {/* ✅ Show previews if images OR newImages exist */}
          {(images?.length > 0 || newImages?.length > 0) && (
            <div className='images-thumbs-box'>
              <div className='images-slider'>

                {/* Existing DB images */}
                {images?.map((src, idx) => (
                  <div key={idx} className='image-thumb-item'>
                    <img src={src} alt="Preview" />
                    <IoMdCloseCircleOutline 
                      className='remove-thumb'
                      onClick={() => setImages(images?.filter((_, i) => i !== idx))}
                    />                                           
                  </div>
                ))}

                {/* Newly added images */}
                {newImages.map((imgObj, idx) => (
                  <div key={`new-${idx}`} className='image-thumb-item'>
                    <img src={imgObj.preview} alt="New" />
                    <IoMdCloseCircleOutline
                      className='remove-thumb'
                      onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <h5 style={{ marginBottom: '7px' }}>المبلغ القديم</h5>
              </div>
              <div>
                <input
                  type='number'
                  placeholder='المبلغ الجديد'
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <h5 style={{ marginBottom: '7px' }}>المبلغ الجديد</h5>
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
                <div className='creating-new-post-form-discount-value' style={{ gap: '3px', marginBottom: '7px' }}>
                  <h5>نسبة التخفيض</h5>
                  <h5>%</h5>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  )
}

export default Post