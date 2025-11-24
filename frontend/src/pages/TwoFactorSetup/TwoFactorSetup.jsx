import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const TwoFactorSetup = () => {
  const { url, token } = useContext(StoreContext)
  const [qr, setQr] = useState(null)
  const [code, setCode] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const st = await axios.get(`${url}/api/user/2fa/status`, { headers: { token } })
        if (st.data?.success) setEnabled(!!st.data.twoFactorEnabled)
        if (!st.data?.twoFactorEnabled) {
          const resp = await axios.post(`${url}/api/user/2fa/start`, {}, { headers: { token } })
          if (resp.data?.success) {
            setQr(resp.data.qrDataUrl)
          } else {
            toast.error(resp.data?.message || 'Failed to init 2FA')
          }
        }
      } catch (e) {
        toast.error('Failed to init 2FA')
      }
      setLoading(false)
    }
    load()
  }, [url, token])

  const onEnable = async (e) => {
    e.preventDefault()
    if (!/^[0-9]{6}$/.test(code)) {
      toast.error('Enter a valid 6-digit code')
      return
    }
    try {
      const resp = await axios.post(`${url}/api/user/2fa/enable`, { code }, { headers: { token } })
      if (resp.data?.success) {
        setEnabled(true)
        toast.success('Two-factor authentication enabled')
        setQr(null)
      } else {
        toast.error(resp.data?.message || 'Invalid code')
      }
    } catch (e) {
      toast.error('Enable failed')
    }
  }

  const onDisable = async (e) => {
    e.preventDefault()
    try {
      const resp = await axios.post(`${url}/api/user/2fa/disable`, {}, { headers: { token } })
      if (resp.data?.success) {
        setEnabled(false)
        setCode('')
        toast.success('Two-factor authentication disabled')
        // prepare fresh QR if user wants to enable again
        const init = await axios.post(`${url}/api/user/2fa/start`, {}, { headers: { token } })
        if (init.data?.success) setQr(init.data.qrDataUrl)
      } else {
        toast.error(resp.data?.message || 'Disable failed')
      }
    } catch (e) {
      toast.error('Disable failed')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2>Two-Factor Authentication</h2>
      {loading ? (
        <p>Loading...</p>
      ) : enabled ? (
        <>
          <p>Two-factor authentication is currently enabled.</p>
          <button onClick={onDisable} style={{borderRadius:'10px', marginTop: 12, padding: '10px 16px' }}>Disable 2FA</button>
        </>
      ) : (
        <>
          <p>Scan this QR code in Google Authenticator, then enter the 6-digit code.</p>
          {qr && <img src={qr} alt="2FA QR" style={{ borderRadius:'15px',width: 200, height: 200,marginTop: '15px', imageRendering: 'pixelated' }} />}
          <form onSubmit={onEnable} style={{ marginTop: 16 }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e)=> setCode(e.target.value.trim())}
              required
              style={{borderRadius:'10px', padding: 10, width: '100%', boxSizing: 'border-box' }}
            />
            <button style={{borderRadius:'10px', marginTop: 12, padding: '10px 16px' }}>Enable</button>
          </form>
        </>
      )}
    </div>
  )
}

export default TwoFactorSetup


