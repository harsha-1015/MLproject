import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Home from './Home'
import Calculate from './Calculate';

function App() {

  return (
    <>
      
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/calculate' element={<Calculate/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
