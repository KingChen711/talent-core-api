import 'dotenv/config'

export const receivedApplicationTemplate = `<p>Dear {candidate},</p><p>Thank you for applying for the {appliedJob} position at Talent Core Corporation. We are pleased to inform you that we have successfully received your application through {recruitmentDrive}.</p><p>Our team is currently reviewing all applications for the {appliedJob} role, and we are thoroughly evaluating each candidate to ensure we select the best fit for our team. This process may take some time, and we appreciate your patience and understanding.</p><p>We will keep you informed about the status of your application and the next steps in the recruitment process.</p><p>Thank you again for your interest in joining Talent Core Corporation. We look forward to the possibility of working with you.</p><p>Best regards,<br>Talent Core Corporation<br>${process.env.CLIENT_URL}</p>`

export const notifyInterviewSessionTemplate = `<p>Dear {candidate},</p><p>Congratulations!</p><p>We are excited to inform you that you have successfully passed the test exam for the {appliedJob} position at Talent Core Corporation with a score of {point}. We were impressed with your performance and are pleased to invite you to the next stage of our selection process: the interview.</p><p><strong>Interview Details:</strong></p><ul><li><strong>Date:</strong> {interviewDate}</li><li><strong>Method:</strong> {method}</li><li><strong>Location:</strong> {location}</li></ul><p>We are looking forward to meeting you and discussing your qualifications in more detail. Once again, congratulations on reaching this stage of the selection process.</p><p>Best regards,<br>Talent Core Corporation<br><a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
`

export const notifyApproveApplicationTemplate = `<p>Dear {candidate},</p>
<p>We are delighted to inform you that you have successfully passed the interview for the {appliedJob} position at Talent Core Corporation. Congratulations on this achievement!</p>
<p>We are excited to extend a formal job offer to you. Below are the details for your start date and other necessary information:</p>
<p><strong>Job Offer Details:</strong></p>
<ul>
    <li><strong>Receive Job Date:</strong> {receiveJobDate}</li>
    <li><strong>Location:</strong>{location}</li>
</ul>
<p>Please confirm your acceptance of this job offer by replying to this email.</p>
<p>We are thrilled to have you join our team and look forward to your contributions to Talent Core Corporation.</p>
<p>Congratulations once again, and welcome aboard!</p>
<p>Best regards,<br>Talent Core Corporation<br>${process.env.CLIENT_URL}</p>`

export const notifySaveApplicationTemplate = `<p>Dear {candidate},</p>
<p>Thank you for taking the time to apply for the {appliedJob} position at Talent Core Corporation and for participating in our selection process.</p>
<p>We appreciate your interest in our company and the effort you put into your application. After careful consideration, we have decided to proceed with other candidates whose qualifications more closely match the requirements of the position.</p>
<p>Please do not view this as a reflection of your abilities or potential. We were impressed with many aspects of your background and experience, and we encourage you to apply for future openings that align with your skills and career aspirations.</p>
<p>We wish you the best of luck in your job search and future endeavors. Thank you again for your interest in Talent Core Corporation.</p>
<p>Best regards,</p>
<p>Talent Core Corporation<br>${process.env.CLIENT_URL}</p>`

export const notifyRejectApplicationTemplate = `<p>Dear {candidate},</p>
<p>Thank you for considering the {appliedJob} position at Talent Core Corporation and for taking the time to engage with our selection process.</p>
<p>We understand that you have decided to decline our job offer. While we are disappointed that we will not have the opportunity to work together at this time, we respect your decision and appreciate your transparency.</p>
<p>We want to express our sincere gratitude for your interest in Talent Core Corporation and for the effort you put into your application and interviews. We were impressed with your qualifications and believe you have much to offer.</p>
<p>Should your circumstances change or if you find an opportunity with us that aligns with your career goals in the future, we would be delighted to hear from you. We encourage you to stay in touch and consider Talent Core Corporation for your career aspirations.</p>
<p>We wish you all the best in your future endeavors and success in your career path.</p>
<p>Best regards,</p>
<p>Talent Core Corporation<br>${process.env.CLIENT_URL}</p>`

export const notifyTakeTestTemplate = `<p>Dear {candidate},</p>
<p>We hope this message finds you well.</p>
<p>We are pleased to inform you that you have been selected to take the next step in our recruitment process for the {appliedJob} position at Talent Core. As part of our evaluation, we require you to complete a test exam that will help us assess your skills and suitability for the role.</p>
<p><strong>Test Exam Details:</strong></p>
<p><strong>Test Date:&nbsp;</strong>{testDate}<br><strong>Test Link:</strong> {linkToTakeTest}</p>
<p><strong>Instructions:</strong></p>
<ol>
    <li>
        <p><strong>Sign Up/Sign In to Talent Core Website:</strong><br>If you do not already have an account, please sign up on our Talent Core website using the following link: {signUpLink}. If you have an account, simply sign in using your email: {to}.</p>
    </li>
    <li>
        <p><strong>Access the Test:</strong><br>Once you&apos;re logged in, navigate to {linkToTakeTest}. The &quot;Take The Test&quot; button will be enabled at the time you&apos;re scheduled to take the test.<img src="${process.env.CLIENT_URL}/images/guide-test.jpg"></p>
    </li>
    <li>
        <p><strong>Complete the Test:</strong><br>The test will be available on the specified date. Please ensure you complete it within the given timeframe.</p>
    </li>
</ol>
<p>We wish you the best of luck on your test and look forward to your participation.</p>
<p>Best regards,<br>Talent Core<br>${process.env.CLIENT_URL}</p>`
