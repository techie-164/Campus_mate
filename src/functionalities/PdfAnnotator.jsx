import React, { useEffect, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import './PdfAnnotator.css'

function PdfAnnotator() {
  const [pdfDataUrl, setPdfDataUrl] = useState('')
  const [fileName, setFileName] = useState('annotated.pdf')
  const [error, setError] = useState('')
  const [pageSize, setPageSize] = useState({ width: 612, height: 792 })
  const [scale, setScale] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [brushColor, setBrushColor] = useState('#ff4d4d')
  const [brushSize, setBrushSize] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState(null)
  const [pdfBytes, setPdfBytes] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const storedPdf = localStorage.getItem('campus_mate_pdf_to_annotate')
    const storedName = localStorage.getItem('campus_mate_pdf_name')

    if (!storedPdf) {
      setError('No PDF loaded. Please upload a file from the Scribble page and click Annotate.')
      return
    }

    const normalizedName = storedName ? storedName.replace(/\.pdf$/i, '') : 'annotated'
    setFileName(`${normalizedName}_annotated.pdf`)
    setPdfDataUrl(storedPdf)

    try {
      const base64 = storedPdf.split(',')[1]
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      setPdfBytes(bytes)
      PDFDocument.load(bytes).then(doc => {
        const page = doc.getPage(0)
        const width = page.getWidth()
        const height = page.getHeight()
        const maxWidth = 900
        const pageScale = Math.min(1, maxWidth / width)
        setPageSize({ width, height })
        setScale(pageScale)
        setLoaded(true)
      }).catch(err => {
        console.error(err)
        setError('Failed to load the PDF. The file may be corrupted or unsupported.')
      })
    } catch (err) {
      console.error(err)
      setError('Invalid PDF data. Please retry from the Scribble page.')
    }

    // keep the stored PDF in localStorage so the user can return
    // to the Scribble page without losing the selection if popup
    // blockers or navigation timing cause issues.
  }, [])

  const handleLocalFileSelect = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (!f.type.includes('pdf') && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      setPdfDataUrl(result)
      try {
        const base64 = result.split(',')[1]
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        setPdfBytes(bytes)
        PDFDocument.load(bytes).then(doc => {
          const page = doc.getPage(0)
          const width = page.getWidth()
          const height = page.getHeight()
          const maxWidth = 900
          const pageScale = Math.min(1, maxWidth / width)
          setPageSize({ width, height })
          setScale(pageScale)
          setLoaded(true)
          setFileName((f.name || 'annotated').replace(/\.pdf$/i, '') + '_annotated.pdf')
          setError('')
        }).catch(err => {
          console.error(err)
          setError('Failed to load the PDF. The file may be corrupted or unsupported.')
        })
      } catch (err) {
        console.error(err)
        setError('Invalid PDF data. Please try another file.')
      }
    }
    reader.readAsDataURL(f)
  }

  useEffect(() => {
    if (!loaded) return
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = Math.round(pageSize.width * scale)
    canvas.height = Math.round(pageSize.height * scale)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [loaded, pageSize, scale])

  const getPointerPosition = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const handlePointerDown = (event) => {
    if (!loaded) return
    const point = getPointerPosition(event)
    if (!point) return
    setIsDrawing(true)
    setLastPoint(point)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const handlePointerMove = (event) => {
    if (!isDrawing || !loaded) return
    const point = getPointerPosition(event)
    if (!point) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    setLastPoint(point)
  }

  const handlePointerUp = () => {
    if (!loaded) return
    setIsDrawing(false)
    setLastPoint(null)
  }

  const clearAnnotations = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSave = async () => {
    if (!pdfBytes) return
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const pngDataUrl = canvasRef.current.toDataURL('image/png')
      const pngImage = await pdfDoc.embedPng(pngDataUrl)
      const page = pdfDoc.getPage(0)
      const pageWidth = page.getWidth()
      const pageHeight = page.getHeight()

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      })

      const annotatedBytes = await pdfDoc.save()
      const blob = new Blob([annotatedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('Unable to save annotated PDF. Please try again.')
    }
  }

  return (
    <div className="pdf-annotator">
      <div className="annotator-shell">
        <div className="annotator-header">
          <div>
            <h1>PDF Annotation Studio</h1>
            <p>Draw annotations and save the final PDF with your notes.</p>
          </div>
          <div className="annotator-actions">
            <button className="btn btn-secondary" onClick={() => (window.location.href = '/scribble')}>Back to Files</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!loaded}>Save Annotated PDF</button>
          </div>
        </div>

        {error ? (
          <div className="annotator-error">
            <p>{error}</p>
            <p>Or choose a PDF to annotate directly:</p>
            <input type="file" accept="application/pdf" onChange={handleLocalFileSelect} />
            <p>
              <a href="/scribble">Go back to Scribble</a>
            </p>
          </div>
        ) : (
          <>
            <div className="annotator-controls">
              <div>
                <label>Brush color:</label>
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
              </div>
              <div>
                <label>Brush size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
                <span>{brushSize}px</span>
              </div>
              <button className="btn btn-danger" onClick={clearAnnotations}>Clear Annotations</button>
            </div>

            <div
              className="pdf-stage"
              style={{ width: `${Math.round(pageSize.width * scale)}px`, height: `${Math.round(pageSize.height * scale)}px` }}>
              <embed src={pdfDataUrl} type="application/pdf" className="pdf-embed" />
              <canvas
                ref={canvasRef}
                className="pdf-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PdfAnnotator
