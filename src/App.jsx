import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MasterTrackerPage from './pages/MasterTrackerPage'
import EstateAuditPage from './pages/EstateAuditPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/master-tracker" element={<MasterTrackerPage />} />
      <Route path="/estate-audit" element={<EstateAuditPage />} />
    </Routes>
  )
}
