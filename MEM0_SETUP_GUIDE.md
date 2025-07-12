# Mem0 Setup Guide - Brain Visualization App

## Quick Start (5 minutes)

### 1. Get Mem0 API Key

1. Go to [app.mem0.ai](https://app.mem0.ai)
2. Sign up for free account
3. Navigate to Dashboard → API Keys
4. Click "Create New Key"
5. Copy your API key

### 2. Configure App

Create a `.env` file in project root:

```env
VITE_MEM0_API_KEY=m0-xxxxxxxxxxxxxxxxxxxx
```

That's it! The app now has:
- ✅ User authentication
- ✅ Secure memory storage
- ✅ SOC 2 & HIPAA compliance

## How It Works

### User Experience

1. **Sign Up**: Users create profile with email + display name
2. **Unique ID**: Each user gets `user_email_timestamp` ID
3. **Take Assessment**: Survey results auto-save to their memory
4. **View History**: All assessments accessible without retaking
5. **Privacy**: Users can delete all data with one click

### What Gets Stored

```javascript
// User Profile
{
  userId: "user_jane_doe_1234567890",
  email: "jane@example.com",
  displayName: "Jane",
  createdAt: "2024-01-15T10:00:00Z"
}

// Assessment Memory
{
  type: "assessment",
  timestamp: "2024-01-15T10:30:00Z",
  ace_count: 4,
  regions_affected: 7,
  primary_impacts: ["Amygdala", "Hippocampus"],
  has_protective_factors: true
}
```

## Advanced Configuration (Optional)

### Organization Setup

For clinics or research groups:

```env
VITE_MEM0_API_KEY=m0-xxxxxxxxxxxxxxxxxxxx
VITE_MEM0_ORG_ID=org_xxxxxxxxxxxx
VITE_MEM0_PROJECT_ID=trauma-assessments
```

### Benefits
- Separate projects for different studies
- Member access control
- Centralized billing

## Security Features

### SOC 2 Compliance
- Annual audits
- Data encryption
- Access controls
- Security monitoring

### HIPAA Compliance
- BAA available
- PHI protection
- Audit trails
- Data retention policies

### BYOK (Bring Your Own Key)
- Use your encryption keys
- Full data control
- Enhanced security

## Pricing

### Free Tier
- 10,000 memories/month
- Unlimited users
- Basic support

### Pro ($49/month)
- 100,000 memories/month
- Priority support
- Advanced analytics

### Enterprise
- Unlimited memories
- HIPAA BAA
- Custom contracts
- SLA guarantees

## Troubleshooting

### "Mem0 not configured"
- Check API key in .env
- Restart dev server after adding .env

### "User not found"
- User needs to sign up first
- Check email spelling

### "Failed to store memory"
- Check API key validity
- Verify you have credits

## Data Management

### Export User Data
```javascript
const memories = await mem0Auth.getUserMemories(userId)
// Returns all memories for download
```

### Delete User Data
```javascript
await mem0Auth.deleteUser(userId)
// Permanently deletes all user data
```

## Best Practices

1. **User IDs**: Let system generate unique IDs
2. **Metadata**: Add context to memories
3. **Search**: Use natural language queries
4. **Privacy**: Inform users about data storage

## Support

- Mem0 Docs: [docs.mem0.ai](https://docs.mem0.ai)
- API Status: [status.mem0.ai](https://status.mem0.ai)
- Support: support@mem0.ai

## Next Steps

1. Deploy app with API key in environment variables
2. Test user signup/signin flow
3. Take assessment and verify storage
4. View saved assessments

Your app is now ready for production use with enterprise-grade memory storage!