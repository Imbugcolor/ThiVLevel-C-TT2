import React, { useContext, useState, useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import Payment from './Payment'
import { toast } from 'react-toastify';
import * as RiIcons from 'react-icons/ri'
import Swal from 'sweetalert2'
import { GrFormSubtract } from 'react-icons/gr'
import { FiPlus } from 'react-icons/fi'
import Loading from '../utils/loading/Loading'

function Cart() {
  const state = useContext(GlobalState)
  const [cart, setCart] = state.userAPI.cart
  const [products] = state.productsAPI.allProducts
  const [loadingItem] = state.productsAPI.loadingItem
  const [callback, setCallback] = state.productsAPI.callback
  const [loading, setLoading] = state.userAPI.loading
  const [user] = state.userAPI.user
  const [token] = state.token
  const [total, setTotal] = useState(0)
  const [canBuy, setCanBuy] = useState(false)
  const [checkButton, setCheckButton] = useState(false)
  const [isInStock, setIsInStock] = useState(true)

  const location = useLocation()
  const queryParameters = new URLSearchParams(location.search)

  const [page, setPage] = useState(0)

  useEffect(() => {
    const getTotal = () => {
      const total = cart.reduce((result, item) => {
        return item.isPublished && item.countInStock > 0 ? result + (item.price * item.quantity) : result
      }, 0)
      setTotal(total.toFixed(2))
    }
    getTotal()

  }, [cart])

  useEffect(()=> {
    if(queryParameters.get('success') === 'true'){
      Swal.fire({
        width: 500,
        icon: 'success',
        title: `<span class='title-msg-dialog'>Đặt hàng thành công.</span>`,
        showConfirmButton: true,
        timer: 3000
      })
    }
    if(queryParameters.get('canceled') === 'true'){
      Swal.fire({
        width: 500,
        icon: 'warning',
        title: `<span class='title-msg-dialog'>Đặt hàng thất bại.</span>`,
        showConfirmButton: true,
        timer: 3000
      })
    }
    if(performance.navigation.type == 2){
      window.location = window.location
    }
  },[])

  useEffect(() => {

    if (cart.length > 0) {
      const checkConditions = () => {
        cart.forEach(item => checkProduct(item))
        let countItemCanBuy = cart.reduce((amount, item) => {
          return item.isPublished && item.countInStock > 0 ? amount + 1 : amount
        }, 0)
        if (countItemCanBuy === 0) {
          Swal.fire({
            width: 500,
            icon: 'warning',
            title: 'Giỏ hàng không hợp lệ!',
            text: 'Các sản phẩm trong giỏ hàng không còn tồn tại.',
            showConfirmButton: true,
          })
          return false;
        }
        let prodOutStock;
        const isValid = () => {
          let count = 0;
          cart.forEach(item => {
              products.find(p => {
                if (p.product_id === item.product_id && item.isPublished) {
                  const totalQuantity = cart.reduce((acc, curr) => {
                    return (curr.product_id === p.product_id) ? acc + curr.quantity : acc
                  }, 0)
                  if (p.countInStock < totalQuantity) {
                    count = count +1;
                    prodOutStock = p.title
                    return false
        
                  }
                }
              })
            })
        if(count > 0) return false
        return true
        }
        if(!isValid()) {
          Swal.fire({
            width: 500,
            icon: 'warning',
            title: `<span class='title-msg-dialog'>Sản phẩm ${prodOutStock} không đủ sl</span>`,
            showConfirmButton: true,
          })
          return false 
        }
        return true
      }
      if (checkButton) {
        if (checkConditions()) setCanBuy(true)
        else
          setCanBuy(false)
      } else
        checkConditions()
    }
  }, [products])

  const addToCart = async (cart) => {
    await axios.patch('/user/addcart', { cart }, {
      headers: { Authorization: token }
    })
  }

  const increment = (id) => {
    cart.forEach(item => {
      products.find(p => {
        if (p.product_id === item.product_id) {
          const totalQuantity = cart.reduce((acc, curr) => {
            return (curr.product_id === p.product_id) ? acc + curr.quantity : acc
          }, 0)
          if (item._id === id) {
            return p.countInStock <= totalQuantity ? item.quantity : item.quantity += 1
          }
        }
      })
    })

    setCart([...cart])
    addToCart(cart)
  }

  const decrement = (id) => {
    cart.forEach(item => {
      if (item._id === id) {
        item.quantity === 1 ? item.quantity = 1 : item.quantity -= 1
      }
    })

    setCart([...cart])
    addToCart(cart)
  }

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn-ok',
      cancelButton: 'btn-cancel-swal btn-mg-r'
    },
    buttonsStyling: false
  })
  

  const removeProduct = (id) => {   
      swalWithBootstrapButtons.fire({
        title: 'Xóa sản phẩm?',
        text: "Sản phẩm đã xóa sẽ không thể phục hồi!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          cart.forEach((item, index) => {
            if (item._id === id) {
              item.quantity = 0
              cart.splice(index, 1)
            }
          })
          setCart([...cart])
          addToCart(cart)
          swalWithBootstrapButtons.fire(
            'Đã xóa!',
            'Sản phẩm đã bị xóa khỏi giỏ hàng.',
            'success'
          )
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Đã hủy xóa!',
            'Sản phẩm vẫn ở trong giỏ hàng.',
            'error'
          )
        }
      })
  }


  const tranSuccess = async (payment, detail, address) => {

    const { id, purchase_units } = payment
    const { name, phone } = detail
    const paymentID = id

    console.log(address)
    // const address = purchase_units[0].shipping.address
    // address.recipient_name = purchase_units[0].shipping.name.full_name
    // const name = purchase_units[0].shipping.name.full_name
    // const phone = user.phone
    const method = 'Paypal'
    const isPaid = true
    const total = purchase_units[0].amount.value

    await axios.post('/api/payment', { cart: cart.filter(item => item.isPublished === true && item.countInStock > 0), paymentID, name, phone, address, total, method, isPaid }, {
      headers: { Authorization: token }
    })

    setCart([])
    addToCart([])

    Swal.fire({
      width: 500,
      icon: 'success',
      title: `<span class='title-msg-dialog'>Đặt hàng thành công.</span>`,
      showConfirmButton: true,
      timer: 3000
    })

    document.body.style.overflow = '';
  }

  const codSuccess = async (payment, address) => {

    const { name, phone } = payment
    const method = 'COD'
    const isPaid = false
    const total1 = total

    await axios.post('/api/paymentCOD', { cart: cart.filter(item => item.isPublished === true && item.countInStock > 0), name, phone, address, total: total1, method, isPaid }, {
      headers: { Authorization: token }
    })

    setCart([])
    addToCart([])
    
    Swal.fire({
      width: 500,
      icon: 'success',
      title: `<span class='title-msg-dialog'>Đặt hàng thành công.</span>`,
      showConfirmButton: true,
      timer: 3000
    })

    document.body.style.overflow = '';
  }



  const CartItem = ({ item }) => {
    return (
      <div className="detail cart" key={item._id}>
        <div className='product-images'>
          <img src={item.images[0].url} alt="" />
        </div>
        <div className="box-detail">
          <h2>{item.title}</h2>
          <h3>$ {item.price}</h3>
          {
            item.color ?
              <div className="product-color">
                Màu sắc: <button style={{ background: item.color, width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ccc' }}
                ></button>
              </div> : <div>Color: No Available</div>
          }
          {
            item.size ?
              <strong>Size: {item.size}</strong> : <strong>Size: No Available</strong>
          }
          <div className='product-in-stock'>
            <span>SL trong kho:</span>
            <h4>{item.countInStock}</h4> 
          </div>
          <div className="amount">         
            <div className='quantity__controll_wrapper'>       
              <button onClick={() => decrement(item._id)}><GrFormSubtract /></button>
              <span>{item.quantity}</span>
              <button onClick={() => increment(item._id)}><FiPlus /></button>
            </div>
            <div className='total_num_bottom'>
              <span>Tổng cộng:</span>
              <h4>${(item.price * item.quantity).toFixed(2)}</h4>  
            </div>
          </div>

        </div>
        { item.isPublished ||
          <div className="unvailible-layer">
            <span>Không có sẵn</span>
          </div>
        }
       
        {
          item.countInStock  > 0 ||
          <div className="unvailible-layer">
            <span>Đã hết hàng</span>
          </div> 
        }
        <div className="delete" onClick={() => removeProduct(item._id)}><RiIcons.RiDeleteBinFill /></div>
      </div>
    )
  }

  const updateCartItem = (id, prop, newValue) => {
    cart.forEach((item, index) => {
      if (item._id === id) {
        cart[index][prop] = newValue;
      }
    })
    setCart([...cart])
    addToCart(cart)
  }

  const checkProduct = (product) => {
    const checkItem = products.find(p => {
      if (p.product_id === product.product_id) {
        if (p.countInStock <= 0) {
          updateCartItem(product._id, "countInStock", p.countInStock)    
        }
        if (p.countInStock > 0) {
          updateCartItem(product._id, "countInStock", p.countInStock)
        }
        if (product.price !== p.price) {
          updateCartItem(product._id, "price", p.price)
          toast.warning('Giỏ hàng đã có sự thay đổi về giá!', {
            position: "top-center",
            autoClose: 3000
          });
        }
        if ((product.isPublished !== p.isPublished)) {
          updateCartItem(product._id, "isPublished", p.isPublished)
          if (!product.isPublished)
            toast.warning(`Sản phẩm ${p.title} không tồn tại!`, {
              position: "top-center",
              autoClose: 3000
            });
        }
      }
      return p.product_id === product.product_id
    })
    if (typeof checkItem === 'undefined') {
      updateCartItem(product._id, "isPublished", false)
      toast.warning(`Sản phẩm ${product.title} không tồn tại!`, {
        position: "top-center",
        autoClose: 3000
      });
    }
  }

  const handleBuyClick = (e) => {
    e.preventDefault()

    setCallback(!callback)
    setCheckButton(true)
    
    setPage(1)

  }

  const closePayment = () => {
    setCanBuy(false)
    setCheckButton(false)
  }


  if (cart.length === 0) {
    const style = {
      display: 'block',
      width: '100%',
      height: '600px',
      objectFit: 'contain'
    }
    return (
      <div style={{ width: "100%", textAlign: 'center' }} >
        <img draggable={false} style={style}
          src="https://rtworkspace.com/wp-content/plugins/rtworkspace-ecommerce-wp-plugin/assets/img/empty-cart.png" alt="" />
      </div>
    )
  }

  return (
    loading ? <div><Loading /></div> :
    page === 1 && canBuy ? <Payment 
    total={total}
    tranSuccess={tranSuccess}
    cart={cart}
    codSuccess={codSuccess}
    user={user}
    closePayment={closePayment}
    /> :
    <div className="res-row">
      <h2 className="cart-heading col l-12 m-12 c-12">
        <FontAwesomeIcon icon={faCartShopping} style={{ paddingRight: 10 }} />
        Giỏ hàng
      </h2>
      <div className='cart-wrapper col l-12 m-12 c-12'>
        <div className="res-row">
          <div className='list-cart col l-8 m-8 c-12 '>
            {
              cart.map(item =>
                <CartItem item={item} key={item._id} />
              )
            }
          </div>
          <div className='payment col l-4 m-4 c-12 '>
            <div className="total divider">
              <p>Đơn hàng:</p>
              <span>$ {total}</span>
            </div>
            <div className='divider'>
              <div className='discount-cost'>
                <p>Giảm giá:</p>
                <span>$ 0</span>
              </div>
              <div className='ship-cost'>
                <p>Phí vận chuyển:</p>
                <span>$ 0</span>
              </div>
            </div>
            <div className='grand-total divider'>
              <p>Tổng cộng:</p>
              <span style={{ color: '#d93938' }}>$ {total}</span>
            </div>

            <button
              className="payment-buy-btn" onClick={handleBuyClick} >
              {
                loadingItem ?
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin" /> :
                  "Tiếp tục thanh toán"           
              }
            </button>
          </div>
        </div>
      </div>
      {/* <div className={`payment-modal-container ${canBuy ? 'active' : ''}`} ref={paymentRef}>
        <Payment
          total={total}
          tranSuccess={tranSuccess}
          cart={cart}
          codSuccess={codSuccess}
          user={user}
          closePayment={closePayment}
        />
      </div> */}
    </div>
  )
}

export default Cart