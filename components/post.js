import React, { useState } from 'react';
import { Dropdown,Modal } from 'antd'
import { BsThreeDots } from "react-icons/bs"
import { doc, updateDoc } from 'firebase/firestore'
import {DB} from '../firebaseConfig'

const Post = ({post,onUpdatePost }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productName, setProductName] = useState(post?.prod_name || '');
  const [discountType, setDiscountType] = useState(post?.discount_type || 'price');
  const [oldPrice, setOldPrice] = useState(post?.old_price || '');
  const [newPrice, setNewPrice] = useState(post?.new_price || '');
  const [percentageAmount, setPercentageAmount] = useState(post?.percentage || '');
  const [loading, setLoading] = useState(false);

  const handleMenuClick = async ({ key }) => {
    if (key === 'edit') {
      setIsEditModalOpen(true);
    }
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

  // Save edited post
  const handleSaveEdit = async () => {
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
      setLoading(true);
      const postRef = doc(DB, "posts", post.id);
      const updatedData = {
        prod_name: productName,
        discount_type: discountType,
        ...(discountType === 'price'
          ? { old_price: Number(oldPrice), new_price: Number(newPrice), percentage: null }
          : { percentage: Number(percentageAmount), old_price: null, new_price: null }),
      }
      await updateDoc(postRef, updatedData);
      onUpdatePost({ ...post, ...updatedData });
      alert('تم تحديث المنشور بنجاح ✅');
      setIsEditModalOpen(false);
    } catch (error) {
      console.log(error);
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
          <p style={{fontSize:'14px'}}>البداية</p>
          <p style={{fontSize:'14px'}}>{new Date(post.start_date.seconds * 1000).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className='post-box-item'>
          <p style={{fontSize:'14px'}}>النهاية</p>
          <p style={{fontSize:'14px'}}>{new Date(post.end_date.seconds * 1000).toLocaleDateString('fr-FR')}</p>
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