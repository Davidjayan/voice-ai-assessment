"""
Email service for sending notifications.
"""
from django.core.mail import send_mail
from django.conf import settings
import os


class EmailService:
    # Frontend URL for invite links
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    @staticmethod
    def send_organization_invite(
        to_email: str,
        organization_name: str,
        invite_code: str,
        invited_by_username: str
    ) -> bool:
        """
        Send an organization invite email with both link and code.
        Returns True if email was sent successfully, False otherwise.
        """
        invite_link = f"{EmailService.FRONTEND_URL}/join?code={invite_code}"
        subject = f"You've been invited to join {organization_name}"
        
        # Plain text version
        message = f"""
Hello,

{invited_by_username} has invited you to join "{organization_name}" on ProjectHub.

Click the link below to accept the invitation:
{invite_link}

Or use this invite code when signing up or joining:
{invite_code}

This invitation expires in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

Best regards,
The ProjectHub Team
        """.strip()
        
        # HTML version
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }}
        .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }}
        .divider {{ text-align: center; color: #94a3b8; margin: 25px 0; position: relative; }}
        .divider::before, .divider::after {{ content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: #e2e8f0; }}
        .divider::before {{ left: 0; }}
        .divider::after {{ right: 0; }}
        .invite-code {{ background: #1e293b; color: #f1f5f9; padding: 15px 25px; border-radius: 8px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; word-break: break-all; }}
        .footer {{ text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }}
        .label {{ color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">You're Invited!</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p><strong>{invited_by_username}</strong> has invited you to join <strong>"{organization_name}"</strong> on ProjectHub.</p>
            
            <div style="text-align: center;">
                <a href="{invite_link}" class="btn">Accept Invitation</a>
            </div>
            
            <div class="divider">or</div>
            
            <p class="label">Use this invite code:</p>
            <div class="invite-code">{invite_code}</div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">This invitation expires in 7 days.</p>
            <p style="color: #94a3b8; font-size: 13px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The ProjectHub Team</p>
        </div>
    </div>
</body>
</html>
        """.strip()
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=False
            )
            return True
        except Exception as e:
            print(f"Failed to send invite email: {e}")
            return False
