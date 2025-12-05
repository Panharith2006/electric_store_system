"use client"

import { useEffect, useState } from "react"

export default function TestStockPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/inventory/stock/')
      .then(res => res.json())
      .then(json => {
        console.log('[TEST] Stock API response:', json)
        setData(json)
      })
      .catch(err => {
        console.error('[TEST] Stock API error:', err)
        setError(err.message)
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Stock API Test</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {data && (
        <div>
          <h2>Response Type: {Array.isArray(data) ? 'Array' : typeof data}</h2>
          {Array.isArray(data) && <h3>Array Length: {data.length}</h3>}
          <h2>Raw JSON:</h2>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '600px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
