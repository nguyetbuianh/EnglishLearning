import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTopicTable1767076563283 implements MigrationInterface {
    name = 'UpdateTopicTable1767076563283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" ADD "user_id" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "user_id"`);
    }

}
