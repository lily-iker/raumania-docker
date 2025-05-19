import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

// API handler for sending email
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bottle, color, scent, cap, senderEmail } = req.body

  if (!bottle || !color || !scent || !cap || !senderEmail) {
    return res.status(400).json({ error: 'Missing customization data' })
  }

  // Nodemailer setup for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Email environment variable
      pass: process.env.EMAIL_PASS, // Password environment variable
    },
  })

  try {
    // Send email
    await transporter.sendMail({
      from: `"Raumania Fragrance" <${process.env.EMAIL_USER}>`,
      replyTo: senderEmail,
      to: 'minhthai030896@gmail.com', // Admin email to receive the customization details
      subject: 'New Custom Fragrance Submission',
      html: `
      <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <div style="background-color: #4a90e2; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Fragrance Studio</h1>
          </div>
          
          <div style="padding: 20px; color: #333333;">
            <h2 style="font-size: 20px; margin-top: 0;">New Custom Fragrance Design Order</h2>
            <p style="margin: 0 0 10px;"><strong>From:</strong> ${senderEmail}</p>
    
            <ul style="list-style: none; padding: 0; margin: 20px 0;">
              <li style="background-color: #f9f9fb; margin-bottom: 10px; padding: 10px 15px; border-radius: 4px;">
                <strong>Bottle:</strong> ${bottle.name} — ${bottle.description}
              </li>
              <li style="background-color: #f9f9fb; margin-bottom: 10px; padding: 10px 15px; border-radius: 4px;">
                <strong>Color:</strong> ${color.name} — ${color.description}
              </li>
              <li style="background-color: #f9f9fb; margin-bottom: 10px; padding: 10px 15px; border-radius: 4px;">
                <strong>Scent:</strong> ${scent.name} — ${scent.description}
              </li>
              <li style="background-color: #f9f9fb; margin-bottom: 10px; padding: 10px 15px; border-radius: 4px;">
                <strong>Cap:</strong> ${cap.name} — ${cap.description}
              </li>
            </ul>
    
            <p style="margin-top: 20px;">A new custom fragrance order has been submitted by <strong>${senderEmail}</strong>. Please review the design details above. Thank you for managing the custom fragrance requests.</p>
          </div>
    
          <div style="background-color: #f4f4f7; color: #888888; padding: 15px; text-align: center; font-size: 12px;">
            Fragrance Studio • 123 Aroma Lane, Scent City<br/>
            <a href="https://Raumania.Fragrance.com" style="color: #4a90e2; text-decoration: none;">Visit Our Website</a>
          </div>
    
        </div>
      </div>
    `,
    })

    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error) // Log the detailed error for debugging
    res.status(500).json({ error: 'Email failed to send' })
  }
}
