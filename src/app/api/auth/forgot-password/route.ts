import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with that email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expires,
        userId: user.id
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    console.log('==========================================');
    console.log('PASSWORD RESET LINK (development mode):');
    console.log('Email:', email);
    console.log('Reset URL:', resetUrl);
    console.log('==========================================');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Report Management System <noreply@reporthub.com>',
      to: email,
      subject: 'Password Reset Request - Report Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user.name || 'there'},</p>
            
            <p style="font-size: 14px; margin-bottom: 20px;">We received a request to reset your password for your Report Management System account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 20px;">This link will expire in <strong>1 hour</strong> for your security.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              <strong>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. Your account is still secure.
            </p>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
              If you're having trouble clicking the button, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>Report Management System - Transform Your Reports Into Powerful Insights</p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      console.log('Please use the reset link from the console above.');
    }

    return NextResponse.json(
      { 
        message: "If an account exists with that email, you will receive a password reset link." 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
