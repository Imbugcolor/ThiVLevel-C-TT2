import React from 'react'
import { FaRegTimesCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Paypal from '../../cart/Paypal'

function PaymentMethodOptions({user, cart, tranSuccess, codSuccess, address, detail}) {
    
    const handleCloseView = (e) => {
        e.preventDefault()
        const viewbox = document.querySelector('.payment-method-option-box')
        viewbox.classList.remove('active')
    }

    const handlePaymentCOD = () => {
        codSuccess(detail, address)
    }

   
  return (
    <div className='payment-method-options-modal'>
        <div className="payment-method">
            <p style={{ color: '#555' }}>Chọn hình thức thanh toán: </p>
            <button className='cod-btn-confirm' onClick={handlePaymentCOD}>Thanh toán khi giao hàng (COD)</button>
            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>Hoặc</span>
            {
                user.phone && user.isVerifyPhone ? 
                <Paypal
                    tranSuccess={tranSuccess}
                    cart={cart}
                    address={address}
                    detail={detail}
                /> : <span 
                    style={{lineHeight: '50px',
                    fontStyle: 'italic',
                    color: '#444'}}><Link to={'/user/'}>Xác thực số điện thoại</Link> để thanh toán qua Paypal</span>
            }
            <div className="payment-method-options-modal-close" onClick={handleCloseView}>
                    <FaRegTimesCircle style={{ color: '#d93938' }} />
            </div>
        </div> 
    </div>
  )
}

export default PaymentMethodOptions
