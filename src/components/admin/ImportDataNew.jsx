import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Calendar, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

function ImportData({ adminName }) {
  // Estado para Upload Mensal
  const [fileMensal, setFileMensal] = useState(null)
  const [uploadingMensal, setUploadingMensal] = useState(false)
  const [errorsMensal, setErrorsMensal] = useState([])
  const [successMensal, setSuccessMensal] = useState(null)
  const [periodoMensal, setPeriodoMensal] = useState('')
  const [anoMensal, setAnoMensal] = useState(new Date().getFullYear())
  const [showConfirmMensal, setShowConfirmMensal] = useState(false)
  const fileInputMensalRef = useRef(null)

  // Estado para Upload Periódico
  const [filePeriodico, setFilePeriodico] = useState(null)
  const [uploadingPeriodico, setUploadingPeriodico] = useState(false)
  const [errorsPeriodico, setErrorsPeriodico] = useState([])
  const [successPeriodico, setSuccessPeriodico] = useState(null)
  const [periodoPeriodico, setPeriodoPeriodico] = useState('')
  const [anoPeriodico, setAnoPeriodico] = useState(new Date().getFullYear())
  const [showConfirmPeriodico, setShowConfirmPeriodico] = useState(false)
  const fileInputPeriodicoRef = useRef(null)

  const mesesOptions = [
    { value: 'janeiro', label: 'Janeiro' },
    { value: 'fevereiro', label: 'Fevereiro' },
    { value: 'marco', label: 'Março' },
    { value: 'abril', label: 'Abril' },
    { value: 'maio', label: 'Maio' },
    { value: 'junho', label: 'Junho' },
    { value: 'julho', label: 'Julho' },
    { value: 'agosto', label: 'Agosto' },
    { value: 'setembro', label: 'Setembro' },
    { value: 'outubro', label: 'Outubro' },
    { value: 'novembro', label: 'Novembro' },
    { value: 'dezembro', label: 'Dezembro' }
  ]

  const periodosPeriodicosOptions = [
    { value: 'trimestre_1', label: '1º Trimestre (Jan-Mar)' },
    { value: 'trimestre_2', label: '2º Trimestre (Abr-Jun)' },
    { value: 'trimestre_3', label: '3º Trimestre (Jul-Set)' },
    { value: 'trimestre_4', label: '4º Trimestre (Out-Dez)' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ]

  const anosOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)

  const handleFileChange = (e, tipo) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
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

      if (tipo === 'mensal') {
        setFileMensal(selectedFile)
        setErrorsMensal([])
        setSuccessMensal(null)
        setShowConfirmMensal(false)
      } else {
        setFilePeriodico(selectedFile)
        setErrorsPeriodico([])
        setSuccessPeriodico(null)
        setShowConfirmPeriodico(false)
      }
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

  const prepareConfirmation = (tipo) => {
    if (tipo === 'mensal') {
      if (!fileMensal) {
        toast.error('Selecione um arquivo primeiro', { position: "top-right", autoClose: 5000 })
        return
      }
      if (!periodoMensal) {
        toast.error('Selecione o mês de referência', { position: "top-right", autoClose: 5000 })
        return
      }
      setShowConfirmMensal(true)
    } else {
      if (!filePeriodico) {
        toast.error('Selecione um arquivo primeiro', { position: "top-right", autoClose: 5000 })
        return
      }
      if (!periodoPeriodico) {
        toast.error('Selecione o período de referência', { position: "top-right", autoClose: 5000 })
        return
      }
      setShowConfirmPeriodico(true)
    }
  }

  const handleUpload = async (tipo) => {
    const file = tipo === 'mensal' ? fileMensal : filePeriodico
    const periodo = tipo === 'mensal' ? periodoMensal : periodoPeriodico
    const ano = tipo === 'mensal' ? anoMensal : anoPeriodico
    const setUploading = tipo === 'mensal' ? setUploadingMensal : setUploadingPeriodico
    const setErrors = tipo === 'mensal' ? setErrorsMensal : setErrorsPeriodico
    const setSuccess = tipo === 'mensal' ? setSuccessMensal : setSuccessPeriodico
    const setShowConfirm = tipo === 'mensal' ? setShowConfirmMensal : setShowConfirmPeriodico

    setUploading(true)
    setErrors([])
    setSuccess(null)
    setShowConfirm(false)

    try {
      const excelData = await readExcelFile(file)
      
      if (excelData.length === 0) {
        toast.error('Arquivo vazio ou sem dados válidos', { position: "top-right", autoClose: 5000 })
        setUploading(false)
        return
      }

      // Mapear colunas para o novo formato
      const rows = excelData.map(row => ({
        nomeRazaoSocial: row['NOME/RAZAO SOCIAL'] || row['Nome'] || row['nome'] || '',
        cpfCnpj: row['CPF/CNPJ'] || row['CPF'] || row['cpf'] || '',
        dataNascimentoAbertura: row['DATA DE NASCIMENTO/ABERTURA'] || row['Data Nascimento'] || row['dataNascimento'] || '',
        quantidadeNumeros: row['QTD_NUMEROS_SORTE'] || row['Quantidade de Números'] || row['quantidade'] || ''
      }))

      const response = await fetch('/server/admin/uploadCsvPeriodo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: rows,
          uploadedBy: adminName,
          tipoSorteio: tipo,
          periodoReferencia: periodo,
          periodoAno: ano
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.stats)
        toast.success('✅ Planilha processada com sucesso!', { position: "top-right", autoClose: 5000 })

        // Limpar form
        if (tipo === 'mensal') {
          setFileMensal(null)
          setPeriodoMensal('')
          if (fileInputMensalRef.current) fileInputMensalRef.current.value = ''
        } else {
          setFilePeriodico(null)
          setPeriodoPeriodico('')
          if (fileInputPeriodicoRef.current) fileInputPeriodicoRef.current.value = ''
        }
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors)
          toast.error(`❌ ${data.errors.length} erro(s) encontrado(s)`, { position: "top-right", autoClose: 5000 })
        } else {
          toast.error(data.message || 'Erro ao processar planilha', { position: "top-right", autoClose: 5000 })
        }
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      toast.error('Erro ao processar arquivo. Verifique o formato.', { position: "top-right", autoClose: 5000 })
    } finally {
      setUploading(false)
    }
  }

  const clearFile = (tipo) => {
    if (tipo === 'mensal') {
      setFileMensal(null)
      setErrorsMensal([])
      setSuccessMensal(null)
      setShowConfirmMensal(false)
      if (fileInputMensalRef.current) fileInputMensalRef.current.value = ''
    } else {
      setFilePeriodico(null)
      setErrorsPeriodico([])
      setSuccessPeriodico(null)
      setShowConfirmPeriodico(false)
      if (fileInputPeriodicoRef.current) fileInputPeriodicoRef.current.value = ''
    }
  }

  const UploadSection = ({ 
    tipo, 
    file, 
    uploading, 
    errors, 
    success, 
    periodo, 
    setPeriodo, 
    ano, 
    setAno, 
    showConfirm, 
    fileInputRef,
    periodosOptions 
  }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        {tipo === 'mensal' ? <Calendar size={28} className="text-[#04c8b0]" /> : <Clock size={28} className="text-[#04c8b0]" />}
        <div>
          <h3 className="text-xl font-bold text-white">
            {tipo === 'mensal' ? 'Upload de Dados Mensais' : 'Upload de Dados Periódicos'}
          </h3>
          <p className="text-gray-400 text-sm">
            {tipo === 'mensal' ? 'Sorteios mensais (Janeiro a Dezembro)' : 'Sorteios trimestrais, semestrais e anuais'}
          </p>
        </div>
      </div>

      {/* Seleção de Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-300 font-semibold mb-2">
            {tipo === 'mensal' ? 'Mês de Referência' : 'Período de Referência'} *
          </label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#04c8b0] focus:outline-none"
          >
            <option value="">Selecione...</option>
            {periodosOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 font-semibold mb-2">Ano *</label>
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#04c8b0] focus:outline-none"
          >
            {anosOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#04c8b0] transition-all duration-300 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileChange(e, tipo)}
          className="hidden"
          id={`file-upload-${tipo}`}
        />
        <label htmlFor={`file-upload-${tipo}`} className="cursor-pointer flex flex-col items-center gap-4">
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
              <p className="text-gray-400 text-sm">Formato: XLSX</p>
            </div>
          )}
        </label>
      </div>

      {/* Confirmação */}
      {showConfirm && (
        <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-yellow-400 font-bold mb-2">Confirmar Upload</h4>
              <p className="text-gray-300 text-sm mb-4">
                Confirme os dados antes de enviar. <strong>Esta ação não poderá ser desfeita.</strong>
              </p>
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-white"><strong>Tipo:</strong> {tipo === 'mensal' ? 'Mensal' : 'Periódico'}</p>
                <p className="text-white"><strong>Período:</strong> {periodosOptions.find(p => p.value === periodo)?.label}</p>
                <p className="text-white"><strong>Ano:</strong> {ano}</p>
                <p className="text-white"><strong>Arquivo:</strong> {file?.name}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpload(tipo)}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
                >
                  Confirmar e Enviar
                </button>
                <button
                  onClick={() => tipo === 'mensal' ? setShowConfirmMensal(false) : setShowConfirmPeriodico(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      {!showConfirm && (
        <div className="flex gap-4">
          <button
            onClick={() => prepareConfirmation(tipo)}
            disabled={!file || !periodo || uploading}
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
                <span>Preparar Envio</span>
              </>
            )}
          </button>
          
          {file && (
            <button
              onClick={() => clearFile(tipo)}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <X size={20} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      )}

      {/* Sucesso */}
      {success && (
        <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-6 mt-4">
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
                  <p className="text-gray-400 text-sm">Usuários</p>
                  <p className="text-white font-bold text-2xl">{success.usuariosAfetados}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erros */}
      {errors.length > 0 && (
        <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6 mt-4">
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

  return (
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Upload de Planilhas XLSX</h2>
        <p className="text-gray-400">Importe dados de participantes com novo formato</p>
      </div>

      {/* Instruções */}
      <div className="bg-blue-900/30 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
          <FileSpreadsheet size={24} />
          Novo Formato de Planilha:
        </h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-[#04c8b0] font-bold">•</span>
            <span><strong className="text-[#04c8b0]">Coluna A:</strong> NOME/RAZAO SOCIAL - Nome completo da pessoa física ou jurídica</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#04c8b0] font-bold">•</span>
            <span><strong className="text-[#04c8b0]">Coluna B:</strong> CPF/CNPJ - Formato: xxx.xxx.xxx-xx ou xx.xxx.xxx/xxxx-xx</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#04c8b0] font-bold">•</span>
            <span><strong className="text-[#04c8b0]">Coluna C:</strong> DATA DE NASCIMENTO/ABERTURA - Formato: dd/mm/aaaa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#04c8b0] font-bold">•</span>
            <span><strong className="text-[#04c8b0]">Coluna D:</strong> QTD_NUMEROS_SORTE - Quantidade de números da sorte</span>
          </li>
        </ul>
      </div>

      {/* Upload Mensal */}
      <UploadSection
        tipo="mensal"
        file={fileMensal}
        uploading={uploadingMensal}
        errors={errorsMensal}
        success={successMensal}
        periodo={periodoMensal}
        setPeriodo={setPeriodoMensal}
        ano={anoMensal}
        setAno={setAnoMensal}
        showConfirm={showConfirmMensal}
        fileInputRef={fileInputMensalRef}
        periodosOptions={mesesOptions}
      />

      {/* Upload Periódico */}
      <UploadSection
        tipo="periodico"
        file={filePeriodico}
        uploading={uploadingPeriodico}
        errors={errorsPeriodico}
        success={successPeriodico}
        periodo={periodoPeriodico}
        setPeriodo={setPeriodoPeriodico}
        ano={anoPeriodico}
        setAno={setAnoPeriodico}
        showConfirm={showConfirmPeriodico}
        fileInputRef={fileInputPeriodicoRef}
        periodosOptions={periodosPeriodicosOptions}
      />
    </div>
  )
}

export default ImportData
