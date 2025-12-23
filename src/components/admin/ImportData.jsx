import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

function ImportData({ adminName }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx')) {
        toast.error('Por favor, selecione um arquivo XLSX válido', {
          position: "top-right",
          autoClose: 5000,
        })
        return
      }

      setFile(selectedFile)
      setErrors([])
      setSuccess(null)
    }
  }

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // Processar dados
          const headers = jsonData[0]
          const rows = jsonData.slice(1).filter(row => row.length > 0)
          
          const processedData = rows.map(row => {
            const obj = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
          
          resolve(processedData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setUploading(true)
    setErrors([])
    setSuccess(null)

    try {
      // Ler arquivo Excel
      const excelData = await readExcelFile(file)
      
      if (excelData.length === 0) {
        toast.error('Arquivo vazio ou sem dados válidos', {
          position: "top-right",
          autoClose: 5000,
        })
        setUploading(false)
        return
      }

      // Mapear colunas para o formato esperado pelo backend
      const rows = excelData.map(row => ({
        cpf: row['CPF'] || row['cpf'] || '',
        quantidadeNumeros: row['Quantidade de Números'] || row['quantidade'] || row['quantidadeNumeros'] || ''
      }))

      // Enviar para o backend
      const response = await fetch('/server/admin/uploadCsv.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: rows,
          uploadedBy: adminName
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess({
          totalLinhas: data.totalLinhas,
          linhasProcessadas: data.linhasProcessadas,
          numerosGerados: data.numerosGerados,
          usuariosAfetados: data.usuariosAfetados
        })
        
        toast.success('✅ Planilha processada com sucesso!', {
          position: "top-right",
          autoClose: 5000,
        })

        // Limpar form
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors)
          toast.error(`❌ ${data.errors.length} erro(s) encontrado(s)`, {
            position: "top-right",
            autoClose: 5000,
          })
        } else {
          toast.error(data.message || 'Erro ao processar planilha', {
            position: "top-right",
            autoClose: 5000,
          })
        }
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      toast.error('Erro ao processar arquivo. Verifique o formato.', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setErrors([])
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Upload de Planilha XLSX</h2>
        <p className="text-gray-400">Importe dados de participantes e números da sorte</p>
      </div>

      {/* Instruções */}
      <div className="bg-blue-900/30 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
          <FileSpreadsheet size={24} />
          Formato esperado:
        </h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-[#04c8b0] font-bold">•</span>
            <span><strong className="text-[#04c8b0]">Coluna A:</strong> CPF (formato xxx.xxx.xxx-xx)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#04c8b0] font-bold">•</span>
            <span><strong className="text-[#04c8b0]">Coluna B:</strong> Quantidade de Números (ex: 10)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">⚠</span>
            <span className="text-gray-400">A chave de acesso será gerada automaticamente pelo sistema</span>
          </li>
        </ul>
      </div>

      {/* Upload Area */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#04c8b0] transition-all duration-300">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#04c8b0] to-[#03a088] rounded-2xl flex items-center justify-center">
                <Upload size={32} className="text-white" />
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <p className="text-white font-bold">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-white font-bold">Clique para selecionar um arquivo</p>
                  <p className="text-gray-400 text-sm">ou arraste e solte aqui</p>
                </div>
              )}
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#04c8b0] to-[#03a088] hover:from-[#03a088] hover:to-[#04c8b0] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={20} />
                  <span>Enviar Planilha</span>
                </>
              )}
            </button>
            
            {file && (
              <button
                onClick={clearFile}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <X size={20} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem de Sucesso */}
      {success && (
        <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={24} className="text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-green-400 font-bold text-lg mb-3">Upload realizado com sucesso!</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total de Linhas</p>
                  <p className="text-white font-bold text-2xl">{success.totalLinhas}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Processadas</p>
                  <p className="text-white font-bold text-2xl">{success.linhasProcessadas}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Números Gerados</p>
                  <p className="text-white font-bold text-2xl">{success.numerosGerados}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Usuários Afetados</p>
                  <p className="text-white font-bold text-2xl">{success.usuariosAfetados}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erros de Validação */}
      {errors.length > 0 && (
        <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-400 font-bold text-lg">Erros encontrados na validação</h3>
              <p className="text-gray-300 text-sm">{errors.length} linha(s) com erro</p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errors.map((error, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Linha {error.linha}
                  </span>
                </div>
                <ul className="space-y-1">
                  {error.erros.map((erro, idx) => (
                    <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>{erro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImportData
