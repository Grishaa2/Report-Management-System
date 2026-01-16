"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Papa from "papaparse"

import { useNotification } from "@/hooks/use-notification"
import { useLoadingOverlay } from "@/hooks/use-loading-overlay"

import { LoadingOverlay } from "@/components/loading-overlay"
import { Notification } from "@/components/notification"
import { CsvVisualizer } from "@/components/csv-visualizer"
import { DataEditor } from "@/components/data-editor"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataUnderstandingAssistant } from "@/components/data-understanding-assistant"

// Simple debounce implementation
function debounce(func, wait) {
  let timeout = null
  return (...args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Individual Section Components
const BackgroundElements = () => {
  const shapesRef = useRef(null)

  return (
    <div className="background-container">
      <div className="bg-gradient"></div>
      <div className="floating-shapes" ref={shapesRef}>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
    </div>
  )
}

const Header = ({ showNotification }) => {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [isSavingName, setIsSavingName] = useState(false)
  const headerRef = useRef(null)
  const mobileMenuToggleRef = useRef(null)
  const navRef = useRef(null)

  // Fetch current user profile when modal opens
  useEffect(() => {
    if (showShareModal && session?.user?.id) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const name = data.user.name || data.user.email?.split('@')[0] || "Anonymous User"
            setDisplayName(name)
            setNewName(data.user.name || "")
          }
        })
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [showShareModal, session?.user?.id])

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      showNotification("Name must be at least 2 characters", "error")
      return
    }

    setIsSavingName(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setDisplayName(data.user.name)
        setEditingName(false)
        showNotification("Display name updated successfully!", "success")
      } else {
        const data = await response.json()
        showNotification(data.error || "Failed to update name", "error")
      }
    } catch (error) {
      console.error('Error updating name:', error)
      showNotification("Failed to update name", "error")
    } finally {
      setIsSavingName(false)
    }
  }

  const handleShareProfile = () => {
    if (session?.user?.id) {
      setShowShareModal(true)
    } else {
      showNotification("Unable to get user ID for sharing", "error")
    }
  }

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/public/${session?.user?.id}`
    navigator.clipboard.writeText(profileUrl).then(() => {
      showNotification("Public profile link copied to clipboard!", "success")
      setShowShareModal(false)
    }).catch(() => {
      showNotification("Failed to copy link", "error")
    })
  }

  const openProfileInNewTab = () => {
    const profileUrl = `${window.location.origin}/public/${session?.user?.id}`
    window.open(profileUrl, "_blank")
    setShowShareModal(false)
  }

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (headerRef.current) {
        const scrolled = window.pageYOffset
        if (scrolled > 50) {
          headerRef.current.style.background = "rgba(10, 14, 26, 0.95)"
        } else {
          headerRef.current.style.background = "rgba(10, 14, 26, 0.8)"
        }
      }
    }, 10)

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
    if (mobileMenuToggleRef.current) {
      const spans = mobileMenuToggleRef.current.querySelectorAll("span")
      if (!isMobileMenuOpen) {
        spans[0].style.transform = "rotate(45deg) translate(5px, 5px)"
        spans[1].style.opacity = "0"
        spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)"
      } else {
        spans.forEach((span) => {
          span.style.transform = "none"
          span.style.opacity = "1"
        })
      }
    }
  }

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false)
    if (mobileMenuToggleRef.current) {
      const spans = mobileMenuToggleRef.current.querySelectorAll("span")
      spans.forEach((span) => {
        span.style.transform = "none"
        span.style.opacity = "1"
      })
    }
  }

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-80px 0px -50% 0px",
      threshold: 0,
    }

    const sections = document.querySelectorAll(".section")
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id")
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active")
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active")
            }
          })
        }
      })
    }, observerOptions)

    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  return (
    <header className="header" ref={headerRef}>
      <div className="container">
        <div className="header-content">
          <Link href="#home" className="logo" onClick={handleNavLinkClick}>
            <i className="fas fa-chart-line"></i>
            <span className="Text">Report Management System</span>
          </Link>

          <nav className={`nav ${isMobileMenuOpen ? "mobile-active" : ""}`} ref={navRef}>
            <Link href="#home" className="nav-link active" onClick={handleNavLinkClick}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
            <Link href="#history" className="nav-link" onClick={handleNavLinkClick}>
              <i className="fas fa-history"></i>
              <span>History</span>
            </Link>
            <Link href="#contact" className="nav-link" onClick={handleNavLinkClick}>
              <i className="fas fa-headset"></i>
              <span>Contact</span>
            </Link>
          </nav>

          {session?.user?.id && (
            <button
              className="btn btn-download"
              onClick={handleShareProfile}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                marginRight: "1rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
              }}
            >
              <i className="fas fa-share-alt" style={{ marginRight: "0.5rem" }}></i>
              Share Profile
            </button>
          )}

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} ref={mobileMenuToggleRef}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Share Profile Modal */}
      {showShareModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              border: "1px solid #334155",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <i className="fas fa-share-alt" style={{ fontSize: "1.75rem", color: "white" }}></i>
              </div>
              <h2 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                Share Your Public Profile
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                Share your reports and visualizations with anyone using this public link
              </p>
            </div>

            {/* Display Name Section */}
            <div
              style={{
                background: "#0f172a",
                borderRadius: "0.75rem",
                padding: "1rem",
                marginBottom: "1rem",
                border: "1px solid #334155",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Display Name on Profile</p>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                )}
              </div>
              {editingName ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your display name"
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      background: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "0.375rem",
                      color: "#f1f5f9",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    {isSavingName ? "..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false)
                      setNewName(displayName)
                    }}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: "#475569",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: "500" }}>
                  {displayName || "Loading..."}
                </p>
              )}
            </div>

            <div
              style={{
                background: "#0f172a",
                borderRadius: "0.75rem",
                padding: "1rem",
                marginBottom: "1rem",
                border: "1px solid #334155",
              }}
            >
              <p style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.5rem" }}>Your Public Profile URL</p>
              <p
                style={{
                  color: "#3b82f6",
                  fontSize: "0.875rem",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                }}
              >
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/public/${session?.user?.id}`}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={copyProfileLink}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <i className="fas fa-copy"></i>
                Copy Link
              </button>
              <button
                onClick={openProfileInNewTab}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <i className="fas fa-external-link-alt"></i>
                Open Profile
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                cursor: "pointer",
                marginTop: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

const ModifiedHeroSection = ({ showLoading, hideLoading, showNotification, onCsvUpload }) => {
  const fileInputRef = useRef(null)

  const processDepartmentFiles = useCallback(
    (files, department) => {
      showLoading()

      const validCsvFiles = Array.from(files).filter((file) => {
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
        return fileExtension === ".csv" && file.size <= 20 * 1024 * 1024 * 1024
      })

      if (validCsvFiles.length === 0) {
        hideLoading()
        showNotification("Please select valid CSV files", "error")
        return
      }

      let processedCount = 0
      const totalFiles = validCsvFiles.length

      validCsvFiles.forEach((csvFile) => {
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processedCount++

            if (results.errors.length > 0) {
              showNotification(`CSV parsing error in "${csvFile.name}": ${results.errors[0].message}`, "error")
            } else if (results.data.length === 0) {
              showNotification(`CSV file "${csvFile.name}" is empty or contains no valid data.`, "error")
            } else {
              let headers = results.meta.fields || (results.data.length > 0 ? Object.keys(results.data[0]) : []);
              headers = headers.filter(h => h && h.trim() !== '');

              fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: csvFile.name.replace('.csv', ''),
                  description: `Uploaded on ${new Date().toLocaleDateString()}`,
                  fileName: csvFile.name,
                  fileType: 'csv',
                  fileSize: csvFile.size,
                  data: results.data,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.report) {
                    const event = new CustomEvent("filesUploaded", {
                      detail: {
                        file: {
                          name: csvFile.name,
                          size: csvFile.size
                        },
                        department,
                        reportId: data.report.id,
                        parsedData: results.data,
                        parsedHeaders: headers
                      },
                    })
                    window.dispatchEvent(event)

                    onCsvUpload(results.data, headers, data.report.id);
                  } else {
                    showNotification(`Failed to save "${csvFile.name}" to database`, "error")
                  }
                })
                .catch((err) => {
                  console.error('Error saving report:', err)
                  showNotification(`Failed to save "${csvFile.name}"`, "error")

                  onCsvUpload(results.data, headers, null);
                })
            }

            if (processedCount === totalFiles) {
              hideLoading()
              if (totalFiles === 1) {
                showNotification(`Successfully uploaded and parsed "${validCsvFiles[0].name}"!`, "success")
              } else {
                showNotification(`Successfully uploaded and parsed ${totalFiles} CSV files!`, "success")
              }
            }
          },
          error: (err) => {
            processedCount++
            showNotification(`Failed to parse CSV "${csvFile.name}": ${err.message}`, "error")

            if (processedCount === totalFiles) {
              hideLoading()
            }
          },
        })
      })
    },
    [showLoading, hideLoading, showNotification, onCsvUpload],
  )

  const handleFileChange = useCallback(
    (e) => {
      const files = e.target.files

      if (files && files.length > 0) {
        processDepartmentFiles(files, "general")
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [processDepartmentFiles],
  )

  return (
    <section id="home" className="section">
      <div className="container">
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Transform Your Reports</span>
              <span className="hero-subtitle-line">Into Powerful Insights</span>
            </h1>
            <p className="hero-description">
              Experience the future of report management with our advanced analytics platform. Upload, analyze, and
              share your reports with unprecedented ease and security.
            </p>

            <div className="upload-section">
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "var(--spacing-lg)",
                    }}
                  >
                    <i className="fas fa-upload" style={{ fontSize: "2rem", color: "white" }}></i>
                  </div>
                </div>
                <div className="upload-content">
                  <h3>Upload CSV Files</h3>
                  <p>
                    Drop your CSV file here or click to browse. We'll automatically detect columns and prepare your data for visualization.
                  </p>
                  <div className="file-info">
                    <i className="fas fa-file-csv" style={{ marginRight: "8px" }}></i>
                    Supports .csv files
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input
        type="file"
        id="fileInput"
        accept=".csv"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </section>
  )
}

const FileItem = ({ file, department, onViewClick, savedData, createdAt, chartConfig, reportId, showNotification, onReportDeleted, onReportUpdated, onEditData }) => {
  const itemRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editTitle, setEditTitle] = useState(file.name.replace('.csv', ''))
  const [editDescription, setEditDescription] = useState(department || '')

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.style.opacity = "0"
      itemRef.current.style.transform = "translateX(-30px)"
      setTimeout(() => {
        if (itemRef.current) {
          itemRef.current.style.transition = "all 0.5s ease"
          itemRef.current.style.opacity = "1"
          itemRef.current.style.transform = "translateX(0)"
        }
      }, 100)
    }
  }, [])

  const getFileIconClass = (fileName) => {
    const fileExtension = fileName.split(".").pop()?.toLowerCase()
    switch (fileExtension) {
      case "pdf":
        return "fas fa-file-pdf"
      case "xlsx":
      case "xls":
        return "fas fa-file-excel"
      case "csv":
        return "fas fa-file-csv"
      case "doc":
      case "docx":
        return "fas fa-file-word"
      case "ppt":
      case "pptx":
        return "fas fa-file-powerpoint"
      default:
        return "fas fa-file"
    }
  }

  const handleViewProgress = () => {
    if (savedData && Array.isArray(savedData) && savedData.length > 0) {
      const headers = Object.keys(savedData[0]).filter(h => h && h.trim() !== '')
      onViewClick({ 
        isSavedData: true,
        data: savedData, 
        headers, 
        name: file.name,
        reportId: reportId || null,
        chartConfig: chartConfig,
      })
    } else {
      onViewClick(file)
    }
  }

  const handleDelete = async () => {
    if (!reportId) {
      showNotification("Cannot delete this file", "error")
      return
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showNotification(`"${file.name}" deleted successfully`, "success")
        setShowDeleteModal(false)
        onReportDeleted(reportId)
      } else {
        showNotification("Failed to delete report", "error")
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      showNotification("Failed to delete report", "error")
    }
  }

  const handleSaveEdit = async () => {
    if (!reportId) {
      showNotification("Cannot edit this file", "error")
      return
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editTitle,
          description: editDescription
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showNotification("Report updated successfully", "success")
        setIsEditing(false)
        onReportUpdated(data.report)
      } else {
        showNotification("Failed to update report", "error")
      }
    } catch (error) {
      console.error('Error updating report:', error)
      showNotification("Failed to update report", "error")
    }
  }

  if (isEditing) {
    return (
      <div className="download-item" ref={itemRef} style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Title</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-color)",
              background: "var(--card-bg)",
              color: "var(--text-primary)"
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Description</label>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-color)",
              background: "var(--card-bg)",
              color: "var(--text-primary)",
              resize: "vertical"
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-download" onClick={handleSaveEdit}>
            <i className="fas fa-save"></i>
            <span>Save</span>
          </button>
          <button 
            className="btn btn-download" 
            onClick={() => setIsEditing(false)}
            style={{ background: "#6b7280" }}
          >
            <i className="fas fa-times"></i>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="download-item" ref={itemRef}>
        <div className="download-icon">
          <i className={getFileIconClass(file.name)}></i>
        </div>
        <div className="download-info">
          <h4>{editTitle}.csv</h4>
          <p>{editDescription}</p>
          <span className="file-size">
            Uploaded: {createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-download" onClick={handleViewProgress}>
            <i className="fas fa-eye"></i>
            <span>View</span>
          </button>
          {reportId && savedData && (
            <>
              <button 
                className="btn btn-download" 
                onClick={() => onEditData(reportId, savedData, file.name)}
                style={{ background: "#10b981" }}
              >
                <i className="fas fa-table"></i>
                <span>Edit Data</span>
              </button>
              <button 
                className="btn btn-download" 
                onClick={() => setIsEditing(true)}
                style={{ background: "#3b82f6" }}
              >
                <i className="fas fa-edit"></i>
                <span>Edit Info</span>
              </button>
              <button 
                className="btn btn-download" 
                onClick={() => setShowDeleteModal(true)}
                style={{ background: "#ef4444" }}
              >
                <i className="fas fa-trash"></i>
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <DeleteConfirmation
          fileName={file.name}
          rowCount={savedData?.length || 0}
          chartExists={!!chartConfig}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

const HistorySection = ({ showLoading, hideLoading, showNotification, onViewFile, savedReports, onReportsChanged, onEditData }) => {
  const [recentReportsCollapsed, setRecentReportsCollapsed] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  useEffect(() => {
    const handleFilesUploaded = (event) => {
      setUploadedFiles((prev) => [
        {
          file: event.detail.file || { name: "Unknown", size: 0 },
          department: event.detail.department || "general",
          reportId: event.detail.reportId,
          savedData: event.detail.parsedData || null,
          createdAt: new Date().toISOString()
        },
        ...prev,
      ])
    }

    window.addEventListener("filesUploaded", handleFilesUploaded)
    return () => window.removeEventListener("filesUploaded", handleFilesUploaded)
  }, [])

  const allReports = [
    ...uploadedFiles,
    ...savedReports.map((r) => ({
      file: { name: r.fileName, size: r.fileSize },
      department: r.description || 'Database',
      reportId: r.id,
      createdAt: r.createdAt,
      savedData: r.data,
      chartConfig: r.chartConfig,  
    })),
  ]

  return (
    <section id="history" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-history"></i>
            History & Tracking
          </h2>
          <p className="section-description">
            Comprehensive tracking of your report submissions with detailed analytics and real-time monitoring.
          </p>
        </div>

        <div className="history-grid">
          <div className="history-card">
            <div className="card-header">
              <h3>
                <i className="fas fa-file-alt"></i> Recent Reports ({allReports.length})
              </h3>
              <button
                className={`toggle-btn ${recentReportsCollapsed ? "active" : ""}`}
                onClick={() => setRecentReportsCollapsed(!recentReportsCollapsed)}
              >
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
            <div className={`card-content ${recentReportsCollapsed ? "collapsed" : ""}`} id="recent-reports">
              <div className="download-list">
                {allReports.length === 0 ? (
                  <div
                    className="no-files-message"
                    style={{
                      textAlign: "center",
                      padding: "var(--spacing-xl)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <i
                      className="fas fa-file-upload"
                      style={{ fontSize: "2rem", marginBottom: "var(--spacing-md)" }}
                    ></i>
                    <p>No files uploaded yet. Upload CSV files to see them here.</p>
                  </div>
                ) : (
                  allReports.map((item, index) => (
                    <FileItem
                      key={item.reportId || index}
                      file={item.file}
                      department={item.department}
                      onViewClick={onViewFile}
                      savedData={item.savedData}
                      createdAt={item.createdAt}
                      reportId={item.reportId}
                      chartConfig={item.chartConfig}
                      showNotification={showNotification}
                      onReportDeleted={(deletedId) => {
                        setUploadedFiles(prev => prev.filter(f => f.reportId !== deletedId))
                        onReportsChanged()
                      }}
                      onReportUpdated={() => {
                        onReportsChanged()
                      }}
                      onEditData={onEditData}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const ContactSection = () => {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-headset"></i>
            Get In Touch
          </h2>
          <p className="section-description">
            Ready to transform your reporting experience? Contact our team for support and inquiries.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="card-icon">
              <i className="fas fa-phone-alt"></i>
            </div>
            <h3>Phone Support</h3>
            <div className="contact-info">
              <a href="tel:+85589657543">+855 93 80 6187</a>
              <a href="tel:+85596504690">+855 12 34 3242</a>
              <a href="tel:+85599365763">+855 12 34 3242</a>
            </div>
          </div>

          <div className="contact-card">
            <div className="card-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Email Support</h3>
            <div className="contact-info">
              <a href="mailto:support@reporthub.com">chotakna@gmail.com</a>
              <a href="mailto:info@reporthub.com">meng@gmail.com</a>
            </div>
          </div>

          <div className="contact-card">
            <div className="card-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>Location</h3>
            <div className="contact-info">
              <address>
                Royal University of Phnom Penh
                <br />
                STEM Building
                <br />
                Russian Federation Blvd
                <br />
                Phnom Penh, Cambodia
              </address>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support</a>
            <a href="#api">API Documentation</a>
            <a href="#status">Status</a>
          </div>
          <p className="footer-text">
            &copy; 2025 ReportManagement - Transform Your Reports Into Powerful Insights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export const DashboardLayout = () => {
  const { isLoading, showLoading, hideLoading } = useLoadingOverlay()
  const { notification, showNotification, hideNotification } = useNotification()

  const [csvParsedData, setCsvParsedData] = useState(null)
  const [csvHeaders, setCsvHeaders] = useState([])
  const [showCsvVisualizer, setShowCsvVisualizer] = useState(false)
  const [savedReports, setSavedReports] = useState([])
  const [currentReportId, setCurrentReportId] = useState(null)  
  const [currentChartConfig, setCurrentChartConfig] = useState(null)
  const [isEditingData, setIsEditingData] = useState(false)
  const [editingReportData, setEditingReportData] = useState(null)

  const loadReports = useCallback(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) {
          setSavedReports(data.reports)
        }
      })
      .catch((err) => console.error('Error loading reports:', err))
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleCsvUpload = useCallback((data, headers, reportId) => {
    setCsvParsedData(data)
    setCsvHeaders(headers)
    setCurrentReportId(reportId || null)
    setShowCsvVisualizer(true)
    setIsEditingData(false)
    setTimeout(() => {
      document.getElementById("data-visualization-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  const handleViewFile = useCallback((fileOrData) => {
    if (fileOrData && fileOrData.isSavedData === true) {
      if (fileOrData.data && fileOrData.headers && fileOrData.headers.length > 0) {
        setCsvParsedData(fileOrData.data)
        setCsvHeaders(fileOrData.headers)
        setCurrentReportId(fileOrData.reportId)
        setCurrentChartConfig(fileOrData.chartConfig)
        setShowCsvVisualizer(true)
        setIsEditingData(false)
        setTimeout(() => {
          document.getElementById("data-visualization-section")?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        return
      }
    }
    
    showNotification("Unable to view this file. Data may not be available.", "error")
  }, [showNotification])

  const handleEditData = useCallback((reportId, data, fileName) => {
    const headers = Object.keys(data[0]).filter(h => h && h.trim() !== '')
    setEditingReportData({ reportId, data, headers, fileName })
    setIsEditingData(true)
    setShowCsvVisualizer(false)
    setTimeout(() => {
      document.getElementById("data-editor-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(".stat-item, .history-card, .contact-card")
    animatedElements.forEach((element) => {
      element.style.opacity = "0"
      element.style.transform = "translateY(30px)"
      element.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      observer.observe(element)
    })

    return () => {
      animatedElements.forEach((element) => observer.unobserve(element))
    }
  }, [])

  return (
    <>
      <BackgroundElements />
      <Header showNotification={showNotification} />
      <main className="main">
        <ModifiedHeroSection
          showLoading={showLoading}
          hideLoading={hideLoading}
          showNotification={showNotification}
          onCsvUpload={handleCsvUpload}
        />
        {showCsvVisualizer && csvParsedData && csvHeaders && (
          <>
            <CsvVisualizer
              data={csvParsedData}
              headers={csvHeaders}
              showNotification={showNotification}
              reportId={currentReportId}
              initialChartConfig={currentChartConfig}
            />
            <section id="data-insights-section">
              <div className="container">
                <div className="max-w-4xl mx-auto">
                  <DataUnderstandingAssistant
                    data={csvParsedData}
                    headers={csvHeaders}
                    reportId={currentReportId}
                  />
                </div>
              </div>
            </section>
          </>
        )}
        {isEditingData && editingReportData && (
          <section id="data-editor-section">
            <div className="container">
              <DataEditor
                data={editingReportData.data}
                headers={editingReportData.headers}
                reportId={editingReportData.reportId}
                onSave={(updatedData) => {
                  showNotification("Data updated successfully!", "success")
                  setIsEditingData(false)
                  loadReports()
                }}
                onCancel={() => setIsEditingData(false)}
              />
            </div>
          </section>
        )}
        <HistorySection
          showLoading={showLoading}
          hideLoading={hideLoading}
          showNotification={showNotification}
          onViewFile={handleViewFile}
          savedReports={savedReports}
          onReportsChanged={loadReports}
          onEditData={handleEditData}
        />
        <ContactSection />
      </main>
      <Footer />
      <LoadingOverlay isLoading={isLoading} />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}
    </>
  )
}
