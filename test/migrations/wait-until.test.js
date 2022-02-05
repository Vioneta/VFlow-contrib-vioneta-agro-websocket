const { expect } = require('chai');

const migrations = require('../../src/nodes/wait-until/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-wait-until',
    name: 'label of node',
    server: 'server.id',
    outputs: 1,
    entityId: 'entity.id',
    property: 'state',
    comparator: 'is',
    value: 'on',
    valueType: 'str',
    timeout: 10,
    timeoutUnits: 'seconds',
    entityLocation: 'data',
    entityLocationType: 'msg',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
    entityIdFilterType: 'exact',
    timeoutType: 'num',
    checkCurrentState: false,
    blockInputOverrides: true,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
};

describe('Migrations - Wait Until Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);
            expect(migratedSchema).to.eql(VERSION_0);
        });
    });
    describe('Version 1', function () {
        it('should add version 1 to version 0', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(VERSION_0);
            expect(migratedSchema).to.eql(VERSION_1);
        });
        it('should convert comma delimited entity list to array and change type to list', function () {
            const schema = {
                ...VERSION_0,
                entityId: 'entity.id,entity2.id, entity3.id',
                entityIdFilterType: 'substring',
            };
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(schema);
            expect(migratedSchema.entityId).to.eql([
                'entity.id',
                'entity2.id',
                'entity3.id',
            ]);
            expect(migratedSchema.entityIdFilterType).to.eql('list');
        });
        it('should only contain one entity if there is a trailing comma', function () {
            const schema = {
                ...VERSION_0,
                entityId: 'entity.id,',
                entityIdFilterType: 'substring',
            };
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(schema);
            expect(migratedSchema.entityId).to.have.lengthOf(1);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_1);
    });
});
