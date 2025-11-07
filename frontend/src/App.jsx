import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="text-center p-8 bg-blue-600 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold">Tailwind is working 🎉</h1>
    </div>
    </>
  )
}

export default App
