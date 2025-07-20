# Google Apps Script Dynamic Deployment System

## 🚀 **Quick Start**

Deploy Google Apps Scripts with zero manual configuration:

```bash
# Check deployment status
pnpm gas:status

# Deploy all scripts  
pnpm gas:deploy:all

# Interactive deployment menu
pnpm gas:deploy

# Health check all scripts
pnpm gas:health:all
```

## 📋 **Available Commands**

### **Deployment Commands**
- `pnpm gas:deploy` - Interactive deployment menu
- `pnpm gas:deploy:all` - Deploy to all 5 configured scripts
- `pnpm gas:deploy:dentist` - Deploy to 3 dentist scripts
- `pnpm gas:deploy:hygienist` - Deploy to 2 hygienist scripts
- `pnpm gas:status` - Show deployment configuration status
- `pnpm gas:help` - Display help information

### **Health Check Commands**
- `pnpm gas:health` - Interactive health check menu
- `pnpm gas:health:all` - Health check all scripts
- `pnpm gas:health:dentist` - Health check dentist scripts
- `pnpm gas:health:hygienist` - Health check hygienist scripts

## ⚙️ **Configuration**

Script IDs are automatically read from `.env` file:

```bash
# Google Apps Script Script IDs
DR_OBINNA_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID=1nHrbK2KGHcy5WNao9VfLy_CXKIBYlVFl6uKUZKRZn58m_RcbHzRNNuIg
DR_KAMDI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID=1LoiA2WhseGuSzOVxsNldcuRjZV1FAmhQxowHVYDSQi34xwvzeYc7xpqq
DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID=-1EYDDPUaemernYdtjsmkAXgOOY7N8Jr-6tTkESACIKmc_BWyWdOfSGgEs
ADRIANE_HYGIENE_SYNC_V2_PROJECT_ID=1asBckyvE43MkkfLYF1NCBr9M7eIlliWXe11o6g4x9BsugG3ReJRRImmi
KIA_HYGIENE_SYNC_V2_PROJECT_ID=1JvaXZSgEJ4jnbnrMEvkE7AqBRtIAUtJ1uCIlxokn8Qg2L0i2q9WdWa5I
```

## 🔧 **Prerequisites**

1. **clasp CLI** installed and authenticated:
   ```bash
   npm install -g @google/clasp
   clasp login
   ```

2. **Environment variables** configured in `.env` file

## 🎯 **How It Works**

1. **Dynamic Script ID Resolution**: Reads script IDs from environment variables
2. **Automatic .clasp.json Management**: Updates and restores `.clasp.json` files automatically
3. **Safe Deployment**: Backs up original configurations before deployment
4. **Comprehensive Validation**: Pre-flight checks and post-deployment verification
5. **Professional Reporting**: Detailed deployment and health reports

## ✅ **Safety Features**

- **Atomic Operations**: All-or-nothing deployments with rollback
- **Automatic Backup**: `.clasp.json` files backed up before modification
- **Environment Validation**: Validates script IDs and clasp authentication
- **Error Recovery**: Automatic restoration on deployment failures

## 📊 **System Architecture**

```
scripts/
├── deploy-gas.cjs           # Main deployment script
├── gas-health-check.cjs     # Health check system
└── google-apps-script/
    ├── deploy-dentist-sync-v2.1-multi-provider/
    ├── deploy-hygienist-sync-v2/
    └── other-deployment-folders/
```

## 🔍 **Troubleshooting**

### Common Issues

1. **"clasp not found"**:
   ```bash
   npm install -g @google/clasp
   ```

2. **"clasp not authenticated"**:
   ```bash
   clasp login
   ```

3. **"Missing environment variables"**:
   - Check `.env` file has all required script IDs
   - Verify no typos in environment variable names

### Debug Commands

```bash
# Check system status
pnpm gas:status

# Run comprehensive health check
pnpm gas:health:all

# Get detailed help
pnpm gas:help
```

## 📚 **Full Documentation**

See complete documentation: `docs/deployment/google-apps-script-deployment.md`

---

**This system transforms manual Google Apps Script deployment into a professional, automated pipeline while maintaining safety and reliability.**