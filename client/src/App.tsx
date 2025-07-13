import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Home } from './pages/Home'

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/overlord">
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App