import { useState } from 'react'
import { Upload, FileSpreadsheet, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

function UploadSection({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length === 0) {
          toast.error('A planilha está vazia!')
          return
        }
        
        onFileUpload(jsonData)
        toast.success(`${jsonData.length} participantes carregados com sucesso!`)
      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
        toast.error('Erro ao processar o arquivo. Verifique o formato.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        Nome: 'João Silva',
        CPF: '123.456.789-00',
        Email: 'joao@email.com',
        Telefone: '(11) 98765-4321',
        Conta: '12345-6'
      },
      {
        Nome: 'Maria Santos',
        CPF: '987.654.321-00',
        Email: 'maria@email.com',
        Telefone: '(11) 91234-5678',
        Conta: '65432-1'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes')
    XLSX.writeFile(workbook, 'template_participantes.xlsx')
    toast.info('Template baixado com sucesso!')
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Gerenciar Participantes
          </h2>

          <div className="mb-8 text-center">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={20} />
              Baixar Template Excel
            </button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-4 border-dashed rounded-lg p-12 text-center transition ${
              isDragging
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              Arraste e solte a planilha aqui
            </h3>
            <p className="text-gray-500 mb-6">
              ou clique no botão abaixo para selecionar
            </p>
            <label className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer">
              <Upload size={20} />
              Selecionar Arquivo
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Formatos aceitos: .xlsx, .xls
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UploadSection
