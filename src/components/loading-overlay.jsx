export const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null

  return (
    <div className="loading-overlay active">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Processing your request...</p>
      </div>
    </div>
  )
}
