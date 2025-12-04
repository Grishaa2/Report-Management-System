"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const DataEditor = ({ data, headers, reportId, onSave, onCancel }) => {
  const [editedData, setEditedData] = useState([...data])
  const [isSaving, setIsSaving] = useState(false)

  const handleCellChange = (rowIndex, header, value) => {
    const newData = [...editedData]
    newData[rowIndex] = { ...newData[rowIndex], [header]: value }
    setEditedData(newData)
  }

  const handleAddRow = () => {
    const newRow = {}
    headers.forEach(header => {
      newRow[header] = ""
    })
    setEditedData([...editedData, newRow])
  }

  const handleDeleteRow = (rowIndex) => {
    if (confirm("Delete this row?")) {
      setEditedData(editedData.filter((_, index) => index !== rowIndex))
    }
  }

  const handleExportCSV = () => {
    try {
      const csvContent = [
        headers.join(','),
        ...editedData.map(row => 
          headers.map(header => {
            const value = row[header] || ''
            // Escape values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `edited_data_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      alert("CSV exported successfully!")
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert("Failed to export CSV")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: editedData }),
      })

      if (response.ok) {
        onSave(editedData)
      } else {
        alert("Failed to save changes")
      }
    } catch (error) {
      console.error('Error saving data:', error)
      alert("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card style={{ marginTop: "2rem", backgroundColor: "#1e293b", border: "1px solid #334155" }}>
      <CardHeader>
        <CardTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#f1f5f9" }}>
          <span>Edit Data ({editedData.length} rows)</span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-download" onClick={handleAddRow} style={{ background: "#10b981" }}>
              <i className="fas fa-plus"></i>
              <span>Add Row</span>
            </button>
            <button 
              className="btn btn-download" 
              onClick={handleExportCSV}
              style={{ background: "#8b5cf6" }}
            >
              <i className="fas fa-download"></i>
              <span>Export CSV</span>
            </button>
            <button 
              className="btn btn-download" 
              onClick={handleSave}
              disabled={isSaving}
              style={{ background: "#3b82f6" }}
            >
              <i className="fas fa-save"></i>
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
            <button className="btn btn-download" onClick={onCancel} style={{ background: "#6b7280" }}>
              <i className="fas fa-times"></i>
              <span>Cancel</span>
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            fontSize: "0.875rem"
          }}>
            <thead style={{ 
              position: "sticky", 
              top: 0, 
              background: "#1e293b",
              zIndex: 10
            }}>
              <tr>
                <th style={{ padding: "0.75rem", border: "1px solid #475569", minWidth: "50px", color: "#f1f5f9" }}>
                  #
                </th>
                {headers.map((header) => (
                  <th 
                    key={header} 
                    style={{ 
                      padding: "0.75rem", 
                      border: "1px solid #475569",
                      minWidth: "150px",
                      fontWeight: "600",
                      color: "#f1f5f9"
                    }}
                  >
                    {header}
                  </th>
                ))}
                <th style={{ padding: "0.75rem", border: "1px solid #475569", minWidth: "80px", color: "#f1f5f9" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {editedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td style={{ 
                    padding: "0.5rem", 
                    border: "1px solid #475569",
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#94a3b8"
                  }}>
                    {rowIndex + 1}
                  </td>
                  {headers.map((header) => (
                    <td key={header} style={{ padding: "0.5rem", border: "1px solid #475569" }}>
                      <input
                        type="text"
                        value={row[header] || ""}
                        onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #475569",
                          borderRadius: "0.25rem",
                          background: "#334155",
                          color: "#f1f5f9"
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: "0.5rem", border: "1px solid #475569", textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteRow(rowIndex)}
                      style={{
                        padding: "0.5rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer"
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
