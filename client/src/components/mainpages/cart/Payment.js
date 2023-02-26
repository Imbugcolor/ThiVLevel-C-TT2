import React, { useEffect, useState } from 'react'
import Paypal from './Paypal'
import CodModal from '../utils/modal/codModal'
import * as FaIcons from 'react-icons/fa'
import { Link } from 'react-router-dom'
import useLocationForm from '../utils/address/useLocationForm'
import Select from 'react-select'
import PaymentMethodOptions from '../utils/modal/PaymentMethodOptions'

function Payment({ tranSuccess, cart, codSuccess, user, total, closePayment }) {

    const [detail, setDetail] = useState({
        name: '',
        phone: ''
    })
    

    const handleChangeInput = e => {
        const { name, value } = e.target
        setDetail({ ...detail, [name]: value })
    }

    const [address, setAddress] = useState()

    const [numStreet, setNumStreet] = useState('')

    const [validateMsg, setValidateMsg] = useState('')


    const customStyle = {
        container: (prodived) => ({
            ...prodived,
            marginBottom: 20
        })
    }

    const {
        state,
        onCitySelect,
        onDistrictSelect,
        onWardSelect,
        onClick,
        onCancel
    } = useLocationForm(true, address)
    
    const {
        cityOptions,
        districtOptions,
        wardOptions,
        selectedCity,
        selectedDistrict,
        selectedWard
    } = state
    
    const validate = () => {
        const msg = {}

        if(!detail.name) {
          msg.name = '*Bạn chưa nhập họ tên.'
        }

        if(!detail.phone) {
          msg.phone = '*Bạn chưa nhập số điện thoại.'
        } else if(detail.phone.length !== 10) {
          msg.phone = '*Số điện thoại không hợp lệ.'
        }

        if(!selectedCity) {
          msg.city = '*Bạn chưa chọn Tỉnh/Thành.'
        }
        if(!selectedDistrict) {
          msg.district = '*Bạn chưa chọn Quận/Huyện.'
        }
        if(!selectedWard) {
          msg.ward = '*Bạn chưa chọn Phường/Xã.'
        }
        if(!numStreet) {
          msg.numstreet = '*Bạn chưa nhập đường/số nhà.'
        }

        setValidateMsg(msg)
        if(Object.keys(msg).length > 0) return false
        return true
    }

    const handleSuccess = (e) => {
        e.preventDefault()
        const isValid = validate()
        if(!isValid) return
        onClick(e, numStreet, setAddress, "delivery-detail-form")
        
        handlePaymentMethodModal()
        
    }


    const ValidItem = ({ item }) => {
        return (
            <div className="detail cart" key={item._id}>
                <div className="box-detail">
                    <div style={{display: 'flex'}}>
                        <div style={{display: 'flex', alignItems: 'center', width: '100px'}}>
                            <img src={item.images[0].url} style={{width: '100%'}}/>
                        </div>
                        <div style={{width: '100%', marginLeft: '15px'}}>
                            <h2>{item.title}</h2>
                            <h3>$ {item.price}</h3>

                            <div style={{display:'flex', alignItems:'center'}}>
                                <button style={{ background: item.color, width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #ccc' }}></button> /            
                                <strong>{item.size}</strong> 
                            </div>       
                            
                        </div>
                    </div>
                    <div className="item-amount">
                        <span>Tổng cộng: ${item.price * item.quantity}</span>
                        <span>Số lượng: x{item.quantity}</span>
                    </div>
                </div>
            </div>
        )
    }

    const handlePaymentMethodModal = () => {
        const viewbox = document.querySelector('.payment-method-option-box')
        viewbox.classList.toggle('active')
    }

    return (
        <div className="payment-modal">
            <div className="wrapper">
                <div className='heading-payment-order'>
                    <h3>ĐƠN HÀNG</h3>
                </div>
                <div className="payment-detail">
                    <div className='list-cart'>
                        {
                            cart.map(product => (
                                product.isPublished && product.countInStock > 0 ?
                                    <ValidItem item={product} key={product._id} /> :
                                    null
                            ))
                        }
                    </div>
                    <div>
                        <div className='payment-total-wrapper'>
                            <div className="payment-total divider">
                                <p>Đơn hàng:</p>
                                <span>$ {total}</span>
                            </div>
                            <div className='divider'>
                                <div className='discount-cost'>
                                    <p>Giảm giá:</p>
                                    <span>$0</span>
                                </div>
                                <div className='ship-cost'>
                                    <p>Phí vận chuyển:</p>
                                    <span>$0</span>
                                </div>
                            </div>
                            <div className='grand-total divider'>
                                <p>Tổng cộng:</p>
                                <span style={{ color: 'crimson' }}>$ {total}</span>
                            </div>
                        </div>
                        {/* <div className="payment-method">
                            <p style={{ color: '#555' }}>Choose payment methods: </p>
                            {
                                user.phone && user.isVerifyPhone ? 
                                <Paypal
                                    tranSuccess={tranSuccess}
                                    cart={cart}
                                /> : <span 
                                    style={{lineHeight: '50px',
                                    fontStyle: 'italic',
                                    color: '#444'}}><Link to={'/user/'}>Xác thực số điện thoại</Link> để thanh toán qua Paypal</span>
                            }

                            <button onClick={() => handleConfirmPayPalModal()}>Paypal</button>

                            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>Or</span>
                            <CodModal
                                codSuccess={codSuccess}
                                user={user}
                            />
                        </div> */}
                    </div>
                </div>
                <div className='confirm-detail-order-form'>
                    <div className='heading-detail-form'>
                        <h3>THÔNG TIN THANH TOÁN</h3>
                    </div>
                    <form className='delivery-detail-form' onSubmit = {handleSuccess}>
                        <div className="row" style={{display:'flex', justifyContent:'space-between'}}>
                            <div className="detail-form-input" style={{marginRight: '15px'}}>
                                <label htmlFor="name">Tên khách hàng</label>
                                <input style={{marginTop:'10px'}} type="text" name="name" id="name" placeholder='Họ và tên'
                                    value={detail.name}
                                    onChange={handleChangeInput}
                                />
                                <span style={{color: 'red', fontSize: '12px'}}>{validateMsg.name}</span>
                            </div>

                            <div className="detail-form-input">
                                <label htmlFor="phone">Điện thoại</label>
                                <input style={{marginTop:'10px'}} type="text" name="phone" id="phone" placeholder='Số điện thoại'
                                    value={detail.phone}
                                    onChange={handleChangeInput}
                                />
                                <span style={{color: 'red', fontSize: '12px'}}>{validateMsg.phone}</span>
                            </div>
                        </div>


                        <div className="row">
                            <label htmlFor="address">Địa chỉ</label>
                            <div id="user-address" style={{marginTop:'10px'}}>
                            {/* <a href="#!" className="change-address"
                            onClick={handleChangeAddress}>
                            <FontAwesomeIcon icon={faEdit} />
                            Thay đổi địa chỉ
                            </a> */}
                                <div className="confirm-address-select-container">
                                    <div className="confirm-address-select-item" style={{display:'flex'}}>
                                        <div style={{width: '100%'}}>
                                       
                                            <Select
                                                name="cityId"
                                                key={`cityId_${selectedCity?.value}`}
                                                isDisabled={cityOptions.length === 0}
                                                options={cityOptions}
                                                onChange={(option) => onCitySelect(option)}
                                                placeholder="Tỉnh/Thành"
                                                defaultValue={selectedCity}
                                                styles={customStyle}
                                            />
                                            <span style={{color: 'red', fontSize: '12px'}}>{validateMsg.city}</span>
                                        </div>
                                        <div style={{width: '100%', margin: '0 15px'}}>
                                      
                                            <Select
                                                name="districtId"
                                                key={`districtId_${selectedDistrict?.value}`}
                                                isDisabled={districtOptions.length === 0}
                                                options={districtOptions}
                                                onChange={(option) => onDistrictSelect(option)}
                                                placeholder="Quận/Huyện"
                                                defaultValue={selectedDistrict}
                                                styles={customStyle}
                                            />
                                            <span style={{color: 'red', fontSize: '12px'}}>{validateMsg.district}</span>
                                        </div>
                                        <div style={{width: '100%'}}>
                                       
                                            <Select
                                                name="wardId"
                                                key={`wardId_${selectedWard?.value}`}
                                                isDisabled={wardOptions.length === 0}
                                                options={wardOptions}
                                                placeholder="Phường/Xã"
                                                onChange={(option) => onWardSelect(option)}
                                                defaultValue={selectedWard}
                                                styles={customStyle}
                                            />
                                            <span style={{color: 'red', fontSize: '12px'}}>{validateMsg.ward}</span>
                                        </div>
                                    </div>
                                           
                                    <input type="text" placeholder="Số nhà/đường..."
                                        value={numStreet || ''}
                                        onChange={e => setNumStreet(e.target.value)}
                                        className="address-detail-input" />
                                    <span style={{color: 'red', fontSize: '12px'}}>{validateMsg.numstreet}</span>
                                </div>
                            </div>
                        </div>
                    <button type="submit" className='delivery-confirm'>Thanh toán</button>
                    </form>
                </div>
                <div className="payment-close" onClick={closePayment}>
                    <FaIcons.FaRegTimesCircle style={{ color: 'crimson' }} />
                </div>
                
            </div>
     
            <div className='payment-method-option-box'>
                <PaymentMethodOptions 
                    user={user}
                    tranSuccess = {tranSuccess}
                    cart={cart}
                    codSuccess={codSuccess}
                    address={address}
                    detail={detail}
                />  
            </div>
        </div >

    )
}

export default Payment