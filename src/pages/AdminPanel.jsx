import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, Upload, Download, FileText, Search, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import logoSicoob from '../assets/img/logos/logo-sicoob.png'
import ParticipantsList from '../components/admin/ParticipantsList'
import ImportData from '../components/admin/ImportData'
import ExportData from '../components/admin/ExportData'
import LogsViewer from '../components/admin/LogsViewer'

function AdminPanel() {
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('participants')
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar autenticação
    const adminAuth = localStorage.getItem('adminAuth')
    if (!adminAuth) {
      navigate('/admin')
      return
    }
    
    try {
      const adminData = JSON.parse(adminAuth)
      setAdmin(adminData)
    } catch (error) {
      console.error('Erro ao carregar dados do admin:', error)
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    toast.success('Logout realizado com sucesso!', {
      position: "top-right",
      autoClose: 3000,
    })
    navigate('/admin')
  }

  if (!admin) {
    return null
  }

  const tabs = [
    { id: 'participants', label: 'Consulta por CPF', icon: Users },
    { id: 'import', label: 'Importar Dados', icon: Upload },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'logs', label: 'Logs', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#04c8b0] to-[#03a088] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <img src={logoSicoob} alt="Sicoob" className="h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-white/90">
                  Gestão da Promoção Black Cassol
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-2 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#04c8b0] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'participants' && <ParticipantsList adminName={admin.username} />}
        {activeTab === 'import' && <ImportData adminName={admin.username} />}
        {activeTab === 'export' && <ExportData />}
        {activeTab === 'logs' && <LogsViewer />}
      </main>
    </div>
  )
}

export default AdminPanel
