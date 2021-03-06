import React, { useState, useEffect } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import BlogList from './components/BlogList'
import LogoutButton from './components/LogoutButton'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import './App.css'
import Togglable from './components/Togglable'
import { useField } from './hooks'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState({ text: '', type: '' })
  const password = useField('text')
  const username = useField('text')

  const updateBlogs = async () => {
    const newBlogs = await blogService.getAll()
    setBlogs(newBlogs.sort((a, b) => {
      return b.likes - a.likes
    }))
  }

  const updateUser = () => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }

  const updateNotification = (message, kind) => {
    setNotificationMessage({ text: message, type: kind })
    setTimeout(() => {
      setNotificationMessage({ text: '', type: '' })
    }, 3000)

  }

  useEffect(() => {
    updateBlogs()
  }, [])
  useEffect(updateUser, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username: username.value,
        password: password.value
      })
      window.localStorage.setItem(
        'loggedBloglistUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      username.reset()
      password.reset()
      updateNotification('succesfully logged in', 'success')
    } catch (exception) {
      updateNotification('wrong username or password', 'error')
    }
  }

  if (user === null) {
    return (
      <div>
        <h1>Blogs</h1>
        <Notification notification={notificationMessage} />
        <LoginForm
          username={username} password={password}
          handleLogin={handleLogin} />
      </div>
    )
  }
  return (
    <div>
      <h1>Blogs</h1>
      <Notification notification={notificationMessage} />
      <h3>{user.name} logged in</h3>
      <LogoutButton setUser={setUser} updateNotification={updateNotification} />
      <br></br>
      <br></br>
      <Togglable buttonLabel="new blog" >
        <BlogForm updateBlogs={updateBlogs} updateNotification={updateNotification} />
      </Togglable>
      <br></br>
      <BlogList blogs={blogs} logIn={user} updateBlogs={updateBlogs} />
    </div>
  )
}

export default App
