# Migration Validation Checklist

## Pre-Migration Validation

### Database State
- [ ] Current database backup completed
- [ ] Backup integrity verified (test restore)
- [ ] Row counts documented for all tables
- [ ] Foreign key relationships mapped
- [ ] Indexes documented
- [ ] Constraints cataloged

### Application State
- [ ] All active sessions documented
- [ ] Background jobs paused
- [ ] Sync services stopped
- [ ] Cache cleared
- [ ] API traffic monitored

## Phase 1 Validation (Additive Changes)

### Schema Additions
- [ ] `google_credentials` table created
- [ ] `spreadsheet_connections` table created
- [ ] `column_mappings` table created
- [ ] UUID columns added to all existing tables
- [ ] No errors in migration logs
- [ ] Application still functional

### Performance Check
- [ ] Query performance baseline maintained
- [ ] No deadlocks detected
- [ ] Index usage optimal
- [ ] Memory usage stable

## Phase 2 Validation (Data Population)

### UUID Generation
- [ ] All records have UUID values
- [ ] No duplicate UUIDs generated
- [ ] UUID format valid (RFC 4122)
- [ ] Mapping table complete

### Data Integrity
- [ ] Row counts match pre-migration
- [ ] No NULL values in required fields
- [ ] OAuth tokens successfully migrated
- [ ] Spreadsheet connections mapped

## Phase 3 Validation (Foreign Keys)

### Relationship Integrity
- [ ] All foreign keys successfully created
- [ ] No orphaned records
- [ ] Cascade rules working
- [ ] Circular dependencies resolved

### Application Testing
- [ ] CRUD operations working
- [ ] Joins performing correctly
- [ ] No constraint violations
- [ ] Transaction integrity maintained

## Phase 4 Validation (Auth Integration)

### Supabase Integration
- [ ] All users migrated to auth.users
- [ ] Login functionality working
- [ ] Password reset functional
- [ ] OAuth connections preserved
- [ ] Session management operational

### Security Validation
- [ ] No unauthorized access possible
- [ ] Token encryption verified
- [ ] Audit logs capturing events
- [ ] Role assignments correct

## Phase 5 Validation (RLS)

### Policy Testing
- [ ] Multi-tenant isolation verified
- [ ] No cross-clinic data leaks
- [ ] Admin access working
- [ ] Service role functional

### Performance Impact
- [ ] Query performance acceptable
- [ ] RLS overhead measured
- [ ] Index usage optimized
- [ ] No timeout issues

## Phase 6 Validation (Cutover)

### Final State
- [ ] Old ID columns removed
- [ ] All code using UUIDs
- [ ] No dual-write logic remains
- [ ] Mapping tables archived

### System Health
- [ ] All features functional
- [ ] Performance metrics normal
- [ ] Error rates baseline
- [ ] User feedback positive

## Post-Migration Validation

### Data Verification
```sql
-- Verify row counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'clinics', COUNT(*) FROM clinics
UNION ALL
SELECT 'providers', COUNT(*) FROM providers
-- ... continue for all tables
```

### Relationship Verification
```sql
-- Check for orphaned records
SELECT * FROM providers p
WHERE NOT EXISTS (SELECT 1 FROM clinics c WHERE c.id = p.clinic_id);

-- Verify foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';
```

### Performance Verification
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;
```

## Rollback Decision Matrix

| Issue | Severity | Rollback? | Alternative |
|-------|----------|-----------|-------------|
| 5% performance degradation | Low | No | Optimize queries |
| 10 orphaned records | Medium | No | Fix and continue |
| Auth system failure | Critical | Yes | Immediate rollback |
| Data corruption | Critical | Yes | Restore from backup |
| RLS policy error | High | No | Fix policies live |

## Sign-off Requirements

### Technical Sign-off
- [ ] Database Administrator approval
- [ ] Lead Engineer verification
- [ ] Security team clearance
- [ ] DevOps confirmation

### Business Sign-off
- [ ] Product Manager approval
- [ ] Customer Success notification
- [ ] Support team briefed
- [ ] Executive stakeholder informed

## Documentation Updates

### Technical Documentation
- [ ] Database schema docs updated
- [ ] API documentation current
- [ ] Migration runbook complete
- [ ] Troubleshooting guide ready

### User Documentation
- [ ] User guides updated
- [ ] FAQ prepared
- [ ] Training materials ready
- [ ] Support scripts updated

## Monitoring Setup

### Alerts Configured
- [ ] Database performance alerts
- [ ] Error rate monitoring
- [ ] Auth failure tracking
- [ ] Data sync monitoring

### Dashboards Ready
- [ ] Migration progress dashboard
- [ ] System health metrics
- [ ] User activity tracking
- [ ] Performance comparison

## Final Checklist

### Go-Live Criteria
- [ ] All validation checks passed
- [ ] No critical issues outstanding
- [ ] Rollback plan tested
- [ ] Team ready for support
- [ ] Communication sent to users

### Post Go-Live
- [ ] Monitor for 24 hours
- [ ] Daily checks for 1 week
- [ ] Weekly review for 1 month
- [ ] Full retrospective completed
- [ ] Lessons learned documented