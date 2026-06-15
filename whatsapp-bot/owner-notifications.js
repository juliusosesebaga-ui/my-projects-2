const fs = require('fs');
const path = require('path');

const NOTIFICATIONS_FILE = path.join(__dirname, 'notifications.json');

// Store notification in-memory and on disk
async function sendOwnerNotification(notification) {
  try {
    // Load existing notifications
    let notifications = [];
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      try {
        notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8'));
      } catch (e) {
        notifications = [];
      }
    }

    // Add new notification
    const notif = {
      id: Date.now(),
      ...notification,
      read: false
    };
    notifications.push(notif);

    // Keep only last 100 notifications
    notifications = notifications.slice(-100);

    // Save to disk
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');

    // Log to console
    console.log('📢 Notification:', notif.type, '|', notif.phone || '', '|', notif.message || notif.error || '');

    // Optional: send email notification (requires EMAIL_SERVICE config)
    if (process.env.EMAIL_SERVICE === 'enabled' && process.env.OWNER_EMAIL) {
      // TODO: integrate with SendGrid, Mailgun, or nodemailer
      console.log('Email notification would be sent to:', process.env.OWNER_EMAIL);
    }

    // Optional: send SMS notification (requires SMS_SERVICE config)
    if (process.env.SMS_SERVICE === 'enabled' && process.env.OWNER_PHONE) {
      // TODO: integrate with Twilio or similar
      console.log('SMS notification would be sent to:', process.env.OWNER_PHONE);
    }

    return notif;
  } catch (err) {
    console.error('Error sending owner notification:', err.message);
  }
}

// Get all notifications (for dashboard)
function getNotifications(limit = 50) {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8'));
      return notifications.slice(-limit).reverse();
    }
  } catch (e) {
    console.error('Error loading notifications:', e.message);
  }
  return [];
}

// Mark notification as read
function markNotificationAsRead(notificationId) {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      let notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8'));
      notifications = notifications.map(n => {
        if (n.id === notificationId) {
          n.read = true;
        }
        return n;
      });
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Error marking notification as read:', e.message);
  }
}

module.exports = {
  sendOwnerNotification,
  getNotifications,
  markNotificationAsRead
};
