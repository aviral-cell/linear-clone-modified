# Admin User Setup

## Overview

Admin users have elevated privileges to access the admin dashboard and view API logs.

## Setting Admin Status

Admin status can only be set directly in the database for security.

### MongoDB Shell

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

### Verify

```javascript
db.users.findOne({ email: "admin@example.com" }, { isAdmin: 1, email: 1 })
```

## Admin Features

- View API logs at `/admin/logs`
- Filter and search logs
- View log details
- Analytics dashboard
- Manual log cleanup

## Security Notes

- Admin status cannot be set via public API
- Admin endpoints return 403 for non-admin users
- All admin actions are logged
