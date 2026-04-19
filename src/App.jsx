import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import BlueprintViewer from './pages/BlueprintViewer'
import HelicopterLab from './pages/HelicopterLab'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/blueprint/:blueprintId" element={<BlueprintViewer />} />
      <Route path="/heli-lab" element={<HelicopterLab />} />
    </Routes>
  )
}
