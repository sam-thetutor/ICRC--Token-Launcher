import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import SharedLayout from './pages/SharedLayout'
import TokenPage from './pages/TokenPage'
import Header from './components/Header'
import CreateToken from './pages/CreateToken'
import MyTokens from './pages/MyTokens'

const App = () => {
  return (
    < >
    <Header/>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Login />} />
          <Route path="dashboard" element={<SharedLayout />}>
          <Route index element={<CreateToken />} />
          <Route path="create" element={<CreateToken/>}/>
          <Route path="mytokens" element={<MyTokens/>}/>
          <Route path="mytokens/:tokenId" element={<TokenPage/>}/>
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
