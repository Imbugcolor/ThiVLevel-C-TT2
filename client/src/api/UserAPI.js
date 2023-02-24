import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'

function UserAPI(token) {
    const [isLogged, setIsLogged] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [cart, setCart] = useState([])
    const [history, setHistory] = useState([])
    const [user, setUser] = useState([])
    const [callback, setCallback] = useState(false)
    const [allUser, setAllUser] = useState([])
    const [allUserCopy, setAllUserCopy] = useState([])
    const [allStaff, setAllStaff] = useState([])
    const [allStaffCopy, setAllStaffCopy] = useState([])

    useEffect(() => {
        if (token) {
            const getUser = async () => {
                try {
                    const res = await axios.get('/user/infor', {
                        headers: { Authorization: token }
                    })

                    setIsLogged(true)
                    res.data.role === 1 ? setIsAdmin(true) : setIsAdmin(false)
                    setUser(res.data)
                    setCart(res.data.cart)

                    if(res.data.role === 1)
                    {
                        const getAllUser = async () => {
                            try {
                                const res = await axios.get('/user/alluser?role=0', {
                                    headers: { Authorization: token }
                                })

                                setAllUser(res.data)
                                setAllUserCopy(res.data)

                            } catch (err) {
                                alert(err.response.data.msg)
                            }
                        }
                        getAllUser()
                        
                        const getAllStaff = async () => {
                            try {
                                const res = await axios.get('/user/alluser?role=1', {
                                    headers: { Authorization: token }
                                })

                                setAllStaff(res.data)
                                setAllStaffCopy(res.data)

                            } catch (err) {
                                alert(err.response.data.msg)
                            }
                        }
                        getAllStaff()
                     }
                } catch (err) {
                    alert(err.response.data.msg)
                }
            }
            getUser()
        
        }
        
    }, [token, callback])

    const addCart = async (product, color, size, quantity) => {
        if (!isLogged) return Swal.fire({
            title: 'Đăng nhập để tiếp tục?',
            showCancelButton: true,
            confirmButtonText: 'Login',
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                window.location.href = "/login"
            } else if (result.isDenied) {
              
            }
          })

        if(product.countInStock < quantity ) return  Swal.fire({
            width: 400,
            icon: 'warning',
            title: 'Sản phẩm không đủ số lượng đáp ứng!',
            showConfirmButton: true,
        })

        const check = cart.every(item => {
            return item.product_id !== product.product_id || 
            (item.product_id === product.product_id && (item.color !== color && item.size === size)) ||
            (item.product_id === product.product_id && (item.color === color && item.size !== size)) ||
            (item.product_id === product.product_id && (item.color !== color && item.size !== size))
        })
        
        const totalQuantity = cart.reduce((acc, curr) => {
            return (curr.product_id === product.product_id) ? acc + curr.quantity : acc 
        }, 0)


        if(product.countInStock < totalQuantity + quantity) return  Swal.fire({
            width: 400,
            icon: 'warning',
            title: 'Sản phẩm không đủ số lượng đáp ứng!',
            showConfirmButton: true,
        })

        const guid = () => {
            const s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
            return s4() + s4() + s4() + s4() + s4() + s4()
        }

        if (check) {
            setCart([...cart, { ...product, _id: guid(), color, size, quantity }])
            await axios.patch('/user/addcart', {
                cart: [...cart, { ...product, _id: guid(), color, size, quantity }]
            }, {
                headers: { Authorization: token }
            })
            Swal.fire({
                width: 500,
                icon: 'success',
                title: 'Thêm vào giỏ hàng thành công!',
                showConfirmButton: true,
                timer: 1500
            })
        } else {
            Swal.fire({
                width: 400,
                icon: 'warning',
                title: 'Sản phẩm đã có sẵn trong giỏ hàng!',
                showConfirmButton: true,
            })
        }
    }
    return {
        isLogged: [isLogged, setIsLogged],
        isAdmin: [isAdmin, setIsAdmin],
        callback: [callback, setCallback],
        cart: [cart, setCart],
        addCart: addCart,
        history: [history, setHistory],
        user: [user, setUser],
        allUser: [allUser, setAllUser],
        allUserCopy: [allUserCopy, setAllUserCopy],
        allStaff: [allStaff, setAllStaff],
        allStaffCopy: [allStaffCopy, setAllStaffCopy]
    }
}

export default UserAPI