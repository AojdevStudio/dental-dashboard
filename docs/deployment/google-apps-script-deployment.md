# Google Apps Script Dynamic Deployment System

## Overview

The Google Apps Script Dynamic Deployment System automates the deployment of Google Apps Scripts to multiple projects using environment-based script ID management and the clasp CLI. This system eliminates the need for manual `.clasp.json` editing and provides a robust, professional deployment pipeline.

## 🚀 **Key Features**

### **Core Capabilities**
- **Dynamic Script ID Resolution**: Reads script IDs from `.env` file automatically
- **Interactive Deployment Menu**: User-friendly CLI interface for deployment selection
- **Automatic Backup/Restore**: Safe `.clasp.json` backup and restoration
- **Sequential/Parallel Deployment**: Deploy to multiple scripts efficiently
- **Comprehensive Error Handling**: Rollback capabilities and detailed error reporting
- **Health Check System**: Validate deployments and script functionality

### **Safety Features**
- **Atomic Operations**: All-or-nothing deployments with automatic rollback
- **Backup System**: Automatic `.clasp.json` backup before modifications
- **Validation Pipeline**: Pre-deployment checks and post-deployment verification
- **Environment Protection**: Validates script IDs and deployment targets

## 📋 **System Architecture**

### **Deployment Configuration**

The system maps deployment folders to environment variables for dynamic script ID resolution:

```javascript
const DEPLOYMENT_CONFIGS = {
  'deploy-dentist-sync-v2.1-multi-provider': {
    name: 'Dentist Multi-Provider Sync V2.1',
    type: 'dentist',
    scripts: [
      {
        name: 'Dr. Obinna Multi-Provider Sync',
        envVar: 'DR_OBINNA_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID',
        provider: 'obinna'
      },
      {
        name: 'Dr. Kamdi Multi-Provider Sync', 
        envVar: 'DR_KAMDI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID',
        provider: 'kamdi'
      },
      {
        name: 'Dr. Chi Multi-Provider Sync',
        envVar: 'DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID', 
        provider: 'chi'
      }
    ]
  },
  'deploy-hygienist-sync-v2': {
    name: 'Hygienist Sync V2',
    type: 'hygienist',
    scripts: [
      {
        name: 'Adriane Hygiene Sync V2',
        envVar: 'ADRIANE_HYGIENE_SYNC_V2_PROJECT_ID',
        provider: 'adriane'
      },
      {
        name: 'Kia Hygiene Sync V2',
        envVar: 'KIA_HYGIENE_SYNC_V2_PROJECT_ID',
        provider: 'kia'
      }
    ]
  }
}
```

### **Environment Variables**

Required environment variables in `.env` file:

```bash
# Google Apps Script Script IDs
DR_OBINNA_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID=1nHrbK2KGHcy5WNao9VfLy_CXKIBYlVFl6uKUZKRZn58m_RcbHzRNNuIg
DR_KAMDI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID=1LoiA2WhseGuSzOVxsNldcuRjZV1FAmhQxowHVYDSQi34xwvzeYc7xpqq
DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID=-1EYDDPUaemernYdtjsmkAXgOOY7N8Jr-6tTkESACIKmc_BWyWdOfSGgEs
ADRIANE_HYGIENE_SYNC_V2_PROJECT_ID=1asBckyvE43MkkfLYF1NCBr9M7eIlliWXe11o6g4x9BsugG3ReJRRImmi
KIA_HYGIENE_SYNC_V2_PROJECT_ID=1JvaXZSgEJ4jnbnrMEvkE7AqBRtIAUtJ1uCIlxokn8Qg2L0i2q9WdWa5I
```

## 🛠️ **Installation & Setup**

### **Prerequisites**

1. **Node.js** (18+ recommended)
2. **pnpm** package manager
3. **clasp CLI** installed and authenticated:
   ```bash
   npm install -g @google/clasp
   clasp login
   ```

### **Environment Configuration**

1. **Update .env file** with your Google Apps Script project IDs
2. **Verify clasp authentication**:
   ```bash
   clasp list
   ```

## 📖 **Usage Guide**

### **Interactive Deployment (Recommended)**

Start the interactive deployment menu:

```bash
pnpm gas:deploy
```

The system will present a menu like this:

```
📋 Interactive Deployment Menu

  1. Dr. Obinna Multi-Provider Sync
  2. Dr. Kamdi Multi-Provider Sync  
  3. Dr. Chi Multi-Provider Sync
  4. Adriane Hygiene Sync V2
  5. Kia Hygiene Sync V2
  6. Deploy All Dentist Scripts (3 scripts)
  7. Deploy All Hygienist Scripts (2 scripts)
  8. Deploy All Scripts (5 scripts)
  0. Exit

Select deployment option (number):
```

### **Command Line Options**

#### **Deploy All Scripts**
```bash
pnpm gas:deploy:all
```

#### **Deploy by Type**
```bash
# Deploy all dentist scripts (3 scripts)
pnpm gas:deploy:dentist

# Deploy all hygienist scripts (2 scripts)  
pnpm gas:deploy:hygienist
```

#### **Show Deployment Status**
```bash
pnpm gas:status
```

#### **Get Help**
```bash
pnpm gas:help
```

### **Advanced Options**

#### **Direct Script Execution**
```bash
# Interactive menu
node scripts/deploy-gas.js

# Deploy all scripts
node scripts/deploy-gas.js --all

# Deploy by type
node scripts/deploy-gas.js --type=dentist
node scripts/deploy-gas.js --type=hygienist

# Show status
node scripts/deploy-gas.js --status
```

## 🔍 **Health Check System**

The health check system validates deployments and ensures scripts are functioning correctly.

### **Run Health Checks**

#### **Interactive Health Check**
```bash
pnpm gas:health
```

#### **Check All Scripts**
```bash
pnpm gas:health:all
```

#### **Check by Type**
```bash
pnpm gas:health:dentist
pnpm gas:health:hygienist
```

### **What is Checked**

The health check system validates:

- ✅ **Required source files exist** (appsscript.json, main.gs, config.gs, etc.)
- ✅ **Required functions are defined** (setupCredentials, syncData, etc.)
- ✅ **Environment variables are set** (script IDs configured)
- ✅ **Script IDs are valid format** (proper Google Apps Script ID format)
- ✅ **Scripts are accessible via clasp** (authentication and permissions)
- ✅ **Configuration integrity** (proper .clasp.json structure)

### **Health Status Levels**

- 🟢 **HEALTHY**: All checks pass (90%+ success rate)
- 🟡 **WARNING**: Most checks pass (70-89% success rate)  
- 🔴 **ERROR**: Critical issues found (<70% success rate)

## 🔧 **Deployment Process**

### **Step-by-Step Flow**

1. **Environment Validation**
   - Verify clasp CLI installation
   - Check clasp authentication
   - Validate deployment directories
   - Confirm environment variables

2. **Pre-Deployment**
   - Backup existing `.clasp.json` files
   - Validate script IDs and target projects
   - Run pre-flight checks

3. **Deployment Execution**
   - Update `.clasp.json` with target script ID
   - Execute `clasp push --force`
   - Verify deployment success
   - Log deployment results

4. **Post-Deployment**
   - Restore original `.clasp.json` files
   - Run health checks (optional)
   - Generate deployment report

### **Error Handling & Rollback**

- **Automatic Backup**: All `.clasp.json` files are backed up before modification
- **Atomic Operations**: Failed deployments trigger automatic rollback
- **Error Logging**: Comprehensive error messages with troubleshooting guidance
- **Safe Recovery**: Original configurations are always restored

## 📊 **Monitoring & Reporting**

### **Deployment Report**

After each deployment, the system generates a comprehensive report:

```
📋 Deployment Report

Summary:
  Total Duration: 15423ms
  Successful: 4
  Failed: 1
  Total: 5

Details:
  ✅ Dr. Obinna Multi-Provider Sync
     Status: success
     Duration: 3245ms
     Time: 2024-12-02T15:30:45.123Z

  ❌ Dr. Chi Multi-Provider Sync
     Status: error
     Duration: 2156ms
     Time: 2024-12-02T15:30:47.456Z
     Error: clasp push failed: Script not found
```

### **Health Check Report**

Health checks provide detailed system status:

```
📋 Health Check Report

Summary:
  Total Duration: 8932ms
  Healthy: 4
  Warnings: 1
  Errors: 0
  Total: 5

Detailed Results:

  ✅ Dentist Multi-Provider Sync V2.1
     Status: HEALTHY
     Duration: 2341ms
     Files: 14/14 (100%)
     Functions: 7/7 (100%)
     Scripts:
       ✅ Dr. Obinna Multi-Provider Sync: HEALTHY
       ✅ Dr. Kamdi Multi-Provider Sync: HEALTHY
       ⚠️ Dr. Chi Multi-Provider Sync: WARNING
         Environment Variable: ✓ DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID
         Script ID Valid: ❌
         Accessible: ❌

Overall System Health: HEALTHY
```

## 🔐 **Security & Best Practices**

### **Security Considerations**

- **Environment Variables**: Store script IDs in `.env` file (not in version control)
- **Authentication**: Requires valid clasp authentication
- **Access Control**: Only deploy to authorized projects
- **Backup Protection**: Automatic backup prevents configuration loss

### **Best Practices**

1. **Pre-Deployment Validation**
   ```bash
   # Always check status before deploying
   pnpm gas:status
   
   # Run health checks to identify issues
   pnpm gas:health:all
   ```

2. **Staged Deployments**
   ```bash
   # Deploy to one script first to test
   pnpm gas:deploy
   # Select single script option
   
   # Then deploy to all scripts
   pnpm gas:deploy:all
   ```

3. **Post-Deployment Verification**
   ```bash
   # Verify deployments completed successfully
   pnpm gas:health:all
   ```

4. **Error Recovery**
   - Monitor deployment reports for errors
   - Use health checks to diagnose issues
   - Check Google Apps Script console for runtime errors

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"clasp not found" Error**
```bash
# Install clasp globally
npm install -g @google/clasp

# Verify installation
clasp --version
```

#### **"clasp not authenticated" Error**
```bash
# Login to clasp
clasp login

# Verify authentication
clasp list
```

#### **"Script not found" Error**
- Verify script ID in `.env` file is correct
- Check script exists in Google Apps Script console
- Ensure you have access to the script

#### **"Missing environment variables" Error**
- Verify all required script IDs are set in `.env`
- Check for typos in environment variable names
- Ensure `.env` file is in project root

#### **Deployment Fails Mid-Process**
- Check deployment report for specific errors
- Run health check to identify issues:
  ```bash
  pnpm gas:health:all
  ```
- Original `.clasp.json` files are automatically restored

### **Debug Mode**

For detailed debugging, use direct script execution:

```bash
# Enable detailed logging
DEBUG=1 node scripts/deploy-gas.js --all

# Check individual script health
node scripts/gas-health-check.js --script="Dr. Obinna Multi-Provider Sync"
```

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**

```yaml
name: Deploy Google Apps Scripts

on:
  push:
    branches: [ main ]
    paths: [ 'scripts/google-apps-script/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Setup clasp
      run: |
        npm install -g @google/clasp
        echo "${{ secrets.CLASP_TOKEN }}" > ~/.clasprc.json
        
    - name: Deploy Google Apps Scripts
      run: pnpm gas:deploy:all
      env:
        DR_OBINNA_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID: ${{ secrets.DR_OBINNA_SCRIPT_ID }}
        DR_KAMDI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID: ${{ secrets.DR_KAMDI_SCRIPT_ID }}
        DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID: ${{ secrets.DR_CHI_SCRIPT_ID }}
        ADRIANE_HYGIENE_SYNC_V2_PROJECT_ID: ${{ secrets.ADRIANE_SCRIPT_ID }}
        KIA_HYGIENE_SYNC_V2_PROJECT_ID: ${{ secrets.KIA_SCRIPT_ID }}
        
    - name: Run Health Checks
      run: pnpm gas:health:all
```

## 📚 **API Reference**

### **Command Line Interface**

#### **deploy-gas.cjs**

```bash
node scripts/deploy-gas.cjs [OPTIONS]

OPTIONS:
  --all                 Deploy to all configured scripts
  --type=<type>         Deploy by type (dentist|hygienist)
  --script=<name>       Deploy specific script by name
  --status              Show deployment status
  --help, -h            Show help message

EXAMPLES:
  node scripts/deploy-gas.cjs                   # Interactive menu
  node scripts/deploy-gas.cjs --all             # Deploy all scripts
  node scripts/deploy-gas.cjs --type=dentist    # Deploy dentist scripts
  node scripts/deploy-gas.cjs --status          # Show status
```

#### **gas-health-check.cjs**

```bash
node scripts/gas-health-check.cjs [OPTIONS]

OPTIONS:
  --all                 Check all configured scripts
  --type=<type>         Check by type (dentist|hygienist)  
  --script=<name>       Check specific script by name
  --detailed            Show detailed diagnostic information
  --help, -h            Show help message

EXAMPLES:
  node scripts/gas-health-check.cjs             # Interactive menu
  node scripts/gas-health-check.cjs --all       # Check all scripts
  node scripts/gas-health-check.cjs --type=dentist # Check dentist scripts
```

### **Package.json Scripts**

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm gas:deploy` | Interactive menu | Start interactive deployment |
| `pnpm gas:deploy:all` | Deploy all scripts | Deploy to all 5 configured scripts |
| `pnpm gas:deploy:dentist` | Deploy dentist scripts | Deploy to 3 dentist scripts |
| `pnpm gas:deploy:hygienist` | Deploy hygienist scripts | Deploy to 2 hygienist scripts |
| `pnpm gas:status` | Show status | Display configuration status |
| `pnpm gas:help` | Show help | Display help information |
| `pnpm gas:health` | Interactive health check | Start interactive health check |
| `pnpm gas:health:all` | Check all scripts | Health check all scripts |
| `pnpm gas:health:dentist` | Check dentist scripts | Health check dentist scripts |
| `pnpm gas:health:hygienist` | Check hygienist scripts | Health check hygienist scripts |

## 🎯 **Next Steps**

### **Immediate Actions**

1. **Test the System**:
   ```bash
   # Verify environment
   pnpm gas:status
   
   # Run health checks
   pnpm gas:health:all
   
   # Test with single deployment
   pnpm gas:deploy
   ```

2. **Deploy to Production**:
   ```bash
   # Deploy all scripts
   pnpm gas:deploy:all
   
   # Verify deployments
   pnpm gas:health:all
   ```

### **Future Enhancements**

- **Parallel Deployment**: Deploy multiple scripts simultaneously
- **Version Management**: Track script versions and rollback capabilities
- **Performance Monitoring**: Monitor deployment and script execution performance
- **Notification System**: Slack/email notifications for deployment status
- **Advanced Validation**: Syntax checking and function testing

## 📞 **Support**

For issues or questions regarding the Google Apps Script deployment system:

1. **Check the troubleshooting section** above
2. **Run health checks** to identify specific issues
3. **Review deployment reports** for error details
4. **Consult the API reference** for advanced usage

---

**This deployment system provides enterprise-grade automation for Google Apps Script deployments while maintaining safety, reliability, and ease of use.**