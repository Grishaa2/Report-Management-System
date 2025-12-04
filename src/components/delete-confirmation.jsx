"use client"

export const DeleteConfirmation = ({ fileName, rowCount, chartExists, onConfirm, onCancel }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "#1e293b",
        padding: "2rem",
        borderRadius: "1rem",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        border: "1px solid #334155"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <i className="fas fa-exclamation-triangle" style={{ 
            fontSize: "4rem", 
            color: "#ef4444",
            marginBottom: "1rem"
          }}></i>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#f1f5f9" }}>Delete Report?</h2>
          <p style={{ color: "#94a3b8" }}>This action cannot be undone</p>
        </div>

        <div style={{ 
          background: "#334155", 
          padding: "1rem", 
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #475569"
        }}>
          <div style={{ marginBottom: "0.75rem", color: "#f1f5f9" }}>
            <strong>File:</strong> {fileName}
          </div>
          <div style={{ marginBottom: "0.75rem", color: "#f1f5f9" }}>
            <strong>Data Rows:</strong> {rowCount} rows
          </div>
          {chartExists && (
            <div style={{ color: "#ef4444" }}>
              <i className="fas fa-chart-bar"></i> Saved visualization will also be deleted
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            className="btn btn-download" 
            onClick={onCancel}
            style={{ flex: 1, background: "#6b7280" }}
          >
            <i className="fas fa-times"></i>
            <span>Cancel</span>
          </button>
          <button 
            className="btn btn-download" 
            onClick={onConfirm}
            style={{ flex: 1, background: "#ef4444" }}
          >
            <i className="fas fa-trash"></i>
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  )
}
