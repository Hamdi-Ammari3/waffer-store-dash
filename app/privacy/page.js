import React from 'react'

const page = () => {
  return (
    <div className='privacy-container'>
      <div className='privacy-container-title'>
        <h1>Privacy Policy</h1>
      </div>
      <div className='privacy-container-main'>

        <div style={{marginTop:'20px'}}>
          <p>
            Waffer operates the Waffer mobile application <strong>waffer - وفر</strong>, a service that helps users discover discounts and offers from nearby stores on a map.
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our App.
          </p>
        </div>

        <div>
          <h4>1. Information We Collect</h4>
          <div>
            <p>We may collect the following types of data:</p>
            <h5>Location Information:</h5>
            <p>
              To show nearby offers and discounts, the App may request access to your location. This data   is used only to display offers near you and is not shared or stored permanently.
            </p>
            
            <h5>Device Information:</h5>
            <p>
              We may collect basic technical information such as your device type, operating system, and app version — used only to improve performance and user experience.
            </p>

            <h5>Optional User Data:</h5>
            <p>
              If you choose to register or contact us, we may collect your name, email, or phone number for support purposes or account identification.
            </p>

            <p>
              We do not collect sensitive personal information such as financial details, passwords, or government IDs.
            </p>
          </div>
        </div>

        <div>
          <h4>2. How We Use Your Information</h4>
          <p>We use your data to:</p>
          <p>Display nearby discounts and offers relevant to your location.</p>
          <p>Improve the functionality and reliability of the App.</p>
          <p>Communicate with you (if you contact us).</p>
          <p>Prevent abuse or technical issues.</p>
          <p>We never sell, rent, or trade your data with third parties.</p>
        </div>

        <div>
          <h4>3. Third-Party Services</h4>
          <p>Waffer may use third-party services such as:</p>
          <p><strong>Google Maps API</strong> (to display map and location-based offers)</p>
          <p><strong>Analytics tools</strong> (to understand app performance and usage)</p>
          <p>These services may collect anonymous data as described in their own privacy policies.</p>
        </div>

        <div>
          <h4>4. Data Retention</h4>
          <p>
            We retain your data only as long as necessary for the purposes stated in this policy.
            You may request deletion of your data at any time by contacting us.
          </p>
        </div>

        <div>
          <h4>5. Your Rights</h4>
          <p>You have the right to:</p>
          <p>Access or correct your personal data.</p>
          <p>Request deletion of your data.</p>
          <p>Withdraw consent for location access at any time in your device settings.</p>
        </div>

        <div>
          <h4>6. Security</h4>
          <p>
            We use reasonable technical and organizational measures to protect your data against unauthorized access, loss, or misuse.
          </p>
        </div>

        <div>
          <h4>7. Children’s Privacy</h4>
          <p>
            Our App is not intended for children under 13 years old. We do not knowingly collect personal data from children.
          </p>
        </div>

        <div>
          <h4>8. Changes to This Policy</h4>
          <p>
            We may update this Privacy Policy from time to time. The latest version will always be available on our website or app.
          </p>
        </div>

        <div>
          <h4>9. Contact Us</h4>
          <p>If you have questions or concerns about this Privacy Policy, you can contact us at:</p>
          <p><strong>Email:</strong> elammari2022@gmail.com</p>
          <p><strong>App Name:</strong>waffer - وفر</p>
          <p></p>
        </div>
      </div>
    </div>
  )
}

export default page