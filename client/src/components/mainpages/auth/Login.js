import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import jwt_decode from 'jwt-decode'

function Login() {
  const [user, setUser] = useState({
    email: '',
    password: ''
  })
  const [validateMsg, setValidateMsg] = useState('')

  const validate = () => {
    const msg = {}

    if(!user.email) {
      msg.email = '*Bạn chưa nhập email'
    } else if (!user.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      msg.email = '*Email không hợp lệ'
    }

    if(!user.password) {
      msg.password = '*Bạn chưa nhập mật khẩu'
    } else if (user.password.length < 6) {
      msg.password = '*Mật khẩu phải có độ dài tối thiểu 6 ký tự'
    }

    setValidateMsg(msg)
    if(Object.keys(msg).length > 0) return false
    return true
  }

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const loginSubmit = async (e) => {
    e.preventDefault()
    const isValid = validate()
    if(!isValid) return
    try {
      await axios.post('/user/login', { ...user })

      localStorage.setItem('firstLogin', true)

      window.location.href = "/"
    } catch (err) {
      toast.error(err.response.data.msg, {
        position: "top-center",
        autoClose: 3000
      })
    }
  }

  const responseGoogleSuccess = async (res) => {
    const accessToken  = res.jti
    try {
      const { name, email, picture } = res
      await axios.post('/user/googleauth', { name, email, imageUrl: picture, accessToken })

      localStorage.setItem('firstLogin', true)

      window.location.href = "/"
    } catch (err) {
      console.log(err)
    }
  }

  const responseGoogleFailure = (err) => {
    console.log(err)
  }


  return (
    <div className="login-page">
      <form onSubmit={loginSubmit} className="form-signin-signout">
        <h2>Đăng nhập</h2>
        <label>Email</label>
        <input type="text" name="email"
          value={user.email}
          onChange={onChangeInput}
        />
        <span style={{color: 'red'}}>{validateMsg.email}</span>

        <label>Mật khẩu</label>
        <input type="password" name="password"
          value={user.password}
          autoComplete="on"
          onChange={onChangeInput}
        />
        <span style={{color: 'red'}}>{validateMsg.password}</span>

        <div className="row">
          <button type="submit">Đăng nhập</button>
          <span>Chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link></span>
        </div>

        <div className="row">
          <span><Link to="/forgotpassword">Quên mật khẩu</Link></span>
        </div>
      </form>
      <div className="signin-with-social">
        <span>Hoặc đăng nhập với</span>
        <div className='google-login-button-wrapper'>
          <GoogleLogin
            onSuccess={credentialResponse => {
              const data = jwt_decode(credentialResponse.credential)
              responseGoogleSuccess(data)
            }}
            onError={() => {
              responseGoogleFailure('login failed!')
            }}
          />
        </div>
      </div>
   
    </div>
  )
}

export default Login