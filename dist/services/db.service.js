export class DbService {
    static async searchRecordsWithDateRange(tenantId, repository, searchCriteria, startDate, endDate) {
        const queryBuilder = repository.createQueryBuilder('record');
        // Make sure this is the correct tenant
        queryBuilder
            .innerJoinAndSelect('record.tenant', 'tenant')
            .where('tenant.id = :tenantId', { tenantId });
        Object.entries(searchCriteria).forEach(([key, value]) => {
            if (value !== undefined) {
                console.log(`Key: ${key}, value: ${value}`);
                queryBuilder.andWhere(`record.${key} = :${key}`, { [key]: value });
            }
        });
        if (startDate && endDate) {
            queryBuilder.andWhere('record.created_at BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        return queryBuilder.getMany();
    }
}
