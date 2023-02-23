import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

function Register() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    verify_password: ''
  })

  const [validateMsg, setValidateMsg] = useState('')

  const validate = () => {
    const msg = {}
    if(!user.username) {
      msg.username = '*Bạn chưa nhập username'
    } 
    if(!user.email) {
      msg.email = '*Bạn chưa nhập email'
    } else if (!user.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      msg.email = '*Email không hợp lệ'
    }

    if(!user.password) {
      msg.password = '*Bạn chưa nhập mật khẩu'
    } else if (user.password.length < 6) {
      msg.password = '*Mật khẩu phải có độ dài tối thiểu 6 ký tự'
    } else if (user.password.match(/^(?=.*\s)/)) {
      msg.password = '*Mật khẩu không được chứa khoảng cách'
    } else if (!user.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)) {
      msg.password = '*Mật khẩu phải chứa chữ cái in hoa, chữ cái thường và chữ số'
    }

    if(!user.verify_password) {
      msg.verify_password = '*Bạn chưa nhập xác nhận lại mật khẩu'
    } else if (user.password !== user.verify_password) {
      msg.verify_password = '*Xác nhạn lại mật khẩu chưa chính xác'
    }

    setValidateMsg(msg)
    if(Object.keys(msg).length > 0) return false
    return true
  }

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const registerSubmit = async (e) => {
    e.preventDefault()
    const isValid = validate()
    if(!isValid) return
    try {
      await axios.post('/user/register', { ...user })

      localStorage.setItem('firstLogin', true)

      window.location.href = "/"
    } catch (error) {
      toast.error(error.response.data.msg, {
        position: "top-center",
        autoClose: 3000
      })
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={registerSubmit} className="form-signin-signout">
        <h2>Đăng ký</h2>

        <label>Tên tài khoản</label>
        <input type="text" name="username"
          value={user.username}
          onChange={onChangeInput}
        />
        <span style={{color: 'red'}}>{validateMsg.username}</span>

        <label>Email</label>
        <input type="text" name="email"
          value={user.email}
          onChange={onChangeInput}
        />
        <span style={{color: 'red'}}>{validateMsg.email}</span>

        <label>Mật khẩu</label>
        <input type="password" name="password"
          value={user.password}
          onChange={onChangeInput}
        />
        <span style={{color: 'red'}}>{validateMsg.password}</span>

        <label>Xác nhận mật khẩu</label>
        <input type="password" name="verify_password"
          value={user.verify_password}
          onChange={onChangeInput}
        />
        <span style={{color: 'red'}}>{validateMsg.verify_password}</span>
        
        <div className="row">
          <button type="submit">Đăng ký</button>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  )
}

export default Register