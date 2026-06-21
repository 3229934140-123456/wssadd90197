import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import Overview from '@/pages/Overview'
import Stores from '@/pages/Stores'
import { Alerts } from '@/pages/Alerts'
import { Approvals } from '@/pages/Approvals'
import MemberDetail from '@/pages/MemberDetail'
import StoreDetail from '@/pages/StoreDetail'

export default function App() {
  return (
    <Router>
      <div className="bg-bg-primary min-h-screen">
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/member/:id" element={<MemberDetail />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  )
}
