import { useState } from 'react'
import { Search, Download, Users, Funnel } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

function ParticipantsTable({ participants }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState('Nome')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredParticipants = participants.filter((participant) =>
    Object.values(participant).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    const aValue = String(a[sortField] || '')
    const bValue = String(b[sortField] || '')
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedParticipants.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedParticipants.length / itemsPerPage)

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedParticipants)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes')
    XLSX.writeFile(workbook, `participantes_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Lista exportada com sucesso!')
  }

  const columns = participants.length > 0 ? Object.keys(participants[0]) : []

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Users className="text-green-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">
                Lista de Participantes
              </h2>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Funnel size={20} />
              <span className="font-semibold">
                {sortedParticipants.length} participante(s)
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar participante..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download size={20} />
              Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  {columns.map((column) => (
                    <th
                      key={column}
                      onClick={() => handleSort(column)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center gap-2">
                        {column}
                        {sortField === column && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((participant, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    {columns.map((column) => (
                      <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {participant[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Anterior
              </button>
              <span className="text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ParticipantsTable
