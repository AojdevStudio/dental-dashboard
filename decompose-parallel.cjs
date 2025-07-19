#!/usr/bin/env node

/**
 * decompose-parallel.cjs - Intelligent Task Decomposition Engine
 *
 * This script analyzes Linear issues and breaks them down into parallel
 * agent workstreams that can work independently against an established test suite.
 *
 * Usage: node decompose-parallel.cjs [LINEAR_ISSUE_ID]
 * Example: node decompose-parallel.cjs AOJ-63
 */

const fs = require('node:fs').promises;
const path = require('node:path');
// Note: For Node.js versions that don't have fetch built-in, you may need:
// const fetch = require('node-fetch');
// But Node.js 18+ has fetch built-in

class ParallelTaskDecomposer {
  constructor() {
    this.projectRoot = process.cwd();
    this.testSuiteAnalysis = null;
    this.codebaseStructure = null;
    this.linearIssue = null;
  }

  /**
   * Main decomposition workflow
   */
  async decompose(issueId) {
    try {
      // Step 1: Gather intelligence
      await this.analyzeTestSuite();
      await this.analyzeCodebaseStructure();
      await this.fetchLinearIssue(issueId);

      // Step 2: Intelligent decomposition
      const decompositionPlan = await this.createDecompositionPlan();

      // Step 3: Generate deployment JSON
      const deploymentPlan = await this.generateDeploymentPlan(decompositionPlan);

      // Step 4: Save and report
      await this.saveDeploymentPlan(deploymentPlan, issueId);
      this.reportDecomposition(deploymentPlan);

      return deploymentPlan;
    } catch (error) {
      console.error('❌ Decomposition failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Analyze existing test suite to understand development contracts
   */
  async analyzeTestSuite() {
    const testDirs = ['__tests__', 'tests', 'src/__tests__', 'test'];
    const testFiles = [];

    for (const dir of testDirs) {
      const testPath = path.join(this.projectRoot, dir);
      try {
        const files = await this.findTestFiles(testPath);
        testFiles.push(...files);
      } catch (_e) {
        // Directory doesn't exist, continue
      }
    }

    this.testSuiteAnalysis = {
      totalTestFiles: testFiles.length,
      testAreas: this.categorizeTests(testFiles),
      testContracts: this.extractTestContracts(testFiles),
      coverageAreas: this.identifyCoverageAreas(testFiles),
    };
  }

  /**
   * Analyze codebase structure to understand architectural patterns
   */
  async analyzeCodebaseStructure() {
    const srcDirs = ['src', 'app', 'components', 'lib', 'pages'];
    const structure = {};

    for (const dir of srcDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        structure[dir] = await this.analyzeDirectory(dirPath);
      } catch (_e) {
        // Directory doesn't exist, continue
      }
    }

    this.codebaseStructure = {
      architecture: this.identifyArchitecture(structure),
      components: this.findComponents(structure),
      apis: this.findApiRoutes(structure),
      utilities: this.findUtilities(structure),
      styles: this.findStyles(structure),
    };
  }

  /**
   * Fetch Linear issue details using the Linear MCP tool
   */
  async fetchLinearIssue(issueId) {
    try {
      // Option 1: Use Linear MCP tool if available (requires MCP environment)
      if (this.isRunningInMCPEnvironment()) {
        const issue = await this.fetchFromLinearMCP(issueId);
        this.linearIssue = this.transformLinearResponse(issue);
      }
      // Option 2: Use Linear GraphQL API directly
      else if (process.env.LINEAR_API_KEY) {
        const issue = await this.fetchFromLinearAPI(issueId);
        this.linearIssue = this.transformLinearResponse(issue);
      }
      // Option 3: Use local Linear data cache (if available)
      else if (await this.hasLocalLinearCache(issueId)) {
        const issue = await this.fetchFromLocalCache(issueId);
        this.linearIssue = this.transformLinearResponse(issue);
      }
      // Option 4: Fall back to manual input prompt
      else {
        this.linearIssue = await this.promptForIssueDetails(issueId);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch Linear issue ${issueId}:`, error.message);
      this.linearIssue = await this.promptForIssueDetails(issueId);
    }
  }

  /**
   * Check if running in MCP environment (Claude Desktop/Code)
   */
  isRunningInMCPEnvironment() {
    // Check for MCP environment indicators
    return (
      process.env.MCP_ENABLED === 'true' ||
      process.env.CLAUDE_DESKTOP === 'true' ||
      typeof global.mcpTools !== 'undefined'
    );
  }

  /**
   * Fetch from Linear using MCP tool (when running in Claude Desktop/Code)
   */
  fetchFromLinearMCP(_issueId) {
    // In a real MCP environment, this might look like:
    // const issue = await window.mcp.linear.getIssue(issueId);
    // return issue;

    throw new Error('MCP Linear integration not available in Node.js environment');
  }

  /**
   * Fetch from Linear GraphQL API directly
   */
  async fetchFromLinearAPI(issueId) {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          priority
          priorityLabel
          state {
            name
          }
          assignee {
            name
          }
          team {
            name
          }
          project {
            name
          }
        }
      }
    `;

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: process.env.LINEAR_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: issueId },
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`Linear GraphQL error: ${data.errors[0].message}`);
    }

    return data.data.issue;
  }

  /**
   * Check if local Linear cache exists
   */
  async hasLocalLinearCache(issueId) {
    const cacheDir = path.join(this.projectRoot, '.linear-cache');
    const cacheFile = path.join(cacheDir, `${issueId}.json`);

    try {
      await fs.access(cacheFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch from local Linear cache
   */
  async fetchFromLocalCache(issueId) {
    const cacheDir = path.join(this.projectRoot, '.linear-cache');
    const cacheFile = path.join(cacheDir, `${issueId}.json`);

    const cacheData = await fs.readFile(cacheFile, 'utf8');
    return JSON.parse(cacheData);
  }

  /**
   * Prompt user for manual issue details
   */
  promptForIssueDetails(issueId) {
    // For now, return a basic structure that prompts user to fill in
    return {
      id: issueId,
      title: `[MANUAL INPUT NEEDED] Issue ${issueId}`,
      description: '[Please provide description with numbered requirements]',
      priority: 'Unknown',
      status: 'Unknown',
      requirements: ['[Please list requirements manually]'],
    };
  }

  /**
   * Transform Linear API response to internal format
   */
  transformLinearResponse(issue) {
    return {
      id: issue.identifier || issue.id,
      title: issue.title,
      description: issue.description || '',
      priority: issue.priorityLabel || issue.priority || 'Unknown',
      status: issue.state?.name || 'Unknown',
      assignee: issue.assignee?.name,
      team: issue.team?.name,
      project: issue.project?.name,
      requirements: this.extractRequirements(issue.description || ''),
    };
  }

  /**
   * Create intelligent decomposition plan based on analysis
   */
  createDecompositionPlan() {
    const requirements = this.linearIssue.requirements;
    const agents = [];

    // Analyze requirements and create specialized agents
    for (const requirement of requirements) {
      const agent = this.createAgentForRequirement(requirement);
      if (agent) {
        agents.push(agent);
      }
    }

    // Optimize agent assignments for parallelism
    const optimizedAgents = this.optimizeForParallelism(agents);

    // Calculate dependencies
    const agentsWithDependencies = this.calculateDependencies(optimizedAgents);

    return {
      agents: agentsWithDependencies,
      totalEstimatedTime: this.calculateTotalTime(agentsWithDependencies),
      parallelismFactor: this.calculateParallelismFactor(agentsWithDependencies),
    };
  }

  /**
   * Create specialized agent for a specific requirement
   */
  createAgentForRequirement(requirement) {
    const reqText = requirement.toLowerCase();

    // Routing/Navigation Agent
    if (reqText.includes('404') || reqText.includes('routing') || reqText.includes('navigation')) {
      return {
        id: 'routing_agent',
        role: 'Fix provider detail routing and 404 errors',
        focusArea: 'Navigation & Routing',
        requirements: [requirement],
        estimatedTime: 20,
        complexity: 'medium',
        type: 'infrastructure',
      };
    }

    // Data Visualization Agent
    if (reqText.includes('chart') || reqText.includes('visualization') || reqText.includes('kpi')) {
      return {
        id: 'chart_agent',
        role: 'Build KPI chart components and visualization library',
        focusArea: 'Data Visualization',
        requirements: [requirement],
        estimatedTime: 25,
        complexity: 'medium',
        type: 'component',
      };
    }

    // Data Integration Agent
    if (reqText.includes('database') || reqText.includes('data') || reqText.includes('api')) {
      return {
        id: 'data_agent',
        role: 'Implement KPI calculations and database integration',
        focusArea: 'Data Layer',
        requirements: [requirement],
        estimatedTime: 30,
        complexity: 'high',
        type: 'backend',
      };
    }

    // UI/Dashboard Agent
    if (reqText.includes('dashboard') || reqText.includes('layout') || reqText.includes('ui')) {
      return {
        id: 'ui_agent',
        role: 'Create dashboard layout and provider comparison views',
        focusArea: 'User Interface',
        requirements: [requirement],
        estimatedTime: 25,
        complexity: 'medium',
        type: 'frontend',
      };
    }

    return null;
  }

  /**
   * Generate complete deployment plan
   */
  async generateDeploymentPlan(decompositionPlan) {
    const deploymentPlan = {
      taskId: this.linearIssue.id,
      taskTitle: this.linearIssue.title,
      decompositionStrategy: 'parallel_feature_streams',
      estimatedTotalTime: `${decompositionPlan.totalEstimatedTime} minutes`,
      parallelismFactor: `${decompositionPlan.parallelismFactor}x faster than sequential`,

      parallelAgents: decompositionPlan.agents.map((agent) => ({
        agentId: agent.id,
        agentRole: agent.role,
        focusArea: agent.focusArea,
        dependencies: agent.dependencies || [],

        filesToCreate: this.predictFilesToCreate(agent),
        filesToModify: this.predictFilesToModify(agent),
        testContracts: this.findRelevantTestContracts(agent),

        validationCriteria: this.generateValidationCriteria(agent),
        estimatedTime: `${agent.estimatedTime} minutes`,
        canStartImmediately: (agent.dependencies || []).length === 0,

        workspaceSetup: {
          contextFile: `workspaces/${agent.id}/agent_context.json`,
          fileList: `workspaces/${agent.id}/files_to_work_on.txt`,
          testContracts: `workspaces/${agent.id}/test_contracts.txt`,
          checklist: `workspaces/${agent.id}/validation_checklist.txt`,
        },
      })),

      integrationPlan: {
        mergeOrder: this.calculateMergeOrder(decompositionPlan.agents),
        validationSteps: [
          'Run agent-specific tests',
          'Cross-agent integration tests',
          'Full test suite validation',
          'E2E testing',
        ],
        estimatedIntegrationTime: '10 minutes',
      },

      coordination: {
        statusFile: 'shared/coordination/parallel-agent-status.json',
        resultsAggregation: 'shared/coordination/agent-results.json',
        conflictResolution: 'shared/coordination/merge-conflicts.json',
      },
    };

    return deploymentPlan;
  }

  /**
   * Save deployment plan to file system
   */
  async saveDeploymentPlan(plan, issueId) {
    const outputDir = path.join(this.projectRoot, 'shared', 'deployment-plans');
    await fs.mkdir(outputDir, { recursive: true });

    const filename = `${issueId.toLowerCase()}-deployment-plan.json`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(plan, null, 2));
    return filepath;
  }

  /**
   * Report decomposition results
   */
  reportDecomposition(plan) {
    plan.parallelAgents.forEach((agent) => {
      const _canStart = agent.canStartImmediately ? '✅' : '⏳';
    });
    const _immediateAgents = plan.parallelAgents.filter((a) => a.canStartImmediately);
    const dependentAgents = plan.parallelAgents.filter((a) => !a.canStartImmediately);
    if (dependentAgents.length > 0) {
    }
  }

  // Helper methods for analysis and prediction

  async findTestFiles(dir) {
    const files = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...(await this.findTestFiles(fullPath)));
        } else if (entry.name.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/)) {
          files.push(fullPath);
        }
      }
    } catch (_e) {
      // Directory doesn't exist or no permission
    }
    return files;
  }

  categorizeTests(testFiles) {
    const categories = {
      component: [],
      integration: [],
      api: [],
      e2e: [],
      unit: [],
    };

    testFiles.forEach((file) => {
      const filename = path.basename(file).toLowerCase();
      if (filename.includes('component')) {
        categories.component.push(file);
      } else if (filename.includes('integration')) {
        categories.integration.push(file);
      } else if (filename.includes('api')) {
        categories.api.push(file);
      } else if (filename.includes('e2e')) {
        categories.e2e.push(file);
      } else {
        categories.unit.push(file);
      }
    });

    return categories;
  }

  extractTestContracts(_testFiles) {
    // In a real implementation, this would parse test files to extract test names and contracts
    return {
      routing: ['routing.test.js', 'navigation.test.js'],
      components: ['chart-components.test.js', 'ui-components.test.js'],
      api: ['api.test.js', 'data-integration.test.js'],
      dashboard: ['dashboard.test.js', 'visualization.test.js'],
    };
  }

  identifyCoverageAreas(_testFiles) {
    return ['routing', 'components', 'api', 'database', 'ui', 'integration'];
  }

  async analyzeDirectory(dir) {
    const structure = { files: [], subdirs: [] };
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          structure.subdirs.push(entry.name);
        } else {
          structure.files.push(entry.name);
        }
      }
    } catch (_e) {
      // Directory doesn't exist
    }
    return structure;
  }

  identifyArchitecture(structure) {
    if (structure.app) {
      return 'Next.js App Router';
    }
    if (structure.pages) {
      return 'Next.js Pages Router';
    }
    if (structure.src) {
      return 'React/TypeScript';
    }
    return 'Unknown';
  }

  findComponents(structure) {
    const components = [];
    ['components', 'src/components', 'app/components'].forEach((dir) => {
      if (structure[dir] || structure.src?.subdirs?.includes('components')) {
        components.push(`${dir}/*`);
      }
    });
    return components;
  }

  findApiRoutes(structure) {
    const apis = [];
    if (structure.app?.subdirs?.includes('api')) {
      apis.push('app/api/*');
    }
    if (structure.pages?.subdirs?.includes('api')) {
      apis.push('pages/api/*');
    }
    return apis;
  }

  findUtilities(structure) {
    const utils = [];
    if (structure.lib) {
      utils.push('lib/*');
    }
    if (structure.src?.subdirs?.includes('lib')) {
      utils.push('src/lib/*');
    }
    return utils;
  }

  findStyles(structure) {
    const styles = [];
    if (structure.styles) {
      styles.push('styles/*');
    }
    if (structure.src?.subdirs?.includes('styles')) {
      styles.push('src/styles/*');
    }
    return styles;
  }

  extractRequirements(description) {
    // Simple regex to extract numbered requirements
    const requirements = [];
    const lines = description.split('\n');
    lines.forEach((line) => {
      const match = line.match(/^\s*\d+\.\s*(.+)/);
      if (match) {
        requirements.push(match[1].trim());
      }
    });
    return requirements;
  }

  optimizeForParallelism(agents) {
    // Group agents by type and ensure they can work independently
    return agents.map((agent) => ({
      ...agent,
      isolation: this.calculateIsolation(agent),
      parallelizable: this.isParallelizable(agent),
    }));
  }

  calculateDependencies(agents) {
    return agents.map((agent) => {
      const dependencies = [];

      // UI agents typically depend on chart agents
      if (agent.id === 'ui_agent') {
        const chartAgent = agents.find((a) => a.id === 'chart_agent');
        if (chartAgent) {
          dependencies.push('chart_agent');
        }
      }

      return {
        ...agent,
        dependencies,
      };
    });
  }

  calculateTotalTime(agents) {
    const immediateAgents = agents.filter((a) => (a.dependencies || []).length === 0);
    const dependentAgents = agents.filter((a) => (a.dependencies || []).length > 0);

    const maxImmediateTime = Math.max(...immediateAgents.map((a) => a.estimatedTime));
    const maxDependentTime =
      dependentAgents.length > 0 ? Math.max(...dependentAgents.map((a) => a.estimatedTime)) : 0;

    return maxImmediateTime + maxDependentTime;
  }

  calculateParallelismFactor(agents) {
    const sequentialTime = agents.reduce((sum, agent) => sum + agent.estimatedTime, 0);
    const parallelTime = this.calculateTotalTime(agents);
    return Math.round((sequentialTime / parallelTime) * 10) / 10;
  }

  predictFilesToCreate(agent) {
    const files = [];

    switch (agent.id) {
      case 'routing_agent':
        files.push('app/providers/[id]/page.tsx', 'app/providers/[id]/loading.tsx');
        break;
      case 'chart_agent':
        files.push(
          'components/charts/KPIChart.tsx',
          'components/charts/ProviderMetrics.tsx',
          'lib/chart-utils.ts'
        );
        break;
      case 'data_agent':
        files.push('lib/kpi-calculations.ts', 'lib/provider-analytics.ts');
        break;
      case 'ui_agent':
        files.push(
          'components/dashboard/ProviderDashboard.tsx',
          'components/dashboard/MetricsGrid.tsx'
        );
        break;
    }

    return files;
  }

  predictFilesToModify(agent) {
    const files = [];

    switch (agent.id) {
      case 'routing_agent':
        files.push('lib/routing.ts', 'components/navigation.tsx');
        break;
      case 'chart_agent':
        files.push('lib/chart-config.ts', 'components/ui/chart.tsx');
        break;
      case 'data_agent':
        files.push('lib/api/providers.ts', 'lib/database/queries.ts');
        break;
      case 'ui_agent':
        files.push('app/providers/page.tsx', 'components/provider-card.tsx');
        break;
    }

    return files;
  }

  findRelevantTestContracts(agent) {
    const contracts = [];

    switch (agent.id) {
      case 'routing_agent':
        contracts.push('routing.test.js', 'navigation.test.js');
        break;
      case 'chart_agent':
        contracts.push('chart-components.test.js', 'visualization.test.js');
        break;
      case 'data_agent':
        contracts.push('api.test.js', 'data-integration.test.js', 'kpi-logic.test.js');
        break;
      case 'ui_agent':
        contracts.push('dashboard.test.js', 'ui-components.test.js');
        break;
    }

    return contracts;
  }

  generateValidationCriteria(agent) {
    const criteria = [];

    switch (agent.id) {
      case 'routing_agent':
        criteria.push(
          'All provider links navigate correctly',
          'No 404 errors on provider detail pages',
          'Navigation breadcrumbs work'
        );
        break;
      case 'chart_agent':
        criteria.push(
          'Charts render with mock data',
          'Responsive design works on mobile',
          'Chart interactions function properly'
        );
        break;
      case 'data_agent':
        criteria.push(
          'KPI calculations are accurate',
          'Database queries perform well',
          'Data transformations work correctly'
        );
        break;
      case 'ui_agent':
        criteria.push(
          'Dashboard layout is responsive',
          'Provider comparisons work',
          'UI components match design system'
        );
        break;
    }

    return criteria;
  }

  calculateMergeOrder(agents) {
    // Calculate optimal merge order based on dependencies
    const order = [];
    const processed = new Set();

    // First, add agents with no dependencies
    agents
      .filter((a) => (a.dependencies || []).length === 0)
      .forEach((a) => {
        order.push(a.id);
        processed.add(a.id);
      });

    // Then add dependent agents
    agents
      .filter((a) => (a.dependencies || []).length > 0)
      .forEach((a) => {
        order.push(a.id);
      });

    return order;
  }

  calculateIsolation(agent) {
    // Determine how isolated this agent's work is from others
    return agent.type === 'component' ? 'high' : 'medium';
  }

  isParallelizable(_agent) {
    // All agents are designed to be parallelizable
    return true;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    process.exit(1);
  }

  const issueId = args[0];
  const decomposer = new ParallelTaskDecomposer();

  await decomposer.decompose(issueId);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ParallelTaskDecomposer };
