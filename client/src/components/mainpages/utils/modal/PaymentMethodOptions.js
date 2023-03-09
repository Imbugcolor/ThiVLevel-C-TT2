import React, { useContext } from 'react'
import { GlobalState } from '../../../../GlobalState'
import axios from 'axios'
import { FaRegTimesCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Paypal from '../../cart/Paypal'

function PaymentMethodOptions({user, cart, tranSuccess, codSuccess, address, detail}) {
    const state = useContext(GlobalState)
    const [token] = state.token
    const cartItems = []

    cart.map(item => {
        const { product_id, size, color, price, quantity } = item
        const obj = { product_id, size, color, price, quantity }
        cartItems.push(obj)
    })

    const handleCloseView = (e) => {
        e.preventDefault()
        const viewbox = document.querySelector('.payment-method-option-box')
        viewbox.classList.remove('active')
    }

    const handlePaymentCOD = () => {
        codSuccess(detail, address)
    }

    const checkoutStripeHandle = async() => {
        try {
            const checkout = await axios.post('/api/create-checkout-session', { items: cart.filter(item => item.isPublished === true && item.countInStock > 0), cartItems, name: detail.name, phone: detail.phone, address}, {
                headers: { Authorization: token }
            })
           
            window.location = checkout.data.url

        } catch (err) {
            console.log(err.response.data.msg)
        }

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
                    color: '#444', display: 'block'}}><Link to={'/user/'}>Xác thực số điện thoại</Link> để thanh toán qua Paypal</span>
            }
            <button className='stripe-checkout' onClick={checkoutStripeHandle}>Chekout with Stripe</button>
            <div className="payment-method-options-modal-close" onClick={handleCloseView}>
                    <FaRegTimesCircle style={{ color: '#d93938' }} />
            </div>
        </div> 
    </div>
  )
}

export default PaymentMethodOptions
