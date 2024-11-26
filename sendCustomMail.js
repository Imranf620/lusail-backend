import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('Error: SendGrid API key is missing.');
  process.exit(1); 
}

sgMail.setApiKey(SENDGRID_API_KEY);

const msg = {
  to: 'shakeel7521951@gmail.com',
  from: 'aqibmalik1586@gmail.com',
  subject: 'greeting',
  text: 'welcome thank you for login and signup on our website',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

export const sendMail = async ({ to, subject, text }) => {
    const msg = {
      to,
      from: 'aqibmalik1586@gmail.com', // Use your verified email
      subject,
      text,
    };
  
    try {
      await sgMail.send(msg);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error occurred while sending email:', error);
  
      if (error.response) {
        console.error('Error response from SendGrid:', error.response.body);
      }
    }
  };
