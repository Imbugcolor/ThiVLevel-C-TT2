import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../../GlobalState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faTruck, faMapLocation } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import axios from 'axios'
import moment from 'moment'

function OrderDetails() {
    const state = useContext(GlobalState)
    const [history] = state.userAPI.history
    const [token] = state.token
    const [orderDetails, setOrderDetails] = useState([])


    const params = useParams()
    useEffect(() => {
        if (params.id) {
            history.forEach(item => {
                if (item._id === params.id) setOrderDetails(item)
            })
        }
    }, [params.id, history])

    const handleCancelOrder = async () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
            try {
                await axios.patch(`/api/payment/cancel/${orderDetails._id}`, { cancel: 'Cancel' }, {
                    headers: { Authorization: token }
                })

                toast.success('Hủy đơn hàng thành công.', {
                    position: "top-center",
                    autoClose: 3000
                })

            } catch (err) {
                toast.error(err.response.data.msg, {
                    position: "top-center",
                    autoClose: 3000
                })
            }
        }
    }

    if (orderDetails.length === 0) return null;
    return (
        <div className="history-page res-row">
            <div className="order-infor-container col l-12 m-12 c-12">
                <div className="res-row">
                    <div className="order-infor col l-4 m-4 c-12">
                        <div className="thumbnail">
                            <span>
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                        </div>
                        <div className="infor name">
                            <span>Người nhận: {orderDetails.address.recipient_name || orderDetails.name}</span>
                            <span>Email: {orderDetails.email}</span>
                            <span>Số điện thoại: +84 {orderDetails.phone}</span>
                        </div>
                    </div>
                    <div className="order-infor col l-4 m-4 c-12">
                        <div className="thumbnail">
                            <span>
                                <FontAwesomeIcon icon={faTruck} />
                            </span>
                        </div>
                        <div className="infor status">
                            <span>Trạng thái: {orderDetails.status}</span>
                            <span>Phương thức thanh toán: {orderDetails.method}</span>
                        </div>
                    </div>
                    <div className="order-infor col l-4 m-4 c-12">
                        <div className="thumbnail">
                            <span>
                                <FontAwesomeIcon icon={faMapLocation} />
                            </span>
                        </div>
                        <div className="infor address">
                            <span>
                                Địa chỉ nhận hàng:
                                {
                                    orderDetails.method === 'Paypal' ? ` ${orderDetails.address.address_line_1}, ${orderDetails.address.admin_area_2}` :
                                        ` ${(orderDetails.address.detailAddress || '')} ${orderDetails.address.ward.label}, ${orderDetails.address.district.label}, ${orderDetails.address.city.label}`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="order-detail col l-12 m-12 c-12">
                <div className="res-row">
                    <div className='list-product-order-client col l-9 m-12 c-12'>
                        <table className="oder-product-list-table">
                            <thead className="table-header">
                                <tr>
                                    <th>STT</th>
                                    <th>SẢN PHẨM</th>
                                    <th>SIZE/MÀU</th>
                                    <th>SỐ LƯỢNG</th>
                                    <th>GIÁ</th>
                                    <th>TỔNG CỘNG</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {
                                    orderDetails.cart?.map((item, index) => {
                                        if (item.quantity > 0) {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className='table-product-column'>
                                                            <img className='table-thumbnail-product' src={item.images[0].url} alt='hinh'></img>
                                                            <span style={{ marginLeft: 5}} >{item.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className='table-product-column flx-center'>
                                                        <span>{item.size} - </span>
                                                        <div style={{ backgroundColor: `${item.color}`, width: '15px', height: '15px', border: '1px solid #ccc' }}></div>
                                                    </td>
                                                    <td className='table-quantity'>{item.quantity}</td>
                                                    <td className='table-item-price'>${item.price}</td>
                                                    <td className='table-amount'>${item.quantity * item.price}</td>
                                                </tr>
                                            )
                                        } else return null
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className='pay-infor-wrapper col l-3 m-12 c-12'>
                        <div className="pay-infor">

                            <div className="item fw600">
                                <div>Mã đơn</div>
                                <div style={{ textTransform: 'uppercase', wordBreak: 'break-word' }}>{orderDetails._id}</div>
                            </div>
                            <div className="item fw600">
                                <div>Ngày đặt</div>
                                <div>{new Date(orderDetails.createdAt).toLocaleDateString()} {moment(orderDetails.createdAt).format('LT')}</div>
                            </div>
                            <div className="divider"></div>
                            <div className="item">
                                <div>Tổng cộng</div>
                                <div>${orderDetails.total}</div>
                            </div>
                            <div className="item">
                                <div>Phí vận chuyển</div>
                                <div>$0</div>
                            </div>
                            <div className="item">
                                <div>Phương thức thanh toán</div>
                                <div>{orderDetails.method}</div>
                            </div>
                            {
                                orderDetails.method === 'Paypal' ?
                                    <div className="item">
                                        <div>Mã thanh toán</div>
                                        <div>{orderDetails.paymentID}</div>
                                    </div>
                                    : ''
                            }
                            <div className="divider"></div>
                            <div className="item fw600">
                                <div>Tổng thanh toán</div>
                                <div style={{ color: '#d93938' }}>${orderDetails.total}</div>
                            </div>
                            <div className="item fw600">
                                <div>Thời gian thanh toán</div>
                                <div>
                                    {orderDetails.isPaid === true ?
                                        `Đã thanh toán vào ${new Date(orderDetails.updatedAt).toLocaleDateString() + ' ' + moment(orderDetails.updatedAt).format('LT')}`
                                        :  'Chưa thanh toán'
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            orderDetails.status === 'Delivered' ? 
                            <div className='complete-order-noti'>
                                <button disabled>Đã hoàn thành</button>
                            </div> :
                            orderDetails.status === 'Processing' || orderDetails.status === 'Shipping' || orderDetails.status === 'Cancel' ?                    
                            <div className='cancel-order-disabled'>
                                <button onClick={handleCancelOrder} className='disabled-btn' disabled>Hủy đơn hàng</button>
                            </div> :
                            <div className='cancel-order'>
                                <button onClick={handleCancelOrder} >Hủy đơn hàng</button>
                            </div> 
                          
                        }
                        
                    </div>
                </div>
            </div>

        </div>
    )
}

export default OrderDetails