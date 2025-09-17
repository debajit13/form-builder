import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { FormBuilderPage } from './pages/FormBuilderPage'
import { FormPreviewPage } from './pages/FormPreviewPage'
import { DataManagementPage } from './pages/DataManagementPage'
// Import sample data to auto-populate in development
import './utils/sampleData'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Form Builder Routes */}
          <Route path="builder" element={<FormBuilderPage />} />
          <Route path="builder/:action" element={<FormBuilderPage />} />
          <Route path="builder/:action/:id" element={<FormBuilderPage />} />

          {/* Form Preview Routes */}
          <Route path="preview" element={<FormPreviewPage />} />
          <Route path="preview/form" element={<FormPreviewPage />} />
          <Route path="preview/form/:id" element={<FormPreviewPage />} />

          {/* Data Management Routes */}
          <Route path="data" element={<DataManagementPage />} />
          <Route path="data/submissions/:id" element={<div className="text-center py-12"><h2 className="text-xl font-semibold text-gray-900">Submission Details</h2><p className="text-gray-600 mt-2">Detailed submission view will be implemented here.</p></div>} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  )
}

export default App